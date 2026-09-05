# AGRO-MET Command Center

AGRO-MET is the central, platform-neutral decision layer for agricultural early warning. The same TypeScript core can feed Android, iOS and Web/PWA clients.

## Architecture

- `core/agro-core.ts` is deterministic, explainable and independent of UI/platform APIs.
- `app/` is an Expo Router client shared by Android, iOS and Web.
- `early-warning/` contains the first standalone Early Warning prototype already created in this repository.
- `.github/workflows/agro-met.yml` type-checks, exports Web and builds an Android debug APK.

## Decision pipeline

`Weather + Soil + Camera + Satellite + Phenology -> AgroCore -> Risk vectors -> Confidence -> Explainable actions`

Risk vectors are intentionally separated: disease, pest, water stress, heat stress and frost. A single overall score is derived only after the individual risks are calculated.

## Platform strategy

Expo is used for the universal client because its current documentation supports Android, iOS and Web from one JavaScript/TypeScript project. Web is configured as a static standalone/PWA-style output. The domain logic has no dependency on Expo, React Native or browser APIs, so a future API, desktop shell or server worker can consume the same core types and rules.

## Stability principles

1. No hidden network dependency in the core risk calculation.
2. Missing sensor signals reduce certainty instead of fabricating data.
3. Every risk has an explicit reason and suggested action.
4. UI is a presentation layer, not the source of truth.
5. Production data connectors can be added behind adapters without changing the core model.
6. CI must pass type-checking and Web export before release.

## Next production adapters

- Meteorology provider adapter
- GNSS/device location adapter
- Parcel/geospatial adapter
- Soil/IoT sensor adapter
- Camera/vision inference adapter
- Satellite/remote-sensing adapter
- Notification adapter
- Authentication and tenant/organization adapter
- Durable database + event/audit log

The command center is deliberately built so these integrations can be introduced without rewriting the application UI or risk engine.
