# NEMA Drive v3 Uygulama Sırası

## Bu tur
- Birleşik karar motoru
- Route-stop motoru
- Vision adapter contract
- Smoke testleri
- Offline shell cache

## Sonraki teknik dalga
1. Karar motorunu navigation-runtime-bridge'e bağla.
2. Route-stop motorunu gerçek POI sağlayıcılarına bağla.
3. Olayları harita katmanına bağla ve kullanıcı doğrulaması ekle.
4. Gerçek trafik sağlayıcı adapterini bağla.
5. Şerit geometrisi sağlayıcısını bağla.
6. Vision adapterine gerçek Core ML / Android ML modeli bağla.
7. EV modelini gerçek araç telemetrisiyle besle.
8. Offline routing engine'i native bridge üzerinden bağla.
9. CarPlay ve Android Auto native yüzlerini bağla.
10. Gerçek cihaz/sürüş testlerini otomatikleştir.

## Güvenlik kuralları
- Veri yoksa veri üretilmez.
- Vision düşük güvenliyse hız limiti veya manevra değiştirilmez.
- Green Wave yasal hız sınırını aşamaz.
- EDS verisi doğrulanmadan kesin gerçek olarak gösterilmez.
- Offline mod trafik/kamera/yol olaylarının canlı olduğunu iddia etmez.
