# Üç sitedeki turlar aynı mı? (karşılaştırma, 2026-10-07)

Yöntem: EN için normalize edilmiş 118 tur (`content/scraped/en/tours`), zh ve jp için arşivlenmiş ana sayfalar (`/zh/` ve `/jp/`, alt-sekme URL'leri hariç). zh/jp tur sayfaları, "fiyat teklifi" formu başlığı taşıyan sayfalar olarak ayırıldı. Turlar **süre (gün) ve gezilen şehir kümesi** ile eşleştirildi, çünkü adlar ve kodlar siteden siteye farklı (`scripts/scrape/compare-sites.mjs`). Şehir adları sabit bir sözlükle (İngilizce, Geleneksel Çince, Japonca) tanındığı için **sonuçlar yaklaşıktır** ve P5.4'teki gerçek eşleştirmenin yerini tutmaz. "Güçlü" = aynı gün sayısı ve şehir kümesi büyük ölçüde aynı; "kısmi" = en fazla 1 gün fark ve şehirlerin yarısından fazlası ortak.

## Sonuç: aynı ürün ailesi, ama aynı katalog değil
Sitelerin turları birbirine büyük ölçüde benziyor ve bazıları birebir aynı, ama her sitenin kendine ait turları da var. Üç siteyi 1:1 eşleştiremeyiz.

| | EN | ZH (Geleneksel) | JP |
|---|---|---|---|
| Tur sayısı (ana ürün sayfası) | 118 | 92 | 103 |
| Türkiye | 32 | 39 | 55 |
| Yunanistan | 28 | 12 | 9 |
| Mısır | 8 | 6 | 7 |
| Ürdün | 7 | 5 | 7 |
| Fas | 12 | 10 | 8 |
| Kombo (çok ülkeli) | 31 | 20 | 17 |

Müşterinin verdiği sayılar 125 / 85 / 85'ti. Bizim sayımız zh ve jp'de biraz yüksek (92 ve 103): günübirlik ve kısa turlar da "tur sayfası" olarak sayıldı.

| Eşleşme (tahmini) | Güçlü | Kısmi | Karşılığı yok |
|---|---|---|---|
| zh turları → EN | 21 (%23) | 45 (%49) | 26 (%28) |
| jp turları → EN | 38 (%37) | 31 (%30) | 34 (%33) |
| zh turları → jp | 26 (%28) | 38 (%41) | 28 (%30) |

**118 EN turunun 61'inin (%52) zh veya jp'de bir karşılığı var**, 57'si yalnızca İngilizce.

## Gözlemler
- **Ortak ürünler çoğunlukla Türkiye'nin klasik rotaları.** Örnekler: "4 günlük Kapadokya-Pamukkale-Efes", "6 günlük İstanbul-Kapadokya", "10 günlük Batı Türkiye ve Kapadokya" her üç sitede de var (farklı adlarla).
- **Fiyatlar aynı olabiliyor.** JP "T-02 İstanbul-Kapadokya 6 gün" ve "T-03 6 günlük Güneybatı Türkiye" sayfalarında minimum fiyat **€1.095 ve €1.395**, EN'deki karşılıklarıyla birebir aynı. JP "T-01" için €960, EN'deki 4 günlük tur için €1.045 (EN'deki tur 3 iç hat uçuşlu, zh'de 2 uçuşlu bir varyant da var, yani JP T-01 muhtemelen EN'de olmayan 2 uçuşlu varyant).
- **zh ve jp'de yalnızca kendilerine ait turlar var:** özellikle İstanbul ve Türkiye günübirlik turları, İstanbul "Tur 1-4" ürünleri, "mezuniyet gezisi", bazı uzun Anadolu turları. EN'de daha zengin olanlar: Yunanistan (28 tur), kombolar ve Fas.
- **Fiyat gösterimi farklı.** EN: her turda "From €…". JP: 103 turun 31'inde sayfada euro cinsinden "minimum fiyat (2 kişi, 1 oda)" var. ZH: 92 turun 74'ünde "fiyatı öğrenmek için önce rezervasyon formunu doldurun" uyarısı var, 9'unda euro fiyatı var. Yani zh/jp'de çoğu turun fiyatı sayfada yok (ya da farklı biçimde, bunu P5'te doğrularız).
- **Para birimi hepsinde EUR** (zh/jp sayfalarında € veya 歐元).
- **Japon sitesinde kendi ürün kodları var** (örn. TR-04, TR-05, R-03). Bu kodlar P5.4'te eşleştirmeye yardımcı olabilir.

## Plana etkisi
- Dil eşleştirme (P5.4, D11) varsayımı doğru: tüm turlar için karşılık beklemeyiz, karşılığı olmayanlar tek dilli sayfa kalır, hreflang yalnızca gerçek karşılıkta üretilir.
- Her dilin kendi ürün listesi ve kategori ağacı korunur (ilke 8). zh/jp'ye "EN'deki bütün turları ekle" ya da tersi yapılmaz.
- Tur şablonunda **fiyat isteğe bağlı** olmalı: zh/jp'de "fiyat için iletişime geçin" durumu olacak, `Offer` yapılandırılmış verisi yalnızca fiyat varsa üretilir.
- D28 (para birimi): üç sitede de EUR kullanılıyor, varsayılan EUR.

---

## Güncelleme 2026-10-12: müşteri eski sitelerden tur sildi
Müşteri Çince ve Japonca sitelerden tur sildi, İngilizce sitede **hiçbir fark yok** (118 tur, içerik aynı; tek fark, eski sitenin yapılandırılmış verisindeki haftalık kayan "fiyat geçerlilik" tarihi, bu artık saklanan kopyadan çıkarılıyor). Üç site yeniden arşivlendi (7 Ekim anlık görüntüsü `data/archive/*-2026-10-07` altında).

| Site | URL (7 Ekim → 12 Ekim) | Silinen ana sayfa (tur ve kategori) |
|---|---|---|
| ZH | 793 → 462 | `/zh/`: Türkiye 23, Yunanistan 6, **Fas 10 (tamamı)**, Türkiye-Yunanistan gemi turu 5; `/cn/`: aynı sayfaların karşılıkları |
| JP | 441 → 275 | Türkiye 40, Yunanistan 5, Mısır 2 |
| EN | 690 → 690 | yok |

Silinen URL'lerin tam listesi `data/inventory/removed-2026-10-12.csv` (497 satır), P7.3'te üst kategoriye 301 için kullanılacak.

### Yeni sayılar (aynı yöntem)
| | EN | ZH | JP |
|---|---|---|---|
| Tur sayısı | 118 | **53** (92'den) | **63** (103'ten) |
| Türkiye | 32 | 21 | 20 |
| Yunanistan | 28 | 6 | 5 |
| Mısır | 8 | 6 | 6 |
| Ürdün | 7 | 5 | 7 |
| Fas | 12 | **0** | 8 |
| Kombo | 31 | 15 | 17 |

| Eşleşme (tahmini) | Güçlü | Kısmi | Karşılığı yok |
|---|---|---|---|
| ZH turları → EN | 17 | 28 | 8 (%85'inin EN'de karşılığı var) |
| JP turları → EN | 32 | 23 | 8 (%87'sinin EN'de karşılığı var) |
| ZH turları → JP | 16 | 24 | 13 |

**Sonuç:** Silmelerden sonra Çince ve Japonca kataloglar büyük ölçüde İngilizce kataloğun alt kümesi gibi (silinenler çoğunlukla zh/jp'ye özgü Türkiye günübirlik ve kısa turları). Ama ters yön geçerli değil: **118 EN turunun yalnızca 50'sinin (%42) zh veya jp'de karşılığı var**, 68'i yalnızca İngilizce. Çince sitede artık **hiç Fas turu yok**, Japonca sitede 8 var.
