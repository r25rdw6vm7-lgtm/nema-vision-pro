/* NEMA Drive Mobile Polish v1
 * Keeps the driving map dominant and turns the bottom card into a compact glanceable HUD.
 * No navigation data is fabricated here.
 */
(function(){'use strict';
 const css=`
 @media(max-width:699px){
  html,body,#app{height:100%;overflow:hidden}
  .mapwrap{min-height:0!important;height:100%!important}
  #map{background:#0b1220}
  .top{top:max(10px,calc(10px + env(safe-area-inset-top)))!important;left:12px!important;right:12px!important;gap:7px!important}
  .search{height:52px!important;padding:0 16px!important;border-radius:18px!important;font-size:16px!important;background:rgba(7,14,25,.78)!important;box-shadow:0 10px 30px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.08)!important}
  .btn{height:52px!important;min-width:58px!important;border-radius:18px!important;font-size:15px!important}
  .layers{top:max(72px,calc(72px + env(safe-area-inset-top)))!important;right:12px!important;max-width:none!important;gap:6px!important;flex-wrap:nowrap!important}
  .layer{min-height:44px!important;padding:0 13px!important;border-radius:16px!important;background:rgba(7,14,25,.78)!important;backdrop-filter:blur(18px)!important}
  .bottom{left:10px!important;right:10px!important;bottom:max(80px,calc(80px + env(safe-area-inset-bottom)))!important;max-height:31vh!important;min-height:0!important;overflow:hidden!important;padding:13px!important;border-radius:26px!important;background:linear-gradient(180deg,rgba(7,14,25,.88),rgba(7,14,25,.96))!important;backdrop-filter:blur(28px) saturate(150%)!important;box-shadow:0 18px 55px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.08)!important}
  .maneuver{gap:12px!important;padding:0 0 7px!important}
  .arrow{width:56px!important;height:56px!important;border-radius:18px!important;font-size:29px!important;flex:none}
  .next{font-size:18px!important;line-height:1.15!important}
  .sub{font-size:11px!important;margin-top:4px!important}
  .speedrow{margin-top:4px!important;padding:10px 3px 2px!important;border-top:1px solid rgba(255,255,255,.08)!important}
  .speed{font-size:45px!important;line-height:.9!important;letter-spacing:-.05em!important}
  .limit{font-size:25px!important}
  .stats{grid-template-columns:repeat(3,1fr)!important;gap:6px!important;margin-top:8px!important}
  .stats .stat:first-child{grid-column:auto!important}
  .stat{min-width:0!important;padding:9px!important;border-radius:15px!important;background:rgba(18,34,56,.82)!important}
  .small{font-size:8px!important}
  .big{font-size:15px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .bottom .lightpanel,.bottom .vehicle,.bottom #warning{display:none!important}
  .leaflet-overlay-pane path.leaflet-interactive{stroke-width:8px!important;stroke-linecap:round!important;stroke-linejoin:round!important;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}
  .leaflet-marker-icon{filter:drop-shadow(0 3px 7px rgba(0,0,0,.45))}
  .leaflet-control-attribution{font-size:8px!important;background:rgba(0,0,0,.35)!important;color:#d6deea!important}
  #nemaPremiumDock{left:8px!important;right:8px!important;bottom:max(8px,env(safe-area-inset-bottom))!important;height:66px!important;border-radius:23px!important}
  .nema-dock-btn{min-height:50px!important;border-radius:16px!important}
  #nemaQuickActions{bottom:max(88px,calc(88px + env(safe-area-inset-bottom)))!important;right:12px!important}
  .nema-qbtn{width:46px!important;height:46px!important}
  #nemaDriveHud{top:max(126px,calc(126px + env(safe-area-inset-top)))!important;min-width:0!important;max-width:calc(100vw - 100px)!important}
  #nemaLaneGuidance{bottom:max(154px,calc(154px + env(safe-area-inset-bottom)))!important}
 }
 @media(max-width:390px){
  .layer{padding:0 10px!important;font-size:11px!important}
  .bottom{max-height:30vh!important}
  .speed{font-size:41px!important}
  .limit{font-size:22px!important}
  .big{font-size:14px!important}
 }
 `;
 function ensure(){if(document.getElementById('nemaMobilePolishStyle'))return;const s=document.createElement('style');s.id='nemaMobilePolishStyle';s.textContent=css;document.head.appendChild(s)}
 function routeMode(on){document.body.classList.toggle('nema-route-active',!!on)}
 function init(){ensure();window.addEventListener('nema:route',()=>routeMode(true));window.addEventListener('nema:destination',()=>{});window.NEMAMobilePolish={ensure,routeMode}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
