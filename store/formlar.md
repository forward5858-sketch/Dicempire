# Mağaza formlarının cevapları

Bu cevaplar gizlilik politikasıyla (`index.html`, `en/privacy.html`) ve iOS gizlilik
bildirimiyle (`ios/App/App/PrivacyInfo.xcprivacy`) birebir uyumlu. Oyuna veri toplayan bir
şey eklenirse (analiz, hata raporlama, reklam, hesap, sohbet, skor tablosu) önce politika,
sonra bildirim, sonra bu formlar güncellenmeli. Sıra bozulursa iki mağaza da uygulamayı
kaldırabilir.

Oyunun gerçekte gönderdiği: **oyuncu adı** (en fazla 14 karakter, odadakilere görünür),
**hamleler ve oda durumu**, sunucunun verdiği **rastgele oturum anahtarı**. Hepsi yalnızca
sunucu belleğinde, oda kapanınca siliniyor (`server.js`).

---

## Google Play Console › Uygulama içeriği

| Bölüm | Cevap |
|---|---|
| Gizlilik politikası | `https://forward5858-sketch.github.io/Dicempire/` |
| Uygulama erişimi | Tüm işlevler özel erişim gerektirmeden kullanılabilir |
| Reklamlar | Hayır, uygulamam reklam içermiyor |
| İçerik derecelendirmesi | Aşağıdaki IARC cevapları |
| Hedef kitle | **13-15, 16-17, 18+** (13 yaş altı seçilmez, gerekçe aşağıda) |
| Uygulama çocuklara hitap edebilir mi? | Hayır |
| Haber uygulaması / Devlet / Finans / Sağlık | Hayır / Hayır / Yok / Yok |
| Reklam kimliği | Kullanmıyor |

**Hedef kitle kararı.** İçerik her yaşa uygun ve çocuklar indirebilir. Ama oyun çevrim içi
ve oyuncu adları başka oyunculara görünüyor; 13 yaş altını hedef kitleye eklemek uygulamayı
Google'ın "Aileler" programına sokar (ek politika incelemesi, kullanıcı etkileşimi için ek
şartlar). 1.0'da buna girmiyoruz.

### Veri güvenliği (Data safety)

| Soru | Cevap |
|---|---|
| Zorunlu kullanıcı veri türlerinden birini topluyor ya da paylaşıyor musunuz? | **Evet** |
| Toplanan bütün veriler aktarım sırasında şifreleniyor mu? | **Evet** (uygulama sunucuya yalnız `wss://` ile bağlanır; `scripts/build-app.js` https olmayan adresi reddeder) |
| Kullanıcıların veri silme isteğinde bulunmasını sağlıyor musunuz? | Hayır; veri oda kapanınca **kendiliğinden** silinir (açıklama alanına bunu yaz) |
| Hesap oluşturma | Uygulamam kullanıcıların hesap oluşturmasına izin vermiyor |

Veri türleri:

| Tür | Toplanıyor | Paylaşılıyor | Geçici işleniyor | Zorunlu mu | Amaç |
|---|---|---|---|---|---|
| Kişisel bilgiler › **Ad** | Evet | Hayır | **Evet** | Zorunlu | Uygulama işlevselliği |
| Uygulama etkinliği › **Kullanıcı tarafından oluşturulan diğer içerik** (hamleler) | Evet | Hayır | **Evet** | Zorunlu | Uygulama işlevselliği |

Gerekçeler:
- **Ad** Google'ın tanımında takma adı da kapsıyor, bu yüzden beyan ediliyor.
- **Paylaşılmıyor:** adın odadaki arkadaşlarına görünmesi kullanıcının kendi başlattığı ve
  beklediği bir aktarım; Google bunu "paylaşım" saymıyor. Üçüncü bir şirkete veri gitmiyor.
- **Oturum anahtarı** beyan edilmiyor: sunucunun o oda için ürettiği rastgele bir sayı,
  cihaza ya da kişiye bağlı bir kimlik değil ve oda kapanınca yok oluyor.

### IARC içerik derecelendirme anketi

Kategori: **Oyun**.

| Konu | Cevap |
|---|---|
| Şiddet | Hayır (soyut harita, sayılarla asker; karakter, kan ya da ölüm görüntüsü yok) |
| Korku, cinsellik, küfür, uyuşturucu, ayrımcılık | Hayır |
| Kumar ya da kumar simülasyonu | **Hayır** (zar bir oyun mekaniği; bahis, para, kumarhane oyunu yok) |
| Kullanıcılar birbiriyle etkileşebiliyor mu? | **Evet** (oyuncu adları ve hamleler aynı odadakilere görünür; sohbet yok) |
| Kullanıcının konumunu paylaşma | Hayır |
| Dijital ürün satın alma / rastgele ödüllü satın alma | Hayır / Hayır |

Beklenen sonuç: **PEGI 3 / ESRB Everyone / USK 0**, "Kullanıcılar Etkileşime Girer" notuyla.

---

## App Store Connect

### App Privacy (Uygulama Gizliliği)

| Soru | Cevap |
|---|---|
| Gizlilik politikası URL'si | `https://forward5858-sketch.github.io/Dicempire/` |
| Bu uygulamadan veri topluyor musunuz? | **Evet** |

| Veri türü | Kullanım | Kimliğe bağlı mı | Takip için mi |
|---|---|---|---|
| İletişim Bilgileri › **Ad** | Uygulama İşlevselliği | **Hayır** | **Hayır** |
| Kullanıcı İçeriği › **Oyun İçeriği** (Gameplay Content) | Uygulama İşlevselliği | **Hayır** | **Hayır** |

Mağaza sayfasında "Size Bağlı Olmayan Veriler: Ad, Kullanıcı İçeriği" ve **"Takip Edilmez"**
görünür. `PrivacyInfo.xcprivacy` aynı iki türü bildiriyor; ikisi ayrışmamalı.

### Yaş derecelendirmesi

| Bölüm | Cevap |
|---|---|
| Şiddet, korku, cinsellik, küfür, madde, tıbbi içerik | Yok |
| Kumar simülasyonu, yarışma, gerçek parayla kumar | Yok |
| Rastgele ödüllü satın alma | Hayır |
| Reklam | Hayır |
| Sınırsız web erişimi | Hayır |
| Sohbet / mesajlaşma | Hayır |
| Kullanıcı tarafından oluşturulan içerik | **Evet** (oyuncu adları başka oyunculara görünür) |
| Ebeveyn denetimi / yaş doğrulama | Hayır |

Beklenen sonuç: **4+** ya da kullanıcı içeriği nedeniyle bir üst kademe. İkisi de sorun değil.

**Kullanıcı içeriği kuralı (1.2).** Apple, kullanıcıların birbirine içerik gösterebildiği
uygulamalarda kötüye kullanıma karşı önlem ister. Bizdekiler: odaya yalnızca oda kodunu bilen
katılır, oda sahibi istemediği oyuncuyu çıkarır, adlar 14 karakterle sınırlı ve HTML'den
temizleniyor, destek sayfasında iletişim yolu var. Sohbet yok. İnceleme ekibi sorarsa cevap bu.

**Çocuk kategorisi (Kids):** seçilmez. Çevrim içi etkileşim ve dış bağlantılar (gizlilik,
WhatsApp daveti) Kids kategorisinde ebeveyn kapısı ister.

### Diğer alanlar

| Alan | Cevap |
|---|---|
| Şifreleme (Export Compliance) | Standart dışı şifreleme yok. Info.plist'te `ITSAppUsesNonExemptEncryption = NO` hazır, soru her yüklemede sorulmaz |
| İçerik hakları | Yazı tipleri SIL Open Font License (ticari kullanıma açık, `public/fonts/OFL-*.txt`). Görsellerin (logo, menü arka planı, ikon) haklarının sende olduğunu teyit et |
| Giriş gerekli mi? | Hayır |
| AB DSA satıcı durumu | **Satıcı değil (non-trader)**: oyun ücretsiz ve gelir yok. Satıcı seçilirse adresin ve telefonun AB mağazasında herkese açık görünür |
| Fiyat | Ücretsiz, tüm ülkeler |

İnceleme notu (App Review Notes, İngilizce, olduğu gibi yapıştır; sunucu adresini kendi
adresinle değiştir):

```
Dicempire is an online dice strategy game. No account or login is needed.

To test alone: enter any name and tap "Play vs computer", then "Start game". A computer opponent plays its turns automatically; you can add up to 3 with "Add computer player".

To test multiplayer: create a room on one device and join it from a second device (or from a desktop browser at https://dicempire.onrender.com) with the 4-letter room code shown in the lobby.

Privacy and Support links are at the bottom of the main menu. The game has no ads, no in-app purchases and no chat; player names are visible only to people in the same private room, and the host can remove any player.
```
