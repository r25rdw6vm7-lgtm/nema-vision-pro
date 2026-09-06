/* NEMA Drive Voice/AI command contract v1
 * Parses safe navigation intents. A real LLM/provider may supply richer answers,
 * but this layer never invents live data.
 */
(function(){'use strict';
 const state={last:null};
 function parse(text=''){const q=String(text).trim().toLocaleLowerCase('tr-TR');let intent='unknown';if(/yakıt|benzin|mazot|lpg/.test(q))intent='find-fuel';else if(/şarj|elektrik/.test(q))intent='find-charger';else if(/otopark|park/.test(q))intent='find-parking';else if(/dinlen|mola/.test(q))intent='find-rest';else if(/trafik|yoğun/.test(q))intent='traffic-status';else if(/rota|alternatif/.test(q))intent='route-options';else if(/eta|kaç dakika|ne kadar sür/.test(q))intent='eta';else if(/olay|kaza|tehlike/.test(q))intent='report-incident';state.last={intent,text:String(text),createdAt:Date.now()};return state.last;}
 function respond(intent,data={}){if(intent==='eta'&&Number.isFinite(Number(data.etaSec)))return `Tahmini varış ${Math.ceil(Number(data.etaSec)/60)} dakika.`;if(intent==='traffic-status'&&data.status)return `Trafik durumu: ${data.status}.`;if(intent==='route-options')return 'Alternatif rotaları karşılaştırıyorum.';if(intent==='find-fuel')return 'Rota üzerindeki yakıt istasyonlarını arıyorum.';if(intent==='find-charger')return 'Rota üzerindeki uygun şarj noktalarını arıyorum.';if(intent==='find-parking')return 'Rota üzerindeki otoparkları arıyorum.';if(intent==='find-rest')return 'Rota üzerindeki dinlenme noktalarını arıyorum.';if(intent==='report-incident')return 'Olay bildirimi için tür ve konumu doğruluyorum.';return 'Bu isteği mevcut navigasyon verileriyle doğrulayamıyorum.';}
 window.NEMAAssistant={state,parse,respond};
})();
