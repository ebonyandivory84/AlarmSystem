(() => {
  const qs = new URLSearchParams(window.location.search);
  const rawInstance = qs.get('instance') || 'alarmsystem.0';

  const statusBox = document.getElementById('statusBox');
  const instanceLabel = document.getElementById('instanceLabel');
  const profileSelect = document.getElementById('profileSelect');
  const poolList = document.getElementById('poolList');
  const globalFields = document.getElementById('globalFields');
  const dpFields = document.getElementById('dpFields');

  const state = { socket: null, instanceObj: null, config: null, profiles: {}, activeProfile: 'default.json', instanceId: 'alarmsystem.0', objectId: 'system.adapter.alarmsystem.0' };
  const globalSpec = [['defaultEntryDelaySec','number'],['defaultExitDelaySec','number'],['eventDedupeMs','number'],['heartbeatTimeoutSec','number'],['snapshotSendDelayMs','number'],['snapshotBurstCount','number'],['snapshotBurstIntervalMs','number'],['autoArmDelaySec','number'],['bedtimeHour','number'],['bedtimeLightThreshold','number'],['simulationMode','boolean'],['cameraNightModeEnabled','boolean'],['cameraNightModeArmsCameras','boolean']];
  const dpSpec = ['armStateId','perimeterStateId','triggerStateId','sirenStateId','displayId','clearDisplayId','buzzerId','ledRedId','ledYellowId','standbyId','motionSensorId','panicStateId','fingerprintStateId','pinStateId','statusId'];

  const setStatus = (m,e=false)=>{statusBox.textContent=m;statusBox.classList.toggle('err',e);};
  const clone = v => JSON.parse(JSON.stringify(v));
  const normalizeInstanceId = v => { let out=String(v||'').trim(); if (out.startsWith('system.adapter.')) out=out.slice(15); if (out.startsWith('iobroker.')) out=out.slice(9); if (!out.includes('.')) out += '.0'; return out; };
  const buildObjectIdCandidates = raw => [...new Set([`system.adapter.${normalizeInstanceId(raw)}`,`system.adapter.${raw}`])];

  function connectSocket(){ const socket = window.socket || window.io?.connect?.(window.location.origin,{path:'/socket.io'}); if(!socket) throw new Error('Kein Admin-Socket gefunden.'); state.socket=socket; }
  function getObject(id){ return new Promise((res,rej)=>{ const cb=(a,b)=>{const o=b||a; if(o&&typeof o==='object'&&!o.error) res(o); else rej(new Error(`Objekt ${id} nicht gefunden`));}; if(typeof state.socket.getObject==='function') state.socket.getObject(id,cb); else state.socket.emit('getObject',id,cb);});}
  function setObject(id,obj){ return new Promise((res,rej)=>{ const cb=r=>r&&r.error?rej(new Error(r.error)):res(); if(typeof state.socket.setObject==='function') state.socket.setObject(id,obj,cb); else state.socket.emit('setObject',id,obj,cb);});}

  function ensureProfiles(){ let p={}; try{p=JSON.parse(state.instanceObj.native.configProfilesJson||'{}');}catch{} if(!p||typeof p!=='object') p={}; if(!p['default.json']) p['default.json']=clone(state.instanceObj.native); state.profiles=p; const ac=String(state.instanceObj.native.activeConfigProfile||'default.json'); state.activeProfile=p[ac]?ac:'default.json'; }
  function rebuildProfileSelect(){ const names=Object.keys(state.profiles).sort(); profileSelect.innerHTML=names.map(n=>`<option value="${n}">${n}</option>`).join(''); profileSelect.value=state.activeProfile; }

  function renderFields(){
    globalFields.innerHTML=''; dpFields.innerHTML='';
    for(const [k,t] of globalSpec){ const w=document.createElement('label'); w.textContent=k; const i=document.createElement(t==='boolean'?'select':'input'); i.dataset.key=k; if(t==='number'){i.type='number'; i.value=String(Number(state.config[k]??0));} else {i.innerHTML='<option value="true">true</option><option value="false">false</option>'; i.value=state.config[k]===true?'true':'false';} w.appendChild(i); globalFields.appendChild(w); }
    for(const k of dpSpec){ const w=document.createElement('label'); w.textContent=k; const i=document.createElement('input'); i.type='text'; i.dataset.key=k; i.value=String(state.config[k]||''); w.appendChild(i); dpFields.appendChild(w); }
  }

  function ensureTables(){ ['pirSensorsTable','contactSensorsTable','presenceSensorsTable','personDetectionTable'].forEach(k=>{ if(!Array.isArray(state.config[k])) state.config[k]=[];}); }
  function getEntities(){ ensureTables(); const rows=[]; const add=(arr,kind)=>arr.forEach((r,idx)=>{ if(!r||!r.id) return; rows.push({kind,idx,key:String(r.key||r.id),label:String(r.label||r.key||r.id),zone:String(r.zone||'pool')});}); add(state.config.pirSensorsTable,'pirSensorsTable'); add(state.config.contactSensorsTable,'contactSensorsTable'); add(state.config.presenceSensorsTable,'presenceSensorsTable'); add(state.config.personDetectionTable,'personDetectionTable'); return rows; }
  function zoneCenter(z){ if(z==='innenraum') return {x:50,y:50,r:17}; if(z==='aussenhaut') return {x:50,y:50,r:30}; return {x:50,y:50,r:44}; }

  function renderCanvas(){
    document.querySelectorAll('.chip').forEach(el=>el.remove());
    poolList.innerHTML='';
    getEntities().forEach((e,i)=>{
      const item=document.createElement('div'); item.className='sensor-item'; item.innerHTML=`<span>${e.label}</span><span class="muted">${e.zone}</span>`;
      const chip=document.createElement('div'); chip.className='chip'; chip.draggable=true; chip.dataset.kind=e.kind; chip.dataset.idx=String(e.idx); chip.textContent=e.label;
      chip.addEventListener('dragstart',ev=>ev.dataTransfer.setData('text/plain',JSON.stringify({kind:e.kind,idx:e.idx})));
      if(e.zone==='pool'){
        item.draggable=true;
        item.addEventListener('dragstart',ev=>ev.dataTransfer.setData('text/plain',JSON.stringify({kind:e.kind,idx:e.idx})));
        poolList.appendChild(item);
      } else {
        const z=document.querySelector(`.zone.${e.zone}`)||document.querySelector('.zone.perimeter'); const c=zoneCenter(e.zone); const a=(i*31)%360;
        chip.style.left=`${c.x+Math.cos((a*Math.PI)/180)*c.r}%`; chip.style.top=`${c.y+Math.sin((a*Math.PI)/180)*c.r}%`; z.appendChild(chip);
      }
    });
  }

  function applyZoneToEntity(kind,idx,zone){ if(!Array.isArray(state.config[kind])||!state.config[kind][idx]) return; state.config[kind][idx].zone=zone; }
  function bindDrops(){
    document.querySelectorAll('.zone').forEach(z=>{ z.addEventListener('dragover',e=>e.preventDefault()); z.addEventListener('drop',e=>{e.preventDefault(); try{const p=JSON.parse(e.dataTransfer.getData('text/plain')); applyZoneToEntity(p.kind,p.idx,z.dataset.zone); renderCanvas();}catch{setStatus('Ungültiger Drag&Drop-Inhalt',true);}});});
    const pool=document.getElementById('poolZone');
    pool.addEventListener('dragover',e=>e.preventDefault());
    pool.addEventListener('drop',e=>{e.preventDefault(); try{const p=JSON.parse(e.dataTransfer.getData('text/plain')); applyZoneToEntity(p.kind,p.idx,'pool'); renderCanvas();}catch{setStatus('Ungültiger Drag&Drop-Inhalt',true);}});
  }

  function addNewEntity(){
    ensureTables();
    const kind=document.getElementById('newType').value;
    const key=(document.getElementById('newKey').value||'').trim();
    const label=(document.getElementById('newLabel').value||'').trim();
    const id=(document.getElementById('newId').value||'').trim();
    const active=(document.getElementById('newActive').value||'').trim();
    const mode=document.getElementById('newMode').value;
    const detect=(document.getElementById('newDetect').value||'').trim();
    if(!id){ setStatus('Datapoint ID ist Pflicht',true); return; }
    const base={ key:key||id, label:label||key||id, id, zone:'pool' };
    if(kind==='personDetectionTable') state.config[kind].push({ ...base, mode, detectValue: mode==='string' ? (detect||'human detected') : '' });
    else state.config[kind].push({ ...base, activeValuesCsv: active || 'true' });
    renderCanvas(); setStatus('Element hinzugefügt');
  }

  function readFormIntoConfig(){ globalFields.querySelectorAll('[data-key]').forEach(el=>{const k=el.dataset.key; const s=globalSpec.find(x=>x[0]===k); if(!s)return; if(s[1]==='number') state.config[k]=Number(el.value||0); if(s[1]==='boolean') state.config[k]=el.value==='true';}); dpFields.querySelectorAll('[data-key]').forEach(el=>state.config[el.dataset.key]=el.value||''); }
  async function saveToInstance(){ readFormIntoConfig(); if(!state.profiles['default.json']) state.profiles['default.json']=clone(state.instanceObj.native); const obj=clone(state.instanceObj); obj.native={...obj.native,...state.config}; obj.native.activeConfigProfile=state.activeProfile; obj.native.configProfilesJson=JSON.stringify(state.profiles); await setObject(state.objectId,obj); state.instanceObj=obj; setStatus(`Gespeichert: ${state.objectId}`); }

  function loadProfile(){ const name=profileSelect.value; const p=state.profiles[name]; if(!p){setStatus(`Profil nicht gefunden: ${name}`,true); return;} state.activeProfile=name; state.config=clone(p); renderAll(); setStatus(`Profil geladen: ${name}`); }
  function saveAsProfile(){ readFormIntoConfig(); const raw=document.getElementById('newProfileName').value; const base=String(raw||'').trim().replace(/[^a-zA-Z0-9_.-]/g,'_'); const n=base? (base.endsWith('.json')?base:`${base}.json`) : ''; if(!n){setStatus('Bitte gültigen Profilnamen eingeben',true); return;} state.profiles[n]=clone(state.config); state.activeProfile=n; rebuildProfileSelect(); setStatus(`Profil gespeichert: ${n}`); }
  function deleteProfile(){ const n=profileSelect.value; if(n==='default.json'){setStatus('default.json kann nicht gelöscht werden',true); return;} delete state.profiles[n]; state.activeProfile='default.json'; state.config=clone(state.profiles['default.json']); renderAll(); setStatus(`Profil gelöscht: ${n}`); }

  async function reloadFromInstance(){ let resolved=null; const cands=buildObjectIdCandidates(rawInstance); for(const c of cands){ try{resolved=await getObject(c); state.objectId=c; state.instanceId=c.replace(/^system\.adapter\./,''); break;}catch{} } if(!resolved) throw new Error(`Objekt nicht gefunden. Geprüft: ${cands.join(', ')}`); state.instanceObj=resolved; ensureProfiles(); state.config=clone(state.instanceObj.native); instanceLabel.textContent=`Instanz: ${state.instanceId}`; renderAll(); setStatus('Aktuelle Instanzdaten geladen'); }
  function renderAll(){ rebuildProfileSelect(); renderFields(); renderCanvas(); }

  async function init(){ connectSocket(); bindDrops(); await reloadFromInstance(); document.getElementById('reloadBtn').addEventListener('click',()=>reloadFromInstance().catch(e=>setStatus(String(e),true))); document.getElementById('saveBtn').addEventListener('click',()=>saveToInstance().catch(e=>setStatus(String(e),true))); document.getElementById('loadProfileBtn').addEventListener('click',loadProfile); document.getElementById('saveProfileBtn').addEventListener('click',saveAsProfile); document.getElementById('deleteProfileBtn').addEventListener('click',deleteProfile); document.getElementById('addSensorBtn').addEventListener('click',addNewEntity); }
  init().catch(err=>setStatus(String(err),true));
})();
