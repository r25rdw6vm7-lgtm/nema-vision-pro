/* NEMA Drive Enhancements v1
 * Mobile driving UX, lawful voice guidance, off-route detection, heading,
 * telemetry freshness and deterministic demo/simulation helpers.
 * Safety: never recommends speeding or enforcement evasion.
 */
(function(){
  'use strict';
  const state={voiceEnabled:true,heading:null,lastInstruction:null,lastInstructionAt:0,offRoute:false,offRouteSince:0,telemetryFresh:false,simulation:false};
  const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rad=d=>d*Math.PI/180;
  function distanceM(a,b){
    if(!a||!b)return Infinity;
    const R=6371000, p=rad(1), dLat=(b.lat-a.lat)*p, dLon=(b.lon-a.lon)*p;
    const x=Math.sin(dLat/2)**2+Math.cos(a.lat*p)*Math.cos(b.lat*p)*Math.sin(dLon/2)**2;
    return 2*R*Math.asin(Math.sqrt(x));
  }
  function pointToSegmentM(p,a,b){
    if(!p||!a||!b)return Infinity;
    const lat0=rad(p.lat); const kx=111320*Math.cos(lat0), ky=110540;
    const px=p.lon*kx, py=p.lat*ky, ax=a.lon*kx, ay=a.lat*ky, bx=b.lon*kx, by=b.lat*ky;
    const dx=bx-ax,dy=by-ay, t=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1),0,1);
    return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));
  }
  function routeDistanceM(position,geometry){
    const coords=geometry?.coordinates||[]; if(coords.length<2)return Infinity;
    let best=Infinity; for(let i=1;i<coords.length;i++)best=Math.min(best,pointToSegmentM(position,{lat:coords[i-1][1],lon:coords[i-1][0]},{lat:coords[i][1],lon:coords[i][0]}));
    return best;
  }
  function checkOffRoute(position,geometry,thresholdM=65){
    const d=routeDistanceM(position,geometry); const off=d>thresholdM;
    if(off&&!state.offRouteSince)state.offRouteSince=Date.now();
    if(!off)state.offRouteSince=0;
    state.offRoute=off; return {offRoute:off,distanceM:d,stable:off&&Date.now()-state.offRouteSince>=4000};
  }
  function speak(text,force){
    if(!state.voiceEnabled||typeof speechSynthesis==='undefined'||!text)return false;
    const now=Date.now(); if(!force&&text===state.lastInstruction&&now-state.lastInstructionAt<7000)return false;
    speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='tr-TR';u.rate=.98;u.pitch=1; speechSynthesis.speak(u);
    state.lastInstruction=text;state.lastInstructionAt=now;return true;
  }
  function instructionForStep(step,distanceM){
    if(!step)return null;
    const m=step.maneuver||{}; const modifier=m.modifier||'';
    const dist=distanceM<100?Math.round(distanceM/10)*10:Math.round(distanceM/50)*50;
    let action='devam edin';
    if(m.type==='turn')action=modifier==='left'?'sola dönün':modifier==='right'?'sağa dönün':modifier==='slight left'?'hafif sola dönün':modifier==='slight right'?'hafif sağa dönün':'dönün';
    else if(m.type==='roundabout')action='döner kavşağa girin';
    else if(m.type==='arrive')action='hedefe ulaştınız';
    return m.type==='arrive'?action:`${dist} metre sonra ${action}`;
  }
  function updateVoice(step,distanceM){return speak(instructionForStep(step,distanceM),false);}
  function bearing(a,b){
    const y=Math.sin(rad(b.lon-a.lon))*Math.cos(rad(b.lat));
    const x=Math.cos(rad(a.lat))*Math.sin(rad(b.lat))-Math.sin(rad(a.lat))*Math.cos(rad(b.lat))*Math.cos(rad(b.lon-a.lon));
    return (Math.atan2(y,x)*180/Math.PI+360)%360;
  }
  function setHeading(deg){state.heading=((num(deg,0)%360)+360)%360; if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('nema:heading',{detail:state.heading}));return state.heading;}
  function telemetry(packet){
    const t=num(packet?.timestamp,Date.now()); state.telemetryFresh=Date.now()-t<3500; return state.telemetryFresh;
  }
  function demoSignals(){
    state.simulation=true;
    const now=Math.floor(Date.now()/1000);
    const signals=[
      {id:'demo-1',distanceM:350,phase:'red',remainingSec:12,greenDurationSec:30,cycleSec:90,speedLimitKmh:50,source:'DEMO',confidence:'demo'},
      {id:'demo-2',distanceM:1050,phase:'green',remainingSec:22,greenDurationSec:30,cycleSec:90,speedLimitKmh:50,source:'DEMO',confidence:'demo'},
      {id:'demo-3',distanceM:1800,phase:'red',remainingSec:31,greenDurationSec:25,cycleSec:80,speedLimitKmh:50,source:'DEMO',confidence:'demo'}
    ];
    signals.forEach(s=>s.demoTick=now); return signals;
  }
  function stopSimulation(){state.simulation=false;return true;}
  function enableVoice(enabled){state.voiceEnabled=!!enabled;if(!enabled&&typeof speechSynthesis!=='undefined')speechSynthesis.cancel();return state.voiceEnabled;}
  window.NEMADriveEnhancements={state,distanceM,routeDistanceM,checkOffRoute,speak,instructionForStep,updateVoice,bearing,setHeading,telemetry,demoSignals,stopSimulation,enableVoice};

  function installMobileTools(){
    if(typeof document==='undefined'||document.getElementById('nema-enhancements'))return;
    const style=document.createElement('style'); style.id='nema-enhancement-style'; style.textContent=`#nema-enhancements{margin-top:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:7px}#nema-enhancements button{border:1px solid #ffffff22;background:#172033;color:#fff;border-radius:12px;padding:10px 6px;font-weight:800;font-size:11px}#nema-enhancements button.active{background:#166534}#nema-route-state{margin-top:8px;font-size:11px;color:#aeb8c8}#nema-sim{grid-column:span 3}`;document.head.appendChild(style);
    const host=document.querySelector('.vehicle'); if(!host||!host.parentNode)return;
    const box=document.createElement('div');box.id='nema-enhancements';
    box.innerHTML='<button id="nema-voice" class="active">Sesli yönlendirme</button><button id="nema-demo">Işık testi</button><button id="nema-heading">Yön sensörü</button><div id="nema-route-state">Navigasyon güvenlik motoru hazır</div>';
    host.parentNode.insertBefore(box,document.getElementById('warning'));
    document.getElementById('nema-voice').onclick=()=>{enableVoice(!state.voiceEnabled);document.getElementById('nema-voice').classList.toggle('active',state.voiceEnabled);};
    document.getElementById('nema-demo').onclick=()=>{const signals=demoSignals();window.NEMAUpdateTrafficSignals?.(signals);document.getElementById('nema-route-state').textContent='DEMO: 3 trafik ışığı yüklendi. Canlı veri değildir.';};
    document.getElementById('nema-heading').onclick=()=>{if(typeof DeviceOrientationEvent==='undefined'){document.getElementById('nema-route-state').textContent='Yön sensörü bu cihazda kullanılamıyor.';return;} const h=e=>{if(e.alpha!=null)setHeading(e.alpha);};window.addEventListener('deviceorientation',h,{passive:true});document.getElementById('nema-route-state').textContent='Yön sensörü aktif';};
  }
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installMobileTools);else installMobileTools();}
})();
