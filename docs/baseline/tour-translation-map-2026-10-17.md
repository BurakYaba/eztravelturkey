# Üç dilde aynı tur: eşleştirme tablosu (P5.4, 2026-10-17)

Yöntem: `scripts/scrape/match-languages.mjs`. Bir tur, **gün sayısı** ve **gezdiği şehirler** (`scripts/scrape/lib/places.mjs`: şehir adları üç dilde, ör. Kapadokya = Cappadocia = 卡帕多奇亞 = カッパドキア) ile tanınır. Aynı süre ve şehir kümesine sahip birden fazla tur varsa tiebreaker olarak iç hat uçuş sayısı ve (Japonca sayfalarda sık görülen) aynı avro fiyatı kullanılır. Yalnızca şu koşulların **hepsi** sağlanırsa **kesin eşleşme** sayılır: gün sayısı aynı, skor ≥ 0,8, iki taraf birbirinin tek en iyi eşleşmesi (beraberlik eşleşme sayılmaz).

Sonuç dosyaları: `data/mapping/translations.csv` (müşterinin doğrulaması için), `data/mapping/translations.json` (Sanity içe aktarması `translationGroup` alanını buradan yazar).

## Özet

- Kesin eşleşme (aynı tur, `translationGroup` verilir): **36 grup**: EN+JP 17, EN+ZH 9, EN+ZH+JP 7, ZH+JP 3.

- Olası eşleşme (müşteri teyit edecek, kullanılmaz): **115 çift**: EN+JP 47, EN+ZH 34, ZH+JP 34.

- Kesin eşleşenlerde dil değiştirici ve `hreflang` gerçek karşılığa gider; eşleşmeyenlerde ilgili dilin hedefler sayfasına düşer (D11). Hero görseli kesin eşleşmelerde İngilizce turdan kopyalanır (P5.11).

- Eşleşme sayısı, ön analizin (%85) altında kaldı, çünkü yöntem bilerek temkinli: aynı şehirleri ve aynı süreyi paylaşan çok sayıda Türkiye turu (ör. beş farklı 8 günlük klasik Türkiye turu) var ve bunlar arasında metne bakarak seçim yapmak yanlış eşleşme riski taşır. Yanlış `hreflang` zarar verir, eksik `hreflang` vermez.

## Müşteriden istenen

1. Aşağıdaki **kesin** eşleşmeleri gözden geçirmek (yanlış varsa `translations.csv`'de silinir).
2. `translations.csv` içindeki `possible` satırlarında doğru olanları işaretlemek; bu satırlar onaydan sonra gruba eklenir. Bir tur grupta yalnızca bir kez, bir dilde yalnızca bir turla yer alır.
3. Karşılığı olmayan turlar (aşağıda yok) tek dilli kalır, bu bir hata değil.

## Kesin eşleşmeler

| Grup | Gün | English | 繁體中文 | 日本語 |
|---|---|---|---|---|
| t001 | 8 | 8-Day Best of Egypt Tour: Cairo, Nile & Abu S… |  | ナイル川クルーズとカイロ観光付きエジプト8日間周遊ツアー |
| t002 | 8 | 8-Day Cairo & Hurghada Cultural & Beach Tour |  | エジプトツアーカイロ・フルガダ7泊8日 |
| t003 | 9 | 9-Day Grand Egypt Journey with Nile Cruise |  | エジプトツアーカイロ・アスワン・ルクソール8泊9日 |
| t004 | 14 | 14-Day Greek Islands & Egypt Nile Cruise Jour… |  | ギリシャ・エジプト周遊13泊14日 |
| t005 | 7 | 7-Day Athens & Cairo Ancient Civilizations To… |  | アテネ・カイロ７日間 |
| t006 | 3 | 3-Day Delphi & Meteora Guided Tour from Athens | 岱爾菲&梅特歐拉世界遺產之旅3日遊 DELPHI & METEORA TOUR |  |
| t007 | 3 | 3-Day Peloponnese & Ancient Greece Tour | 奥林匹亞&岱爾菲世界遺產3日遊 OLYMPIA & DELPHI TOUR |  |
| t008 | 12 | 12-Day Greek Island Hopping: Mykonos, Paros &… |  | アテネ・ミコノス・パロス・サントリーニ11泊12日 |
| t009 | 8 | 8-Day Best of Greece: Athens, Mykonos & Santo… | 希臘浪漫島嶼8日 ATHENS SANTORINI MYKONOS TOUR | アテネ・ミコノス・サントリーニ7泊8日 |
| t010 | 10 | 10-Day Greece Tour: Athens, Santorini & Rhodes |  | アテネ・サントリーニ・ロドス9泊10日 |
| t011 | 3 | 3-Day Amman & Petra Short Break | 約旦佩特拉古城3日遊 PETRA 3 DAYS TOUR | アンマン・ペトラ3日間 |
| t012 | 5 | 5-Day Jordan Highlights: Petra & King’s Highw… | 約旦特選5日遊 AMMAN PETRA 5 DAYS TOUR |  |
| t013 | 8 | 8-Day Jordan Adventure: Petra, Wadi Rum & Aqa… | 完全約旦8日遊 AMMAN AQABA PETRA TOUR 8 DAYS |  |
| t014 | 5 | 5-Day Casablanca & Marrakech City Journey |  | カサブランカ＆マラケシュ4泊5日 |
| t015 | 8 | 8-Day Classic Morocco Tour: Four Imperial Cit… |  | マラケシュ・カサブランカ・ラバト・メクネス・フェズ7泊8日 |
| t016 | 8 | 8-Day Morocco Desert Tour: Fez to Marrakech |  | フェズ・エルフード・トドラ・ワルザザート・マラケシュ7泊8日 |
| t017 | 11 | 11-Day Turkey & Egypt Ancient Wonders Route |  | 11日間 トルコ＆エジプト周遊ツアー |
| t018 | 21 | 21-Day Three Civilizations Journey: Turkey, G… | 土耳其希臘埃及精選21日遊 TURKEY GREECE & EGYPT 21 DAYS T… | トルコ・ギリシャ・エジプト21日間 |
| t019 | 10 | 10-Day Cappadocia to Greek Islands Adventure | 土耳其希臘映像10日遊 10 DAYS TURKEY AND GREECE TOUR | 10日間トルコギリシャ |
| t020 | 12 | 12-Day Turkey & Greek Islands: Aegean Treasur… | 土耳其希臘愛琴海12日遊 12 DAYS TURKEY AND GREECE TOUR |  |
| t021 | 13 | 13-Day Greece & Ancient Turkey Heritage Route |  | トルコ・ギリシャエーゲ海の島々オデッセイツアー13日間 |
| t022 | 18 | 18-Day Grand Turkey & Greece: Islands & Ancie… |  | トルコ・ギリシャ歴史発見ツアー18日間 |
| t023 | 8 | 8-Day Istanbul & Athens Two-Country Tour |  | イスタンブール－アテネ8日間 |
| t024 | 3 | 3-Day Ancient Aegean Archaeology Tour |  | T-10 エフェソス・パムッカレ・プリエネ･ミレトス･ディディマツアー2泊3日 |
| t025 | 4 | 4-Day Turkey Express Tour: Three Iconic Regio… |  | 世界遺産カッパドキア・エフェソス・パムッカレ3泊4日｜空路で巡るトルコ周遊ツアー |
| t026 | 4 | 4-Day Gallipoli, Troy & Ephesus Heritage Tour |  | T-07チャナッカレ・トロイ・ペルガモン・エフェソス・パムッカレツアー3泊4日 |
| t027 | 6 | 6-Day Southwest Turkey Adventure: Coast to Ca… | 土耳其世界遺產與地中海6日精華遊-2段內陸航班 TURKEY MAGNIFICENT 6 … | T-03 エフェソス・パムッカレ・アンタルヤ・ペルゲ・シデ・アスペンドス・ケコワ・カッパド… |
| t028 | 6 | 6-Day Istanbul & Cappadocia Discovery Tour | 伊斯坦堡+卡帕多奇亞6日遊-2段內陸航班 ISTANBUL+CAPPADOCIA 6 DA… | T-02 イスタンブール･カッパドキア5泊6日 |
| t029 | 7 | 7-Day Best of Turkey Tour: Four Iconic Destin… | 土耳其世界遺產7日遊-2段內陸航班 TURKEY CULTURAL TRIP 7 DAYS |  |
| t030 | 8 | 8-Day Turkey Express Tour: Istanbul to Ephesus | 土耳其精選8日遊-3段內陸航班 TURKEY CLASSIC TOUR 8 DAYS | TM-01 イスタンブール・カッパドキア・エフェソス・パムッカレ7泊8日 |
| t031 | 10 | 10-Day Turkey Heritage Tour: Troy to Cappadoc… | 土耳其中西部10日遊-1段內陸航班 CENTRAL WESTERN TURKEY 10 D… |  |
| t032 | 12 | 12-Day Turkey Highlights Tour: Cappadocia & A… | 土耳其地中海雙珠12日遊-2段內陸航班 ANATOLIA CROSSROADS 12 DA… |  |
| t033 | 4 | 4-Day Istanbul Tour | 伊斯坦堡4日遊 ISTANBUL 4 DAYS TOUR |  |
| t034 | 5 |  | 雅典精華5日遊 GREECE SIGHTSEEING TOUR | アテネツアー4泊5日 |
| t035 | 6 |  | 約旦精選6日遊 AMMAN PETRA 6 DAYS TOUR | アンマン・死海・マダバ・ネボ山・ペトラ・アカバ 6日間 |
| t036 | 10 |  | 土耳其懷古10日遊-1段內陸航班 TURKEY CULTURAL SAFRANBOLU 1… | TL-01 イスタンブール・サフランボル・カッパドキア・パムッカレ・エフェソス９泊10日 |
