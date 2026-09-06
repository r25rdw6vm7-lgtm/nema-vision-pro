# NEMA Drive Native Integration

The web application is now a single decision core. Native layers are adapters, not second navigation brains.

## Required production adapters

| Layer | iOS | Android | Core ingress |
|---|---|---|---|
| Traffic network | HERE traffic / licensed provider | HERE traffic / licensed provider | `NEMARealData.registerTraffic()` |
| Vision | Core ML / ONNX / approved inference runtime | ML Kit / ONNX / approved inference runtime | `NEMARealData.registerVision()` |
| Offline routing | HERE SDK Navigate `OfflineRoutingEngine` | HERE SDK Navigate `OfflineRoutingEngine` | `NEMARealData.registerOffline()` |
| 3D map | HERE VisualNavigator / native 3D renderer | HERE VisualNavigator / native 3D renderer | `NEMARealData.register3D()` |
| Native routing | HERE RoutingEngine / Navigator | HERE RoutingEngine / Navigator | `NEMARealData.registerNative()` |
| CarPlay | `NEMACarPlayController` | N/A | native host |
| Android Auto | N/A | `NemaAndroidAutoService` | native host |

## Runtime contract

The host application must register real adapters at startup. No adapter means no live/native claim.

```js
NEMARealData.registerTraffic('here', trafficAdapter, {licensed:true});
NEMARealData.registerVision('on-device-vision', visionAdapter, {enabled:true});
NEMARealData.registerOffline('here-offline', offlineAdapter, {licensed:true});
NEMARealData.register3D('here-3d', map3dAdapter, {native:true});
NEMARealData.registerNative('ios', nativeAdapter, {
  platform:'ios', offlineRouting:true, offlineMaps:true, licensed:true
});
```

Credentials and SDK license tokens are intentionally not stored in Git. Inject them through the native host / secure runtime configuration.

The web core remains provider-neutral and refuses to label unverified or demo data as live.
