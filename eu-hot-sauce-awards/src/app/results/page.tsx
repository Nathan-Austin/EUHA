import Link from "next/link";
import type { Metadata } from "next";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { PREVIOUS_COMPETITION_YEAR } from "@/lib/config";

export const metadata: Metadata = {
  title: "Past Results — European Hot Sauce Awards",
  description: "Browse the archive of past winners from the European Hot Sauce Awards, by year.",
};

// TODO: total submitted entries per year, to show alongside award-winning counts (growth
// story). sauces.competition_year only has data for 2026 (386, confirmed real via direct
// DB query — RLS-locked from anon queries same as the /makers page, so it'd need a static
// snapshot like EUROPEAN_ENTRANTS in page.tsx). 2024/2025 have no total-entries figure
// anywhere in this DB — that column was never backfilled for older years. Come back to
// this once real 2024/2025 totals are sourced (e.g. old spreadsheets, Simon/Neil's
// records) — do not fabricate them in the meantime.
const TOTAL_ENTRIES_BY_YEAR: Record<number, number | null> = {
  2026: 386,
};

async function getAvailableYears() {
  const { cookies } = await import("next/headers");
  const supabase = createClient(cookies());
  const { data } = await supabase.from("past_results").select("year, code");
  const counts = new Map<number, number>();
  for (const row of (data as { year: number; code: string }[]) ?? []) {
    counts.set(row.year, (counts.get(row.year) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year - a.year);
}

export default async function ResultsPage() {
  const years = await getAvailableYears();

  return (
    <div className="bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Results" }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
            The archive
          </p>
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,64px)] uppercase leading-[0.95] text-white">
            Past <span className="bg-[#F5C518] px-2 text-black">results</span>.
          </h1>
          <p className="mt-5 max-w-xl text-sm text-gray-400">
            Every Gold, Silver and Bronze medalist by year — not the full entrant list.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {years.map(({ year, count }) => (
              <Link
                key={year}
                href={`/results/${year}`}
                className="flex flex-col gap-3 border-[3px] border-black bg-white p-8 text-center transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="font-[family-name:var(--font-archivo-black)] text-5xl uppercase">
                  {year}
                  {year === PREVIOUS_COMPETITION_YEAR && (
                    <span className="ml-2 align-top text-xs text-black/40">Latest</span>
                  )}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
                  {count} award-winning entries
                </span>
                <span className="text-xs uppercase tracking-[0.1em] text-black/35">
                  {TOTAL_ENTRIES_BY_YEAR[year] ? `${TOTAL_ENTRIES_BY_YEAR[year]} total entries` : "Total entries: TBC"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
