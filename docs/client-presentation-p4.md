# Müşteri sunumu: yeni Magnificent Travel sitesi, önizleme (P4.3)

Taslak, 2026-10-17. Önizleme adresi: https://magnificenttravel.vercel.app (özel paylaşılır). Burak müşteriye gönderirken kendi sesiyle uyarlar; İngilizce sürümü müşteriyle yazışma dilinde yazılır.

## 1. Ne gösteriyoruz

Üç sitenin (magnificenttravel.com, eztravelturkey.com, torukoryoko.com) tek bir sitede birleşmiş ilk hali. Adres yapısı eskisiyle aynı: `/en/`, `/zh/`, `/jp/` önekleri ve sondaki `/`. Bu aşamada sizden istediğimiz: **yapıyı, tasarımı ve sayfa türlerini onaylamanız** ve aşağıdaki sorulara cevap vermeniz. Onayınızdan sonra içeriği dillere yayarız.

## 2. Gerçek olan ve henüz iskelet olan

| | Durum |
|---|---|
| İngilizce içerik: 118 tur, 5 ülke sayfası, 6 kombo, 10 kategori sayfası, 34 blog yazısı, ana sayfa, About, FAQ, İletişim, Destinations | **Gerçek**, eski sitedeki metinler değişmeden aktarıldı (başlık, açıklama, H1, adresler aynı) |
| Fiyatlar | EUR eski siteden. **USD fiyatları sizin Studio'da girmeniz gerekiyor** (girilmeyen turda USD görünmez) |
| Tur görselleri | Depositphotos hesabınızdaki satın alınmış fotoğraflar (146 resim, lisans kaydı tutuluyor). Beğenmediğiniz resmi Studio'dan değiştirebilirsiniz |
| Çince ve Japonca | **Henüz iskelet**: menü, düğmeler ve sabit metinler çevrildi ama **anadil denetimi yapılmadı**; sayfa içerikleri İngilizce. Gerçek zh/jp içeriği sonraki fazda eski sitelerden alınacak |
| Form e-postaları | Form çalışıyor (Cloudflare Turnstile ile spam koruması); **e-posta henüz size ulaşmıyor** (e-posta sağlayıcısı bağlanınca) |
| Alan adı | Henüz bağlı değil; yayın günü ayrıca planlanacak |

## 3. Eski siteden bilerek farklı olanlar

- **Her sayfada tek H1** (eskiden üçtü: yasal metin pencereleri de H1 taşıyordu).
- **Ana sayfa başlığı:** "Magnificent Travel: Turkey, Greece, Egypt, Jordan & Morocco" (60 karakterin altında ve Fas dahil; eskisi 86 karakterdi, Fas yoktu).
- **Ülke sayfaları kategori kartı gösterir, 32 turu alt alta dizmez** (sizin önerinizdi). Mısır, Ürdün ve Fas için de kategori sayfaları açıldı (süreye göre, 7 yeni adres).
- **Yorumlar sekmesi yok**, "vergiler dahil" ifadesi yok (canlı sitede olmadığı için eklenmedi).
- **Israel hiçbir yerde yok.**
- Tur sayfasında fiyat kutusu ve teklif formu sağ tarafta; sekmeler: Overview, Itinerary, Route Map, Tour Price, Payment Summary, Trip Cancellation Terms ve diğerleri.
- Sayfa yapısı sabit (D37): editör metni ve resimleri değiştirir, bölüm sırasını değiştiremez.
- Eski sitedeki `/en/videos/` sayfası kaldırıldı, blog sayfasına yönlendiriliyor.

## 4. Onay kontrol listesi (sizden bir cevap bekliyoruz)

1. **URL yapısı** (`/en/destinations/turkey-tours/...`, dil önekleri, sondaki `/`): uygun mu?
2. **Sayfa türleri:** ana sayfa, ülke, kategori, kombo, tur, blog, About, FAQ, İletişim, Destinations. Eksik veya fazla var mı?
3. **Tasarım:** renkler, yazı tipleri, ana sayfa bölümleri, tur sayfası blokları (kutular, sekmeler, galeri, fiyat kartı).
4. **Dil değiştirici:** sağ üstteki menü (bayraksız) uygun mu?
5. **Tur sayfası blokları:** Overview, Itinerary, galeri ve ışık kutusu, Tour Price, Payment Summary, Trip Cancellation Terms. Eksik blok var mı?
6. **Ekip bloğu:** ekip fotoğraflarının sahibi onay verdi mi, saat dilimi doğru mu?
7. **USD fiyatlar ve otel/kalkış alanları:** Studio'dan girişi kim yapacak?

## 5. Test sonuçları (özet)

- 200 sayfa tarandı: **0 kırık iç link, 0 kırık resim**, her sayfada tek H1, doğru canonical.
- Başlık/açıklama/H1/canonical: eski sitedeki değerlerle aynı (istisnalar: ana sayfa başlığı, About açıklaması 195 → 141 karakter, hub açıklamasındaki Israel). Ayrıntı: `docs/baseline/seo-parity-2026-10-17.md`.
- Teknik SEO kabul listesi: 22 geçti, 2 kalan (hız: lab LCP 3,9-5,7 sn, hedef 2,5; güvenlik başlıkları CSP/HSTS) ilerideki fazlara yazıldı. Ayrıntı: `docs/baseline/ek-h-first-pass-2026-10-17.md`.
- Erişilebilirlik (axe) ve 390/1440 piksel ekran görüntüleri: bkz. QA özeti.

## 6. Sonraki adım

Onay gelirse: P5 (Çince ve Japonca içerik), P6 (Studio'nun tamamlanması, yedek, webhook), P7 (yönlendirmeler), sonra yayın. **Onay olmadan veri modeli kilitlenmez.**
