/* NEMA Drive Navigation - Bluetooth Vehicle Bridge
 * Web Bluetooth is optional and browser-dependent. iOS production builds should
 * use a native CoreBluetooth bridge / Capacitor or Swift layer.
 */
(function(){
  'use strict';
  const state={device:null,server:null,characteristic:null,connected:false,lastPacket:null};
  const CANDIDATE_SERVICES=[
    '000018f0-0000-1000-8000-00805f9b34fb', // common custom/vehicle service candidate
    '0000180f-0000-1000-8000-00805f9b34fb'  // battery service, read-only fallback
  ];

  function supported(){return typeof navigator!=='undefined'&&!!navigator.bluetooth;}
  async function connect(){
    if(!supported()) throw new Error('Bu tarayıcı Web Bluetooth desteklemiyor. iOS için native Bluetooth bridge kullanılmalı.');
    const device=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:CANDIDATE_SERVICES});
    const server=await device.gatt.connect();
    state.device=device;state.server=server;state.connected=true;
    device.addEventListener('gattserverdisconnected',()=>{state.connected=false;state.server=null;state.characteristic=null;});
    return {name:device.name||'Bluetooth cihazı',connected:true};
  }
  async function disconnect(){if(state.device?.gatt?.connected)state.device.gatt.disconnect();state.connected=false;state.server=null;state.characteristic=null;}
  function ingestPacket(packet){
    if(!packet||typeof packet!=='object')return null;
    const normalized={speedKmh:Number.isFinite(packet.speedKmh)?packet.speedKmh:null,rpm:Number.isFinite(packet.rpm)?packet.rpm:null,gear:packet.gear??null,batteryV:Number.isFinite(packet.batteryV)?packet.batteryV:null,source:packet.source||'bluetooth',timestamp:Date.now()};
    state.lastPacket=normalized;window.dispatchEvent(new CustomEvent('nema:vehicle-data',{detail:normalized}));return normalized;
  }
  window.NEMABluetooth={state,supported,connect,disconnect,ingestPacket};
})();
