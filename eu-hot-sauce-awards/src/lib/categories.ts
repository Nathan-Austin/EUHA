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
    meta: "5 categories",
    categories: ["Salt & Condiments", "Chili Ketchup", "Chili Oil", "Chili Paste", "Sambal, Chutney & Pickles"],
  },
];

export const WILDCARD_CATEGORY = "Freestyle";

export const ALL_CATEGORIES = [...CATEGORY_GROUPS.flatMap((g) => g.categories), WILDCARD_CATEGORY];

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
  "Chili Ketchup": "chili-ketchup",
  Sweet: "sweet",
  "Chili Honey": "chili-honey",
  "Garlic Chili Sauce": "garlic",
  "Sambal, Chutney & Pickles": "sambal-chutney-pickles",
  "Chili Oil": "chili-oil",
  Freestyle: "freestyle",
  "Asian Style Chili Sauce": "asian-style",
  "Salt & Condiments": "salt-condiments",
  "Chili Paste": "chili-paste",
};

export const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([name, slug]) => [slug, name])
);

export function categoryGroupFor(category: string): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find((g) => g.categories.includes(category));
}

// Maker slugs aren't a fixed set like categories, so this is a best-effort
// slugify + case-insensitive match against company_name. Real limitation:
// the same maker can appear with slightly different capitalisation/spacing
// across years/entries (e.g. "Pandemonic hot sauce" vs "Pandemonic Hot
// Sauce") — this will only match rows whose slug happens to collide.
export function slugifyMaker(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
