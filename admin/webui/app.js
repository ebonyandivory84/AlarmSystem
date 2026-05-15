(() => {
  const qs = new URLSearchParams(window.location.search);
  const rawInstance = qs.get('instance') || 'alarmsystem.0';

  const $ = id => document.getElementById(id);
  const ui = {
    status: $('statusBox'),
    instance: $('instanceLabel'),
    profile: $('profileSelect'),
    pool: $('poolList'),
    global: $('globalFields'),
    dp: $('dpFields'),
    mini: $('miniCanvas'),
    full: $('fullCanvas'),
    canvasModal: $('canvasModal'),
    objectModal: $('objectBrowserModal'),
    objectSearch: $('objectSearch'),
    objectResults: $('objectResults'),
    stateIds: $('stateIds'),
    addResult: $('addResult'),
    hover: $('miniHoverInfo'),
    logDate: $('triggerLogDate'),
    logView: $('triggerLogView'),
    entityModal: $('entitySettingsModal'),
    entityLabel: $('selectedEntityLabel'),
    liveMode: $('liveMode'),
    livePerimeter: $('livePerimeter'),
    liveAussenhaut: $('liveAussenhaut'),
    liveInnenraum: $('liveInnenraum'),
    liveCameras: $('liveCameras')
  };

  const state = {
    socket: null,
    instanceId: 'alarmsystem.0',
    objectId: 'system.adapter.alarmsystem.0',
    instanceObj: null,
    config: null,
    profiles: {},
    activeProfile: 'default.json',
    stateIds: [],
    selectedEntity: null,
    objectTarget: null
  };

  const globalSpec = [['defaultEntryDelaySec','number'],['defaultExitDelaySec','number'],['eventDedupeMs','number'],['heartbeatTimeoutSec','number'],['snapshotSendDelayMs','number'],['snapshotBurstCount','number'],['snapshotBurstIntervalMs','number'],['autoArmDelaySec','number'],['bedtimeHour','number'],['bedtimeLightThreshold','number'],['simulationMode','boolean'],['cameraNightModeEnabled','boolean'],['cameraNightModeArmsCameras','boolean']];
  const dpSpec = ['armStateId','perimeterStateId','triggerStateId','sirenStateId','displayId','clearDisplayId','buzzerId','ledRedId','ledYellowId','standbyId','motionSensorId','panicStateId','fingerprintStateId','pinStateId','statusId'];

  const setStatus = (m,e=false) => { ui.status.textContent = m; ui.status.classList.toggle('err', e); };
  const clone = v => JSON.parse(JSON.stringify(v));
  const asArmed = v => v === true || v === 1 || ['true','1','on','armed','aktiv'].includes(String(v ?? '').toLowerCase());

  const normalizeInstanceId = v => {
    let out = String(v || '').trim();
    if (out.startsWith('system.adapter.')) out = out.slice('system.adapter.'.length);
    if (!out.includes('.')) out += '.0';
    return out;
  };

  const objectIdCandidates = raw => [...new Set([`system.adapter.${normalizeInstanceId(raw)}`, `system.adapter.${raw}`])];

  function connectSocket() {
    const s = window.socket || window.io?.connect?.(window.location.origin, { path: '/socket.io' });
    if (!s) throw new Error('Kein Admin-Socket gefunden');
    state.socket = s;
  }

  function getObject(id) {
    return new Promise((res, rej) => {
      const cb = (a,b) => {
        const o = b || a;
        if (o && typeof o === 'object' && !o.error) res(o);
        else rej(new Error(`Objekt ${id} nicht gefunden`));
      };
      if (typeof state.socket.getObject === 'function') state.socket.getObject(id, cb);
      else state.socket.emit('getObject', id, cb);
    });
  }

  function setObject(id, obj) {
    return new Promise((res, rej) => {
      const cb = r => r && r.error ? rej(new Error(r.error)) : res();
      if (typeof state.socket.setObject === 'function') state.socket.setObject(id, obj, cb);
      else state.socket.emit('setObject', id, obj, cb);
    });
  }

  function setState(id, val) {
    return new Promise((res, rej) => {
      if (!id) return rej(new Error('missing state id'));
      const cb = r => r && r.error ? rej(new Error(r.error)) : res();
      try {
        if (typeof state.socket.setState === 'function') {
          state.socket.setState(id, val, false, cb);
          return;
        }
      } catch {}
      try {
        state.socket.emit('setState', id, { val, ack: false }, cb);
      } catch (e) {
        rej(e);
      }
    });
  }

  function getState(id) {
    return new Promise(res => {
      if (!id) return res(null);
      const cb = (a,b) => res(b || a || null);
      try {
        if (typeof state.socket.getState === 'function') state.socket.getState(id, cb);
        else state.socket.emit('getState', id, cb);
      } catch {
        res(null);
      }
    });
  }

  async function loadStateIds() {
    return new Promise(resolve => {
      const done = ids => {
        state.stateIds = Array.isArray(ids) ? ids : [];
        ui.stateIds.innerHTML = state.stateIds.slice(0, 5000).map(id => `<option value="${id}"></option>`).join('');
        resolve();
      };
      const parse = raw => {
        const data = (raw && raw.rows) ? raw : (Array.isArray(raw) ? { rows: raw } : null);
        const ids = Object.keys((data && data.rows) ? data.rows.reduce((a,r)=>{ if(r && r.id) a[r.id]=1; return a; }, {}) : {});
        done(ids.sort());
      };
      if (typeof state.socket.getObjectView === 'function') state.socket.getObjectView('system', 'state', { startkey:'', endkey:'\u9999' }, (a,b) => parse(b || a));
      else state.socket.emit('getObjectView', 'system', 'state', { startkey:'', endkey:'\u9999' }, (a,b) => parse(b || a));
    });
  }

  function ensureProfiles() {
    let p = {};
    try { p = JSON.parse(state.instanceObj.native.configProfilesJson || '{}'); } catch {}
    if (!p || typeof p !== 'object') p = {};
    if (!p['default.json']) p['default.json'] = clone(state.instanceObj.native);
    state.profiles = p;
    const ac = String(state.instanceObj.native.activeConfigProfile || 'default.json');
    state.activeProfile = p[ac] ? ac : 'default.json';
  }

  function rebuildProfileSelect() {
    const names = Object.keys(state.profiles).sort();
    ui.profile.innerHTML = names.map(n => `<option value="${n}">${n}</option>`).join('');
    ui.profile.value = state.activeProfile;
  }

  function ensureTables() {
    ['pirSensorsTable','contactSensorsTable','presenceSensorsTable','personDetectionTable','camerasTable'].forEach(k => {
      if (!Array.isArray(state.config[k])) state.config[k] = [];
    });
  }

  function getEntities() {
    ensureTables();
    const rows = [];
    const add = (arr, kind, getId) => (arr || []).forEach((r, idx) => {
      const id = getId(r);
      if (!r || !id) return;
      rows.push({
        kind,
        idx,
        entityKey: String(r.key || id),
        label: String(r.label || r.key || id),
        zone: String(r.zone || 'pool'),
        posX: Number.isFinite(Number(r.posX)) ? Number(r.posX) : null,
        posY: Number.isFinite(Number(r.posY)) ? Number(r.posY) : null,
        hasPos: Number.isFinite(Number(r.posX)) && Number.isFinite(Number(r.posY))
      });
    });
    add(state.config.pirSensorsTable, 'pirSensorsTable', r => r?.id);
    add(state.config.contactSensorsTable, 'contactSensorsTable', r => r?.id);
    add(state.config.presenceSensorsTable, 'presenceSensorsTable', r => r?.id);
    add(state.config.personDetectionTable, 'personDetectionTable', r => r?.id);
    add(state.config.camerasTable, 'camerasTable', r => r?.personDetectionDp || r?.snapshotUrl || r?.ip);
    return rows;
  }

  function setEntity(kind, idx, patch) {
    if (!Array.isArray(state.config[kind]) || !state.config[kind][idx]) return;
    const row = state.config[kind][idx];
    const oldZone = String(row.zone || 'pool');
    const newZone = typeof patch.zone === 'string' ? patch.zone : oldZone;
    Object.assign(row, patch);
    if (typeof patch.zone === 'string') row.manualZone = true;
    const movedWithoutPos = (newZone !== oldZone) && !('posX' in patch) && !('posY' in patch) && newZone !== 'pool';
    if (movedWithoutPos) { delete row.posX; delete row.posY; }
  }

  function zoneClass(zone) {
    if (zone === 'innenraum') return 'zone-color-innenraum';
    if (zone === 'aussenhaut') return 'zone-color-aussenhaut';
    return 'zone-color-perimeter';
  }
  function entityIcon(kind) {
    if (kind === 'pirSensorsTable') return '👣';
    if (kind === 'contactSensorsTable') return '🪟';
    if (kind === 'camerasTable' || kind === 'personDetectionTable') return '📷';
    if (kind === 'presenceSensorsTable') return '👤';
    return '•';
  }
  function detectZoneByCanvasPos(xPct, yPct) {
    const dx = xPct - 50;
    const dy = yPct - 50;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d <= 21.5) return 'innenraum';
    if (d <= 35) return 'aussenhaut';
    return 'perimeter';
  }

  function ensureEntityPositions() {
    const buckets = { perimeter: [], aussenhaut: [], innenraum: [] };
    getEntities().filter(e => e.zone !== 'pool').forEach(e => { if (buckets[e.zone]) buckets[e.zone].push(e); });
    for (const z of ['perimeter','aussenhaut','innenraum']) {
      const list = buckets[z];
      const miss = list.filter(x => !x.hasPos);
      const n = miss.length;
      for (let i=0;i<n;i++) {
        const angle = (i / n) * Math.PI * 2;
        const ring = z === 'innenraum' ? 20 : z === 'aussenhaut' ? 28 : 36;
        const x = 50 + Math.cos(angle) * ring;
        const y = 50 + Math.sin(angle) * ring;
        setEntity(miss[i].kind, miss[i].idx, { posX: Math.max(4, Math.min(96, x)), posY: Math.max(4, Math.min(96, y)) });
      }
    }
  }

  function addZones(canvas) {
    canvas.innerHTML = '';
    ['perimeter','aussenhaut','innenraum'].forEach(z => {
      const d = document.createElement('div');
      d.className = `zone ${z}`;
      d.dataset.zone = z;
      d.innerHTML = `<span>${z}</span>`;
      canvas.appendChild(d);
    });
  }

  function getRulesMap(){ try { return JSON.parse(state.config.rulesJson || '{}'); } catch { return {}; } }
  function setRulesMap(m){ state.config.rulesJson = JSON.stringify(m); }
  function ruleId(e){ return `${e.kind}:${e.entityKey}`; }
  function defaultRule(){ return { enabled:true, onlyArmed:true, onlyNight:false, sirene:false, snapshot:true, telegram:true }; }
  function readRuleForm(){ return { enabled: $('ruleEnabled').value==='true', onlyArmed: $('ruleOnlyArmed').value==='true', onlyNight: $('ruleOnlyNight').value==='true', sirene: $('ruleSirene').value==='true', snapshot: $('ruleSnapshot').value==='true', telegram: $('ruleTelegram').value==='true' }; }
  function writeRuleForm(rule){ const r={...defaultRule(), ...(rule||{})}; $('ruleEnabled').value=String(r.enabled); $('ruleOnlyArmed').value=String(r.onlyArmed); $('ruleOnlyNight').value=String(r.onlyNight); $('ruleSirene').value=String(r.sirene); $('ruleSnapshot').value=String(r.snapshot); $('ruleTelegram').value=String(r.telegram); }
  function readZoneSel(){ return $('ruleZone').value; }
  function writeZoneSel(z){ $('ruleZone').value = z || 'perimeter'; }

  function selectEntity(e) {
    state.selectedEntity = e;
    ui.entityLabel.textContent = `Ausgewählt: ${e.label} (${e.zone})`;
    writeZoneSel(e.zone);
    writeRuleForm(getRulesMap()[ruleId(e)]);
    ui.entityModal.classList.remove('hidden');
  }

  function drawEntity(canvas, e, detailed) {
    const el = document.createElement('div');
    el.className = (detailed ? 'chip ' : 'mini-node ') + zoneClass(e.zone);
    el.title = e.label;
    el.draggable = true;
    if (detailed) el.textContent = e.label;
    else el.textContent = entityIcon(e.kind);
    el.style.left = `${Math.max(2, Math.min(98, Number(e.posX || 50)))}%`;
    el.style.top = `${Math.max(2, Math.min(98, Number(e.posY || 50)))}%`;
    el.addEventListener('dragstart', ev => ev.dataTransfer.setData('text/plain', JSON.stringify({ kind:e.kind, idx:e.idx })));
    el.addEventListener('click', ev => { ev.stopPropagation(); selectEntity(e); });
    if (!detailed && ui.hover) {
      el.addEventListener('mouseenter', () => { ui.hover.textContent = `Hover: ${e.label} (${e.zone})`; });
      el.addEventListener('mouseleave', () => { ui.hover.textContent = 'Hover: -'; });
    }
    const z = canvas.querySelector(`.zone.${e.zone}`);
    if (z) z.appendChild(el);
  }

  function renderCanvas(target, detailed) {
    addZones(target);
    getEntities().filter(e => e.zone !== 'pool').forEach(e => drawEntity(target, e, detailed));
  }

  function renderPool() {
    ui.pool.innerHTML = '';
    getEntities().filter(e => e.zone === 'pool').forEach(e => {
      const item = document.createElement('div');
      item.className = 'sensor-item';
      item.innerHTML = `<span>${e.label}</span><span class="muted">pool</span>`;
      item.draggable = true;
      item.addEventListener('dragstart', ev => ev.dataTransfer.setData('text/plain', JSON.stringify({ kind:e.kind, idx:e.idx })));
      item.addEventListener('click', () => selectEntity(e));
      ui.pool.appendChild(item);
    });
  }

  function bindCanvasDrops(canvas) {
    if (canvas.dataset.boundDnD === '1') return;
    canvas.dataset.boundDnD = '1';
    canvas.addEventListener('dragover', e => e.preventDefault());
    canvas.addEventListener('drop', e => {
      e.preventDefault();
      try {
        const p = JSON.parse(e.dataTransfer.getData('text/plain'));
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const zone = detectZoneByCanvasPos(x, y);
        setEntity(p.kind, p.idx, { zone, posX: Math.max(2, Math.min(98, x)), posY: Math.max(2, Math.min(98, y)) });
        renderAllCanvases();
      } catch {
        setStatus('Ungültiger Drag&Drop-Inhalt', true);
      }
    });
  }

  function bindPoolDrop() {
    const poolZone = $('poolZone');
    poolZone.addEventListener('dragover', e => e.preventDefault());
    poolZone.addEventListener('drop', e => {
      e.preventDefault();
      try {
        const p = JSON.parse(e.dataTransfer.getData('text/plain'));
        setEntity(p.kind, p.idx, { zone: 'pool' });
        renderAllCanvases();
      } catch {
        setStatus('Ungültiger Drag&Drop-Inhalt', true);
      }
    });
  }

  function renderAllCanvases() {
    ensureEntityPositions();
    renderCanvas(ui.mini, false);
    renderCanvas(ui.full, true);
    renderPool();
    bindCanvasDrops(ui.mini);
    bindCanvasDrops(ui.full);
  }

  function renderFields() {
    ui.global.innerHTML = '';
    ui.dp.innerHTML = '';

    for (const [k,t] of globalSpec) {
      const w = document.createElement('label');
      w.textContent = k;
      const i = document.createElement(t === 'boolean' ? 'select' : 'input');
      i.dataset.key = k;
      if (t === 'number') { i.type = 'number'; i.value = String(Number(state.config[k] ?? 0)); }
      else { i.innerHTML = '<option value="true">true</option><option value="false">false</option>'; i.value = state.config[k] === true ? 'true' : 'false'; }
      w.appendChild(i);
      ui.global.appendChild(w);
    }

    for (const k of dpSpec) {
      const w = document.createElement('label');
      w.textContent = k;
      const wrap = document.createElement('span');
      wrap.className = 'input-wrap';
      const i = document.createElement('input');
      i.type = 'text';
      i.className = 'state-input';
      i.setAttribute('list', 'stateIds');
      i.dataset.key = k;
      i.value = String(state.config[k] || '');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'icon-btn';
      b.textContent = '🔎';
      b.addEventListener('click', () => openObjectBrowser(i));
      wrap.appendChild(i);
      wrap.appendChild(b);
      w.appendChild(wrap);
      ui.dp.appendChild(w);
    }
  }

  function readFormIntoConfig() {
    ui.global.querySelectorAll('[data-key]').forEach(el => {
      const k = el.dataset.key;
      const spec = globalSpec.find(x => x[0] === k);
      if (!spec) return;
      state.config[k] = spec[1] === 'number' ? Number(el.value || 0) : (el.value === 'true');
    });
    ui.dp.querySelectorAll('[data-key]').forEach(el => { state.config[el.dataset.key] = el.value || ''; });
  }

  function addNewEntity() {
    ensureTables();
    const kind = $('newType').value;
    const key = ($('newKey').value || '').trim();
    const label = ($('newLabel').value || '').trim();
    const id = ($('newId').value || '').trim();
    const active = ($('newActive').value || '').trim();
    const mode = $('newMode').value;
    const detect = ($('newDetect').value || '').trim();
    if (!id) { setStatus('Datapoint ID ist Pflicht', true); ui.addResult.textContent = 'Datapoint ID fehlt'; return; }
    const base = { key: key || id, label: label || key || id, id, zone: 'pool' };
    if (kind === 'personDetectionTable') state.config[kind].push({ ...base, mode, detectValue: mode === 'string' ? (detect || 'human detected') : '' });
    else state.config[kind].push({ ...base, activeValuesCsv: active || 'true' });
    renderAllCanvases();
    ui.addResult.textContent = `Hinzugefügt: ${base.label}`;
  }

  function openObjectBrowser(targetInput) {
    state.objectTarget = targetInput;
    ui.objectModal.classList.remove('hidden');
    ui.objectSearch.value = targetInput.value || '';
    renderObjectResults();
    ui.objectSearch.focus();
  }

  function closeObjectBrowser() {
    ui.objectModal.classList.add('hidden');
    state.objectTarget = null;
  }

  function renderObjectResults() {
    const q = String(ui.objectSearch.value || '').toLowerCase().trim();
    if (q.length < 2) { ui.objectResults.innerHTML = '<div class="muted">Bitte mindestens 2 Zeichen eingeben.</div>'; return; }
    const list = state.stateIds.filter(id => id.toLowerCase().includes(q)).slice(0, 300);
    ui.objectResults.innerHTML = list.map(id => `<div class="object-item" data-id="${id}">${id}</div>`).join('') || '<div class="muted">Keine Treffer</div>';
  }

  async function manualControl(which) {
    const pulse = async id => {
      if (!id) return;
      await setState(id, true);
      setTimeout(() => { void setState(id, false); }, 400);
    };
    if (which === 'armAlarm') await setState(state.config.armStateId, true);
    if (which === 'disarmAlarm') await setState(state.config.armStateId, false);
    if (which === 'armPerimeter') await setState(state.config.perimeterStateId, true);
    if (which === 'disarmPerimeter') await setState(state.config.perimeterStateId, false);
    if (which === 'armCameras') { const ids = JSON.parse(state.config.cameraAlarmOnIdsJson || '[]'); for (const id of ids) await pulse(id); await pulse(state.config.cctvArmedId); }
    if (which === 'disarmCameras') { const ids = JSON.parse(state.config.cameraAlarmOffIdsJson || '[]'); for (const id of ids) await pulse(id); await pulse(state.config.cctvDisarmedId); }
    setStatus('Manuelle Aktion ausgeführt');
  }

  async function loadTriggerLogForDate(day) {
    if (!day) return;
    const base = `${state.instanceId}.diagnostics`;
    await setState(`${base}.triggerLogDate`, day);
    await new Promise(r => setTimeout(r, 200));
    const st = await getState(`${base}.triggerLogText`);
    ui.logView.textContent = st?.val ? String(st.val) : `Keine Trigger-Logs für ${day}`;
  }

  function paintChip(el, armed) {
    if (!el) return;
    el.classList.remove('armed','disarmed');
    el.classList.add(armed ? 'armed' : 'disarmed');
  }

  async function refreshLiveStatus() {
    const p = state.instanceId;
    const mode = await getState(`${p}.runtime.mode`);
    const perDp = await getState(state.config.perimeterStateId || '');
    const allDp = await getState(state.config.armStateId || '');
    const zPer = await getState(`${p}.zones.perimeter.armed`);
    const zAus = await getState(`${p}.zones.aussenhaut.armed`);
    const zInn = await getState(`${p}.zones.innenraum.armed`);
    const cam = await getState(state.config.cctvArmedId || '');

    const perimeterArmed = asArmed(perDp?.val) || asArmed(zPer?.val) || asArmed(zAus?.val);
    const allArmed = asArmed(allDp?.val) || String(mode?.val || '').toLowerCase() === 'armed' || asArmed(zInn?.val);
    const innenArmed = asArmed(allDp?.val) || asArmed(zInn?.val);
    const aussenArmed = asArmed(perDp?.val) || asArmed(zAus?.val);
    const camerasArmed = asArmed(cam?.val);

    ui.liveMode.textContent = `Mode: ${mode?.val ?? '-'}`;
    ui.livePerimeter.textContent = `Perimeter: ${perimeterArmed ? 'scharf' : 'unscharf'}`;
    ui.liveAussenhaut.textContent = `Aussenhaut: ${aussenArmed ? 'scharf' : 'unscharf'}`;
    ui.liveInnenraum.textContent = `Innenraum: ${innenArmed ? 'scharf' : 'unscharf'}`;
    ui.liveCameras.textContent = `Kameras: ${camerasArmed ? 'scharf' : 'unscharf'}`;

    paintChip(ui.liveMode, allArmed);
    paintChip(ui.livePerimeter, perimeterArmed);
    paintChip(ui.liveAussenhaut, aussenArmed);
    paintChip(ui.liveInnenraum, innenArmed);
    paintChip(ui.liveCameras, camerasArmed);
  }

  async function saveToInstance() {
    readFormIntoConfig();
    if (!state.profiles['default.json']) state.profiles['default.json'] = clone(state.instanceObj.native);
    const obj = clone(state.instanceObj);
    obj.native = { ...obj.native, ...state.config };
    obj.native.activeConfigProfile = state.activeProfile;
    obj.native.configProfilesJson = JSON.stringify(state.profiles);
    await setObject(state.objectId, obj);
    state.instanceObj = obj;
    setStatus(`Gespeichert: ${state.objectId}`);
  }

  function loadProfile() {
    const n = ui.profile.value;
    const p = state.profiles[n];
    if (!p) { setStatus(`Profil nicht gefunden: ${n}`, true); return; }
    state.activeProfile = n;
    state.config = clone(p);
    renderAll();
    setStatus(`Profil geladen: ${n}`);
  }

  function saveAsProfile() {
    readFormIntoConfig();
    const raw = $('newProfileName').value;
    const b = String(raw || '').trim().replace(/[^a-zA-Z0-9_.-]/g, '_');
    const n = b ? (b.endsWith('.json') ? b : `${b}.json`) : '';
    if (!n) { setStatus('Bitte gültigen Profilnamen eingeben', true); return; }
    state.profiles[n] = clone(state.config);
    state.activeProfile = n;
    rebuildProfileSelect();
    setStatus(`Profil gespeichert: ${n}`);
  }

  function deleteProfile() {
    const n = ui.profile.value;
    if (n === 'default.json') { setStatus('default.json kann nicht gelöscht werden', true); return; }
    delete state.profiles[n];
    state.activeProfile = 'default.json';
    state.config = clone(state.profiles['default.json']);
    renderAll();
    setStatus(`Profil gelöscht: ${n}`);
  }

  function renderAll() {
    rebuildProfileSelect();
    renderFields();
    renderAllCanvases();
  }

  async function reloadFromInstance() {
    let resolved = null;
    for (const c of objectIdCandidates(rawInstance)) {
      try {
        resolved = await getObject(c);
        state.objectId = c;
        state.instanceId = c.replace(/^system\.adapter\./, '');
        break;
      } catch {}
    }
    if (!resolved) throw new Error('Instanzobjekt nicht gefunden');
    state.instanceObj = resolved;
    ensureProfiles();
    state.config = clone(state.instanceObj.native);
    ensureTables();
    ui.instance.textContent = `Instanz: ${state.instanceId}`;
    await loadStateIds();
    renderAll();
    const today = new Date().toISOString().slice(0,10);
    ui.logDate.value = today;
    await loadTriggerLogForDate(today);
    setStatus('Aktuelle Instanzdaten geladen');
  }

  function bindModal() {
    $('openCanvasBtn').addEventListener('click', () => {
      ui.canvasModal.classList.remove('hidden');
      renderCanvas(ui.full, true);
      bindCanvasDrops(ui.full);
    });
    $('closeCanvasBtn').addEventListener('click', () => ui.canvasModal.classList.add('hidden'));
  }

  async function init() {
    connectSocket();
    bindPoolDrop();
    bindModal();
    await reloadFromInstance();
    writeRuleForm(defaultRule());

    $('reloadBtn').addEventListener('click', () => reloadFromInstance().catch(e => setStatus(String(e), true)));
    $('saveBtn').addEventListener('click', () => saveToInstance().catch(e => setStatus(String(e), true)));
    $('loadProfileBtn').addEventListener('click', loadProfile);
    $('saveProfileBtn').addEventListener('click', saveAsProfile);
    $('deleteProfileBtn').addEventListener('click', deleteProfile);
    $('addSensorBtn').addEventListener('click', addNewEntity);

    $('browseNewIdBtn').addEventListener('click', () => openObjectBrowser($('newId')));
    $('closeBrowserBtn').addEventListener('click', closeObjectBrowser);
    ui.objectSearch.addEventListener('input', renderObjectResults);
    ui.objectResults.addEventListener('click', ev => {
      const item = ev.target.closest('.object-item');
      if (!item || !state.objectTarget) return;
      state.objectTarget.value = item.dataset.id || '';
      closeObjectBrowser();
    });

    $('closeEntitySettingsBtn').addEventListener('click', () => ui.entityModal.classList.add('hidden'));
    $('saveEntityRuleBtn').addEventListener('click', () => {
      if (!state.selectedEntity) return setStatus('Bitte erst ein Element anklicken', true);
      const z = readZoneSel();
      setEntity(state.selectedEntity.kind, state.selectedEntity.idx, { zone: z });
      const m = getRulesMap();
      m[ruleId(state.selectedEntity)] = readRuleForm();
      setRulesMap(m);
      renderAllCanvases();
      setStatus('Elementeinstellungen gespeichert');
    });
    $('applyZoneRuleBtn').addEventListener('click', () => {
      if (!state.selectedEntity) return setStatus('Bitte erst ein Element anklicken', true);
      const fromZone = state.selectedEntity.zone;
      const toZone = readZoneSel();
      const rule = readRuleForm();
      const m = getRulesMap();
      getEntities().filter(x => x.zone === fromZone).forEach(x => {
        setEntity(x.kind, x.idx, { zone: toZone });
        m[ruleId(x)] = { ...rule };
      });
      setRulesMap(m);
      renderAllCanvases();
      setStatus(`Auf Zone angewendet: ${toZone}`);
    });

    $('loadTriggerLogBtn').addEventListener('click', () => loadTriggerLogForDate(ui.logDate.value));

    $('armAlarmBtn').addEventListener('click', () => manualControl('armAlarm').catch(e => setStatus(String(e), true)));
    $('disarmAlarmBtn').addEventListener('click', () => manualControl('disarmAlarm').catch(e => setStatus(String(e), true)));
    $('armPerimeterBtn').addEventListener('click', () => manualControl('armPerimeter').catch(e => setStatus(String(e), true)));
    $('disarmPerimeterBtn').addEventListener('click', () => manualControl('disarmPerimeter').catch(e => setStatus(String(e), true)));
    $('armCamerasBtn').addEventListener('click', () => manualControl('armCameras').catch(e => setStatus(String(e), true)));
    $('disarmCamerasBtn').addEventListener('click', () => manualControl('disarmCameras').catch(e => setStatus(String(e), true)));

    await refreshLiveStatus();
    setInterval(() => { void refreshLiveStatus(); }, 2000);
  }

  init().catch(err => setStatus(String(err), true));
})();
