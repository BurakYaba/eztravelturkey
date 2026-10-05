import type { Combo } from './types';

export const combos: Combo[] = [
  {
    slug: 'turkey-and-greece',
    name: 'Turkey and Greece',
    countries: ['turkey', 'greece'],
    daysMin: 8,
    daysMax: 18,
    fromPriceEUR: 1990,
    route: [
      'Istanbul',
      'Cappadocia',
      'Pamukkale',
      'Ephesus',
      'Rhodes',
      'Crete',
      'Santorini',
      'Mykonos',
      'Athens',
      'Delphi',
    ],
    image: 'cappadocia-balloons',
    image2: 'santorini-domes',
    summary: 'Imperial Istanbul and Cappadocia, then the Greek islands and Athens.',
    intro: [
      'Turkey and Greece share a coastline, a culinary tradition and thousands of years of history. Together they make a trip that moves from Byzantine and Ottoman monuments to the Cyclades without feeling like two separate holidays.',
      'Packages run from 8 to 18 days. Shorter versions pair Istanbul and Cappadocia with Athens and one or two islands. Longer ones add Ephesus, Pamukkale, Rhodes, Crete and Delphi.',
    ],
    pairing:
      'Turkey brings scale and variety: a world capital, a landscape found nowhere else, and some of the best preserved Roman cities. Greece adds slower island days and the classical sites of Athens and Delphi.',
    logistics:
      'We coordinate flights between the two countries, ferries between islands, hotels, transfers and local guides as a single itinerary, so you deal with one team from start to finish.',
    bestTime:
      'May to June and September to October suit both countries. Island ferries run most fully from April to mid October.',
    faqs: [
      {
        q: 'How many days do I need for Turkey and Greece?',
        a: 'Eight days covers one region in each country. Eleven to fourteen days is comfortable for Istanbul, Cappadocia and two Greek islands. Fifteen days or more adds Ephesus, Pamukkale or Crete.',
      },
      {
        q: 'How do we get from Turkey to Greece?',
        a: 'By flight or, on some routes, by ferry. We choose the option that saves the most time on your itinerary and book it for you.',
      },
    ],
  },
  {
    slug: 'turkey-and-egypt',
    name: 'Turkey and Egypt',
    countries: ['turkey', 'egypt'],
    daysMin: 8,
    daysMax: 15,
    fromPriceEUR: 1950,
    route: ['Istanbul', 'Cappadocia', 'Pamukkale', 'Ephesus', 'Cairo', 'Aswan', 'Nile cruise', 'Luxor', 'Abu Simbel'],
    image: 'ephesus',
    image2: 'giza-pyramids',
    summary: 'Byzantine and Roman Turkey, then pharaonic Egypt and a Nile cruise.',
    intro: [
      'Turkey and Egypt are a natural pair for travelers drawn to ancient civilizations. One trip moves from Roman Ephesus and the cave landscapes of Cappadocia to the pyramids and the temples of the Nile.',
      'Packages run from 8 to 15 days and can include a Nile cruise between Aswan and Luxor and an optional excursion to Abu Simbel.',
    ],
    pairing:
      'The two countries show how successive empires shaped the eastern Mediterranean. Turkey covers Hittite, Greek, Roman, Byzantine and Ottoman layers, and Egypt goes further back.',
    logistics:
      'We book the flight between Turkey and Egypt together with the domestic flights in each country, so the route stays efficient.',
    bestTime: 'October to November and March to April are comfortable in both countries.',
    faqs: [
      {
        q: 'Is it too much for one trip?',
        a: 'Not with the right pace. Domestic flights remove long road days, and we can add rest days where you want them.',
      },
    ],
  },
  {
    slug: 'turkey-and-jordan',
    name: 'Turkey and Jordan',
    countries: ['turkey', 'jordan'],
    daysMin: 8,
    daysMax: 14,
    fromPriceEUR: 1995,
    route: ['Istanbul', 'Cappadocia', 'Pamukkale', 'Ephesus', 'Amman', 'Petra', 'Wadi Rum', 'Aqaba', 'Dead Sea'],
    image: 'cappadocia-valley',
    image2: 'petra-treasury',
    summary: 'Cappadocia and Ephesus, followed by Petra, Wadi Rum and the Dead Sea.',
    intro: [
      'Turkey and Jordan combine two landscapes shaped by rock and time: the valleys of Cappadocia and the canyons of Petra and Wadi Rum.',
      'Packages run from 8 to 14 days and can add the Dead Sea and Aqaba.',
    ],
    pairing:
      'Both countries mix monumental ruins with striking natural scenery, so the trip has variety without repeating itself.',
    logistics: 'We arrange the connecting flight, private transfers in Jordan and licensed guides in both countries.',
    bestTime: 'April to May and September to October are comfortable in both countries.',
    faqs: [
      {
        q: 'Is Jordan included on a private basis?',
        a: 'Our Jordan routes are normally private, with a driver and local guides at the main sites.',
      },
    ],
  },
  {
    slug: 'greece-and-egypt',
    name: 'Greece and Egypt',
    countries: ['greece', 'egypt'],
    daysMin: 8,
    daysMax: 15,
    fromPriceEUR: 1995,
    route: ['Athens', 'Mykonos', 'Santorini', 'Delphi', 'Cairo', 'Aswan', 'Nile cruise', 'Luxor', 'Alexandria'],
    image: 'athens-acropolis',
    image2: 'karnak',
    summary: 'Classical Greece and the islands, then Cairo and the Nile.',
    intro: [
      'Greece and Egypt are the two great classical civilizations of the Mediterranean world. This trip joins the Acropolis and the Cyclades to the pyramids and a Nile cruise.',
      'Packages run from 8 to 15 days and can include Delphi and Alexandria.',
    ],
    pairing:
      'Island time in Greece balances the intensive sightseeing days in Egypt, which makes the whole trip easy to enjoy.',
    logistics:
      'We handle the flight between Athens and Cairo, the ferries between the islands, and the Nile cruise in one plan.',
    bestTime: 'April to May and October are the most comfortable months for both.',
    faqs: [
      {
        q: 'Which part should come first?',
        a: 'Many travelers start in Egypt for the intensive sightseeing and finish on a Greek island. We can order the route either way.',
      },
    ],
  },
  {
    slug: 'turkey-greece-egypt-and-jordan',
    name: 'Turkey, Greece, Egypt and Jordan',
    countries: ['turkey', 'greece', 'egypt', 'jordan'],
    daysMin: 7,
    daysMax: 26,
    fromPriceEUR: 2295,
    route: [
      'Istanbul',
      'Cappadocia',
      'Pamukkale',
      'Ephesus',
      'Santorini',
      'Mykonos',
      'Athens',
      'Cairo',
      'Aswan',
      'Luxor',
      'Amman',
      'Petra',
      'Wadi Rum',
    ],
    image: 'istanbul-bosphorus',
    image2: 'petra-siq',
    summary: 'Four countries, one itinerary, planned and supported by a single team.',
    intro: [
      'For travelers who want the full eastern Mediterranean in one journey, we combine Turkey, Greece, Egypt and Jordan into a single itinerary.',
      'Length is flexible, from a focused week to more than three weeks. We build the route around the places you most want to see.',
    ],
    pairing:
      'Each country adds a different chapter: Byzantine and Ottoman Turkey, classical Greece, pharaonic Egypt and the Nabataean world of Jordan.',
    logistics:
      'Four countries means many moving parts. We coordinate international and domestic flights, ferries, hotels, transfers and guides, and you have 24/7 local support on the way.',
    bestTime: 'April to May and late September to October balance the climates of all four countries.',
    faqs: [
      {
        q: 'Can I choose which cities to include?',
        a: 'Yes. The route is built around your interests, travel dates and pace. Tell us what you cannot miss and we will shape the rest.',
      },
    ],
  },
  {
    slug: 'greece-and-jordan',
    name: 'Greece and Jordan',
    countries: ['greece', 'jordan'],
    daysMin: 8,
    daysMax: 14,
    fromPriceEUR: 2225,
    route: ['Athens', 'Mykonos', 'Santorini', 'Amman', 'Petra', 'Jerash', 'Aqaba', 'Wadi Rum'],
    image: 'mykonos',
    image2: 'wadi-rum',
    summary: 'Island days in the Cyclades, then Petra and the Jordanian desert.',
    intro: [
      'Greece and Jordan pair sea and desert. Athens, Mykonos and Santorini give classical sites and island time, and Jordan adds Petra, Jerash and Wadi Rum.',
      'Packages run from 8 to 14 days.',
    ],
    pairing: 'The contrast is the appeal: white villages and blue water, then red rock and open desert.',
    logistics:
      'We book the flight between Athens and Amman, the island ferries, the private transport in Jordan and all hotels.',
    bestTime: 'April to May and September to October suit both destinations.',
    faqs: [
      {
        q: 'Is eight days enough?',
        a: 'Eight days covers Athens, one island, and a short Jordan route including Petra. Ten to fourteen days is more relaxed.',
      },
    ],
  },
];

export const getCombo = (slug: string) => combos.find((c) => c.slug === slug);
