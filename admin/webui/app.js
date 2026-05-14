(() => {
  const qs = new URLSearchParams(window.location.search);
  const rawInstance = qs.get('instance') || 'alarmsystem.0';

  const statusBox = document.getElementById('statusBox');
  const instanceLabel = document.getElementById('instanceLabel');
  const profileSelect = document.getElementById('profileSelect');
  const poolList = document.getElementById('poolList');
  const globalFields = document.getElementById('globalFields');
  const dpFields = document.getElementById('dpFields');
  const miniCanvas = document.getElementById('miniCanvas');
  const fullCanvas = document.getElementById('fullCanvas');
  const modal = document.getElementById('canvasModal');
  const objectBrowserModal = document.getElementById('objectBrowserModal');
  const entitySettingsModal = document.getElementById('entitySettingsModal');
  const stateIdsDatalist = document.getElementById('stateIds');
  const objectSearch = document.getElementById('objectSearch');
  const objectResults = document.getElementById('objectResults');
  const addResult = document.getElementById('addResult');
  const miniHoverInfo = document.getElementById('miniHoverInfo');
  const triggerLogDateInput = document.getElementById('triggerLogDate');
  const triggerLogView = document.getElementById('triggerLogView');
  const selectedEntityLabel = document.getElementById('selectedEntityLabel');
  const liveMode = document.getElementById('liveMode');
  const livePerimeter = document.getElementById('livePerimeter');
  const liveAussenhaut = document.getElementById('liveAussenhaut');
  const liveInnenraum = document.getElementById('liveInnenraum');
  const liveCameras = document.getElementById('liveCameras');

  const state = { socket: null, instanceObj: null, config: null, profiles: {}, activeProfile: 'default.json', instanceId: 'alarmsystem.0', objectId: 'system.adapter.alarmsystem.0', stateIds: [], selectedEntity: null };
  let objectBrowserTargetInput = null;

  const globalSpec = [['defaultEntryDelaySec','number'],['defaultExitDelaySec','number'],['eventDedupeMs','number'],['heartbeatTimeoutSec','number'],['snapshotSendDelayMs','number'],['snapshotBurstCount','number'],['snapshotBurstIntervalMs','number'],['autoArmDelaySec','number'],['bedtimeHour','number'],['bedtimeLightThreshold','number'],['simulationMode','boolean'],['cameraNightModeEnabled','boolean'],['cameraNightModeArmsCameras','boolean']];
  const dpSpec = ['armStateId','perimeterStateId','triggerStateId','sirenStateId','displayId','clearDisplayId','buzzerId','ledRedId','ledYellowId','standbyId','motionSensorId','panicStateId','fingerprintStateId','pinStateId','statusId'];

  const setStatus = (m,e=false) => { statusBox.textContent = m; statusBox.classList.toggle('err', e); };
  const clone = v => JSON.parse(JSON.stringify(v));
  const normalizeInstanceId = v => { let out = String(v || '').trim(); if (out.startsWith('system.adapter.')) out = out.slice(15); if (!out.includes('.')) out += '.0'; return out; };
  const buildObjectIdCandidates = raw => [...new Set([`system.adapter.${normalizeInstanceId(raw)}`, `system.adapter.${raw}`])];

  function ensureTables(){ ['pirSensorsTable','contactSensorsTable','presenceSensorsTable','personDetectionTable','camerasTable'].forEach(k=>{ if(!Array.isArray(state.config[k])) state.config[k]=[]; }); }
  function normalizeInitialZones(){
    ensureTables();
    for (const row of state.config.contactSensorsTable) {
      if (!row || row.manualZone) continue;
      row.zone = 'aussenhaut';
    }
    for (const row of state.config.personDetectionTable) {
      if (!row || row.manualZone) continue;
      row.zone = 'perimeter';
    }
    for (const row of state.config.camerasTable) {
      if (!row || row.manualZone) continue;
      if (!row.zone || row.zone === 'aussenhaut') row.zone = 'perimeter';
    }
  }

  function getEntities(){
    ensureTables();
    const rows = [];
    const add = (arr, kind, getId) => (arr || []).forEach((r, idx) => {
      const id = getId(r);
      if (!r || !id) return;
      rows.push({ kind, idx, entityKey: String(r.key || id), label: String(r.label || r.key || id), zone: String(r.zone || 'pool'), hasPos: Number.isFinite(Number(r.posX)) && Number.isFinite(Number(r.posY)), posX: Number.isFinite(Number(r.posX)) ? Number(r.posX) : null, posY: Number.isFinite(Number(r.posY)) ? Number(r.posY) : null });
    });
    add(state.config.pirSensorsTable, 'pirSensorsTable', r => r?.id);
    add(state.config.contactSensorsTable, 'contactSensorsTable', r => r?.id);
    add(state.config.presenceSensorsTable, 'presenceSensorsTable', r => r?.id);
    add(state.config.personDetectionTable, 'personDetectionTable', r => r?.id);
    add(state.config.camerasTable, 'camerasTable', r => r?.personDetectionDp || r?.snapshotUrl || r?.ip);
    return rows;
  }

  function setEntity(kind, idx, patch){
    if(!Array.isArray(state.config[kind]) || !state.config[kind][idx]) return;
    const row = state.config[kind][idx];
    const oldZone = String(row.zone || 'pool');
    const nextZone = typeof patch.zone === 'string' ? patch.zone : oldZone;
    Object.assign(row, patch);
    if (typeof patch.zone === 'string') row.manualZone = true;
    const hasExplicitPos = Object.prototype.hasOwnProperty.call(patch, 'posX') || Object.prototype.hasOwnProperty.call(patch, 'posY');
    if (!hasExplicitPos && nextZone !== oldZone && nextZone !== 'pool') {
      delete row.posX;
      delete row.posY;
    }
  }
  function zoneColorClass(zone){ return zone === 'innenraum' ? 'zone-color-innenraum' : zone === 'aussenhaut' ? 'zone-color-aussenhaut' : 'zone-color-perimeter'; }

  function ensureEntityPositions(){
    const byZone = { perimeter: [], aussenhaut: [], innenraum: [] };
    const entities = getEntities().filter(e => e.zone !== 'pool');
    for (const e of entities) if (byZone[e.zone]) byZone[e.zone].push(e);
    for (const zone of ['perimeter', 'aussenhaut', 'innenraum']) {
      const list = byZone[zone];
      const missing = list.filter(e => !e.hasPos);
      const n = missing.length;
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2;
        const ring = zone === 'innenraum' ? 20 : zone === 'aussenhaut' ? 28 : 36;
        const x = 50 + Math.cos(angle) * ring;
        const y = 50 + Math.sin(angle) * ring;
        setEntity(missing[i].kind, missing[i].idx, { posX: Math.max(4, Math.min(96, x)), posY: Math.max(4, Math.min(96, y)) });
      }
    }
  }

  function getRulesMap(){ try { return JSON.parse(state.config.rulesJson || '{}'); } catch { return {}; } }
  function setRulesMap(m){ state.config.rulesJson = JSON.stringify(m); }
  function entityRuleId(e){ return `${e.kind}:${e.entityKey}`; }
  function defaultsRule(){ return { enabled:true, onlyArmed:true, onlyNight:false, sirene:false, snapshot:true, telegram:true }; }
  function readRuleForm(){ return { enabled: document.getElementById('ruleEnabled').value==='true', onlyArmed: document.getElementById('ruleOnlyArmed').value==='true', onlyNight: document.getElementById('ruleOnlyNight').value==='true', sirene: document.getElementById('ruleSirene').value==='true', snapshot: document.getElementById('ruleSnapshot').value==='true', telegram: document.getElementById('ruleTelegram').value==='true' }; }
  function writeRuleForm(rule){ const r={...defaultsRule(), ...(rule||{})}; document.getElementById('ruleEnabled').value=String(r.enabled); document.getElementById('ruleOnlyArmed').value=String(r.onlyArmed); document.getElementById('ruleOnlyNight').value=String(r.onlyNight); document.getElementById('ruleSirene').value=String(r.sirene); document.getElementById('ruleSnapshot').value=String(r.snapshot); document.getElementById('ruleTelegram').value=String(r.telegram); }
  function writeSelectedZone(zone){ const el = document.getElementById('ruleZone'); if (el) el.value = zone || 'perimeter'; }
  function readSelectedZone(){ const el = document.getElementById('ruleZone'); return el ? el.value : 'perimeter'; }

  function selectEntity(e){
    state.selectedEntity = e;
    selectedEntityLabel.textContent = `Ausgewählt: ${e.label} (${e.zone})`;
    const map = getRulesMap();
    writeRuleForm(map[entityRuleId(e)]);
    writeSelectedZone(e.zone);
    entitySettingsModal.classList.remove('hidden');
  }

  function addZones(canvas){ canvas.innerHTML=''; ['perimeter','aussenhaut','innenraum'].forEach(z=>{ const d=document.createElement('div'); d.className=`zone ${z}`; d.dataset.zone=z; d.innerHTML=`<span>${z}</span>`; canvas.appendChild(d); }); }
  function drawEntity(canvas,e,detailed){
    const el=document.createElement('div');
    el.className=(detailed?'chip ':'dot ') + zoneColorClass(e.zone);
    el.title=e.label;
    el.draggable=true;
    el.dataset.kind=e.kind;
    el.dataset.idx=String(e.idx);
    if(detailed) el.textContent=e.label;
    el.style.left=`${Math.max(2,Math.min(98,Number(e.posX || 50)))}%`;
    el.style.top=`${Math.max(2,Math.min(98,Number(e.posY || 50)))}%`;
    el.addEventListener('dragstart',ev=>ev.dataTransfer.setData('text/plain',JSON.stringify({kind:e.kind,idx:e.idx})));
    el.addEventListener('click', ev => { ev.stopPropagation(); selectEntity(e); });
    if(!detailed && miniHoverInfo){ el.addEventListener('mouseenter',()=>{ miniHoverInfo.textContent = `Hover: ${e.label} (${e.zone})`; }); el.addEventListener('mouseleave',()=>{ miniHoverInfo.textContent='Hover: -'; }); }
    const z=canvas.querySelector(`.zone.${e.zone}`);
    if(z) z.appendChild(el);
  }
  function renderCanvas(target,detailed){ addZones(target); getEntities().filter(e=>e.zone!=='pool').forEach(e=>drawEntity(target,e,detailed)); }
  function renderPool(){ poolList.innerHTML=''; getEntities().filter(e=>e.zone==='pool').forEach(e=>{ const item=document.createElement('div'); item.className='sensor-item'; item.innerHTML=`<span>${e.label}</span><span class="muted">pool</span>`; item.draggable=true; item.addEventListener('dragstart',ev=>ev.dataTransfer.setData('text/plain',JSON.stringify({kind:e.kind,idx:e.idx}))); item.addEventListener('click',()=>selectEntity(e)); poolList.appendChild(item); }); }
  function bindCanvasDrops(canvas){ canvas.addEventListener('dragover',e=>e.preventDefault()); canvas.addEventListener('drop',e=>{ e.preventDefault(); try{ const p=JSON.parse(e.dataTransfer.getData('text/plain')); const zoneEl=e.target.closest('.zone'); if(!zoneEl) return; const rect=zoneEl.getBoundingClientRect(); const x=((e.clientX-rect.left)/rect.width)*100; const y=((e.clientY-rect.top)/rect.height)*100; setEntity(p.kind,p.idx,{zone:zoneEl.dataset.zone,posX:Math.max(2,Math.min(98,x)),posY:Math.max(2,Math.min(98,y))}); renderAllCanvases(); }catch{ setStatus('Ungültiger Drag&Drop-Inhalt',true);} }); }
  function bindPoolDrop(){ const pool=document.getElementById('poolZone'); pool.addEventListener('dragover',e=>e.preventDefault()); pool.addEventListener('drop',e=>{ e.preventDefault(); try{ const p=JSON.parse(e.dataTransfer.getData('text/plain')); setEntity(p.kind,p.idx,{zone:'pool'}); renderAllCanvases(); }catch{ setStatus('Ungültiger Drag&Drop-Inhalt',true); } }); }
  function renderAllCanvases(){ ensureEntityPositions(); renderCanvas(miniCanvas,false); renderCanvas(fullCanvas,true); renderPool(); bindCanvasDrops(miniCanvas); bindCanvasDrops(fullCanvas); }

  function connectSocket(){ const s=window.socket||window.io?.connect?.(window.location.origin,{path:'/socket.io'}); if(!s) throw new Error('Kein Admin-Socket gefunden.'); state.socket=s; }
  function getObject(id){ return new Promise((res,rej)=>{ const cb=(a,b)=>{const o=b||a; if(o&&typeof o==='object'&&!o.error) res(o); else rej(new Error(`Objekt ${id} nicht gefunden`));}; if(typeof state.socket.getObject==='function') state.socket.getObject(id,cb); else state.socket.emit('getObject',id,cb);}); }
  function setObject(id,obj){ return new Promise((res,rej)=>{ const cb=r=>r&&r.error?rej(new Error(r.error)):res(); if(typeof state.socket.setObject==='function') state.socket.setObject(id,obj,cb); else state.socket.emit('setObject',id,obj,cb);}); }
  function setState(id,val){ return new Promise((res,rej)=>{ const stateObj={val,ack:false}; const cb=r=>r&&r.error?rej(new Error(r.error)):res(); if(typeof state.socket.setState==='function') state.socket.setState(id,stateObj,cb); else state.socket.emit('setState',id,stateObj,cb);}); }
  function getState(id){ return new Promise((res)=>{ const cb=(a,b)=>res(b||a||null); if(typeof state.socket.getState==='function') state.socket.getState(id,cb); else state.socket.emit('getState',id,cb); }); }

  async function loadStateIds(){
    return new Promise(resolve=>{
      const done = ids => { state.stateIds = Array.isArray(ids) ? ids : []; stateIdsDatalist.innerHTML = state.stateIds.slice(0,5000).map(id=>`<option value="${id}"></option>`).join(''); resolve(); };
      const parse = raw => { const data=(raw&&raw.rows)?raw:(Array.isArray(raw)?{rows:raw}:null); const ids=Object.keys((data&&data.rows)?data.rows.reduce((a,r)=>{ if(r&&r.id) a[r.id]=1; return a; },{}):{}); done(ids.sort()); };
      if (typeof state.socket.getObjectView === 'function') state.socket.getObjectView('system','state',{startkey:'',endkey:'\u9999'},(a,b)=>parse(b||a));
      else state.socket.emit('getObjectView','system','state',{startkey:'',endkey:'\u9999'},(a,b)=>parse(b||a));
    });
  }

  function openObjectBrowser(targetInput){ objectBrowserTargetInput = targetInput; objectBrowserModal.classList.remove('hidden'); objectSearch.value = targetInput.value || ''; renderObjectResults(); objectSearch.focus(); }
  function closeObjectBrowser(){ objectBrowserModal.classList.add('hidden'); objectBrowserTargetInput = null; }
  function renderObjectResults(){ const q=String(objectSearch.value||'').toLowerCase().trim(); if(q.length<2){ objectResults.innerHTML='<div class="muted">Bitte mindestens 2 Zeichen eingeben.</div>'; return; } const list=state.stateIds.filter(id=>id.toLowerCase().includes(q)).slice(0,300); objectResults.innerHTML=list.map(id=>`<div class="object-item" data-id="${id}">${id}</div>`).join('') || '<div class="muted">Keine Treffer</div>'; }

  function ensureProfiles(){ let p={}; try{ p=JSON.parse(state.instanceObj.native.configProfilesJson||'{}'); }catch{} if(!p||typeof p!=='object') p={}; if(!p['default.json']) p['default.json']=clone(state.instanceObj.native); state.profiles=p; const ac=String(state.instanceObj.native.activeConfigProfile||'default.json'); state.activeProfile=p[ac]?ac:'default.json'; }
  function rebuildProfileSelect(){ const names=Object.keys(state.profiles).sort(); profileSelect.innerHTML=names.map(n=>`<option value="${n}">${n}</option>`).join(''); profileSelect.value=state.activeProfile; }

  function renderFields(){
    globalFields.innerHTML=''; dpFields.innerHTML='';
    for(const [k,t] of globalSpec){ const w=document.createElement('label'); w.textContent=k; const i=document.createElement(t==='boolean'?'select':'input'); i.dataset.key=k; if(t==='number'){ i.type='number'; i.value=String(Number(state.config[k]??0)); } else { i.innerHTML='<option value="true">true</option><option value="false">false</option>'; i.value=state.config[k]===true?'true':'false'; } w.appendChild(i); globalFields.appendChild(w); }
    for(const k of dpSpec){ const w=document.createElement('label'); w.textContent=k; const wrap=document.createElement('span'); wrap.className='input-wrap'; const i=document.createElement('input'); i.type='text'; i.className='state-input'; i.setAttribute('list','stateIds'); i.dataset.key=k; i.value=String(state.config[k]||''); const b=document.createElement('button'); b.type='button'; b.className='icon-btn'; b.textContent='🔎'; b.addEventListener('click',()=>openObjectBrowser(i)); wrap.appendChild(i); wrap.appendChild(b); w.appendChild(wrap); dpFields.appendChild(w); }
  }

  function readFormIntoConfig(){ globalFields.querySelectorAll('[data-key]').forEach(el=>{ const k=el.dataset.key; const spec=globalSpec.find(x=>x[0]===k); if(!spec) return; state.config[k] = spec[1]==='number' ? Number(el.value||0) : el.value==='true'; }); dpFields.querySelectorAll('[data-key]').forEach(el=>{ state.config[el.dataset.key]=el.value||''; }); }

  function addNewEntity(){
    ensureTables();
    const kind=document.getElementById('newType').value;
    const key=(document.getElementById('newKey').value||'').trim();
    const label=(document.getElementById('newLabel').value||'').trim();
    const id=(document.getElementById('newId').value||'').trim();
    const active=(document.getElementById('newActive').value||'').trim();
    const mode=document.getElementById('newMode').value;
    const detect=(document.getElementById('newDetect').value||'').trim();
    if(!id){ setStatus('Datapoint ID ist Pflicht',true); addResult.textContent='Datapoint ID fehlt'; return; }
    const base={ key:key||id, label:label||key||id, id, zone:'pool' };
    if(kind==='personDetectionTable') state.config[kind].push({ ...base, mode, detectValue: mode==='string' ? (detect||'human detected') : '' });
    else state.config[kind].push({ ...base, activeValuesCsv: active || 'true' });
    renderAllCanvases(); addResult.textContent=`Hinzugefügt: ${base.label}`;
  }

  async function manualControl(which){
    const pulse = async id => { if(!id) return; await setState(id,true); setTimeout(()=>{ void setState(id,false); },400); };
    if(which==='armAlarm') await setState(state.config.armStateId,true);
    if(which==='disarmAlarm') await setState(state.config.armStateId,false);
    if(which==='armPerimeter') await setState(state.config.perimeterStateId,true);
    if(which==='disarmPerimeter') await setState(state.config.perimeterStateId,false);
    if(which==='armCameras'){ const ids=JSON.parse(state.config.cameraAlarmOnIdsJson||'[]'); for(const id of ids) await pulse(id); await pulse(state.config.cctvArmedId); }
    if(which==='disarmCameras'){ const ids=JSON.parse(state.config.cameraAlarmOffIdsJson||'[]'); for(const id of ids) await pulse(id); await pulse(state.config.cctvDisarmedId); }
    setStatus('Manuelle Aktion ausgeführt');
  }

  async function loadTriggerLogForDate(day){ if(!day) return; const base=`${state.instanceId}.diagnostics`; await setState(`${base}.triggerLogDate`, day); await new Promise(r=>setTimeout(r,200)); const st=await getState(`${base}.triggerLogText`); triggerLogView.textContent=st?.val?String(st.val):`Keine Trigger-Logs für ${day}`; }
  function paintChip(el, armed){
    if (!el) return;
    el.classList.remove('armed', 'disarmed');
    el.classList.add(armed ? 'armed' : 'disarmed');
  }
  async function refreshLiveStatus(){
    const p = `${state.instanceId}`;
    const mode = await getState(`${p}.runtime.mode`);
    const perDp = await getState(state.config.perimeterStateId || '');
    const allDp = await getState(state.config.armStateId || '');
    const zPer = await getState(`${p}.zones.perimeter.armed`);
    const zAus = await getState(`${p}.zones.aussenhaut.armed`);
    const zInn = await getState(`${p}.zones.innenraum.armed`);
    const cam = await getState(state.config.cctvArmedId || '');
    const perimeterArmed = perDp?.val === true || zPer?.val === true || zAus?.val === true;
    const allArmed = allDp?.val === true || mode?.val === 'armed' || zInn?.val === true;
    const innenArmed = allDp?.val === true || zInn?.val === true;
    const aussenhautArmed = perDp?.val === true || zAus?.val === true;
    const camerasArmed = cam?.val === true;
    liveMode.textContent = `Mode: ${mode?.val ?? '-'}`;
    livePerimeter.textContent = `Perimeter: ${perimeterArmed ? 'scharf' : 'unscharf'}`;
    liveAussenhaut.textContent = `Aussenhaut: ${aussenhautArmed ? 'scharf' : 'unscharf'}`;
    liveInnenraum.textContent = `Innenraum: ${innenArmed ? 'scharf' : 'unscharf'}`;
    liveCameras.textContent = `Kameras: ${camerasArmed ? 'scharf' : 'unscharf'}`;
    paintChip(livePerimeter, perimeterArmed);
    paintChip(liveAussenhaut, aussenhautArmed);
    paintChip(liveInnenraum, innenArmed);
    paintChip(liveCameras, camerasArmed);
    paintChip(liveMode, allArmed);
  }

  async function saveToInstance(){
    readFormIntoConfig();
    if (!state.profiles['default.json']) state.profiles['default.json']=clone(state.instanceObj.native);
    const obj=clone(state.instanceObj);
    obj.native={...obj.native, ...state.config};
    obj.native.activeConfigProfile=state.activeProfile;
    obj.native.configProfilesJson=JSON.stringify(state.profiles);
    await setObject(state.objectId,obj);
    state.instanceObj=obj;
    setStatus(`Gespeichert: ${state.objectId}`);
  }

  function loadProfile(){ const n=profileSelect.value; const p=state.profiles[n]; if(!p){ setStatus(`Profil nicht gefunden: ${n}`,true); return; } state.activeProfile=n; state.config=clone(p); renderAll(); setStatus(`Profil geladen: ${n}`); }
  function saveAsProfile(){ readFormIntoConfig(); const raw=document.getElementById('newProfileName').value; const b=String(raw||'').trim().replace(/[^a-zA-Z0-9_.-]/g,'_'); const n=b?(b.endsWith('.json')?b:`${b}.json`):''; if(!n){ setStatus('Bitte gültigen Profilnamen eingeben',true); return; } state.profiles[n]=clone(state.config); state.activeProfile=n; rebuildProfileSelect(); setStatus(`Profil gespeichert: ${n}`); }
  function deleteProfile(){ const n=profileSelect.value; if(n==='default.json'){ setStatus('default.json kann nicht gelöscht werden',true); return; } delete state.profiles[n]; state.activeProfile='default.json'; state.config=clone(state.profiles['default.json']); renderAll(); setStatus(`Profil gelöscht: ${n}`); }

  function renderAll(){ rebuildProfileSelect(); renderFields(); renderAllCanvases(); }

  async function reloadFromInstance(){
    let resolved=null;
    for(const c of buildObjectIdCandidates(rawInstance)){
      try { resolved=await getObject(c); state.objectId=c; state.instanceId=c.replace(/^system\.adapter\./,''); break; } catch {}
    }
    if(!resolved) throw new Error('Instanzobjekt nicht gefunden');
    state.instanceObj=resolved;
    ensureProfiles();
    state.config=clone(state.instanceObj.native);
    normalizeInitialZones();
    instanceLabel.textContent=`Instanz: ${state.instanceId}`;
    await loadStateIds();
    renderAll();
    const today=new Date().toISOString().slice(0,10);
    triggerLogDateInput.value=today;
    await loadTriggerLogForDate(today);
    setStatus('Aktuelle Instanzdaten geladen');
  }

  function bindModal(){ document.getElementById('openCanvasBtn').addEventListener('click',()=>{ modal.classList.remove('hidden'); renderCanvas(fullCanvas,true); bindCanvasDrops(fullCanvas); }); document.getElementById('closeCanvasBtn').addEventListener('click',()=>modal.classList.add('hidden')); }

  async function init(){
    connectSocket();
    bindPoolDrop();
    bindModal();
    await reloadFromInstance();
    await refreshLiveStatus();
    setInterval(() => { void refreshLiveStatus(); }, 2000);
    writeRuleForm(defaultsRule());

    document.getElementById('reloadBtn').addEventListener('click',()=>reloadFromInstance().catch(e=>setStatus(String(e),true)));
    document.getElementById('saveBtn').addEventListener('click',()=>saveToInstance().catch(e=>setStatus(String(e),true)));
    document.getElementById('loadProfileBtn').addEventListener('click',loadProfile);
    document.getElementById('saveProfileBtn').addEventListener('click',saveAsProfile);
    document.getElementById('deleteProfileBtn').addEventListener('click',deleteProfile);
    document.getElementById('addSensorBtn').addEventListener('click',addNewEntity);

    document.getElementById('browseNewIdBtn').addEventListener('click',()=>openObjectBrowser(document.getElementById('newId')));
    document.getElementById('closeBrowserBtn').addEventListener('click',closeObjectBrowser);
    document.getElementById('closeEntitySettingsBtn').addEventListener('click',()=>entitySettingsModal.classList.add('hidden'));
    objectSearch.addEventListener('input',renderObjectResults);
    objectResults.addEventListener('click',ev=>{ const item=ev.target.closest('.object-item'); if(!item||!objectBrowserTargetInput) return; objectBrowserTargetInput.value=item.dataset.id||''; closeObjectBrowser(); });

    document.getElementById('loadTriggerLogBtn').addEventListener('click',()=>loadTriggerLogForDate(triggerLogDateInput.value));

    document.getElementById('saveEntityRuleBtn').addEventListener('click',()=>{
      if(!state.selectedEntity){ setStatus('Bitte erst ein Element anklicken',true); return; }
      const zone = readSelectedZone();
      setEntity(state.selectedEntity.kind, state.selectedEntity.idx, { zone });
      const map=getRulesMap();
      map[entityRuleId(state.selectedEntity)] = readRuleForm();
      setRulesMap(map);
      renderAllCanvases();
      setStatus('Elementeinstellungen gespeichert');
    });
    document.getElementById('applyZoneRuleBtn').addEventListener('click',()=>{
      if(!state.selectedEntity){ setStatus('Bitte erst ein Element anklicken',true); return; }
      const zone = readSelectedZone();
      const rule = readRuleForm();
      const m=getRulesMap();
      getEntities().filter(x=>x.zone===state.selectedEntity.zone).forEach(x=>{ setEntity(x.kind,x.idx,{zone}); m[entityRuleId(x)]={...rule}; });
      setRulesMap(m);
      renderAllCanvases();
      setStatus(`Auf Zone angewendet: ${zone}`);
    });

    document.getElementById('armAlarmBtn').addEventListener('click',()=>manualControl('armAlarm').catch(e=>setStatus(String(e),true)));
    document.getElementById('disarmAlarmBtn').addEventListener('click',()=>manualControl('disarmAlarm').catch(e=>setStatus(String(e),true)));
    document.getElementById('armPerimeterBtn').addEventListener('click',()=>manualControl('armPerimeter').catch(e=>setStatus(String(e),true)));
    document.getElementById('disarmPerimeterBtn').addEventListener('click',()=>manualControl('disarmPerimeter').catch(e=>setStatus(String(e),true)));
    document.getElementById('armCamerasBtn').addEventListener('click',()=>manualControl('armCameras').catch(e=>setStatus(String(e),true)));
    document.getElementById('disarmCamerasBtn').addEventListener('click',()=>manualControl('disarmCameras').catch(e=>setStatus(String(e),true)));
  }

  init().catch(err=>setStatus(String(err),true));
})();
