/* NEMA Driving AI Assistant v1 */
(function(){'use strict';
 function normalize(s){return String(s||'').toLocaleLowerCase('tr-TR').trim();}
 function parse(input){const s=normalize(input);if(!s)return {intent:'unknown',confidence:0};const rules=[['alternative',['alternatif rota','başka rota','farklı rota']],['fuel',['yakıt','benzin','akaryakıt']],['charging',['şarj','şarj istasyonu']],['parking',['otopark','park yeri']],['rest',['dinlenme tesisi','mola','dinlenme']],['traffic',['trafik nasıl','trafik durumu','trafik']],['eta',['ne zaman varırım','varış','eta']],['report',['kaza bildir','trafik bildir','yol kapalı','engel bildir']]];for(const [intent,terms] of rules)if(terms.some(t=>s.includes(t)))return {intent,confidence:.95,text:input};return {intent:'unknown',confidence:.2,text:input};}
 function execute(input){const r=parse(input);const ui=window.NEMADriveUI;switch(r.intent){case'alternative':window.dispatchEvent(new CustomEvent('nema:request-alternatives'));return {ok:true,...r};case'fuel':case'charging':case'parking':case'rest':ui?.addStopCategory(r.intent);return {ok:true,...r};case'traffic':return {ok:true,...r,data:window.NEMATraffic?.status?.()||null};case'eta':return {ok:true,...r,data:window.NEMANavigation?.snapshot?.()||null};case'report':ui?.report();return {ok:true,...r};default:return {ok:false,...r};}}
 window.NEMAAssistant={parse,execute};
})();
