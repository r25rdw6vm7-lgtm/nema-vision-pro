# AGRO-MET Early Warning v1

Bu modül, parsel bazında erken uyarı karar desteği için ilk çalışan arayüz ve saf risk motorunu içerir.

## İçerik

- `index.html`: mobil uyumlu Early Warning dashboard
- `risk-engine.js`: hastalık, zararlı, stres, toplam risk, güven ve açıklanabilirlik fonksiyonları

## Risk modeli

Model; sıcaklık, bağıl nem, yaprak ıslaklığı, yağış, fenolojik hassasiyet, kamera kanıtı, derece-gün ilerlemesi, tuzak trendi ve su/ısı/don göstergelerini normalize ederek 0-100 arası skor üretir.

## Sonraki entegrasyon

Canlı meteoroloji, parsel konumu, kamera analizi, sensör ve uydu verileri gerçek veri adaptörleriyle `evaluate()` girdilerine bağlanmalıdır. Üretim kullanımında model eşikleri ürün/bitki/pathosistem bazında kalibre edilmeli ve doğrulama metrikleri izlenmelidir.
