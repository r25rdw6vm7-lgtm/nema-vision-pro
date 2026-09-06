/* NEMA Drive Platform Orchestrator v1 */
(function(){'use strict';
 const state={version:1,ready:false,lastDecision:null,updatedAt:0};
 const get=(name)=>typeof window!=='undefined'?window[name]:null;
 const finite=v=>Number.isFinite(Number(v));
 function snapshot(){return {predictive:!!get('NEMAPredictive'),spatial:!!get('NEMASpatial'),confidence:!!get('NEMAConfidence'),assistant:!!get('NEMAAssistant'),navigation:!!get('NEMANavigation'),advanced:!!get('NEMAAdvancedNavigation'),traffic:!!get('NEMATrafficLights'),poi:!!get('NEMAPOI'),ev:!!get('NEMAEVEngine'),vision:!!get('NEMAVision'),live:!!get('NEMALiveData')};}
 function ingest(input={}){const p=get('NEMAPredictive');if(p&&input.traffic)p.ingest(input.traffic);const c=get('NEMAConfidence');if(c&&input.confidence)c.ingest(input.confidence);state.updatedAt=Date.now();state.ready=true;return decision();}
 function decision(){const p=get('NEMAPredictive'),c=get('NEMAConfidence');const prediction=p?.state?.prediction||null;const confidence=c?.status?.()||null;let action='continue',reason='Belirgin risk yok';if(p){const d=p.decision();action=d.action;reason=d.reason;}state.lastDecision={action,reason,prediction,confidence,updatedAt:Date.now()};return {...state.lastDecision};}
 function health(){const modules=snapshot();const values=Object.values(modules);return {ready:values.filter(Boolean).length>=6,modules,loaded:values.filter(Boolean).length,total:values.length,lastDecision:state.lastDecision};}
 function command(text){const a=get('NEMAAssistant');if(!a)return {intent:'unknown',message:'NEMA AI katmanı henüz yüklenmedi.'};return a.parse(String(text||''));}
 window.NEMAPlatform={state,snapshot,ingest,decision,health,command};
})();
