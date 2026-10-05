import type { Faq } from './types';

export const homeFaqs: Faq[] = [
  {
    q: 'What countries does Magnificent Travel operate in?',
    a: 'We organize tours across Turkey, Greece, Egypt, Jordan and Morocco, and combine them into multi-country itineraries.',
  },
  {
    q: 'Is Magnificent Travel a licensed tour operator?',
    a: 'Yes. We are a licensed Turkish tour operator, registered as Macera Tur Turizm Seyahat Acentası Ltd., under License No. 3217.',
  },
  {
    q: 'How long have you been organizing tours?',
    a: 'Since 1997. We have welcomed more than 35,000 travelers on over 2,500 tours.',
  },
  {
    q: 'Do you offer private and small group tours?',
    a: 'Yes. Private tours give you your own guide, vehicle and pace. Small group tours let you share the journey with other travelers. Both can be customized.',
  },
  {
    q: 'Can I change the hotels, sightseeing or pace?',
    a: 'Yes. You can adjust travel dates, hotels and the pace of sightseeing, or add destinations. Tell us what matters and we will redesign the plan.',
  },
  {
    q: 'Do you arrange multi-country tours?',
    a: 'Yes. We coordinate flights, ferries, hotels, transfers and guides across countries as a single itinerary, with one team handling it.',
  },
  {
    q: 'What is included in your tour packages?',
    a: 'Typically hotels with breakfast, airport transfers, licensed guides, sightseeing transport, entrance fees and the domestic flights or ferries the route needs. Each tour page lists exactly what is and is not included.',
  },
  {
    q: 'Are airport transfers and domestic flights included?',
    a: 'On our packages, yes. Transfers and the domestic flights or ferries required by the itinerary are included. International flights are not.',
  },
  {
    q: 'Are your guides licensed?',
    a: 'Yes. We work with licensed, English-speaking local guides, and Spanish-speaking guides on some tours.',
  },
  {
    q: 'How do you choose your hotels?',
    a: 'By location, cleanliness, comfort, service and traveler feedback, and our team visits and reviews properties where possible.',
  },
  {
    q: 'Can you arrange luxury, family, honeymoon or senior-friendly tours?',
    a: 'Yes. Tell us who is traveling and we will adjust the hotels, pace and activities.',
  },
  {
    q: 'What support do I get during the trip?',
    a: 'Our local team is available 24/7 for help with flights, transfers, hotels and daily arrangements.',
  },
  {
    q: 'When is the best time to visit?',
    a: "For Turkey, April to June and September to October. Greece's main tour season runs from April to mid October. Egypt is most comfortable from October to April. Jordan and Morocco are best in spring and autumn.",
  },
  {
    q: 'How do I request a quote or book?',
    a: 'Use the Plan My Trip form or message us on WhatsApp. A travel specialist replies with an itinerary and a quote, with no obligation.',
  },
  {
    q: 'Why book with you instead of an online booking platform?',
    a: 'You deal directly with a local operator that plans the route, books the suppliers and supports you on the ground, and you can customize everything.',
  },
  {
    q: 'Can I combine several countries in one itinerary?',
    a: 'Yes. Popular combinations include Turkey and Greece, Turkey and Egypt, Turkey and Jordan, and a four-country route.',
  },
];

export type FaqGroup = { id: string; title: string; items: Faq[] };

export const faqGroups: FaqGroup[] = [
  {
    id: 'general',
    title: 'General',
    items: [
      {
        q: 'What kinds of tours do you offer?',
        a: 'Private tours, small group tours and fully customized itineraries across Turkey, Greece, Egypt, Jordan and Morocco, including multi-country routes.',
      },
      {
        q: 'How far ahead should I book?',
        a: 'As early as you can, particularly for peak months and for tours with cruises or hot air balloons. Last-minute trips are sometimes possible, so ask us.',
      },
      {
        q: 'Are your tours suitable for families and solo travelers?',
        a: 'Yes. Private tours work well for families, and small group tours are popular with solo travelers. We adjust the pace for children and older travelers.',
      },
      {
        q: 'Can I upgrade hotels?',
        a: 'Yes. Hotel category is one of the first things we adjust, and the quote reflects it.',
      },
      {
        q: 'What does a licensed operator mean for me?',
        a: 'We operate under License No. 3217 issued under the Turkish Ministry of Culture and Tourism, and are a registered travel agency.',
      },
      {
        q: 'Do you speak Spanish?',
        a: 'Spanish-speaking guides are available on some tours, including Egypt. Ask when you request your quote.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments and cancellation',
    items: [
      {
        q: 'How do I confirm and pay?',
        a: 'A 50% deposit confirms the booking and the remaining 50% is due 15 days before arrival. We accept Visa, Mastercard and bank transfer.',
      },
      {
        q: 'What are the cancellation charges?',
        a: 'They depend on timing and the tour type. Individual bookings carry a EUR 100 fee at 31 or more days, then 35%, 60% and 100% as departure approaches. Group bookings and cruises have their own schedules, shown in the Terms and Conditions. Domestic flights and ferries are non-refundable once issued.',
      },
    ],
  },
  {
    id: 'tips',
    title: 'Travel tips',
    items: [
      {
        q: 'What documents do I need?',
        a: 'A passport valid for at least 6 months. Visas and vaccinations are your responsibility, so please check the rules for your nationality.',
      },
      {
        q: 'Should I buy travel insurance?',
        a: 'Yes. Cover medical expenses, trip cancellation, delays, baggage, liability and emergency evacuation. We do not sell insurance.',
      },
      {
        q: 'What plugs and voltage should I bring?',
        a: 'Turkey and Greece use 220 to 240 V with Type C and F plugs. Check your destination before you travel.',
      },
      {
        q: 'Can I take photos at religious sites?',
        a: 'Usually yes outside prayer times, but rules vary. Your guide will tell you where photography is restricted, and modest dress is expected.',
      },
      {
        q: 'What currency do I need?',
        a: 'Turkish lira in Turkey, euro in Greece, Egyptian pound in Egypt, Jordanian dinar in Jordan and Moroccan dirham in Morocco. Cards are widely accepted in cities.',
      },
      {
        q: 'What is not included in tour prices?',
        a: 'Tips, airport and city taxes, drinks, personal expenses, visa fees and optional activities.',
      },
    ],
  },
  {
    id: 'turkey',
    title: 'Turkey',
    items: [
      {
        q: 'Can I use ATMs and cards?',
        a: 'Yes. ATMs are widespread and cards are accepted in cities and tourist areas. Carry some cash for small purchases and tips.',
      },
      {
        q: 'What are museum opening hours?',
        a: 'Museums and sites are generally open from about 9 AM to 5 PM, and some close on one day each week. Your guide plans around this.',
      },
      {
        q: 'Can I use my mobile phone?',
        a: 'Most international phones work. Check roaming charges with your provider, or buy a local SIM or eSIM.',
      },
      {
        q: 'Do I need an international driving permit?',
        a: 'Our tours use private vehicles with drivers. If you plan to rent a car separately, check the requirements for your license.',
      },
    ],
  },
];
