/* NEMA Drive Navigation - Traffic Intelligence Core v2
 * Multi-signal lawful Green Wave + vehicle/Bluetooth bridge.
 * Never recommends exceeding an applicable legal speed limit.
 */
(function(){
  'use strict';
  const state={signals:[],enabled:true,legalOnly:true,vehicle:{speedKmh:null,rpm:null,gear:null,batteryV:null,source:null,timestamp:null}};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
  const kmhToMs=k=>Math.max(0,k)/3.6;
  const msToKmh=v=>Math.max(0,v)*3.6;
  const arrivalAt=(distanceM,speedKmh)=>{const v=kmhToMs(speedKmh);return v>0?distanceM/v:Infinity;};

  function normalizeSignal(s){return {id:s.id||('signal-'+Math.random().toString(36).slice(2)),distanceM:Math.max(0,num(s.distanceM,0)),phase:s.phase||'unknown',remainingSec:num(s.remainingSec),greenDurationSec:Math.max(1,num(s.greenDurationSec,30)),cycleSec:Math.max(1,num(s.cycleSec,90)),speedLimitKmh:num(s.speedLimitKmh),confidence:s.confidence||'unknown',source:s.source||'unknown'};}
  function addSignal(s){if(!s||!Number.isFinite(Number(s.distanceM)))return false;state.signals.push(normalizeSignal(s));state.signals.sort((a,b)=>a.distanceM-b.distanceM);return true;}
  function setSignals(list){state.signals=(list||[]).filter(s=>Number.isFinite(Number(s.distanceM))).map(normalizeSignal).sort((a,b)=>a.distanceM-b.distanceM);return state.signals;}
  function clear(){state.signals.length=0;}

  function greenWindow(signal,legalLimitKmh){
    const s=normalizeSignal(signal); if(s.phase!=='red'||!Number.isFinite(s.remainingSec))return null;
    const limit=clamp(Math.min(num(legalLimitKmh,50),s.speedLimitKmh??num(legalLimitKmh,50)),5,160);
    const start=Math.max(.5,s.remainingSec),end=start+s.greenDurationSec;
    const minKmh=clamp(msToKmh(s.distanceM/end),5,limit),maxKmh=clamp(msToKmh(s.distanceM/start),5,limit);
    if(minKmh>maxKmh||arrivalAt(s.distanceM,limit)>end)return null;
    return {minKmh:Math.round(minKmh),maxKmh:Math.round(maxKmh),greenStartSec:s.remainingSec,greenEndSec:end};
  }

  function optimize(signals,currentSpeedKmh,defaultLimitKmh){
    const list=(signals||state.signals).map(normalizeSignal).filter(s=>s.distanceM>=0).sort((a,b)=>a.distanceM-b.distanceM);
    const limit=clamp(num(defaultLimitKmh,50),5,160); let low=5,high=limit; const analyzed=[];
    for(const s of list){const localLimit=clamp(Math.min(limit,s.speedLimitKmh??limit),5,160);
      if(s.phase==='green'){high=Math.min(high,localLimit);analyzed.push({...s,status:'green',window:null});continue;}
      const w=greenWindow(s,localLimit); analyzed.push({...s,status:w?'reachable':'wait',window:w});
      if(w){low=Math.max(low,w.minKmh);high=Math.min(high,w.maxKmh);}
    }
    const valid=low<=high; const current=num(currentSpeedKmh,0); const target=valid?Math.round(clamp(current>=low&&current<=high?current:(low+high)/2,5,high)):null;
    return {status:valid?'green-wave':'wait',speedWindowKmh:valid?[Math.round(low),Math.round(high)]:null,targetKmh:target,signals:analyzed,message:valid?`Rota boyunca yasal yeşil dalga: ${Math.round(low)}–${Math.round(high)} km/s`:'Tüm ışıkları aynı yasal hız aralığında yakalamak mümkün değil; hız artırmayın.'};
  }

  function next(currentSpeedKmh,legalLimitKmh){return optimize(state.signals,currentSpeedKmh,legalLimitKmh).signals[0]||null;}
  function recommend(distanceM,currentSpeedKmh,legalLimitKmh,signal){
    const s=normalizeSignal(signal);const limit=Math.max(5,num(legalLimitKmh,50));
    if(s.phase==='green')return {status:'green',message:`Yeşil ışık açık • ${Math.round(distanceM)} m`};
    if(s.phase==='red'&&Number.isFinite(s.remainingSec)){const w=greenWindow(s,limit);if(w){const target=Math.round(clamp((w.minKmh+w.maxKmh)/2,5,limit));return {status:'legal-green-window',targetKmh:target,rangeKmh:[w.minKmh,w.maxKmh],message:`Yeşile yasal hız aralığında ulaşılabilir: ${w.minKmh}–${w.maxKmh} km/s`};}return {status:'wait',message:'Yeşil dalga için hız artırma önerilmez. Güvenli ve yasal hızda devam edin.'};}
    return {status:'unknown',message:'Işık zamanlaması doğrulanamadı.'};
  }

  function ingestVehicle(packet){if(!packet)return null;state.vehicle={speedKmh:num(packet.speedKmh),rpm:num(packet.rpm),gear:packet.gear??null,batteryV:num(packet.batteryV),source:packet.source||'bluetooth',timestamp:Date.now()};if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('nema:vehicle-data',{detail:state.vehicle}));return state.vehicle;}
  function bluetoothSupported(){return typeof navigator!=='undefined'&&!!navigator.bluetooth;}
  async function connectBluetooth(){if(!bluetoothSupported())throw new Error('Web Bluetooth bu tarayıcıda kullanılamıyor. iOS üretim uygulamasında CoreBluetooth/native bridge gerekir.');const device=await navigator.bluetooth.requestDevice({acceptAllDevices:true});const server=await device.gatt.connect();state.bluetoothDevice=device;state.bluetoothServer=server;return {name:device.name||'Bluetooth cihazı',connected:true};}
  async function disconnectBluetooth(){if(state.bluetoothDevice?.gatt?.connected)state.bluetoothDevice.gatt.disconnect();state.bluetoothDevice=null;state.bluetoothServer=null;}

  window.NEMATrafficLights={state,addSignal,setSignals,clear,arrivalAt,greenWindow,recommend,next,optimize};
  window.NEMAGreenWave=window.NEMATrafficLights;
  window.NEMAVehicle={state,ingestVehicle,bluetoothSupported,connectBluetooth,disconnectBluetooth};
})();
