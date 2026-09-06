/* NEMA Drive Platform Orchestrator v2
 * The platform core is the single decision layer. Real providers enter through NEMARealData.
 */
(function(){'use strict';
 const state={version:2,ready:false,lastDecision:null,updatedAt:0};
 const get=name=>typeof window!=='undefined'?window[name]:null;
 function snapshot(){return {
  predictive:!!get('NEMAPredictive'),spatial:!!get('NEMASpatial'),confidence:!!get('NEMAConfidence'),assistant:!!get('NEMAAssistant'),
  navigation:!!get('NEMANavigation'),advanced:!!get('NEMAAdvancedNavigation'),traffic:!!get('NEMATrafficLights'),poi:!!get('NEMAPOI'),ev:!!get('NEMAEVEngine'),
  vision:!!get('NEMAVision'),live:!!get('NEMALiveData'),realData:!!get('NEMARealData'),model:!!get('NEMANavigationModel'),native:!!get('NEMANativeBridge'),map:!!get('NEMAMapProvider')
 };}
 function ingest(input={}){
  const p=get('NEMAPredictive');if(p&&input.traffic)p.ingest(input.traffic);
  const c=get('NEMAConfidence');if(c&&input.confidence)c.ingest(input.confidence);
  const m=get('NEMANavigationModel');if(m)m.ingest(input);
  state.updatedAt=Date.now();state.ready=true;return decision();
 }
 function decision(){
  const p=get('NEMAPredictive'),c=get('NEMAConfidence'),m=get('NEMANavigationModel');
  const prediction=p?.state?.prediction||null;const confidence=c?.status?.()||null;
  const modelDecision=m?.decision?.()||null;
  let action=modelDecision?.action||'continue',reason='Birleşik çekirdek kararı';
  if(p){const d=p.decision();if(d.action==='reassess'||d.action==='consider-alternative'||d.action==='energy-stop-required'){action=d.action;reason=d.reason;}}
  state.lastDecision={action,reason,prediction,confidence,model:modelDecision,updatedAt:Date.now()};return state.lastDecision;
 }
 function health(){
  const modules=snapshot();const values=Object.values(modules);
  const real=get('NEMARealData')?.status?.()||null;
  const native=get('NEMANativeBridge')?.status?.()||null;
  const productionReady=!!(real&&native?.offlineReady&&real.providers?.traffic&&real.providers?.vision&&real.providers?.spatial3d);
  return {ready:values.filter(Boolean).length>=8,productionReady,modules,loaded:values.filter(Boolean).length,total:values.length,realData:real,lastDecision:state.lastDecision};
 }
 function command(text){const a=get('NEMAAssistant');if(!a)return {intent:'unknown',message:'NEMA AI katmanı henüz yüklenmedi.'};return a.parse(String(text||''));}
 window.NEMAPlatform={state,snapshot,ingest,decision,health,command};
})();
