# Dicempire — Zar ve Toprak

Arkadaşlarınla oynanan, 2–4 kişilik zar ve ada savaşı. Herkes kendi telefonundan katılır: biri oda kurar, davet linkini ya da 4 harfli oda kodunu gönderir, oda sahibi oyunu başlatır. Telefon için tasarlandı; yatay çevirince harita büyür.

## Nasıl çalışır

- `server.js` hem oyun sayfasını dağıtır hem de odaları ve oyunu WebSocket üzerinden yönetir. Zarları sunucu atar, her hamleyi sunucu kontrol eder; telefonlar sadece dokunuşları gönderir ve gelen durumu çizer.
- `public/rules.js` oyunun kurallarıdır; sunucu ve tarayıcı aynı dosyayı kullanır.
- `public/index.html` ana menü, lobi ve oyun ekranıdır.
- `public/i18n.js` oyundaki bütün metinlerin çevirileridir.
- `bot.js` bilgisayar rakiptir: sırası gelen bot için bir sonraki hamleyi seçer, sunucu onu insanın dokunuşuyla aynı kural fonksiyonlarından geçirir.
- Kök klasördeki `index.html` oyun değil, gizlilik politikası sayfasıdır (GitHub Pages); İngilizcesi `en/privacy.html`, destek sayfaları `destek.html` ve `en/support.html`. Biri değişirse diğer dildekini de güncelle.
- `ios/` ve `android/` mağaza uygulamalarıdır (Capacitor); `store/` mağaza metinleri, formlar ve ekran görüntüleri.
- Yazı tipleri (Rubik ve Alfa Slab One, SIL Open Font License) `public/fonts/` klasöründedir; oyun dışarıdan hiçbir dosya yüklemez.
- Ana menü arka planı `public/menu-dikey.webp` (dikey ekran) ve `public/menu-yatay.webp` (yatay ekran) dosyalarından gelir.
- Logo `public/logo.webp` (arka planı şeffaf; ana menü, lobi ve kazanma ekranında). Paylaşım görseli `public/og-image.webp`, simgeler `public/favicon-48.png`, `public/apple-touch-icon.png` ve `public/icon-512.png`.

### Bağlantı kopunca

- Sayfa yenilenirse ya da internet kısa süre giderse oyuncu otomatik olarak aynı koltuğa döner.
- Sırası gelen oyuncu bağlı değilse 45 saniye sonra sırası geçilir.
- Lobide bağlantısı kopan oyuncu 1 dakika içinde dönmezse listeden çıkar. Oda sahibi düşerse yetki bağlı olan ilk oyuncuya geçer.
- Oyun sırasında "Odadan çık" diyen oyuncunun alanları tarafsız olur. Tek oyuncu kalırsa o kazanır.
- Kimse bağlı değilse oda 10 dakika sonra silinir. Odalar sunucunun belleğinde tutulur; sunucu yeniden başlarsa açık odalar kapanır.

## Dil desteği

Oyun Türkçe, İngilizce, Almanca, İspanyolca, Fransızca ve Rusça oynanabilir. İlk açılışta telefonun diline göre seçilir (desteklenmeyen bir dilse İngilizce açılır). Ana menüdeki, lobideki ve oyun içindeki ℹ️ penceresindeki 🌐 menüsünden istenildiği an değiştirilebilir; seçim cihazda hatırlanır. Aynı odadaki herkes kendi dilinde oynar: sunucu metin değil, anahtar ve sayılar gönderir (hata kodları, savaş günlüğü kayıtları), her telefon bunları kendi dilinde yazar.

Yeni dil eklemek için `public/i18n.js` dosyasında `LANGS` listesine dilin adını, `DICT` içine de Türkçe sözlükteki bütün anahtarları içeren yeni bir sözlük ekle. `npm test` eksik ya da fazla anahtarları ve yanlış yer tutucuları yakalar.

## Bilgisayarda çalıştırma

Node.js 18 ya da daha yenisi gerekir.

```bash
npm install
npm start
```

Sonra tarayıcıda `http://localhost:3000` adresini aç. Aynı Wi-Fi'daki telefonlardan denemek için bilgisayarın yerel IP adresini kullan (örneğin `http://192.168.1.20:3000`).

Testler için: `npm test`. Bilgisayara karşı denemek için ana menüde "Bilgisayara karşı oyna".

## İnternette yayınlama (Render)

Depodaki `render.yaml` sunucuyu tarif eder: render.com → **New → Blueprint** → bu depo. Her zaman açık
**Starter** plan (~7 $/ay) seçili, çünkü mağaza uygulaması bu sunucuya bağlanıyor ve ücretsiz plan
boşta uyuyup ilk açılışı 30–60 saniye geciktiriyor. Sağlık kontrolü `/healthz`. Odalar bellekte
tutulduğu için her deploy açık odaları kapatır.

Railway, Fly.io gibi Node.js çalıştırabilen ve WebSocket destekleyen başka bir servis de olur:
başlatma komutu `npm start`, port `PORT` ortam değişkeninden okunur.

## Mağaza uygulamaları (iOS ve Android)

Uygulama oyunun sayfasını (`public/`) kendi içinde taşır, yalnızca oyun bağlantısı sunucuya gider.
Sunucunun adresi derlerken verilir:

```bash
DICEMPIRE_SERVER=https://dicempire.onrender.com npm run android   # Android Studio açılır
DICEMPIRE_SERVER=https://dicempire.onrender.com npm run ios       # Xcode açılır (Mac gerekir)
```

`npm run build:app` `public/`'i `www/`'ye kopyalayıp `config.js`'e adresi yazar, `npm run sync`
ardından yerel projeleri günceller. `public/` değiştiyse yeniden çalıştır. İkon ve açılış ekranı
`resources/` klasöründen `npx @capacitor/assets generate --assetPath resources` ile üretilir.
GitHub Actions her push'ta testleri, iOS derlemesini ve Android debug APK'yı çalıştırır.
Mağaza adımları: `store/README.md`.

## Kısaca kurallar

- **Harita:** Her oyuncunun 7 altıgenlik bir adası var, adalar merkez etrafında simetrik dizilir.
- **Takviye:** Sıran gelince kazandığın askerleri kendi alanlarına yerleştirirsin.
- **Saldırı:** En az 2 askerli alanını seçip komşu alana saldırırsın. Büyük zar kazanır, eşitlikte savunan kazanır.
- **Taşıma:** Saldırı bitince bir kez komşu alanlar arasında asker taşıyabilirsin.
- **Kazanmak:** Haritanın %60'ını alan ya da rakiplerini eleyen kazanır.
