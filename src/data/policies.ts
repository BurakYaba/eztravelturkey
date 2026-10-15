/**
 * Site-wide terms the tour pages summarize. The words are copied from the live site's terms and conditions (the same
 * text sits behind every tour page there), not rewritten. They are English in every language for now: zh and jp take
 * their legal text from the old sites in P5.5 instead of a new translation. A change here is a developer task; the
 * per-tour cancellation list lives in the tour document and is edited in Studio.
 */

export const paymentSummary = [
  {
    label: 'Deposit',
    value: '50%',
    text: 'Required at the time of confirmation to secure all travel arrangements.',
  },
  {
    label: 'Balance',
    value: '50%',
    text: 'Due no later than fifteen (15) days before the arrival date, regardless of the booking date.',
  },
  {
    label: 'We accept',
    value: 'Visa, Mastercard, Bank transfer',
    text: 'Card payments may be subject to applicable bank processing fees.',
  },
] as const;

/** Entry and insurance rules every traveler is told about. `kind` picks the icon. */
export const travelRules = [
  {
    kind: 'passport',
    title: 'Passport and visas',
    text: "Each traveler must hold a valid passport with at least six (6) months' validity beyond the intended date of return, unless otherwise required by the destination country. Travelers are solely responsible for obtaining all required visas, travel authorizations, vaccinations and other entry documentation.",
  },
  {
    kind: 'insurance',
    title: 'Travel insurance',
    text: 'Magnificent Travel strongly recommends that all travelers purchase comprehensive travel insurance before departure. Magnificent Travel does not provide travel insurance.',
  },
] as const;
