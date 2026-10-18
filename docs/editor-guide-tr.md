# Magnificent Travel: İçerik Paneli Kullanım Kılavuzu

Panel adresi: **https://magnificenttravel.sanity.studio** (Google veya e-posta ile giriş; erişimi proje sahibi verir).
Bu kılavuz yeni tur, çeviri ve blog yazısı eklemeyi, yayınlamayı ve önizlemeyi anlatır. Hazırlayan: Webcraft. Son güncelleme: 2026-10-18.

## 1. Panelin yapısı

Sol menüde içerik türleri durur: **Tours** (turlar), **Destination pages** (ülke, kombo ve kategori sayfaları), **Blog posts**, **Blog categories**, **Authors**, **Text pages** (Hakkımızda, gizlilik vb.), **Hub pages**, **Home page** ve **Team**.
Her türü açınca önce dil seçersiniz (English, 繁體中文, 日本語). **Her dilin içeriği ayrı belgedir:** İngilizce bir turun Çincesi, ayrıca oluşturulan ikinci bir belgedir.

Bir belgeyi değiştirdiğinizde değişiklik **taslak** olarak saklanır; sitede görünmesi için sağ alttaki **Publish** (Yayınla) düğmesine basmalısınız. Yayından yaklaşık 20 saniye sonra site güncellenir.

## 2. Yeni tur eklemek

1. **Tours** → dil (ör. English) → sağ üstteki **+** (yeni belge).
2. **Basics** sekmesi:
   - **Language:** turun dili.
   - **Page address:** sitedeki adres, dil ve baştaki/sondaki eğik çizgi **olmadan**. Benzer bir turun adresini kopyalayıp sonunu değiştirin. Örnek: `destinations/turkey-tours/06-to-09-days-tours/my-new-tour`. Küçük harf kullanın, boşluk bırakmayın. Aynı dilde iki sayfa aynı adresi taşıyamaz, panel uyarır.
   - **Country or combination:** turun bulunduğu klasör (Turkey, Greece, Combination: Turkey and Greece vb.).
   - **Category folder:** yalnızca Türkiye ve Yunanistan turlarında, süre/paket klasörü (ör. `06-to-09-days-tours`). Diğerlerinde boş bırakın.
   - **Page title (H1), Overview, Nights, Days, Starting price** (EUR ve USD'yi ikisini de girin; boş bıraktığınız para birimi sitede görünmez), **Departure options, Trip facts**.
3. **Itinerary** sekmesi: rota, öne çıkanlar, harita ve gün gün program. **Included and notes** sekmesi: dahil/hariç, notlar, iptal koşulları, SSS, ilgili turlar. **Pictures** sekmesi: ana görsel (en az 1800 piksel genişlik, geniş) ve galeri.
4. **Search results** sekmesi: Google'da görünen başlık ve açıklama (aşağıda bölüm 5).
5. **Publish**. Tur otomatik olarak ilgili ülke/kategori sayfasında, tur listelerinde ve sitemap'te görünür.

## 3. Çeviri eklemek

Çeviri, diğer dilde **yeni bir belgedir.**
1. Diğer dilin altında (ör. 日本語) yeni tur oluşturun ve içeriği o dilde girin; **Language** alanını o dile ayarlayın.
2. İki belgenin **Same page in other languages** alanına **aynı kodu** yazın (ör. `tour-istanbul-cappadocia-7d`). Kod, dil menüsünü ve Google'a giden `hreflang` bağlantısını kurar. Karşılığı olmayan sayfada bu alanı boş bırakın.
3. Her iki belgeyi de Publish edin.

## 4. Blog yazısı eklemek

1. **Blog posts** → English → **+**.
2. **Page title (H1):** yazının başlığı. **Page address:** alanın altındaki listeden ülke klasörünü seçip **Build address from the title** düğmesine basın; adres `blog/<ülke>/<başlık>` biçiminde oluşur, elle de düzeltebilirsiniz.
3. **Author:** zorunlu (yeni yazılarda). **Short answer:** yazının sorusuna 40-60 kelimelik cevap; yazının başında vurgulu kutuda görünür. **Last updated:** bilgilerin son kontrol tarihi.
4. **Page text:** bölüm bölüm yazın (Section → başlık düzeyi 2 ana bölüm, 3 alt bölüm). Görsel eklerken **önce kütüphanedeki mevcut görseli seçin**, aynı fotoğrafı yeniden yüklemeyin; her görsele kısa bir **Alternative text** yazmak zorunludur.
5. **Frequently asked questions:** varsa soru-cevap ekleyin.
6. Eski sitedeki bir yazının yerine geçiyorsa **Old addresses of this post** alanına eski adresi yapıştırın (ör. `/en/blog/turkey/eski-yazi/`). Eski adresi açan ziyaretçi ve Google yeni yazıya yönlenir. Yönlendirme yayından yaklaşık 5 dakika sonra başlar. Panel şunları reddeder: yazının kendi adresi, sitede zaten sayfa bulunan adres, başka yazıda kullanılan adres.
7. **Publish.**

## 5. Arama sonuçları (SEO) alanları

- **Search result title:** Google'daki başlık, yaklaşık 50-60 karakter. Alanın altındaki sayaç yeşilse uygundur. Site adı otomatik eklenir.
- **Search result description:** yaklaşık 120-160 karakter.
- **Hide from search engines:** yalnızca Google'da görünmesini istemediğiniz sayfada açın. Sayfa sitemap'ten de çıkar.
- **Main address for search engines:** normalde **boş**. Aynı metin sitede başka bir sayfada da varsa Google'ın göstermesini istediğiniz sayfanın adresini yazın (`/en/blog/...` biçiminde).
- Çok sıralanan sayfaların başlığını gerekçesiz değiştirmeyin; sıralama düşebilir.

## 6. Önizleme (yayınlamadan görmek)

Studio üst çubuğundaki **Presentation** sekmesi sitenin gerçek hâlini taslak değişikliklerinizle gösterir. Belgenin başlığının altında "Used on 1 page" bağlantısı belirirse ona tıklayarak o sayfanın önizlemesine geçebilirsiniz. Kaydettiğiniz taslağı görmek için önizleme çerçevesini yenileyin. Önizlemede sayfanın üstünde "Preview" çubuğu görünür; **Leave preview** önizlemeden çıkarır. Ziyaretçiler önizlemeyi görmez.

## 7. Bilmeniz gerekenler

- **Planlı yayın yok:** yazı, Publish'e bastığınız anda yayınlanır.
- **Rol ayrımı yok:** panele girenlerin hepsi yönetici yetkisindedir. Silmeden önce iki kez düşünün.
- **Geçmiş yalnızca 3 gün:** Hatalı yayını geri almak için belgenin **Review changes / History** bölümünü kullanın. Daha eskisi için geliştiriciye yazın; sistem her gün otomatik yedek alır.
- **Yeni sayfa düzeni veya yeni bölüm tipi** panelden yapılamaz, geliştirici işidir. Yeni tur, yazı, kategori, kombo ve metin sayfası eklenebilir.
- Israel ile ilgili tur veya metin siteye eklenmez.
- Sorun olursa: hangi belge, hangi adım ve ekran görüntüsüyle geliştiriciye yazın.
