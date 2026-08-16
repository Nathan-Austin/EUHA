import Link from "next/link";
import type { Metadata } from "next";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getYearEntrants, summarizeCountries } from "@/lib/pastResults";
import { PREVIOUS_COMPETITION_YEAR } from "@/lib/config";

export const metadata: Metadata = {
  title: `All Countries — ${PREVIOUS_COMPETITION_YEAR} European Hot Sauce Awards`,
  description: `Every country represented by an award-winning maker at the ${PREVIOUS_COMPETITION_YEAR} European Hot Sauce Awards.`,
};

export default async function CountriesPage() {
  const rows = await getYearEntrants();
  const countries = summarizeCountries(rows);
  const totalMakers = new Set(rows.map((r) => r.company_name)).size;

  return (
    <div className="bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Countries" }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
            EHSA {PREVIOUS_COMPETITION_YEAR} &middot; The directory
          </p>
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,64px)] uppercase leading-[0.95] text-white">
            All <span className="bg-[#F5C518] px-2 text-black">countries</span>.
          </h1>
          <p className="mt-5 text-base uppercase tracking-[0.1em] text-gray-300">
            {countries.length} countries &middot; {totalMakers} award-winning makers
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((c) => (
              <Link
                key={c.slug}
                href={`/country/${c.slug}`}
                className="flex flex-col gap-3 border-2 border-black bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-none">
                    {c.country}
                  </span>
                  <span className="font-[family-name:var(--font-archivo-black)] text-3xl text-[#F5C518]">
                    {c.makers}
                  </span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50">
                  {c.makers} maker{c.makers === 1 ? "" : "s"} &middot; {c.medals} medal{c.medals === 1 ? "" : "s"}
                </span>
                <div className="mt-auto flex items-baseline justify-between border-t border-black/10 pt-3 text-xs">
                  <span className="text-black/60">Best: {c.bestRow.entry_name}</span>
                  <span className="font-[family-name:var(--font-archivo-black)]">View &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
