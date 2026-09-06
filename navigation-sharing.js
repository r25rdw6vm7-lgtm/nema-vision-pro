/* NEMA Drive sharing contract v1 */
(function(){'use strict';
 const state={last:null};
 function create(route={}){const payload={version:1,product:'NEMA Drive',destination:route.destination||null,waypoints:Array.isArray(route.waypoints)?route.waypoints:[],provider:route.provider||null,createdAt:Date.now()};state.last=payload;return payload;}
 function encode(route){return btoa(unescape(encodeURIComponent(JSON.stringify(create(route)))));}
 function decode(token){try{return JSON.parse(decodeURIComponent(escape(atob(token))));}catch(e){return null;}}
 async function share(route){const data=create(route);const text=`NEMA Drive rotası: ${data.destination?.name||'Hedef'}`;if(navigator.share){await navigator.share({title:'NEMA Drive',text});return {ok:true,method:'native-share',data};}if(navigator.clipboard){await navigator.clipboard.writeText(text);return {ok:true,method:'clipboard',data};}return {ok:false,error:'Paylaşım API kullanılamıyor',data};}
 window.NEMARouteSharing={state,create,encode,decode,share};
})();