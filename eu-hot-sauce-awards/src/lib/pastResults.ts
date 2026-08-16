import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PREVIOUS_COMPETITION_YEAR } from "@/lib/config";
import { slugify, slugifyMaker } from "@/lib/categories";

export interface ResultRow {
  code: string;
  entry_name: string;
  company_name: string;
  country: string | null;
  category: string;
  award: string | null;
  position: number | null;
  score: string | number | null;
  product_image_url: string | null;
  contact_name: string | null;
}

// Public-safe: past_results has an explicit "Allow public read access" RLS
// policy. suppliers/sauces do not (they hold PII) — never query them here.
export async function getYearEntrants(): Promise<ResultRow[]> {
  const supabase = createClient(cookies());
  const { data } = await supabase
    .from("past_results")
    .select(
      "code, entry_name, company_name, country, category, award, position, score, product_image_url, contact_name"
    )
    .eq("year", PREVIOUS_COMPETITION_YEAR)
    .eq("area", "EURO");
  return (data as ResultRow[]) ?? [];
}

export interface MakerSummary {
  slug: string;
  company_name: string;
  country: string | null;
  categories: string[];
  gold: number;
  silver: number;
  bronze: number;
  bestScore: number;
  bestRow: ResultRow;
}

export function medalTier(award: string | null): "gold" | "silver" | "bronze" | null {
  if (!award) return null;
  if (award.startsWith("GOLD")) return "gold";
  if (award === "SILVER") return "silver";
  if (award === "BRONZE") return "bronze";
  return null;
}

export function summarizeMakers(rows: ResultRow[]): MakerSummary[] {
  const byMaker = new Map<string, ResultRow[]>();
  for (const row of rows) {
    const key = slugifyMaker(row.company_name);
    if (!byMaker.has(key)) byMaker.set(key, []);
    byMaker.get(key)!.push(row);
  }

  return Array.from(byMaker.entries()).map(([slug, makerRows]) => {
    const sorted = [...makerRows].sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
    const best = sorted[0];
    return {
      slug,
      company_name: best.company_name,
      country: best.country,
      categories: Array.from(new Set(makerRows.map((r) => r.category))),
      gold: makerRows.filter((r) => medalTier(r.award) === "gold").length,
      silver: makerRows.filter((r) => medalTier(r.award) === "silver").length,
      bronze: makerRows.filter((r) => medalTier(r.award) === "bronze").length,
      bestScore: Number(best.score),
      bestRow: best,
    };
  });
}

export interface CountrySummary {
  slug: string;
  country: string;
  makers: number;
  medals: number;
  gold: number;
  silver: number;
  bronze: number;
  bestRow: ResultRow;
}

export function summarizeCountries(rows: ResultRow[]): CountrySummary[] {
  const byCountry = new Map<string, ResultRow[]>();
  for (const row of rows) {
    if (!row.country) continue;
    if (!byCountry.has(row.country)) byCountry.set(row.country, []);
    byCountry.get(row.country)!.push(row);
  }

  return Array.from(byCountry.entries())
    .map(([country, countryRows]) => {
      const sorted = [...countryRows].sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
      return {
        slug: slugify(country),
        country,
        makers: new Set(countryRows.map((r) => slugifyMaker(r.company_name))).size,
        medals: countryRows.length,
        gold: countryRows.filter((r) => medalTier(r.award) === "gold").length,
        silver: countryRows.filter((r) => medalTier(r.award) === "silver").length,
        bronze: countryRows.filter((r) => medalTier(r.award) === "bronze").length,
        bestRow: sorted[0],
      };
    })
    .sort((a, b) => b.makers - a.makers);
}
