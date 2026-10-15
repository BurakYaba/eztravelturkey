# Magnificent Travel: Uygulama Planı

Sürüm: 1.1 · Oluşturulma: 2026-10-06 · Son gözden geçirme: 2026-10-07 · Dil: Türkçe (kod, alan adları ve dosya yolları İngilizce)

**1.1 değişiklik özeti:** teknik SEO kabul listesi (Ek H), içerik ve on-page SEO iş akışı (S), test ve otomasyon iş akışı (T), denetim bulguları (Ek I), 8 yeni açık karar (D26-D33) ve her faza eklenen eksik görevler.

Bu belge projenin tek yol haritasıdır. `docs/implementation-plan.md` ve `docs/site-analysis.md` ilk (yalnızca İngilizce, statik) sürümü anlatır ve bu planla çelişen yerlerde **bu belge geçerlidir**.

---

## 0. Bu belge nasıl kullanılır (oturum protokolü)

**Her oturumun başında**
1. Bu belgenin §1 (ilkeler), §3 (durum tablosu) ve §6 (oturum günlüğünün son kaydı) bölümlerini oku.
2. Çalışacağın fazın "Ön okuma" satırındaki Next.js dokümanlarını `node_modules/next/dist/docs/` altından oku. `AGENTS.md` bunu zorunlu kılıyor: bu Next.js sürümü (16.3.x) bilinen sürümden farklı.
3. Yalnızca **aktif fazın** görevlerine çalış. Faz bitmeden sonrakine geçme (§0.3).

**Her oturumun sonunda**
1. Biten görevlerin kutusunu işaretle (`- [x]`), yarım kalanlara not düş.
2. §3 durum tablosunu güncelle.
3. §6 oturum günlüğüne kayıt ekle: tarih, yapılanlar, alınan kararlar, engeller, sonraki adım.
4. Tamamlanan iş için commit at. Gizli bilgi (şifre, IBAN, API anahtarı, müşteri kişisel verisi) commit'e **girmesin**.

**0.3 Faz geçiş kuralı:** bir fazın "Bitti sayılır" kriterlerinin tamamı sağlanmadan sonraki faza geçilmez. Kriter sağlanamıyorsa nedeni günlüğe yazılır ve karar verilir. Kapsam dışı yeni istekler §7 backlog'una yazılır, karar verilmeden faza eklenmez.

---

## 1. Hedef ve değişmez ilkeler

**Hedef:** Magnificent Travel'ın üç sitesini (EN: magnificenttravel.com, Geleneksel Çince: eztravelturkey.com, Japonca: torukoryoko.com) tek bir üç dilli Next.js / Vercel sitesinde birleştirmek, SEO sıralamasını koruyarak yeni tasarıma taşımak, içeriği müşterinin geliştirici desteği olmadan yönetebileceği bir CMS'e bağlamak.

**İlkeler (müşteri ve ekip kararları, pazarlık konusu değil):**
1. **Tasarım yeni, URL yapısı eski.** Her dilde eski sitenin yol yapısı korunur (bkz. Ek B). Müşteri onayı: 2026-10-06.
2. **Gerçek tur verisi aynen taşınır:** metin, fiyat, program, dahil/hariç, **tur haritaları ve fotoğraflar** olduğu gibi kopyalanır. "Güçlendirme" yalnızca turlar dışındaki içeriğe yapılır (ülke, kategori, kombo giriş metinleri, SSS, About, Travel Hub).
3. **Israel yeni sitede yok** (destinasyon, tur ve Israel'li kombolar dahil).
4. **Ağır animasyon ve görsel efekt yok.** Hedef: LCP < 2,5 sn, CLS < 0,1, INP < 200 ms.
5. **Her eski URL'nin bir akıbeti olur** (aynı yol, 301 veya bilinçli 404/410). Toplu "ana sayfaya yönlendir" yapılmaz. Hayalet URL'ler yönlendirilmez.
6. **Online ödeme yok.** Teklif isteği akışı + WhatsApp. Form'da telefon/WhatsApp alanı müşteri için önemli.
7. **İçerik girişi geliştiriciye ihtiyaç duymadan yapılır** (müşterinin şartnamesindeki taahhüt, CMS kabul ölçütü).
8. **Üç dil birbirinin kopyası değildir.** Her dil kendi eski site yapısını ve kategori ağacını korur (Ek A.3).
9. **Gizli bilgi dokümana ve repoya yazılmaz.**
10. **SEO/AI uyumu:** tüm sayfa türleri `SAYFA YAPISI` belgesindeki schema türlerini taşır (Ek D).
11. **Teknik SEO kusursuz olmalı:** "kusursuz" = **Ek H kabul listesinin tamamının** otomatik testlerle (İş akışı T) geçmesi. Yayına çıkış bu listenin geçmesine bağlıdır.
12. **İçerik kararları veriyle verilir:** başlık, H1, meta ve içerik değişiklikleri İş akışı S'in araştırma çıktısına (GSC verisi, anahtar kelime ve SERP analizi) dayanır. Sıralama ve tıklama alan EN sayfaların başlık/H1'i gerekçesiz değiştirilmez.
13. **Tur metinleri aynen** taşınır. Optimizasyon, metne dokunmadan çevresine yapı eklenerek yapılır (özet kutusu, SSS, ilgili içerik, iç linkler, schema).

---

## 2. Kararlar

### 2.1 Verilmiş kararlar
| # | Karar | Kaynak |
|---|---|---|
| D1 | URL: EN `/en/…`, Çince `/zh/…`, Japonca `/jp/…` (eski önekler), eğik çizgili (`trailingSlash: true`), eski yol yapısı | Müşteri, 2026-10-06 |
| D2 | Tasarım yeni; mevcut repodaki tasarım dili temel alınır | Müşteri |
| D3 | Gerçek tur içeriği, haritalar ve fotoğraflar aynen | Müşteri |
| D4 | Israel çıkarılır. **Israel turları ve içeriği hiç kopyalanmaz** (2026-10-07 teyit). Eski Israel URL'lerinin akıbeti P7.9'da belirlenir. | Müşteri, 2026-09-25 / 10-01 / 10-07 |
| D5 | Teknoloji: Next.js + Vercel | Sözleşme |
| D6 | İçerik taşıma yöntemi: kendi scrape hattımız (eski ajansın JSON dışa aktarımına bağımlı değiliz) | Ekip |
| D7 | Mevcut sitemizdeki (Pexels) görseller müşteri tarafından **kabul edildi** (2026-10-07), yeniden temin gerekmez. **Tur görselleri ve haritalar:** canlı sitedeki orijinaller scrape ile alınır; kalite yetersizse Depositphotos arşivi kullanılır. | Müşteri |
| D37 | **Sayfa yapısı sabit (karar, 2026-10-07):** her sayfa türünün bölümleri ve sırası kodda sabit; editör içeriği değiştirir, bölüm sırasını veya yeni bölüm tipini değiştiremez. Blok tabanlı sayfa oluşturucu (page builder) yok. Bu, Sanity'nin 2.000 attribute limitini de korur (P6.15). | Proje sahibi |

### 2.2 Önerilen (onay bekleyen) kararlar
| # | Öneri | Gerekçe |
|---|---|---|
| D8 | CMS: **Sanity** (kesinleşti 2026-10-07). **Free planı yeterli (hesaplandı 2026-10-07).** Limitler (resmi fiyat sayfası ve docs): 10.000 doküman, **2.000 benzersiz attribute/dataset**, 1 milyon CDN isteği ve 250 bin API isteği/ay, 100 GB bant genişliği, 100 GB asset, 2 dataset (public), 20 koltuk, **yalnızca 2 rol (Administrator, Viewer)**, 2 webhook, 3 gün geçmiş, sınırsız locale ve içerik tipi. Tahmini kullanım: doküman %29 (en kötü senaryo %45), attribute %35-50, API ve bant genişliği tasarımla yönetilir. Ayrıntı P6.15. | Hazır yönetim paneli, 3 dil, ~300 tur |
| D9 | Her dil ayrı doküman + dile özel slug + `translationGroup` alanı. Ortak taksonomi zorlanmaz. | Dillerin eski yapıları farklı (Ek A.3) |
| D10 | `/cn/` (Basitleştirilmiş Çince, 391 URL) → karşılığı olan `/zh/` sayfasına 301 | Müşteri anakarayı hedeflemiyor, slug'lar birebir aynı |
| D11 | Karşılığı olmayan turda hreflang üretilmez, dil değiştirici üst kategoriye düşer | Hatalı hreflang zarar verir |
| D12 | **Blog kapsamı (güncellendi 2026-10-12):** müşteri **34 blog yazısı** listeledi (`scripts/scrape/lists/blogs-to-move.txt`, 5 "Map of X" dahil): hepsi **olduğu gibi, aynı URL'de** yeni siteye taşınır. Diğer eski yazıları ve yeni yazıları müşteri CMS'ten kendisi girer. Taşınmayan her eski blog URL'si varsayılan olarak blog hub'ına 301 alır; müşteri yeni yazıda "eski URL" alanını doldurarak özel 301 oluşturur (P6.14, D36: B seçildi). Liste GA "etkin kullanıcı" sayılarına göre hazırlanmış (trafikli yazılar). | Müşteri, 2026-10-12 |
| D13 | Görseller repoya girmez. **Vercel Blob kullanılmaz (güncellendi 2026-10-14):** Sanity projesi zaten var, görseller doğrudan Sanity assets'e yüklenir (P6.4). O zamana kadar geliştirmede canlı siteden gösterilir (`src/lib/data/images.ts`). **İstisna:** 5 "Map of X" yazısının görselleri repoda aynı yolda statik kalır (P7.13). | ~900+ görsel git'i şişirir |
| D14 | Travel Hub, `/en/blog/` URL'sini kullanır (aynı URL, yeni tasarım) | Canlı `/en/blog/` zaten blog hub'ı |
| D15 | Mevcut yeni sayfalarımız (`/tours/`, `/private-tours/`, `/small-group-tours/`, `/plan-my-trip/`, `/multi-country-tours/`) ek açılış sayfası olarak kalır, canonical tur adresleri eski yapıda | Müşteri tasarımında var, canlıda yok |

### 2.3 Açık kararlar (faz öncesi netleşmeli)
| # | Soru | Gereken faz |
|---|---|---|
| D16 | FAQPage ve AggregateRating schema'sı eklenecek mi? (İlk brif istiyor. Canlı tur sayfalarında Product + AggregateRating var.) Önerim: FAQPage ekle, kurum için kendi kendine AggregateRating ekleme, Tripadvisor kaynaklı tur yorumlarını değerlendir. | P8 |
| D17 | Form başvuruları için ayrı kayıt (Neon) gerekli mi? **Karar (onaylandı 2026-10-07):** v1'de ayrı veritabanı yok; form e-posta (Resend) ve WhatsApp devriyle çalışır; arşiv ihtiyacı çıkarsa sonradan Neon. | P3 |
| D18 | `/en/videos/` (canlıda 5 YouTube kartı) yapılacak mı? **Karar (onaylandı 2026-10-07):** sayfa yapılmaz, `/en/videos/` → `/en/blog/` 301 (sayfa GSC'de ilk 60 blog dışı sayfada yok). | P2 |
| D19 | `/multi-country-tours/` indeksi ile `/destinations/` hub'ı arasındaki ayrım (kopya içerik riski). **Karar (onaylandı 2026-10-07):** `/destinations/` canlıdaki gibi ülkeler + kombo grupları; `/multi-country-tours/` ek, kombo odaklı açılış sayfası (farklı giriş metni); çakışmayı S2.1 denetler. | P2 |
| D20 | GA4 ve GTM: mevcut `GTM-55HWFMHR` yeniden kullanılacak mı, yeni kapsayıcı mı? Üç dil tek GA4 property'de mi? | P8 |
| D21 | DNS geçiş sırası (üç alan adı aynı gün mü, kademeli mi?) | P10 |
| D22 | **Kapandı (2026-10-12): yorumlar Tripadvisor'dan.** (Eski soru: Tur başına gerçek yorumlar nereden gelecek?) **Karar (onaylandı 2026-10-07):** P3'te site geneli Tripadvisor alıntıları + bağlantı; tur başı yorum alanı şemada hazır ama boş, kaynak belirlenince doldurulur. | P3 |
| D23 | 5 Ekim'de müşterinin gönderdiği H1/H2 başlık örnekleri ve 3 Ekim tur sayfası bölümleri dosyası bizde yok. Kullanıcı bu ekleri `chat/müşteri talepleri/` içine koyar; gelene kadar mevcut H1/H2'ler korunur. | P3 |
| D24 | Sözleşmedeki 3 aylık SEO programı üç dili de kapsıyor mu? | P10 |
| D25 | Yönlendirme sayısı Vercel'in 1.024 sınırını aşarsa mekanizma (Global Config / Redis / Bloom filter) | P7 |
| D26 | Hero'daki GSAP parallax kaldırılsın mı? **Öneri: kaldır.** Müşteri ağır animasyon istemiyor, GSAP + ScrollTrigger yükü LCP/INP'ye gider, görsel katkısı küçük. **Karar: kaldır** (onaylandı 2026-10-07, P2.16'da uygulanır). | P2 |
| D27 | Israel URL'leri (≈60 blog yazısı + 13 destinations/kombo URL'si) nereye gider? **Öneri:** backlink veya trafik alanlar ilgili blog/destinations hub'ına 301, geri kalanı 410. | P7 |
| D28 | Para birimi. **Müşteri yanıtı (2026-10-12): her dilde USD ve EUR seçenekleri olsun.** Veri: üç eski sitede fiyatlar EUR; EN formunda USD/EUR seçimi var. zh sitesi çoğu turda fiyat göstermiyor, jp ≈ üçte birinde "minimum fiyat" gösteriyor, bu yüzden **fiyat isteğe bağlı** (`docs/baseline/tour-overlap-2026-10-07.md`). Mekanizma: D40 (kapandı). | P3 |
| D40 | **Kapandı (2026-10-12): her turda hem USD hem EUR fiyat gösterilecek, müşteri ikisini de CMS'te kendisi girecek.** Tur kaydında iki isteğe bağlı alan (`priceEUR`, `priceUSD`); tur sayfasında ve kartlarda dolu olan her para birimi görünür (düğme ve kur yok); yapılandırılmış veride her para birimi için ayrı `Offer`. Eski sitelerde yalnızca EUR var; USD'yi müşteri girecek. Toplu giriş için: EUR fiyat listesi tabloya dökülür, müşteri USD sütununu doldurur, biz içe aktarırız (P6.4). | P3, P6 |
| D41 | **Form e-postası: ana sağlayıcı Brevo, yedek Resend (kullanıcı kararı, 2026-10-14).** Sitenin form bildirimleri (iletişim, rezervasyon/plan formu) önce Brevo'nun işlem (transactional) e-posta API'siyle gönderilir; Brevo hata verirse (ağ, kota, 5xx) aynı mesaj Resend ile gönderilir, o da başarısızsa WhatsApp devri çalışır. Gönderen adres `magnificenttravel.com` üzerinde, iki sağlayıcıda da alan adı doğrulanır. Bu karar **e-postayı en sona bırakma kararını (D39) değiştirmez**: uygulama P9.3 ve P9.12'de. Eski sitede form sunucu tarafında kendi koduyla gidiyordu, üçüncü taraf sağlayıcı yoktu (2026-10-14 incelemesi). | P9.3, P9.12 |
| D29 | Vercel planı: ticari kullanım koşulları ve **Image Optimization kotası** (900+ kaynak görsel). Gerekirse Sanity CDN dönüşümü. Güncel Vercel şartlarından doğrulanır. | P6, P9 |
| D30 | Anahtar kelime, SERP ve GSC veri kaynağı: **OpenSEO MCP** (GSC performansı, URL denetimi, anahtar kelime, SERP, sıralama, AI görünürlüğü, GBP denetimi). **Bağlandı ve doğrulandı (2026-10-07):** `whoami` ve `list_projects` başarılı, 500 kredi, GSC mülkü (`https://www.magnificenttravel.com/`) bağlı ve veri veriyor. **GA4 bağlı değil** (OpenSEO ayarlarından bağlanmalı). zh-Hant ve ja için konum/dil desteği hâlâ doğrulanmadı. | S1 (P0-P1) |
| D34 | **404 veren 26+ yüksek trafikli blog sayfası** (12 ayda ≈ 27.100 tıklama, `docs/baseline/gsc-en-baseline.md` §4). **Karar (kullanıcı, 2026-10-07): şimdilik göz ardı edilir.** Blogu müşteri yönetiyor; bu URL'ler P7.4'teki varsayılan kurala girer (taşınmayan eski blog URL'si → blog hub'ına 301). Müşteri isterse yeni yazıdaki "eski URL" alanıyla (P6.14) kendi hedefini tanımlar. Blog dışı 404'ler (eski turlar vb.) P7'de ele alınır. | P7 |
| D35 | **Israel blog yazıları** (≈16 yazı ilk 150'de, ≥10.800 tıklama/yıl). Müşteri blogu kendisi yönettiği için bu yazılar da aynı varsayılan kurala girer; kalıcı karar müşterinindir. D27 yalnızca Israel destinations/kombo sayfalarını kapsar. | P7 |
| D36 | **Kapandı (2026-10-12): B.** Müşteri, yeni blog yazılarında eski adresi panelden kendisi girecek ("yönlendirmeyi biz yapabiliyorsak"). Yapamazsa listeyi bize gönderir. Tüm diğer site yönlendirmeleri bizim işimiz (P7). | P6, P7 |
| D31 | Hesap sahipliği matrisi: Vercel, Sanity, Resend, GA4, GTM, GSC, GitHub, DNS. Kim sahip, kim yönetici? | P6, P10 |
| D32 | Geri dönüş: DNS geçişinden sonra eski hosting kaç gün açık kalacak? **Öneri: en az 30 gün** (eski ajansın sözleşme durumu müşteriyle netleşmeli). | P10 |
| D38 | **(Not 2026-10-12: üç alan adı Turkticaret.net'te kayıtlı ve uzun süre ödenmiş: `magnificenttravel.com` 10.08.2031, `torukoryoko.com` 30.09.2031, `eztravelturkey.com` 18.03.2031, yani tutmanın ek maliyeti yok.)** Eski iki alan adı (`torukoryoko.com`, `eztravelturkey.com`) kapatılmamalı.** Müşteri "domain ve e-postalar kapanacak" dedi (2026-10-08), ama P7.5'teki yönlendirmeler (≈ 1.200 eski URL) bu alan adlarının DNS'inin yeni siteye bağlı kalmasına bağlı. **Öneri:** alan adları en az 12 ay kayıtlı kalır ve Vercel'e yönlendirilir; yalnızca eski sunucudaki e-posta kutuları kapatılır. Alan adlarının kaydı ve DNS'i kimde (bu ikisinin ad sunucuları `netportbilisim.com`) netleşmeli. | P7, P10 |
| D39 | **E-posta (güncellendi 2026-10-12).** Kutular eski sunucuda ve MX alan adının kendisine bağlı (apex A kaydı değişirse e-posta kesilir). E-posta **dile veya sayfaya göre değil, alan adı ve kutu bazlı**: yeni sitede tek alan adı (`magnificenttravel.com`) olacak, eski iki alan adının kutuları yeni siteye taşınmaz. Müşterinin "en az 5 adres" şartı müşteriye ait, bizim değil. **Formlar kutu gerektirmez:** gönderen `no-reply@` (Resend, alan adı doğrulamalı), alıcılar mevcut 3 adres (biri Gmail). `mail.magnificenttravel.com` ve `webmail.magnificenttravel.com` zaten eski sunucuyu (`31.210.57.126`) gösteriyor. **Seçenekler:** (A) kutular olduğu yerde kalır; MX `mail.magnificenttravel.com`'a çevrilir, ardından web DNS'i Vercel'e taşınır. Taşıma işi yok, ama eski sunucunun açık kalmasına (ve eski ajansa) bağımlı. (B) yeni hizmet (Google Workspace, Microsoft 365 vb.) + taşıma. **Öneri: yayını A ile yap, müşteri eski sunucuyu kapatmak istediğinde B'ye geç.** Eski e-posta içeriğinin taşınması ve erişim bilgisi yalnızca B'de ve müşteri geçmiş mesajları korumak isterse gerekir. | P9, P10 |
| D33 | `magnificenttravel.vercel.app` şu an `index, follow`. **Karar: şimdi noindex gerekmez** (alan adı bağlı değil, adres özel). Yayında ana alan adına 301 (P7.10). | P7, P10 |

---

## 3. Durum tablosu

| Faz | Başlık | Efor | Bağımlılık | Durum |
|---|---|---|---|---|
| P0 | Hazırlık ve kararlar | S | – | ☑ (P0.5d, P0.6, P0.9 paralel sürer) |
| P1 | Scrape altyapısı + EN içerik çekimi | L | P0 | ☑ (P1.9 teslim ve P1.12 zh/jp açık; P1.10 Blob iptal, görseller Sanity'de) |
| P2 | Çok dilli altyapı + URL/bilgi mimarisi paritesi (EN) | L | P0 (P1 ile paralel) | ☑ (2026-10-14) |
| P3 | Sayfa yapısı uyumu + içerik güçlendirme | L | P1, P2 | ☐ |
| P4 | **Mock yayını + müşteri onayı (kapı)** | S | P3 | ☐ |
| P5 | Çince ve Japonca scrape + dil eşleştirme | L | P4 | ☐ |
| P6 | Sanity CMS kurulumu ve içerik aktarımı | L | P4, P5 | ◐ çekirdek yapıldı (2026-10-14, öne alındı; Studio yayını, webhook, yedek ve kabul testleri kaldı) |
| P7 | Yönlendirmeler ve 404 yönetimi | M-L | P5, P6 | ☐ |
| P8 | Teknik SEO, AEO/GEO, analytics | M | P6 | ☐ |
| P9 | Performans, güvenlik, işletme | M | P6 | ☐ |
| P10 | Yayın, geçiş, yayın sonrası | M | P7, P8, P9 | ☐ |

Efor: S = birkaç saat, M = 1-3 gün, L = 3+ gün (tahmini, takvim değil).
Not: P1 (scrape) kod gerektirmediği için P2 ile paralel yürür. P8 ve P9, P6'dan sonra paralel yürüyebilir.

**Durum (2026-10-15):** P3 başladı, dal `feat/p3-tour-template`: tur sayfası blokları, USD/EUR fiyat, form (P3.1, P3.4, P3.10, P3.16, kısmen). **Sıradaki P3 işleri:** P3.5-P3.7 (destinations/ülke/kombo şablonları, ana sayfada kombolar), P3.8 (blog şablonu), P3.9 (about/contact ekip bloğu), P3.11-P3.14, P3.18-P3.20, zh/jp sözlüklerinin kalanı (liste sayfaları, ToursBrowser, ana sayfa hâlâ İngilizce). **Birleştirmeden önce kullanıcı adımları:** `cd studio && npm run deploy` (yeni fiyat/otel/kalkış alanları) ve production'a `npm run sanity:import` (fiyatlar `price.eur`'a geçer; o zamana kadar veri katmanı eski `price.amount`'u da okur).

*(Önceki durum, 2026-10-14)* P0, P1 ve P2 kapandı; P6'nın çekirdeği (Sanity) öne alınıp yapıldı. **Sıradaki: P3** (tur sayfası şablonu, USD/EUR fiyat, rezervasyon formu ve tur başlığı, ekip bölümü, `about/contact/faq` gerçek metni, zh/jp sözlüklerinin kalanı).
- **Canlı:** `https://magnificenttravel.vercel.app` (`main` dalı, Vercel'de shagrimoka'nın Pro hesabı; gerçek alan adı henüz bağlı değil). Üretim `main`'den, diğer dallar Preview. Her birleştirmede otomatik dağıtım.
- **Sanity:** proje `aj0pbi0w`; `production` dataset'i (188 doküman, 832 görsel), `staging` dataset'i aynı içerikle dolu (2026-10-14, aynı 188 doküman ve 832 görsel; deneme alanı: şema değişikliği ve zh/jp içe aktarmasını önce orada dene, `SANITY_DATASET=staging npm run sanity:import`). Studio yalnızca `production`'ı düzenler, `staging` elle yenilenir. **Vercel Preview'ları `production`'ı okur** (karar: `staging`'e bağlamak gereksiz, ikinci webhook ve eski içerik karışıklığı getirir; müşteri canlı içerik girmeye başlayınca yeniden değerlendirilir). Studio `https://magnificenttravel.sanity.studio` (`cd studio && npm run deploy`, appId `studio/sanity.cli.ts` içinde). Webhook `POST /api/revalidate/` kurulu ve uçtan uca test edildi (Studio'da yayınla → canlı sayfa güncellendi).
- **Vercel CLI:** kurulu (59.1.3), `vercel login` yapıldı (hesap `shagrimoka`, ekip `shagrimokas-projects`), proje `.vercel/` ile bağlı (git'te yok). Başarısız dağıtım günlüğü: `npx vercel inspect <dağıtım-kimliği> --logs`. Vercel ortam değişkenleri: `SANITY_REVALIDATE_SECRET` yalnızca Production. Derleme sırasında Sanity'den geçici 502/429 gelebiliyor (bir kez derlemeyi düşürdü); `src/lib/data/sanity.ts` bu hataları 6 kez yeniden dener.
- **Komutlar:** `npm run dev`, `npm run build`, `npm run check:site [adres]` (sitemap'teki her adresi dener: 200, tek H1, canonical, dil, JSON-LD, Israel yok, yönlendirmeler, 404, 410), `npm run sanity:import` (`--dry`, `--prune`, `--lang=`), `npm run scrape:*`. CI: `.github/workflows/ci.yml` (lint, `next typegen`, tsc, build).
- **Repoda olmayıp yalnızca bu bilgisayarda olanlar (yedek al):** `.env.local` (SANITY_WRITE_TOKEN = Sanity'deki `import` adlı Editor token'ı, SANITY_REVALIDATE_SECRET, SANITY_DATASET=production, `vercel link`in eklediği VERCEL_OIDC_TOKEN, Resend alanları), `data/` (ham arşiv, 832 görsel dosyası ≈ 77 MB, `data/client-inputs/` müşteri cevapları ve dosyaları, URL envanterleri, Sanity yükleme önbelleği), `studio/node_modules`, `chat/`. `data/client-inputs/` kaybolursa yeniden üretilemez. Yeni bilgisayarda: `npm ci`, `cd studio && npm ci`, `.env.local` kopyala.
- **Kullanıcıda bekleyen işler:** DNS, Cloudflare ve Turkticaret hesap sahipleri ve yetkileri; Netport mail paketinin maliyeti (D39); müşteri yanıtları D32, D38, D39; bir form bildirim mailinin orijinali (eski sitenin mail altyapısı, D41); P0.5d (GA4/GTM verisi), P0.6 (müşteri mesajı), P1.9 (blog arşivinin teslimi), D23 ekleri (5 Ekim H1/H2 görselleri, 3 Ekim dosyası).
- **Bilinen sınırlar:** zh/jp sayfa gövdeleri ve formlar şimdilik İngilizce (içerik P5'te, formlar P3.10'da); zh/jp UI çevirileri taslak, anadil denetimi yok; Studio ücretsiz planda tüm kullanıcılar yönetici; Sanity yedeği yok (P6.7 gece yedeği yazılmadı); Israel hiçbir yerde olmayacak (içe aktarmada süzülüyor, `check:site` denetliyor).

**Çapraz iş akışları** (fazlara yayılır, §4 sonunda tanımlı):
- **S: İçerik ve on-page SEO** (araştırma P0-P1, strateji P3, uygulama P3/P6, yayın sonrası P10)
- **T: Test ve otomasyon / CI** (P2'den itibaren, Ek H kabul listesini otomatik doğrular)

**E-posta işleri en sona bırakıldı (kullanıcı kararı, 2026-10-12):** D39, P9.3'ün gönderen/alıcı kısmı ve P9.12 yayın öncesine kadar bekler. P2-P8 e-postadan bağımsızdır. Tek ön koşul: form teslimini uçtan uca denemek için Resend'de alan adı doğrulaması gerekir (P9.3); o zamana kadar form, geliştirme ortamında WhatsApp devri ve test alıcıyla çalışır.

**Takvim:** teslim tarihleri ve sorumlular proje sahibi tarafından yönetilir, bu belgede tutulmaz. Efor sütunu yalnızca göreli büyüklüktür.

**Mevcut repo durumu (2026-10-06):** Next.js 16.3.8, React 19, Tailwind 4; yalnızca İngilizce; 6 tur, 6 kombo, 5 ülke `src/data/*.ts` içinde; 9 Travel Hub yazısı `content/travel-hub/`; URL'ler yeni yapıda (`/tours/<slug>`, `/destinations/<ülke>`, `/travel-hub/<slug>`). `tsc` ve `lint` temiz. Analytics, güvenlik başlıkları, e-posta teslimi, i18n yok.

---

## 4. Fazlar

### P0: Hazırlık ve kararlar
**Amaç:** Koda başlamadan önce zemin ve kararlar netleşsin.
**Ön okuma:** –

- [x] P0.1 (2026-10-07) Bu planı commit et. `docs/implementation-plan.md` ve `docs/site-analysis.md` başına "eski, bkz. project-plan.md" notu ekle. `site-analysis.md`'deki **hatayı düzelt**: Morocco'nun sabit turu yok değil, canlıda 11 civarı tur var (Ek A.2).
- [x] P0.2 (2026-10-07) `.gitignore`: `/chat/` (yapıldı), `.env.example` takibi için `!.env.example`, `/data/` (scrape arşivi, GSC dışa aktarımları) ekle. `.env.example`'ı git'e al.
- [x] P0.3 (2026-10-07: varsayılanlar onaylandı) P2-P3'ü etkileyen kararlar (D17, D18, D19, D22, D26) için §2.3'teki **varsayılanlar** itiraz yoksa uygulanır. D23 için eksik ekler (5 Ekim H1/H2 örnekleri, 3 Ekim dosyası) `chat/müşteri talepleri/` içine konur.
- [x] P0.4 (2026-10-07) Yerel ortam doğrula: `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build` yeşil. Mevcut sitenin mobil Lighthouse çıktısını `docs/baseline/` altına kaydet (ana sayfa, tur, ülke). **Yapıldı:** `npm ci` çalıştırılmadı (mevcut `node_modules` kilit dosyasıyla uyumlu, `npm ls` temiz); lint, tsc ve build yeşil; sonuçlar `docs/baseline/lighthouse-local-2026-10-07.md` (LCP ≈ 4,8-5,1 sn, hedefin iki katı).
- [x] P0.5a **GSC özeti OpenSEO ile çekildi** (2026-10-07): cihaz, ülke, ilk 150 sayfa, ilk 100 sorgu, blog dışı ilk 60 sayfa. Sonuç: `docs/baseline/gsc-en-baseline.md`. Ham veri repoya konmadı (ücretsiz yeniden çekilebilir).
- [~] P0.5b **Ertelendi → P7'de:** GSC arayüzünden "Pages → Not found (404)" dışa aktarımı (kullanıcı verebileceğini söyledi). Silinmiş blog sayfaları şimdilik göz ardı (D34); liste yalnızca **blog dışı** 404'ler (eski turlar, kategoriler) ve yönlendirme haritası için lazım olacak.
- [~] P0.5c **Ertelendi:** 150'nin ötesindeki sayfaların 404 envanteri (D34).
- [ ] P0.5d **GA4/GTM durumunu doğrula (D20):** canlı EN HTML'inde GA4 `G-E8XLPNE302` (`gtag('config', …)`) ve GTM `GTM-55HWFMHR` var (2026-10-07'de doğrulandı); zh sitesinde yalnızca kapanmış `UA-` kodu, jp'de hiçbiri. Müşterinin 29 Eylül'de verdiği Analytics erişimiyle EN mülkünün gerçekten veri toplayıp toplamadığı ve GTM kapsayıcısının içeriği (etiketler, tetikleyiciler, dönüşümler) kontrol edilir. GA4'ün OpenSEO'ya bağlanması isteğe bağlı.
- [ ] P0.6 Müşteriden beklenenleri (Ek E) tek mesajda iste ve takip et.
- [x] P0.7 Müşteri onayı: eski URL yapısı korunur, tasarım yeni (2026-10-06).
- [x] P0.0 (D33) **Karar (kullanıcı, 2026-10-07): `vercel.app` için `noindex` şimdi gereksiz.** Alan adı bağlı değil, adres yalnızca müşteriyle özel paylaşılıyor, risk düşük. `index, follow` durumu bilinçli kabul edildi. Yayında `*.vercel.app` alias'ı ana alan adına yönlendirilir (P7.10, P10.9). Preview adresi herkese açık yerde (sosyal medya, site linki) paylaşılırsa karar yeniden değerlendirilir.
- [x] P0.8 Teslim tarihleri ve sorumlular proje sahibi (kullanıcı) tarafından yönetilir, bu plana yazılmaz (2026-10-07).
- [ ] P0.9 SEO başlangıç ölçümü (kayıt): EN için GSC'den hedef sorguların pozisyon/tıklama/gösterim özeti, AI arama başlangıç kontrolü (S1.5). Dosyalar `data/baseline/` altında, sonuç özeti `docs/baseline/` altında.
- [x] P0.10 (2026-10-07) D26-D33 kararlarını gözden geçir (D33 kapandı; D26 varsayılanı P2.16'da uygulanır).
- [x] P0.11 (2026-10-07) **Çalışma düzeni:** işler feature branch + PR ile yapılır, `main` her zaman dağıtılabilir kalır, küçük ve anlamlı commit'ler; Vercel her branch için önizleme üretir. Ortam değişkenleri Vercel'de tutulur, `.env.example` güncel, hiçbir sır repoya girmez.

**Bitti sayılır:** plan commit'li; P2-P3'ü etkileyen kararlar kapalı veya varsayılana bağlanmış; `docs/baseline/` altında GSC ve Lighthouse başlangıç raporları var; yerel ortam yeşil (lint, tsc, build); çalışma düzeni (P0.11) yazılı.

---

### P1: Scrape altyapısı ve EN içerik çekimi
**Amaç:** Eski sitelerin içeriğini tekrarlanabilir, doğrulanabilir bir hatla alıp normalize JSON'a çevirmek. Bu fazda yalnızca **EN** çekilir (GSC var, yapı tam bilinir).
**Ön okuma:** –
**Çıktı konumları:** ham arşiv `data/archive/` (git'e girmez), normalize JSON `content/scraped/en/`, görsel manifest `content/scraped/image-manifest.json`.

- [x] P1.1 (2026-10-07) `scripts/scrape/` iskeleti: sitemap okuyucu, kibar fetcher (en fazla 1 istek/sn, 2 eşzamanlı, yeniden deneme, tanımlı User-Agent, `robots.txt` uyumu), arşivleyici (ham HTML + başlıklar), sayfa türü ayrıştırıcıları, görsel indirici, normalizer. Yeni bağımlılıklar (örn. `cheerio`, `zod`) eklenir. **Yapıldı:** `scripts/scrape/` (fetcher, inventory, archive, parse-tour, parse-page, parse-en, images, verify-en, seo-inventory); `cheerio` (devDependency) ve `zod` eklendi; `npm run scrape:*` betikleri. Arşiv dosya adı yolun içerik özeti (SHA-1), çünkü Japonca yüzde-kodlu yollar Windows'un 260 karakter sınırını aşar.
- [x] P1.2 (2026-10-07) URL envanteri: üç sitemap (`/en/sitemap`, `torukoryoko.com/sitemap.php`, `eztravelturkey.com/sitemap.php`) → `data/inventory/*.csv` (URL, dil, sayfa türü, derinlik, alt-URL mü). Referans: EN 685, ZH 793, JA 441 URL. **Sonuç:** EN 690 URL (685 sitemap + 5 tohum; 73 Israel), ZH 793 (537 alt-URL), JP 441 (308 alt-URL); `data/inventory/*.csv`.
- [x] P1.3 (2026-10-07) EN ham arşiv (**Israel sayfaları hariç**: Israel URL'leri yalnızca envanterde `israel` etiketiyle tutulur, içerik çekilmez; D4): 685 URL + sitemap dışı iç linkler (ör. `/en/authors/<ad>/`, `/en/gdpr/*`, `/en/videos`, eğik çizgisiz varyantlar) çekilir. Durum kodu raporu (200/301/404) üretilir. **Sonuç:** 617 sayfa, hepsi 200; 1 istek/sn hızında ve tarayıcı benzeri User-Agent ile hiç engellenme (403/429) olmadı; 86 MB, `data/archive/en/` (git'e girmez).
- [x] P1.4 (2026-10-07) EN sayfa türü ayrıştırıcıları: tur, kategori, ülke, kombo, destinations hub, blog yazısı, blog kategorisi, yazar, statik sayfalar (about, faq, contact, gdpr). **Yapıldı:** `parse-tour.mjs` ve `parse-page.mjs`; 161 JSON üretildi (118 tur + 43 sayfa). Gövde sıralı bölümler olarak saklanır (başlık + paragraf/liste/tablo/görsel), kartlar ve SSS ayrı. `/en/search/` ve `/en/videos/` ayrıştırılabilir içerik taşımıyor.
- [x] P1.5 (2026-10-07) **Tur ayrıştırıcısı** çıkarır: H1, meta title/description, canonical, breadcrumb, gece/gün, fiyat ve para birimi, rota, öne çıkanlar, gün gün program (gün, başlık, metin, öğün, konaklama), oteller, dahil/hariç, ulaşım (uçuş/feribot/transfer), gereksinimler, SSS, galeri görselleri (950x700), **rota haritası görseli** (800x600 `bestFit`), ilgili turlar, tur bilgileri (dil, grup tipi, zorluk, sezon), ham JSON-LD, form alanları (referans). **Sonuç:** 118 tur (Israel hariç), hepsi şemaya uyuyor. Eski sitede gerçekten olmayanlar: rota haritası 19 turda (çoğu günübirlik/aktivite; ama 10 günlük İstanbul-Kapadokya-Pamukkale-Efes, 3 İstanbul paketi, 2 gemi turu ve 4 günlük Kahire de var), rota 7, hariç listesi 3, öne çıkanlar 2 turda. 99 turda harita var. Fiyatların hepsi EUR. Her turda tam 5 galeri görseli. **`lastUpdated` tüm turlarda 15-16 Eylül 2026:** toplu güncelleme, gerçek güncelleme tarihi olarak **kullanılamaz** (SAYFA YAPISI'ndaki "gerçek güncelleme tarihi" için CMS'te elle tutulur).
- [x] P1.6 (2026-10-07) Görsel hattı: eski site görselleri `/public/thumbs/<WxH>-<mod>-<ad>.jpg` desenli, yeniden boyutlandırılmış. **Spike sonucu:** site yalnızca sabit boyutlar sunuyor (galeri 950x700, harita 800x600, kart 648x425/680x450); daha büyük varyantlar 301 veriyor, orijinaller bağlantılı değil (yalnızca blog görselleri `/public/uploads/…` altında). En iyi kaynak bu boyutlar; retina hero için yetersiz kalırsa müşteriden orijinal istenir. Görselleri indir, içerik özetiyle tekilleştir, `image-manifest.json` oluştur (eski URL → özet/dosya, alt metin, kullanıldığı yer). **WebP'ye ön dönüşüm yapılmaz:** kaynaklar zaten ≈ 93 KB ortalama JPEG, Sanity CDN `auto=format` ile WebP/AVIF servis eder. **Sonuç (12 Ekim yenilemesi, 34 blog yazısı dahil):** 925 görsel adresi → 832 benzersiz dosya (93 kopya birleşti), ≈ 76 MB, hiç indirme hatası yok (7 Ekim: 842 → 753); 99 rota haritası (98 benzersiz dosya), 590 galeri kullanımı; dosyalar `data/images/` (git'e girmez), manifest `content/scraped/image-manifest.json` (commit'li).
- [x] P1.7 (2026-10-07) Normalize JSON üretimi ve zod şemaları (`src/lib/schema/`). Bu şemalar Sanity şemasının ön tasarımıdır (Ek C). **Yapıldı:** `tour.ts`, `page.ts`; `tsconfig.json`'a `allowImportingTsExtensions` eklendi (betikler `.ts` şemalarını doğrudan içe aktarır). **Attribute ilk hesabı (P6.15):** normalize EN JSON'da yalnızca **108 benzersiz attribute** (`scripts/scrape/count-attributes.mjs`), Sanity limiti 2.000.
- [x] P1.8 (2026-10-07) **Aynen taşıma doğrulaması:** 10 örnek tur için canlı sayfa ile JSON'u karşılaştır (gün sayısı, fiyat, liste öğeleri, harita var mı). Toplam tur sayısı ≈ 125 mi? Boş alan raporu. Metin üzerinde hiçbir değişiklik yapılmadığını diff testi ile göster. **Sonuç (`npm run scrape:verify`):** 118 tur, 9.566 metin parçası canlı sayfada birebir bulundu; gün, galeri, SSS ve dahil sayıları sayfayla eşleşiyor. Tur sayısı 118 (EN toplam 129 − Israel 11); müşterinin "≈125" rakamı Israel dahil bir yuvarlama olabilir.
- [~] P1.9 (arşiv ve **34 listeli yazının normalizasyonu yapıldı** (D12), müşteriye teslim açık) Blog: 520 yazının meta + gövde + görsel arşivi (yalnızca arşiv; normalize edilmez). 5 "Map of X" yazısı tam normalize edilir (Maps.txt). **Sonuç:** 461 yazı arşivlendi (Israel yazıları bilinçli çekilmedi, D4); müşterinin listelediği **34 yazı normalize edildi** (5 harita yazısı dahil; ortalama ≈ 2.900 paragraf kelimesi, 208 görsel, 31'inde tablo, SSS yok). Blog yazılarında "son güncelleme" bilgisi yok, CMS'te elle tutulur. **Arşiv müşteriye teslim edilir (açık):** DNS geçişinden sonra eski site kapanacağı için müşteri, yeniden yazmak veya taşımak istediği eski yazılara arşivden ulaşabilsin.
- [~] P1.10 ~~Görselleri Vercel Blob'a yükle~~ **İptal (2026-10-14, D13):** Blob yerine görseller doğrudan Sanity'ye yüklenir. İsteğe bağlı erken adım: görselleri `production` dataset'ine şimdi yükleyip manifest'e `cdn.sanity.io` adreslerini yazmak (canlı siteye bağımlılığı bitirir); aksi hâlde P6.4'te.
- [x] P1.11 (2026-10-07) **SEO envanteri (baseline):** her URL için başlık, meta açıklama, H1/H2'ler, canonical, hreflang, robots meta, JSON-LD türleri, ana içerik kelime sayısı, iç link sayısı, görsel ve alt eksiği → `data/inventory/seo-<site>.csv`. Bu dosya P4.5 parite raporu ve T7 SEO drift testlerinin temelidir. Ana içerik, `<main>` olmayan eski sayfalarda üst bilgi, alt bilgi ve yasal metin modalları ayıklanarak ölçülür. **Sonuç** (`npm run scrape:seo`, `data/inventory/seo-en.csv`, 617 satır): ana içerik ortalama kelime sayısı: ülke ≈ 895, kombo ≈ 886, kategori ≈ 814, destinations hub ≈ 1.350, tur ≈ 572, blog yazısı ≈ 3.576 (kart, SSS ve yasal modal metinleri hariç).
- [ ] P1.12 **Kanıtlanmış tarama riskleri:** (a) canlı EN sitenin `robots.txt` adresi python varsayılan istemcisine 403 verdi (WAF/bot koruması): gerçekçi User-Agent, düşük hız, 403/429'da geri çekilme, gerekirse Playwright; (b) zh/jp sitemap'leri `ISO-8859-9` bildiriyor: sayfa kodlamasını sayfa başına algıla, UTF-8 varsayma, CJK metinde bozulma testi; (c) eski `robots.txt` kuralları kendi içeriğimizi taramayı engelliyorsa bunun müşteri içeriği olduğu gerekçesiyle bilinçli geçilmesi günlüğe yazılır.

**Riskler:** Eski site Cloudflare arkasında, hızlı tarama engellenebilir. Düşük hızla ve erken çek. JS ile yüklenen alanlar çıkarsa tarayıcı tabanlı çekime (Playwright) geç. Sezon fiyatı gibi alanlar yoksa Ek C'deki alan boş kalır, müşteriye sorulur.

**Bitti sayılır:** EN tüm URL'ler arşivde; `content/scraped/en/` altında turlar, kategoriler, ülkeler, kombolar, statik sayfalar; haritalar ve galeri görselleri indirilmiş ve manifest'te; P1.8 doğrulaması geçmiş. **→ Karşılandı (2026-10-07).** Açık kalanlar P1'in kapanışını engellemez: P1.9 (arşivin müşteriye teslimi), P1.10 (Vercel Blob için kullanıcıdan mağaza ve token), P1.12 (zh/jp tarama riskleri P5'te).

---

### P2: Çok dilli altyapı ve URL/bilgi mimarisi paritesi (EN)
**Amaç:** Siteyi üç dilli ve eski URL yapısıyla aynı kuruluma getirmek. İçerik EN, arayüz üç dilde.
**Ön okuma:** `01-app/02-guides/internationalization.md`, `01-app/03-api-reference/03-file-conventions/proxy.md`, `…/04-functions/next-root-params.md`, `…/05-config/01-next-config-js/trailingSlash.md`, `…/04-functions/generate-static-params.md`, `…/04-functions/generate-metadata.md`, `…/03-file-conventions/01-metadata/sitemap.md`.

- [x] P2.1 Locale modeli: `src/i18n/config.ts`. URL öneki → html dili eşlemesi: `en`→`en`, `zh`→`zh-Hant`, `jp`→`ja`. `hasLocale` yardımcısı.
- [x] P2.2 Tüm sayfaları `app/[lang]/` altına taşı. Kök layout `<html lang>` değerini locale'den alır. `next.config.ts` içinde `trailingSlash: true`.
- [x] P2.3 `proxy.ts`: locale'siz yolları `/en/…`'e yönlendir; `/` → `/en/` (canlıdaki gibi 301). Dil bazlı otomatik yönlendirme yapma (botlar için güvensiz), `x-default` P8'de.
- [~] P2.4 (kısmen yapıldı 2026-10-14; kalan metinler P3 ile birlikte) Sözlükler: `src/i18n/dictionaries/{en,zh,jp}.json`. Tüm sabit UI metinleri çıkarılır (Header, Footer, formlar, buton ve aria etiketleri, politika tabloları, 404, boş durumlar). Para ve tarih biçimleri locale'e göre. `getDictionary()` `next/root-params` ile.
  - **Yapıldı:** `src/i18n/dictionaries/{en,zh,jp}.json` + `dictionaries.ts` (`Dictionary` tipi EN'den türer; zh/jp'de eksik anahtar derlemeyi bozar), `format()` (`{ad}` yer tutucuları), `format.ts` (`formatPrice`, `formatDate`; para ve tarih dile göre), `getDictionaryForPage()` (sunucu). Sözlüğe çıkarılanlar: Header (menü, açılır menüler, aria etiketleri), Footer, WhatsApp düğmesi, 404, atlama bağlantısı, varsayılan başlık/açıklama (`generateMetadata` dile göre), ülke adları ve sloganları. Doğrulandı: `/zh/` ve `/jp/` header ve footer kendi dilinde, `notFound()` ile gelen 404 kendi dilinde.
  - **Bilinçli olarak sonraya bırakılanlar:** formlar (QuoteForm, SearchBar, iletişim) P3.10'da yeniden yazılacağı için; içerik bileşenleri (HomeSections, TourSections, kartlar, filtreler, politika tabloları) P3'te şablonlarla birlikte; sayfa başlıkları ve açıklamaları (şu an zh/jp'de İngilizce) P2.5-P2.6 veri katmanı ve sayfa içeriğiyle. Yeni bir bileşen eklenirken sabit metin **doğrudan sözlüğe** yazılır.
  - **Çeviri durumu (önemli):** zh/jp metinlerinin menü adları eski sitelerden alındı (zh: 關於我們, 聯繫, 多國旅遊行程, ülke adları; jp: 会社概要, 問い合わせ先, ホーム, ツアー adları). **Geri kalanı benim taslağım**, anadil denetimi yapılmadı (özellikle sloganlar, açıklama, 404 metni, altbilgi cümleleri). Müşteri (Meifen ve jp tarafı) P4 onay kapısında gözden geçirir; denetlenmemiş metinler yayına çıkmaz.
  - **Eski site notu:** zh/jp eski sitelerde iletişim formu alanları EN'den farklı (ad, e-posta, telefon, mesaj; konu yok), jp'de LINE bağlantısı var, zh/jp menüsündeki blog bağlantısı dil önekisiz `/blog/`. Bu P3.10 ve P7 için girdi.
- [x] P2.5 **Veri erişim katmanı** `src/lib/data/`: `getTourByPath(lang, path)`, `listToursByCategory`, `getCombo`, `getCountry`, vb. Kaynak şimdilik `content/scraped/` JSON'u. Sayfalar veriyi yalnızca buradan okur. CMS geçişi (P6) bu katmanın içini değiştirir.
- [x] P2.6 **Rota paritesi (EN)**, Ek B'ye göre: destinations hub, ülke, kategori, tur, kombo, kombo altı turlar, blog hub, blog kategorisi, blog yazısı, yazar, `gdpr/*` (3 sayfa), search. Tur derinliği değişken (Türkiye ve Yunanistan'da kategori altında, Mısır/Ürdün/Fas'ta doğrudan ülke altında): `[...path]` catch-all + tip çözücü (ülke / kategori / tur) ve `generateStaticParams` veriden üretilir.
- [x] P2.7 Metadata: `buildMetadata` locale'e duyarlı. canonical, `alternates.languages` (karşılığı olanlar için), JSON-LD `inLanguage`. Sitemap locale başına, alternates yalnızca karşılığı olan sayfalarda.
- [x] P2.8 Dil değiştirici (masaüstü başlık + mobil çekmece): karşılığı varsa o sayfaya, yoksa o dilin destinations hub'ına (D11). Çerez kullanma.
- [x] P2.9 Mevcut yeni sayfalar `[lang]` altında: `/tours/`, `/private-tours/`, `/small-group-tours/`, `/plan-my-trip/`, `/multi-country-tours/`. `/travel-hub` kaldırılır, yerine `/blog/` (D14). `next.config.ts` içindeki eski `legacy` yönlendirme listesi kaldırılır (yapı artık eskiyle aynı, `/en` yönlendirmeleri gereksiz).
- [x] P2.10 CJK tipografi: `next/font/google` ile Noto Sans/Serif TC ve JP, yalnızca ilgili locale'de yüklensin, `display: swap`. Başlıkta `text-wrap: balance`, CJK için `line-break` ve satır yüksekliği ayarı. Uzun başlıklarda taşma ve buton/menü genişlikleri kontrol edilir.
- [x] P2.11 Zh ve jp sayfalarında içerik EN'den geldiği için görünür "içerik hazırlanıyor" notu (yalnızca önizleme). `noindex` eklenmez (D33: karar verildi).
- [x] P2.12 D18 (`/videos/`) ve D19 (multi-country indeksi) kararı uygulanır.
- [x] P2.13 **Site içi arama** (canlıda `/search/` var, müşteri tasarımında arama çubuğu var): tur, kategori ve blog üzerinde dile göre arama. Sonuç sayfaları `noindex, follow`, canonical kendine; arama URL'leri sitemap dışı.
- [x] P2.14 **Parametre, sayfalama ve filtre kuralları:** `?destination=&style=&duration=` gibi filtre URL'leri canonical'ı ana listeye verir (veya `noindex`); blog hub/kategori sayfalamasında her sayfa kendi canonical'ına sahip, `?page=` tutarlı, `rel=prev/next` kullanılmaz; sayfalı URL'ler sitemap'e girer.
- [x] P2.15 **Özel 404 ve 410 sayfaları** (dil başına): doğru HTTP kodu döner, arama kutusu ve popüler bağlantılar içerir. Soft-404 üretmez.
- [x] P2.16 **D26:** GSAP/ScrollTrigger hero parallax'ı kaldırıldıysa bağımlılıkları (`gsap`, `@gsap/react`) kaldır; `HeroImage` statik görsele dönsün; hero'da `fetchpriority=high` ve çizim gecikmesi giderilsin.
- [x] P2.17 **CI iskeleti (İş akışı T1):** GitHub Actions: `lint`, `tsc`, `build`; sonradan T2-T5 testleri bu hatta eklenir.
- [x] P2.18 **Sitemap temeli (P8.2'nin ön hazırlığı):** `src/app/sitemap.ts` dil başına ayrı sitemap üretir (`generateSitemaps`, kimlikler `en`, `zh`, `jp`; adresler `/sitemap/en.xml` vb.; Next otomatik sitemap indeksi üretmez, indeks gerekirse ayrı rota işleyicisiyle eklenir, P8.2'de karar). Yalnızca **o dilde gerçekten var olan, 200 dönen, indexlenebilir** sayfaları listeler (kaynak: P2.5 veri katmanı, yani var olmayan zh/jp turu EN listesinden sızmaz). URL'ler mutlak, eğik çizgili ve canonical ile birebir aynı. Filtre/arama/parametreli URL'ler (P2.13, P2.14) listeye girmez. `lastModified` yalnızca gerçek bir tarih varsa yazılır (build tarihi yazılmaz). Karşılığı olan sayfalarda `alternates.languages` (P2.7). Doğrulama: derlenmiş çıktıda her URL'nin 200 verdiği betikle kontrol edilir (T2). **Şu an:** geçici tek İngilizce sitemap var, yeni rotalar eklendikçe (P2.6) güncellenir.
- [x] P2.19 **robots.txt temeli (P8.3'ün ön hazırlığı):** `src/app/robots.ts`: `Allow: /`, `/api/` engelli, CSS/JS/görsel engellenmez, dil başına sitemap adresleri listelenir, arama sonucu sayfaları `noindex` meta ile kapatılır (robots.txt'e değil, çünkü engellenen sayfanın `noindex`'i okunamaz). `src/proxy.ts` eşleştiricisi `robots.txt` ve `sitemap/*.xml` yollarını yönlendirmez (uzantılı yollar zaten dışarıda; testle doğrulanır). AI tarayıcı kararı ve `llms.txt` P8.3'te. **Şu an:** `robots.ts` var ama sitemap olarak tek `/sitemap.xml` gösteriyor, P2.18 ile birlikte güncellenir.

**P2 uygulama notları (2026-10-14, branch `feat/i18n-url-parity`):**
- **P2.5 veri katmanı** `src/lib/data/` (**P6.5 ile Sanity'ye geçti, aşağıya bkz.**): tek kapı `index.ts` (`getTour`, `allTours`, `toursUnder`, `getPage`, `pagesOfKind`, `resolveDestination`, `destinationParams`, `featuredTours`, `comboPages`, `blogPosts`, `searchEntries`, `sitemapPaths`, `languagesWithPage`, `hasNativeContent`); `store.ts` JSON'u dile göre okur, zh/jp için içerik yoksa EN'e düşer (`fallback: true`); `images.ts` görseli manifestten çözer (manifestte `url` olunca o kullanılır, yoksa canlı site adresi); `cards.ts` küçük kart verisi (istemciye ağır tur verisi gitmez). Sayfalar `content/scraped/`'a doğrudan dokunmaz. Israel geçen başlıklı bölümler ve kartlar katmanda süzülür (D4).
- **P2.6 rotalar (hepsi EN'de 200):** `destinations/[...path]` (ülke, kombo, kategori, tur; tür çözücü), `blog/`, `blog/[...path]` (kategori, yazı), `authors/[name]`, `gdpr/[slug]` (3 sayfa), `search/`, `[...rest]` (404). Kazınan 118 tur, 6 kombo, 10 kategori, 5 ülke, 34 yazı, 5 blog kategorisi sayfası yayında. Elle yazılmış 6 tur, 18 kombo, 9 blog yazısı, `tours/[slug]`, `multi-country-tours/[slug]`, `travel-hub`, `privacy-policy`, `terms-conditions` kaldırıldı (gerçek metin `gdpr/*` altında). `about`, `contact`, `faq` şimdilik elle yazılmış kalıyor (P3'te gerçek metinle değişir).
- **P2.7:** `buildMetadata` canonical, `og:locale`, `alternateLangs` (hreflang yalnızca en az iki dilde gerçek karşılığı varsa), `canonicalLang` (EN yedek sayfalar canonical'ı EN'e verir), `noindex`; JSON-LD `TouristTrip`, `FAQPage`, `BlogPosting`, `CollectionPage`, `ItemList`, `BreadcrumbList` dile duyarlı.
- **P2.8:** `LanguageSwitcher` (bayraklı açılır menü, her seçenek düz bağlantı, çerez yok; mobil çekmecede liste; bayraklar satır içi SVG, Çince için Tayvan bayrağı), `switchLocaleHref`: ortak sayfada aynı sayfa, tur/kategori/yazıda o dilin destinations hub'ı (zh/jp eşleştirmesi P5'te).
- **P2.9:** yeni açılış sayfaları `[lang]` altında, `travel-hub` → `blog`, eski `legacy` yönlendirme listesi kaldırıldı.
- **P2.10:** CJK yazı tipleri (`Noto Sans/Serif TC` ve `JP`), yalnızca ilgili dilde sınıf eklenir, `preload: false`, `lang` kurallarıyla satır yüksekliği ve başlık ayarı. **Taşma kontrolü P3'te gerçek zh/jp içerikle** yapılacak (şimdi menü ve altbilgi dışında CJK metin yok).
- **P2.11:** zh/jp'de içeriği olmayan dil için sitenin üstünde görünür "hazırlanıyor" notu (`hasNativeContent`); `noindex` yok, canonical EN'e.
- **P2.12:** `/en/videos/` → `/en/blog/` (308, kalıcı). Multi-country: `/destinations/` ülkeler + kombo kartları, `/multi-country-tours/` ek açılış sayfası.
- **P2.13:** `search/` (`noindex, follow`) ve `search-index.json` (dil başına statik JSON, 173 kayıt), tarayıcıda süzme. Sitemap dışı.
- **P2.14:** filtre URL'leri canonical'ı kendi yoluna verir (sorgu yok), arama `noindex`. Sayfalama şimdilik yok (en çok 118 tur, 34 yazı tek sayfada); eklenirse `?page=` ve kendi canonical'ı.
- **P2.15:** 404 dile göre (arama kutusu ve popüler bağlantılar), `[...rest]` ile gerçek 404 kodu; **410** `src/lib/gone.ts` + `proxy.ts` (şimdilik `israel` içeren her adres; P7.9 hangilerinin 301 alacağını ayıklar).
- **P2.16:** GSAP ve ScrollTrigger kaldırıldı (`gsap`, `@gsap/react`), `HeroImage` statik.
- **P2.17:** `.github/workflows/ci.yml` (lint, tsc, build). T2 testleri bu işe eklenecek.
- **P2.18/P2.19:** `sitemap.ts` dil başına (`/sitemap/en.xml`, yalnızca gerçek içeriği olan dil), `/search` ve `/videos` listede yok; `robots.ts` bu sitemap'leri gösterir. `lastmod` yok (eski tarih toplu, derleme tarihi yalan olur).
- **Doğrulama:** `npm run check:site` (`scripts/check-site.mjs`): sitemap'teki 193 adresin hepsi 200, tek H1, canonical, doğru `html lang`, geçerli JSON-LD; yönlendirmeler, 404, 410, arama indeksi ve zh/jp yedek sayfa canonical'ı kontrol edilir. `lint`, `tsc`, `build` yeşil.
- **Hata bulundu ve düzeltildi:** `proxy.ts` eşleştiricisinde nokta kaçışı derlemede kaybolunca proxy yalnızca `/` için çalışıyordu (410 ve `/xx/` → `/en/xx/` yönlendirmesi çalışmıyordu). Çözüm: `[.]` karakter sınıfı. `check:site` bunu yakalıyor.
- **P3'e devredilenler (bilinçli):** tur sayfası geçici şablon (`TourDetail`), ülke/kombo/kategori geçici şablon (`DestinationPage`); görseller canlı siteden (Sanity'ye yüklenince `images.ts` yeter; Blob kullanılmayacak); USD ve EUR fiyat (D40); form (P3.10); blog yazısı tasarımı; `about/contact/faq` gerçek metni; ana sayfa ve hub'ların elle yazılmış metni; **Israel (D4) tam süzülüyor:** veri katmanı Israel geçen başlık, paragraf, liste öğesi, tablo satırı, görsel, SSS ve ilgili tur bağlantısını atar; `check:site` her sayfada `israel` arar ve bulursa hata verir (193 sayfa temiz). **Karar verildi (2026-10-14, kullanıcı):** Ürdün turlarındaki coğrafi anmalar ("Jerusalem, Jericho", "mosaic map of the Holy Land", Nebo'dan manzara; 12 sayfa) Ürdün programının parçası, olduğu gibi kalır; zh/jp yol yapısı (`/jp/目的地/`) ve eşleştirme P5.

**Bitti sayılır:** `/en/`, `/zh/`, `/jp/` öneklerinde tüm sayfa türleri açılıyor; `hreflang` ve `html lang` doğru; dil başına sitemap yalnızca var olan 200 sayfaları listeliyor ve `robots.txt` bunları gösteriyor (P2.18, P2.19); EN için Ek B'deki her URL deseni için sayfa var; `tsc`, `lint`, `build` yeşil; CJK'de başlık ve menü taşması yok.

---

### P3: Sayfa yapısı uyumu ve içerik güçlendirme
**Amaç:** Müşterinin şartnamesindeki blokları ve sayfa türlerini eksiksiz kurmak; gerçek EN verisiyle sayfaları doldurmak.
**Ön okuma:** `generate-metadata.md` (JSON-LD ve OG), gerekirse `next/image` dokümanı.

**Tur sayfası (Ek D.2 bloklarına göre)**
- [~] P3.1 (2026-10-15: `TourDetail` blokları ve sırası yapıldı; sabit üst bağlantı çubuğu Overview/Itinerary/Inclusions/FAQs/Reviews, her şey ilk HTML'de, mobilde de aynı çubuk yatay kayar. Akordeon yalnızca program ve SSS'de; bagaj ve iptal "Inclusions" altında. Otel tablosu şemada (`hotels`) var ama veri boş, müşteri girince görünür; uçuş/feribot/transfer ayrı blok değil, `importantNotes` içinde. **Açık:** gerçek cihaz testi P3.15) Şablon blokları: Trip Overview, Day-by-Day Itinerary, Price & Availability (başlangıç fiyatı, sezon, kalkış seçenekleri), Highlights & Route, What's Included, What's Not Included, Hotels & Meals, Flights/Ferries/Transfers, Gallery & Map, FAQ & Important Notes, Enquiry/Customize. Bagaj, iptal ve ödeme özeti de yer alır. **Yeni sekme açılmaz**: otel ve bagaj mevcut sekmelerin içine girer (müşteri kalabalıktan şikayet etmişti). Masaüstünde sekme, mobilde akordeon korunur.
- [~] P3.2 (galeri 4:3 sabit oran, lazy, CLS 0, rota haritası gerçek görselle; ışık kutusu yok) Galeri bileşeni (hafif, CLS = 0, lazy). Rota haritası bölümü gerçek görselle (ışık kutusu opsiyonel).
- [ ] P3.3 Tur başı yorumlar (D22 sonucuna göre). Yinelenen yorum düzeltilir.
- [x] P3.4 (2026-10-15: `TouristTrip` + her para birimi için ayrı `Offer` + `WebPage` + `BreadcrumbList` + SSS varsa `FAQPage`; dahil/hariç `TouristTrip`'te karşılığı olmadığı için eklenmedi) Schema: `TouristTrip` + `Offer` + `WebPage` + `BreadcrumbList`. TouristTrip zenginleştirilir (süre, dahil/hariç, fiyat). FAQ/Review kararı P8'de.

**Listeleme ve hub sayfaları**
- [ ] P3.5 Destinations hub: tek ülke ve kombo grupları (canlıdaki gibi). Kategori sayfası şablonu: giriş metni, tur kartları, SSS, ilgili bloglar, ulaşım ve mevsim bilgisi. `CollectionPage` + `ItemList` + `BreadcrumbList`.
- [ ] P3.6 Ülke sayfası: kategori kartları, filtre (mevcut filtre bileşeni yeniden kullanılır), ilgili bloglar, ulaşım. Per-country tema korunur. **Fas gerçek turlarla** ("planned to order" kaldırılır).
- [ ] P3.7 Kombo sayfaları ve altlarındaki turlar. **Ana sayfada kombo turlar öne çıkar** ("Find your Perfect Tour" bölümü kombo kartlarıyla veya kombo rayı yukarı).

**Blog, kurumsal, formlar**
- [ ] P3.8 Blog şablonu: önce kısa cevap, kaynaklar, yazar kartı, gerçek güncelleme tarihi, ilgili tur bağlantıları. Blog kategorisi, yazar sayfası, `/blog/` Travel Hub görünümü. Müşterinin listelediği **34 yazı olduğu gibi, aynı URL'de** taşınır (D12; HTML → zengin metin dönüşümü P6.4'te, içerik ve görseller değiştirilmez). 5 "Map of X" yazısı bunların arasında.
- [ ] P3.9 About ve Contact: ekip bloğu, çalışma saatleri, lisans doğrulama bağlantısı. `AboutPage` / `ContactPage`. **Müşteri içeriği geldi (2026-10-12, `data/client-inputs/`):** Nihat Yolageldi (Founder & Travel Consultant), Kenan Ungur (Operations Manager & Travel Consultant), her ikisi için çalışma saatleri 9:00-19:00 ve e-posta, iki portre fotoğraf. **Teyit edildi (2026-10-12):** soldaki fotoğraf Nihat Yolageldi (image1), sağdaki Kenan Ungur (image2). **Hâlâ açık:** saat dilimi (İstanbul, GMT+3 varsayıldı, sayfada belirtilir). Fotoğraflar repoya girmez, Sanity'ye yüklenir.
- [~] P3.10 (2026-10-15: `QuoteForm` sunucu sarmalayıcı + `QuoteFormClient`; tur başlığı formda görünür ve e-postanın ilk satırı; alanlar: uyruk, ülke kodu + telefon, yetişkin, çocuk ve yaşları, tarih, para birimi (EUR/USD), sayfa varyantında bitiş tarihi, tarz, otel sınıfı, bütçe; e-posta konusu "Magnificent Travel - Request a Quote" ve müşterinin sırası; metinler sözlükte (en/zh/jp). **Açık:** spam koruması (Turnstile/reCAPTCHA kararı), iletişim formunun zh/jp eski alanlarıyla karşılaştırması, Brevo/Resend (P9.3)) Form paritesi: eski formdaki alanlar (yetişkin, çocuk ve yaşları, geliş/gidiş tarihi, bütçe, otel sınıfı, uyruk, para birimi, ülke kodlu telefon, notlar) ile bizim formumuz karşılaştırılır. Telefon/WhatsApp alanı tüm teklif formlarında. Spam koruması (Turnstile veya reCAPTCHA, karar). D17 sonucuna göre başvuru kaydı. **Müşteri talebi (2026-10-12):** hangi tur sayfasından form gönderilirse **turun başlığı formda otomatik, görünür biçimde** yer alır ve bize gelen e-postaya eklenir. Müşterinin istediği e-posta düzeni (başlık "Magnificent Travel - Request a Quote", ilk satır "Tour: …", ardından Name, Nationality, E-Mail, Code, Mobile Phone, Number of Adults, Preferred Tour Start Date, Notes). USD/EUR para birimi alanı (D28, D40). Şu an sitemizde form turun adını yalnızca arka planda gönderiyor, formda görünmüyor.

**İçerik ve düzeltmeler**
- [ ] P3.11 İçerik güçlendirme (turlar hariç): ülke, kategori ve kombo giriş metinleri, SSS, About, Travel Hub. Kural: canlı sayfada sıralama alan başlıklar ve H1/H2'ler korunur (D23). Her sayfada tek H1.
- [ ] P3.12 Denetimde bulunan düzeltmeler: `draft` bayrağı gerçekten uygulanır, ana sayfa başlığına Morocco eklenir, footer'daki Türkçe Webcraft kredisi locale'e uygun hâle getirilir, `dl` erişilebilirlik hatası, hero görselinde `fetchpriority=high` ve çizim gecikmesinin nedeni.

**Ek görevler (1.1)**
- [ ] P3.13 **Başlık, meta ve H1 şablonları** (S2.2 çıktısı) uygulanır. Şu an 35 sayfanın 11'inde başlık 60 karakteri aşıyor (ana sayfa 86, tur başlıkları 68-107), 10'unda meta 120 karakterin altında, ülke sayfası başlığı jenerik ("Turkey Tours | Magnificent Travel"). **Her sayfada tek H1.**
- [ ] P3.14 **Görsel kaynağı ve lisans kaydı (D7):** ülke, kategori ve hub görselleri mevcut Pexels görselleridir (müşteri kabul etti). Turlarda canlı sitenin orijinal fotoğraf ve haritaları kullanılır (P1.6). Kalite yetersizse Depositphotos'tan değiştirilir. Lisans kaydı `docs/image-licenses.md` (görsel, kaynak, lisans/indirme no, kullanıldığı sayfa); About'taki "Photo credits" bölümü Pexels görselleri olduğu sürece güncel tutulur. Depositphotos hesap bilgileri repoya ve dokümana yazılmaz.
- [ ] P3.15 **Mobil öncelikli doğrulama** (trafiğin çoğu mobil): iOS Safari ve Android Chrome'da gerçek cihaz testi; sticky WhatsApp ve sticky CTA'nın içeriği ve formu kapatmaması; form kullanılabilirliği; akordeon; dil değiştirici; dokunma hedefleri.
- [x] P3.16 (2026-10-15: `price {eur, usd, unit, note}` Studio'da, `TourPrice` kart ve sayfada dolu olan her para birimini gösterir, boşsa "Price on request"; içe aktarma `price.usd`, `hotels`, `departures` alanlarını **ezmez**; "taxes included" notu eklenmedi çünkü her turda doğru değil, tur kendi dahil listesinde yazıyor) Fiyat gösterimi: her turda EUR ve USD birlikte (D40), her biri isteğe bağlı; `Offer` her para birimi için ayrı; "taxes included" notu.
- [ ] P3.17 Yorum gösterimi: Tripadvisor kullanım koşullarına uygun biçim (resmi widget veya izinli alıntı) ve kaynak/tarih bilgisi (D22).
- [ ] P3.19 **"Map of X" sayfaları** (5 sayfa, ≈ 52.700 tıklama/yıl, pozisyon 1,8-3,5): aynı URL, aynı konu ve görseller, yeni tasarımda harita görseli öne çıkar. İçerikte mevcut sorgu varyantları korunur ("with cities", "and islands", "on map", yazım hataları dahil). Başlık/meta/CTR iyileştirmesi yalnızca S4'te denenir. İlgili turlara iç link.
- [ ] P3.20 **Kombo odaklı ticari yapı:** kombolar en iyi sıralanan ticari sayfalar (pozisyon 11-30), ülke sayfaları 49-67. Kombo sayfaları ve altlarındaki turlar eski sıralama sinyallerini aynen korur (URL, H1, başlık); ana sayfa ve navigasyonda öne çıkar.
- [ ] P3.18 Güven öğelerinin aynı sayfada iki kez tekrar etmemesi (müşteri 29 Eylül'de tasarımda gördü): `TrustBar` ve "Why travel with us" bloklarının çakışması gözden geçirilir.

**Bitti sayılır:** EN için tüm sayfa türleri gerçek veriyle çalışıyor; şartnamedeki her blok tur sayfasında var; haritalar ve galeriler gerçek; Fas turları yayında; ana sayfada kombolar öne çıkmış; Lighthouse mobil denemesi alınmış (hedefe uzaksa P9 backlog'una yazılmış).

---

### P4: Mock yayını ve müşteri onayı (KAPI)
**Amaç:** Müşteriye gösterilecek önizlemeyi yayınlamak, onay almak. **Onay olmadan P6'ya (veri modeli kilidi) geçilmez.**

- [ ] P4.1 Önizleme adresi (`magnificent*.vercel.app`) güncel (D33: `noindex` eklenmez, adres müşteriyle özel paylaşılır), gerekirse parola.
- [ ] P4.2 QA: `lint`, `tsc`, `build`; iç link taraması (kırık link yok); Lighthouse mobil: ana sayfa, ülke, kategori, tur × 3 dil; Playwright ekran görüntüleri (390 ve 1440 px); erişilebilirlik kontrolü.
- [ ] P4.3 Müşteri sunumu: ne gerçek ne iskelet olduğu net yazılı ("zh ve jp içeriği ve arayüz çevirileri sonraki fazda"). Onay kontrol listesi: URL yapısı, sayfa türleri, tasarım, dil değiştirici, tur sayfası blokları.
- [ ] P4.4 Geri bildirim `§7 backlog`'a veya ilgili faza işlenir. Yazılı onay günlüğe kaydedilir.
- [ ] P4.5 **SEO parite raporu:** P1.11 baseline'ına karşı her EN URL için eski/yeni başlık, H1, meta, canonical, iç link sayısı ve schema türleri karşılaştırılır. Sıralama alan sayfalarda gerekçesiz değişiklik yok. Fark nedenleri kayıtlı (örn. 3 H1 → 1 H1, bozuk meta düzeltmesi).
- [ ] P4.6 Ek H kabul listesinin **ilk geçişi** (T2 otomatik testleriyle); geçmeyen maddeler ilgili faza görev olarak yazılır.

**Bitti sayılır:** müşteri yazılı olarak onayladı, veri modeli (Ek C) üzerindeki itirazlar kapandı.

---

### P5: Çince ve Japonca scrape ve dil eşleştirme
**Amaç:** zh ve jp içeriğini P1 ile aynı hatta çekmek. Bu iki sitede GSC/GA verisi yok; kural: **her eski URL'nin bir akıbeti olur** (veriye göre önceliklendirme yapılmaz).

- [ ] P5.1 ZH (güncel 462 URL, 2026-10-12) ve JA (275 URL) ham arşivi. Ana sayfalar 12 Ekim'de yeniden arşivlendi (`data/archive/zh`, `jp`); 7 Ekim anlık görüntüsü `*-2026-10-07` klasörlerinde.
- [ ] P5.2 Ayrıştırıcıları iki dile uyarla. Yapı EN'den farklı (Ek A.3). **Alt-URL'ler** (`/tour-itinerary/`, `/inclusion-rate/`, `/review/`, `/reviews/`, `/itinerary/`) tek tur kaydında birleştirilir. Japonca slug'lar yüzde-kodlu, Unicode olarak saklanır.
- [ ] P5.3 `/cn/` yalnızca eşleme için arşivlenir (içeriği alınmaz, D10).
- [ ] P5.4 **Dil eşleştirme** (ön analiz yapıldı: `docs/baseline/tour-overlap-2026-10-07.md`, 12 Ekim güncellemesiyle (müşteri zh/jp'den tur sildi): ZH 53, JP 63 tur kaldı, bunların ≈ %85-87'sinin EN'de karşılığı var; 118 EN turunun yalnızca ≈ %42'sinin (50) zh veya jp'de karşılığı var; jp'nin kendi ürün kodları var; zh'de Fas turu kalmadı): aynı turun üç dildeki karşılıkları (tur kodu `T-xx`, görsel özeti, rota ve gün sayısı) → `data/mapping/translations.csv`. Müşteriye doğrulatılır. Karşılığı olmayanlar işaretlenir (D11).
- [ ] P5.5 Yasal ve statik sayfalar (gizlilik, şartlar, hakkında, SSS, iletişim) zh ve jp için scrape'ten alınır, yeniden çevrilmez.
- [ ] P5.6 Görseller P1.6/P1.10 hattından geçer.
- [ ] P5.7 Arayüz sözlüklerinin (`zh.json`, `jp.json`) ana dili konuşan biri tarafından incelenmesi, terim listesi (Tur, Özel tur, Grup turu vb.).
- [ ] P5.8 `content/scraped/zh/`, `content/scraped/jp/` normalize ve CJK sayfa QA'sı (başlıklar, fiyat biçimi, satır kırılması).
- [ ] P5.9 zh ve jp için SEO envanteri (P1.11) ve parite raporu (P4.5). GSC olmadığı için öncelik yok: her URL aynı özenle ele alınır.
- [ ] P5.10 Her dilin fiyat birimi ve gösterimi çıkarılır (D28); Japonca ve Çince tur kodları ve adlandırmaları terim sözlüğüne işlenir.

**Bitti sayılır:** zh ve jp içeriği normalize JSON'da; dil eşleştirme tablosu müşteri tarafından doğrulanmış; her eski zh/jp URL için hedef türü (aynı yol / 301 / üst kategori) belirlenmiş.

---

### P6: Sanity CMS kurulumu ve içerik aktarımı
**Amaç:** İçeriği müşterinin yönetebileceği CMS'e taşımak ve siteyi CMS'e bağlamak.
**Ön okuma:** Sanity resmi dokümanı (repoda yok; güncel olarak kontrol edilir), ISR/`revalidate` ve draft mode için Next dokümanı (`01-app/02-guides/`).

- [~] P6.1 (production hazır; `staging` kaldı: `spike` silinince açılacak, kullanıcı işi) Sanity projesi: `production` ve `staging` dataset'leri (ücretsiz planda 2 dataset, public). Plan limitlerini fiyat sayfasından doğrula (doküman, API isteği, ticari kullanım). Free'de yalnızca 2 rol var (Administrator, Viewer), editör rolü yok (P6.15).
- [x] P6.2 (2026-10-14, `studio/schemaTypes/`) Şema (Ek C): tur, kategori, ülke, kombo, blog yazısı, blog kategorisi, yazar, SSS, yorum, site ayarları, statik sayfa. Dile özel slug, `translationGroup`, `oldUrl` alanı (yönlendirme için). Dil başına ayrı doküman (D9).
- [~] P6.3 (2026-10-14: `studio/` yazıldı, `sanity schema validate` temiz; yayınlamak için kullanıcının `sanity login` ve `npm run deploy` adımı kaldı; yol üretimi ve taslak önizleme kaldı) Studio: dil gruplu masaüstü yapısı, alan açıklamaları, doğrulama kuralları (zorunlu alanlar, fiyat sayı), yol (path) üretimi eski URL desenine göre, draft önizleme.
- [x] P6.4 (2026-10-14, `scripts/sanity/import.mjs`, `npm run sanity:import`) İçe aktarma betiği: normalize JSON → Sanity. Idempotent (sabit `_id`), görseller asset olarak, rapor üretir. Sıra: EN, sonra zh, jp.
- [~] P6.5 (2026-10-14: veri katmanı Sanity'den okuyor, `/api/revalidate/` çalışıyor; webhook'un kendisi ve taslak önizleme kaldı) Kod geçişi: veri erişim katmanı (P2.5) Sanity'den okur (GROQ). Revalidate webhook'u (`/api/revalidate`) ve etiketler, draft mode önizleme. Sayfalar statik üretilmeye devam eder.
- [ ] P6.6 **Kabul testi:** müşteri ekibinden biri geliştirici yardımı olmadan yeni bir tur ekler, çevirisini ekler, yayınlar ve sitede görür. Kısa Türkçe kullanım kılavuzu (1-2 sayfa).
- [ ] P6.7 Günlük yedek: `sanity dataset export` zamanlanmış görevle (GitHub Actions) güvenli depoya. Bir geri yükleme provası yapılır. **Sanity'nin kendi yedeği yok:** plan karşılaştırma tablosunda "Backups" yalnızca Enterprise'ta (Free ve Growth'ta dahil değil), "Complete history" de yok, değişiklik geçmişi Free'de 3 gün (Growth'ta 90). Bizim gece yedeğimiz tek güvence.
- [ ] P6.8 İçe aktarma doğrulaması: tur sayısı, 20 rastgele turda alan karşılaştırması, görseller.
- [ ] P6.9 (D17'ye bağlı) form başvuruları için Neon.
- [x] P6.10 (2026-10-14: tur, kombo, politika verisi, `content/travel-hub/`, dosyadan okuyan depo ve spike betiği kaldırıldı; ana sayfa görselleri ve ülke vitrin verisi `src/data/` içinde kalıyor, P3'te CMS'e taşınır) Eski `src/data/*.ts` ve `content/travel-hub/` kaldırılır.
- [ ] P6.11 **CMS SEO alanları ve doğrulayıcıları (S3.3):** title ve meta için karakter sayacı ve uyarı, H1 override, canonical override, `noindex` anahtarı, "kısa cevap" ve SSS alanları, zorunlu yazar, "son güncelleme" tarihi, alt metin zorunluluğu (görsel yüklerken), slug biçimi kontrolü. Kısa Türkçe editoryal kılavuz.
- [ ] P6.12 **Blog yazma akışı kabul testi:** müşteri ekibi yeni bir blog yazısı ekler (yazar, kategori, ilgili tur, SSS), önizler, yayınlar. Müşteri 40-50 yeni yazı yazacak, bu akış kritik.
- [ ] P6.13 Hesap sahipliği matrisi (D31) uygulanır: Vercel, Sanity, GitHub, Resend, GA4/GTM, GSC kimin hesabında, kim yönetici, erişimler belgelenir.
- [ ] P6.14 **Blog için opsiyonel self-servis yönlendirme (D36 yanıtına bağlı):** blog yazısı şemasına çoklu `eskiUrl` alanı. Müşteri yeni yazıyı yayınlarken eski adresi yapıştırır, eski → yeni 301 otomatik oluşur (ayrı yönetici ekranı gerekmez). Doğrulama: yalnızca site içi yol, döngü ve zincir yok, aynı eski URL iki yazıda olamaz. Mekanizma D25 spike'ına bağlı (≤ 1.000 kural ise build sırasında, aksi halde `proxy` + arama; yayınlayınca webhook ile yeniden derleme). Müşteri B'yi istemezse bu görev silinir ve liste bize gelir. **Tur, destinations, kategori, alan adı ve diğer tüm yönlendirmeler P7'de bizim işimizdir.**
- [ ] P6.15 **Sanity Free limit bütçesi ve izleme (D8):**
  - **Attribute (en kritik, limit 2.000):** çeviri **doküman düzeyinde** (her dil ayrı doküman, D9); alan düzeyinde dil nesnesi **kullanılmaz** (attribute'ları dil sayısıyla çarpar, tahminen 2.000'i aşar). Portable Text yalnızca blog gövdesinde; diğer uzun alanlar düz metin/markdown. Sayfa oluşturucu (page builder) tipli diziler yok. İçe aktarma payload'ından ve aktarım sonrası dışa aktarımdan benzersiz yol+veri tipi sayısı hesaplanır (betik); **tavan 1.400 (limitin %70'i)**, 1.600'de uyarı. **İlk hesap yapıldı (P1.7):** normalize EN JSON'da 108 benzersiz attribute. Sanity'de görsel/referans/slug/SEO/sistem alanları eklenince tahmin ≈ 400-700 (limitin %20-35'i), önceki tahminden (700-1.000) daha rahat. zh/jp ve CMS'e özgü alanlar eklenince yeniden hesaplanır.
  - **Doküman (limit 10.000):** ~~görseller de doküman sayılır~~ **Ölçüm bunu çürüttü (aşağıdaki spike):** Usage ekranında yalnızca içerik dokümanları sayılıyor, görsel varlıkları (asset) ve sistem dokümanları ayrı. Görseller içerik özetiyle tekilleştirilir, aynı fotoğraf bir kez yüklenir. Güncel tahmin: EN 190 doküman; zh/jp ve 520 eski blog yazısı eklense bile 10.000'in çok altında.
  - **Ölçüm (spike, 2026-10-12/13, `scripts/sanity-spike/import.mjs`, geçici `spike` dataset'i, Growth Trial planı):** tüm EN içerik (118 tur + 72 sayfa + 832 görsel) aktarıldı. **Usage ekranı:** Documents **190 / 10k** (bizim sayım: 190), Assets **77,3 MB / 100 GB** (bizim sorgu: 77,29 MB), API Requests **852 / 250k** (toplu aktarma dahil), Bandwidth 1,7 MB (yükleme bant genişliğine sayılmadı). Usage sayfası günlük güncelleniyor, kalıcı kotalar ilk gün gecikmeli göründü. **Attributes: 125 / 2k** (kullanıcı `spike` dataset'inde okudu). Bizim kendi sayımız 69 benzersiz alan adı / 117 alan yolu idi, Sanity 125 sayıyor: tahminimiz doğru çıktı, fark sistem alanlarından. Limit 2.000, yani EN için %6. zh ve jp doküman düzeyinde çeviriyle aynı alanları kullanacağı için (D9) üç dilde de yaklaşık aynı kalmalı. **Kapsam dışı kalan:** deneme Growth Trial'da yapıldı, Free'deki rol, geçmiş ve yedek davranışı bu testle doğrulanmadı. `spike` dataset'i 2/2 dataset hakkını dolduruyor, test bitince silinecek.
  - **API (250 bin API + 1 milyon CDN isteği/ay):** sayfalar statik üretilir, ziyaretçi Sanity'ye istek atmaz. Önizleme/geliştirme derlemeleri `staging` dataset'ini kullanır, her commit'te tam içerik çekimi yapılmaz; canlıda yayın sonrası yalnızca değişen sayfa revalidate edilir (webhook). **Site içi arama canlı Sanity sorgusu yapmaz**, derleme sırasında üretilen statik indeks kullanır. Kullanım panelinden %70'te uyarı.
  - **Bant genişliği (100 GB/ay):** görseller `auto=format` ve genişlik sınırıyla servis edilir; Vercel görsel önbelleği (D29) Sanity çıkışını azaltır. Aylık oturum başına tahmin: 25 bin oturum × 2 sayfa × ~0,7 MB ≈ 35 GB. Trafik iki katına çıkarsa izlenir.
  - **Roller:** Free'de yalnızca Administrator ve Viewer var, **editör rolü yok**. Müşterinin içerik girenleri Administrator olur. Yönetici sayısı en aza indirilir, geçmiş yalnızca 3 gün olduğu için gece yedeği (P6.7) şart.
  - **Webhook (2 adet):** biri production revalidate, biri staging. Üçüncüye gerek çıkarsa tasarım gözden geçirilir.
  - **Aşım davranışı:** Free plan limite gelince istekleri engeller (ücretlendirmez). Yayınlanmış statik sayfalar çalışır, düzenleme, önizleme ve derleme durur. Bu nedenle kullanım uyarısı (P9.4 izleme) kurulur.
  - **Free'de olmayanlar (resmi plan tablosu, 2026-10-07):** Editor/Developer/Contributor rolleri, planlı yayın (scheduled drafts), yorumlar, görev yönetimi, özel (private) dataset, özel CDN alan adı, yedek. Müşteri bunlardan birini isterse Growth gerekir (koltuk başına aylık 15 dolar; 50 koltuk, 5 rol, 25.000 doküman, 10.000 attribute, 90 gün geçmiş, 4 webhook). Growth'ta bile yedek ve özel CDN alan adı yok. Aşım durumunda Growth ek paketlerle ölçeklenir (50 bin doküman için 299 dolar, ek dataset 999 dolar), Free engeller.
  - **Müşteriye söylenecek sınırlamalar:** planlı blog yayını yok (yazı elle yayınlanır), editör rolü yok (içerik girenler yönetici), yorum/görev özelliği yok.
- [ ] P6.16 **Görsel çoğalması ve yetim (orphan) asset önlemi** (doküman kotasını korur). Sanity aynı baytlara sahip dosyayı otomatik tekilleştirir (asset kimliği içerik özetinden türer) ama **hiçbir asset'i otomatik silmez**, bu yüzden üç katman kurulur:
  - **İçe aktarma:** her kaynak görselin içerik özeti hesaplanır, `image-manifest.json`'da özet → asset kimliği eşlemesi tutulur, aynı görsel ikinci kez yüklenmez. Yeniden kodlama/boyutlandırma özet farkı yaratacağı için **önce kaynak özetiyle tekilleştir**, sonra yükle (P1.6 ile uyumlu).
  - **Editör akışı:** görsel alanlarında mevcut görseli seçme (medya tarayıcısı eklentisi asset kaynağı olarak) açık; müşteri kılavuzunda "önce kütüphaneden seç, aynı fotoğrafı yeniden yükleme" kuralı. Eklentinin güncel sürümü ve "kullanılmayanları göster" özelliği kurulumda doğrulanır.
  - **Haftalık temizlik işi (GitHub Actions):** referansı olmayan `sanity.imageAsset`/`sanity.fileAsset` dokümanlarını GROQ ile bulur (taslaklardan gelen referanslar dahil sayılır), **önce kuru çalıştırma raporu**, 7 günden yeni asset'lere dokunmaz (yeni yüklenmiş ama henüz bağlanmamış görseli silmemek için), silmeden önce yedek (P6.7), önce `staging`'de denenir. Sanity'nin resmi "delete unused assets" tarifi (`sanity exec … --with-user-token`) temel alınır. Silinen asset'in `cdn.sanity.io` önbelleğinde bir süre kalabileceği not edilir.
  - **Sınırlar:** tekilleştirme yalnızca bayt bayt aynı dosyada çalışır; kırpılmış, yeniden kaydedilmiş veya farklı boyutlu aynı fotoğraf ayrı asset olur. Temizlik işi Sanity dışı referansları (kodda sabit URL, dış sitelerin hotlink'i) göremez: koda Sanity görsel adresi sabit yazılmaz.

**P6 uygulama notları (2026-10-14, branch `feat/i18n-url-parity`):**
- **Şema** (`studio/schemaTypes/`): `tour`, `destinationPage` (ülke, kombo, kategori), `blogPost`, `blogCategory`, `author`, `staticPage`, `hubPage`, `homePage`; ortak yapı taşları `picture` (alt metin uyarısı), `faq`, `section`, `paragraph`, `list`, `table`, `imageBlock`. Her dil ayrı doküman (D9). `path` doğrulayıcısı: küçük harf, baş/son eğik çizgi ve boşluk yok, **aynı dilde tekil**. Meta başlık ve açıklama için uzunluk uyarısı. İlgili turlar zayıf referans (silinen tur sayfayı bozmaz). Blog gövdesi şimdilik Portable Text değil, `sections` (taşınan 34 yazının yapısı birebir korunur); Portable Text ve biçimlendirme (kalın, bağlantı) P6.12'de yazar akışıyla birlikte ele alınır.
- **Masaüstü** (`studio/structure.ts`): her tür önce dile göre açılır (English, 繁體中文, 日本語). Studio adresi `magnificenttravel.sanity.studio` olacak.
- **İçe aktarma:** 118 tur, 21 destinasyon sayfası, 34 yazı, 5 blog kategorisi, 1 yazar, 6 metin sayfası, 2 hub, 1 ana sayfa = **188 doküman, 832 görsel** `production` dataset'inde. Idempotent (sabit kimlik, görsel içerik özetiyle tekil), 5xx için yeniden deneme, `--prune` ve `--dry`. **Israel süzmesi içe aktarmada:** dataset'te Israel geçen hiçbir birim yok (aktarım Israel bulursa durur). **Kimlikler noktasız** (`tour-en-…`): Sanity'de içinde nokta olan kimlik herkese açık okumada görünmez.
- **Veri katmanı** (`src/lib/data/`): `store.ts`, `images.ts`, `cards.ts` kalktı; her işlev async GROQ sorgusu, sonuçlar `content` etiketiyle Next veri önbelleğinde; liste sayfaları küçük kart alanlarını, sayfa tam kaydı çeker. zh/jp'de içerik yoksa EN dokümanları `fallback: true` ile döner (davranış değişmedi). Görseller `cdn.sanity.io` (`next.config.ts` `remotePatterns`).
- **Yayınlayınca güncelleme:** `POST /api/revalidate/` (sonda eğik çizgi şart, `trailingSlash`), gizli anahtar `x-revalidate-secret` başlığında (`SANITY_REVALIDATE_SECRET`); `revalidateTag('content', { expire: 0 })` bir sonraki ziyarette taze içerik getirir. Yerelde test edildi (anahtarsız 401, yanlışta 401, doğruda 200).
- **Doğrulama:** `check:site` Sanity'den derlenen siteyle **193 adres ALL OK** (200, tek H1, canonical, lang, JSON-LD, Israel yok). Build 594 sayfa, 27 sn.
- **Kullanıcıya kalanlar:** (1) Sanity panelinde `spike` dataset'ini sil (Editor token'ı dataset silemiyor, Administrator gerekir) ve `staging` (public) aç; (2) Studio'yu yayınla: `cd studio`, `npx sanity login`, `npm run deploy`; (3) Vercel proje ayarlarına `SANITY_REVALIDATE_SECRET` ekle (değeri `.env.local`'da); (4) Sanity'de webhook oluştur: URL `https://<site>/api/revalidate/`, yöntem POST, başlık `x-revalidate-secret`, tetikleyici yayın/silme (ücretsiz planda 2 webhook: production ve staging); (5) site alan adı hazır olunca bu adres güncellenir.
- **Kalan P6 işleri:** P6.6 ve P6.12 kabul testleri (müşteri ekibi), P6.7 günlük yedek (GitHub Actions + token), P6.11 kalan SEO alanları (noindex anahtarı, H1/canonical override, zorunlu yazar), P6.13 hesap sahipliği, P6.14 `eskiUrl`, P6.16 yetim görsel temizliği, taslak önizleme (draft mode), D40 USD/EUR fiyat alanları (P3).

**Bitti sayılır:** site tüm içeriği Sanity'den okuyor; P6.6 kabul testi geçti; yedek ve geri yükleme provası yapıldı.

---

### P7: Yönlendirmeler ve 404 yönetimi
**Amaç:** SEO'yu korumak, kırık linkleri engellemek.
**Ön okuma:** `01-app/02-guides/redirecting.md` (özellikle "managing redirects at scale"), `…/05-config/01-next-config-js/redirects.md`, `…/03-file-conventions/proxy.md`. **Not:** Vercel'de `next.config` yönlendirme sınırı 1.024; 1.000'den fazlası için `proxy` ve arama tablosu önerilir.

- [ ] P7.1 Politika: her eski URL için karar: (a) aynı yol, yönlendirme yok (EN), (b) yeni yola 301, (c) üst kategoriye 301 (silinen tur, taşınmayan blog), (d) 404/410 (hayalet URL). Ana sayfaya toplu yönlendirme yok.
- [ ] P7.2 **GSC 404 sınıflandırması (EN):** (1) dış link veya trafik alan silinmiş sayfalar → en yakın sayfaya 301, (2) eğik çizgi/büyük-küçük harf varyantları → normalizasyon, (3) hayalet URL'ler → 404/410.
- [ ] P7.3 **Müşterinin sildiği turlar** (turları eski sitelerden müşteri kendisi sildi, 2026-10-12): liste envanter farkından çıkar (`data/inventory/<site>-2026-10-07.csv` ile güncel CSV). Şu ana kadar: ZH 331 URL (46 `/zh/` + 48 `/cn/` ana sayfa ve alt-URL'leri), JP 166 URL; **EN'de fark yok**. Her biri üst kategoriye veya ülke sayfasına 301.
- [ ] P7.4 **Blog (D12):** 5 Map of X aynı URL (yönlendirme gerekmez). Diğer tüm eski blog URL'leri (`/en/blog/<ülke>/<yazı>/`) varsayılan olarak blog hub'ına 301. Müşterinin CMS'ten eklediği özel yönlendirmeler (P6.14) varsayılandan önce gelir. Karşılığı olmayan ve trafiği/linki olmayan sayfalar için 410 tercih edilebilir, bu karar müşteride.
- [ ] P7.5 zh/jp alan adı geçişi (**eski alan adlarının DNS'i yeni siteye bağlı kalmalı, kapatılmamalı, D38; DNS şu an `netportbilisim.com` ad sunucularında, kontrol kimde netleşmeli**): `eztravelturkey.com/zh/*` → `magnificenttravel.com/zh/*`, `torukoryoko.com/jp/*` → `magnificenttravel.com/jp/*` kural bazlı (host + önek). `/cn/*` → karşılık gelen `/zh/*` (D10). Alt-URL'ler (`/tour-itinerary/` vb.) → tur sayfası. Eski kök sayfalar (`/`) → ilgili dilin ana sayfası.
- [ ] P7.6 Mekanizma spike'ı (D25): kural sayısı ≤ 1.000 ise `redirects` + `has: host`; aksi halde `proxy.ts` + arama (Global Config / Redis / Bloom filter). Seçim ve gerekçe günlüğe yazılır.
- [ ] P7.7 Otomatik test: tüm eski URL envanteri (≈1.900) için betik: durum kodu doğru mu, hedef 200 mü, zincir ≤ 1 mi.
- [ ] P7.8 Normalizasyon: eğik çizgi, `www`, büyük/küçük harf.
- [ ] P7.9 **Israel URL politikası (D27):** `/en/destinations/israel-tours/` (7 URL), `egypt-jordan-and-israel-tours` (6 URL) ve `/en/blog/israel/` (≈60 yazı). GSC'de backlink veya trafik alanlar ilgili hub'a 301, kalanı 410. Soft-404 üretmemek için toplu ana sayfa yönlendirmesi yok.
- [ ] P7.10 **Alias ve host politikası:** `*.vercel.app` production alias'ı ana alan adına 301 (veya `noindex`); `http`→`https`; tek tercih edilen host `www.magnificenttravel.com`; zh/jp eski alan adlarındaki `www` ve çıplak (apex) varyantlar.
- [ ] P7.11 **Soft-404 kuralları:** silinen turlar (müşteri listesi), boş kategoriler ve taşınmayan blog yazıları için 301/410 ayrımı yazılı; özel 404/410 sayfaları (P2.15) kullanılır.
- [ ] P7.12 Eski `/en/search/` ve arama parametreli URL'ler için karar (yeni arama sayfasına yönlendir veya 404).
- [ ] P7.13 **Görsel dosya adresleri:** eski site görselleri `/public/uploads/…` ve `/public/thumbs/…` altında ve Google'da sıralanıyor (örn. `Turkey-Map--1.jpg` 3.380 gösterim). Harita ve blog görselleri için aynı adreslerin korunması veya 301 ile yeni adrese yönlendirilmesi (özellikle "Map of X" yazılarının görselleri). Alt metin, dosya adı ve boyut korunur. **Karar:** 5 "Map of X" yazısının görselleri Sanity'ye girmez, repoda **aynı yolda statik dosya** olarak kalır (örn. `/public/uploads/…/Turkey-Map--1.jpg`). Sebep: Sanity görselleri `cdn.sanity.io` alan adından gelir ve özel CDN alan adı Free/Growth planlarında yok; harita görselleri ise kendi alan adımızda sıralanıyor. Diğer görseller için yeni adres + 301 yeterli.
- [~] P7.14 **Şu an 404 veren yüksek trafikli blog sayfaları (D34): ertelendi.** Varsayılan blog kuralı (P7.4) onları da kapsar. Müşteri yeni blogda aynı slug'ı yayınlarsa aynı URL otomatik geri döner.

**Bitti sayılır:** P7.7 testi %100 geçer (beklenen 404/410'lar dışında hata yok); yönlendirme mekanizması dokümante.

---

### P8: Teknik SEO, AEO/GEO, analytics
**Ön okuma:** `generate-metadata.md`, `sitemap.md`, `robots.md`.

- [ ] P8.1 JSON-LD tamamlanır: `TravelAgency/Organization`, `WebSite`, `WebPage`, `CollectionPage + ItemList`, `TouristTrip + Offer`, `BreadcrumbList`, `Article/BlogPosting` (+ `Person` yazar), `AboutPage`, `ContactPage`. D16 kararına göre `FAQPage` ve `Review/AggregateRating`.
- [ ] P8.2 hreflang (HTML `alternates` + sitemap), `x-default`, locale başına sitemap + sitemap indeksi, gerçek `lastmod`. **Temel P2.18'de kuruldu; burada son hâli, indeks kararı ve CMS'ten gelen gerçek `lastmod` ile tamamlanır.**
- [ ] P8.3 `robots.txt`: AI tarayıcılar için karar (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), `llms.txt`. **Temel P2.19'da kuruldu.**
- [ ] P8.4 Başlık/açıklama şablonları, OG görselleri, canonical kontrolü, her sayfada tek H1.
- [ ] P8.5 **GA4 + GTM (D20), yayından önce zorunlu:** EN'de mevcut GA4 (`G-E8XLPNE302`) ve GTM (`GTM-55HWFMHR`) var. **Öneri:** EN geçmiş verisinin sürekliliği için aynı GTM kapsayıcısı ve GA4 mülkü yeni sitede de kullanılır, dil `content_group`/özel boyut olarak ayrılır; zh/jp için eski sitelerde zaten çalışan GA4 yok. Olaylar: `form_submit`, `whatsapp_click`, `phone_click`, `tour_view`, CTA tıklamaları. Consent Mode v2 ve çerez bildirimi (AB, Japonya, Tayvan ziyaretçileri). Önizlemede doğrulanır (GTM Preview, GA4 DebugView).
- [ ] P8.6 **Search Console, yayından önce hazır:** mevcut `https://www.magnificenttravel.com/` mülkü (URL öneki) aynı host altındaki `/en/`, `/zh/`, `/jp/` yollarını kapsar, geçişte devam eder. Ek olarak **Domain property** (DNS TXT doğrulaması, müşteri DNS'i yönettiği için yayından önce yapılabilir). Sitemap gönderimi yayın günü. Bing Webmaster ve IndexNow.
- [ ] P8.7 AEO içerik düzeni: soru-cevap blokları, kısa cevap öncelikli, kurum bilgisi (ad, adres, TÜRSAB lisans no 3217) tutarlı.
- [ ] P8.8 Schema ve metadata için otomatik test (JSON-LD ayrıştırma, hreflang karşılıklılığı).
- [ ] P8.9 **hreflang ayrıntıları:** bugün üç site arasında hiç hreflang yok (canlı EN sayfalar yalnızca `x-default` + `en` içeriyor). Yeni küme Google için yeni bir sinyal. Her dilin kendine ve karşılıklı bağı, `x-default` → `/en/`, canonical ile tutarlılık. Yayından sonra GSC'de hreflang hataları izlenir.
- [ ] P8.10 **Yerel SEO ve varlık tutarlılığı:** Google Business Profile (Sultanahmet ofisi), Tripadvisor, TÜRSAB kaydı; ad, adres, telefon üç dilde ve tüm kaynaklarda aynı. `TravelAgency` `sameAs` listesi güncel.
- [ ] P8.11 **GA4'te AI yönlendirme kanalı:** `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com` vb. kaynaklar için özel kanal grubu (AEO/GEO çalışmasının ölçümü).
- [ ] P8.12 Tek tutarlı `@id` JSON-LD grafiği: `Organization` aynı sayfada tekrarlanmaz (canlı sitede tekrarlanıyor, bkz. Ek I). İsteğe bağlı görsel sitemap.
- [ ] P8.13 **Kapı:** Ek H kabul listesinin tamamı T2/T4 testleriyle geçer.

**Bitti sayılır:** Rich Results Test ve schema doğrulayıcı örnek sayfalarda hatasız; hreflang karşılıklı; GA4/GTM olayları canlı önizlemede doğrulandı.

---

### P9: Performans, güvenlik, işletme
- [ ] P9.1 CWV bütçesi: LCP < 2,5 sn, CLS < 0,1, INP < 200 ms. Ölçüm Vercel önizlemesinde (lokal sonuçlar yanıltıcı), Lighthouse + PageSpeed + CrUX. Hero LCP, font ön yüklemesi, görsel `sizes`, JS bütçesi.
- [ ] P9.2 Güvenlik başlıkları: CSP (GTM ile uyumlu), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`; `poweredByHeader: false`; form hız sınırı ve bot koruması.
- [ ] P9.3 Form teslimi (D41): **Brevo ana, Resend yedek**, WhatsApp son yedek. İki sağlayıcıda alan adı doğrulaması (SPF/DKIM/DMARC; tek SPF kaydında birleştirilir, DNS arama sınırı 10 aşılmamalı), `api/inquiry` önce Brevo'yu dener, hata durumunda Resend'e düşer, tekrar gönderimde çift mail olmaması için tek istek kimliği kullanılır. **Bülten yok (kullanıcı kararı, 2026-10-14):** siteden bülten formu, API'deki `newsletter` türü ve gizlilik metnindeki bülten cümleleri kaldırıldı; bülten istenirse sonra ayrı bir iş olarak eklenir (Brevo listesi doğal seçim). **Alıcı adresler müşteriden alındı (3 adres, `data/client-inputs/`, ortam değişkenine yazılır, repoya girmez).** Gönderen adres `magnificenttravel.com` üzerinde doğrulanır (P9.12).
- [ ] P9.4 İzleme: uptime, Vercel uyarıları, hata izleme; "gece yarısı sorun çıkarsa" bildirim akışı (müşteriye 7/24 destek söz verildi).
- [ ] P9.5 Yedek: içerik (P6.7), kod (git), DNS kayıtlarının dışa aktarımı.
- [ ] P9.6 Erişilebilirlik (WCAG AA): kontrast, odak, klavye, `aria`.
- [ ] P9.7 Yasal: gizlilik ve çerez metinleri, zh/jp şartları (scrape), Türkçe mesafeli satış sözleşmesi korunur.
- [ ] P9.8 **CJK font stratejisi ve ölçümü** (Noto Sans/Serif TC ve JP büyük dosyalar): alt küme, `unicode-range` dilimleri, `preload` yalnızca gereken yerde, sistem fontu yedekleri. zh/jp sayfalarında ayrı Lighthouse ölçümü.
- [ ] P9.9 **Vercel Image Optimization kotası (D29):** 900+ kaynak görselin kotaya etkisi hesaplanır. Gerekirse Sanity CDN dönüşümüne veya önceden üretilmiş boyutlara geçilir.
- [ ] P9.10 Çerez bildirimi ve GTM yüklemesinin CLS/LCP'ye etkisi ölçülür (bildirim yerleşimi sayfayı kaydırmamalı).
- [ ] P9.11 **Kişisel veri:** KVKK aydınlatma metni (Türk şirketi, formlardan kişisel veri toplanıyor), AB için GDPR, Japonya APPI, Tayvan PDPA gereklilikleri hukuki incelemeye gönderilir. Gizlilik sayfası taslağı "hukuki inceleme gerektirir" notuyla müşteriye sunulur.

- [ ] P9.12 **E-posta ve DNS (D39, kritik, yayın günü sırası belirleyici):**
  - **Aşama 1 (yayın, seçenek A):** MX'i `mail.magnificenttravel.com`'a çevir (DNS only, Cloudflare proxy'siz), posta alma/gönderme testi yap, **sonra** `magnificenttravel.com` ve `www` web kayıtlarını Vercel'e taşı. Müşterinin posta istemcilerinde sunucu adı `magnificenttravel.com` ise `mail.magnificenttravel.com` olarak değiştirmesi gerekir (apex artık Vercel'e gidecek). SPF'de eski sunucu IP'leri kalır, Resend eklenir.
  - **Aşama 2 (eski sunucu kapanmadan, seçenek B):** hizmet seçimi (D39), kutuların kurulumu, istenirse mevcut e-postaların IMAP ile taşınması (erişim bilgisi bu aşamada gerekir), MX'in yeni hizmete çevrilmesi, SPF'den eski IP'lerin çıkarılması.
  - Envanter (Aşama 2 için): üç alan adındaki mevcut kutular (ad, ne için kullanılıyor), yeni sitede kullanılacak adresler.
  - Eski iki alan adındaki kutular (`@torukoryoko.com`, `@eztravelturkey.com`): kapatma, ana alan adına yönlendirme veya ilgili kişiye devir kararı müşteride; kapatmadan önce içerik yedeği.
  - **Tuzak:** `MX = alan adının kendisi` olduğu için apex A kaydını Vercel'e çevirmek **e-postayı anında bozar**. Yeni MX kayıtları web geçişinden **önce** yürürlüğe girer; MX hiçbir zaman apex A kaydına bağlı kalmaz.
  - SPF, DKIM, DMARC kayıtları (yeni e-posta hizmeti + Resend birlikte), eski sunucu IP'leri SPF'den çıkarılır.
  - Form gönderimi: `no-reply@` gibi bir gönderen adresi (Resend, alan adı doğrulamalı), alıcı adres(ler) müşteriden, yanıt adresi ziyaretçinin e-postası (P9.3 ile birleşir).
  - Teslim edilebilirlik testi (Gmail, Outlook, Yahoo): form e-postaları spam'e düşmemeli.
  - Eski iki alan adındaki e-posta adresleri: ana alan adına yönlendirme veya kapatma kararı (müşteri); kapatmadan önce içerik yedeği.
  - Panel (CMS) kullanıcıları: en az 3-4 kişi, her biri kendi e-postasıyla giriş yapar (Sanity Free'de hepsi Administrator, 20 koltuk).

**Bitti sayılır:** üç dilde örnek sayfalar CWV hedeflerini önizlemede geçiyor; güvenlik başlıkları aktif; form uçtan uca teslim ediliyor; e-posta kutuları yeni hizmette çalışıyor ve geçiş sırası yazılı; izleme ve yedek çalışıyor.

---

### P10: Yayın, geçiş ve yayın sonrası
- [ ] P10.1 Yayın öncesi kontrol listesi: tüm fazların "Bitti sayılır" kriterleri; **GSC (mülk + Domain property), GA4 ve GTM kurulu, önizlemede doğrulanmış ve yayın günü etkin** (kullanıcı kararı: bu üçü yayın şartı); içerik dondurma; **son scrape farkı** (yayın günü eski sitede değişen içerik var mı).
- [ ] P10.2 DNS geçişi (müşteri DNS'i yönetiyor; **önce e-posta (P9.12), sonra web**; MX apex'e bağlı bırakılmaz; `magnificenttravel.com` DNS'i Cloudflare'de, `www` kaydı şu an Cloudflare proxy'li: Vercel için proxy'siz (DNS only) tercih edilir, yayında gözden geçirilir; eski iki alan adı en az 12 ay Vercel'e yönlendirilir, D38): TTL düşür, alan adlarını Vercel projesine ekle, SSL, `www` politikası, sıra (D21). Eski sunucuya erişim kesildiğinde yönlendirmelerin çalıştığı doğrulanır.
- [ ] P10.3 Yayın günü: sitemap gönderimi, örnek URL denetimleri, canlı yönlendirme testi (P7.7 betiği canlı alan adlarına karşı), GA4 gerçek zamanlı, form testi.
- [ ] P10.4 İlk 30 ve 90 gün: GSC'de 404 ve kapsam izleme, EN sıralama karşılaştırması (baseline: `docs/baseline/gsc-en-baseline.md`; OpenSEO ile aynı sorgular yeniden çekilir), zh/jp için yeni property'den başlangıç ölçümü.
- [ ] P10.5 3 aylık SEO/AI arama programı başlangıcı (kapsam D24'e göre).
- [ ] P10.6 Devir: dokümantasyon, CMS eğitimi, bakım prosedürü.
- [ ] P10.7 **Geri dönüş planı:** geçişten önce DNS TTL düşürülür; eski hosting en az D32'de belirlenen gün sayısı açık kalır; geri alma kriterleri yazılı (örn. ilk 24 saatte kritik sayfalarda 5xx veya form teslim hatası); geri alma adımları denenmiş.
- [ ] P10.8 **Kaynak kod ve hesap devri:** sözleşmeye göre kaynak kod, bedel ödenince müşteriye GitHub üzerinden teslim edilir. Hesap sahipliği matrisi (D31) güncel ve imzalı.
- [ ] P10.9 `*.vercel.app` alias'ı ana alan adına yönleniyor veya `noindex` doğrulanır (P7.10); eski sitelerin kapatılma takvimi (yönlendirmeler doğrulandıktan sonra, D32).
- [ ] P10.10 **GBP ve Tripadvisor kayıtlarında web sitesi URL'si** yeni siteye güncellenir (yönetici erişimi gerekir, müşteri veya müşteri onayıyla). Eski URL'ye giden her kayıt bir yönlendirme zincirine neden olur, doğrudan yeni adres verilmeli. İlk hafta kontrol: kayıttaki bağlantılar ve NAP tutarlılığı.

**Bitti sayılır:** üç alan adı yeni siteye yönleniyor, yönlendirme testi canlıda geçti, 30. gün raporunda beklenmeyen 404 ve kapsam kaybı yok.

---

## 4.1 Çapraz iş akışları

### İş akışı S: İçerik ve on-page SEO

**Amaç:** Eski sitenin SEO sinyallerini koruyarak, siteyi içerik ve sayfa içi yapı olarak güçlendirmek; her sayfanın tek bir arama niyetine hizmet etmesi ve AI aramalarında alıntılanabilir olması.
**Kapsam kuralı (ilke 13):** turlar aynen; optimizasyon çevresine yapı ekleyerek yapılır. Ülke, kategori, kombo, About, Travel Hub, SSS ve blog içeriği güçlendirilebilir.
**Kanıt:** Ek I'deki denetim bulguları bu iş akışının başlangıç noktasıdır.

**S1 Araştırma ve veri** (P0-P1; D30'a bağlı)
- [ ] S1.1 İçerik envanteri: P1.11 CSV'sinden ince içerik, kopya başlık/meta, yetim sayfa, başlık hiyerarşisi sorunları, görsel alt eksikleri listelenir.
- [ ] S1.2 **GSC analizi (EN):** sayfa × sorgu matrisi; tıklama alan ilk 100 sayfa; pozisyon 4-15 arası "fırsat" sayfaları; CTR'ı beklentinin altında kalan sayfalar; cihaz kırılımı (mobil payı) ve ülke kırılımı (hedef pazarlar); backlink alan 404'ler.
- [ ] S1.3 **Anahtar kelime araştırması dil başına** (EN, zh-Hant Tayvan/Hong Kong, JA): çeviri değil yerel arama dili. Niyet sınıflandırması (bilgi, karşılaştırma, ticari, işlem). **Listeyi ekip çıkarır, müşteri onaylar ve ekler** (müşteri uzmanlığa güvendiğini söyledi): EN için GSC sorguları + OpenSEO anahtar kelime verisi; zh/jp için OpenSEO (konum ve dil desteği doğrulanınca) + SERP incelemesi + ana dili konuşan biriyle gözden geçirme. Eski bloglardan gelen aramalar müşterinin hedefi değil (müşteri belirtti), analizde ayrı tutulur. Müşteriden yalnızca iş önceliği (hangi ürün/pazar öne çıkacak) ve marka terimleri alınır.
- [ ] S1.4 **SERP ve rakip analizi:** her sorgu kümesi için ilk 10 sonucun sayfa türü (tur sayfası mı, kategori mi, blog mu: sayfa türü uyumsuzluğu tespiti), rakiplerin içerik yapısı, SERP özellikleri (AI Overviews, People Also Ask). **Rakipler SERP'ten tespit edilir** (pazar başına), müşteri kendi bildiklerini ekler.
- [ ] S1.5 **AI arama görünürlüğü başlangıcı:** marka sorguları ve 20-30 hedef soru için ChatGPT, Perplexity, Gemini ve Google AI Overviews'ta kimin hangi sayfayla alıntılandığı kayıt altına alınır. Aynı sorular yayından sonra tekrarlanır.
- [x] S1.0 İlk GSC çekimi yapıldı (`docs/baseline/gsc-en-baseline.md`): trafik %99'a yakın blogdan, ticari sayfalar görünmez, 26 yüksek trafikli sayfa 404. Bulgular D34-D36 ve P3.19-P3.20, P7.13-P7.14 görevlerine yansıdı.
- [~] S1.7 **(ertelendi: blogu müşteri yönetiyor, D12)** **Blog sınıflandırması:** 520 yazı trafik ve niyete göre dört gruba ayrılır: (A) "Map of X" (5, aynen korunur), (B) planlama/kombo niyetli ("can I do Turkey and Greece", "how many days", "ferry from Greece to Egypt", itinerary): önce yenile ve ticari sayfalara bağla, (C) yüksek trafikli ama ticari değeri belirsiz (Paskalya, Ramazan, saat, para birimi, hava durumu): GA4 verisiyle karar, (D) düşük trafikli şablon içerik: yeniden yazım veya kategoriye 301. Müşteriye sunulur (D36).
- [ ] S1.6 Yerel SEO ve varlık denetimi: Google Business Profile, Tripadvisor, TÜRSAB kaydı, ad/adres/telefon tutarlılığı. **Herkese açık veriyle yapılır** (OpenSEO GBP denetimi, listeleme sayfaları); yönetici erişimi gerekmez.

**S2 Strateji** (P3; çıktılar `docs/seo/` altında belge)
- [ ] S2.1 **Anahtar kelime → URL haritası (dil başına):** her birincil niyet tek bir URL'ye atanır; yutma (cannibalization) kontrolü. Yeni açılış sayfalarımızın (`/tours/`, `/private-tours/`, `/small-group-tours/`, `/multi-country-tours/`) hedef niyeti mevcut ülke ve kategori sayfalarından ayrılır, ayrılamıyorsa canonical veya birleştirme.
- [ ] S2.2 **Sayfa türü şablonları:** title, meta, H1, H2 iskeleti, zorunlu bloklar, uzunluk aralıkları ve örnekler, dil başına. İlke: birincil anahtar kelime + süre/ülke + ayırt edici özellik + marka; benzersiz; CJK için ayrı uzunluk ölçüsü.
- [ ] S2.3 **İç link mimarisi:** hub-and-spoke (ülke → kategori → tur → ilgili turlar; blog → tur ve kategori; tur → ilgili rehber yazıları), breadcrumb, anchor metni kuralları, yetim sayfa yok, hub'dan derinlik ≤ 3 tık, doğrudan nihai URL'ye link (yönlendirmeli iç link yok).
- [ ] S2.4 **E-E-A-T planı:** gerçek yazar profilleri (canlı sitede `/en/authors/` var), TÜRSAB lisans no ve doğrulama bağlantısı, ekip sayfası, yerel rehber kimlikleri, gerçek seyahat fotoğrafları ve yolcu yorumları, "kim hazırladı / son güncelleme" bilgisi, kısa editoryal politika sayfası.
- [ ] S2.5 **AEO/GEO içerik kalıpları:** ilk paragrafta doğrudan cevap (40-60 kelime), "Key facts" tablosu (süre, fiyat, sezon, dahil olanlar), gerçek müşteri sorularından SSS blokları, kombo karşılaştırma tabloları, rakam ve özgün veri (35.000+ yolcu, 1997'den beri), tarih ve kaynak, her bölümün kendi başına anlaşılması (parça düzeyinde alıntılanabilirlik).
- [ ] S2.6 **Blog stratejisi (kapsam daraldı, D12: yazıları müşteri girer; biz yalnızca yazı şablonu, brief şablonu ve veri raporu veririz):** eski blogun 520 yazısının yaklaşık yarısının (≈250) slug'ı ay/hava/en iyi zaman kalıbında ve "a-comprehensive-guide" ekli, yani şablon içerik riski taşıyor (Ek I). Yeni 40-50 yazı için küme planı (ülke × karar konusu: ne zaman gidilir, kaç gün, nasıl gidilir, bütçe, vize, yemek), her yazı için brief şablonu (hedef sorgu, niyet, başlık iskeleti, SSS, iç linkler, ilgili turlar), yayın takvimi, güncelleme periyodu. 20-25 trafikli eski yazı için "yenile ve aynı konuya 301" kuralı.
- [ ] S2.7 **Çok dilli içerik kuralı:** çeviri değil yerelleştirme; zh/jp'de mevcut içerik korunur; yeni içerik yerel yazar veya çevirmen + ana dili konuşan editör; terim sözlüğü; para birimi (D28).

**S3 Uygulama** (fazlara bağlı)
- [ ] S3.1 (P3) Şablonlar koda uygulanır: tek H1, başlık hiyerarşisi, özet kutusu, SSS, ilgili içerik, breadcrumb.
- [ ] S3.2 (P3, P6) Ülke, kategori, kombo, About ve Travel Hub içeriklerinin güçlendirilmesi: brief → yazım → editör → yayın. Canlı sayfada sıralama alan başlık ve H2'ler korunur (D23 sonrası).
- [ ] S3.3 (P6) CMS SEO alanları (P6.11).
- [ ] S3.4 (P5, P6) zh/jp içerik QA'sı (ana dili konuşan biri).
- [ ] S3.5 (P8) Schema ve varlık tutarlılığı.

**S4 Yayın sonrası** (P10)
- [ ] S4.1 30/60/90. gün: GSC'de CTR ve pozisyon; "fırsat" sayfalarında başlık/meta denemeleri (kayıtlı, tek seferde bir değişiklik); yeni blog takvimi; içerik yenileme döngüsü; AI görünürlük ölçümünün tekrarı; kanibalizasyon kontrolü; iç link güncellemesi.
- [ ] S4.2 Aylık rapor şablonu (trafik, sıralama, AI alıntıları, 404'ler, CWV).

### İş akışı T: Test ve otomasyon

Amaç: Ek H kabul listesini elle değil otomatik doğrulamak ve gerilemeyi (regression) yakalamak.
- [ ] T1 (P2.17) CI: `lint`, `tsc`, `build`.
- [ ] T2 **SEO build testleri** (derlenmiş HTML üzerinde): her sayfada tek H1; başlık/meta uzunluğu ve benzersizliği; canonical mutlak ve kendine; eğik çizgi tutarlılığı; `lang` doğruluğu; hreflang karşılıklılığı ve canonical ile tutarlılığı; JSON-LD ayrıştırma ve zorunlu alanlar; sitemap'teki her URL 200 ve indexlenebilir; `noindex` kuralları; kırık iç link 0; görsel alt ve boyut.
- [ ] T3 Yönlendirme testi (P7.7) CI'da çalışır.
- [ ] T4 **Lighthouse CI** bütçesi: mobil, ana şablonlar × 3 dil; LCP/CLS/INP eşiği aşılırsa uyarı.
- [ ] T5 **E2E (Playwright):** teklif formu gönderimi, dil değiştirici, tur sekmeleri/akordeon, WhatsApp bağlantısı, arama.
- [ ] T6 İçerik bütünlüğü: scrape → CMS aktarımında sayım ve alan eşitliği (P6.8).
- [ ] T7 **SEO drift:** P1.11 baseline'ı ile yayın sonrası fark raporu (başlık, H1, meta, canonical, schema).
- [ ] T8 Haftalık üretim izleme: GSC kapsam ve 404 raporu, uptime, CWV.

---

## 5. Ekler

### Ek A. Eski site envanteri (2026-10-06, sitemap ve örnek sayfalar)

**A.1 Sayılar**
| Site | Sitemap URL | Not |
|---|---|---|
| magnificenttravel.com/en | 685 | 527 blog (6 kategori + 520 yazı), 153 destinations, 5 statik. Kök `/` → `/en/` 301. |
| eztravelturkey.com | **462** (2026-10-12; 7 Ekim'de 793) | Müşteri tur sildi: 331 URL kalktı. `/zh/` (Geleneksel, `zh-TW`) ve `/cn/` (Basitleştirilmiş, `zh-CN`). Kök `/` 200 |
| torukoryoko.com | **275** (2026-10-12; 7 Ekim'de 441) | Müşteri tur sildi: 166 URL kalktı. `/jp/` altında, Japonca slug'lar. Kök `/` 200 |

Örnek 40 EN sitemap URL'sinin tamamı 200 verdi; GSC'deki 404'ler sitemap dışı URL'lerden geliyor.

**A.2 EN destinations ağacı**
- Ülkeler: `turkey-tours`, `greece-tours`, `egypt-tours`, `jordan-tours`, `morocco-tours`, `israel-tours` (taşınmayacak).
- Kombolar: `turkey-greece-tours`, `turkey-greece-and-egypt-tours`, `turkey-and-egypt-tours`, `turkey-and-jordan-tours`, `greece-and-egypt-tours`, `greece-and-jordan-tours`, `egypt-jordan-and-israel-tours` (taşınmayacak). Her kombonun altında kendi turları var.
- Kategoriler: Türkiye (`03-to-05-days-tours`, `06-to-09-days-tours`, `10-to-14-days-tours`, `15-days-and-longer`, `istanbul-travel-packages`, `adventure-activities`), Yunanistan (`greece-travel-packages`, `greece-cruise-packages`, `day-tours-in-greece`, `greece-escorted-tours`). Mısır, Ürdün ve Fas'ta kategori yok, turlar doğrudan ülke altında. **Fas'ın canlıda ~11 sabit turu var.**
- Blog: `/en/blog/<ülke>/<yazı>/` (6 kategori), yazar sayfası `/en/authors/<ad>/`.
- Diğer: `/en/about/`, `/en/faq/`, `/en/contact/`, `/en/search/`, `/en/videos/`, `/en/gdpr/privacy-policy`, `/en/gdpr/terms-conditions`, `/en/gdpr/mesafeli-satis-sozlesmesi`.
- Müşteri tur sayısı: EN ≈ 125, ZH ≈ 85, JA ≈ 85.

**A.3 Dillere göre farklı yapı**
- **ZH** (`/zh/destinations/…`): Türkiye kategorileri `02-to-05-days-tours`, `06-to-09-days-tours`, `10-days-or-more`, `guaranteed-departure-turkey-group-tours`, `budget-tours`, `istanbul-tours`, `daily-tours`, `optional-tours`; Yunanistan turları doğrudan ülke altında; ayrı `combination-tours`, `turkey-and-greece-tours`, `turkey-and-greece-cruise` bölümleri.
- **JA** (`/jp/目的地/…`): Türkiye, Yunanistan, Mısır, Fas, Ürdün, `コンビネーションツアー` (kombo); klasör adları ve tur başlıkları Japonca, tur kodları `T-xx`.
- **Alt-URL'ler (yalnızca zh/jp):** her tur birden fazla URL'ye bölünmüş: `inclusion-rate` (87 zh / 103 jp), `review` + `reviews` (92 zh / 102 jp), `tour-itinerary` (35 zh / 87 jp), `itinerary` (16 jp). Hepsi ana tur sayfasına birleşir (P5.2) ve 301 alır (P7.5). EN'de alt-URL yok.

**A.4 Canlı EN tur sayfası (örnek: 8-Day Turkey Express)**
- Sunucu tarafında render edilmiş HTML; scrape için tarayıcı gerekmiyor (JS ile yüklenen alan görülmedi, P1'de doğrulanır).
- JSON-LD: `TouristTrip`, `Product` + `AggregateRating`, `Offer`, `TouristAttraction`, `Organization` vb.
- Görseller `/public/thumbs/<WxH>-<mod>-<ad>.jpg`: galeri 950x700 (`thumbnail`), **rota haritası 800x600 (`bestFit`)**, kart 648x425.
- Teklif formu alanları: adults, children, agesofchildren, arrivaldate, departuredate, budget, hotels, nationality, currency, countrycode, phone, notes, reCAPTCHA.

**A.5 DNS ve e-posta durumu (2026-10-08, RDAP/DNS sorguları 2026-10-12)**
- Üç alan adı **Turkticaret.net**'te kayıtlı; bitiş tarihleri: `magnificenttravel.com` 2031-08-10, `torukoryoko.com` 2031-09-30, `eztravelturkey.com` 2031-03-18. `magnificenttravel.com` ad sunucuları 2026-06-08'de Cloudflare'e alınmış; diğer ikisinin ad sunucuları `netportbilisim.com` (2024-11-05'ten beri). Cloudflare ve Turkticaret hesaplarının sahibi doğrulanmadı.
- Üç alan adının MX kaydı alan adının kendisi: e-posta, web sitelerinin durduğu aynı eski sunucuda (`31.210.57.126`, `.122`; SPF bu IP'leri yetkilendiriyor).
- `magnificenttravel.com` ad sunucuları Cloudflare (`jacob`/`aurora`); `torukoryoko.com` ve `eztravelturkey.com` ad sunucuları `ns11/ns12.netportbilisim.com`. Bu iki alan adının DNS'ini kimin yönettiği doğrulanmadı.

**A.5b Analytics durumu**
- EN: GA4 `G-E8XLPNE302`, GTM `GTM-55HWFMHR`.
- ZH: yalnızca `UA-` (Universal Analytics kapandı, veri toplamıyor). JA: hiçbiri.
- GSC: yalnızca magnificenttravel.com için erişimimiz var. torukoryoko.com aynı doğrulama koduna sahip (muhtemelen aynı hesap), eztravelturkey.com farklı hesapta. Müşteri DNS'i yönettiği için eski alan adlarını kendi hesabıyla doğrulayabilir (isteğe bağlı, geçmiş veri garanti değil).

### Ek B. URL haritası (sayfa türü → yol)

`{L}` = `en` | `zh` | `jp`. EN yolları canlıyla birebir aynıdır. ZH ve JP yolları kendi eski yapılarını izler (kategori adları ve slug'lar dile özel, CMS'ten gelir).

| Sayfa | Yol | Not |
|---|---|---|
| Ana sayfa | `/{L}/` | `/` → `/en/` 301 |
| Destinations hub | `/{L}/destinations/` (jp: `/jp/目的地/`) | ülkeler + kombolar |
| Ülke | `/{L}/destinations/<ülke>-tours/` | |
| Kategori | `/{L}/destinations/<ülke>-tours/<kategori>/` | yalnızca kategorisi olan ülkelerde |
| Tur | `/{L}/destinations/<ülke>-tours/[<kategori>/]<tur>/` | derinlik değişken |
| Kombo | `/{L}/destinations/<kombo>-tours/` | altında turlar |
| Blog hub (Travel Hub) | `/{L}/blog/` | D14 |
| Blog kategori | `/{L}/blog/<ülke>/` | |
| Blog yazısı | `/{L}/blog/<ülke>/<yazı>/` | 5 "Map of X" aynen |
| Yazar | `/{L}/authors/<ad>/` | |
| Statik | `/{L}/about/`, `/faq/`, `/contact/`, `/search/` | zh/jp'de kendi eski adları (`about-us`, `会社概要` vb.) |
| Hukuki | `/{L}/gdpr/privacy-policy`, `/terms-conditions`, `/mesafeli-satis-sozlesmesi` (yalnızca EN/TR bağlamı) | |
| Yeni açılış sayfaları (D15) | `/{L}/tours/`, `/private-tours/`, `/small-group-tours/`, `/plan-my-trip/`, `/multi-country-tours/` | canlıda yok |

### Ek C. Tur veri modeli taslağı (P1 sonrası, P4 onayıyla kilitlenir)

Müşterinin şartnamesindeki alanlar (Ek D.2) + eski sitede çıkarılabilen alanlar.

- **Kimlik:** `locale`, `slug` (dile özel), `path` (kategori + slug), `translationGroup`, `oldUrl`, `status`, `tourCode`
- **Sınıflandırma:** `destinations[]`, `category`, `comboRef`, `styles[]` (private / small group), `tags[]`
- **Özet:** `title`, `subtitle`, `nights`, `days`, `groupSize {min,max}`, `difficulty`, `guideLanguages[]`, `summary`, `overview`, `highlights[]`, `route[]`
- **Fiyat ve uygunluk:** `price {eur?, usd?, basis}` (ikisi de **isteğe bağlı**, müşteri CMS'te girer; eski sitelerde yalnızca EUR var, zh/jp'de çoğu turda hiç yok), `seasons[] {name, dates, priceNote}`, `departureOptions[]` (günlük / sabit tarih / notlar)
- **Program:** `itinerary[] {dayLabel, title, text, meals, overnightCity, hotelName?}`
- **Konaklama ve ulaşım:** `hotels[] {city, nights, name?, class}`, `flights`, `ferries`, `transfers`, `baggage`
- **Listeler:** `included[]`, `excluded[]`, `requirements[]` (pasaport, sigorta, yürüyüş seviyesi)
- **Medya:** `heroImage`, `gallery[]`, `routeMap` (görsel + alt metin)
- **Güven ve SEO:** `faqs[]`, `reviews[]` (kaynak, tarih), `relatedTours[]`, `seo {title, description, canonical, ogImage}`
- **Politika:** iptal ve ödeme tabloları site ayarlarından referansla

Diğer tipler: kategori, ülke, kombo (giriş metni, eşleşme, lojistik, mevsim, SSS), blog yazısı (kısa cevap, gövde, kaynaklar, yazar, yayın/güncelleme tarihi, ilgili turlar), yazar, SSS, yorum, site ayarları, statik sayfa.

### Ek D. Müşteri şartnamesi (özet)

**D.1 SAYFA YAPISI (schema türleri dahil)**
| Sayfa | İçerik | Schema |
|---|---|---|
| Ana sayfa | Kısa değer önerisi, güven satırı, ülke ve çok ülkeli tur kartları, açık CTA | WebSite + TravelAgency/Organization + WebPage |
| Ülke / kombinasyon | Kısa özet, tur filtreleri ve liste, ulaşım ve mevsim bilgisi, ilgili bloglar | CollectionPage + ItemList + BreadcrumbList |
| Tekil tur | Tour facts, rota haritası, günlük program, oteller, dahil/hariç, fiyat dayanağı, bagaj, iptal, gerçek değerlendirmeler, teklif formu | TouristTrip + uygun Offer + WebPage + BreadcrumbList |
| Travel Hub | Ülke ve karar konularına göre içerik kümeleri, ürünlere bağlanan rehberler | Blog / CollectionPage |
| Blog yazısı | Önce kısa cevap, kaynaklar, yazar profili, gerçek güncelleme tarihi, ilgili tur bağlantıları | Article / BlogPosting + BreadcrumbList |
| About / Contact | Resmi işletme adı, lisans doğrulama bağlantısı, ekip, adres, çalışma saatleri, destek kanalı | AboutPage / ContactPage + doğru kurum kimliği |

**D.2 Tur sayfası blokları** ("Tour Page Structure"): Trip Overview (rota, süre, grup büyüklüğü, tur tarzı), Day-by-Day Itinerary (oteller, öğünler, gezilecekler, ulaşım), Price & Availability (başlangıç fiyatı, sezonlar, kalkış seçenekleri); bloklar: Highlights & Route, What's Included, What's Not Included, Hotels & Meals, Flights/Ferries & Transfers, Gallery & Map, FAQ & Important Notes, Enquiry / Customize This Tour. Taahhüt: ekip tur, fiyat, program, otel, görsel ve kalkış bilgisini geliştirici desteği olmadan güncelleyebilir.

**D.3 Hiyerarşi** ("Tour & Destination Structure"): Destinasyonlar → Kombo turlar → Tekil turlar (süreye göre 3-5, 6-9, 10+ gün). Tur kaydı alanları: program, süre ve grup büyüklüğü, fiyat ve sezon, dahil/hariç, destinasyon etiketleri, galeri ve harita, ilgili turlar, teklif CTA'sı. (Görselde Israel var, müşteri sonradan çıkardı: D4 geçerli.)

**D.4 Diğer talepler (sohbetten)**
- Teklif formunda telefon/WhatsApp alanı (e-posta sonrası WhatsApp'tan da yazıyorlar).
- Ana sayfa metni: "TURKEY, GREECE, EGYPT, JORDAN & MOROCCO / Private, Small Group & Multi-Country Tours / Discover five remarkable destinations…" (uygulandı).
- Tur sayfasına Route Map, Payment Summary, Trip Cancellation Terms (uygulandı), masaüstünde sekmeli yapı (uygulandı, mobilde akordeon).
- Kombo turlar öne çıkarılsın.
- Mimari/şemasal SEO + AI uyumu her sayfada.
- Hosting ve sürekli teknik destek 7/24.

### Ek E. Müşteriden beklenenler (takip listesi)
- [x] Silinecek tur listesi: müşteri turları eski sitelerden kendisi sildi (2026-10-12), envanter farkıyla yeniden tarandı (P7.3)
- [x] Blog yönlendirmesi: müşteri yeni yazıda "eski URL" alanını kendisi dolduracak (D36: B)
- [ ] `/cn/` kararı onayı (D10)
- [ ] Tur dil eşleşmeleri doğrulaması (P5.4)
- [x] Form alıcı e-posta adresleri (3 adres alındı, 2026-10-12)
- [ ] Tur görselleri: önce canlı sitedeki orijinaller (scrape); kalite yetersiz kalan turlar için orijinal dosyalar veya Depositphotos erişimi (yalnızca gerekirse)
- [x] Tur başı yorum kaynağı: Tripadvisor (D22)
- [ ] 5 Ekim H1/H2 başlık örnekleri ve 3 Ekim tur sayfası bölümleri dosyası (bizde yok)
- [x] Ekip bloğu içeriği ve çalışma saatleri (2026-10-12, teyit: fotoğraf sahipleri ve saat dilimi, P3.9)
- [ ] zh/jp arayüz ve yeni içerik çevirisi sorumlusu
- [ ] GSC: iki eski alan adı için erişim veya müşterinin kendi doğrulaması (isteğe bağlı)
- [ ] Japonya/Tayvan için ek iletişim kanalı (LINE vb.) kullanılacak mı?
- [ ] Sözleşme kapsamı: 3 aylık SEO programı hangi dilleri kapsıyor (D24)
- [ ] **Müşteriye onaylatılacak:** ekibin hazırlayacağı hedef anahtar kelime ve rakip önerisi (dil başına). Müşteriden sıfırdan liste istenmez (S1.3, S1.4). Yalnızca iş önceliği ve marka terimleri sorulur.
- [~] Para birimi: müşteri USD ve EUR seçenekleri istedi (D28); mekanizma müşteriye teyit edilecek (D40: düğme mi, kur nasıl)
- [ ] Hesap sahipliği ve yönetici kişiler (D31): Vercel, Sanity, GitHub, GA4/GTM, GSC, DNS
- [ ] Eski hosting'in geçişten sonra ne kadar açık kalacağı ve eski ajansla sözleşme durumu (D32)
- [ ] **E-posta (D39, güncellendi):** yayın için karar: kutular şimdilik eski sunucuda kalsın mı (A), yoksa yeni hizmete mi geçilsin (B)? Eski sunucuyu ne zaman kapatmayı düşünüyorlar? Yeni adresler (müşterinin "≥ 5 adres" şartı: hangi adresler, ne için). Eski e-posta geçmişini korumak isterlerse (yalnızca B'de) kutu erişim bilgileri.
- [ ] **Hesap sahipliği (DNS):** `magnificenttravel.com` DNS'i Cloudflare hesabında, üç alan adının kaydı Turkticaret.net hesabında. Bu iki hesap kimin (müşteri mi, eski ajans mı)? Yayın günü için ikisine de bize davet/yetki veya müşterinin kendi yapması
- [ ] **Alan adları (D38):** `torukoryoko.com` ve `eztravelturkey.com` en az 12 ay kayıtlı kalacak ve yönlendirme için kullanılacak mı; kayıt şirketi ve DNS yönetimi kimde
- [x] **Panel kullanıcıları:** 3 kişi (Meifen, Kenan, ortak hesap) alındı, e-postalar `data/client-inputs/` altında (2026-10-12)
- [~] GSC "Not found (404)" dışa aktarımı: P7'de (blog dışı 404'ler için). Silinmiş blog sayfaları ertelendi (D34).
- [ ] GA4/GTM kapsayıcısının içeriği ve veri toplayıp toplamadığı (P0.5d): müşterinin verdiği Analytics erişimiyle bakılır
- [ ] Tripadvisor ve Google Business Profile **yönetici erişimi: yayın zamanı gerekir** (P10.10: web sitesi URL'sini yeni siteye güncellemek için). Denetim için şart değil, GBP "Performance" (arama, arama, yol tarifi) verisi başlangıç ölçümü için isteğe bağlı.
- [x] Gerçek tur yorumları: Tripadvisor (D22, P3.17)

**Bizim tarafta (ekip) araç ve veri erişimi (D30):**
- [x] **OpenSEO girişi (D30):** tamam (2026-10-07), GSC mülkü bağlı. GSC verisi OpenSEO üzerinden çekilir.
- [ ] OpenSEO'nun zh-Hant (Tayvan/Hong Kong) ve ja (Japonya) için anahtar kelime/SERP desteği doğrulanır. Desteklemiyorsa bu iki dil için araştırma elle ve yaklaşık yapılır, kapsam daralır (ek araç değerlendirilir).

### Ek F. Risk kaydı
| Risk | Etki | Önlem |
|---|---|---|
| Eski site scrape'i engeller (Cloudflare, eski ajans) | Veri alınamaz | Düşük hız, erken başla, ham HTML'i arşivle, gerekirse tarayıcı tabanlı çekim |
| zh/jp'de GSC verisi yok | Hangi sayfanın trafik aldığı bilinmez | "Her URL'nin akıbeti olur" kuralı, yeni property ile yayın günü ölçüm |
| Yönlendirme sayısı 1.024 sınırını aşar | Dağıtım hatası | P7.6 spike, `proxy.ts` + arama tablosu |
| Scrape'ten gelen görseller küçük | Düşük kalite | P1.6 orijinal arama, müşteriden arşiv |
| Dil eşleşmeleri hatalı | Yanlış hreflang | Müşteri doğrulaması, eşleşmeyene hreflang yok |
| Önizlemede 6 yerine 125 tur: veri modeli sonradan değişir | Yeniden iş | P4 onay kapısı, şema P1'de gerçek veriden türetilir |
| Hayalet URL'ler yönlendirilir ve soft 404 olur | Tarama bütçesi kaybı | P7.2 sınıflandırma, toplu yönlendirme yasak |
| Sanity ücretsiz plan limiti (özellikle 2.000 attribute) | Düzenleme/derleme bloke olur (canlı site çalışır) | P6.15: doküman düzeyinde çeviri, sınırlı Portable Text, attribute sayım betiği (tavan 1.400), kullanım izleme |
| Free planda yalnızca Administrator/Viewer rolü | Her editör yönetici yetkisine sahip | Yönetici sayısını sınırla, gece yedeği, müşteriyi bilgilendir |
| Müşteri istekleri kapsamı kaydırır | Takvim | §7 backlog, faz kapısı kuralı |
| Performans hedefi (LCP) tutmaz | Brif ihlali | P9.1, önizlemede gerçek ölçüm, hero ve font optimizasyonu |
| `magnificenttravel.vercel.app` şu an indexlenebilir | Mock Google'a girerse canlıyla kopya içerik | Risk bilinçli kabul edildi (D33): adres özel; yayında P7.10 ile 301 |
| WAF/bot koruması scraper'ı engeller (403 görüldü) | Veri alınamaz, sorun geç fark edilir | P1.12, erken ve yavaş tarama, Playwright yedeği |
| zh/jp sayfa kodlaması (ISO-8859-9 bildirimi) | Bozuk CJK metin | P1.12, sayfa başına kodlama tespiti, aktarım sonrası örnekleme |
| Israel URL'leri (≈73 URL) yanlış ele alınır | Soft-404, tarama bütçesi kaybı | P7.9, D27 |
| Eski blogun yarısı şablon içerik | Taşınırsa kalite sinyali düşer | S2.6: taşıma yok, yeniden yazım, 20-25 yazı için 301 |
| 3 H1 ve bozuk meta'lar eski sitede var | Yeni sitede aynı hatalar kopyalanır | P4.5 parite raporu, T2 testleri |
| Vercel plan/kota (görsel optimizasyonu, ticari kullanım) | Beklenmedik maliyet veya kısıt | D29, P9.9, Sanity CDN alternatifi |
| Kişisel veri ve çerez mevzuatı (KVKK, GDPR, APPI, PDPA) | Hukuki risk | P9.11, hukuki inceleme |
| Geri dönüş planı yok, eski hosting kapanır | Sorun olursa dönüş yok | P10.7, D32 |
| Teslim tarihleri ve sorumlular belgede yok | Takvim ve sorumluluk belirsiz | P0.8 |
| E-posta kutuları web sitelerinin eski sunucusunda, MX apex'e bağlı | Web DNS'i değişince veya sunucu kapanınca e-posta anında kesilir | D39, P9.12: önce yeni e-posta hizmeti ve MX, sonra web geçişi |
| Müşteri eski iki alan adını kapatmayı planlıyor | ≈ 1.200 eski URL'nin yönlendirmesi çalışmaz, zh/jp sıralaması ve linkleri kaybolur | D38: alan adlarını ≥ 12 ay yenile ve yönlendir, yalnızca e-postayı kapat |
| Bu iki alan adının DNS'i `netportbilisim.com` ad sunucularında (muhtemelen eski ajans) | Yönlendirmeleri kuramayız, e-posta/DNS kontrolü bizde değil | Kayıt şirketi ve DNS erişimini müşteriden iste, DNS'i Cloudflare'e al |

### Ek G. Sık başvurulan Next.js 16.3 dokümanları (`node_modules/next/dist/docs/01-app/`)
- `02-guides/internationalization.md` (`[lang]`, `proxy`, `next/root-params`)
- `02-guides/redirecting.md` (yönlendirme sınırı ve ölçekli yönetim)
- `03-api-reference/03-file-conventions/proxy.md`
- `03-api-reference/04-functions/` → `next-root-params.md`, `generate-static-params.md`, `generate-metadata.md`, `generate-sitemaps.md`
- `03-api-reference/05-config/01-next-config-js/` → `trailingSlash.md`, `redirects.md`
- `03-api-reference/03-file-conventions/01-metadata/` → `sitemap.md`, `robots.md`

### Ek H. Teknik SEO kabul listesi ("kusursuz" tanımı)

Yayına çıkış ve her faz kapısı bu listeye bağlıdır. Çoğu madde İş akışı T testleriyle otomatik doğrulanır. Ölçüm 3 dil × ana sayfa türleri için yapılır.

**H.1 Tarama ve dizine ekleme**
- [ ] Tek tercih edilen host (`https://www.magnificenttravel.com`). `http`, `*.vercel.app` ve eski alan adı varyantları tek adımda 301 alır, yönlendirme zinciri ≤ 1, döngü yok.
- [ ] Trailing slash tutarlı (`trailingSlash: true`). Canonical mutlak URL, kendine, eğik çizgiyle.
- [ ] XML sitemap yalnızca 200, indexlenebilir ve canonical URL içerir; dil başına ayrı, indeks dosyası, sınırlar içinde (≤ 50.000 URL, ≤ 50 MB), gerçek `lastmod`. `robots.txt` sitemap'leri gösterir.
- [ ] `robots.txt` CSS/JS/görselleri engellemez; `/api/` engelli; AI botları için karar (P8.3) yazılı ve test edilmiş.
- [ ] `noindex` yalnızca: site içi arama sonuçları, teşekkür sayfaları, önizleme ortamları. Başka hiçbir indexlenebilir sayfada `noindex` yok.
- [ ] Durum kodu politikası: 200 / 301 / 404 / 410. Soft-404 yok, özel 404/410 sayfaları doğru kod döner, boş kategori sayfası yok.
- [ ] Sayfalama: her sayfa kendi canonical'ında; filtre ve parametre URL'leri canonical'ı ana listeye verir veya `noindex`; parametreli URL'ler sitemap dışı.
- [ ] Yetim sayfa yok: her indexlenebilir sayfaya en az bir iç link; hub'dan derinlik ≤ 3 tık.

**H.2 Render ve HTML**
- [ ] Birincil içerik ve tüm iç linkler JS çalışmadan ilk HTML'de; bağlantılar `<a href>`; sekme ve akordeon içeriği DOM'da.
- [ ] Sayfada **tek `<h1>`**; başlık hiyerarşisi atlamasız; `<main>`, `<nav>`, `<header>`, `<footer>` landmark'ları.
- [ ] `lang` doğru (`en`, `zh-Hant`, `ja`); karakter kodlaması UTF-8; metin sıkıştırma (br/gzip).

**H.3 Metadata**
- [ ] Başlık ve meta açıklama her sayfada **benzersiz**; Latin dillerde başlık ≤ 60, açıklama 120-160 karakter (CJK için ayrı ölçü, S2.2). Boş, çok kısa (< 70) veya çok uzun (> 160) meta yok.
- [ ] OG ve Twitter kartları dil başına doğru; paylaşım görseli var.

**H.4 Çok dillilik**
- [ ] hreflang kendine ve **karşılıklı**; canonical ile tutarlı; `x-default`; yalnızca gerçek karşılığı olan sayfalarda; dil değiştirici tarayıcıların izleyebileceği `<a>` bağlantılarıyla. Dil bazlı otomatik yönlendirme botları ve kullanıcıyı sayfadan koparmaz.

**H.5 Yapılandırılmış veri**
- [ ] Her sayfa türü Ek D.1'deki türleri taşır (+ D16 kararı). JSON-LD geçerli (Rich Results Test / Schema validator), tek tutarlı `@id` grafiği, aynı varlık sayfada tekrarlanmaz, veri sayfadaki görünür içerikle eşleşir (fiyat, puan, tarih).

**H.6 Performans (mobil)**
- [ ] LCP < 2,5 sn, INP < 200 ms, CLS < 0,1 (önizlemede lab + yayından sonra CrUX); TTFB düşük; render-blocking kaynak yok.
- [ ] Görseller AVIF/WebP, doğru `sizes`, boyutları belirli (CLS = 0), LCP görseli öncelikli, diğerleri lazy; font alt kümesi, `display: swap`, CJK stratejisi (P9.8); JS bütçesi; GTM ve çerez bildirimi metrikleri bozmaz (P9.10).

**H.7 Güvenlik ve güven**
- [ ] HTTPS her yerde, HSTS; CSP; `X-Content-Type-Options`; `Referrer-Policy`; `Permissions-Policy`; `frame-ancestors`; karışık içerik yok; dış linklerde `rel="noopener"`; form bot koruması ve hız sınırı; çerez onayı.

**H.8 Görsel SEO**
- [ ] Her anlamlı görselde dil başına alt metin; süs görsellerinde boş alt; anlamlı dosya adları; sıkıştırma; kırık görsel yok.

**H.9 Mobil kullanılabilirlik**
- [ ] `viewport` doğru; dokunma hedefleri yeterli; okunur yazı boyutu; yatay kaydırma yok; sticky WhatsApp ve CTA içeriği kapatmıyor; sayfayı kapatan ara ekran (interstitial) yok.

**H.10 İç linkler**
- [ ] Kırık iç link 0; yönlendirmeli iç link 0; anchor metinleri açıklayıcı; breadcrumb her sayfada ve `BreadcrumbList` ile aynı.

**H.11 AI arama hazırlığı**
- [ ] AI botlarının erişimi test edilmiş; `llms.txt`; her sayfada kısa cevap/özet, yazar, tarih, kaynak; kurum bilgisi (ad, adres, telefon, lisans no) tutarlı (S2.5).

**H.12 İzleme**
- [ ] GSC (Domain property, 3 dil), Bing Webmaster, GA4 ve GTM olayları, uptime; yayından sonra 404 raporu sıfırlanana kadar haftalık takip.

### Ek I. Denetim bulguları (2026-10-07)

Yöntem: canlı EN sitenin sitemap'inden sayfa türlerine göre ayrılmış 56 sayfalık örneklem ve bizim yerel build'in 35 sitemap URL'si. Betikler geçici klasörde, `docs/` altına henüz taşınmadı. Küçük örneklem, yön gösterir, kesin oran değildir.

**Canlı EN site**
- Örneklemdeki **56 sayfanın hepsinde 3 H1** var: gerçek başlık + "Cancellation Policy" + "Responsibilities & Limitation of Liability" (yasal metin modalları). Tur sayfasında elle doğrulandı.
- Başlıklar benzersiz ve ≤ 59 karakter; meta açıklamalar benzersiz (ortalama 126-160). **Ama** 14 turdan 2'sinin meta açıklaması bozuk ("Follow Turkey" 13 karakter, "Travel from Istanbul into Turkey" 32); bir blog yazısı 72, `/about/` 195 karakter.
- hreflang yalnızca `x-default` + `en` (kendine). **Üç site arasında hreflang bağı yok.**
- `noindex` yok, canonical kendine ve eğik çizgili, tutarlı.
- JSON-LD: tur sayfalarında `Product` + `AggregateRating` + `Offer` + `MerchantReturnPolicy` + `OfferShippingDetails` + `TouristTrip`; `Organization` türü aynı sayfada birden fazla kez geçiyor.
- Tur sayfasında `<main>` landmark'ı yok.
- Tur sayfalarında SSS blokları `Question`/`Answer` mikro veri işaretlemesi taşıyor (D16 için not: eski sayfalarda SSS işaretlemesi zaten var). Tüm turlarda "Last Updated" 15-16 Eylül 2026 (toplu güncelleme), galeri tam 5 görsel, fiyatlar EUR, 99/118 turda rota haritası var (P1.5).
- Sayfa başına ham kelime sayısı 2.400-3.300 (yasal modal metinleri dahil, ana içerik ayrı ölçülmedi, P1.11 yapacak).
- Blog: 520 yazı. Dağılım: Türkiye 127, Yunanistan 110, Mısır 85, Ürdün 75, Fas 69, **Israel 60**. Slug'ların ≈250'si (%48) ay/hava/en iyi zaman kalıbında ve çoğunda "a-comprehensive-guide" eki var (örn. `istanbul-weather-in-september-a-comprehensive-guide`). Örneklemdeki yazı görsellerinde alt eksikliği ≈ %7 (17/240).
- Bot koruması: `robots.txt` adresi python varsayılan istemcisine 403 verdi.

**Bizim şablon (yerel build)**
- 35 sayfanın **11'inde başlık > 60 karakter** (ana sayfa 86; tur başlıkları 68-107, Cyclades turu 107); 10'unda meta açıklama < 120.
- Ülke sayfası başlığı jenerik ("Turkey Tours | Magnificent Travel", 33 karakter), canlıdaki gibi niyet/yıl içermiyor.
- Ülke sayfamızın ana içeriği ≈ 500 kelime (tüm `<main>` metni, kartlar dahil). Canlıda aynı sayfa türleri ölçüldü (kart, SSS ve yasal metin hariç): ülke ≈ 895, kombo ≈ 886, kategori ≈ 814, destinations hub ≈ 1.350, tur ≈ 572, blog yazısı ≈ 3.576 kelime. Yöntemler farklı, ama canlı sayfalar bizimkinden uzun; aynı yöntemle yeniden ölçülecek (P4.5).
- hreflang yok; ana sayfa canonical'ı eğik çizgisiz (`trailingSlash: true` planıyla uyumsuz, P2.2'de düzelir).
- `magnificenttravel.vercel.app` `index, follow` veriyor (D33: bilinçli kabul edildi).
- Ölçüm notu: yerel build için H1 sayımı betikteki bir hata yüzünden güvenilir değil. Ana sayfada elle 1 H1 doğrulandı, diğer sayfalar T2'de otomatik test edilecek.

### Ek J. CMS'te yönetilecek içerik ve kodda kalanlar (müşteri beklentisi)

Sanity "headless": panelden yalnızca şemada alan olarak tanımladığımız şey düzenlenir. WordPress gibi sayfa oluşturucuyla yeni düzen çizilemez.

**Panelden (geliştirici gerekmez):** turlar (başlık, program, fiyat, sezon, kalkışlar, oteller, dahil/hariç, SSS, galeri, harita, ilgili turlar), kategori/ülke/kombo sayfaları (giriş metni, görsel, SSS), blog (yazı, yazar, kategori, ilgili turlar, eski URL), statik sayfalar (Hakkımızda, İletişim, SSS, şartlar, gizlilik), site ayarları (telefon, WhatsApp, adres, çalışma saatleri, sosyal bağlantılar, güven rakamları), ana sayfa metinleri ve öne çıkanlar, her sayfanın SEO alanları, görseller ve alt metinleri, her dilin içeriği.

**Kodda (geliştirici gerekir):** tasarım ve bileşenler, yeni sayfa türü veya yeni bölüm tasarımı, dördüncü dil, filtre/arama mantığı, form davranışı ve e-posta yönlendirmesi, schema.org şablonları, URL desen kuralları.

**Esneklik kararı (D37, verildi):** sabit yapı. Bölüm sırası ve bölüm tipleri kodda sabit, blok sistemi yok. Müşteriye söylenecek: yeni tur, yazı, kategori, kombo veya statik sayfa eklenebilir, ama yeni bir sayfa *düzeni* veya yeni bir bölüm tipi geliştirici işidir. İleride sık tanıtım sayfası ihtiyacı doğarsa küçük bir blok sistemi (3-4 tip) ayrıca değerlendirilir ve attribute bütçesine (P6.15) göre karar verilir. Opsiyonel: Visual Editing ("tıkla ve düzenle" önizleme, Free planda dahil) kurulumu.

---

## 6. Oturum günlüğü

Satırlar **yeniden eskiye** sıralıdır (en güncel kayıt en üstte).

| Tarih | Yapılanlar | Kararlar | Engeller | Sonraki adım |
|---|---|---|---|---|
| 2026-10-15 | **P3 başladı** (`feat/p3-tour-template`): tur sayfası yeniden yazıldı (üst bağlantı çubuğu, özet, fiyat kutusu, program, otel tablosu, dahil/hariç, SSS, Tripadvisor kutusu, pratik bilgi); USD/EUR fiyat alanları (D40) Studio, içe aktarma, veri katmanı, kart ve JSON-LD'de; form yeniden yazıldı (tur başlığı görünür, müşterinin e-posta düzeni); `TourCard`/`QuoteForm` metinleri sözlüğe (en/zh/jp). `staging`'de deneme: içe aktarma USD'yi korudu; yerel derleme `check:site` 193 adres ALL OK, tsc ve lint temiz, masaüstü ve mobil ekran görüntüsü alındı. | Sayfa bölümleri sekme yerine sabit bağlantı çubuğu (HTML'de hepsi var); yeni fiyat şekli `price.eur/usd` | Studio dağıtımı ve production içe aktarması kullanıcı adımı; spam koruması kararı; gerçek cihaz testi | P3.5-P3.9 |
| 2026-10-14 | Canlı sitenin form çalışması incelendi: iletişim ve rezervasyon formları sitenin kendi `submitform` adreslerine AJAX POST, reCAPTCHA v3 ve gizli tuzak alan; üçüncü taraf mail sağlayıcısı yok (JS'te iz yok, SPF yalnızca Netport IP'leri). Mail sağlayıcı kararı: Brevo ana, Resend yedek (D41). Bülten şimdilik yok: form, API türü ve gizlilik metni temizlendi. | D41 | Eski bildirimin gönderen sunucusu doğrulanmadı (müşteriden orijinal `.eml` istenebilir); reCAPTCHA anahtarı eski alan adına kayıtlı | E-posta işleri en sonda (P9.3, P9.12); şimdilik P2 |
| 2026-10-14 (staging) | `staging` dataset'i yanlış adla (`stating`) açılmıştı, silinip `staging` olarak yeniden açıldı; `import` token'ı oluşturuldu, `spike` token'ı kullanıcı tarafından değiştirildi; `staging` production'la aynı içerikle dolduruldu (188 doküman, 832 görsel eşleşiyor). Vercel CLI girişi ve `vercel link` yapıldı. Başarısız Vercel dağıtımının sebebi kullanıcının yapıştırdığı günlükten doğrulandı: Sanity 502 (derleme düşmüştü); yeniden deneme eklenmişti. | Preview'lar `production`'ı okur | – | **P3** (yeni oturumda) |
| 2026-10-14 (oturum sonu) | Studio yayınlandı (`magnificenttravel.sanity.studio`); yayın sırasında iki hata çıktı ve düzeltildi (Vite'ın üst klasördeki Tailwind PostCSS dosyasını bulması, masaüstü yapısında `id` eksikliği; yapı artık Sanity'nin kendi oluşturucusuyla doğrulanıyor). Webhook kuruldu ve test edildi. `spike` dataset'i silindi, `staging` açıldı. PR #1 ve #2 birleştirildi, canlıda `check:site` 193 adres ALL OK. Plan durum paragrafı ve hafıza notları güncellendi. | – | `spike` token'ı duruyor (içe aktarma için gerekli); `staging` boş | **P3** |
| 2026-10-14 (birleştirme) | **PR #1 `main`'e birleştirildi** (e9600e1). İlk CI hatası: `PageProps` tipleri `next typegen` ile üretiliyor, CI'da `tsc` önce çalışıyordu; iş akışına `next typegen` eklendi. Vercel üretim dağıtımı yeşil; canlı sitede `check:site` **193 adres ALL OK** (yönlendirme, 404, 410, arama indeksi, Israel yok). Testteki dil kontrolü Vercel'in `<html data-dpl-id>` etiketinde yanlış alarm veriyordu, düzeltildi. | Studio ayrı paket: site tip denetiminden hariç (`tsconfig.json`) | Kullanıcı adımları: Vercel'de `SANITY_REVALIDATE_SECRET`, Sanity webhook, `spike` silme ve `staging`, Studio yayını | Kullanıcı adımları bitince yayın→güncelleme testi, sonra P3 |
| 2026-10-14 (P6 çekirdeği) | **Site Sanity'ye geçti:** Studio (`studio/`, şema, dil gruplu masaüstü), içe aktarma (188 doküman, 832 görsel `production`'da), veri katmanı GROQ ile okuyor, `/api/revalidate/`, Ürdün'deki dolaylı anmalar olduğu gibi kaldı (karar), dil değiştirici bayraklı dropdown. `check:site` 193 adres ALL OK. | Israel süzmesi içe aktarmaya taşındı; Ürdün anmaları kalır | `spike` dataset'i silinemedi (yetki), Studio yayını ve webhook kullanıcı adımı; Vercel'de `SANITY_REVALIDATE_SECRET` | Studio yayını, webhook, `staging`, ardından P3 |
| 2026-10-14 (Israel ve Blob) | **Israel süzmesi genişletildi:** önce yalnızca başlık ve kartlar süzülüyordu; 190 içerik dosyasının 59'unda anma vardı (SSS cevapları, komşu ülke listeleri, "…Morocco ve Israel'de turlar" cümleleri, Israel'li kombolara linkler). Artık hiçbiri sitede yok, `check:site` sürekli denetler. **Vercel Blob iptal:** Sanity projesi var, görseller doğrudan Sanity'ye (D13, P1.10, P6.4). | D13 güncellendi | Ürdün turlarındaki 12 dolaylı anma (Kudüs, Kutsal Topraklar) için karar | Kontrol ve push |
| 2026-10-14 (P2 tamam) | **P2 tamamlandı** (branch `feat/i18n-url-parity`): veri katmanı, tüm EN rota paritesi (118 tur, kombo, kategori, ülke, blog, yazar, gdpr, arama), dil değiştirici, önizleme notu, CJK yazı tipleri, 404/410, sitemap ve robots, CI, GSAP kaldırıldı. `check:site`: 193 sitemap adresi hepsi 200, tek H1, canonical, lang, JSON-LD. Sanity Attributes 125/2k. | zh/jp yedek sayfa canonical'ı EN, hreflang yok, sitemap yalnızca EN | Proxy eşleştirici kaçış hatası bulundu ve düzeltildi; görseller canlı siteden (P1.10 bekliyor); `spike` dataset'i silinmedi | Kontrol ve push, sonra P3 (şablonlar) |
| 2026-10-14 (P2.4) | **P2.4 kısmen yapıldı:** sözlük altyapısı (en/zh/jp, tip kontrollü), Header, Footer, WhatsApp, 404, layout metadata dile bağlandı; para/tarih biçimleri; `site.ts` içindeki `nav` kaldırıldı. Newsletter kaldırıldı. Sitemap ve robots P2.18/P2.19 olarak eklendi. | Formlar ve içerik bileşenleri sözlüğe P3'te taşınır; zh/jp taslak çeviri müşteri onayına bağlı | zh/jp metinler anadil denetimi bekliyor; `[lang]/nope` gibi eşleşmeyen adresler özel 404 yerine Next'in varsayılanını gösteriyor (P2.15) | P2.5 veri erişim katmanı |
| 2026-10-13 | **Sanity spike yapıldı:** EN içeriğin tamamı (190 doküman, 832 görsel) geçici `spike` dataset'ine aktarıldı; Usage: Documents 190/10k, Assets 77,3 MB/100 GB, API 852/250k. Görsellerin doküman limitine sayılmadığı görüldü (P6.15 düzeltildi). Attributes 125/2k (bizim sayım 117 yol). Proje Growth Trial'da (25 gün). Studio için ek ücret yok (Sanity barındırması, doğrulama bekliyor). | Studio `sanity deploy` ile barındırılacak (öneri, onay bekliyor) | `spike` dataset'i silinmedi (2/2 dolu); Attributes değeri doğrulanmadı; deneme planı bitince Free'ye dönüş | P6.15 ölçümü kapat (Plan sekmesi), spike'ı sil; P2.4 sözlükler |
| 2026-10-12 (P2 başı) | **P2.1-P2.3 yapıldı** (branch `feat/i18n-url-parity`): `src/i18n/` (config, paths, locale-context, link, server), `src/proxy.ts`, tüm sayfalar `app/[lang]/` altında, `trailingSlash: true`, `seo.ts` dil duyarlı (canonical, og:locale, JSON-LD), Header/SearchBar/sitemap dil duyarlı. tsc, lint, build yeşil. Kontrol: `/` → 301 `/en/`, `/jp/` html `lang="ja"`, canonical `/en/tours/`. | Tek `Link` sarmalayıcı: kodda dil öneksiz yol yazılır | `/tours` → 308 `/tours/` → 301 `/en/tours/` iki sıçrama (eski adresler için P7'de tek sıçramaya indirilecek). Slug sayfaları şimdilik yalnızca `/en/` için statik üretiliyor (veri katmanı P2.5'te dile bağlanır) | P2.4 sözlükler, P2.5 veri katmanı, P2.6 rota paritesi |
| 2026-10-12 | **Müşteri yanıtları işlendi ve içerik yeniden çekildi.** Yanıtlar: form alıcıları (3 adres), USD/EUR seçeneği (D28, D40), yorumlar Tripadvisor (D22), panel kullanıcıları (3), blog yönlendirmesi B (D36), DNS/GBP/Tripadvisor erişimi (şifre teklif etti), 34 blog yazısı taşınacak (D12), ekip bilgisi ve fotoğraflar (P3.9), formda tur başlığı talebi (P3.10). Yeniden tarama: EN değişmedi (118 tur, 617 sayfa), **ZH 793 → 462 ve JP 441 → 275 URL** (müşteri tur sildi; zh'de Fas turu kalmadı); 34 blog yazısı JSON'a çevrildi; görsel manifesti yenilendi. Eski anlık görüntü `data/archive/*-2026-10-07`. | D12, D22, D36 kapandı/güncellendi; D28 güncellendi; D40 yeni | D40 (USD/EUR mekanizması), fotoğraf sahipleri, saat dilimi müşteriye teyit; D32, D38, D39 yanıtı gelmedi | P2 (çok dillilik ve URL paritesi) |
| 2026-10-07 (P1) | **P1 yapıldı** (branch `docs/project-plan`, commit 93539d2 ve 80617db): `scripts/scrape/` hattı; EN arşivi 617 sayfa (hepsi 200, engellenme yok); 118 tur + 43 sayfa JSON; 9.566 metin parçası canlı sayfada birebir doğrulandı; SEO envanteri (617 satır) ve gerçek kelime sayıları; 842 görsel → 753 benzersiz dosya; attribute ilk hesabı 108 (limit 2.000). | – | P1.10 için Vercel Blob mağazası ve token (kullanıcı); P0.5d, P0.6 açık | **P2:** çok dilli altyapı ve URL paritesi. Önce D18, D19, D26 uygulaması; `app/[lang]/` taşıması |
| 2026-10-07 (P0) | **P0 yapıldı:** plan ve `docs/baseline/` commit'lendi (branch `docs/project-plan`), eski docs'lara "outdated" notu ve Morocco düzeltmesi eklendi (P0.1), `.gitignore`'a `!.env.example` eklendi ve `.env.example` takibe alındı (P0.2), lint/tsc/build yeşil, Lighthouse baseline kaydedildi: LCP ≈ 4,8-5,1 sn (hedefin iki katı, kötümser yerel ölçüm), CLS 0 (P0.4). `npm ci` bilinçli çalıştırılmadı. | D8, D17, D18, D19, D22, D26 onaylandı | P0.5d (GA4/GTM içeriği, kullanıcının Analytics erişimi gerekir), P0.6 (müşteriye giden mesaj), P0.9 (AI görünürlük kaydı) açık | **P1:** scrape iskeleti, URL envanteri, EN ham arşiv |
| 2026-10-07 (son kontrol) | Plan baştan sona okundu, eskimiş maddeler düzeltildi (P2.11 ve P4.1 `noindex`, P6.1 rol, P0 bitti ölçütü, Ek E, Ek F, Ek I). Açık kararlara varsayılanlar eklendi (D8, D17, D18, D19, D22, D26). P0.11 (çalışma düzeni) eklendi. Günlük sıralaması düzeltildi. | D37 verildi (sabit sayfa yapısı), varsayılanlar: D17, D18, D19, D22, D26 | D23 ekleri (5 Ekim H1/H2 görselleri, 3 Ekim dosyası) bizde yok | **P0 ve P1'e başla.** P2'den önce D18, D19, D26 varsayılanlarına itiraz var mı sor |
| 2026-10-07 (dördüncü) | Kullanıcı kararları işlendi: `vercel.app` noindex gereksiz (P0.0/D33), silinmiş sayfalar ertelendi (D34, P0.5b-c, P7.14), blog kapsamı netleşti: biz yalnızca 5 Map of X yazısını taşırız, gerisini müşteri girer (D12, D35, D36), GSC/GA4/GTM yayın öncesi zorunlu (P8.5, P8.6, P10.1). Yeni görev: CMS'te yönlendirme yöneticisi (P6.14). GA4/GTM kanıtı: canlı EN HTML'inde `G-E8XLPNE302` ve `GTM-55HWFMHR` var. | D12, D33-D36 güncellendi | EN GA4'ün veri toplayıp toplamadığı doğrulanmadı | P0.1-P0.4 (plan commit, docs notları, yerel ortam, baseline Lighthouse), ardından P1 |
| 2026-10-07 (üçüncü) | **OpenSEO bağlandı ve doğrulandı** (`whoami`, `list_projects`: 500 kredi, tek "Default" projesi, GSC bağlı). İlk GSC çekimi: cihaz, ülke, sayfa, sorgu, ticari sayfalar. 150 sayfanın canlı durumu kontrol edildi: 26'sı 404. `docs/baseline/gsc-en-baseline.md` yazıldı, `.gitignore`'a `/data/` eklendi. Plan güncellendi: D30, D34-D36, P0.5a-d, P3.19-P3.20, P7.13-P7.14, S1.0, S1.7. | D34-D36 önerildi | GA4 OpenSEO'ya bağlı değil; 404 listesi API'den alınamıyor (arayüzden dışa aktarım gerekli); zh/jp konum desteği doğrulanmadı | P0.0 (vercel.app noindex), P0.5c (404 envanterini genişlet), GA4 bağlantısı, müşteriye D34/D35 soruları |
| 2026-10-07 (ikinci) | Kullanıcı kararları işlendi: Israel içeriği kopyalanmaz (D4), mevcut Pexels görselleri kabul (D7, P3.14), teslim tarihleri kullanıcıda (P0.8), anahtar kelime/rakip listesini ekip çıkarır (S1.3-S1.4). OpenSEO eklentisi (`openseo@openseo`) kuruldu; OAuth girişi ve doğrulama bekliyor (D30). | D7 ve D4 güncellendi, D30 OpenSEO | OpenSEO girişi: `/reload-plugins` + `/mcp` onayı; CLI sağlık kontrolü OAuth keşfinde `InvalidHTTPResponse` veriyor (sunucu yanıt veriyor, Figma bağlantısında da aynı hata) | Girişi tamamla, `whoami`/`list_projects` ile doğrula, GSC mülkünü bağla, P0.0 |
| 2026-10-07 | Plan gözden geçirildi (v1.1). Canlı EN site için 56 sayfalık SEO örneklemi ve yerel build karşılaştırması yapıldı. Teknik SEO kabul listesi (Ek H), İş akışları S ve T, 8 yeni karar (D26-D33), her faza eksik görevler eklendi. | D26-D33 önerildi. D33 (vercel.app noindex) acil. | GSC dışa aktarımları, anahtar kelime listesi, rakip listesi, araç erişimi (Ek E) | P0.0 (noindex), ardından P0'ın kalanı; Ek E'deki bilgileri müşteriden iste |
| 2026-10-06 | Repo, chat ve canlı siteler incelendi. Üç sitemap'in yapısı çıkarıldı. Bu plan yazıldı. `/chat/` `.gitignore`'a eklendi. | D1-D7 verildi, D8-D15 önerildi, D16-D25 açık | GSC yalnızca EN için; zh/jp erişimi yok | P0'ı başlat; D17, D18, D19, D22, D23'ü kapat |

---

## 7. Backlog / kapsam dışı (karar bekleyenler)
- **Travel Planner** (müşteri tasarım örneklerinde vardı): standart 25.000 TL, yapay zeka destekli 35.000 TL olarak ayrı fiyatlandırılacağı söylendi, talep edilmedi. **Kapsam dışı.**
- Yeni logo tasarımı (müşteri "beğenmezseniz daha iyisini yapabilirsiniz" demişti; mevcut logo kullanılıyor).
- Mesafeli satış sözleşmesinin zh/jp çevirisi.
- Ek: yeni istekler buraya tarih ve kaynak ile yazılır.
