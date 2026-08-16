import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import MakersDirectoryGrid from "@/components/MakersDirectoryGrid";
import { getYearEntrants, summarizeMakers } from "@/lib/pastResults";
import { PREVIOUS_COMPETITION_YEAR } from "@/lib/config";
import { slugify, slugifyMaker, CATEGORY_SLUGS } from "@/lib/categories";

function formatScore(score: string | number | null) {
  if (score === null) return "—";
  return Number(score).toFixed(2);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const rows = await getYearEntrants();
  const country = rows.map((r) => r.country).find((c) => c && slugify(c) === params.slug);
  if (!country) return {};
  return {
    title: `${country} — European Hot Sauce Awards`,
    description: `Every award-winning maker from ${country} at the ${PREVIOUS_COMPETITION_YEAR} European Hot Sauce Awards.`,
  };
}

export default async function CountryPage({ params }: { params: { slug: string } }) {
  const allRows = await getYearEntrants();
  const country = allRows.map((r) => r.country).find((c) => c && slugify(c) === params.slug);
  if (!country) notFound();

  const countryRows = allRows.filter((r) => r.country === country);
  const makers = summarizeMakers(countryRows);
  const sorted = [...countryRows].sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
  const best = sorted[0];

  const medalCounts = {
    gold: countryRows.filter((r) => r.award?.startsWith("GOLD")).length,
    silver: countryRows.filter((r) => r.award === "SILVER").length,
    bronze: countryRows.filter((r) => r.award === "BRONZE").length,
  };

  return (
    <div className="bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Countries", href: "/countries" },
          { label: country },
        ]}
      />

      <section className="relative overflow-hidden bg-black text-white">
        <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-16 lg:px-16 lg:py-20">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
              EHSA {PREVIOUS_COMPETITION_YEAR} &middot; Country directory
            </p>
            <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(40px,6vw,72px)] uppercase leading-[0.92] text-white">
              {country}
            </h1>
            <div className="mt-8 flex flex-wrap gap-8 border-t border-white/15 pt-7">
              <div>
                <strong className="block font-[family-name:var(--font-archivo-black)] text-4xl text-[#F5C518]">
                  {makers.length}
                </strong>
                <span className="text-[11px] uppercase tracking-[0.12em] text-gray-300">
                  Award-winning makers
                </span>
              </div>
              <div>
                <strong className="block font-[family-name:var(--font-archivo-black)] text-4xl text-[#F5C518]">
                  {countryRows.length}
                </strong>
                <span className="text-[11px] uppercase tracking-[0.12em] text-gray-300">Medals</span>
              </div>
              {medalCounts.gold > 0 && (
                <div>
                  <strong className="block font-[family-name:var(--font-archivo-black)] text-4xl text-[#F5C518]">
                    {medalCounts.gold}
                  </strong>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-gray-300">Gold</span>
                </div>
              )}
            </div>
          </div>
          {best && (
            <div className="relative min-h-[280px] border-t-4 border-[#F5C518] lg:min-h-0 lg:border-l-4 lg:border-t-0">
              {best.product_image_url && (
                <Image src={best.product_image_url} alt="" fill className="object-cover" priority />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="mb-2 inline-block bg-[#F5C518] px-2.5 py-1 font-[family-name:var(--font-archivo-black)] text-[11px] uppercase tracking-[0.06em] text-black">
                  Best from {country}
                </span>
                <div className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-tight text-white">
                  {best.entry_name}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.08em] text-gray-300">
                  {best.company_name} &middot; {formatScore(best.score)}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-8">
            <h2 className="font-[family-name:var(--font-archivo-black)] text-[clamp(28px,4vw,44px)] uppercase leading-[0.95]">
              Makers from <span className="bg-[#F5C518] px-2">{country}</span>.
            </h2>
          </div>
          <MakersDirectoryGrid makers={makers} initialCountry={country} />
        </div>
      </section>

      {sorted.length > 0 && (
        <section className="border-t border-black/10 bg-[#f3ead8] py-16">
          <div className="mx-auto max-w-[1240px] px-6">
            <h3 className="mb-6 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.12em] text-black/60">
              Every {country} medal, {PREVIOUS_COMPETITION_YEAR}
            </h3>
            <div className="overflow-x-auto border-2 border-black bg-white">
              <table className="min-w-full text-sm">
                <tbody>
                  {sorted.map((r, i) => (
                    <tr key={r.code} className={i % 2 === 0 ? "bg-white" : "bg-[#faf6ec]"}>
                      <td className="border-t border-black/10 p-3.5 font-semibold">{r.entry_name}</td>
                      <td className="border-t border-black/10 p-3.5">
                        <Link href={`/maker/${slugifyMaker(r.company_name)}`} className="border-b-2 border-black hover:opacity-70">
                          {r.company_name}
                        </Link>
                      </td>
                      <td className="border-t border-black/10 p-3.5 text-black/70">
                        {CATEGORY_SLUGS[r.category] ? (
                          <Link href={`/category/${CATEGORY_SLUGS[r.category]}`} className="hover:underline">
                            {r.category}
                          </Link>
                        ) : (
                          r.category
                        )}
                      </td>
                      <td className="border-t border-black/10 p-3.5">
                        {r.award && (
                          <span className="bg-[#F5C518] px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.04em]">
                            {r.award}
                          </span>
                        )}
                      </td>
                      <td className="border-t border-black/10 p-3.5 text-right font-[family-name:var(--font-archivo-black)]">
                        {formatScore(r.score)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <HeatFooter />
    </div>
  );
}
