# Eski Çince ve Japonca sitelerin her adresi için karar (P5, D10, D11, 2026-10-17)

P5'in 'bitti sayılır' ölçütü: **her eski zh/jp URL'sinin bir akıbeti olur** (aynı yol / 301 / üst kategori). Betik: `scripts/scrape/redirect-map.mjs`. Çıktı: `data/mapping/redirects-zh.csv`, `redirects-jp.csv` (eski adres, ne olduğu, eylem, yeni adres). Uygulama P7.5'tedir (Vercel yönlendirmeleri); bu dosya onun girdisi.

## Eylemler

| Eylem | Anlamı |
|---|---|
| `same` | Sayfa yeni sitede aynı adreste. Yalnızca alan adı değişir (alan adı düzeyinde tek yönlendirme) |
| `301-page` | Sayfa taşındı veya birleşti: kalıcı yönlendirme, `new_path` sütunundaki sayfaya (turun sekmeleri ana tura; sonunda boşluk olan Japonca klasör boşluksuz adrese) |
| `301-parent` | Sayfa artık yok (müşteri sildi): kalıcı yönlendirme, üstündeki en yakın sayfaya (kategori, ülke, hedefler sayfası) |
| `zh-twin` | `/cn/` (Basitleştirilmiş Çince, D10): `/zh/` karşılığına 301 |
| `301-hub` | Üstünde sayfa da yok: o dilin hedefler sayfası |

## Çince (eztravelturkey.com): 793 adres

| Şu an listeli mi | Tür | Eylem | Adet |
|---|---|---|---|
| müşteri 12 Ekim'de sildi | page | 301-parent | 94 |
| müşteri 12 Ekim'de sildi | tab of a tour | 301-parent | 237 |
| evet | home | same | 1 |
| evet | page | 301-parent | 21 |
| evet | page | same | 72 |
| evet | page | zh-twin | 61 |
| evet | tab of a tour | 301-page | 158 |
| evet | tab of a tour | 301-parent | 30 |
| evet | tab of a tour | zh-twin | 119 |

## Japonca (torukoryoko.com): 441 adres

| Şu an listeli mi | Tür | Eylem | Adet |
|---|---|---|---|
| müşteri 12 Ekim'de sildi | page | 301-parent | 47 |
| müşteri 12 Ekim'de sildi | tab of a tour | 301-parent | 119 |
| evet | home | same | 1 |
| evet | page | 301-page | 7 |
| evet | page | same | 78 |
| evet | tab of a tour | 301-page | 189 |

## Notlar

- Turların alt sayfaları (`/inclusion-rate/`, `/review/`, `/reviews/`, `/tour-itinerary/`, `/itinerary/` ve yazım hatalı `incllusion-rate`, `inclusions-rate`, `includes-rate`): eski sitede **200 dönen ama boş** sayfalardı (başlık sadece "Eztravel Turkey", içerik yok; zh'de 300, jp'de 189 adet). Ana tur sayfası tüm sekmeleri zaten içeriyor. Bu adresler turun kendisine 301 alır; içerikleri taşınmaz.
- Japonca `ギリシャツアー ` klasörünün adının sonunda boşluk vardı (`%20`): yeni adreste boşluk yok, eskisi 301 alır.
- Israel adresleri yok: zh/jp envanterinde Israel içeren adres çıkmadı. Çıksaydı D27 (varsayılan: hedefler sayfasına 301) uygulanırdı.
- `/cn/` sayfaları yalnızca eşleme için arşivlendi (içerik alınmadı): `/cn/x` → `/zh/x` (yoksa üst sayfa).

