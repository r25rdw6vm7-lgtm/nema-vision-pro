# NEMA Drive Navigation Roadmap

## Implemented in prototype
- Responsive driving UI
- OpenStreetMap road layer
- High-resolution Esri World Imagery satellite layer
- Hybrid satellite + labels mode
- Browser GPS watch with high accuracy request
- GPS speed calculation with fallback distance/time calculation
- GPS accuracy display
- Destination search via Nominatim
- Speed-limit safety state and driver warning UI
- Traffic layer control placeholder
- EDS/inspection UI slot

## Production integrations required
- Licensed/authorized traffic provider
- Authoritative Turkish speed-limit dataset
- Verified EDS / average-speed enforcement dataset
- Production routing engine with turn-by-turn maneuvers
- Offline vector/raster map packages
- iOS Core Location native speed/heading integration
- CarPlay navigation templates
- Voice guidance using native speech APIs
- Background location handling and battery policy
- Data freshness/versioning and provenance for every enforcement record

## Safety rule
Enforcement warnings are for lawful driving assistance. The application must never recommend a speed profile intended to evade enforcement or calculate how to pass cameras while exceeding the applicable legal limit.

## Test matrix
- GPS permission denied
- GPS unavailable / low accuracy
- Stationary vehicle
- Urban driving
- Highway driving
- Speed-limit change
- Route deviation
- Offline mode
- Map provider failure
- Traffic provider failure
- Stale enforcement data
- Average-speed zone entry/exit
- CarPlay display constraints
