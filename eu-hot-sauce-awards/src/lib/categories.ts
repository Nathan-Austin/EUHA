export interface CategoryGroup {
  title: string;
  meta: string;
  categories: string[];
}

// Category grouping matches the mockup's heat-ladder / styles / pantry / wildcard split.
export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    title: "Heat ladder",
    meta: "Mild to extract, 5 categories",
    categories: [
      "Mild Chili Sauce",
      "Medium Chili Sauce",
      "Hot Chili Sauce",
      "Extra Hot Chili Sauce",
      "Extract Based Chili Sauce",
    ],
  },
  {
    title: "Styles & flavours",
    meta: "5 categories",
    categories: ["Sweet", "Chili Honey", "BBQ Chili Sauce", "Asian Style Chili Sauce", "Garlic Chili Sauce"],
  },
  {
    title: "Pantry & condiments",
    meta: "6 categories",
    categories: ["Salts & Seasonings", "Condiments", "Chili Oil", "Chili Crisp", "Chili Paste", "Sambal, Chutney & Pickles"],
  },
];

export const WILDCARD_CATEGORY = "Freestyle";

export const ALL_CATEGORIES = [...CATEGORY_GROUPS.flatMap((g) => g.categories), WILDCARD_CATEGORY];

// Draft copy — not official EHC heat criteria, just enough to point a producer
// at the right category. Review/edit before treating as final.
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Mild Chili Sauce": "Gentle heat, flavor first — approachable for any palate.",
  "Medium Chili Sauce": "A noticeable kick that still lets the flavor lead.",
  "Hot Chili Sauce": "Serious heat, built for people who like to feel it.",
  "Extra Hot Chili Sauce": "Intense heat for dedicated spice lovers.",
  "Extract Based Chili Sauce": "Built around capsaicin extract for maximum, no-compromise heat.",
  Sweet: "Sweetness leads, balanced with just enough heat to keep it interesting.",
  "Chili Honey": "Honey-based chili condiments — for drizzling, glazing, and finishing.",
  "BBQ Chili Sauce": "Barbecue-style sauces — smoky, tangy, tomato or vinegar based.",
  "Asian Style Chili Sauce": "Sauces inspired by East and Southeast Asian chili traditions.",
  "Garlic Chili Sauce": "Garlic-forward chili sauces where the allium leads alongside the heat.",
  "Salts & Seasonings": "Dry chili seasonings, salts, and spice blends.",
  Condiments: "Chili-spiked ketchup, mayo, mustard, and other table condiments.",
  "Chili Oil": "Infused oils — for drizzling, dipping, and cooking.",
  "Chili Crisp": "Crunchy, oil-based condiments loaded with crispy garlic, shallots, or alliums.",
  "Chili Paste": "Concentrated chili pastes for cooking, not just topping.",
  "Sambal, Chutney & Pickles": "Sambals, chutneys, and pickled chili preparations.",
  Freestyle: "Anything that doesn't fit elsewhere — bring your wildcard creation.",
};

// Pepper count for the heat-ladder categories only, in escalating order —
// matches the 🌶️ convention already used across the site (see RohAd.tsx).
export const HEAT_LEVEL: Record<string, number> = {
  "Mild Chili Sauce": 1,
  "Medium Chili Sauce": 2,
  "Hot Chili Sauce": 3,
  "Extra Hot Chili Sauce": 4,
  "Extract Based Chili Sauce": 5,
};

// Typical pepper base per heat-ladder rung — a steer, not a hard rule (e.g. a
// diluted/balanced habanero sauce can still land in Medium). Draft copy, same
// caveat as CATEGORY_DESCRIPTIONS.
export const HEAT_NOTES: Record<string, string> = {
  "Mild Chili Sauce": "Often built on peppers like jalapeño, chipotle, or fresno.",
  "Medium Chili Sauce":
    "Often built on peppers like cayenne, serrano, or bird's eye — sauces using hotter peppers like habanero can also land here if diluted or balanced with other ingredients.",
  "Hot Chili Sauce": "Often built on peppers like habanero, scotch bonnet, or ghost pepper.",
  "Extra Hot Chili Sauce": "Often built on peppers like scorpion pepper, Carolina Reaper, or Pepper X.",
  "Extract Based Chili Sauce": "Uses added capsaicin extract or oleoresin rather than relying on pepper mash alone.",
};

// Small, fixed set of categories — hand-mapped slugs rather than a generic
// slugify(), since a couple of names (e.g. "Sambal, Chutney & Pickles") don't
// reduce to anything obvious automatically.
export const CATEGORY_SLUGS: Record<string, string> = {
  "Mild Chili Sauce": "mild",
  "Medium Chili Sauce": "medium",
  "Hot Chili Sauce": "hot",
  "Extra Hot Chili Sauce": "extra-hot",
  "Extract Based Chili Sauce": "extract-based",
  "BBQ Chili Sauce": "bbq",
  Sweet: "sweet",
  "Chili Honey": "chili-honey",
  "Garlic Chili Sauce": "garlic",
  "Sambal, Chutney & Pickles": "sambal-chutney-pickles",
  "Chili Oil": "chili-oil",
  "Chili Crisp": "chili-crisp",
  Freestyle: "freestyle",
  "Asian Style Chili Sauce": "asian-style",
  "Salts & Seasonings": "salts-seasonings",
  Condiments: "condiments",
  "Chili Paste": "chili-paste",

  // 2027 renamed "Salt & Condiments" -> "Salts & Seasonings" and split "Chili
  // Ketchup" into the broader "Condiments". Kept here (not in CATEGORY_GROUPS,
  // so they no longer appear as selectable/current) purely so their 2026
  // /category/[slug] results pages — real past_results rows under these exact
  // names — keep resolving instead of 404ing.
  "Salt & Condiments": "salt-condiments",
  "Chili Ketchup": "chili-ketchup",
};

export const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([name, slug]) => [slug, name])
);

export function categoryGroupFor(category: string): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find((g) => g.categories.includes(category));
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Maker slugs aren't a fixed set like categories, so this is a best-effort
// slugify + case-insensitive match against company_name. Real limitation:
// the same maker can appear with slightly different capitalisation/spacing
// across years/entries (e.g. "Pandemonic hot sauce" vs "Pandemonic Hot
// Sauce") — this will only match rows whose slug happens to collide.
export function slugifyMaker(name: string): string {
  return slugify(name);
}
