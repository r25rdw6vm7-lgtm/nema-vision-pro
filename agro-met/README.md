# AGRO-MET Command Center 2.0

AGRO-MET is a platform-neutral agricultural intelligence and decision layer. It is designed to grow from a deterministic early-warning engine into a full agricultural operating system without coupling business rules to a specific UI, vendor or data provider.

## 2.0 architecture

```text
DEVICE / API / SENSOR / CAMERA / SATELLITE
                 ↓
          ADAPTER LAYER
                 ↓
      NORMALIZATION + VALIDATION
                 ↓
      PROVENANCE + FRESHNESS + QA
                 ↓
        AGRO CORE / RISK VECTOR
                 ↓
     FORECAST + FUSION + CONFIDENCE
                 ↓
       DECISION + ACTION ENGINE
                 ↓
       ALERT / EVENT / AUDIT LOG
                 ↓
      UNIVERSAL COMMAND CENTER
   Android · iOS · Web · PWA · future API
```

### Current modules

- `core/agro-core.ts`: deterministic risk vectors, validation, confidence, data quality, explainability and 72-hour projection.
- `core/contracts.ts`: canonical domain contracts for parcel, weather, forecast, soil, vision, satellite, traps, provenance, actions and events.
- `core/adapters.ts`: provider-agnostic adapter boundary and demo adapters.
- `core/decision-engine.ts`: assessment-to-action orchestration and event generation.
- `core/runtime.ts`: refresh lifecycle, error isolation and last-known-good state.
- `core/validation.ts`: reusable parcel, location and meteorology validation.
- `core/self-test.ts`: deterministic core smoke checks.
- `core/index.ts`: stable public core API.
- `app/`: Expo universal client for Android, iOS, Web/PWA.
- `early-warning/`: retained standalone prototype for compatibility/reference.

## Decision model

The engine keeps disease, pest, water stress, heat stress and frost as separate risk vectors. Phenology remains an optional domain input and can progressively influence crop-specific rules without requiring a dedicated UI panel.

Every assessment carries:

- risk vector scores
- overall level
- confidence
- data quality
- contributing sources
- freshness awareness
- explainable reasons
- prioritized actions
- alert events
- 72-hour projection

## Engineering principles

1. **Provider agnostic:** no weather, map, camera, satellite or sensor vendor is embedded in the decision rules.
2. **Fail closed on invalid critical data:** malformed identity and impossible measurements are rejected.
3. **No fake certainty:** missing or stale sources reduce confidence/quality instead of becoming invented measurements.
4. **Pure decision layer:** business rules can run locally, on a server, in a worker or inside tests.
5. **Deterministic core:** identical valid inputs produce the same assessment.
6. **Explainability first:** every major risk exposes score, weight, reason and source.
7. **Actionability:** the system produces ranked operational actions, not only numbers.
8. **Event driven growth:** alerts and assessment events provide a clean path to notifications, history and audit trails.
9. **Offline capable:** the decision engine does not require a network connection.
10. **Universal client:** one application surface can target Android, iOS and Web/PWA.

## Long-term expansion map

The architecture is intentionally prepared for the complete roadmap:

- Core platform, configuration, feature flags and tenant isolation
- Parcel registry, boundaries, geometry, history and field operations
- GNSS/location, reverse geocoding and geospatial calculations
- Weather observations, forecasts, microclimate and nowcasting
- Soil moisture, EC, pH, temperature and IoT telemetry
- Crop/phenology knowledge and crop-specific thresholds
- Camera target detection, disease, pest, weed and crop-state intelligence
- Pest traps, degree-days, population trends and outbreak forecasting
- Disease models, infection windows and pre-outbreak detection
- Irrigation, water balance and root-zone decision support
- Nutrition, fertilization and deficiency detection
- Satellite NDVI/NDRE/NDMI, anomaly maps and change detection
- Multi-risk early warning, parcel risk maps and regional radar
- Digital twin and season timeline
- Agronomist copilot and explainable recommendations
- Before/after verification and intervention effectiveness
- Work orders, tasks, field logs and team workflows
- Yield, cost, revenue and treatment economics
- Data fusion, confidence calibration and continuous learning
- Notification, escalation, acknowledgement and alert fatigue controls
- Offline sync, conflict resolution and last-known-good state
- Authentication, organizations, roles, permissions and audit log
- API/backend, durable storage, queues, scheduled jobs and observability
- Advanced visualization, maps, timelines and command-center views
- Multi-agent orchestration for specialist agricultural reasoning

The system should add these capabilities through adapters and modules rather than rewriting the decision layer.

## Production integration order

1. Real device location and parcel service
2. Real meteorology/forecast adapter
3. Durable local cache + offline sync
4. Camera inference adapter
5. Satellite adapter
6. Soil/IoT adapter
7. Crop-specific disease/pest models
8. Notification and escalation service
9. Authentication + multi-tenant backend
10. Historical learning, calibration and digital twin

No module should claim live data until its adapter is actually connected and its provenance is visible in the UI.

## Quality gate

```bash
npm install
npm run typecheck
npm run doctor
npm run export:web
```

CI validates TypeScript, Expo health and Web export. The existing NEMA Vision Pro Android APK workflow remains separate and is not replaced by the universal AGRO-MET client.
