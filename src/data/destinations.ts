import type { CountryId, Destination } from './types';

export const destinations: Destination[] = [
  {
    id: 'turkey',
    name: 'Turkey',
    tagline: 'History lives here',
    summary: 'Imperial Istanbul, the fairy chimneys of Cappadocia, Ephesus and the white terraces of Pamukkale.',
    intro: [
      'Magnificent Travel was founded in Istanbul in 1997, and Turkey is where our guides, drivers and hotel partners are based. Itineraries here are planned by people who live along the route.',
      'Most first journeys combine Istanbul, Cappadocia, Ephesus and Pamukkale. Short trips of 3 to 5 days focus on two or three regions, while 10 to 15 day journeys add the Mediterranean coast, Gallipoli, Troy or Pergamon.',
    ],
    image: 'istanbul-skyline',
    heroImage: 'istanbul-skyline',
    bestTime: 'April to June and September to October for sightseeing. Turkey can be visited all year.',
    currency: 'Turkish lira',
    highlights: [
      {
        name: 'Istanbul',
        blurb: 'Hagia Sophia, the Hippodrome, the Grand Bazaar and the Bosphorus.',
        image: 'hagia-sophia',
      },
      {
        name: 'Cappadocia',
        blurb: 'Valleys of fairy chimneys, cave churches and underground cities.',
        image: 'cappadocia-balloons',
      },
      { name: 'Ephesus', blurb: 'The Library of Celsus and one of the best preserved Roman cities.', image: 'ephesus' },
      { name: 'Pamukkale', blurb: 'White travertine terraces beside the ruins of Hierapolis.', image: 'pamukkale' },
    ],
    whyGo: [
      '21 UNESCO World Heritage Sites and thousands of years of layered history',
      'Domestic flights keep long distances short, so more time is spent sightseeing',
      'Licensed English-speaking guides on every tour',
    ],
    faqs: [
      {
        q: 'How many days do I need in Turkey?',
        a: 'Four days is enough for Cappadocia, Pamukkale and Ephesus. Eight days adds Istanbul and removes the rush. Ten days or more suits travelers who want the coast or a slower pace.',
      },
      {
        q: 'Is it better to visit in spring or autumn?',
        a: 'April to June and September to October bring comfortable temperatures for walking ancient sites. Summer is hot inland, and winter brings snow to Cappadocia, which many travelers find beautiful.',
      },
      {
        q: 'Can I add a hot air balloon ride?',
        a: 'Yes. A balloon flight over Cappadocia is an optional extra on our Turkey tours. Flights depend on weather, so we recommend booking early in peak season and keeping a spare morning.',
      },
    ],
    hasTours: true,
  },
  {
    id: 'greece',
    name: 'Greece',
    tagline: 'Islands and ancient wonders',
    summary: 'Athens and the Acropolis, Mykonos, Santorini and the Cyclades by ferry.',
    intro: [
      'Greece rewards a balanced plan: a short, guided stay in Athens for the ancient world, then unhurried days on the islands. Our packages include the high-speed ferries so the logistics are handled for you.',
      'The main tour season runs from April to mid October. We arrange private and small group formats, with hotels chosen for location and quality.',
    ],
    image: 'santorini-domes',
    heroImage: 'santorini-sunset',
    bestTime: 'April to October, with the warmest sea in July to September.',
    currency: 'Euro',
    highlights: [
      { name: 'Athens', blurb: 'The Acropolis, the Parthenon and the Acropolis Museum.', image: 'athens-acropolis' },
      {
        name: 'Mykonos',
        blurb: 'Windmills, Mykonos Town and beaches, with an optional trip to Delos.',
        image: 'mykonos',
      },
      {
        name: 'Santorini',
        blurb: 'Caldera views, whitewashed villages and the Fira to Oia walk.',
        image: 'santorini-sunset',
      },
      { name: 'Naxos', blurb: 'Quieter beaches and the Portara gate on our Cyclades cruise.', image: 'naxos' },
    ],
    whyGo: [
      'Speed ferry tickets and port transfers are included in island packages',
      'Free days on the islands are built into the plan, not squeezed out',
      'Easy to pair with Turkey, Egypt or Jordan',
    ],
    faqs: [
      {
        q: 'How do we travel between the islands?',
        a: 'By high-speed ferry. Tickets between Athens, Mykonos and Santorini are included in our island packages, along with transfers to and from each port.',
      },
      {
        q: 'Which islands should a first visit include?',
        a: 'Mykonos and Santorini give two very different moods in one trip. Travelers who want fewer crowds often add Naxos or Paros.',
      },
      {
        q: 'Is Greece suitable outside summer?',
        a: 'Athens is excellent in spring and autumn. Island ferries and some hotels reduce service from late October, which is why our island tours run from April to mid October.',
      },
    ],
    hasTours: true,
  },
  {
    id: 'egypt',
    name: 'Egypt',
    tagline: 'Land of the pharaohs',
    summary: 'The pyramids of Giza, a Nile cruise from Aswan to Luxor and the temples of Abu Simbel.',
    intro: [
      'Egypt works best with a plan that mixes the big monuments with comfortable logistics. Our private tours pair Cairo with a full-board Nile cruise, and domestic flights save the long road days.',
      'Egyptologist guides accompany all sightseeing, in English or Spanish, in private air-conditioned vehicles.',
    ],
    image: 'giza-pyramids',
    heroImage: 'sphinx',
    bestTime: 'October to April for cooler sightseeing. Tours run daily all year.',
    currency: 'Egyptian pound',
    highlights: [
      {
        name: 'Giza and Saqqara',
        blurb: 'The three pyramids, the Sphinx and the Step Pyramid of Djoser.',
        image: 'sphinx',
      },
      {
        name: 'Nile cruise',
        blurb: 'Three nights between Aswan and Luxor with temples at Kom Ombo and Edfu.',
        image: 'nile-cruise',
      },
      { name: 'Luxor', blurb: 'Karnak, Luxor Temple and the Valley of the Kings.', image: 'karnak' },
      {
        name: 'Abu Simbel',
        blurb: 'The temples of Ramses II, as an optional early excursion from Aswan.',
        image: 'abu-simbel',
      },
    ],
    whyGo: [
      'Egyptologist guides and private transport throughout',
      'A full-board Nile cruise removes daily packing and transfers',
      'Two domestic flights replace long overland days',
    ],
    faqs: [
      {
        q: 'Is a Nile cruise worth including?',
        a: 'For most first visits, yes. It links Aswan and Luxor, covers Kom Ombo and Edfu on the way, and you unpack once for three nights.',
      },
      {
        q: 'Do I need a visa?',
        a: 'Entry rules depend on your nationality and change from time to time. Visa fees are not included in our tours, so please check the current rules for your passport before booking.',
      },
      {
        q: 'Can Abu Simbel be added?',
        a: 'Yes. It is offered as an optional early morning excursion from Aswan and can be built into a customized itinerary.',
      },
    ],
    hasTours: true,
  },
  {
    id: 'jordan',
    name: 'Jordan',
    tagline: 'Ancient mysteries await',
    summary: 'Petra, Wadi Rum, Jerash and the Dead Sea on a private route with local guides.',
    intro: [
      "Jordan is compact, so a week covers the Roman ruins of the north, the Desert Castles, the King's Highway and the south. Our classic route gives northern Jordan more time than most short itineraries before heading to Petra and Wadi Rum.",
      'Private transport with an English-speaking driver is standard, with local guides at Jerash and Petra.',
    ],
    image: 'petra-treasury',
    heroImage: 'petra-siq',
    bestTime: 'Spring and autumn are the most comfortable seasons. Summers are hot in the south.',
    currency: 'Jordanian dinar',
    highlights: [
      {
        name: 'Petra',
        blurb: 'The Siq, the Treasury and a day to explore the rock-cut city.',
        image: 'petra-treasury',
      },
      { name: 'Wadi Rum', blurb: 'A 4x4 desert safari through canyons and dunes.', image: 'wadi-rum' },
      { name: 'Jerash', blurb: 'One of the best preserved Roman provincial cities.', image: 'jerash' },
      { name: 'Dead Sea', blurb: 'Float in mineral-rich water at the lowest point on Earth.', image: 'dead-sea' },
    ],
    whyGo: [
      'Petra and Wadi Rum in one comfortable route',
      'Private vehicle, entrance fees and daily mineral water included',
      'Pairs naturally with Turkey, Greece or Egypt',
    ],
    faqs: [
      {
        q: 'How long should I spend in Petra?',
        a: 'One full day is the minimum. The Siq and the Treasury are only the start, and there are tombs, temples and viewpoints beyond.',
      },
      {
        q: 'Is a guide included?',
        a: 'Our 7-day Jordan tour includes an English-speaking driver throughout and local English-speaking guides at Jerash and Petra.',
      },
      {
        q: 'Can I combine Jordan with other countries?',
        a: 'Yes. Turkey and Jordan, Greece and Jordan, and a four-country route are among our most requested combinations.',
      },
    ],
    hasTours: true,
  },
  {
    id: 'morocco',
    name: 'Morocco',
    tagline: 'Vibrant cultures',
    summary: 'Imperial cities, medinas, blue Chefchaouen and the Sahara, planned to order.',
    intro: [
      'Morocco is arranged as a tailor-made journey. Tell us how long you have and what you want to see, and we will draft a route through the imperial cities, the souks and the desert.',
      'Our team coordinates Morocco alongside Turkey, Greece, Egypt and Jordan, so it can be added to a multi-country trip.',
    ],
    image: 'marrakech-souk',
    heroImage: 'marrakech-koutoubia',
    bestTime: 'Spring and autumn for most routes. The desert is best outside midsummer.',
    currency: 'Moroccan dirham',
    highlights: [
      { name: 'Marrakech', blurb: 'The medina, the souks and the Koutoubia Mosque.', image: 'marrakech-koutoubia' },
      { name: 'Chefchaouen', blurb: 'The blue-washed mountain town.', image: 'chefchaouen' },
      { name: 'Sahara', blurb: 'Camel rides and dunes near Merzouga.', image: 'sahara-camels' },
      { name: 'Souks and craft', blurb: 'Lanterns, ceramics, leather and spices.', image: 'marrakech-souk' },
    ],
    whyGo: [
      'A different mood from the eastern Mediterranean routes',
      'Planned individually, with no fixed departure to fit around',
      'Can be added to a multi-country itinerary',
    ],
    faqs: [
      {
        q: 'Do you have fixed Morocco tours?',
        a: 'Not at the moment. Morocco is planned individually, so there are no set prices to compare. Send us your dates and interests and we will reply with a proposal.',
      },
      {
        q: 'When should I go?',
        a: 'Spring and autumn are comfortable for cities and the desert. Tell us your dates and we will advise.',
      },
    ],
    hasTours: false,
  },
];

export const getDestination = (id: string) => destinations.find((d) => d.id === id);
export const countryName = (id: CountryId) => destinations.find((d) => d.id === id)?.name ?? id;
