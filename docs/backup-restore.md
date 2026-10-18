# Sanity yedeği ve geri yükleme

Sanity'nin Free planında kendi yedeği yok, belge geçmişi de yalnızca 3 gün (P6.7). Bu yüzden iki otomatik yedek var; ikisi de GitHub Actions'ta çalışır ve dosyaları **Actions → ilgili çalıştırma → Artifacts** altında saklar.

| Yedek | İş akışı | Ne zaman | İçerik | Saklama |
|---|---|---|---|---|
| Belgeler | `sanity-backup.yml` / `documents` | her gün 03:15 UTC | tüm belgeler, taslaklar dahil (`production-GÜN.ndjson.gz`, ≈ 1,6 MB) | 30 gün |
| Belgeler + görseller | `sanity-backup.yml` / `pictures` | pazar günleri (elle de başlatılır) | `sanity dataset export` arşivi (≈ 284 MB, 1,5 dk; 2026-10-18 ölçümü) | 8 gün |
| Silme öncesi | `sanity-assets.yml` | "delete" seçilerek elle çalıştırılınca | belgelerin yedeği | 90 gün |

**Bir kerelik kurulum (proje sahibi):**
1. sanity.io/manage → proje `aj0pbi0w` → API → Tokens: rolü **Viewer** olan bir token (`github-backup`) ve rolü **Editor** olan bir token (`github-cleanup`) oluşturun.
2. GitHub → repo → Settings → Secrets and variables → Actions: `SANITY_BACKUP_TOKEN` (Viewer) ve `SANITY_CLEANUP_TOKEN` (Editor) adlarıyla ekleyin. Token'lar hiçbir yere commit edilmez.
3. Actions sekmesinde "Sanity backup" iş akışını **Run workflow** ile bir kez çalıştırıp yeşil bittiğini görün.

GitHub Free'de özel depo için artifact depolaması 500 MB'dir; haftalık görsel yedeği tek kopya tutacak şekilde 8 güne ayarlıdır. Daha uzun saklamak isterseniz arşivi başka bir yere (ör. Google Drive) indirin.

## Yedeğin sağlamlığı (2026-10-18)

`scripts/sanity/backup.mjs` ile alınan yedek canlı veriyle karşılaştırıldı: 1.957 belge, eksik yok, revizyon (`_rev`) farkı yok. Yedeğin içinden belge sayısı okunur; boş dosya hata verir.

## Tek bir belgeyi geri getirmek

1. Yedeği indirin ve açın (`gunzip production-GÜN.ndjson.gz`). Her satır bir JSON belgedir.
2. Belgeyi bulun (ör. `grep '"_id":"tour-en-...' production-GÜN.ndjson > bir.ndjson`).
3. `cd studio` ve `npx sanity dataset import bir.ndjson production --missing` (var olanlara dokunmaz, yalnızca eksik olanı ekler) veya silinmeyen ama bozulan belge için `--replace` (üzerine yazar). **Önce `staging` dataset'inde deneyin.**

## Tüm dataset'i geri yüklemek (felaket senaryosu)

1. Son haftalık tam yedeği (`production-full-GÜN.tar.gz`) indirin.
2. Dataset'i silip yeniden oluşturduysanız (aynı ad: `production`, **public**): `cd studio && npx sanity dataset import ../production-full-GÜN.tar.gz production --replace`.
3. Haftalık yedekten sonraki değişiklikler için en yeni günlük yedeği `--replace` ile üstüne alın (görseller zaten yüklüdür).
4. `npm run check:site` ile siteyi, `node scripts/sanity/verify-import.mjs` ile sayıları doğrulayın.

## Geri yükleme provası

**Yapıldı (kısmen, 2026-10-18):** yedeğin okunabilirliği ve canlı veriyle eşitliği doğrulandı; tam dışa aktarım (284 MB) alındı. **Yapılmadı:** yedeğin `staging` dataset'ine `--replace` ile geri yüklenmesi (otomatik güvenlik denetimi toplu üzerine yazmayı engelledi). Prova kullanıcı tarafından şu komutla yapılır:

```
cd studio
npx sanity login
npx sanity dataset import ../production-full-GÜN.tar.gz staging --replace
SANITY_DATASET=staging node --env-file-if-exists=../.env.local ../scripts/sanity/verify-import.mjs
```

Prova bittiğinde bu satırı "yapıldı (tarih)" olarak güncelleyin; plan P6.7'nin kutusu ancak o zaman işaretlenir.

## Kullanılmayan görseller (P6.16)

`sanity-assets.yml` her pazartesi 04:30 UTC'de **yalnızca rapor** üretir (hiçbir belgenin kullanmadığı, 7 günden eski görseller; Actions çalıştırmasının Summary sayfasında). Silmek için Actions → "Sanity unused assets" → Run workflow → `delete` kutusunu işaretleyin; iş akışı önce belgelerin yedeğini alır, sonra siler. Sınır: yalnızca Sanity içindeki başvurulara bakar. Koda veya başka siteye elle yazılmış bir görsel adresi görünmez. Kodda Sanity görsel adresi sabit yazılmamıştır (2026-10-18 kontrolü).
