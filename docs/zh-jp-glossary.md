# Çince ve Japonca: terim sözlüğü, gösterim kuralları ve anadil denetimi (P5.7, P5.10)

Bu belge, sitenin tasarım metinlerinin (menü, düğme, form, bölüm başlıkları) zh ve jp çevirilerinde **hangi terimin kullanıldığını** ve bu metinlerin **kim tarafından nasıl denetleneceğini** yazar. Sayfaların kendi içeriği (tur programları, kategori ve ülke metinleri, SSS, hakkında) **çevrilmedi**: eski Çince ve Japonca sitelerden olduğu gibi alındı (P5.5).

## Durum: taslak, anadil denetimi yok

Tasarım metinlerinin çevirileri (`src/i18n/dictionaries/zh.json` ve `jp.json`, `ui` ve diğer bölümler, toplam **451 satır**) yapay zekâ yardımıyla yazılmış **taslaklardır**; anadili Çince veya Japonca olan biri okumadı. Terimlerin çoğu eski sitelerin menülerinden ve sayfalarından alındı (aşağıdaki "eski siteden" işaretli olanlar). Yayından önce müşterinin Çince (Meifen) ve Japonca tarafı denetlemeli (D, P4 onay kapısındaki madde).

**Denetim dosyası:** `docs/review/ui-strings-zh-jp.csv`. Her satır: anahtar, İngilizce, Çince taslak, Japonca taslak, ve iki boş "düzeltme" sütunu. Denetleyen yalnızca düzeltme sütunlarını doldurur; düzeltmeler sözlüklere işlenir. Dosyayı yeniden üretmek: `node scripts/i18n/export-review.mjs`.

## Terimler

| İngilizce (site) | Çince (繁體) | Japonca | Kaynak |
|---|---|---|---|
| Tour | 行程 | ツアー | eski site |
| Private tour | 專屬包團 | プライベートツアー | eski site (zh menüsü: 專屬包團, jp: プライベートツアー) |
| Small group tour | 小團行程 | 少人数グループツアー | eski site |
| Multi-country tour | 多國旅遊行程 | コンビネーションツアー | eski site (jp sitesi "コンビネーション" der) |
| Destinations | 旅遊目的地 | 目的地 | eski site |
| Travel guides (blog) | 旅遊指南 | 旅行ガイド | taslak |
| About us | 關於我們 | 会社概要 | eski site |
| Contact | 聯繫 | 問い合わせ先 | eski site |
| FAQ | 常見問題 (eski sayfa başlığı: FAQ問答集) | よくある質問 (eski: FAQ) | eski site |
| Plan my trip | 規劃我的旅程 | 旅行を計画する | taslak |
| Itinerary | 每日行程 | 日程 | eski site (jp tablosu: 日次/スケジュール) |
| What is included | 費用包含 | 料金に含まれるもの | eski site |
| Trip requirements | 行程須知 | 旅行条件 | taslak |
| Cancellation terms | 取消條款 | キャンセル規定 | eski site (jp: キャンセル規定) |
| From (starting price) | 起價 | 最低料金 | jp eski site; zh taslak |
| Per person | 每人 | 1名あたり | eski site |
| Price on request | 價格請洽詢 | 料金はお問い合わせください | eski site (zh: 提出請求, jp: お問い合わせフォーム) |
| Request a quote | 索取專屬報價 | お見積りを依頼する | taslak |
| Deposit | 訂金 | 手付金 | taslak |
| Licensed agency | 合法旅行社 | 登録旅行会社 | taslak |
| Private / Small group (filter) | 專屬包團 / 小團行程 | プライベート / 少人数グループ | eski site |

## Tur kodları ve adlandırma

- **Japonca sitenin kendi tur kodları var:** `T-xx` (kısa), `TM-xx` (orta, 6-9 gün), `TL-xx` (uzun, 10+ gün) ve sayfa içinde `TR-xxx` ürün kodu. Kodlar tur başlığında olduğu gibi kalır (`TM-01 イスタンブール・…7泊8日`); `TR-xxx` "ツアーコード" olarak ek bilgiler arasında görünür. Kodlar eşleştirmede kullanılmadı (üç sitede ortak değil).
- **Çince sitenin tur başlıkları** Çince ad + İngilizce büyük harfli ad içerir (`土耳其精選8日遊-3段內陸航班 TURKEY CLASSIC TOUR 8 DAYS`); aynen korunur.
- Slug'lar eski adresle aynıdır: zh İngilizce (`turkey-classic-tour-07-days`), jp Japonca ve yüzde kodlu (`TM-01イスタンブール…`). `/jp/` altındaki hedefler klasörü `目的地`'dir.

## Fiyat ve para birimi gösterimi (P5.10, D28)

- Her dilde **EUR ve USD** gösterilebilir (D28, D40); müşteri Studio'da ikisini de girer. Eski Çince ve Japonca sitelerde fiyatlar yalnızca avroydu.
- Biçim: `Intl.NumberFormat` ile dile göre, ondalıksız: zh `€1,595` / `US$1,595`, jp `€1,595` / `$1,595`. Yen veya Tayvan doları gösterilmez.
- **Fiyat isteğe bağlı:** zh turlarının hiçbirinde üstte fiyat yok ("提出請求"), jp turlarının yaklaşık üçte birinde "最低料金" var. Fiyatı olmayan turda "價格請洽詢" / "料金はお問い合わせください" görünür ve `Offer` yapılandırılmış verisi üretilmez.
- Çince fiyat tabloları eski sayfadaki gibi **Tur Fiyatı sekmesinde** durur; bazıları **2023 ve 2024** için (eski metin). Güncellemek müşterinin işi.

## Bilinen sınırlar

- Anadil denetimi yok (yukarıda).
- Tur sayfalarında "Ödeme özeti" sekmesi ve pasaport/sigorta kutuları yalnızca İngilizcede var (metinleri İngilizce sitenin şartlarından alındı); zh ve jp'de bu sekme yok, o dillerin kendi şartlar sayfaları (`terms-condition`, `利用規約およびキャンセルポリシー`) var.
- Çince sitenin Fas turu yok (müşteri sildi); zh menüleri ve kutuları Fas'ı göstermez.
- zh ve jp'de blog yok; "旅遊指南" / "旅行ガイド" sayfası eski sitedeki gibi kısa bir sayfa.
- Eski jp başlıkları uzun (ortalama ≈ 60 karakter, SERP'te kesilir) ve bazı zh açıklamaları tekrar ediyor: eski veri olduğu gibi duruyor; düzeltmek SEO yazımı gerektirir ve anadil editörün işidir (P8).
