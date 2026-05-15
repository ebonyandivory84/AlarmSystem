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
    liveCameras: $('liveCameras'),
    overviewPage: $('overviewPage'),
    settingsPage: $('settingsPage'),
    pageOverviewBtn: $('pageOverviewBtn'),
    pageSettingsBtn: $('pageSettingsBtn'),
    floorEgBtn: $('floorEgBtn'),
    floorOgBtn: $('floorOgBtn'),
    editImageBtn: $('editImageBtn'),
    editZonesBtn: $('editZonesBtn'),
    editZoneSelect: $('editZoneSelect'),
    closeZoneBtn: $('closeZoneBtn'),
    clearZoneBtn: $('clearZoneBtn'),
    copyZonesFloorBtn: $('copyZonesFloorBtn'),
    resetImageRectBtn: $('resetImageRectBtn'),
    panicBtn: $('panicToggleBtn'),
    shield: $('statusShield'),
    zoneActionsList: $('zoneActionsList'),
    zoneActionResult: $('zoneActionResult'),
    canvasEntitySearch: $('canvasEntitySearch'),
    canvasEntitiesList: $('canvasEntitiesList'),
    floorplanEgInput: $('floorplanEgInput'),
    floorplanOgInput: $('floorplanOgInput'),
    pinModal: $('pinModal'),
    pinDots: $('pinDots'),
    pinHint: $('pinHint')
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
    objectTarget: null,
    live: { perimeterArmed: false, aussenArmed: false, innenArmed: false },
    presenceByPerson: { sebastian: false, teresa: false },
    pinInput: '',
    pinTargetAction: null,
    stateIdsLoaded: false,
    stateIdsLoading: null,
    currentFloor: 'EG',
    editImage: false,
    editZones: false,
    floorLayouts: { EG: null, OG: null },
    dragResize: null,
    dragZonePoint: null,
    suppressZoneClickOnce: false,
    canvasHistory: [],
    floorRatios: { EG: 0.907, OG: 0.906 }
  };
  const DISARM_PIN = '1492';

  const globalSpec = [['defaultEntryDelaySec','number'],['defaultExitDelaySec','number'],['eventDedupeMs','number'],['heartbeatTimeoutSec','number'],['snapshotSendDelayMs','number'],['snapshotBurstCount','number'],['snapshotBurstIntervalMs','number'],['autoArmDelaySec','number'],['bedtimeHour','number'],['bedtimeLightThreshold','number'],['simulationMode','boolean'],['cameraNightModeEnabled','boolean'],['cameraNightModeArmsCameras','boolean']];
  const globalHelp = {
    defaultEntryDelaySec: 'Eingangsverzoegerung in Sekunden: Zeit zwischen Trigger und Alarmstart beim Betreten.',
    defaultExitDelaySec: 'Ausgangsverzoegerung in Sekunden: Zeitfenster zum Verlassen nach dem Scharfschalten.',
    eventDedupeMs: 'Entprellzeit in Millisekunden: gleiche Events in diesem Zeitraum werden zusammengefasst.',
    heartbeatTimeoutSec: 'Timeout in Sekunden fuer Heartbeat/Ueberwachung: danach gilt eine Quelle als inaktiv.',
    snapshotSendDelayMs: 'Verzoegerung in Millisekunden bis Snapshot-Versand nach Trigger.',
    snapshotBurstCount: 'Anzahl der Snapshots pro Ereignis (Burst).',
    snapshotBurstIntervalMs: 'Abstand in Millisekunden zwischen Snapshots innerhalb eines Bursts.',
    autoArmDelaySec: 'Wartezeit in Sekunden bis zur automatischen Scharfschaltung (z. B. nach Abwesenheit).',
    bedtimeHour: 'Stunde (0-23) fuer Nachtlogik/Schlafenszeit-Regeln.',
    bedtimeLightThreshold: 'Helligkeitsschwelle fuer Abend/Nacht-Automation (je nach Datenquelle).',
    simulationMode: 'Testmodus: Logik laeuft simuliert, ohne reale Alarmaktionen auszufuehren (falls im Adapter so genutzt).',
    cameraNightModeEnabled: 'Aktiviert die Kamera-Nachtmodus-Logik im Adapter.',
    cameraNightModeArmsCameras: 'Wenn aktiv, werden Kameras im Nachtmodus automatisch scharf geschaltet.'
  };
  const dpSpec = ['armStateId','perimeterStateId','triggerStateId','sirenStateId','displayId','clearDisplayId','buzzerId','ledRedId','ledYellowId','standbyId','motionSensorId','panicStateId','fingerprintStateId','pinStateId','statusId'];

  const setStatus = (m,e=false) => { ui.status.textContent = m; ui.status.classList.toggle('err', e); };
  const clone = v => JSON.parse(JSON.stringify(v));
  const asArmed = v => v === true || v === 1 || ['true','1','on','armed','aktiv'].includes(String(v ?? '').toLowerCase());
  function inferPresencePerson(meta) {
    const s = `${String(meta?.label || '')} ${String(meta?.key || '')} ${String(meta?.id || '')}`.toLowerCase();
    if (s.includes('sebastian')) return 'sebastian';
    if (s.includes('teresa')) return 'teresa';
    return null;
  }
  function presenceShortLabel(person) {
    if (person === 'sebastian') return 'S';
    if (person === 'teresa') return 'T';
    return 'P';
  }
  function isPresenceHome(row, val) {
    const raw = String(val ?? '').trim().toLowerCase();
    const csv = String(row?.activeValuesCsv || '').trim().toLowerCase();
    if (csv) {
      const allowed = csv.split(',').map(x => x.trim()).filter(Boolean);
      if (allowed.length > 0) return allowed.includes(raw);
    }
    return asArmed(val);
  }
  const readStateVal = s => (s && typeof s === 'object' && Object.prototype.hasOwnProperty.call(s, 'val')) ? s.val : s;
  const defaultLayout = () => ({
    imageRect: { x: 8, y: 6, w: 84, h: 88 },
    zones: {
      innenraum: [],
      aussenhaut: [],
      perimeter: []
    }
  });

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

  async function ensureStateIdsLoaded() {
    if (state.stateIdsLoaded) return;
    if (state.stateIdsLoading) return state.stateIdsLoading;
    state.stateIdsLoading = loadStateIds()
      .then(() => { state.stateIdsLoaded = true; })
      .finally(() => { state.stateIdsLoading = null; });
    return state.stateIdsLoading;
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
    if (!Array.isArray(state.config.zoneActionsTable)) state.config.zoneActionsTable = [];
  }

  function getEntities() {
    ensureTables();
    const xKey = state.currentFloor === 'OG' ? 'posXOg' : 'posXEg';
    const yKey = state.currentFloor === 'OG' ? 'posYOg' : 'posYEg';
    const rows = [];
    const add = (arr, kind, getId) => (arr || []).forEach((r, idx) => {
      const id = getId(r);
      if (!r || !id) return;
      const px = Number.isFinite(Number(r[xKey])) ? Number(r[xKey]) : (Number.isFinite(Number(r.posX)) ? Number(r.posX) : null);
      const py = Number.isFinite(Number(r[yKey])) ? Number(r[yKey]) : (Number.isFinite(Number(r.posY)) ? Number(r.posY) : null);
      rows.push({
        kind,
        idx,
        entityKey: String(r.key || id),
        label: String(r.label || r.key || id),
        zone: String(r.zone || 'pool'),
        floor: String(r.floor || 'EG') === 'OG' ? 'OG' : 'EG',
        posX: px,
        posY: py,
        hasPos: Number.isFinite(Number(px)) && Number.isFinite(Number(py))
      });
    });
    add(state.config.pirSensorsTable, 'pirSensorsTable', r => r?.id);
    add(state.config.contactSensorsTable, 'contactSensorsTable', r => r?.id);
    const presenceByPerson = {};
    (state.config.presenceSensorsTable || []).forEach((r, idx) => {
      const id = r?.id;
      if (!r || !id) return;
      const person = inferPresencePerson(r);
      if (!person || presenceByPerson[person]) return;
      const floor = 'EG';
      const home = !!state.presenceByPerson[person];
      const isSeb = person === 'sebastian';
      const dynamicZone = home ? 'innenraum' : 'perimeter';
      const dynamicX = home ? (isSeb ? 47 : 53) : (isSeb ? 5 : 11);
      const dynamicY = home ? 52 : 52;
      rows.push({
        kind: 'presenceSensorsTable',
        idx,
        entityKey: String(r.key || id),
        label: String(r.label || r.key || id),
        shortLabel: presenceShortLabel(person),
        person,
        zone: dynamicZone,
        floor,
        posX: dynamicX,
        posY: dynamicY,
        hasPos: true
      });
      presenceByPerson[person] = true;
    });
    add(state.config.personDetectionTable, 'personDetectionTable', r => r?.id);
    add(state.config.camerasTable, 'camerasTable', r => r?.personDetectionDp || r?.snapshotUrl || r?.ip);
    return rows;
  }

  function getAllCanvasEntities() {
    ensureTables();
    const out = [];
    const add = (arr, kind, getId) => (arr || []).forEach((r, idx) => {
      const id = getId(r);
      if (!r || !id) return;
      const floor = String(r.floor || 'EG') === 'OG' ? 'OG' : 'EG';
      out.push({
        kind,
        idx,
        floor,
        zone: String(r.zone || 'pool'),
        key: String(r.key || ''),
        label: String(r.label || r.key || id),
        id: String(id),
        posXEg: Number(r.posXEg),
        posYEg: Number(r.posYEg),
        posXOg: Number(r.posXOg),
        posYOg: Number(r.posYOg)
      });
    });
    add(state.config.pirSensorsTable, 'pirSensorsTable', r => r?.id);
    add(state.config.contactSensorsTable, 'contactSensorsTable', r => r?.id);
    add(state.config.presenceSensorsTable, 'presenceSensorsTable', r => r?.id);
    add(state.config.personDetectionTable, 'personDetectionTable', r => r?.id);
    add(state.config.camerasTable, 'camerasTable', r => r?.personDetectionDp || r?.snapshotUrl || r?.ip);
    return out;
  }

  function kindLabel(kind) {
    if (kind === 'pirSensorsTable') return 'PIR';
    if (kind === 'contactSensorsTable') return 'Tür/Kontakt';
    if (kind === 'presenceSensorsTable') return 'Presence';
    if (kind === 'personDetectionTable') return 'PersonDetect';
    if (kind === 'camerasTable') return 'Kamera';
    return kind;
  }

  function setEntity(kind, idx, patch) {
    if (!Array.isArray(state.config[kind]) || !state.config[kind][idx]) return;
    const row = state.config[kind][idx];
    const floor = String((patch.floor || row.floor || state.currentFloor || 'EG'));
    const floorNorm = floor === 'OG' ? 'OG' : 'EG';
    if (Object.prototype.hasOwnProperty.call(patch, 'posX')) row[floorNorm === 'OG' ? 'posXOg' : 'posXEg'] = patch.posX;
    if (Object.prototype.hasOwnProperty.call(patch, 'posY')) row[floorNorm === 'OG' ? 'posYOg' : 'posYEg'] = patch.posY;
    const basePatch = { ...patch };
    delete basePatch.posX;
    delete basePatch.posY;
    Object.assign(row, basePatch);
    row.floor = floorNorm;
    if (typeof patch.zone === 'string') row.manualZone = true;
  }

  function zoneClass(zone) {
    if (zone === 'innenraum') return 'zone-color-innenraum';
    if (zone === 'aussenhaut') return 'zone-color-aussenhaut';
    return 'zone-color-perimeter';
  }
  function entityIcon(entity) {
    const kind = entity.kind;
    if (kind === 'pirSensorsTable') {
      return '<span class="sensor-dot dot-pir" aria-hidden="true"></span>';
    }
    if (kind === 'contactSensorsTable') {
      return '<span class="sensor-dot dot-contact" aria-hidden="true"></span>';
    }
    if (kind === 'camerasTable' || kind === 'personDetectionTable') {
      return '<span class="sensor-dot dot-cam" aria-hidden="true"></span>';
    }
    if (kind === 'presenceSensorsTable') {
      const t = String(entity.shortLabel || 'P');
      return `<span class="presence-letter">${t}</span>`;
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/></svg>';
  }
  function detectZoneByCanvasPos(xPct, yPct) {
    const l = state.floorLayouts[state.currentFloor] || defaultLayout();
    const pIn = l.zones?.innenraum || [];
    const pOut = l.zones?.aussenhaut || [];
    const pPer = l.zones?.perimeter || [];
    if (pIn.length >= 3 && pointInPolygon([xPct, yPct], pIn)) return 'innenraum';
    if (pOut.length >= 3 && pointInPolygon([xPct, yPct], pOut)) return 'aussenhaut';
    if (pPer.length >= 3 && pointInPolygon([xPct, yPct], pPer)) return 'perimeter';
    const inBuilding = xPct >= 16 && xPct <= 84 && yPct >= 10 && yPct <= 90;
    const inInnen = xPct >= 22 && xPct <= 78 && yPct >= 14 && yPct <= 86;
    if (inInnen) return 'innenraum';
    if (inBuilding) return 'aussenhaut';
    return 'perimeter';
  }

  function pointInPolygon(p, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = Number(poly[i][0]); const yi = Number(poly[i][1]);
      const xj = Number(poly[j][0]); const yj = Number(poly[j][1]);
      const intersect = ((yi > p[1]) !== (yj > p[1])) && (p[0] < ((xj - xi) * (p[1] - yi)) / ((yj - yi) || 0.000001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function ensureEntityPositions() {
    const missing = getEntities().filter(e => e.zone !== 'pool' && e.kind !== 'presenceSensorsTable' && !e.hasPos);
    const n = missing.length;
    if (!n) return;
    const startY = 8;
    const endY = 92;
    const step = n > 1 ? ((endY - startY) / (n - 1)) : 0;
    for (let i = 0; i < n; i++) {
      const x = 6;
      const y = startY + (i * step);
      setEntity(missing[i].kind, missing[i].idx, { posX: Number(x.toFixed(2)), posY: Number(y.toFixed(2)) });
    }
  }

  function addZones(canvas) {
    canvas.innerHTML = '';
    const l = state.floorLayouts[state.currentFloor] || defaultLayout();
    const ratio = getFloorRatio(state.currentFloor);
    l.imageRect = fitRectToRatio(l.imageRect || { x: 8, y: 6, w: 84, h: 88 }, ratio);
    const rect = l.imageRect;
    const frame = calcImageFrameInCanvas(canvas, rect, ratio);
    canvas.style.setProperty('--img-x', `${rect.x}%`);
    canvas.style.setProperty('--img-y', `${rect.y}%`);
    canvas.style.setProperty('--img-w', `${rect.w}%`);
    canvas.style.setProperty('--img-h', `${rect.h}%`);
    canvas.style.setProperty('--frame-x', `${frame.x}%`);
    canvas.style.setProperty('--frame-y', `${frame.y}%`);
    canvas.style.setProperty('--frame-w', `${frame.w}%`);
    canvas.style.setProperty('--frame-h', `${frame.h}%`);
    const bg = document.createElement('div');
    bg.className = 'floorplan-image';
    canvas.appendChild(bg);
    ['perimeter','aussenhaut','innenraum'].forEach(z => {
      const poly = l.zones?.[z];
      if (!Array.isArray(poly) || poly.length < 3) return;
      const d = document.createElement('div');
      d.className = `zone ${z}`;
      d.dataset.zone = z;
      const label = z === 'aussenhaut' ? 'außenhaut' : z;
      d.innerHTML = `<span>${label}</span>`;
      d.style.clipPath = `polygon(${poly.map(pt => `${pt[0]}% ${pt[1]}%`).join(',')})`;
      canvas.appendChild(d);
    });
    renderStaticZoneOverlay(canvas, l);
    if (state.editImage) renderImageEditorOverlay(canvas);
    if (state.editZones) renderZoneEditorOverlay(canvas, l);
  }

  function renderImageEditorOverlay(canvas) {
    const handles = document.createElement('div');
    handles.className = 'image-resize-handles';
    ['nw','ne','sw','se','move'].forEach(corner => {
      const h = document.createElement('button');
      h.type = 'button';
      h.className = `resize-handle ${corner}`;
      h.dataset.corner = corner;
      handles.appendChild(h);
    });
    canvas.appendChild(handles);
  }

  function renderStaticZoneOverlay(canvas, layout) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'zone-static-overlay');
    svg.setAttribute('viewBox', '0 0 100 100');
    for (const z of ['perimeter', 'aussenhaut', 'innenraum']) {
      const pts = layout.zones?.[z] || [];
      if (!Array.isArray(pts) || pts.length < 2) continue;
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      poly.setAttribute('points', pts.map(p => `${p[0]},${p[1]}`).join(' '));
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', '#7cf2a5');
      poly.setAttribute('stroke-width', '0.45');
      poly.setAttribute('stroke-linecap', 'round');
      poly.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(poly);
    }
    canvas.appendChild(svg);
  }

  function calcImageFrameInCanvas(canvas, rect, imageRatio) {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height || !imageRatio) return { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
    const rectPx = {
      x: (rect.x / 100) * box.width,
      y: (rect.y / 100) * box.height,
      w: (rect.w / 100) * box.width,
      h: (rect.h / 100) * box.height
    };
    let framePx = { ...rectPx };
    const rectRatioPx = rectPx.w / rectPx.h;
    if (rectRatioPx > imageRatio) {
      framePx.w = rectPx.h * imageRatio;
      framePx.x = rectPx.x + (rectPx.w - framePx.w) / 2;
    } else if (rectRatioPx < imageRatio) {
      framePx.h = rectPx.w / imageRatio;
      framePx.y = rectPx.y + (rectPx.h - framePx.h) / 2;
    }
    return {
      x: (framePx.x / box.width) * 100,
      y: (framePx.y / box.height) * 100,
      w: (framePx.w / box.width) * 100,
      h: (framePx.h / box.height) * 100
    };
  }

  function renderZoneEditorOverlay(canvas, layout) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'zone-editor-overlay');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.dataset.editor = '1';
    const zmap = { innenraum: '#ff8f8f', aussenhaut: '#ff4242', perimeter: '#7cf2a5' };
    for (const z of ['perimeter', 'aussenhaut', 'innenraum']) {
      const pts = (layout.zones?.[z] || []);
      if (pts.length < 1) continue;
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      poly.dataset.zonePoly = z;
      poly.setAttribute('points', pts.map(p => `${p[0]},${p[1]}`).join(' '));
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', zmap[z]);
      poly.setAttribute('stroke-width', '0.3');
      poly.setAttribute('stroke-linecap', 'round');
      poly.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(poly);
      pts.forEach((p, idx) => {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', String(p[0]));
        c.setAttribute('cy', String(p[1]));
        c.setAttribute('r', '0.6');
        c.setAttribute('fill', zmap[z]);
        c.setAttribute('stroke', '#0d1112');
        c.setAttribute('stroke-width', '0.18');
        c.setAttribute('style', 'pointer-events:all;cursor:grab');
        c.dataset.zonePoint = `${z}:${idx}`;
        svg.appendChild(c);
      });
    }
    canvas.appendChild(svg);

  }

  function applyZoneArmedVisuals(canvas){
    if (!canvas) return;
    const per = canvas.querySelector('.zone.perimeter');
    const aus = canvas.querySelector('.zone.aussenhaut');
    const inn = canvas.querySelector('.zone.innenraum');
    if (per) per.classList.toggle('armed-zone', !!state.live.perimeterArmed);
    if (aus) aus.classList.toggle('armed-zone', !!state.live.aussenArmed);
    if (inn) inn.classList.toggle('armed-zone', !!state.live.innenArmed);
  }

  function getRulesMap(){ try { return JSON.parse(state.config.rulesJson || '{}'); } catch { return {}; } }
  function setRulesMap(m){ state.config.rulesJson = JSON.stringify(m); }
  function ruleId(e){ return `${e.kind}:${e.entityKey}`; }
  function defaultRule(){ return { enabled:true, onlyArmed:true, onlyNight:false, sirene:false, snapshot:true, telegram:true }; }
  function readRuleForm(){ return { enabled: $('ruleEnabled').value==='true', onlyArmed: $('ruleOnlyArmed').value==='true', onlyNight: $('ruleOnlyNight').value==='true', sirene: $('ruleSirene').value==='true', snapshot: $('ruleSnapshot').value==='true', telegram: $('ruleTelegram').value==='true' }; }
  function writeRuleForm(rule){ const r={...defaultRule(), ...(rule||{})}; $('ruleEnabled').value=String(r.enabled); $('ruleOnlyArmed').value=String(r.onlyArmed); $('ruleOnlyNight').value=String(r.onlyNight); $('ruleSirene').value=String(r.sirene); $('ruleSnapshot').value=String(r.snapshot); $('ruleTelegram').value=String(r.telegram); }
  function readZoneSel(){ return $('ruleZone').value; }
  function writeZoneSel(z){ $('ruleZone').value = z || 'perimeter'; }
  function readFloorSel(){ return $('ruleFloor').value === 'OG' ? 'OG' : 'EG'; }
  function writeFloorSel(f){ $('ruleFloor').value = f === 'OG' ? 'OG' : 'EG'; }

  function selectEntity(e) {
    state.selectedEntity = e;
    ui.entityLabel.textContent = `Ausgewählt: ${e.label} (${e.zone})`;
    writeZoneSel(e.zone);
    writeFloorSel(e.floor || 'EG');
    writeRuleForm(getRulesMap()[ruleId(e)]);
    ui.entityModal.classList.remove('hidden');
  }

  function drawEntity(canvas, e, detailed) {
    const el = document.createElement('div');
    el.className = (detailed ? 'chip ' : 'mini-node ') + zoneClass(e.zone);
    if (!detailed && e.kind === 'presenceSensorsTable') el.classList.add('presence-node');
    if (!detailed && ['pirSensorsTable','contactSensorsTable','camerasTable','personDetectionTable'].includes(e.kind)) el.classList.add('sensor-dot-node');
    el.title = e.label;
    el.draggable = true;
    if (detailed) el.textContent = e.label;
    else el.innerHTML = entityIcon(e);
    el.style.left = `${Math.max(2, Math.min(98, Number(e.posX || 50)))}%`;
    el.style.top = `${Math.max(2, Math.min(98, Number(e.posY || 50)))}%`;
    el.addEventListener('dragstart', ev => ev.dataTransfer.setData('text/plain', JSON.stringify({ kind:e.kind, idx:e.idx })));
    el.addEventListener('click', ev => { ev.stopPropagation(); selectEntity(e); });
    if (!detailed && ui.hover) {
      el.addEventListener('mouseenter', () => { ui.hover.textContent = `Hover: ${e.label} (${e.zone})`; });
      el.addEventListener('mouseleave', () => { ui.hover.textContent = 'Hover: -'; });
    }
    canvas.appendChild(el);
  }

  function renderCanvas(target, detailed) {
    target.classList.toggle('floor-og', state.currentFloor === 'OG');
    target.classList.toggle('floor-eg', state.currentFloor !== 'OG');
    addZones(target);
    getEntities().filter(e => e.zone !== 'pool' && (String(e.floor || 'EG') === state.currentFloor)).forEach(e => drawEntity(target, e, detailed));
    applyZoneArmedVisuals(target);
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

  function renderCanvasEntitiesList() {
    if (!ui.canvasEntitiesList) return;
    const q = String(ui.canvasEntitySearch?.value || '').trim().toLowerCase();
    const rows = getAllCanvasEntities()
      .filter(e => {
        if (!q) return true;
        return `${e.label} ${e.key} ${e.id} ${e.zone} ${e.floor} ${kindLabel(e.kind)}`.toLowerCase().includes(q);
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'de'));
    if (rows.length === 0) {
      ui.canvasEntitiesList.innerHTML = '<div class="muted">Keine Elemente gefunden.</div>';
      return;
    }
    ui.canvasEntitiesList.innerHTML = rows.map(e => {
      const pos = e.floor === 'OG'
        ? `${Number.isFinite(e.posXOg) ? e.posXOg.toFixed(1) : '-'} / ${Number.isFinite(e.posYOg) ? e.posYOg.toFixed(1) : '-'}`
        : `${Number.isFinite(e.posXEg) ? e.posXEg.toFixed(1) : '-'} / ${Number.isFinite(e.posYEg) ? e.posYEg.toFixed(1) : '-'}`;
      return `<div class="sensor-item">
        <span><strong>${e.label}</strong> <span class="muted">(${kindLabel(e.kind)})</span><br><span class="muted">key=${e.key || '-'} | id=${e.id} | zone=${e.zone} | floor=${e.floor} | pos=${pos}</span></span>
        <span class="row" style="margin-top:0">
          <button class="btn" data-entity-edit="${e.kind}:${e.idx}">Bearbeiten</button>
          <button class="btn danger" data-entity-del="${e.kind}:${e.idx}">Löschen</button>
        </span>
      </div>`;
    }).join('');
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
        snapshotCanvasState();
        setEntity(p.kind, p.idx, { zone, posX: Math.max(2, Math.min(98, x)), posY: Math.max(2, Math.min(98, y)) });
        renderAllCanvases();
      } catch {
        setStatus('Ungültiger Drag&Drop-Inhalt', true);
      }
    });
  }

  function bindEditorInteractions(canvas) {
    if (canvas.dataset.boundEditor === '1') return;
    canvas.dataset.boundEditor = '1';
    canvas.addEventListener('click', e => {
      if (!state.editZones) return;
      if (state.suppressZoneClickOnce) {
        state.suppressZoneClickOnce = false;
        return;
      }
      const t = e.target;
      if (t.closest('.resize-handle') || t.closest('.image-resize-handles') || t.closest('[data-zone-point]')) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      const zone = ui.editZoneSelect.value;
      const l = getCurrentLayout();
      snapshotCanvasState();
      if (!Array.isArray(l.zones[zone])) l.zones[zone] = [];
      l.zones[zone].push([Number(x.toFixed(2)), Number(y.toFixed(2))]);
      writeFloorLayoutsToConfig();
      renderAllCanvases();
    });

    canvas.addEventListener('pointerdown', e => {
      const zonePoint = e.target.closest('[data-zone-point]');
      if (zonePoint && state.editZones) {
        const [zone, idxRaw] = String(zonePoint.dataset.zonePoint || '').split(':');
        const idx = Number(idxRaw);
        const l = getCurrentLayout();
        if (!zone || !Number.isInteger(idx) || !Array.isArray(l.zones?.[zone]) || !l.zones[zone][idx]) return;
        e.preventDefault();
        snapshotCanvasState();
        state.dragZonePoint = { zone, idx };
        state.suppressZoneClickOnce = true;
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      const h = e.target.closest('.resize-handle');
      const onFrame = e.target.closest('.image-resize-handles');
      if ((!h && !onFrame) || !state.editImage) return;
      e.preventDefault();
      const corner = h ? h.dataset.corner : 'move';
      const l = getCurrentLayout();
      snapshotCanvasState();
      state.dragResize = { corner, startX: e.clientX, startY: e.clientY, start: { ...l.imageRect } };
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (state.dragZonePoint) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        const l = getCurrentLayout();
        const z = state.dragZonePoint.zone;
        const i = state.dragZonePoint.idx;
        if (!Array.isArray(l.zones?.[z]) || !l.zones[z][i]) return;
        l.zones[z][i] = [Number(x.toFixed(2)), Number(y.toFixed(2))];
        refreshAllEditorZonePreviews(l, z);
        return;
      }
      if (!state.dragResize) return;
      const rect = canvas.getBoundingClientRect();
      const dx = ((e.clientX - state.dragResize.startX) / rect.width) * 100;
      const dy = ((e.clientY - state.dragResize.startY) / rect.height) * 100;
      const l = getCurrentLayout();
      const s = state.dragResize.start;
      const ratio = getFloorRatio(state.currentFloor);
      let w = s.w;
      let h = s.w / ratio;
      let x = s.x;
      let y = s.y;
      if (state.dragResize.corner === 'move') {
        x = s.x + dx;
        y = s.y + dy;
      } else {
        if (state.dragResize.corner === 'se' || state.dragResize.corner === 'ne') w = Math.max(20, s.w + dx);
        else w = Math.max(20, s.w - dx);
        h = w / ratio;
        if (state.dragResize.corner === 'nw' || state.dragResize.corner === 'sw') x = s.x + (s.w - w);
        if (state.dragResize.corner === 'nw' || state.dragResize.corner === 'ne') y = s.y + (s.h - h);
      }
      l.imageRect = {
        x,
        y,
        w: Math.max(20, Math.min(300, w)),
        h: Math.max(20 / ratio, Math.min(300 / ratio, h))
      };
      writeFloorLayoutsToConfig();
      renderAllCanvases();
    });
    canvas.addEventListener('pointerup', () => {
      if (state.dragZonePoint) {
        state.dragZonePoint = null;
        writeFloorLayoutsToConfig();
        renderAllCanvases();
      }
      state.dragResize = null;
    });
    canvas.addEventListener('pointercancel', () => {
      state.dragZonePoint = null;
      state.dragResize = null;
    });
  }

  function refreshEditorZonePreview(canvas, layout, zone) {
    if (!canvas) return;
    const pts = layout.zones?.[zone] || [];
    const poly = canvas.querySelector(`.zone-editor-overlay [data-zone-poly="${zone}"]`);
    if (poly) poly.setAttribute('points', pts.map(p => `${p[0]},${p[1]}`).join(' '));
    const circles = canvas.querySelectorAll('.zone-editor-overlay [data-zone-point]');
    circles.forEach(node => {
      const [z, idxRaw] = String(node.dataset.zonePoint || '').split(':');
      if (z !== zone) return;
      const idx = Number(idxRaw);
      const p = pts[idx];
      if (!p) return;
      node.setAttribute('cx', String(p[0]));
      node.setAttribute('cy', String(p[1]));
    });
    const zoneEl = canvas.querySelector(`.zone[data-zone="${zone}"]`);
    if (zoneEl) zoneEl.style.clipPath = `polygon(${pts.map(pt => `${pt[0]}% ${pt[1]}%`).join(',')})`;
  }

  function refreshAllEditorZonePreviews(layout, zone) {
    refreshEditorZonePreview(ui.mini, layout, zone);
    refreshEditorZonePreview(ui.full, layout, zone);
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
    renderCanvasEntitiesList();
    bindCanvasDrops(ui.mini);
    bindCanvasDrops(ui.full);
    bindEditorInteractions(ui.mini);
    bindEditorInteractions(ui.full);
  }

  function tidyCanvasLayout() {
    ensureTables();
    snapshotCanvasState();
    const groups = ['pirSensorsTable','contactSensorsTable','presenceSensorsTable','personDetectionTable','camerasTable'];
    for (const g of groups) {
      for (const row of state.config[g]) {
        if (!row) continue;
        if (String(row.zone || 'pool') === 'pool') continue;
        delete row.posX;
        delete row.posY;
      }
    }
    renderAllCanvases();
    setStatus('Canvas aufgeräumt: Elemente pro Zone neu verteilt');
  }

  function renderFields() {
    ui.global.innerHTML = '';
    ui.dp.innerHTML = '';

    for (const [k,t] of globalSpec) {
      const w = document.createElement('label');
      w.textContent = k;
      w.title = globalHelp[k] || k;
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

  function applyFloorplanImages() {
    const eg = String(state.config.floorplanEgImage || './assets/EG.jpg').trim();
    const og = String(state.config.floorplanOgImage || './assets/OG.jpg').trim();
    document.documentElement.style.setProperty('--floor-eg-image', `url('${eg.replace(/'/g, "\\'")}')`);
    document.documentElement.style.setProperty('--floor-og-image', `url('${og.replace(/'/g, "\\'")}')`);
    if (ui.floorplanEgInput) ui.floorplanEgInput.value = eg;
    if (ui.floorplanOgInput) ui.floorplanOgInput.value = og;
    void loadFloorImageRatio('EG', eg);
    void loadFloorImageRatio('OG', og);
  }

  function getFloorRatio(floor) {
    const f = floor === 'OG' ? 'OG' : 'EG';
    const r = Number(state.floorRatios[f] || 0.907);
    return Number.isFinite(r) && r > 0 ? r : 0.907;
  }

  function fitRectToRatio(rect, ratio) {
    const out = { ...rect };
    out.h = out.w / ratio;
    if (out.h > 100) {
      out.h = 100;
      out.w = out.h * ratio;
    }
    if (out.w > 100) {
      out.w = 100;
      out.h = out.w / ratio;
    }
    out.x = Math.max(0, Math.min(100 - out.w, out.x));
    out.y = Math.max(0, Math.min(100 - out.h, out.y));
    return out;
  }

  function loadFloorImageRatio(floor, src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          state.floorRatios[floor] = img.naturalWidth / img.naturalHeight;
          const l = state.floorLayouts[floor] || defaultLayout();
          l.imageRect = fitRectToRatio(l.imageRect || { x: 8, y: 6, w: 84, h: 88 }, getFloorRatio(floor));
          state.floorLayouts[floor] = l;
          writeFloorLayoutsToConfig();
          renderAllCanvases();
        }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = src;
    });
  }

  function ensureFloorLayouts() {
    let parsed = null;
    try { parsed = JSON.parse(String(state.config.floorLayoutsJson || '{}')); } catch {}
    const base = parsed && typeof parsed === 'object' ? parsed : {};
    const eg = base.EG && typeof base.EG === 'object' ? base.EG : defaultLayout();
    const og = base.OG && typeof base.OG === 'object' ? base.OG : defaultLayout();
    state.floorLayouts = { EG: eg, OG: og };
  }

  function snapshotCanvasState() {
    state.canvasHistory.push(JSON.stringify({
      floorLayouts: state.floorLayouts,
      pir: state.config.pirSensorsTable,
      contact: state.config.contactSensorsTable,
      presence: state.config.presenceSensorsTable,
      person: state.config.personDetectionTable,
      cams: state.config.camerasTable
    }));
    if (state.canvasHistory.length > 60) state.canvasHistory.shift();
  }

  function undoCanvasStep() {
    const snap = state.canvasHistory.pop();
    if (!snap) return;
    try {
      const s = JSON.parse(snap);
      state.floorLayouts = s.floorLayouts || state.floorLayouts;
      state.config.pirSensorsTable = s.pir || state.config.pirSensorsTable;
      state.config.contactSensorsTable = s.contact || state.config.contactSensorsTable;
      state.config.presenceSensorsTable = s.presence || state.config.presenceSensorsTable;
      state.config.personDetectionTable = s.person || state.config.personDetectionTable;
      state.config.camerasTable = s.cams || state.config.camerasTable;
      writeFloorLayoutsToConfig();
      renderAllCanvases();
      setStatus('Letzter Schritt rückgängig');
    } catch {}
  }

  function writeFloorLayoutsToConfig() {
    state.config.floorLayoutsJson = JSON.stringify(state.floorLayouts);
  }

  function getCurrentLayout() {
    if (!state.floorLayouts[state.currentFloor]) state.floorLayouts[state.currentFloor] = defaultLayout();
    return state.floorLayouts[state.currentFloor];
  }

  function copyZonesToOtherFloor() {
    const from = state.currentFloor === 'OG' ? 'OG' : 'EG';
    const to = from === 'EG' ? 'OG' : 'EG';
    if (!state.floorLayouts[from]) state.floorLayouts[from] = defaultLayout();
    if (!state.floorLayouts[to]) state.floorLayouts[to] = defaultLayout();
    snapshotCanvasState();
    const fromZones = state.floorLayouts[from].zones || {};
    state.floorLayouts[to].zones = clone({
      perimeter: Array.isArray(fromZones.perimeter) ? fromZones.perimeter : [],
      aussenhaut: Array.isArray(fromZones.aussenhaut) ? fromZones.aussenhaut : [],
      innenraum: Array.isArray(fromZones.innenraum) ? fromZones.innenraum : []
    });
    writeFloorLayoutsToConfig();
    renderAllCanvases();
    setStatus(`Zonen von ${from} nach ${to} übernommen`);
  }

  function readFormIntoConfig() {
    ui.global.querySelectorAll('[data-key]').forEach(el => {
      const k = el.dataset.key;
      const spec = globalSpec.find(x => x[0] === k);
      if (!spec) return;
      state.config[k] = spec[1] === 'number' ? Number(el.value || 0) : (el.value === 'true');
    });
    ui.dp.querySelectorAll('[data-key]').forEach(el => { state.config[el.dataset.key] = el.value || ''; });
    state.config.floorplanEgImage = String(ui.floorplanEgInput?.value || './assets/EG.jpg').trim();
    state.config.floorplanOgImage = String(ui.floorplanOgInput?.value || state.config.floorplanEgImage || './assets/OG.jpg').trim();
  }

  function renderZoneActions() {
    ensureTables();
    if (!ui.zoneActionsList) return;
    const rows = state.config.zoneActionsTable || [];
    if (!rows.length) {
      ui.zoneActionsList.innerHTML = '<div class="muted">Keine Zonen-Aktoren konfiguriert.</div>';
      return;
    }
    ui.zoneActionsList.innerHTML = rows.map((r, idx) => {
      const zone = String(r.zone || 'perimeter');
      const label = String(r.label || r.key || r.datapointId || `action_${idx + 1}`);
      const dp = String(r.datapointId || '');
      const onValue = r.onValue === undefined || r.onValue === null ? 'true' : String(r.onValue);
      const offValue = r.offValue === undefined || r.offValue === null || String(r.offValue) === '' ? '-' : String(r.offValue);
      const pulse = Number(r.pulseMs || 0) > 0 ? `${Number(r.pulseMs)}ms` : '-';
      return `<div class="sensor-item"><span>${label} [${zone}]<br><span class="muted">${dp} | on=${onValue} | off=${offValue} | pulse=${pulse}</span></span><button class="btn danger" data-del-zone-action="${idx}">Löschen</button></div>`;
    }).join('');
  }

  function addZoneAction() {
    ensureTables();
    const zone = String(($('zoneActionZone').value || 'perimeter')).trim();
    const key = String(($('zoneActionKey').value || '').trim());
    const label = String(($('zoneActionLabel').value || '').trim());
    const datapointId = String(($('zoneActionId').value || '').trim());
    const onValueRaw = String(($('zoneActionOnValue').value || '').trim() || 'true');
    const offValueRaw = String(($('zoneActionOffValue').value || '').trim());
    const pulseMsRaw = Number($('zoneActionPulseMs').value || 0);
    if (!datapointId) {
      setStatus('Aktor-Datapoint ID fehlt', true);
      if (ui.zoneActionResult) ui.zoneActionResult.textContent = 'Datapoint ID fehlt';
      return;
    }
    const row = {
      key: key || datapointId,
      label: label || key || datapointId,
      zone: ['perimeter', 'aussenhaut', 'innenraum'].includes(zone) ? zone : 'perimeter',
      datapointId,
      onValue: onValueRaw,
      offValue: offValueRaw || '',
      pulseMs: Number.isFinite(pulseMsRaw) && pulseMsRaw > 0 ? Math.round(pulseMsRaw) : 0
    };
    state.config.zoneActionsTable.push(row);
    renderZoneActions();
    if (ui.zoneActionResult) ui.zoneActionResult.textContent = `Hinzugefügt: ${row.label}`;
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
    const base = { key: key || id, label: label || key || id, id, zone: 'pool', floor: state.currentFloor };
    if (kind === 'personDetectionTable') state.config[kind].push({ ...base, mode, detectValue: mode === 'string' ? (detect || 'human detected') : '' });
    else state.config[kind].push({ ...base, activeValuesCsv: active || 'true' });
    renderAllCanvases();
    ui.addResult.textContent = `Hinzugefügt: ${base.label}`;
  }

  function openObjectBrowser(targetInput) {
    state.objectTarget = targetInput;
    ui.objectModal.classList.remove('hidden');
    ui.objectSearch.value = targetInput.value || '';
    ui.objectResults.innerHTML = '<div class="muted">Lade Objekte…</div>';
    void ensureStateIdsLoaded().then(() => renderObjectResults());
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

  function renderPinDots() {
    if (!ui.pinDots) return;
    const dots = Array.from(ui.pinDots.querySelectorAll('.pin-dot'));
    dots.forEach((d, i) => d.classList.toggle('filled', i < state.pinInput.length));
  }

  function closePinModal() {
    state.pinInput = '';
    state.pinTargetAction = null;
    renderPinDots();
    if (ui.pinHint) ui.pinHint.textContent = 'PIN: 4-stellig';
    ui.pinModal.classList.add('hidden');
  }

  function openPinModal(action) {
    state.pinTargetAction = action;
    state.pinInput = '';
    renderPinDots();
    if (ui.pinHint) ui.pinHint.textContent = 'PIN: 4-stellig';
    ui.pinModal.classList.remove('hidden');
  }

  async function onPinDigit(d) {
    if (!/^\d$/.test(String(d))) return;
    if (state.pinInput.length >= 4) return;
    state.pinInput += String(d);
    renderPinDots();
    if (state.pinInput.length < 4) return;
    if (state.pinInput !== DISARM_PIN) {
      if (ui.pinHint) ui.pinHint.textContent = 'Falsche PIN';
      state.pinInput = '';
      renderPinDots();
      return;
    }
    const action = state.pinTargetAction;
    closePinModal();
    if (!action) return;
    await manualControl(action);
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
    el.classList.remove('armed','armed-perimeter','disarmed');
    el.classList.add(armed ? 'armed' : 'disarmed');
  }

  function setControlPair(onBtn, offBtn, isOn) {
    if (!onBtn || !offBtn) return;
    onBtn.classList.remove('state-on', 'state-off');
    offBtn.classList.remove('state-on', 'state-off');
    if (isOn) onBtn.classList.add('state-on');
    else offBtn.classList.add('state-off');
  }

  function paintShield(mode) {
    if (!ui.shield) return;
    ui.shield.classList.remove('armed', 'perimeter', 'disarmed');
    const shieldIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v6c0 5-3.2 8-7 9-3.8-1-7-4-7-9V6l7-3z"></path><path d="M9 12.5l2 2 4-4"></path></svg>';
    if (mode === 'armed') {
      ui.shield.classList.add('armed');
      ui.shield.innerHTML = `${shieldIcon}<span>ALLES SCHARF</span>`;
      return;
    }
    if (mode === 'perimeter') {
      ui.shield.classList.add('perimeter');
      ui.shield.innerHTML = `${shieldIcon}<span>PERIMETER AKTIV</span>`;
      return;
    }
    ui.shield.classList.add('disarmed');
    ui.shield.innerHTML = `${shieldIcon}<span>UNSCHARF</span>`;
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
    const prevPresence = state.presenceByPerson || { sebastian: false, teresa: false };
    const presenceRows = Array.isArray(state.config.presenceSensorsTable) ? state.config.presenceSensorsTable : [];
    const presenceByPerson = { sebastian: false, teresa: false };
    for (const row of presenceRows) {
      const person = inferPresencePerson(row);
      if (!person || presenceByPerson[person]) continue;
      const st = await getState(String(row.id || ''));
      presenceByPerson[person] = isPresenceHome(row, st?.val);
    }
    state.presenceByPerson = presenceByPerson;

    const rawPerimeter = asArmed(perDp?.val) || asArmed(zPer?.val) || asArmed(zAus?.val);
    const rawAll = asArmed(allDp?.val) || asArmed(zInn?.val);
    const allArmed = rawAll;
    const innenArmed = rawAll || asArmed(zInn?.val);
    const aussenArmed = rawAll || rawPerimeter || asArmed(zAus?.val);
    const perimeterArmed = rawAll || rawPerimeter || asArmed(zPer?.val);
    const camerasArmed = asArmed(cam?.val);

    const modeText = (perimeterArmed || aussenArmed || innenArmed || allArmed) ? 'armed' : 'disarmed';
    ui.liveMode.textContent = `Mode: ${modeText}`;
    ui.livePerimeter.textContent = `Perimeter: ${perimeterArmed ? 'scharf' : 'unscharf'}`;
    ui.liveAussenhaut.textContent = `Aussenhaut: ${aussenArmed ? 'scharf' : 'unscharf'}`;
    ui.liveInnenraum.textContent = `Innenraum: ${innenArmed ? 'scharf' : 'unscharf'}`;
    ui.liveCameras.textContent = `Kameras: ${camerasArmed ? 'scharf' : 'unscharf'}`;

    ui.liveMode.classList.remove('armed','armed-perimeter','disarmed');
    if (allArmed) ui.liveMode.classList.add('armed');
    else if (perimeterArmed) ui.liveMode.classList.add('armed-perimeter');
    else ui.liveMode.classList.add('disarmed');
    if (allArmed) paintShield('armed');
    else if (perimeterArmed) paintShield('perimeter');
    else paintShield('disarmed');
    paintChip(ui.livePerimeter, perimeterArmed);
    paintChip(ui.liveAussenhaut, aussenArmed);
    paintChip(ui.liveInnenraum, innenArmed);
    paintChip(ui.liveCameras, camerasArmed);
    setControlPair($('armAlarmBtn'), $('disarmAlarmBtn'), asArmed(allDp?.val) || innenArmed);
    setControlPair($('armPerimeterBtn'), $('disarmPerimeterBtn'), asArmed(perDp?.val) || perimeterArmed || aussenArmed);
    setControlPair($('armCamerasBtn'), $('disarmCamerasBtn'), asArmed(cam?.val) || camerasArmed);
    // Keep canvas blink logic aligned with effective armed evaluation
    // (datapoints + zone states), not only raw zone states.
    state.live.perimeterArmed = perimeterArmed;
    state.live.aussenArmed = aussenArmed;
    state.live.innenArmed = innenArmed;
    applyZoneArmedVisuals(ui.mini);
    applyZoneArmedVisuals(ui.full);
    if (presenceByPerson.sebastian !== prevPresence.sebastian || presenceByPerson.teresa !== prevPresence.teresa) {
      renderAllCanvases();
    }
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
    ensureFloorLayouts();
    applyFloorplanImages();
    renderAllCanvases();
    renderZoneActions();
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
    ensureFloorLayouts();
    ui.instance.textContent = `Instanz: ${state.instanceId}`;
    renderAll();
    const today = new Date().toISOString().slice(0,10);
    ui.logDate.value = today;
    ui.logView.textContent = 'Log noch nicht geladen. Bitte "Log laden" klicken.';
    setStatus('Aktuelle Instanzdaten geladen (schneller Startmodus)');
  }

  function bindModal() {
    $('openCanvasBtn').addEventListener('click', () => {
      ui.canvasModal.classList.remove('hidden');
      renderCanvas(ui.full, true);
      bindCanvasDrops(ui.full);
    });
    $('closeCanvasBtn').addEventListener('click', () => ui.canvasModal.classList.add('hidden'));
  }

  function switchPage(page) {
    const isOverview = page !== 'settings';
    ui.overviewPage.classList.toggle('hidden', !isOverview);
    ui.settingsPage.classList.toggle('hidden', isOverview);
    ui.pageOverviewBtn.classList.toggle('primary', isOverview);
    ui.pageOverviewBtn.classList.toggle('ghost', !isOverview);
    ui.pageSettingsBtn.classList.toggle('primary', !isOverview);
    ui.pageSettingsBtn.classList.toggle('ghost', isOverview);
  }

  async function refreshPanicButton() {
    const panicId = String(state.config.panicStateId || '').trim();
    if (!panicId) {
      ui.panicBtn.classList.remove('on');
      ui.panicBtn.textContent = 'PANIC';
      return;
    }
    const raw = readStateVal(await getState(panicId));
    const on = asArmed(raw);
    ui.panicBtn.classList.toggle('on', on);
    ui.panicBtn.textContent = on ? 'PANIC AKTIV' : 'PANIC';
  }

  async function togglePanic() {
    const panicId = String(state.config.panicStateId || '').trim();
    if (!panicId) throw new Error('panicStateId ist leer');
    const on = asArmed(readStateVal(await getState(panicId)));
    await setState(panicId, !on);
    await refreshPanicButton();
    setStatus(`PANIC ${!on ? 'aktiviert' : 'deaktiviert'}`);
  }

  async function init() {
    const syncEditButtons = () => {
      if (ui.editImageBtn) {
        ui.editImageBtn.classList.toggle('primary', state.editImage);
        ui.editImageBtn.classList.toggle('ghost', !state.editImage);
      }
      if (ui.editZonesBtn) {
        ui.editZonesBtn.classList.toggle('primary', state.editZones);
        ui.editZonesBtn.classList.toggle('ghost', !state.editZones);
      }
    };
    connectSocket();
    bindPoolDrop();
    bindModal();
    await reloadFromInstance();
    writeRuleForm(defaultRule());

    $('reloadBtn').addEventListener('click', () => reloadFromInstance().catch(e => setStatus(String(e), true)));
    $('saveBtn').addEventListener('click', () => saveToInstance().catch(e => setStatus(String(e), true)));
    ui.pageOverviewBtn.addEventListener('click', () => switchPage('overview'));
    ui.pageSettingsBtn.addEventListener('click', () => switchPage('settings'));
    ui.floorEgBtn.addEventListener('click', () => {
      state.currentFloor = 'EG';
      ui.floorEgBtn.classList.add('primary'); ui.floorEgBtn.classList.remove('ghost');
      ui.floorOgBtn.classList.add('ghost'); ui.floorOgBtn.classList.remove('primary');
      renderAllCanvases();
    });
    ui.floorOgBtn.addEventListener('click', () => {
      state.currentFloor = 'OG';
      ui.floorOgBtn.classList.add('primary'); ui.floorOgBtn.classList.remove('ghost');
      ui.floorEgBtn.classList.add('ghost'); ui.floorEgBtn.classList.remove('primary');
      renderAllCanvases();
    });
    ui.editImageBtn.addEventListener('click', () => {
      state.editImage = !state.editImage;
      if (state.editImage) state.editZones = false;
      syncEditButtons();
      renderAllCanvases();
    });
    ui.editZonesBtn.addEventListener('click', () => {
      state.editZones = !state.editZones;
      if (state.editZones) state.editImage = false;
      syncEditButtons();
      renderAllCanvases();
    });
    ui.closeZoneBtn.addEventListener('click', () => {
      const z = ui.editZoneSelect.value;
      const l = getCurrentLayout();
      const pts = l.zones[z] || [];
      snapshotCanvasState();
      if (pts.length >= 3 && (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1])) {
        pts.push([pts[0][0], pts[0][1]]);
      }
      writeFloorLayoutsToConfig();
      renderAllCanvases();
    });
    ui.clearZoneBtn.addEventListener('click', () => {
      const z = ui.editZoneSelect.value;
      const l = getCurrentLayout();
      snapshotCanvasState();
      l.zones[z] = [];
      writeFloorLayoutsToConfig();
      renderAllCanvases();
    });
    $('undoCanvasBtn').addEventListener('click', undoCanvasStep);
    if (ui.copyZonesFloorBtn) {
      ui.copyZonesFloorBtn.addEventListener('click', copyZonesToOtherFloor);
    }
    ui.resetImageRectBtn.addEventListener('click', () => {
      const l = getCurrentLayout();
      snapshotCanvasState();
      const ratio = getFloorRatio(state.currentFloor);
      let w = 84;
      let h = w / ratio;
      if (h > 88) { h = 88; w = h * ratio; }
      l.imageRect = { x: 8, y: 6, w, h };
      writeFloorLayoutsToConfig();
      renderAllCanvases();
    });
    $('loadProfileBtn').addEventListener('click', loadProfile);
    $('saveProfileBtn').addEventListener('click', saveAsProfile);
    $('deleteProfileBtn').addEventListener('click', deleteProfile);
    $('addSensorBtn').addEventListener('click', addNewEntity);
    $('addZoneActionBtn').addEventListener('click', addZoneAction);
    $('tidyCanvasBtn').addEventListener('click', tidyCanvasLayout);

    $('browseNewIdBtn').addEventListener('click', () => openObjectBrowser($('newId')));
    $('browseZoneActionIdBtn').addEventListener('click', () => openObjectBrowser($('zoneActionId')));
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
      const f = readFloorSel();
      setEntity(state.selectedEntity.kind, state.selectedEntity.idx, { zone: z, floor: f });
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
    $('disarmAlarmBtn').addEventListener('click', () => openPinModal('disarmAlarm'));
    $('armPerimeterBtn').addEventListener('click', () => manualControl('armPerimeter').catch(e => setStatus(String(e), true)));
    $('disarmPerimeterBtn').addEventListener('click', () => openPinModal('disarmPerimeter'));
    $('armCamerasBtn').addEventListener('click', () => manualControl('armCameras').catch(e => setStatus(String(e), true)));
    $('disarmCamerasBtn').addEventListener('click', () => openPinModal('disarmCameras'));

    $('closePinBtn').addEventListener('click', closePinModal);
    $('pinClearBtn').addEventListener('click', () => {
      state.pinInput = '';
      renderPinDots();
      if (ui.pinHint) ui.pinHint.textContent = 'PIN: 4-stellig';
    });
    $('pinBackBtn').addEventListener('click', () => {
      state.pinInput = state.pinInput.slice(0, -1);
      renderPinDots();
      if (ui.pinHint) ui.pinHint.textContent = 'PIN: 4-stellig';
    });
    document.querySelectorAll('.numpad [data-pin]').forEach(btn => {
      btn.addEventListener('click', () => {
        void onPinDigit(btn.getAttribute('data-pin')).catch(e => setStatus(String(e), true));
      });
    });
    ui.panicBtn.addEventListener('click', () => togglePanic().catch(e => setStatus(String(e), true)));
    if (ui.zoneActionsList) {
      ui.zoneActionsList.addEventListener('click', ev => {
        const btn = ev.target.closest('[data-del-zone-action]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-del-zone-action'));
        if (!Number.isInteger(idx) || idx < 0) return;
        ensureTables();
        state.config.zoneActionsTable.splice(idx, 1);
        renderZoneActions();
      });
    }
    if (ui.canvasEntitiesList) {
      ui.canvasEntitiesList.addEventListener('click', ev => {
        const editBtn = ev.target.closest('[data-entity-edit]');
        if (editBtn) {
          const [kind, idxRaw] = String(editBtn.getAttribute('data-entity-edit') || '').split(':');
          const idx = Number(idxRaw);
          if (!kind || !Number.isInteger(idx) || !state.config[kind]?.[idx]) return;
          const row = state.config[kind][idx];
          const floor = String(row.floor || 'EG') === 'OG' ? 'OG' : 'EG';
          state.currentFloor = floor;
          ui.floorEgBtn.classList.toggle('primary', floor === 'EG');
          ui.floorEgBtn.classList.toggle('ghost', floor !== 'EG');
          ui.floorOgBtn.classList.toggle('primary', floor === 'OG');
          ui.floorOgBtn.classList.toggle('ghost', floor !== 'OG');
          const id = kind === 'camerasTable'
            ? String(row.personDetectionDp || row.snapshotUrl || row.ip || '')
            : String(row.id || '');
          const x = floor === 'OG' ? row.posXOg : (row.posXEg ?? row.posX);
          const y = floor === 'OG' ? row.posYOg : (row.posYEg ?? row.posY);
          renderAllCanvases();
          selectEntity({
            kind,
            idx,
            entityKey: String(row.key || id),
            label: String(row.label || row.key || id),
            zone: String(row.zone || 'pool'),
            floor,
            posX: Number.isFinite(Number(x)) ? Number(x) : null,
            posY: Number.isFinite(Number(y)) ? Number(y) : null,
            hasPos: Number.isFinite(Number(x)) && Number.isFinite(Number(y))
          });
          return;
        }
        const delBtn = ev.target.closest('[data-entity-del]');
        if (delBtn) {
          const [kind, idxRaw] = String(delBtn.getAttribute('data-entity-del') || '').split(':');
          const idx = Number(idxRaw);
          if (!kind || !Number.isInteger(idx) || !Array.isArray(state.config[kind]) || !state.config[kind][idx]) return;
          snapshotCanvasState();
          const deleted = state.config[kind][idx];
          state.config[kind].splice(idx, 1);
          if (state.selectedEntity && state.selectedEntity.kind === kind && state.selectedEntity.idx === idx) {
            state.selectedEntity = null;
            ui.entityModal.classList.add('hidden');
          }
          renderAllCanvases();
          setStatus(`Element gelöscht: ${String(deleted.label || deleted.key || kind)}`);
        }
      });
    }
    if (ui.canvasEntitySearch) {
      ui.canvasEntitySearch.addEventListener('input', renderCanvasEntitiesList);
    }
    $('focusAddEntityBtn')?.addEventListener('click', () => {
      $('newLabel')?.focus();
    });

    await refreshLiveStatus();
    await refreshPanicButton();
    switchPage('overview');
    setInterval(() => { void refreshLiveStatus(); }, 2000);
    setInterval(() => { void refreshPanicButton(); }, 2000);
  }

  init().catch(err => setStatus(String(err), true));
})();
