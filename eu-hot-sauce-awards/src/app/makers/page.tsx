import type { Metadata } from "next";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import MakersDirectoryGrid from "@/components/MakersDirectoryGrid";
import { getYearEntrants, summarizeMakers } from "@/lib/pastResults";
import { PREVIOUS_COMPETITION_YEAR } from "@/lib/config";

export const metadata: Metadata = {
  title: `Award-Winning Makers — ${PREVIOUS_COMPETITION_YEAR} European Hot Sauce Awards`,
  description: `Browse every European maker who medalled at the ${PREVIOUS_COMPETITION_YEAR} European Hot Sauce Awards.`,
};

export default async function MakersPage({
  searchParams,
}: {
  searchParams: { q?: string; country?: string };
}) {
  const rows = await getYearEntrants();
  const makers = summarizeMakers(rows);
  const countries = new Set(makers.map((m) => m.country).filter(Boolean));

  return (
    <div className="bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Makers" }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
            EHSA {PREVIOUS_COMPETITION_YEAR} &middot; The directory
          </p>
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,64px)] uppercase leading-[0.95] text-white">
            Award-winning <span className="bg-[#F5C518] px-2 text-black">makers</span>.
          </h1>
          <p className="mt-5 text-base uppercase tracking-[0.1em] text-gray-300">
            {makers.length} award-winning makers &middot; {countries.size} countries &middot; {rows.length} sauces judged
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <MakersDirectoryGrid
            makers={makers}
            initialQuery={searchParams.q ?? ""}
            initialCountry={searchParams.country ?? "all"}
          />
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
