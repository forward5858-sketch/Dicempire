# Dicempire: App Store ve Google Play yayın planı

| Dosya | İçerik |
|---|---|
| `store/README.md` | Kararlar, durum, senin yapacakların (bu dosya) |
| `store/magaza-metinleri.md` | Ad, alt başlık, anahtar kelimeler, açıklamalar (TR + EN) |
| `store/formlar.md` | Veri güvenliği, App Privacy, yaş derecelendirmesi, inceleme notu |
| `store/gorseller.md` | Ekran görüntüleri, öne çıkan görsel, ikon durumu |
| `store/screenshots/` | Mağaza ölçülerinde hazır ekran görüntüleri (TR + EN) |
| `store/sinir-kontrol.py` | Mağaza metinlerinin karakter sınırı denetimi |

---

## Stüdyo kararları

| # | Karar | Gerekçe |
|---|---|---|
| 1 | **Tek oyun, üç kapı: web, iOS, Android.** Uygulamalar oyunun sayfasını telefonun içinde taşır, yalnız oyun bağlantısı sunucuya gider | Web sürümüyle aynı kod; mağaza uygulaması sayfayı internetten çekmediği için açılışı hızlı ve Apple'ın "web sitesi sarmalayıcısı" (4.2) itirazına karşı sağlam |
| 2 | **Capacitor 8**, paket kimliği **`com.dicempire.game`** | Oyun düz HTML/JS; Capacitor onu olduğu gibi yerel uygulamaya koyuyor. Kimlik yayından sonra değişmez |
| 3 | **Bilgisayar rakipler eklendi** | 2 kişiden azla oyun açılamıyordu. Apple incelemecisi tek cihazla dener ve "çalışmıyor" diye reddederdi; ayrıca arkadaşı çevrim içi olmayan oyuncu uygulamayı silerdi |
| 4 | **Oda sahibi oyuncu çıkarabiliyor** | Apple 1.2: kullanıcıların birbirine içerik (burada ad) gösterdiği uygulamada kötüye kullanıma karşı önlem |
| 5 | **Sunucu: Render, her zaman açık "starter" plan (~7 $/ay), Frankfurt** | Ücretsiz plan boşta uyuyor ve ilk bağlantı 30–60 sn sürüyor; mağazadan inen biri ya da inceleme ekibi bunu bozuk uygulama sanar. Frankfurt Türkiye ve Avrupa'ya yakın |
| 6 | **Ücretsiz; reklam ve satın alma yok** | "Hesap yok, reklam yok, takip yok" ana mesaj. Satın alma Apple'da vergi/banka formları ve AB'de adresin herkese açık olduğu satıcı statüsü getirir |
| 7 | **Derecelendirme 4+ / PEGI 3, hedef kitle 13+, çocuk kategorisi yok** | Çevrim içi etkileşim + 13 yaş altı = Aileler programı ve ebeveyn kapısı yükü. Ayrıntı `formlar.md` |
| 8 | **Oyun 6 dilde, mağaza sayfası TR + EN** | Çeviriler oyunda hazır; mağaza sayfası çevirisini indirme verisine göre 1.1'de genişletiriz |
| 9 | **Dağınık üç dal birleştirildi** | Logo (`oyuna-isle`), gömülü yazı tipleri (`compassionate-mendel`, PR #1) ve çoklu dil (`friendly-ride`) birbirinden habersiz duruyordu; hepsi bu dalda tek oyunda |
| 10 | **Sürüm 1.0.0 (build 1)** | Her yüklemede Android `versionCode` ve iOS build numarası 1 artar |

## Durum

**Yapıldı ve doğrulandı**
- Bilgisayar rakipler, lobide bot ekleme ve oyuncu çıkarma: 22 test geçiyor; 540 bot-bot oyununda
  her hamle kurallara uygun ve her oyun bitiyor; tarayıcıda tek başına oyun oynandı
- Ana menüde dile göre Gizlilik ve Destek bağlantıları (Apple 5.1.1)
- iOS ve Android projeleri, iOS gizlilik bildirimi, şifreleme beyanı, ikon ve açılış ekranı
- GitHub Actions: her push'ta testler, **iOS derlemesi (geçti)** ve Android debug APK
- Gizlilik politikası ve destek sayfaları çok oyunculu sürüme göre yeniden yazıldı (TR + EN)
- Mağaza metinleri, form cevapları, inceleme notu, ekran görüntüleri, öne çıkan görsel

**Bilerek yapılmadı, senin kararın**
- **İki kişilik oyunda ilk başlayan avantajlı:** botlar birbirine karşı 300 oyunda ilk oyuncu
  %62 kazandı (4 kişide 29/23/27/21, dengeli). Kurala dokunmadım. Seçenek: iki kişilik oyunda
  ikinci oyuncuya başlangıçta +2 asker ya da ilk turda saldırı yasağı. Söylersen uygularım.

## Zaman çizelgesi

En uzun kalem Google'ın **kapalı test şartı**: 13 Kasım 2023'ten sonra açılmış kişisel
geliştirici hesapları, üretime çıkmadan önce **en az 12 test kullanıcısıyla 14 gün kesintisiz**
kapalı test yapmak zorunda. Sunucu açıldığı gün Android kapalı testi başlamalı.

| Ne zaman | İş |
|---|---|
| Gün 0 | Bu dal `main`'e, Render sunucusu, GitHub Pages, geliştirici hesapları |
| Gün 1 | İmzalı Android paketi → Play kapalı test (12+ kişi). iOS → TestFlight |
| Gün 1–14 | Test geri bildirimleri, düzeltmeler (yeni sürüm yüklemek sayacı sıfırlamaz) |
| Gün 2–3 | App Store'a gönderim (inceleme genellikle 1–2 gün) |
| Gün 15+ | Play'de üretim erişimi başvurusu, sonra %20 → %50 → %100 kademeli yayın |

---

## Senin yapman gerekenler

Sırayla. Hesap, para, kimlik ya da senin kararını gerektirdikleri için bunları ben yapamam.

1. **Bu dalı `main`'e birleştir** (`claude/jolly-dirac-hbkp3k`). Diğer üç dal ve PR #1 bunun
   içinde; birleştirdikten sonra kapatılabilir.
2. **Sunucuyu aç.** render.com → New → **Blueprint** → bu depo. `render.yaml` servisi kurar
   (Starter, ~7 $/ay). Verilen adres `https://dicempire.onrender.com` değilse GitHub'da
   Settings → Secrets and variables → Actions → Variables → `DICEMPIRE_SERVER` = o adres,
   ve bana yaz: inceleme notunu ve belgeleri güncellerim.
3. **GitHub Pages'i aç:** Settings → Pages → Deploy from a branch → `main` / `(root)`.
   `https://forward5858-sketch.github.io/Dicempire/destek.html` açılıyorsa tamam.
4. **Destek e-postası:** oyuna özel bir adres aç ve bana yaz, destek sayfalarına ekleyeyim.
   Şu an tek yol GitHub; Apple bunu yetersiz bulabilir.
5. **Geliştirici hesapları:** Apple Developer Program (99 $/yıl; bireysel kayıtta satıcı adı
   senin adın) ve Google Play Console (25 $, bir kez).
6. **İkonun 1024×1024 aslını ver** (`store/gorseller.md`). Şimdiki iOS ikonu büyütülmüş, hafif bulanık.
7. **Android paketi:** `DICEMPIRE_SERVER=https://<sunucu> npm run android` → Android Studio →
   Build → Generate Signed App Bundle. İmza anahtarını (keystore) kaybetme, yedekle.
   Play Console → uygulama oluştur → Kapalı test → `.aab` yükle → 12+ test kullanıcısı davet et.
8. **iOS paketi** (Mac ve Xcode 26 gerekir): `npm ci && DICEMPIRE_SERVER=https://<sunucu> npm run ios`
   → Xcode → Signing & Capabilities → Team seç → Product → Archive → Distribute → App Store
   Connect. Mac yoksa söyle, bulut derlemesini (Codemagic ya da GitHub Actions) kurarım; imza
   sertifikasını senin Apple hesabından oluşturman gerekir.
9. **App Store Connect:** yeni uygulama → Bundle ID `com.dicempire.game`, SKU `dicempire`,
   birincil dil Türkçe. Metinler `magaza-metinleri.md`, formlar ve inceleme notu `formlar.md`,
   görseller `store/screenshots/`.
10. **Gerçek telefonda dene:** TestFlight ve Play dahili test. Özellikle iki telefonla aynı odada
    oyun, bağlantı kopup geri gelme, telefonu yan çevirme, titreşim.
11. **İsim ve haklar:** "Dicempire" App Store'da alınmış mı bak (uygulama adı benzersiz olmalı),
    TÜRKPATENT/EUIPO marka araması yap; logo, menü görselleri ve ikonun ticari kullanım hakkı sende mi, teyit et.
12. **Karar:** iki kişilik oyundaki ilk oyuncu avantajı (yukarıda).
