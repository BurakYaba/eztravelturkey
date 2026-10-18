# Hesap sahipliği matrisi (D31, P6.13)

Amaç: hangi hizmet kimin hesabında, kim yönetici, teslimde kime geçecek. **Boş bırakılan hücreleri proje sahibi doldurur**; buradaki bilgiler yalnızca depodan ve görüşmelerden doğrulanabilenlerdir. Parola, token ve anahtar bu belgeye **yazılmaz**.

| Hizmet | Ne için | Şu an sahibi / hesap | Yöneticiler | Teslimde olması gereken | Durum |
|---|---|---|---|---|---|
| GitHub | kod, CI, yedek iş akışları | `BurakYaba/magnificenttravel` (özel depo) | Burak | müşterinin kuruluşuna aktarım veya müşteriye `admin` | ☐ karar |
| Vercel | barındırma, dağıtım | `shagrimoka` Pro hesabı, ekip `shagrimokas-projects` | shagrimoka | müşteri hesabına proje aktarımı (D29: ticari kullanım şartı) | ☐ karar |
| Sanity | içerik veritabanı ve Studio | proje `aj0pbi0w`, organizasyon: ? | ? (Free planda tüm kullanıcılar Administrator) | müşteri ekibi yönetici, geliştirici davetli | ☐ doldur |
| Sanity API token'ları | içe aktarma, yedek, temizlik | `import` (Editor, yerelde `.env.local`), eski `spike` token'ı değiştirildi | Burak | ayrı token'lar: `github-backup` (Viewer), `github-cleanup` (Editor), `vercel-preview` (Viewer, `SANITY_PREVIEW_TOKEN`); işi biten token silinir | ☐ oluştur |
| Alan adları | `magnificenttravel.com`, `torukoryoko.com`, `eztravelturkey.com` | Turkticaret.net, müşteri; kayıt süreleri 2031 (D38) | müşteri | müşteri; DNS değişikliği için yetki | ☐ DNS erişimi |
| DNS (ad sunucuları) | A/MX/CNAME kayıtları | `netportbilisim.com` ad sunucuları (eski ajans) | ? | Cloudflare veya Vercel DNS'e taşınma kararı (D21, D39) | ☐ karar |
| E-posta kutuları | `info@` vb. | eski sunucu (`mail.magnificenttravel.com`) | eski ajans | D39 (A seçeneği: yayın için yerinde kalır) | ☐ müşteri yanıtı |
| Cloudflare Turnstile | form spam koruması | anahtarlar Vercel'de; hangi Cloudflare hesabı: ? | ? | müşteri hesabı veya ortak | ☐ doldur |
| Brevo / Resend | form e-postası (D41, en sonda) | henüz açılmadı | – | gönderen alan adı doğrulaması ile müşteri hesabı | ☐ P9.3 |
| Google Search Console | arama performansı | müşteri mülkü `https://www.magnificenttravel.com/`; erişim 2026-09-29'da verildi | müşteri | yayın öncesi zh/jp mülklerinin eklenmesi | ☐ P8.5 |
| Google Analytics 4 | trafik ölçümü | EN sitede `G-E8XLPNE302`; müşteri property'si, erişim verildi | müşteri | tek property mi, dil başına mı (D20) | ☐ P8.6 |
| Google Tag Manager | etiketler | `GTM-55HWFMHR` (EN sitede) | müşteri | yeniden kullanılıp kullanılmayacağı (D20) | ☐ P8.6 |
| OpenSEO | anahtar kelime/SERP araştırması | proje `b2ab0092-...`, 500 kredi, Burak'ın hesabı | Burak | geliştirici aracı, teslim gerekmez | ✓ |
| Depositphotos | satın alınmış görseller | müşteri hesabı | müşteri | lisans kaydı: `docs/image-licenses.md` | ✓ |
| Tripadvisor | yorum rozeti ve bağlantı | müşteri hesabı | müşteri | – | ✓ |

**Teslim kuralı:** müşteri olmadan devredilemeyen tek şey alan adı DNS'i ve e-posta kutularıdır (D38, D39). Diğer hizmetler, müşteri hesap açtıktan sonra aktarılır; aktarmadan önce `README`/plandaki ortam değişkenleri listesi (`.env.example`) yeni hesapta tekrar girilir.

**Vercel'de bulunması gereken ortam değişkenleri (Production):** `SANITY_REVALIDATE_SECRET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`; taslak önizleme için `SANITY_PREVIEW_TOKEN` (Viewer token); editör yönlendirmelerinin otomatik yayını için `VERCEL_DEPLOY_HOOK_URL` (Vercel → Settings → Git → Deploy Hooks, dal `main`). Hiçbirinin değeri depoya yazılmaz.
