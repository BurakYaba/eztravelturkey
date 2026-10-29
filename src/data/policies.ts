import type { Locale } from '@/i18n/config';

/**
 * Site-wide terms the tour pages summarize. The words are the sentences of the old 合約與規定 page of eztravelturkey.com, copied and not
 * rewritten. The one exception is the passport rule: the old terms do not mention it, so it is the Magnificent Travel rule translated
 * (a draft for a native speaker). A change here is a developer task; the per-tour cancellation list lives in the tour document
 * and is edited in Studio.
 */

type Policies = {
  payment: readonly { label: string; value: string; text: string }[];
  rules: readonly { kind: 'passport' | 'insurance'; title: string; text: string }[];
};

export const policies: Record<Locale, Policies> = {
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
};
