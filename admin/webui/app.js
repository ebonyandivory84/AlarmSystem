(() => {
  const qs = new URLSearchParams(window.location.search);
  const instanceId = qs.get('instance') || 'alarmsystem.0';
  const objectId = `system.adapter.${instanceId}`;

  const statusBox = document.getElementById('statusBox');
  const instanceLabel = document.getElementById('instanceLabel');
  const profileSelect = document.getElementById('profileSelect');
  const sensorList = document.getElementById('sensorList');
  const globalFields = document.getElementById('globalFields');
  const dpFields = document.getElementById('dpFields');

  const state = {
    socket: null,
    instanceObj: null,
    config: null,
    profiles: {},
    activeProfile: 'default.json',
  };

  const globalSpec = [
    ['defaultEntryDelaySec', 'number'],
    ['defaultExitDelaySec', 'number'],
    ['eventDedupeMs', 'number'],
    ['heartbeatTimeoutSec', 'number'],
    ['snapshotSendDelayMs', 'number'],
    ['snapshotBurstCount', 'number'],
    ['snapshotBurstIntervalMs', 'number'],
    ['autoArmDelaySec', 'number'],
    ['bedtimeHour', 'number'],
    ['bedtimeLightThreshold', 'number'],
    ['simulationMode', 'boolean'],
    ['cameraNightModeEnabled', 'boolean'],
    ['cameraNightModeArmsCameras', 'boolean'],
  ];

  const dpSpec = [
    'armStateId', 'perimeterStateId', 'triggerStateId', 'sirenStateId', 'displayId',
    'clearDisplayId', 'buzzerId', 'ledRedId', 'ledYellowId', 'standbyId', 'motionSensorId',
    'panicStateId', 'fingerprintStateId', 'pinStateId', 'statusId'
  ];

  function setStatus(msg, err = false) {
    statusBox.textContent = msg;
    statusBox.classList.toggle('err', err);
    statusBox.classList.toggle('ok', !err);
  }

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function connectSocket() {
    const socket = window.socket || window.parent?.socket || window.opener?.socket || window.io?.connect?.();
    if (!socket) throw new Error('Kein Admin-Socket gefunden. Bitte im ioBroker-Admin öffnen.');
    state.socket = socket;
  }

  function getObject(id) {
    return new Promise((resolve, reject) => {
      if (typeof state.socket.getObject === 'function') {
        state.socket.getObject(id, obj => obj ? resolve(obj) : reject(new Error(`Objekt ${id} nicht gefunden`)));
        return;
      }
      state.socket.emit('getObject', id, obj => obj ? resolve(obj) : reject(new Error(`Objekt ${id} nicht gefunden`)));
    });
  }

  function setObject(id, obj) {
    return new Promise((resolve, reject) => {
      const cb = res => {
        if (res && res.error) reject(new Error(res.error));
        else resolve();
      };
      if (typeof state.socket.setObject === 'function') {
        state.socket.setObject(id, obj, cb);
      } else {
        state.socket.emit('setObject', id, obj, cb);
      }
    });
  }

  function sanitizeProfileName(v) {
    const base = String(v || '').trim().replace(/[^a-zA-Z0-9_.-]/g, '_');
    if (!base) return '';
    return base.endsWith('.json') ? base : `${base}.json`;
  }

  function ensureProfiles() {
    let profiles = {};
    try {
      profiles = JSON.parse(state.instanceObj.native.configProfilesJson || '{}');
    } catch {
      profiles = {};
    }
    if (!profiles || typeof profiles !== 'object') profiles = {};
    if (!profiles['default.json']) profiles['default.json'] = clone(state.instanceObj.native);

    state.profiles = profiles;
    const configuredActive = String(state.instanceObj.native.activeConfigProfile || 'default.json');
    state.activeProfile = profiles[configuredActive] ? configuredActive : 'default.json';
  }

  function rebuildProfileSelect() {
    const names = Object.keys(state.profiles).sort();
    profileSelect.innerHTML = names.map(name => `<option value="${name}">${name}</option>`).join('');
    profileSelect.value = state.activeProfile;
  }

  function renderFields() {
    globalFields.innerHTML = '';
    dpFields.innerHTML = '';

    for (const [key, type] of globalSpec) {
      const wrapper = document.createElement('label');
      wrapper.textContent = key;
      const input = document.createElement(type === 'boolean' ? 'select' : 'input');
      input.dataset.key = key;
      if (type === 'number') {
        input.type = 'number';
        input.value = String(Number(state.config[key] ?? 0));
      } else if (type === 'boolean') {
        input.innerHTML = '<option value="true">true</option><option value="false">false</option>';
        input.value = state.config[key] === true ? 'true' : 'false';
      }
      wrapper.appendChild(input);
      globalFields.appendChild(wrapper);
    }

    for (const key of dpSpec) {
      const wrapper = document.createElement('label');
      wrapper.textContent = key;
      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.key = key;
      input.value = String(state.config[key] || '');
      wrapper.appendChild(input);
      dpFields.appendChild(wrapper);
    }
  }

  function getEntities() {
    const rows = [];
    const add = (arr, kind) => {
      (Array.isArray(arr) ? arr : []).forEach((r, idx) => {
        if (!r || !r.id) return;
        rows.push({
          kind,
          idx,
          key: String(r.key || r.id),
          label: String(r.label || r.key || r.id),
          zone: String(r.zone || 'perimeter'),
        });
      });
    };
    add(state.config.pirSensorsTable, 'pirSensorsTable');
    add(state.config.contactSensorsTable, 'contactSensorsTable');
    add(state.config.presenceSensorsTable, 'presenceSensorsTable');
    add(state.config.personDetectionTable, 'personDetectionTable');
    return rows;
  }

  function zoneCenter(zone) {
    if (zone === 'innenraum') return { x: 50, y: 50, r: 17 };
    if (zone === 'aussenhaut') return { x: 50, y: 50, r: 30 };
    return { x: 50, y: 50, r: 44 };
  }

  function renderCanvas() {
    document.querySelectorAll('.chip').forEach(el => el.remove());
    sensorList.innerHTML = '';

    const entities = getEntities();
    entities.forEach((e, i) => {
      const listItem = document.createElement('div');
      listItem.className = 'sensor-item';
      listItem.innerHTML = `<span>${e.label}</span><span class="muted">${e.zone}</span>`;
      sensorList.appendChild(listItem);

      const targetZone = document.querySelector(`.zone.${e.zone}`) || document.querySelector('.zone.perimeter');
      const c = zoneCenter(e.zone);
      const angle = (i * 31) % 360;
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.draggable = true;
      chip.dataset.kind = e.kind;
      chip.dataset.idx = String(e.idx);
      chip.textContent = e.label;
      chip.style.left = `${c.x + Math.cos((angle * Math.PI) / 180) * c.r}%`;
      chip.style.top = `${c.y + Math.sin((angle * Math.PI) / 180) * c.r}%`;
      chip.addEventListener('dragstart', ev => {
        ev.dataTransfer.setData('text/plain', JSON.stringify({ kind: e.kind, idx: e.idx }));
      });
      targetZone.appendChild(chip);
    });
  }

  function applyZoneToEntity(kind, idx, zone) {
    if (!Array.isArray(state.config[kind])) return;
    if (!state.config[kind][idx]) return;
    state.config[kind][idx].zone = zone;
  }

  function bindZoneDrop() {
    document.querySelectorAll('.zone').forEach(zoneEl => {
      zoneEl.addEventListener('dragover', ev => ev.preventDefault());
      zoneEl.addEventListener('drop', ev => {
        ev.preventDefault();
        try {
          const payload = JSON.parse(ev.dataTransfer.getData('text/plain'));
          const zone = zoneEl.dataset.zone;
          applyZoneToEntity(payload.kind, payload.idx, zone);
          renderCanvas();
        } catch {
          setStatus('Ungültiger Drag&Drop-Inhalt', true);
        }
      });
    });
  }

  function readFormIntoConfig() {
    globalFields.querySelectorAll('[data-key]').forEach(el => {
      const key = el.dataset.key;
      const spec = globalSpec.find(x => x[0] === key);
      if (!spec) return;
      if (spec[1] === 'number') state.config[key] = Number(el.value || 0);
      if (spec[1] === 'boolean') state.config[key] = el.value === 'true';
    });
    dpFields.querySelectorAll('[data-key]').forEach(el => {
      state.config[el.dataset.key] = el.value || '';
    });
  }

  async function saveToInstance() {
    readFormIntoConfig();
    if (!state.profiles['default.json']) state.profiles['default.json'] = clone(state.instanceObj.native);

    const obj = clone(state.instanceObj);
    obj.native = { ...obj.native, ...state.config };
    obj.native.activeConfigProfile = state.activeProfile;
    obj.native.configProfilesJson = JSON.stringify(state.profiles);

    await setObject(objectId, obj);
    state.instanceObj = obj;
    setStatus(`Gespeichert: ${objectId}`);
  }

  function loadProfile() {
    const name = profileSelect.value;
    const profile = state.profiles[name];
    if (!profile) {
      setStatus(`Profil nicht gefunden: ${name}`, true);
      return;
    }
    state.activeProfile = name;
    state.config = clone(profile);
    renderAll();
    setStatus(`Profil geladen: ${name}`);
  }

  function saveAsProfile() {
    readFormIntoConfig();
    const raw = document.getElementById('newProfileName').value;
    const name = sanitizeProfileName(raw);
    if (!name) {
      setStatus('Bitte gültigen Profilnamen eingeben', true);
      return;
    }
    state.profiles[name] = clone(state.config);
    state.activeProfile = name;
    rebuildProfileSelect();
    setStatus(`Profil gespeichert: ${name}`);
  }

  function deleteProfile() {
    const name = profileSelect.value;
    if (name === 'default.json') {
      setStatus('default.json kann nicht gelöscht werden', true);
      return;
    }
    delete state.profiles[name];
    state.activeProfile = 'default.json';
    state.config = clone(state.profiles['default.json']);
    renderAll();
    setStatus(`Profil gelöscht: ${name}`);
  }

  async function reloadFromInstance() {
    state.instanceObj = await getObject(objectId);
    ensureProfiles();
    state.config = clone(state.instanceObj.native);
    instanceLabel.textContent = `Instanz: ${instanceId}`;
    renderAll();
    setStatus('Aktuelle Instanzdaten geladen');
  }

  function renderAll() {
    rebuildProfileSelect();
    renderFields();
    renderCanvas();
  }

  async function init() {
    connectSocket();
    bindZoneDrop();
    await reloadFromInstance();

    document.getElementById('reloadBtn').addEventListener('click', () => reloadFromInstance().catch(e => setStatus(String(e), true)));
    document.getElementById('saveBtn').addEventListener('click', () => saveToInstance().catch(e => setStatus(String(e), true)));
    document.getElementById('loadProfileBtn').addEventListener('click', loadProfile);
    document.getElementById('saveProfileBtn').addEventListener('click', saveAsProfile);
    document.getElementById('deleteProfileBtn').addEventListener('click', deleteProfile);
  }

  init().catch(err => setStatus(String(err), true));
})();
