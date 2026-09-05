/* NEMA Drive Navigation - Multi-signal Green Wave Engine v2
 * Computes lawful speed windows across multiple traffic signals.
 * No recommendation may exceed the applicable legal speed limit.
 */
(function(){
  'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const kmhToMs=k=>Math.max(0,k)/3.6;
  const msToKmh=v=>Math.max(0,v)*3.6;
  const finite=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;

  function normalizeSignal(s){
    return {
      id:s.id||('signal-'+Math.random().toString(36).slice(2)),
      distanceM:Math.max(0,finite(s.distanceM,0)),
      phase:s.phase||'unknown',
      remainingSec:finite(s.remainingSec),
      greenDurationSec:Math.max(1,finite(s.greenDurationSec,30)),
      cycleSec:Math.max(1,finite(s.cycleSec,90)),
      speedLimitKmh:finite(s.speedLimitKmh),
      confidence:s.confidence||'unknown',
      source:s.source||'unknown'
    };
  }

  function arrivalAt(distanceM,speedKmh){
    const v=kmhToMs(speedKmh);
    return v>0?distanceM/v:Infinity;
  }

  function windowForSignal(signal,limitKmh){
    const s=normalizeSignal(signal);
    if(s.phase!=='red'||!Number.isFinite(s.remainingSec)) return null;
    const limit=clamp(Math.min(limitKmh, s.speedLimitKmh??limitKmh),5,160);
    const start=s.remainingSec;
    const end=start+s.greenDurationSec;
    const minSpeed=clamp(msToKmh(s.distanceM/end),5,limit);
    const maxSpeed=clamp(msToKmh(s.distanceM/Math.max(start,0.5)),5,limit);
    if(minSpeed>maxSpeed) return null;
    if(arrivalAt(s.distanceM,limit)>end) return null;
    return {minKmh:Math.round(minSpeed),maxKmh:Math.round(maxSpeed),greenStartSec:start,greenEndSec:end};
  }

  function optimize(signals,currentSpeedKmh,defaultLimitKmh){
    const list=(signals||[]).map(normalizeSignal).filter(s=>s.distanceM>=0).sort((a,b)=>a.distanceM-b.distanceM);
    const limit=clamp(finite(defaultLimitKmh,50),5,160);
    if(!list.length) return {status:'no-data',signals:[],message:'Rota üzerinde doğrulanmış trafik ışığı verisi yok.'};

    let feasible={min:5,max:limit};
    const analyzed=[];
    for(const s of list){
      const localLimit=clamp(Math.min(limit,s.speedLimitKmh??limit),5,160);
      if(s.phase==='green'){
        analyzed.push({...s,window:null,status:'green'});
        feasible.max=Math.min(feasible.max,localLimit);
        continue;
      }
      const w=windowForSignal(s,localLimit);
      analyzed.push({...s,window:w,status:w?'reachable':'wait'});
      if(w){
        feasible.min=Math.max(feasible.min,w.minKmh);
        feasible.max=Math.min(feasible.max,w.maxKmh);
      }
    }

    const valid=feasible.min<=feasible.max;
    let target=null;
    if(valid){
      const current=finite(currentSpeedKmh,0);
      target=Math.round(clamp(current>=feasible.min&&current<=feasible.max?current:(feasible.min+feasible.max)/2,5,feasible.max));
    }
    return {
      status:valid?'green-wave':'wait',
      speedWindowKmh:valid?[Math.round(feasible.min),Math.round(feasible.max)]:null,
      targetKmh:target,
      signals:analyzed,
      message:valid?`Rota boyunca yasal yeşil dalga: ${Math.round(feasible.min)}–${Math.round(feasible.max)} km/s`:'Tüm ışıkları aynı yasal hız aralığında yakalamak mümkün görünmüyor; hız artırmayın.'
    };
  }

  window.NEMAGreenWave={normalizeSignal,arrivalAt,windowForSignal,optimize};
})();
