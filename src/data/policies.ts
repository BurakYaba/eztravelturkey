export const cancellationTables = [
  {
    title: 'Individual bookings',
    rows: [
      ['31 days or more before arrival', 'EUR 100 administration fee'],
      ['30 to 21 days', '35% of the land package'],
      ['20 to 14 days', '60% of the land package'],
      ['13 days or less, or no-show', '100%'],
    ],
  },
  {
    title: 'Group bookings (8 or more travelers)',
    rows: [
      ['75 days or more', 'EUR 100 administration fee'],
      ['74 to 60 days', '25%'],
      ['59 to 40 days', '50%'],
      ['39 to 25 days', '75%'],
      ['24 days or less, or no-show', '100%'],
    ],
  },
  {
    title: 'Greece and Turkey cruise packages',
    rows: [
      ['60 to 31 days', '25%'],
      ['30 to 16 days', '50%'],
      ['15 days or less, or no-show', '100%'],
    ],
  },
] as const;

export const paymentSteps = [
  { label: 'Deposit', value: '50%', text: 'Due when your booking is confirmed.' },
  { label: 'Balance', value: '50%', text: 'Due 15 days before your arrival.' },
  {
    label: 'Accepted payments',
    value: 'Visa, Mastercard',
    text: 'Or bank transfer. Your travel specialist sends the details.',
  },
] as const;

export const termsSections = [
  {
    title: 'Passports, visas and travel documents',
    body: "Travelers need a passport valid for at least 6 months. Visas, vaccinations and entry documentation are the traveler's responsibility.",
  },
  {
    title: 'Travel insurance',
    body: 'Insurance is strongly recommended and should cover medical expenses, trip cancellation, flight delays, baggage, personal liability and emergency evacuation. Magnificent Travel does not provide insurance.',
  },
  {
    title: 'Tips, taxes and additional charges',
    body: 'Guide and driver tips, taxes, airport fees, airline fees and city taxes are not included. Gratuities are at your discretion.',
  },
  {
    title: 'Items not included',
    body: 'Room service, laundry, beverages, personal expenses, optional activities, travel insurance, phone charges, mini-bar, visa fees and departure taxes.',
  },
  {
    title: 'Payment schedule',
    body: 'A 50% deposit is due at confirmation and the 50% balance 15 days before arrival. We accept Visa, Mastercard and bank transfer.',
  },
  {
    title: 'Cancellation',
    body: 'Cancellations must be notified in writing by email. A EUR 100 administrative fee applies, and further charges depend on the timing, as set out in the tables below. Domestic flights and ferries are non-refundable once issued.',
  },
  {
    title: 'Responsibilities and limitation of liability',
    body: "Magnificent Travel acts as an intermediary and is not liable for the actions of third-party suppliers. It is not responsible for delays, cancellations, weather, force majeure or mechanical issues, and reserves the right to substitute services. Travelers bear additional expenses arising from circumstances beyond our control. We are not liable for lost or damaged luggage or personal belongings, and optional activities are undertaken at the traveler's own risk.",
  },
] as const;
