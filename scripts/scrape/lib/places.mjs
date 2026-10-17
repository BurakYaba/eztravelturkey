// Place names in the three languages, so that the same tour can be recognised across the old sites (docs/project-plan.md P5.4).
// `id` is the city the tour is about; sights that belong to a city (the Giza pyramids, Mount Nebo) map to it. Names are the
// spellings the old sites actually use, collected from their routes, titles and itineraries.

/** [id, country, [names...]] where each name is matched as plain text, in any language. */
const places = [
  // Turkey
  ['istanbul', 'turkey', ['istanbul', '伊斯坦堡', '伊斯坦布爾', '伊斯坦布尔', 'イスタンブール', 'イスタンブル']],
  ['cappadocia', 'turkey', ['cappadocia', 'cappadoc', '卡帕多奇亞', '卡帕多奇亚', 'カッパドキア']],
  ['ephesus', 'turkey', ['ephesus', '艾菲索斯', '以弗所', '艾菲斯', 'エフェソス', 'エフェス']],
  ['pamukkale', 'turkey', ['pamukkale', '棉花堡', 'パムッカレ']],
  ['kusadasi', 'turkey', ['kusadasi', '庫薩達斯', '庫夏達斯', '库萨达斯', 'クシャダス']],
  ['izmir', 'turkey', ['izmir', '伊茲密爾', '伊兹密爾', 'イズミル']],
  ['antalya', 'turkey', ['antalya', '安塔利亞', '安塔利亚', 'アンタルヤ', 'ペルゲ', 'シデ', 'アスペンドス', 'ケコワ']],
  ['troy', 'turkey', ['troy', 'canakkale', '特洛伊', '恰那卡萊', '恰納卡萊', '恰那卡莱', 'チャナッカレ', 'トロイ', 'gallipoli', '加里波利', 'ガリポリ']],
  ['pergamon', 'turkey', ['pergamon', 'pergamum', '貝爾加馬', '貝加蒙', 'ペルガモン', 'ベルガマ']],
  ['didyma', 'turkey', ['didyma', 'priene', 'miletus', '迪迪瑪', 'ディディマ', 'プリエネ', 'ミレトス']],
  ['safranbolu', 'turkey', ['safranbolu', '番紅花城', 'サフランボル']],
  ['fethiye', 'turkey', ['fethiye', '費特希耶', 'フェティエ']],
  ['bursa', 'turkey', ['bursa', '布爾薩', 'ブルサ']],
  ['alacati', 'turkey', ['alacati', '阿拉恰特', 'アラチャトゥ']],
  ['trabzon', 'turkey', ['trabzon', 'トラブゾン', '特拉布宗']],
  ['hattusha', 'turkey', ['hattusha', 'hattusa', 'ハットゥシャシュ', '哈圖沙']],
  ['nemrut', 'turkey', ['nemrut', 'nemrud', 'ネムルト', '內姆魯特', '尼姆魯特']],
  ['sanliurfa', 'turkey', ['urfa', 'ウルファ', '烏爾法']],
  ['ankara', 'turkey', ['ankara', 'アンカラ', '安卡拉']],
  ['konya', 'turkey', ['konya', 'コンヤ', '孔亞']],
  ['bodrum', 'turkey', ['bodrum', 'ボドルム', '博德魯姆']],
  ['marmaris', 'turkey', ['marmaris', 'マルマリス']],
  // Greece
  ['athens', 'greece', ['athens', '雅典', 'アテネ']],
  ['mykonos', 'greece', ['mykonos', '米科諾斯', '米克諾斯', 'ミコノス']],
  ['santorini', 'greece', ['santorini', '聖托里尼', '聖多里尼', 'サントリーニ']],
  ['crete', 'greece', ['crete', 'heraklion', '克里特', 'クレタ']],
  ['rhodes', 'greece', ['rhodes', '羅德斯', 'ロドス']],
  ['naxos', 'greece', ['naxos', 'ナクソス']],
  ['paros', 'greece', ['paros', 'パロス']],
  ['delphi', 'greece', ['delphi', '岱爾菲', '岱菲爾', '德爾斐', 'デルフィ']],
  ['meteora', 'greece', ['meteora', 'kalambaka', 'kalampaka', '梅特奧拉', '喀蘭帕卡', 'メテオラ', 'カランバカ']],
  ['olympia', 'greece', ['olympia', '奧林匹亞', 'オリンピア']],
  ['samos', 'greece', ['samos', '薩摩斯', 'サモス']],
  ['corinth', 'greece', ['corinth', '科林斯', 'コリントス']],
  ['kefalonia', 'greece', ['kefalonia', 'ケファロニア']],
  ['zakynthos', 'greece', ['zakynthos', 'ザキントス']],
  // Egypt
  ['cairo', 'egypt', ['cairo', '開羅', 'カイロ', 'giza', '吉薩', 'ギザ', 'memphis', '孟菲斯', 'saqqara', '薩卡拉', 'サッカラ', 'khan el', '汗哈利里']],
  ['luxor', 'egypt', ['luxor', '盧克索', '盧索克', 'ルクソール']],
  ['aswan', 'egypt', ['aswan', '亞斯文', '阿斯旺', 'アスワン', 'abu simbel', 'アブシンベル', 'アブ・シンベル', '阿布辛貝']],
  ['hurghada', 'egypt', ['hurghada', '赫爾格達', '胡爾加達', 'フルガダ', 'ハルガダ']],
  ['alexandria', 'egypt', ['alexandria', '亞歷山大', 'アレキサンドリア', 'アレクサンドリア']],
  ['sharm', 'egypt', ['sharm', '沙姆沙伊赫', 'シャルム']],
  // Jordan
  ['amman', 'jordan', ['amman', '安曼', 'アンマン']],
  ['petra', 'jordan', ['petra', '佩特拉', 'ペトラ']],
  ['aqaba', 'jordan', ['aqaba', '亞喀巴', 'アカバ']],
  ['wadirum', 'jordan', ['wadi rum', '瓦迪拉姆', '瓦地倫', 'ワディラム', 'ワディ・ラム']],
  ['deadsea', 'jordan', ['dead sea', '死海']],
  ['jerash', 'jordan', ['jerash', '傑拉什', 'ジェラシュ', 'ジェラシ']],
  ['madaba', 'jordan', ['madaba', 'nebo', '馬德巴', '尼泊山', 'マダバ', 'ネボ山']],
  // Morocco
  ['marrakech', 'morocco', ['marrakech', 'marrakesh', '馬拉喀什', 'マラケシュ']],
  ['fez', 'morocco', ['fez', 'fes', 'フェズ', '菲斯']],
  ['casablanca', 'morocco', ['casablanca', 'カサブランカ', '卡薩布蘭卡']],
  ['rabat', 'morocco', ['rabat', 'ラバト', '拉巴特']],
  ['meknes', 'morocco', ['meknes', 'メクネス']],
  ['chefchaouen', 'morocco', ['chefchaouen', 'シャウエン']],
  ['ouarzazate', 'morocco', ['ouarzazate', 'ワルザザート', 'ワルザザード']],
  ['erfoud', 'morocco', ['erfoud', 'merzouga', 'エルフード', 'メルズーガ', 'sahara', 'サハラ']],
  ['essaouira', 'morocco', ['essaouira', 'エッサウィラ', 'エッサウィラ']],
  ['zagora', 'morocco', ['zagora', 'ザゴラ']],
];

const lower = (s) => s.normalize('NFKC').toLowerCase();

/** Ids of the places named in a text (title, route, stays), in any of the three languages. */
export function placesIn(text) {
  const t = lower(text ?? '');
  return [...new Set(places.filter(([, , names]) => names.some((n) => t.includes(lower(n)))).map(([id]) => id))];
}

export const countryOfPlace = new Map(places.map(([id, country]) => [id, country]));

/** Countries a tour visits, from the cities found in its text. */
export const countriesOfPlaces = (ids) => [...new Set(ids.map((id) => countryOfPlace.get(id)).filter(Boolean))];
