p = 'src/data/policies.ts'
s = open(p, encoding='utf8').read()
header_old = s[: s.index('export const paymentSummary')]
new_header = '''import type { Locale } from '@/i18n/config';

/**
 * Site-wide terms the tour pages summarize, in every language. Each language's words are the sentences of that site's own terms
 * page (the same company, the same terms): English from the live English terms and conditions, Chinese from the old
 * 合約與規定 page, Japanese from the old 利用規約およびキャンセルポリシー page, copied and not rewritten. The one exception is the Chinese
 * passport rule: the old Chinese terms do not mention it, so it is the English rule translated (a draft for a native speaker).
 * A change here is a developer task; the per-tour cancellation list lives in the tour document and is edited in Studio.
 */

'''
s = new_header + s[len(header_old):]
s = s.replace("export const paymentSummary = [", "const paymentSummary = [").replace("export const travelRules = [", "const travelRules = [")
s += '''
type Policies = {
  payment: readonly { label: string; value: string; text: string }[];
  rules: readonly { kind: 'passport' | 'insurance'; title: string; text: string }[];
};

export const policies: Record<Locale, Policies> = {
  en: { payment: paymentSummary, rules: travelRules },
  zh: {
    payment: [
      { label: '訂金', value: '50%', text: '行程預訂確認後，在預訂行程時收取至少50%或全額費用。' },
      { label: '尾款', value: '50%', text: '全額費用最遲在行程出發15天前付清。' },
      { label: '可用付款方式', value: 'Visa、Mastercard', text: '我們接受VISA或MASTER信用卡付款。' },
    ],
    rules: [
      {
        kind: 'passport',
        title: '護照與簽證',
        text: '每位旅客須持有效護照，護照有效期須在預計返國日之後至少六 (6) 個月以上，除非目的地國另有規定。旅客須自行負責取得所有必要的簽證、旅行許可、疫苗接種及其他入境文件。',
      },
      {
        kind: 'insurance',
        title: '旅遊保險',
        text: '我們不負責個人旅遊意外險，強烈建議在貴國購買個人健康險、意外險、行李險以及其他相關保險。',
      },
    ],
  },
  jp: {
    payment: [
      { label: 'デポジット', value: '50%', text: '予約確定の際に、すべてのサービスを確保するため50%のデポジットが必要です。' },
      { label: '残金', value: '50%', text: '残り50%の最終支払いは到着の15日前までに行ってください。' },
      { label: 'お支払い方法', value: 'Visa・Mastercard', text: 'クレジットカードはVISAおよびMASTERCARDが利用可能です。' },
    ],
    rules: [
      {
        kind: 'passport',
        title: 'パスポートとビザ',
        text: '各旅行者は、有効期限が少なくとも6ヶ月以上残っている有効なパスポートを持っている必要があります。旅行者は訪問国の入国要件やビザ取得に関して責任を負います。',
      },
      {
        kind: 'insurance',
        title: '旅行保険',
        text: 'トルコ旅行は、旅行中の損失や治療費に対して保険を提供しません。旅行者は健康や手荷物の紛失に備えて自身で旅行保険に加入することを推奨します。',
      },
    ],
  },
};
'''
open(p, 'w', encoding='utf8').write(s)

p = 'src/components/pages/TourDetail.tsx'
s = open(p, encoding='utf8').read()


def rep(a, b):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, 1)


rep("import { paymentSummary, travelRules } from '@/data/policies';", "import { policies } from '@/data/policies';")
i = s.index("  // The payment terms and the passport and insurance rules")
j = s.index("  const hasInclusions")
s = s[:i] + "  // Payment terms and the passport and insurance rules: the words of each language's own terms page (src/data/policies.ts).\n  const english = lang === 'en';\n  const { payment: paymentSummary, rules } = policies[lang];\n" + s[j:]
rep("    ...(english ? [{ id: 'payment', label: t.tabs.payment }] : []),", "    { id: 'payment', label: t.tabs.payment },")
rep("{english && (\n            <TourPanel id=\"payment\"", "{(\n            <TourPanel id=\"payment\"") if "{english && (\n            <TourPanel id=\"payment\"" in s else None
open(p, 'w', encoding='utf8').write(s)
print('ok')
