# Lighthouse başlangıç ölçümü: mevcut mock (yerel production build)

Tarih: 2026-10-07 · Kod: `docs/project-plan.md` P0.4 öncesi hâli (branch `docs/project-plan`, kod değişikliği yok) · Yöntem: `next build` + `next start`, Lighthouse CLI, mobil ön ayar, varsayılan kısıtlama (simüle yavaş 4G + 4x CPU), `127.0.0.1` üzerinde.
**Önemli:** yerel sunucu, CDN ve HTTP/2 olmadan çalışıyor ve görsel optimizasyonu ilk istekte yapılıyor. Sonuçlar Vercel'deki gerçek performanstan **kötümser** olabilir. Hedefi doğrulamak için Vercel önizlemesinde yeniden ölçülmeli (P9.1). Tek koşu, TBT gibi metrikler koşular arasında dalgalanır (ana sayfa önceki koşuda 75, bu koşuda 70).

| Sayfa | Performans | Erişilebilirlik | En iyi uygulamalar | SEO | LCP | FCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| `/` | 70 | 100 | 100 | 100 | 5,1 sn | 1,6 sn | 330 ms | 0 |
| `/tours/8-day-turkey-express-istanbul-to-ephesus` | 80 | 100 | 100 | 100 | 4,9 sn | 1,1 sn | 100 ms | 0 |
| `/destinations/turkey` | 80 | 93 | 100 | 100 | 4,8 sn | 1,1 sn | 50 ms | 0 |

Hedefler (brif): LCP < 2,5 sn, CLS < 0,1, INP < 200 ms. CLS hedefte; **LCP hedefin yaklaşık iki katı**.

## Gözlemler
- **Ana sayfada LCP öğesi hero görseli.** Yükleme ~0,5 sn sürüyor ama çizilmesi ~1,8 sn gecikiyor ("element render delay"). Görselde `fetchpriority=high` yok. GSAP/ScrollTrigger hero parallax'ı ve ilk JS yükü şüpheli (D26: kaldırılacak, P2.16).
- **Kullanılmayan JavaScript:** sayfa başına ≈ 50-73 KiB tasarruf.
- **`/destinations/turkey` erişilebilirlik 93:** `dl` yapısı hatalı (`definition-list`, `dlitem`): `<dt>`/`<dd>` çiftleri `dl` içinde geçerli sarmalayıcıda değil (P3.12).
- Toplam aktarım boyutu ≈ 660-690 KiB.

Ham JSON dosyaları geçici klasörde tutuldu, repoya konmadı. Aynı ölçüm P4.2 ve P9.1'de tekrarlanacak.
