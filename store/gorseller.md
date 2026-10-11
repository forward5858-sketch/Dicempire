# Mağaza görselleri

## Gerekli dosyalar

| Dosya | Mağaza | Ölçü | Kural |
|---|---|---|---|
| Uygulama ikonu | App Store | 1024×1024 PNG | Saydamlık yok, köşeleri yuvarlatma (Apple kendisi keser) |
| Uygulama ikonu | Google Play | 512×512 PNG, ≤1 MB | Kare, köşeleri Google keser; içerik ortadaki %80'de kalsın |
| Öne çıkan görsel | Google Play (zorunlu) | 1024×500 JPG ya da PNG | Saydamlık yok. Ortaya logo, kenarlara harita parçası. Video eklenirse üstüne oynat düğmesi biner, merkezi boş tut |
| iPhone ekran görüntüleri | App Store (zorunlu) | 1320×2868 dikey (6,9") | 3-10 adet, her dil için ayrı. Apple küçük ekranlara kendisi ölçekler |
| iPad ekran görüntüleri | App Store (iPad destekleniyorsa zorunlu) | 2064×2752 dikey (13") | 3-10 adet |
| Telefon ekran görüntüleri | Google Play (zorunlu) | 1080×1920 dikey | 4-8 adet. Önerilerde öne çıkmak için en az 4 tane, en az 1080 piksel |
| Tablet ekran görüntüleri | Google Play (önerilir) | 1600×2560 dikey | 4 adet. Yoksa "tablet için tasarlanmış" listelerine girmez |

Oyun yatay oynanıyorsa ölçüleri ters çevir.

Tek ikon kaynağı yeter: 1024×1024 bir ana dosya hazırla, 512'liği ondan
küçült. Android uyarlanabilir ikonu (adaptive icon) için ön plan ve arka plan
katmanlarını ayrı ver; ön plandaki çizim ortadaki 66 dp çemberden taşmasın.

## Ekran görüntüsü senaryosu

Beş kare, hepsinin üstünde kısa bir başlık bandı olsun. İlk iki kare en
önemlisi: mağaza aramasında yalnızca onlar görünür.

| # | Ekranda ne var | TR başlık | EN başlık |
|---|---|---|---|
| 1 | Oyunun ortası, harita renk renk bölünmüş, senin rengin önde | Zarını at, haritayı fethet | Roll the dice, conquer the map |
| 2 | Saldırı anı, iki tarafın zarları görünüyor | Her saldırı bir karar | Every attack is a choice |
| 3 | Kurulum ekranı, birkaç oyuncu adı girilmiş | Arkadaşlarınla tek cihazda | Pass and play with friends |
| 4 | Başarımlar ya da istatistikler | Başarımlar ve istatistikler | Achievements and stats |
| 5 | Farklı bir tema ile harita | Reklamsız. İnternetsiz. | No ads. No internet. |

"Kumar", "bahis", "şans oyunu" gibi sözcükleri hiçbir görselde ve metinde
kullanma. Derecelendirme anketinde kumar "yok" dedik; görsel tutarsız olursa
inceleme takılır.

## Nasıl çekilir

En temiz yol oyunun web sürümünü masaüstü Chrome'da açıp geliştirici
araçlarındaki cihaz kipini (Ctrl+Shift+M) kullanmak:

| Hedef | Görünüm (CSS px) | Ölçek (DPR) |
|---|---|---|
| iPhone 6,9" | 440×956 | 3 |
| iPad 13" | 1032×1376 | 2 |
| Play telefon | 360×640 | 3 |
| Play tablet | 800×1280 | 2 |

Cihaz kipinde "Edit" → özel cihaz ekle, sonra menüden "Capture screenshot".
Çıkan dosya tam olarak hedef ölçüde olur. Başlık bandını Figma ya da Canva'da
üstüne ekle.

Kaynak kod bu oturuma açıldığında bu çekimi otomatikleştiren bir betik
yazabilirim: oyunu belirli bir duruma getirip dört ölçüde ve iki dilde
çeker.
