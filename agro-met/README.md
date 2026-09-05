# AGRO-MET Command Center ∞

AGRO-MET is a platform-neutral agricultural intelligence and decision system. The architecture now contains a scalable capability registry, advanced signal fusion, digital farm twin, evidence/knowledge contracts, safety guardrails, analytics primitives, offline sync/event primitives and a long-term infinity roadmap.

## Intelligence pipeline

```text
DEVICE / API / SENSOR / CAMERA / SATELLITE
                 ↓
          ADAPTER LAYER
                 ↓
      NORMALIZATION + VALIDATION
                 ↓
      PROVENANCE + FRESHNESS + QA
                 ↓
        MULTI-SIGNAL FUSION
                 ↓
      RISK + FORECAST + UNCERTAINTY
                 ↓
        DIGITAL FARM TWIN
                 ↓
       DECISION + ACTION ENGINE
                 ↓
       ALERT / EVENT / AUDIT LOG
                 ↓
      UNIVERSAL COMMAND CENTER
                 ↓
          RESULT MEASUREMENT
                 ↓
       LEARNING / CALIBRATION
                 ↺
```

## Core modules

- `core/agro-core.ts`: validated deterministic risk engine.
- `core/contracts.ts`: canonical domain contracts and system state.
- `core/adapters.ts`: provider-independent data boundary.
- `core/advanced.ts`: VPD, ET0 proxy, degree-days, advanced risk vectors and confidence-weighted fusion.
- `core/digital-twin.ts`: deterministic parcel/twin state and what-if scenarios.
- `core/knowledge.ts`: evidence-aware knowledge index and safe answer contracts.
- `core/safety.ts`: decision guardrails and high-impact human-approval gates.
- `core/platform.ts`: offline sync queue, event log and audit primitives.
- `core/analytics.ts`: trends, anomaly scores and weighted scoring.
- `core/roadmap.ts`: executable catalog of the long-term capability roadmap.
- `core/orchestrator.ts`: unified observation → decision → intelligence → digital-twin pipeline.
- `core/runtime.ts`: resilient runtime with last-known-good state.
- `app/`: Expo universal Android/iOS/Web/PWA command center.
- `early-warning/`: retained legacy-compatible prototype.

## Covered intelligence domains

Core, parcel, GNSS/location, meteorology, soil, crop and phenology, vision, disease, pest, weed, irrigation, nutrition, satellite, early warning, digital twin, decision intelligence, Agronomist AI, operations, economics, harvest, climate, knowledge, security, platform and robotics are represented as extensible capability domains. The registry is intentionally open-ended so new crops, risks, models, sensors, agents and decisions can be added without changing the UI contract.

Phenology remains an optional decision input. It is not removed from the architecture and no dedicated phenology panel is required for the current phase.

## Engineering guarantees

1. Invalid critical input is rejected.
2. Non-finite values cannot silently poison scoring.
3. Missing/stale sources reduce confidence instead of becoming fake measurements.
4. Risk vectors remain separately inspectable.
5. Evidence and provenance can travel with decisions.
6. High-impact or low-confidence actions can require human approval.
7. Offline primitives support local operation and later synchronization.
8. Digital-twin scenarios are deterministic and explicitly labeled as simulations.
9. Provider adapters remain outside the decision rules.
10. The universal client consumes state rather than duplicating agronomic logic.

## Reality boundary

The code now provides the architecture and deterministic local engines for the full roadmap. External services such as live weather, production GNSS/RTK, satellite providers, camera inference models, IoT gateways, notifications, authentication and durable cloud storage must still be connected through their adapters. The application must never represent demo data as live data.

## Quality gate

```bash
npm install
npm run typecheck
npm run doctor
npm run export:web
```

The existing NEMA Vision Pro APK workflow remains separate from the universal AGRO-MET client.
