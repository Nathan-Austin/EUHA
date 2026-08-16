// Real, vetted maker bios for a handful of EHSA 2026 Gold medallists — sourced
// from the European Heat Council's press kit (../EHC/ehc/lib/ehsa/winner-profiles.ts),
// which traces every fact to the signed-off release text and the maker's own
// words. English copy only (EUHA is English-language); quotes are verbatim.
// Keyed by the EUHA maker slug (slugifyMaker(company_name) against past_results),
// which for five of these differs from the short internal slug EHC uses.
//
// Only these 10 makers have real prose — everyone else on /maker/[slug] gets
// the auto-generated factual fallback. Don't invent bios for the rest.

export interface MakerProfile {
  makerPerson: string;
  region: string;
  intro: string;
  story: string[];
  sauceNote: string;
  peppers: string;
  pairing?: string;
  quote?: { text: string; attrib: string };
  find: { label: string; url: string }[];
}

export const MAKER_PROFILES: Record<string, MakerProfile> = {
  ornitodrinko: {
    makerPerson: 'Roberto Colnaghi',
    region: 'Brembate, in the province of Bergamo, northern Italy',
    intro: 'A first-year kitchen project that took Gold in one of the hardest categories the awards run, first time out.',
    story: [
      "Ornitodrinko is Roberto Colnaghi's own kitchen project in Brembate, built around fermentation rather than heat-chasing. Chilies grown from seed in Lombardy soil, fermented over weeks, bottled by hand in small batches.",
      'It is early days: a growing range of sauces still in development, no shop or website yet, and Instagram as the only public channel. Which makes a Gold, first time out, in the BBQ Chili Sauce category all the more striking.',
    ],
    sauceNote: 'Smoked Ananas BBQ is smoked pineapple and fermented chili: sweet and smoky up front, with the acidity long fermentation gives it. A tropical-meets-grill take that pushes BBQ well beyond the ketchup-and-sugar version.',
    peppers: "Chili grown and fermented from Roberto's own seed. The variety is not publicly disclosed.",
    pairing: 'Made for grilled meats, burgers and BBQ.',
    quote: {
      text: 'We grow, ferment and bottle everything ourselves, starting from the seed, so seeing this process recognized at a European level is incredible. Ornitodrinko has always been about patience, experimentation and real craft across a growing range of sauces, and this result means a lot to us.',
      attrib: 'Roberto Colnaghi, Ornitodrinko',
    },
    find: [{ label: 'Instagram @ornitodrinko', url: 'https://instagram.com/ornitodrinko' }],
  },

  'pandemonic-hot-sauce': {
    makerPerson: 'Karol Wojciechowski',
    region: 'Berlin, Germany, with the chilies grown in Poland',
    intro: 'The only producer to take two Best in Category in one year, judged blind: a Berlin chef who grows his own organic chilies on a family farm in Poland.',
    story: [
      "Pandemonic is Berlin chef Karol Wojciechowski's label, an alumnus of the city's two-Michelin-star Fischers Fritz, who grows his own organic chilies on a family farm in Poland and ships them to Berlin to ferment and bottle by hand.",
      'Small batches, a three-month natural fermentation, recipes built for flavour over Scoville. Chocoberrie and the chili oil Chili Chrisp both took Gold and Best in Category, two very different briefs from the same producer in the same year.',
    ],
    sauceNote: 'Chocoberrie is a fermented chocolate-Habanero sauce built like a restaurant pastry section: cocoa for depth, beet syrup for body, blackberry and blackcurrant for lift, with apple, red onion and sherry vinegar. Deep brown, sweet berries up front, dark cocoa underneath, the Habanero behind.',
    peppers: "Chocolate Habanero, single-variety, organic, from Karol's family farm in Poland.",
    pairing: 'Built for cooking, not collecting.',
    find: [{ label: 'pandemonic.com.pl', url: 'https://pandemonic.com.pl' }],
  },

  munnvold: {
    makerPerson: 'Kristoffer Vold',
    region: 'Gamlebyen, Oslo, Norway',
    intro: 'Twelve years in, from a Grønland kitchen: Best in Category against the deepest field of the year.',
    story: [
      "MUNNVOLD is Kristoffer Vold's kitchen project in Gamlebyen, Oslo: fermented, all-natural, gluten-free and vegan. It started in 2014 with a habanero sauce called Haba Nekro and launched as a brand in 2016.",
      'Stocked at Gutta på Haugen and poured into Bloody Marys at Kniven, Vaterland and Tons of Rock. Munnvold Yuzu topped the Medium Chili Sauce category, the deepest field at EHSA 2026 with 70 producers entering. Kristoffer is also a black-metal drummer, and the aesthetics and the taste are part of the same project.',
    ],
    sauceNote: 'Munnvold Yuzu is Japanese yuzu and fermented scotch bonnet, a citrus-led build. Fresh and tangy up front, with the slow-building heat fermented scotch bonnets give.',
    peppers: 'Fermented Scotch Bonnet, single-variety, with Japanese yuzu.',
    pairing: 'Works on sushi and sashimi, grilled fish, oysters, fried chicken or a cucumber salad, wherever bright acidity needs a partner.',
    quote: {
      text: 'Honestly still speechless. MUNNVOLD started in 2014 with a habanero sauce called Haba Nekro, ran out of a Grønland kitchen, and 1st place in a blind European panel is hard to take in. Massive thanks to Gutta på Haugen, Kniven, Vaterland, Tons of Rock and everyone who put the sauce on a shelf or in a Bloody Mary.',
      attrib: 'Kristoffer Vold, MUNNVOLD',
    },
    find: [{ label: 'munnvold.no', url: 'https://munnvold.no' }],
  },

  spicepunk: {
    makerPerson: 'Marcus Pitschke & Mirjam Vogler',
    region: 'Sursee, Canton Lucerne, Switzerland',
    intro: "Europe's best Mild, from a small kitchen in Lucerne's cheese country, topping a 44-sauce field.",
    story: [
      "Spicepunk is Marcus Pitschke and Mirjam Vogler's small-kitchen label in Sursee, built around character rather than heat-chasing. Original recipes, top-quality ingredients, finished by hand in small batches.",
      'Peach Riot took Gold and Best in Category in Mild Chili Sauce, topping a 44-strong field. A second Spicepunk sauce, Red Dynasty, added a Bronze in the same category.',
    ],
    sauceNote: 'Peach Riot is peach, mango and habanero, a fruity-mild take on the category. Fruit sweetness opens up front, the habanero builds gently behind it, and a clean tropical finish ties it together.',
    peppers: 'Habanero, single-variety, with peach and mango.',
    pairing: 'Pulls double duty across a cheese plate, summer salads, tacos and bowls, even breakfast eggs.',
    quote: {
      text: "Honestly still speechless. Spicepunk runs out of a small kitchen in Sursee, by hand, in small batches, and taking 1st place in a blind European panel is hard to take in. Massive thanks to everyone who's been with us on this.",
      attrib: 'Marcus Pitschke, Spicepunk',
    },
    find: [{ label: 'spicepunk.ch', url: 'https://spicepunk.ch' }],
  },

  'pohorc-bio-chili': {
    makerPerson: 'Denis Ledinek',
    region: 'Šentjanža hills near Dravograd, Koroška, Slovenia',
    intro: 'The only certified-organic Slovenian hot honey on the market, from a family farm certified organic for over twenty years.',
    story: [
      "POHORC BIO CHILI is a certified-organic family farm in the Šentjanža hills near Dravograd, run by Denis Ledinek. The chili work started with twelve pepper seedlings, a birthday gift from Denis's brother, and now runs to roughly five hundred plants a season in the greenhouse.",
      "Hand-bottled and small-batch, every plant named from germination to fruit. Hot Honey is built on the village apiary's organic honey and Denis's grandfather's hazelnut vinegar from the family land, the only certified-organic Slovenian hot honey on the market.",
    ],
    sauceNote: "Hot Honey is organic Slovenian honey from the village beehives, apple cider vinegar drawn from Denis's grandfather's old wild hazelnut tree, chili and spices stirred through and infused for several days. Floral and runny on the pour, gentle sweetness up front with the heat building through the back.",
    peppers: 'Chili and spices infused into organic Slovenian honey; the chili variety is not named.',
    pairing: 'Runny and pourable, made to go on everything.',
    quote: {
      text: "We've put Slovenia firmly on the European chili map. What started in a small boutique kitchen on our family organic farm Ržen, driven by passion, bold ideas, and our own handcrafted recipes, grew into something far bigger. This victory belongs to the entire team that poured its energy, talent, and heart into every jar.",
      attrib: 'Denis Ledinek, Pohorc Bio Chili',
    },
    find: [{ label: 'cilipohorc.com', url: 'https://cilipohorc.com' }],
  },

  'gaston-chilli': {
    makerPerson: 'Radovan Fron',
    region: 'Ostrava, Czech Republic',
    intro: 'Four medals across four categories from a husband-and-wife kitchen, led by a Depeche Mode tribute in cuttlefish ink.',
    story: [
      "Gaston Chilli is a craft kitchen in Ostrava run by Radovan Fron and his wife, every bottle passing through Radovan's hands. The chillies are grown for the kitchen by a family-run nursery on the city's outskirts.",
      'Four placements across Freestyle, Extra Hot, Asian Style and Mild, from one kitchen reading four very different briefs. DEAD MORUGA took Best in Category in Freestyle.',
    ],
    sauceNote: "DEAD MORUGA is Radovan's tribute to Depeche Mode, built to be black like a proper DM record: blueberries and cuttlefish ink darken the base, with Moruga peppers carrying the heat. Marine umami and dark fruit under the Moruga, a profile you do not see on the shelf.",
    peppers: 'Trinidad Moruga Scorpion, with blueberries and cuttlefish ink.',
    quote: {
      text: 'We are thrilled that a small producer from Ostrava like us has succeeded against competitors from all over the continent. Handmade production, quality ingredients, and our own original recipes have helped us win four awards.',
      attrib: 'Radovan Fron, Gaston Chilli',
    },
    find: [{ label: 'gastonchilli.cz', url: 'https://gastonchilli.cz' }],
  },

  hotzeg: {
    makerPerson: 'Vlad Rojnik & family',
    region: 'Uccle, Brussels, Belgium',
    intro: 'Two Golds and a Bronze across three categories, from a family kitchen growing its own chilies in the city.',
    story: [
      'HotZeg is a small-batch family kitchen in Uccle, Brussels, run by Vlad Rojnik and his family, growing its own chilies in-house and sourcing the rest from Belgian organic farms.',
      "Three sauces, three medals: CHEE-LY took Best in Category in Asian Style, ADIXION took Gold in Sweet and #6 in Europe's Top 10 overall, and KIKEBICHE a Bronze in Mild, all built without leaving the city.",
    ],
    sauceNote: 'CHEE-LY is lychee folded into chili with a build of Asian aromatics, umami carrying through floral notes. Designed to cross multiple Asian cuisines rather than sit in one.',
    peppers: 'Habanero, single-variety, with lychee (23%), ginger and miso.',
    quote: {
      text: 'We started HotZeg with one goal, prove to ourselves that we could make tasty hot sauces with natural ingredients only and keep the pleasure hand in hand with spiciness.',
      attrib: 'Vlad, HotZeg',
    },
    find: [{ label: 'Instagram @hotzeg.bxl', url: 'https://instagram.com/hotzeg.bxl' }],
  },

  'svilis-pepper-farm': {
    makerPerson: 'Jānis Svilis',
    region: 'Augšligatne, Cēsis, Latvia',
    intro: "One of Latvia's largest chili farms, growing everything it bottles.",
    story: [
      "Svilis Pepper Farm is one of Latvia's largest chili farms, founded by Jānis Svilis after he realised Latvia needed wider availability of chili peppers. From a home kitchen in Riga's Andrejsala, it scaled to a full farm in the Līgatne area where visitors can tour the production and taste the range.",
      'Latvian-grown chillies processed into sauces, spicy jams and pickles, the produce at the centre of the operation. Garlic Chilli took Gold and Best in Category, with two further placings from the same farm.',
    ],
    sauceNote: 'Garlic Chilli is a four-chili flavour bouquet built around a heavy garlic content, around 50% of the sauce is garlic, including Espelette and other hot varieties. Mild-to-medium heat.',
    peppers: 'Espelette and other hot varieties, with around 50% garlic.',
    pairing: 'Pairs with pasta, garlic bread, pizza, roasted potatoes, grilled meat and eggs.',
    quote: {
      text: "Happy to hear our sauce won European Hot Sauce Awards in the garlic chili type sauce category. The award means to us that we are doing something right, and it motivates us to grow forward and make more delicious products. Also, it's nice to become recognisable in the European chili world. Stay Spicy!",
      attrib: 'Jānis Svilis, Svilis Pepper Farm',
    },
    find: [],
  },

  'filfla-chilli-co': {
    makerPerson: 'Malcolm Ricci',
    region: 'Malta',
    intro: 'A Maltese kitchen that reads its chili paste as an olive tapenade, and topped the category.',
    story: [
      'Filfla Chilli Co. is a craft Maltese kitchen run by Malcolm Ricci, built around Mediterranean and Maltese ingredients: sun-dried tomatoes, olives, oranges, carob syrup and extra virgin olive oil. It is named after the small island south of Malta.',
      'Three placements in 2026: Gold and Best in Category in Chili Paste with BUWĠI, plus silver and bronze in Sambal, Chutney and Pickles.',
    ],
    sauceNote: 'BUWĠI is a Maltese chili paste built off green and kalamata olives, sultanas, green chillies and extra virgin olive oil, gently heated and blended by hand. An olive-tapenade backbone with the chili layered through.',
    peppers: 'Green chillies, layered through an olive-tapenade base.',
    pairing: 'Works on bruschetta, grilled fish, lamb plates and the Maltese ftira platter.',
    quote: {
      text: 'We are incredibly proud of this. BUWĠI is a Maltese chili paste, with green and kalamata olives, sultanas, green chillies and extra virgin olive oil. I wanted to create my own version of an olive tapenade, with the sultanas added to bring in a sweet element.',
      attrib: 'Malcolm Ricci, Filfla Chilli Co.',
    },
    find: [],
  },

  'de-vergulde-tong': {
    makerPerson: 'Albert',
    region: 'Volendam, North Holland, Netherlands',
    intro: 'A one-person sambal kitchen with a recipe traced back to 1960s Indonesian sailors.',
    story: [
      'De Vergulde Tong, Dutch for The Gilded Tongue, is a one-person sambal kitchen run by Albert in Volendam. Production is deliberately small, sixty jars made by hand over four hours per batch, no shortcuts on ingredients.',
      "Milde sambal van koksmaat Kees took Gold and Best in Category. The recipe came from Albert's old colleague Kees, now 84, who learned to make sambal in the 1960s from Indonesian colleagues on board ship. The jar honours Kees on the label.",
    ],
    sauceNote: 'Milde sambal van koksmaat Kees is a mild sambal built on fresh Spanish peppers from the Westland greenhouse region. It leads with the pepper itself, the heat dialled back so it sits comfortably on rice, satay or eggs without taking over.',
    peppers: 'Fresh Spanish peppers, sourced through Westlandpeppers.',
    pairing: 'Sits comfortably on rice, satay or eggs.',
    quote: {
      text: 'I am really proud and honored that, in a blind tasting competition, expert European judges and makers within the European hot sauce community have rated my mild sambal as overall winner in the category sambal, chutney and pickles. Thank you so much!',
      attrib: 'Albert, De Vergulde Tong',
    },
    find: [{ label: 'deverguldetong.nl', url: 'https://deverguldetong.nl' }],
  },
};

export function getMakerProfile(slug: string): MakerProfile | null {
  return MAKER_PROFILES[slug] ?? null;
}
