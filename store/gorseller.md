# Mağaza görselleri

## Hazır olanlar

| Dosya | Mağaza | Ölçü | Durum |
|---|---|---|---|
| `store/screenshots/<dil>/iphone-6.9/` | App Store (zorunlu) | 1320×2868 | ✅ TR + EN, 3 kare |
| `store/screenshots/<dil>/ipad-13/` | App Store (iPad destekleniyor, zorunlu) | 2064×2752 | ✅ TR + EN, 3 kare |
| `store/screenshots/<dil>/play-phone/` | Google Play (zorunlu) | 1080×1920 | ✅ TR + EN, 3 kare |
| `store/feature-graphic.jpg` | Google Play öne çıkan görsel (zorunlu) | 1024×500 | ✅ paylaşım görselinden |
| `public/icon-512.png` | Google Play ikonu | 512×512 | ✅ asıl dosya |
| `resources/icon-only.png` → iOS `AppIcon` | App Store ikonu | 1024×1024 | ⚠️ **geçici**: 512'lik ikon büyütüldü |
| Android uyarlanabilir ikon | Android ana ekran | katmanlı | ⚠️ **geçici**: ikon koyu zemin üstünde küçültülmüş |

Kareler: **1 ana menü · 2 lobi** (iki insan + bir bilgisayar rakip) **· 3 oyun** (alan ele
geçirilmiş, asker taşıma). Mağaza en az 3 kare istiyor; 5'e kadar çıkmak önerilir.

## Yeniden üretmek

```bash
npm i --no-save playwright && npx playwright install chromium
node scripts/screenshots.js
```

Betik gerçek sunucuyu açar, iki insan ve bir botla oyun kurar, birkaç tur oynatır ve dört
ölçüde iki dilde çeker. Oyunun görünüşü değişirse yeniden çalıştırmak yeter.

## Senden gereken

1. **İkonun 1024×1024 aslı.** İkon bir yapay zekâ aracıyla üretildiyse o aracın verdiği büyük
   dosya. `resources/icon-only.png`'nin yerine koy, sonra:
   `npx @capacitor/assets generate --assetPath resources --iconBackgroundColor '#0f1a33' --splashBackgroundColor '#0f1a33'`
2. **Android için katmanlı ikon** (isteğe bağlı ama iyi olur): taç ve zar **saydam zeminde**
   (`resources/icon-foreground.png`, 1024×1024, çizim ortadaki %66'lık dairenin içinde) ve
   zemin ayrı (`resources/icon-background.png`). Android ikonu daire, damla ya da kare olarak
   keser; tek parça resimde taç kesilir.
3. İstersen karelerin üstüne kısa başlık bandı (Figma/Canva): "Arkadaşlarınla zar savaşı",
   "Tek başına da oyna", "Adaları al, haritaya hükmet". Zorunlu değil.

"Kumar", "bahis", "şans oyunu" sözcükleri hiçbir görselde olmamalı (derecelendirme
anketinde kumar "yok").
