import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import SauceImage from "@/components/SauceImage";
import { createClient } from "@/lib/supabase/server";
import { PREVIOUS_COMPETITION_YEAR } from "@/lib/config";
import { CATEGORY_SLUGS, SLUG_TO_CATEGORY, categoryGroupFor, slugifyMaker } from "@/lib/categories";

interface ResultRow {
  code: string;
  entry_name: string;
  company_name: string;
  country: string | null;
  category: string;
  award: string | null;
  position: number | null;
  score: string | number | null;
  product_image_url: string | null;
}

function formatScore(score: string | number | null) {
  if (score === null) return null;
  return Number(score).toFixed(2);
}

async function getCategoryData(category: string) {
  const { cookies } = await import("next/headers");
  const supabase = createClient(cookies());

  const group = categoryGroupFor(category);
  const relatedCategories = group ? group.categories.filter((c) => c !== category).slice(0, 4) : [];

  const [{ data: rows }, { data: relatedWinnerRows }] = await Promise.all([
    supabase
      .from("past_results")
      .select("code, entry_name, company_name, country, category, award, position, score, product_image_url")
      .eq("year", PREVIOUS_COMPETITION_YEAR)
      .eq("area", "EURO")
      .eq("category", category)
      .order("position", { ascending: true, nullsFirst: false }),
    relatedCategories.length > 0
      ? supabase
          .from("past_results")
          .select("code, entry_name, company_name, country, category, award, position, score, product_image_url")
          .eq("year", PREVIOUS_COMPETITION_YEAR)
          .eq("area", "EURO")
          .eq("award", "GOLD (winner)")
          .in("category", relatedCategories)
      : Promise.resolve({ data: [] as ResultRow[] }),
  ]);

  return {
    rows: (rows as ResultRow[]) ?? [],
    relatedWinners: (relatedWinnerRows as ResultRow[]) ?? [],
    groupTitle: group?.title,
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = SLUG_TO_CATEGORY[params.slug];
  if (!category) return {};
  return {
    title: `${category} — Best in Category ${PREVIOUS_COMPETITION_YEAR}`,
    description: `See every ${PREVIOUS_COMPETITION_YEAR} European Hot Sauce Awards medalist in ${category}, judged in Berlin.`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = SLUG_TO_CATEGORY[params.slug];
  if (!category) notFound();

  const { rows, relatedWinners, groupTitle } = await getCategoryData(category);
  if (rows.length === 0) notFound();

  const gold = rows.filter((r) => r.award === "GOLD (winner)" || r.award === "GOLD");
  const silver = rows.filter((r) => r.award === "SILVER");
  const bronze = rows.filter((r) => r.award === "BRONZE");
  const best = rows.find((r) => r.award === "GOLD (winner)") ?? gold[0];

  const tieLabel = (row: ResultRow, list: ResultRow[], medal: string) => {
    const isTied = list.filter((r) => r.position === row.position).length > 1;
    return isTied ? `${medal}, tied` : medal;
  };

  return (
    <div className="bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/#directory" },
          { label: category },
        ]}
      />

      {/* CATEGORY HERO */}
      {best && (
        <section className="relative overflow-hidden bg-black text-white">
          <div className="grid min-h-[480px] grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center px-6 py-16 lg:px-16 lg:py-20">
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
                EHSA {PREVIOUS_COMPETITION_YEAR} &middot; Gold &middot; Best in Category
              </p>
              <p className="mb-4 font-[family-name:var(--font-archivo-black)] text-lg uppercase tracking-[0.04em] text-gray-300">
                {category}
              </p>
              <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(40px,6vw,72px)] uppercase leading-[0.92] text-white">
                {best.entry_name}
              </h1>
              <p className="mt-5 text-base uppercase tracking-[0.1em] text-gray-300">
                {best.company_name} &middot; {best.country}
              </p>
              <div className="mt-7 flex items-baseline gap-4">
                <span className="font-[family-name:var(--font-archivo-black)] text-5xl text-[#F5C518]">
                  {formatScore(best.score)}
                </span>
                <span className="text-xs uppercase tracking-[0.12em] text-gray-400">
                  Judges&rsquo; weighted average
                  <br />
                  out of 10
                </span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3.5">
                <Link
                  href={`/maker/${slugifyMaker(best.company_name)}`}
                  className="border-[3px] border-[#F5C518] bg-[#F5C518] px-6 py-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-[#e0a800]"
                >
                  View {best.company_name} &rarr;
                </Link>
              </div>
            </div>
            <div className="relative min-h-[320px] border-t-4 border-[#F5C518] lg:min-h-0 lg:border-l-4 lg:border-t-0">
              {best.product_image_url && (
                <Image src={best.product_image_url} alt="" fill className="object-cover" priority />
              )}
              <div className="absolute left-6 top-6 -rotate-6 border-4 border-black bg-[#F5C518] px-5 py-4 text-center font-[family-name:var(--font-archivo-black)] uppercase leading-[0.92] text-black shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                <div className="text-[22px]">
                  Best in
                  <br />
                  Category
                </div>
                <div className="mt-2 border-t-2 border-black pt-2 text-[10px] tracking-[0.14em]">
                  EHSA {PREVIOUS_COMPETITION_YEAR} &middot; Gold
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STATS STRIP */}
      <section className="border-t-4 border-[#F5C518] bg-black py-7 text-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-6 px-6">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-baseline gap-3">
              <strong className="font-[family-name:var(--font-archivo-black)] text-3xl text-[#F5C518]">
                {rows.length}
              </strong>
              <span className="text-xs uppercase tracking-[0.12em] text-gray-300">Sauces judged</span>
            </div>
            <div className="flex items-baseline gap-3">
              <strong className="font-[family-name:var(--font-archivo-black)] text-3xl text-[#F5C518]">
                {gold.length}
              </strong>
              <span className="text-xs uppercase tracking-[0.12em] text-gray-300">Gold</span>
            </div>
            <div className="flex items-baseline gap-3">
              <strong className="font-[family-name:var(--font-archivo-black)] text-3xl text-[#F5C518]">
                {silver.length}
              </strong>
              <span className="text-xs uppercase tracking-[0.12em] text-gray-300">Silver</span>
            </div>
            <div className="flex items-baseline gap-3">
              <strong className="font-[family-name:var(--font-archivo-black)] text-3xl text-[#F5C518]">
                {bronze.length}
              </strong>
              <span className="text-xs uppercase tracking-[0.12em] text-gray-300">Bronze</span>
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.1em] text-gray-400">
            Judged 11&ndash;12 Apr {PREVIOUS_COMPETITION_YEAR}, Berlin
          </p>
        </div>
      </section>

      {/* TIERS */}
      <section className="py-20">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-11 flex flex-wrap items-end justify-between gap-8">
            <h2 className="font-[family-name:var(--font-archivo-black)] text-[clamp(28px,4vw,44px)] uppercase leading-[0.95]">
              The <span className="bg-[#F5C518] px-2">{category.replace(" Chili Sauce", "")}</span> winners.
            </h2>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
              Sorted by judges&rsquo; weighted score
            </span>
          </div>

          {gold.length > 0 && (
            <div className="mb-16">
              <div className="mb-6 flex items-baseline justify-between border-b-[3px] border-black pb-3">
                <h3 className="flex items-center font-[family-name:var(--font-archivo-black)] text-2xl uppercase tracking-[0.03em]">
                  <span className="mr-2.5 inline-block h-4 w-4 rounded-full bg-[#F5C518]" />
                  Gold
                </h3>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
                  {gold.length} Gold medals awarded
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {gold.map((row, i) => (
                  <Link
                    key={row.code}
                    href={`/maker/${slugifyMaker(row.company_name)}`}
                    className={`flex flex-col border-[3px] border-black bg-white transition hover:-translate-y-1 hover:shadow-lg ${i === 0 ? "lg:col-span-1" : ""}`}
                  >
                    <div className="relative aspect-[4/3] border-b-[3px] border-black">
                      <SauceImage code={row.code} productImageUrl={row.product_image_url} name={row.entry_name} className="object-cover" />
                      <div className="absolute left-3.5 top-3.5 grid h-14 w-14 place-items-center border-[3px] border-black bg-[#F5C518] font-[family-name:var(--font-archivo-black)] text-2xl">
                        0{row.position}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3.5 p-6">
                      {i === 0 ? (
                        <div className="text-xs font-[family-name:var(--font-archivo-black)] uppercase tracking-[0.1em]">
                          <span className="mr-2 bg-black px-2.5 py-1 text-[#F5C518]">Best in Category</span>
                          Gold &middot; 1st
                        </div>
                      ) : (
                        <div className="text-xs font-[family-name:var(--font-archivo-black)] uppercase tracking-[0.1em] text-black/50">
                          Gold &middot; {row.position === 2 ? "2nd" : "3rd"}
                        </div>
                      )}
                      <div className={`font-[family-name:var(--font-archivo-black)] uppercase leading-none ${i === 0 ? "text-[34px]" : "text-[28px]"}`}>
                        {row.entry_name}
                      </div>
                      <div className="text-[13px] uppercase tracking-[0.1em] text-black/60">{row.company_name}</div>
                      <div className="mt-auto flex items-baseline justify-between border-t border-black/10 pt-4">
                        <span className="text-xs text-black/50">{row.country}</span>
                        <span className="font-[family-name:var(--font-archivo-black)] text-xl">{formatScore(row.score)}</span>
                      </div>
                    </div>
                    <div className="bg-black px-6 py-3.5 text-center font-[family-name:var(--font-archivo-black)] text-[11px] uppercase tracking-[0.1em] text-white">
                      View maker &rarr;
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {silver.length > 0 && (
            <div className="mb-16">
              <div className="mb-6 flex items-baseline justify-between border-b-[3px] border-black pb-3">
                <h3 className="flex items-center font-[family-name:var(--font-archivo-black)] text-2xl uppercase tracking-[0.03em]">
                  <span className="mr-2.5 inline-block h-4 w-4 rounded-full bg-[#DCDCDC]" />
                  Silver
                </h3>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
                  {silver.length} Silver medals awarded
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {silver.map((row) => (
                  <Link
                    key={row.code}
                    href={`/maker/${slugifyMaker(row.company_name)}`}
                    className="flex flex-col border-2 border-black bg-white transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] border-b-2 border-black">
                      <SauceImage code={row.code} productImageUrl={row.product_image_url} name={row.entry_name} className="object-cover" />
                      <div className="absolute left-3 top-3 grid h-12 w-12 place-items-center border-[3px] border-black bg-[#DCDCDC] font-[family-name:var(--font-archivo-black)] text-xl">
                        0{row.position}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2.5 p-5">
                      <div className="text-[11px] font-[family-name:var(--font-archivo-black)] uppercase tracking-[0.1em] text-black/50">
                        {tieLabel(row, silver, "Silver")} &middot; {row.position}th
                      </div>
                      <div className="font-[family-name:var(--font-archivo-black)] text-[22px] uppercase leading-none">
                        {row.entry_name}
                      </div>
                      <div className="text-xs uppercase tracking-[0.1em] text-black/60">{row.company_name}</div>
                      <div className="mt-auto flex items-baseline justify-between border-t border-black/10 pt-3">
                        <span className="text-xs text-black/50">{row.country}</span>
                        <span className="font-[family-name:var(--font-archivo-black)] text-lg">{formatScore(row.score)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {bronze.length > 0 && (
            <div>
              <div className="mb-6 flex items-baseline justify-between border-b-[3px] border-black pb-3">
                <h3 className="flex items-center font-[family-name:var(--font-archivo-black)] text-2xl uppercase tracking-[0.03em]">
                  <span className="mr-2.5 inline-block h-4 w-4 rounded-full border-[3px] border-[#F5C518] bg-black" />
                  Bronze
                </h3>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
                  {bronze.length} Bronze medals awarded
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                {bronze.map((row) => (
                  <Link
                    key={row.code}
                    href={`/maker/${slugifyMaker(row.company_name)}`}
                    className="flex flex-col gap-2 border-2 border-black/20 bg-white p-5 transition hover:-translate-y-0.5 hover:border-black"
                  >
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="bg-[#F5C518] px-2.5 py-0.5 font-[family-name:var(--font-archivo-black)] text-base leading-none">
                        0{row.position}
                      </span>
                      <span className="font-[family-name:var(--font-archivo-black)] text-[11px] uppercase tracking-[0.08em] text-black/50">
                        {tieLabel(row, bronze, "Bronze")}
                      </span>
                    </div>
                    <div className="font-[family-name:var(--font-archivo-black)] text-lg uppercase leading-tight">
                      {row.entry_name}
                    </div>
                    <div className="text-xs uppercase tracking-[0.08em] text-black/60">{row.company_name}</div>
                    <div className="mt-auto flex items-baseline justify-between border-t border-black/10 pt-2.5">
                      <span className="text-[11px] text-black/50">{row.country}</span>
                      <span className="font-[family-name:var(--font-archivo-black)] text-sm">{formatScore(row.score)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* RELATED CATEGORIES */}
      {relatedWinners.length > 0 && (
        <section className="bg-[#f3ead8] py-20">
          <div className="mx-auto max-w-[1240px] px-6">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
              <h2 className="font-[family-name:var(--font-archivo-black)] text-[clamp(28px,4vw,44px)] uppercase leading-[0.95]">
                Related <span className="bg-[#F5C518] px-2">categories</span>.
              </h2>
              {groupTitle && (
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
                  Also in {groupTitle}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedWinners.map((winner) => (
                <Link
                  key={winner.category}
                  href={`/category/${CATEGORY_SLUGS[winner.category]}`}
                  className="flex flex-col gap-3 border-2 border-black bg-white p-5 transition hover:-translate-y-1"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/50">
                    Also in {groupTitle}
                  </span>
                  <span className="font-[family-name:var(--font-archivo-black)] text-xl uppercase leading-none">
                    {winner.category}
                  </span>
                  <div className="mt-1.5 text-[13px] text-black/70">
                    Best in Category: <strong className="text-black">{winner.entry_name}</strong>
                    <br />
                    {winner.company_name}, {winner.country}
                  </div>
                  <div className="mt-auto border-t border-black/10 pt-3 font-[family-name:var(--font-archivo-black)] text-[11px] uppercase tracking-[0.1em]">
                    View {winner.category} &rarr;
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRESS STRIP */}
      <section className="bg-black py-14 text-white">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-9 px-6 lg:grid-cols-[2fr_1fr]">
          <div>
            <h3 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-none">
              Writing about {category}?
            </h3>
            <p className="mt-3 max-w-[540px] text-[15px] leading-relaxed text-gray-300">
              Get in touch for high-res photography, scoring detail and named maker contacts.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2.5 lg:items-end">
            <Link
              href="/contact"
              className="border-[3px] border-[#F5C518] bg-[#F5C518] px-6 py-3.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-[#e0a800]"
            >
              Get in touch &rarr;
            </Link>
          </div>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
