/* NEMA Drive offline cache v1
 * Caches the application shell only. Live map/traffic data is never faked.
 */
(function(){
  'use strict';
  const DB='nema-drive-cache-v1';
  const STORE='meta';
  function open(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  async function put(key,value){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);});}
  async function get(key){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  async function status(){return {supported:'serviceWorker' in navigator && 'indexedDB' in window,offlineReady:!!(navigator.serviceWorker&&navigator.serviceWorker.controller),lastSync:await get('lastSync').catch(()=>null)};}
  window.NEMADriveOffline={put,get,status,markSync:()=>put('lastSync',Date.now())};
})();
