# Dicempire — Zar ve Toprak

Arkadaşlarınla oynanan, 2–4 kişilik zar ve ada savaşı. Herkes kendi telefonundan katılır: biri oda kurar, davet linkini ya da 4 harfli oda kodunu gönderir, oda sahibi oyunu başlatır. Telefon için tasarlandı; yatay çevirince harita büyür.

## Nasıl çalışır

- `server.js` hem oyun sayfasını dağıtır hem de odaları ve oyunu WebSocket üzerinden yönetir. Zarları sunucu atar, her hamleyi sunucu kontrol eder; telefonlar sadece dokunuşları gönderir ve gelen durumu çizer.
- `public/rules.js` oyunun kurallarıdır; sunucu ve tarayıcı aynı dosyayı kullanır.
- `public/index.html` ana menü, lobi ve oyun ekranıdır.
- `public/i18n.js` oyundaki bütün metinlerin çevirileridir.
- Kök klasördeki `index.html` oyun değil, gizlilik politikası sayfasıdır; `en.html` aynı politikanın İngilizcesidir. İkisi birbirine bağlantı verir, birini değiştirirsen ötekini de güncelle.
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

Testler için: `npm test`

## İnternette yayınlama (Render, ücretsiz)

1. [render.com](https://render.com) adresinde GitHub hesabınla giriş yap.
2. **New → Web Service** seç ve bu depoyu bağla.
3. Ayarları şöyle doldur:
   - **Root Directory:** boş bırak (oyun deponun kök klasöründe)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/healthz`
   - **Instance Type:** Free
4. **Create Web Service**'e bas. Birkaç dakika sonra `https://dicempire-xxxx.onrender.com` gibi bir adres verilir; oyun bu adreste açılır, davet linkleri de bu adresle oluşur.

Ücretsiz planda sunucu bir süre hiç trafik almazsa uyur; uyandıktan sonraki ilk açılış 30–60 saniye sürebilir. Sürekli açık kalmasını istersen ücretli plana geçmek gerekir.

Railway, Fly.io gibi Node.js çalıştırabilen ve WebSocket destekleyen başka bir servis de olur: kök klasör yine deponun kökü, başlatma komutu `npm start`. Sunucu portu `PORT` ortam değişkeninden okur.

## Kısaca kurallar

- **Harita:** Her oyuncunun 7 altıgenlik bir adası var, adalar merkez etrafında simetrik dizilir.
- **Takviye:** Sıran gelince kazandığın askerleri kendi alanlarına yerleştirirsin.
- **Saldırı:** En az 2 askerli alanını seçip komşu alana saldırırsın. Büyük zar kazanır, eşitlikte savunan kazanır.
- **Taşıma:** Saldırı bitince bir kez komşu alanlar arasında asker taşıyabilirsin.
- **Kazanmak:** Haritanın %60'ını alan ya da rakiplerini eleyen kazanır.
