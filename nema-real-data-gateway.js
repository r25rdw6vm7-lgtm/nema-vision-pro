/* NEMA Drive Real Data Gateway v1
 * Single ingress for real traffic, Vision, offline/native routing and 3D map data.
 * No demo/fake data is generated here. Providers must be explicitly registered.
 */
(function(){'use strict';
 const state={version:1,providers:{traffic:null,vision:null,offline:null,spatial3d:null,native:null},updatedAt:0,lastErrors:{}};
 const get=n=>typeof window!=='undefined'?window[n]:null;
 const now=()=>Date.now();
 const validPoint=p=>p&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon));
 function setError(layer,error){state.lastErrors[layer]={message:String(error?.message||error),updatedAt:now()};}
 function register(layer,name,adapter,meta={}){
  if(!['traffic','vision','offline','spatial3d','native'].includes(layer))throw new Error('Bilinmeyen gerçek veri katmanı.');
  if(!name||!adapter)throw new Error(`${layer} sağlayıcısı ve adaptörü gerekli.`);
  state.providers[layer]={name:String(name),adapter,meta:{...meta},registeredAt:now()};
  state.updatedAt=now();
  return status().providers[layer];
 }
 function registerTraffic(name,adapter,meta={}){
  if(typeof adapter.fetch!=='function')throw new Error('Traffic adapter.fetch gerekli.');
  const result=register('traffic',name,adapter,meta);
  const engine=get('NEMATrafficEngine');if(engine?.registerProvider)engine.registerProvider(name,adapter);
  return result;
 }
 function registerVision(name,adapter,meta={enabled:true}){
  if(typeof adapter.detect!=='function')throw new Error('Vision adapter.detect gerekli.');
  const result=register('vision',name,adapter,meta);
  const vision=get('NEMAVision');if(vision?.register)vision.register(name,adapter,{enabled:meta.enabled!==false});
  return result;
 }
 function registerNative(name,adapter,meta={}){
  if(typeof adapter.route!=='function')throw new Error('Native adapter.route gerekli.');
  const result=register('native',name,adapter,meta);
  const bridge=get('NEMANativeBridge');
  if(bridge?.register)bridge.register(meta.platform||name,adapter,{offlineRouting:meta.offlineRouting===true,offlineMaps:meta.offlineMaps===true,licensed:meta.licensed===true});
  return result;
 }
 function registerOffline(name,adapter,meta={}){
  if(typeof adapter.route!=='function')throw new Error('Offline adapter.route gerekli.');
  const result=register('offline',name,adapter,meta);
  const offline=get('NEMAOfflineRouting');if(offline?.register)offline.register(name,adapter);
  return result;
 }
 function register3D(name,adapter,meta={}){
  if(typeof adapter.render!=='function'&&typeof adapter.load!=='function')throw new Error('3D adapter.render veya adapter.load gerekli.');
  return register('spatial3d',name,adapter,meta);
 }
 async function updateTraffic(context={}){
  const p=state.providers.traffic;if(!p)return null;
  try{const raw=await p.adapter.fetch(context);const engine=get('NEMATrafficEngine');const normalized=engine?.normalize?engine.normalize(raw):raw;if(!normalized||normalized.live!==true)throw new Error('Gerçek trafik sağlayıcısı canlı veri döndürmedi.');if(engine?.ingest)engine.ingest(normalized);const model=get('NEMANavigationModel');if(model?.ingest)model.ingest({traffic:normalized,trafficConfidence:Number(normalized.confidence)||0});state.updatedAt=now();return normalized;}catch(error){setError('traffic',error);throw error;}
 }
 async function processVision(frame,context={}){
  const p=state.providers.vision;if(!p)throw new Error('Vision sağlayıcısı bağlı değil.');
  try{const vision=get('NEMAVision');const detections=vision?.process?await vision.process(frame,context):await p.adapter.detect(frame,context);const model=get('NEMANavigationModel');if(model?.ingest)model.ingest({vision:detections,visionConfidence:detections.length?Math.round(detections.reduce((s,x)=>s+Number(x.confidence||0),0)/detections.length*100):0});state.updatedAt=now();return detections;}catch(error){setError('vision',error);throw error;}
 }
 async function route(opts={}){
  if(!validPoint(opts.from)||!validPoint(opts.to))throw new Error('Gerçek veri ağ geçidi için geçerli from/to koordinatları gerekli.');
  const offline=opts.offline===true;
  const p=offline?state.providers.offline:state.providers.native;
  if(p){try{return await p.adapter.route(opts);}catch(error){setError(offline?'offline':'native',error);if(offline)throw error;}}
  const bridge=get('NEMANativeBridge');if(offline&&bridge?.route)return bridge.route(opts);
  const routeProvider=get('NEMARouteProvider');if(!offline&&routeProvider?.route)return routeProvider.route({...opts,offline:false});
  throw new Error(offline?'Gerçek offline routing sağlayıcısı bağlı değil.':'Gerçek native routing sağlayıcısı bağlı değil.');
 }
 async function render3D(context={}){
  const p=state.providers.spatial3d;if(!p)throw new Error('3D veri sağlayıcısı bağlı değil.');
  try{const result=typeof p.adapter.render==='function'?await p.adapter.render(context):await p.adapter.load(context);state.updatedAt=now();return result;}catch(error){setError('spatial3d',error);throw error;}
 }
 function sync(){
  const model=get('NEMANavigationModel');
  if(model?.ingest){const nav=get('NEMANavigation');model.ingest({route:nav?.state?.route||null,traffic:nav?.state?.traffic||null,gpsConfidence:nav?.state?.position?.accuracyM!=null?Math.max(0,100-Math.min(100,Number(nav.state.position.accuracyM))):null});}
  return status();
 }
 function status(){
  const providers={};Object.entries(state.providers).forEach(([k,v])=>{providers[k]=v?{name:v.name,meta:v.meta,registeredAt:v.registeredAt}:null;});
  const native=get('NEMANativeBridge')?.status?.()||null;
  const vision=get('NEMAVision')?.status?.()||null;
  const traffic=get('NEMATrafficEngine')?.status?.()||null;
  const map=get('NEMAMapProvider')?.status?.()||null;
  return {version:state.version,providers,traffic,vision,native,map,lastErrors:{...state.lastErrors},updatedAt:state.updatedAt};
 }
 window.NEMARealData={state,register,registerTraffic,registerVision,registerNative,registerOffline,register3D,updateTraffic,processVision,route,render3D,sync,status};
})();
