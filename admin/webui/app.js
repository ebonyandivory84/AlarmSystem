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
  const stateIdsDatalist = document.getElementById('stateIds');
  const objectSearch = document.getElementById('objectSearch');
  const objectResults = document.getElementById('objectResults');
  const addResult = document.getElementById('addResult');
  const miniHoverInfo = document.getElementById('miniHoverInfo');
  const selectedEntityLabel = document.getElementById('selectedEntityLabel');

  const state = { socket: null, instanceObj: null, config: null, profiles: {}, activeProfile: 'default.json', instanceId: 'alarmsystem.0', objectId: 'system.adapter.alarmsystem.0', stateIds: [], selectedEntity: null };
  let objectBrowserTargetInput = null;
  const globalSpec = [['defaultEntryDelaySec','number','Standard Entry-Delay je Zone in Sekunden.'],['defaultExitDelaySec','number','Standard Exit-Delay je Zone in Sekunden.'],['eventDedupeMs','number','Unterdrückt doppelte Trigger innerhalb dieses Zeitfensters.'],['heartbeatTimeoutSec','number','Nach dieser Zeit ohne Update wird Sabotage/Offline gemeldet.'],['snapshotSendDelayMs','number','Wartezeit vor Snapshot-Versand nach Trigger.'],['snapshotBurstCount','number','Anzahl Snapshot-Bilder pro Trigger.'],['snapshotBurstIntervalMs','number','Abstand zwischen Burst-Bildern.'],['autoArmDelaySec','number','Verzögerung vor automatischem Scharfschalten.'],['bedtimeHour','number','Stunde für Bedtime-Logik.'],['bedtimeLightThreshold','number','Lux-Schwelle für Bedtime-Logik.'],['simulationMode','boolean','Keine realen Aktorschaltungen, nur Logeinträge.'],['cameraNightModeEnabled','boolean','Aktiviert Night-Mode-Zeitraum (Dusk bis SunriseEnd).'],['cameraNightModeArmsCameras','boolean','Erlaubt Kamera-Trigger im Night-Mode auch bei unscharfen Zonen.']];
  const dpSpec = [
    ['armStateId','DP für Haupt-Scharfzustand der Alarmanlage.'],['perimeterStateId','DP für Scharfzustand Perimeter-Schutz.'],['triggerStateId','DP für Trigger-/Alarmtext.'],['sirenStateId','DP für Sirene Ein/Aus.'],['displayId','DP für Displayausgabe AlarmCenter.'],['clearDisplayId','DP zum Löschen des Displays.'],['buzzerId','DP für Buzzer/Signalton.'],['ledRedId','DP für roten LED-Ring.'],['ledYellowId','DP für gelben LED-Ring.'],['standbyId','DP für Standby-Modus.'],['motionSensorId','DP des Bewegungssensors am Panel.'],['panicStateId','DP für Panic-Auslösung.'],['fingerprintStateId','DP für Fingerprint-Ereignistext.'],['pinStateId','DP für PIN-Eingabe.'],['statusId','DP für generellen AlarmCenter-Status.']
  ];

  const setStatus=(m,e=false)=>{statusBox.textContent=m;statusBox.classList.toggle('err',e);};
  const clone=v=>JSON.parse(JSON.stringify(v));
  const normalizeInstanceId=v=>{let out=String(v||'').trim(); if(out.startsWith('system.adapter.')) out=out.slice(15); if(out.startsWith('iobroker.')) out=out.slice(9); if(!out.includes('.')) out+='.0'; return out;};
  const buildObjectIdCandidates=raw=>[...new Set([`system.adapter.${normalizeInstanceId(raw)}`,`system.adapter.${raw}`])];

  function connectSocket(){ const s=window.socket||window.io?.connect?.(window.location.origin,{path:'/socket.io'}); if(!s) throw new Error('Kein Admin-Socket gefunden.'); state.socket=s; }
  function getObject(id){ return new Promise((res,rej)=>{ const cb=(a,b)=>{const o=b||a; if(o&&typeof o==='object'&&!o.error) res(o); else rej(new Error(`Objekt ${id} nicht gefunden`));}; if(typeof state.socket.getObject==='function') state.socket.getObject(id,cb); else state.socket.emit('getObject',id,cb);}); }
  function setObject(id,obj){ return new Promise((res,rej)=>{ const cb=r=>r&&r.error?rej(new Error(r.error)):res(); if(typeof state.socket.setObject==='function') state.socket.setObject(id,obj,cb); else state.socket.emit('setObject',id,obj,cb);}); }
  function setState(id,val){ return new Promise((res,rej)=>{ const stateObj={val,ack:false}; const cb=r=>r&&r.error?rej(new Error(r.error)):res(); if(typeof state.socket.setState==='function') state.socket.setState(id,stateObj,cb); else state.socket.emit('setState',id,stateObj,cb);}); }
  async function pulseState(id){ if(!id) return; await setState(id,true); setTimeout(()=>{ void setState(id,false); },400); }

  async function loadStateIds(){
    return new Promise(resolve=>{
      const finish = ids => {
        state.stateIds = Array.isArray(ids) ? ids : [];
        stateIdsDatalist.innerHTML = state.stateIds.slice(0, 5000).map(id => `<option value="${id}"></option>`).join('');
        resolve();
      };
      const parseRows = raw => {
        const data = (raw && raw.rows) ? raw : (Array.isArray(raw) ? { rows: raw } : null);
        const ids = Object.keys((data && data.rows) ? data.rows.reduce((a, r) => { if (r && r.id) a[r.id] = 1; return a; }, {}) : {});
        finish(ids.sort());
      };
      if (typeof state.socket.getObjectView === 'function') {
        state.socket.getObjectView('system', 'state', { startkey: '', endkey: '\u9999' }, (a, b) => parseRows(b || a));
      } else if (typeof state.socket.emit === 'function') {
        state.socket.emit('getObjectView', 'system', 'state', { startkey: '', endkey: '\u9999' }, (a, b) => parseRows(b || a));
      } else {
        finish([]);
      }
    });
  }

  function openObjectBrowser(targetInput){
    objectBrowserTargetInput = targetInput;
    objectBrowserModal.classList.remove('hidden');
    objectSearch.value = targetInput.value || '';
    renderObjectResults();
    objectSearch.focus();
  }

  function closeObjectBrowser(){
    objectBrowserModal.classList.add('hidden');
    objectBrowserTargetInput = null;
  }

  function renderObjectResults(){
    const q = String(objectSearch.value || '').toLowerCase().trim();
    if (q.length < 2) {
      objectResults.innerHTML = '<div class="muted">Bitte mindestens 2 Zeichen eingeben.</div>';
      return;
    }
    const list = state.stateIds.filter(id => id.toLowerCase().includes(q)).slice(0, 300);
    objectResults.innerHTML = list.map(id => `<div class="object-item" data-id="${id}">${id}</div>`).join('') || '<div class="muted">Keine Treffer</div>';
  }

  function ensureProfiles(){ let p={}; try{p=JSON.parse(state.instanceObj.native.configProfilesJson||'{}');}catch{} if(!p||typeof p!=='object') p={}; if(!p['default.json']) p['default.json']=clone(state.instanceObj.native); state.profiles=p; const ac=String(state.instanceObj.native.activeConfigProfile||'default.json'); state.activeProfile=p[ac]?ac:'default.json'; }
  function rebuildProfileSelect(){ const names=Object.keys(state.profiles).sort(); profileSelect.innerHTML=names.map(n=>`<option value="${n}">${n}</option>`).join(''); profileSelect.value=state.activeProfile; }

  function renderFields(){ globalFields.innerHTML=''; dpFields.innerHTML='';
    for(const [k,t,help] of globalSpec){ const w=document.createElement('label'); w.textContent=k; w.title=help; const i=document.createElement(t==='boolean'?'select':'input'); i.dataset.key=k; i.title=help; if(t==='number'){i.type='number'; i.value=String(Number(state.config[k]??0));} else {i.innerHTML='<option value="true">true</option><option value="false">false</option>'; i.value=state.config[k]===true?'true':'false';} w.appendChild(i); globalFields.appendChild(w); }
    for(const [k,help] of dpSpec){
      const w=document.createElement('label');
      w.textContent=k;
      w.title=help;
      const wrap=document.createElement('span');
      wrap.className='input-wrap';
      const i=document.createElement('input');
      i.type='text';
      i.className='state-input';
      i.setAttribute('list','stateIds');
      i.dataset.key=k;
      i.title=help;
      i.value=String(state.config[k]||'');
      const b=document.createElement('button');
      b.type='button';
      b.className='icon-btn';
      b.title='Objektbrowser öffnen';
      b.textContent='🔎';
      b.addEventListener('click',()=>openObjectBrowser(i));
      wrap.appendChild(i);
      wrap.appendChild(b);
      w.appendChild(wrap);
      dpFields.appendChild(w);
    }
  }

  function ensureTables(){ ['pirSensorsTable','contactSensorsTable','presenceSensorsTable','personDetectionTable'].forEach(k=>{ if(!Array.isArray(state.config[k])) state.config[k]=[]; }); }
  function normalizeSemanticZones(){
    ensureTables();
    for (const row of state.config.contactSensorsTable) {
      if (row && row.id) row.zone = 'aussenhaut';
    }
    for (const row of state.config.personDetectionTable) {
      if (row && row.id) row.zone = 'perimeter';
    }
  }
  function getEntities(){ ensureTables(); const rows=[]; const add=(arr,kind)=>arr.forEach((r,idx)=>{ if(!r||!r.id) return; rows.push({ kind, idx, entityKey: String(r.key||r.id), label:String(r.label||r.key||r.id), zone:String(r.zone||'pool'), hasPos: Number.isFinite(Number(r.posX)) && Number.isFinite(Number(r.posY)), posX: Number.isFinite(Number(r.posX))?Number(r.posX):null, posY: Number.isFinite(Number(r.posY))?Number(r.posY):null }); }); add(state.config.pirSensorsTable,'pirSensorsTable'); add(state.config.contactSensorsTable,'contactSensorsTable'); add(state.config.presenceSensorsTable,'presenceSensorsTable'); add(state.config.personDetectionTable,'personDetectionTable'); return rows; }
  function setEntity(kind, idx, patch){ if(!Array.isArray(state.config[kind])||!state.config[kind][idx]) return; Object.assign(state.config[kind][idx], patch); }
  function zoneColorClass(zone){ return zone === 'innenraum' ? 'zone-color-innenraum' : zone === 'aussenhaut' ? 'zone-color-aussenhaut' : 'zone-color-perimeter'; }

  function ensureEntityPositions(){
    const byZone = { perimeter: [], aussenhaut: [], innenraum: [] };
    const entities = getEntities().filter(e => e.zone !== 'pool');
    for (const e of entities) if (byZone[e.zone]) byZone[e.zone].push(e);
    for (const zone of ['perimeter', 'aussenhaut', 'innenraum']) {
      const list = byZone[zone];
      const missing = list.filter(e => !e.hasPos);
      const n = missing.length;
      if (n === 0) continue;
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2;
        const ring = zone === 'innenraum' ? 20 : zone === 'aussenhaut' ? 28 : 36;
        const x = 50 + Math.cos(angle) * ring;
        const y = 50 + Math.sin(angle) * ring;
        setEntity(missing[i].kind, missing[i].idx, { posX: Math.max(4, Math.min(96, x)), posY: Math.max(4, Math.min(96, y)) });
      }
    }
  }

  function addZones(canvas){ canvas.innerHTML=''; ['perimeter','aussenhaut','innenraum'].forEach(z=>{ const d=document.createElement('div'); d.className=`zone ${z}`; d.dataset.zone=z; d.innerHTML=`<span>${z}</span>`; canvas.appendChild(d); }); }
  function drawEntity(canvas,e,detailed){ const el=document.createElement('div'); el.className=(detailed?'chip ':'dot ') + zoneColorClass(e.zone); el.title=e.label; el.draggable=true; el.dataset.kind=e.kind; el.dataset.idx=String(e.idx); if(detailed) el.textContent=e.label; el.style.left=`${Math.max(2,Math.min(98,Number(e.posX || 50)))}%`; el.style.top=`${Math.max(2,Math.min(98,Number(e.posY || 50)))}%`; el.addEventListener('dragstart',ev=>ev.dataTransfer.setData('text/plain',JSON.stringify({kind:e.kind,idx:e.idx}))); el.addEventListener('click', ev => { ev.stopPropagation(); selectEntity(e); }); if(!detailed && miniHoverInfo){ el.addEventListener('mouseenter',()=>{ miniHoverInfo.textContent = `Hover: ${e.label} (${e.zone})`; }); el.addEventListener('mouseleave',()=>{ miniHoverInfo.textContent = 'Hover: -'; }); } const z=canvas.querySelector(`.zone.${e.zone}`); if(z) z.appendChild(el); }
  function renderCanvas(target,detailed){ addZones(target); getEntities().filter(e=>e.zone!=='pool').forEach(e=>drawEntity(target,e,detailed)); }
  function renderPool(){ poolList.innerHTML=''; getEntities().filter(e=>e.zone==='pool').forEach(e=>{ const item=document.createElement('div'); item.className='sensor-item'; item.innerHTML=`<span>${e.label}</span><span class="muted">pool</span>`; item.draggable=true; item.addEventListener('dragstart',ev=>ev.dataTransfer.setData('text/plain',JSON.stringify({kind:e.kind,idx:e.idx}))); poolList.appendChild(item); }); }
  function bindCanvasDrops(canvas){ canvas.addEventListener('dragover',e=>e.preventDefault()); canvas.addEventListener('drop',e=>{ e.preventDefault(); try{ const p=JSON.parse(e.dataTransfer.getData('text/plain')); const zoneEl=e.target.closest('.zone'); if(!zoneEl) return; const rect=zoneEl.getBoundingClientRect(); const x=((e.clientX-rect.left)/rect.width)*100; const y=((e.clientY-rect.top)/rect.height)*100; setEntity(p.kind,p.idx,{zone:zoneEl.dataset.zone,posX:Math.max(2,Math.min(98,x)),posY:Math.max(2,Math.min(98,y))}); renderAllCanvases(); }catch{ setStatus('Ungültiger Drag&Drop-Inhalt',true);} }); }
  function renderAllCanvases(){ ensureEntityPositions(); renderCanvas(miniCanvas,false); renderCanvas(fullCanvas,true); renderPool(); bindCanvasDrops(miniCanvas); bindCanvasDrops(fullCanvas); }
  function bindPoolDrop(){ const pool=document.getElementById('poolZone'); pool.addEventListener('dragover',e=>e.preventDefault()); pool.addEventListener('drop',e=>{e.preventDefault(); try{const p=JSON.parse(e.dataTransfer.getData('text/plain')); setEntity(p.kind,p.idx,{zone:'pool'}); renderAllCanvases();}catch{setStatus('Ungültiger Drag&Drop-Inhalt',true);}}); }

  function addNewEntity(){ ensureTables(); const kind=document.getElementById('newType').value; const key=(document.getElementById('newKey').value||'').trim(); const label=(document.getElementById('newLabel').value||'').trim(); const id=(document.getElementById('newId').value||'').trim(); const active=(document.getElementById('newActive').value||'').trim(); const mode=document.getElementById('newMode').value; const detect=(document.getElementById('newDetect').value||'').trim(); if(!id){setStatus('Datapoint ID ist Pflicht',true); if(addResult) addResult.textContent='Datapoint ID fehlt'; return;} const base={key:key||id,label:label||key||id,id,zone:'pool'}; if(kind==='personDetectionTable') state.config[kind].push({...base,mode,detectValue:mode==='string'?(detect||'human detected'):''}); else state.config[kind].push({...base,activeValuesCsv:active||'true'}); renderAllCanvases(); setStatus('Element hinzugefügt'); if(addResult) addResult.textContent=`Hinzugefügt: ${base.label}`; }

  async function manualControl(which){
    try {
      if (which === 'armAlarm') await setState(state.config.armStateId, true);
      if (which === 'disarmAlarm') await setState(state.config.armStateId, false);
      if (which === 'armPerimeter') await setState(state.config.perimeterStateId, true);
      if (which === 'disarmPerimeter') await setState(state.config.perimeterStateId, false);
      if (which === 'armCameras') {
        const ids = JSON.parse(state.config.cameraAlarmOnIdsJson || '[]');
        for (const id of ids) await pulseState(id);
        await pulseState(state.config.cctvArmedId);
      }
      if (which === 'disarmCameras') {
        const ids = JSON.parse(state.config.cameraAlarmOffIdsJson || '[]');
        for (const id of ids) await pulseState(id);
        await pulseState(state.config.cctvDisarmedId);
      }
      setStatus('Manuelle Aktion ausgeführt');
    } catch (e) {
      setStatus(`Manuelle Aktion fehlgeschlagen: ${String(e)}`, true);
    }
  }

  function readFormIntoConfig(){ globalFields.querySelectorAll('[data-key]').forEach(el=>{const k=el.dataset.key; const s=globalSpec.find(x=>x[0]===k); if(!s)return; if(s[1]==='number') state.config[k]=Number(el.value||0); if(s[1]==='boolean') state.config[k]=el.value==='true';}); dpFields.querySelectorAll('[data-key]').forEach(el=>state.config[el.dataset.key]=el.value||''); }
  async function saveToInstance(){ readFormIntoConfig(); if(!state.profiles['default.json']) state.profiles['default.json']=clone(state.instanceObj.native); const obj=clone(state.instanceObj); obj.native={...obj.native,...state.config}; obj.native.activeConfigProfile=state.activeProfile; obj.native.configProfilesJson=JSON.stringify(state.profiles); await setObject(state.objectId,obj); state.instanceObj=obj; setStatus(`Gespeichert: ${state.objectId}`); }

  function loadProfile(){ const n=profileSelect.value; const p=state.profiles[n]; if(!p){setStatus(`Profil nicht gefunden: ${n}`,true);return;} state.activeProfile=n; state.config=clone(p); renderAll(); setStatus(`Profil geladen: ${n}`); }
  function saveAsProfile(){ readFormIntoConfig(); const raw=document.getElementById('newProfileName').value; const base=String(raw||'').trim().replace(/[^a-zA-Z0-9_.-]/g,'_'); const n=base?(base.endsWith('.json')?base:`${base}.json`):''; if(!n){setStatus('Bitte gültigen Profilnamen eingeben',true);return;} state.profiles[n]=clone(state.config); state.activeProfile=n; rebuildProfileSelect(); setStatus(`Profil gespeichert: ${n}`); }
  function deleteProfile(){ const n=profileSelect.value; if(n==='default.json'){setStatus('default.json kann nicht gelöscht werden',true);return;} delete state.profiles[n]; state.activeProfile='default.json'; state.config=clone(state.profiles['default.json']); renderAll(); setStatus(`Profil gelöscht: ${n}`); }

  async function reloadFromInstance(){ let resolved=null; const cands=buildObjectIdCandidates(rawInstance); for(const c of cands){ try{resolved=await getObject(c); state.objectId=c; state.instanceId=c.replace(/^system\.adapter\./,''); break;}catch{} } if(!resolved) throw new Error(`Objekt nicht gefunden. Geprüft: ${cands.join(', ')}`); state.instanceObj=resolved; ensureProfiles(); state.config=clone(state.instanceObj.native); normalizeSemanticZones(); instanceLabel.textContent=`Instanz: ${state.instanceId}`; await loadStateIds(); renderAll(); setStatus('Aktuelle Instanzdaten geladen'); }
  function renderAll(){ rebuildProfileSelect(); renderFields(); renderAllCanvases(); }

  function bindModal(){ document.getElementById('openCanvasBtn').addEventListener('click',()=>{ modal.classList.remove('hidden'); renderCanvas(fullCanvas,true); bindCanvasDrops(fullCanvas); }); document.getElementById('closeCanvasBtn').addEventListener('click',()=>modal.classList.add('hidden')); }

  async function init(){ connectSocket(); bindPoolDrop(); bindModal(); await reloadFromInstance(); writeRuleForm(currentRuleDefaults()); document.getElementById('reloadBtn').addEventListener('click',()=>reloadFromInstance().catch(e=>setStatus(String(e),true))); document.getElementById('saveBtn').addEventListener('click',()=>saveToInstance().catch(e=>setStatus(String(e),true))); document.getElementById('loadProfileBtn').addEventListener('click',loadProfile); document.getElementById('saveProfileBtn').addEventListener('click',saveAsProfile); document.getElementById('deleteProfileBtn').addEventListener('click',deleteProfile); document.getElementById('addSensorBtn').addEventListener('click',addNewEntity); document.getElementById('browseNewIdBtn').addEventListener('click',()=>openObjectBrowser(document.getElementById('newId'))); document.getElementById('closeBrowserBtn').addEventListener('click',closeObjectBrowser); objectSearch.addEventListener('input',renderObjectResults); objectResults.addEventListener('click',ev=>{ const item = ev.target.closest('.object-item'); if(!item || !objectBrowserTargetInput) return; objectBrowserTargetInput.value = item.dataset.id || ''; closeObjectBrowser(); }); document.getElementById('saveEntityRuleBtn').addEventListener('click',()=>{ if(!state.selectedEntity){ setStatus('Bitte erst ein Element anklicken',true); return; } const m=getRulesMap(); m[entityRuleId(state.selectedEntity)] = readRuleForm(); setRulesMap(m); setStatus('Regel für Element gespeichert'); }); document.getElementById('applyZoneRuleBtn').addEventListener('click',()=>{ if(!state.selectedEntity){ setStatus('Bitte erst ein Element anklicken',true); return; } const rule = readRuleForm(); const m=getRulesMap(); getEntities().filter(x=>x.zone===state.selectedEntity.zone).forEach(x=>{ m[entityRuleId(x)] = { ...rule }; }); setRulesMap(m); setStatus(`Regel auf Zone ${state.selectedEntity.zone} angewendet`); }); document.getElementById('armAlarmBtn').addEventListener('click',()=>manualControl('armAlarm')); document.getElementById('disarmAlarmBtn').addEventListener('click',()=>manualControl('disarmAlarm')); document.getElementById('armPerimeterBtn').addEventListener('click',()=>manualControl('armPerimeter')); document.getElementById('disarmPerimeterBtn').addEventListener('click',()=>manualControl('disarmPerimeter')); document.getElementById('armCamerasBtn').addEventListener('click',()=>manualControl('armCameras')); document.getElementById('disarmCamerasBtn').addEventListener('click',()=>manualControl('disarmCameras')); }
  init().catch(err=>setStatus(String(err),true));
})();
  function getRulesMap(){ try { return JSON.parse(state.config.rulesJson || '{}'); } catch { return {}; } }
  function setRulesMap(m){ state.config.rulesJson = JSON.stringify(m); }
  function entityRuleId(e){ return `${e.kind}:${e.entityKey}`; }
  function currentRuleDefaults(){ return { enabled: true, onlyArmed: true, onlyNight: false, sirene: false, snapshot: true, telegram: true }; }
  function readRuleForm(){ return { enabled: document.getElementById('ruleEnabled').value === 'true', onlyArmed: document.getElementById('ruleOnlyArmed').value === 'true', onlyNight: document.getElementById('ruleOnlyNight').value === 'true', sirene: document.getElementById('ruleSirene').value === 'true', snapshot: document.getElementById('ruleSnapshot').value === 'true', telegram: document.getElementById('ruleTelegram').value === 'true' }; }
  function writeRuleForm(rule){ const r = { ...currentRuleDefaults(), ...(rule || {}) }; document.getElementById('ruleEnabled').value = String(r.enabled); document.getElementById('ruleOnlyArmed').value = String(r.onlyArmed); document.getElementById('ruleOnlyNight').value = String(r.onlyNight); document.getElementById('ruleSirene').value = String(r.sirene); document.getElementById('ruleSnapshot').value = String(r.snapshot); document.getElementById('ruleTelegram').value = String(r.telegram); }
  function selectEntity(e){ state.selectedEntity = e; selectedEntityLabel.textContent = `Ausgewählt: ${e.label} (${e.zone})`; const map = getRulesMap(); writeRuleForm(map[entityRuleId(e)]); }
