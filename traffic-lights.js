/* NEMA Drive Navigation - Traffic Light / Green Wave Engine
 * Safety rule: recommendations never exceed the configured legal speed limit.
 * Signal timing must come from a trusted live/official provider in production.
 */
(function(){
  'use strict';
  const state={signals:[],enabled:true,legalOnly:true};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const kmhToMs=k=>k/3.6;
  const msToKmh=v=>v*3.6;

  function addSignal(signal){
    if(!signal || !Number.isFinite(signal.distanceM)) return false;
    state.signals.push({
      id: signal.id || crypto.randomUUID(),
      distanceM: Math.max(0,signal.distanceM),
      phase: signal.phase || 'unknown',
      remainingSec: Number.isFinite(signal.remainingSec)?Math.max(0,signal.remainingSec):null,
      cycleSec: Number.isFinite(signal.cycleSec)?Math.max(1,signal.cycleSec):null,
      source: signal.source || 'unknown',
      confidence: signal.confidence || 'unknown',
      speedLimitKmh: Number.isFinite(signal.speedLimitKmh)?signal.speedLimitKmh:null
    });
    return true;
  }

  function clear(){state.signals.length=0;}

  function arrivalAt(distanceM,speedKmh){
    const v=kmhToMs(Math.max(1,speedKmh));
    return distanceM/v;
  }

  // Returns legal-speed windows that can arrive during a green phase.
  // The engine intentionally excludes speeds above the legal limit.
  function greenWindow(signal,currentSpeedKmh,legalLimitKmh){
    if(signal.phase!=='red' || !Number.isFinite(signal.remainingSec)) return null;
    if(!Number.isFinite(signal.distanceM)) return null;
    const maxKmh=clamp(Number.isFinite(signal.speedLimitKmh)?Math.min(legalLimitKmh,signal.speedLimitKmh):legalLimitKmh,5,160);
    const minKmh=5;
    const fastestArrival=arrivalAt(signal.distanceM,maxKmh);
    const slowestArrival=arrivalAt(signal.distanceM,minKmh);
    const greenStart=signal.remainingSec;
    const greenEnd=signal.remainingSec+(signal.greenDurationSec||30);
    if(fastestArrival>greenEnd || slowestArrival<greenStart) return null;
    const low=clamp(msToKmh(signal.distanceM/greenEnd),minKmh,maxKmh);
    const high=clamp(msToKmh(signal.distanceM/greenStart),minKmh,maxKmh);
    return {minKmh:Math.min(low,high),maxKmh:Math.max(low,high)};
  }

  function recommend(distanceM,currentSpeedKmh,legalLimitKmh,signal){
    const limit=Math.max(5,Number(legalLimitKmh)||50);
    if(!signal) return {status:'unknown',message:'Sinyal zaman verisi yok.'};
    if(signal.phase==='green') return {status:'green',message:`Yeşil ışık açık • ${Math.round(distanceM)} m`};
    if(signal.phase==='red' && Number.isFinite(signal.remainingSec)){
      const win=greenWindow(signal,currentSpeedKmh,limit);
      if(win){
        const target=clamp((win.minKmh+win.maxKmh)/2,5,limit);
        return {status:'legal-green-window',targetKmh:Math.round(target),rangeKmh:[Math.round(win.minKmh),Math.round(win.maxKmh)],message:`Yeşile yasal hız aralığında ulaşılabilir: ${Math.round(win.minKmh)}–${Math.round(win.maxKmh)} km/s`};
      }
      return {status:'wait',message:'Yeşil dalga için hız artırma önerilmez. Güvenli ve yasal hızda devam edin.'};
    }
    return {status:'unknown',message:'Işık zamanlaması doğrulanamadı.'};
  }

  function next(currentSpeedKmh,legalLimitKmh){
    const sorted=state.signals.filter(s=>s.distanceM>=0).sort((a,b)=>a.distanceM-b.distanceM);
    if(!sorted.length) return null;
    const s=sorted[0];
    return Object.assign({signal:s},recommend(s.distanceM,currentSpeedKmh,legalLimitKmh,s));
  }

  window.NEMATrafficLights={state,addSignal,clear,arrivalAt,greenWindow,recommend,next};
})();
