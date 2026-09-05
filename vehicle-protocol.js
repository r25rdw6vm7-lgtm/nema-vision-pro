/* NEMA Drive Navigation - ELM327 OBD-II protocol adapter v1
 * Transport-agnostic: native iOS CoreBluetooth or a browser BLE bridge can supply write/read.
 * This parser never fabricates vehicle values. Unsupported/malformed responses return null.
 */
(function(){
  'use strict';
  const num=(v,d=null)=>Number.isFinite(Number(v))?Number(v):d;
  const clean=s=>String(s||'').toUpperCase().replace(/[^0-9A-F]/g,'');
  function bytes(hex){const h=clean(hex);if(!h||h.length%2)return [];const out=[];for(let i=0;i<h.length;i+=2)out.push(parseInt(h.slice(i,i+2),16));return out;}
  function parsePID(pid,response){
    const b=bytes(response);if(!b.length)return null;const p=pid.toUpperCase();let i=-1;
    for(let j=0;j<b.length-1;j++){if(b[j]===0x41&&b[j+1]===parseInt(p,16)){i=j+2;break;}}
    if(i<0)return null;
    if(p==='0D'&&b.length>i)return {speedKmh:b[i]};
    if(p==='0C'&&b.length>i+1)return {rpm:(b[i]*256+b[i+1])/4};
    if(p==='05'&&b.length>i)return {coolantC:b[i]-40};
    return null;
  }
  function commandFor(pid){return {speed:'0D',rpm:'0C',coolant:'05'}[pid]||pid;}
  function normalizeLine(response){return String(response||'').replace(/[\r\n>]/g,' ').replace(/\s+/g,' ').trim();}
  async function poll(transport,source='elm327'){
    if(!transport||typeof transport.write!=='function'||typeof transport.read!=='function')throw new Error('OBD taşıma katmanı write/read sağlamalıdır.');
    const result={source,speedKmh:null,rpm:null,coolantC:null,timestamp:Date.now()};
    for(const pid of ['speed','rpm','coolant']){
      await transport.write(commandFor(pid)+'\r');
      const response=normalizeLine(await transport.read());
      const parsed=parsePID(commandFor(pid),response);
      if(parsed)Object.assign(result,parsed);
    }
    if(typeof window!=='undefined'&&window.NEMAVehicle&&result.speedKmh!==null)window.NEMAVehicle.ingestVehicle(result);
    return result;
  }
  window.NEMAOBD={parsePID,commandFor,normalizeLine,poll};
})();
