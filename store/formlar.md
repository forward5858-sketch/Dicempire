# Mağaza formlarının cevapları

Bu cevaplar gizlilik politikasıyla (`index.html`) birebir uyumlu. Oyuna veri
toplayan bir şey eklenirse (analiz, hata raporlama, reklam, bulut kaydı,
çevrimiçi oyun) önce politika, sonra bu formlar güncellenmeli. Aksi halde
iki mağaza da uygulamayı kaldırabilir.

---

## Google Play Console › Uygulama içeriği

| Bölüm | Cevap |
|---|---|
| Gizlilik politikası | `https://forward5858-sketch.github.io/Dicempire/` |
| Uygulama erişimi | Tüm işlevler özel erişim gerektirmeden kullanılabilir |
| Reklamlar | Hayır, uygulamam reklam içermiyor |
| İçerik derecelendirmesi | Aşağıdaki IARC cevapları |
| Hedef kitle ve içerik | **13-15, 16-17, 18+** (13 yaş altı seçilmez, gerekçesi aşağıda) |
| Uygulama çocuklara hitap edebilir mi? | Hayır |
| Haber uygulaması | Hayır |
| COVID-19 temaslı takip | Hayır |
| Veri güvenliği | Aşağıdaki cevaplar |
| Devlet uygulaması | Hayır |
| Finansal özellikler | Uygulamamda finansal özellik yok |
| Sağlık | Uygulamamda sağlık özelliği yok |
| Reklam kimliği (Advertising ID) | Hayır, kullanmıyor |

**Hedef kitle kararı.** Oyunun içeriği her yaşa uygun ve derecelendirmesi
PEGI 3 / Everyone çıkacak; çocuklar yine indirebilir. Ama hedef kitleye
13 yaş altını eklemek uygulamayı Google'ın "Aileler" programına sokar: ek
politika incelemesi, daha uzun onay süresi ve her güncellemede ek kontrol.
1.0'da buna değmez. Çocuklara yönelik bir sürüm (ör. "Teacher Approved")
istenirse 1.x'te ayrıca değerlendiririz. Mağaza görsellerinde ve
metinlerinde çocuklara özel bir dil kullanmıyoruz, bu da bu seçimle tutarlı.

### Veri güvenliği (Data safety)

| Soru | Cevap |
|---|---|
| Uygulamanız zorunlu kullanıcı veri türlerinden herhangi birini topluyor ya da paylaşıyor mu? | **Hayır** |

Bu cevap verildiğinde form biter ve mağaza sayfasında "Veri toplanmıyor" ve
"Üçüncü taraflarla veri paylaşılmıyor" yazar.

Gerekçe: Google'ın tanımına göre "toplama", verinin cihazdan dışarı
aktarılmasıdır. Ayarlar, kayıt, istatistikler ve oyuncu adları cihazdan hiç
çıkmıyor. Android'in kendi yedeklemesi kullanıcının Google hesabına ait bir
sistem hizmeti; geliştirici bu veriye erişemiyor.

Hesap silme bölümü: uygulamada hesap oluşturma olmadığı için
**"Uygulamam kullanıcıların hesap oluşturmasına izin vermiyor"** seçilir.

### IARC içerik derecelendirme anketi

Kategori: **Oyun**. Oyunun soyut bir zar ve harita oyunu olduğu varsayımıyla
(kan, karakter ölümü ya da gerçekçi savaş görüntüsü yok):

| Konu | Cevap |
|---|---|
| Şiddet | Hayır |
| Korku / ürkütücü içerik | Hayır |
| Cinsellik, çıplaklık | Hayır |
| Küfür, kaba dil | Hayır |
| Uyuşturucu, alkol, tütün | Hayır |
| Kumar ya da kumar simülasyonu | **Hayır** (zar bir oyun mekaniği; bahis, gerçek ya da sanal para, kumarhane oyunu yok) |
| Kullanıcılar arası etkileşim / içerik paylaşımı | Hayır |
| Kullanıcının konumunu paylaşma | Hayır |
| Dijital ürün satın alma | Hayır |
| Rastgele ödüllü satın alma (loot box) | Hayır |
| Ayrımcılık | Hayır |

Beklenen sonuç: **PEGI 3, ESRB Everyone, USK 0, IARC 3+**.

Oyunda askerler savaşıyor, kan ya da ölen karakterler gösteriliyorsa "Şiddet"
sorusu "fantastik / karikatür şiddet" olarak cevaplanmalı. Sonuç PEGI 7 olur,
sorun değil.

---

## App Store Connect

### App Privacy (Uygulama Gizliliği)

| Soru | Cevap |
|---|---|
| Gizlilik politikası URL'si | `https://forward5858-sketch.github.io/Dicempire/` |
| Siz ya da üçüncü taraf iş ortaklarınız bu uygulamadan veri topluyor musunuz? | **Hayır, bu uygulamadan veri toplamıyoruz** |

Mağaza sayfasında **"Veri Toplanmıyor"** etiketi görünür.

### Yaş derecelendirmesi

Apple'ın 2025'te yenilenen anketi. Hepsine **Yok / Hayır**:

| Bölüm | Cevap |
|---|---|
| Uygulama içi özellikler: sohbet, kullanıcı içeriği, reklam, sınırsız web erişimi | Hayır |
| Ebeveyn denetimi / yaş doğrulama | Hayır |
| Şiddet (karikatür, gerçekçi, uzun süreli) | Yok |
| Korku, cinsellik, çıplaklık, küfür, madde kullanımı | Yok |
| Kumar simülasyonu, yarışma, gerçek parayla kumar | Yok |
| Tıbbi / sağlık bilgisi | Yok |
| Rastgele ödüllü satın alma | Hayır |

Beklenen sonuç: **4+**. IARC'taki şiddet notu burada da geçerli: asker ve
kan varsa "Seyrek / hafif karikatür şiddeti" seçilir, sonuç 9+ olur.

**Çocuk kategorisi (Kids):** Seçilmez. Kids kategorisi dış bağlantılara
ebeveyn kapısı (parental gate) ister. Oyundaki gizlilik bağlantısı bunu
gerektirir. Ayrıca inceleme daha sıkıdır. Google Play'deki kararla aynı
gerekçe.

### Diğer App Store alanları

| Alan | Cevap |
|---|---|
| Şifreleme (Export Compliance) | Standart dışı şifreleme yok → Info.plist'e `ITSAppUsesNonExemptEncryption = NO`. Böylece her yüklemede soru sorulmaz |
| İçerik hakları | Üçüncü taraf içerik yok (oyunun müzik/ses/yazı tipleri sana aitse ya da lisansları ticari kullanıma izin veriyorsa). Lisansları kontrol et |
| Giriş bilgileri (Sign-in required) | Hayır |
| İnceleme notu (App Review Notes) | Aşağıdaki metin |
| AB Dijital Hizmetler Yasası (DSA) satıcı durumu | **Satıcı değil (non-trader)**. Oyun ücretsiz ve gelir yok. Satıcı seçilirse adresin ve telefonun AB mağazasında herkese açık görünür. Para kazanmaya başlarsan bu değişir |
| Fiyat | Ücretsiz, tüm ülkeler |

İnceleme notu (App Review Notes, İngilizce):

```
Dicempire is a fully offline single-device strategy game. No account, login or network connection is required; all features are available immediately. The game collects no data and contains no ads or in-app purchases. The privacy policy is reachable in-app from the Settings screen.
```

Son cümle oyunda Ayarlar ekranına gizlilik bağlantısı eklendikten sonra
doğrudur. Bu, App Store'un zorunlu tuttuğu bir şey (bkz. `store/README.md`,
Faz 1).
