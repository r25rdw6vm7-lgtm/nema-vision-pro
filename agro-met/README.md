# AGRO-MET Command Center

AGRO-MET is the central, platform-neutral decision layer for agricultural early warning. The same TypeScript core feeds Android, iOS and Web/PWA clients.

## Architecture

- `core/agro-core.ts`: deterministic, explainable, validated decision engine with no UI/platform dependency.
- `app/`: Expo Router universal client shared by Android, iOS and Web.
- `early-warning/`: standalone Early Warning prototype retained as a reference/legacy-compatible module.
- `.github/workflows/agro-met-universal.yml`: dependency install, TypeScript validation, Expo health check and Web export.
- `.github/workflows/agro-met.yml`: existing build pipeline retained for compatibility.

## Decision pipeline

`Weather + Soil + Camera + Satellite + Phenology -> validation -> risk vectors -> confidence/data quality -> alerts -> prioritized actions -> 72h projection`

Risk vectors remain separate: disease, pest, water stress, heat stress and frost. The overall score is derived only after those vectors are calculated.

## Engineering guarantees

1. **Input validation:** invalid percentages, negative weather values and malformed parcel identity fail fast.
2. **Finite-number safety:** non-finite numeric inputs cannot silently poison the decision result.
3. **Missing-data honesty:** absent sensors reduce confidence/data quality rather than inventing measurements.
4. **Freshness awareness:** stale inputs reduce data quality and therefore confidence.
5. **Explainability:** every major risk includes score, weight, reason and contributing sources.
6. **Prioritized alerts:** high-risk factors become actionable alerts ordered by impact.
7. **Forecast projection:** the same deterministic state produces a 72-hour risk trajectory.
8. **UI isolation:** screens consume `AgroAssessment`; they do not contain the business rules.
9. **Offline-safe core:** the risk engine has no network dependency and can run locally.
10. **Cross-platform core:** no Expo, browser, Android or iOS API is required by the decision engine.

## Platform strategy

Expo is used for the universal client. Web is configured as a static standalone output, while the same project can target Android and iOS. The domain layer is independent, so a future API, desktop shell, background worker or server-side service can consume the same contracts and rules.

## Production adapter boundary

The next integrations should implement explicit adapters for:

- meteorology and forecasts
- automatic GNSS/device location
- parcel boundaries and geospatial calculations
- soil/IoT telemetry
- camera/vision inference
- satellite/remote sensing
- notifications and escalation
- authentication, organizations and roles
- durable database
- event and audit log

Adapters should normalize external data before it reaches `AgroCore`. The decision engine must remain provider-agnostic.

## Quality gate

Run from `agro-met/`:

```bash
npm install
npm run typecheck
npm run doctor
npm run export:web
```

The GitHub Actions validation pipeline executes these checks on relevant pull requests and on `main` changes.
