import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import ResultsExplorer from "@/components/ResultsExplorer";
import { createClient } from "@/lib/supabase/server";
import { PREVIOUS_COMPETITION_YEAR } from "@/lib/config";

interface Row {
  code: string;
  entry_name: string;
  company_name: string;
  country: string | null;
  category: string;
  area: string | null;
  award: string | null;
  position: number | null;
  score: string | number | null;
}

async function getResultsByYear(year: number) {
  const { cookies } = await import("next/headers");
  const supabase = createClient(cookies());
  const { data } = await supabase
    .from("past_results")
    .select("code, entry_name, company_name, country, category, area, award, position, score")
    .eq("year", year)
    .order("category", { ascending: true })
    .order("position", { ascending: true, nullsFirst: false });
  return (data as Row[]) ?? [];
}

export async function generateMetadata({ params }: { params: { year: string } }): Promise<Metadata> {
  return {
    title: `${params.year} Award-Winning Results — European Hot Sauce Awards`,
    description: `Every award-winning entry from the ${params.year} European Hot Sauce Awards.`,
  };
}

export default async function YearResultsPage({ params }: { params: { year: string } }) {
  const year = parseInt(params.year, 10);
  if (Number.isNaN(year)) notFound();

  const rows = await getResultsByYear(year);
  if (rows.length === 0) notFound();

  const categories = new Set(rows.map((r) => r.category));
  const countries = new Set(rows.map((r) => r.country).filter(Boolean));
  const isCurrentYear = year === PREVIOUS_COMPETITION_YEAR;

  return (
    <div className="bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Results", href: "/results" },
          { label: String(year) },
        ]}
      />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
            EHSA {year} &middot; Award-winning results
          </p>
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,64px)] uppercase leading-[0.95] text-white">
            {year} <span className="bg-[#F5C518] px-2 text-black">results</span>.
          </h1>
          <p className="mt-5 text-base uppercase tracking-[0.1em] text-gray-300">
            {rows.length} award-winning entries &middot; {categories.size} categories &middot; {countries.size} countries
          </p>
          {!isCurrentYear && (
            <p className="mt-4 max-w-xl text-sm text-gray-400">
              This is an older archive year — maker and category links below only work for {PREVIOUS_COMPETITION_YEAR}.
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href={`/rankings?year=${year}`}
              className="border-[3px] border-[#F5C518] bg-[#F5C518] px-6 py-3.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-[#e0a800]"
            >
              {year} Global Top 20 &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <ResultsExplorer rows={rows} linkable={isCurrentYear} />
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
