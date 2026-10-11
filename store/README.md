# Dicempire: App Store ve Google Play yayın planı

Hedef: Dicempire 1.0'ı yaklaşık üç hafta içinde App Store ve Google Play'de
yayımlamak.

| Dosya | İçerik |
|---|---|
| `store/README.md` | Kararlar, zaman çizelgesi, yapılacaklar (bu dosya) |
| `store/magaza-metinleri.md` | Ad, alt başlık, anahtar kelimeler, açıklamalar (TR + EN) |
| `store/formlar.md` | Veri güvenliği, App Privacy, yaş derecelendirmesi, diğer form cevapları |
| `store/gorseller.md` | İkon, ekran görüntüsü ve öne çıkan görsel ölçüleri ve senaryosu |
| `store/ios/PrivacyInfo.xcprivacy` | iOS gizlilik bildirimi, Xcode projesine kopyalanacak |
| `store/sinir-kontrol.py` | Mağaza metinlerinin karakter sınırı denetimi |

---

## Stüdyo kararları

| # | Karar | Gerekçe |
|---|---|---|
| 1 | **Platformlar: Android + iOS + web** | Android ve web sürümleri zaten var. iOS eklenmesi gelirsiz bir oyunda bile kitleyi kabaca ikiye katlar |
| 2 | **iOS, Capacitor ile paketlenir** | Oyun bir web oyunu. Capacitor onu olduğu gibi yerel bir iOS uygulamasına koyar, titreşim gibi yerel özelliklere erişim verir ve dosyaları uygulamanın içinden sunar (internet gerekmez). Cordova bakım modunda; React Native ya da Flutter yeniden yazım demek |
| 3 | **Android sarmalayıcısına 1.0'da dokunulmaz** | Çalışıyor ve politikayla uyumlu. 1.1'de Android de Capacitor'a taşınıp tek kod tabanına geçilir |
| 4 | **Ücretsiz; reklam ve uygulama içi satın alma yok** | "Reklamsız, internetsiz, takipsiz" oyunun ana pazarlama mesajı. Satın alma eklemek Apple'da ücretli uygulama sözleşmesi, vergi ve banka formları ve AB'de adresin herkese açık olduğu "satıcı" statüsü getirir. 1.0 için gereksiz yük |
| 5 | **Derecelendirme 4+ / PEGI 3, hedef kitle 13+, çocuk kategorisi yok** | İçerik her yaşa uygun, çocuklar indirebilir. Ama Aileler programı ve Kids kategorisi ek inceleme ve ebeveyn kapısı ister. Ayrıntı `formlar.md`'de |
| 6 | **Diller: Türkçe + İngilizce** | Türkçe tek başına küçük bir pazar. Oyun henüz İngilizce değilse çevirisi Faz 1'in parçası. Oyun İngilizce değilken İngilizce mağaza sayfası açılmaz |
| 7 | **Paket kimliği Android'dekiyle aynı** | ör. `com.<sen>.dicempire`. iOS Bundle ID de aynı olur. Yayımlandıktan sonra değiştirilemez |
| 8 | **Sürüm 1.0.0** | Android `versionCode` ve iOS build numarası her yüklemede 1 artar |
| 9 | **Kademeli yayın** | Play'de %20 → %50 → %100, adımlar arası 2-3 gün, çökme yoksa. App Store'da elle yayın + 7 günlük aşamalı yayın |
| 10 | **iPhone + iPad** | Apple inceleme ekibi iPhone uygulamalarını da iPad'de dener. Arayüz iPad'de bozuluyorsa önce o düzeltilir |
| 11 | **Gizlilik sayfasının adresi değişmez** | `index.html` Türkçe gizlilik politikası olarak kalıyor; Play Console'a girilmiş olabilecek adres bozulmasın diye |
| 12 | **Destek kanalı: GitHub Issues + e-posta** | Apple destek sayfasında kolay bir iletişim yolu ister. GitHub hesabı gerektirdiği için tek başına yetmez; e-posta adresi eklenecek (senin yapacakların, madde 3) |

---

## Zaman çizelgesi

En uzun kalem Google'ın **kapalı test şartı**. 13 Kasım 2023'ten sonra
açılmış kişisel geliştirici hesapları, üretime çıkmadan önce **en az 12 test
kullanıcısıyla 14 gün kesintisiz** kapalı test yapmak zorunda. Bu yüzden
mevcut Android sürümüyle kapalı test hemen başlamalı. Kod işleri bu sırada
yapılır, test kanalına yeni sürüm yüklemek sayacı sıfırlamaz.

| Ne zaman | İş |
|---|---|
| Gün 0 | Apple Developer Program kaydı (onay 1-2 gün). Play kapalı testi başlat |
| Hafta 1 | Faz 1 kod işleri |
| Hafta 2 | TestFlight'ta iOS testi, görseller, mağaza sayfaları |
| Gün 15+ | Play'de üretim erişimi başvurusu (inceleme birkaç gün sürer). App Store'a gönderim (inceleme genellikle 1-2 gün) |
| ~Hafta 3 | Yayın |

---

## Faz 0: Bu depoda yapılanlar ✅

- [x] Gizlilik politikası iOS'u kapsayacak şekilde güncellendi, adresi aynı kaldı
- [x] İngilizce gizlilik politikası: `en/privacy.html`
- [x] Destek sayfaları (App Store zorunlu): `destek.html`, `en/support.html`
- [x] Ortak stil dosyası, sayfalar arası gezinme, dil bağlantıları
- [x] `.nojekyll`: GitHub Pages bu klasördeki `.md` dosyalarını siteye dönüştürmesin
- [x] Mağaza metinleri, form cevapları, görsel planı, iOS gizlilik bildirimi

## Faz 1: Oyun kodunda yapılacaklar (kaynak kod gerekli)

Bunları ben yapabilirim, ama oyunun kodu bu oturumdaki hiçbir depoda yok.

**Ortak**
- [ ] Ayarlar ekranına "Gizlilik politikası" ve "Destek" bağlantıları. Cihazın tarayıcısında açılmalı. Apple bunu zorunlu tutuyor (5.1.1)
- [ ] Ayarlar ekranında sürüm numarası
- [ ] Sayfaya içerik güvenlik politikası (CSP). Politikadaki "dışarıya istek yok" vaadini web ve iOS'ta teknik olarak da garanti eder:
  `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: blob:; media-src 'self' data: blob:; style-src 'self' 'unsafe-inline'">`
- [ ] İngilizce çeviri: cihaz diline göre otomatik seçilsin, Ayarlar'dan değiştirilebilsin
- [ ] Mobil cila: metin seçme, uzun basma menüsü, çift dokunup büyütme ve lastik bant kaydırma kapalı (`user-select: none`, `-webkit-touch-callout: none`, `touch-action: manipulation`, `overscroll-behavior: none`)
- [ ] Çentik ve alt çubuk payları: viewport'a `viewport-fit=cover`, kenarlara `env(safe-area-inset-*)`
- [ ] Uygulama arka plana geçince müzik dursun, oyun kaydedilsin (`visibilitychange`)

**Android**
- [ ] `targetSdkVersion 36` (Android 16). Ağustos 2026'dan beri yeni uygulama ve güncellemelerde zorunlu
- [ ] Kenardan kenara görünüm: targetSdk 35 ve üstünde zorunlu. Sistem çubukları oyunun üstüne binmemeli
- [ ] Geri hareketi: menüyü kapatsın; ana ekranda "çıkmak istiyor musun?" sorsun ya da oyunu kaydedip çıksın
- [ ] Android App Bundle (`.aab`), Play App Signing, küçültme (R8)
- [ ] Yedekten geri yükleme testi: yarım oyun ve istatistikler yeni cihaza gelmeli. Politika bunu vaat ediyor

**iOS (yeni)**
- [ ] Capacitor projesi: `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/haptics`, `@capacitor/splash-screen`, `@capacitor/status-bar`
- [ ] Titreşim `@capacitor/haptics` üzerinden. iOS web görünümünde `navigator.vibrate` çalışmaz
- [ ] Ekranın kararmaması: AppDelegate'te `UIApplication.shared.isIdleTimerDisabled = true`
- [ ] `store/ios/PrivacyInfo.xcprivacy` projeye eklenir
- [ ] Info.plist: `ITSAppUsesNonExemptEncryption = NO`, `CFBundleLocalizations = [tr, en]`, ekran yönü kilidi
- [ ] İkon ve açılış ekranı
- [ ] Sessiz mod düğmesiyle ses davranışı test edilir: oyun sesleri sessiz modda susmalı
- [ ] Xcode 26 / iOS 26 SDK ile derleme. Nisan 2026'dan beri App Store'a yükleme şartı

## Faz 2: Görseller

`store/gorseller.md`'deki ikon, öne çıkan görsel ve ekran görüntüleri.

## Faz 3: Test

- [ ] Google Play kapalı test: en az 12 kişi, 14 gün. Test kullanıcıları testi
      bırakmasın, sayaç kesintisiz olmalı. Aile ve arkadaşlardan 15-20 kişi davet et
- [ ] TestFlight: önce dahili test, sonra birkaç dış test kullanıcısı
- [ ] Kontrol listesi: uçak modunda ilk açılış, yarım oyunu kapatıp açma,
      telefon çağrısı ya da bildirimle kesinti, küçük ekran (iPhone SE),
      tablet, karanlık mod, sistem dili İngilizce

## Faz 4: Gönderim

- [ ] Play: üretim erişimi başvurusu, sonra %20 kademeli yayın
- [ ] App Store: `formlar.md`'deki inceleme notuyla gönder, onaydan sonra elle yayımla

## Faz 5: Yayın sonrası (1.1)

- Puan isteme penceresi (iOS `SKStoreReviewController`, Android In-App Review):
  birkaç galibiyetten sonra, ömür boyu en fazla birkaç kez. Veri toplamaz
- Android'i Capacitor'a taşıyıp tek kod tabanı
- İsteğe bağlı tek seferlik "destekçi paketi" satın alması (kozmetik tema)
- Yeni diller: mağaza verisine göre (Almanca, İspanyolca, Portekizce adaylar)

---

## Senin yapman gerekenler

Bunları ben yapamam. Hesap, para, kimlik ya da senin kararını gerektiriyor.

1. **Oyunun kaynak kodunu bana aç.** Faz 1'in tamamı buna bağlı. Kodu bu
   depoya (ör. `game/` klasörüne) ya da ayrı bir depoya koyup bu oturuma ekle.
2. **GitHub Pages'i aç ve bu dalı birleştir.** Depo ayarları → Pages →
   "Deploy from a branch" → `main` / `(root)`. Sonra
   `claude/jolly-dirac-hbkp3k` dalını `main`'e birleştir.
   `https://forward5858-sketch.github.io/Dicempire/destek.html` açılıyorsa tamam.
3. **Destek e-postası.** Oyuna özel bir adres aç (ör. Gmail'de yeni bir
   hesap). Bana yaz, destek sayfalarına ekleyeyim. Kişisel adresini
   kullanma: Google Play'de herkese açık görünür.
4. **Apple Developer Program** (yıllık 99 $). Bireysel kayıtta App Store'da
   satıcı olarak kendi adın görünür. Bir stüdyo adı istiyorsan şirket ve
   D-U-N-S numarası gerekir.
5. **Google Play kapalı testini hemen başlat.** 12 kişi, 14 gün.
6. **App Store Connect'te uygulama kaydı.** Bundle ID (Android paket adıyla
   aynı), SKU `dicempire-ios`, birincil dil Türkçe.
7. **Formları doldur.** `formlar.md`'den kopyala.
8. **İsim kontrolü.** Apple'da uygulama adı benzersiz olmalı; "Dicempire"
   alınmış mı bak. TÜRKPATENT ve EUIPO'da marka araması yap.
9. **Varsayımları doğrula** (`magaza-metinleri.md` ve `formlar.md`): oyun
   mekaniği, bilgisayar rakipler, aynı cihazda çok oyunculu, oyunun dili,
   ekran yönü, oyunda asker ya da kan olup olmadığı.
10. **Lisanslar.** Oyundaki müzik, ses efekti ve yazı tiplerinin ticari
    mağaza dağıtımına izin verdiğini kontrol et.
11. **Mac.** iOS derlemesi için Xcode gerekiyor. Mac yoksa bulut derleme
    kurarım (Codemagic ya da GitHub Actions macOS), ama imzalama
    sertifikalarını senin Apple hesabından oluşturman gerekir.
