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
import { CATEGORY_SLUGS, slugifyMaker } from "@/lib/categories";
import { getMakerProfile } from "@/lib/makerProfiles";
import { getPressPickups } from "@/lib/press";

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
  contact_name: string | null;
}

function formatScore(score: string | number | null) {
  if (score === null) return null;
  return Number(score).toFixed(2);
}

function medalTier(award: string | null): "gold" | "silver" | "bronze" | null {
  if (!award) return null;
  if (award.startsWith("GOLD")) return "gold";
  if (award === "SILVER") return "silver";
  if (award === "BRONZE") return "bronze";
  return null;
}

function medalLabel(row: ResultRow) {
  const tier = medalTier(row.award);
  if (!tier) return "";
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);
  return row.award === "GOLD (winner)" ? `${label} · Best in Category` : label;
}

async function getYearData() {
  const { cookies } = await import("next/headers");
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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const rows = await getYearData();
  const makerRows = rows.filter((r) => slugifyMaker(r.company_name) === params.slug);
  if (makerRows.length === 0) return {};
  const maker = makerRows[0];
  return {
    title: `${maker.company_name} — ${PREVIOUS_COMPETITION_YEAR} European Hot Sauce Awards`,
    description: `See ${maker.company_name}'s EHSA ${PREVIOUS_COMPETITION_YEAR} entries and medals, from ${maker.country}.`,
  };
}

export default async function MakerPage({ params }: { params: { slug: string } }) {
  const [allRows, pickups] = await Promise.all([getYearData(), getPressPickups()]);
  const makerRows = allRows.filter((r) => slugifyMaker(r.company_name) === params.slug);
  if (makerRows.length === 0) notFound();

  const coverage = pickups.filter((p) => p.makerName && slugifyMaker(p.makerName) === params.slug);

  const maker = makerRows[0];
  const sortedByRank = [...makerRows].sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
  const best = sortedByRank[0];
  const bestIsCategoryWinner = best.award === "GOLD (winner)";

  const medalCounts = {
    gold: makerRows.filter((r) => medalTier(r.award) === "gold").length,
    silver: makerRows.filter((r) => medalTier(r.award) === "silver").length,
    bronze: makerRows.filter((r) => medalTier(r.award) === "bronze").length,
  };

  const categoryTotals = new Map<string, number>();
  for (const row of allRows) {
    categoryTotals.set(row.category, (categoryTotals.get(row.category) ?? 0) + 1);
  }

  const makerCategories = Array.from(new Set(makerRows.map((r) => r.category)));

  // Related: up to 2 other makers from the same country, up to 2 from the same categories.
  const sameCountry = Array.from(
    new Map(
      allRows
        .filter((r) => r.country === maker.country && r.company_name !== maker.company_name)
        .map((r) => [r.company_name, r])
    ).values()
  ).slice(0, 2);

  const sameCategoryPool = allRows.filter(
    (r) => makerCategories.includes(r.category) && r.company_name !== maker.company_name
  );
  const sameCategory = Array.from(new Map(sameCategoryPool.map((r) => [r.company_name, r])).values())
    .filter((r) => !sameCountry.some((s) => s.company_name === r.company_name))
    .slice(0, 4 - sameCountry.length);

  const relatedMakers = [
    ...sameCountry.map((r) => ({ ...r, relation: "Same country" })),
    ...sameCategory.map((r) => ({ ...r, relation: `Same category (${r.category})` })),
  ];

  const profile = getMakerProfile(params.slug);

  const aboutSentences = sortedByRank.map((row) => {
    const tier = medalTier(row.award);
    const tierLabel = row.award === "GOLD (winner)" ? "Gold and Best in Category" : tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : "an entry";
    return `${row.entry_name} took ${tierLabel} in ${row.category} with a judges’ weighted score of ${formatScore(row.score)}.`;
  });

  return (
    <div className="bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Makers", href: "/#directory" },
          { label: maker.company_name },
        ]}
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="grid min-h-[480px] grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-16 lg:px-16 lg:py-20">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
              Independent {best.category} maker &middot; {maker.country}
            </p>
            <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(40px,6vw,72px)] uppercase leading-[0.92] text-white">
              {maker.company_name}
            </h1>
            <p className="mt-5 max-w-[480px] text-base leading-relaxed text-gray-300">
              EHSA {PREVIOUS_COMPETITION_YEAR} {bestIsCategoryWinner ? "Gold medalist" : `${medalTier(best.award) ?? "medal"} medalist`}.
              {bestIsCategoryWinner && ` Best in Category, ${best.category}, with ${best.entry_name}.`}
            </p>
            <div className="mt-8 flex flex-wrap gap-8 border-t border-white/15 pt-7">
              <div>
                <strong className="block font-[family-name:var(--font-archivo-black)] text-4xl text-[#F5C518]">
                  {makerRows.length}
                </strong>
                <span className="text-[11px] uppercase tracking-[0.12em] text-gray-300">
                  EHSA {PREVIOUS_COMPETITION_YEAR} medals
                </span>
              </div>
              {medalCounts.gold > 0 && (
                <div>
                  <strong className="block font-[family-name:var(--font-archivo-black)] text-4xl text-[#F5C518]">
                    {medalCounts.gold}
                  </strong>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-gray-300">Gold</span>
                </div>
              )}
              {medalCounts.silver > 0 && (
                <div>
                  <strong className="block font-[family-name:var(--font-archivo-black)] text-4xl text-[#F5C518]">
                    {medalCounts.silver}
                  </strong>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-gray-300">Silver</span>
                </div>
              )}
              {medalCounts.bronze > 0 && (
                <div>
                  <strong className="block font-[family-name:var(--font-archivo-black)] text-4xl text-[#F5C518]">
                    {medalCounts.bronze}
                  </strong>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-gray-300">Bronze</span>
                </div>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link
                href={`/category/${CATEGORY_SLUGS[best.category]}`}
                className="border-[3px] border-[#F5C518] bg-[#F5C518] px-6 py-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-[#e0a800]"
              >
                View {best.category} &rarr;
              </Link>
            </div>
          </div>
          <div className="relative min-h-[320px] border-t-4 border-[#F5C518] lg:min-h-0 lg:border-l-4 lg:border-t-0">
            {best.product_image_url && (
              <Image src={best.product_image_url} alt="" fill className="object-cover" priority />
            )}
            <div className="absolute left-6 top-6 -rotate-6 border-4 border-black bg-[#F5C518] px-5 py-4 text-center font-[family-name:var(--font-archivo-black)] uppercase leading-[0.92] text-black shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <div className="text-[22px]">
                {PREVIOUS_COMPETITION_YEAR}
                <br />
                Medalist
              </div>
              <div className="mt-2 border-t-2 border-black pt-2 text-[10px] tracking-[0.14em]">
                {bestIsCategoryWinner ? "Gold · Best in Category" : medalLabel(best)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AWARDS */}
      <section className="py-20">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-8">
            <h2 className="font-[family-name:var(--font-archivo-black)] text-[clamp(28px,4vw,44px)] uppercase leading-[0.95]">
              {maker.company_name} at <span className="bg-[#F5C518] px-2">EHSA {PREVIOUS_COMPETITION_YEAR}</span>.
            </h2>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
              {makerRows.length} sauce{makerRows.length === 1 ? "" : "s"} entered, {makerRows.length} medal
              {makerRows.length === 1 ? "" : "s"} returned
            </span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {sortedByRank.map((row) => {
              const total = categoryTotals.get(row.category);
              return (
                <Link
                  key={row.code}
                  href={`/category/${CATEGORY_SLUGS[row.category]}`}
                  className="flex flex-col border-[3px] border-black bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] border-b-[3px] border-black">
                    <SauceImage code={row.code} productImageUrl={row.product_image_url} name={row.entry_name} className="object-cover" />
                    <div className="absolute left-3.5 top-3.5 border-[3px] border-black bg-[#F5C518] px-3.5 py-2 font-[family-name:var(--font-archivo-black)] text-[13px] uppercase tracking-[0.06em]">
                      {medalLabel(row)}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3.5 p-6">
                    <div className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-none">
                      {row.entry_name}
                    </div>
                    <div className="text-[13px] uppercase tracking-[0.1em] text-black/60">
                      Category: <span className="border-b-2 border-black font-bold text-black">{row.category}</span>
                    </div>
                    <div className="mt-auto flex items-baseline justify-between border-t border-black/10 pt-4">
                      <span className="text-xs text-black/50">
                        Rank {row.position}{total ? ` of ${total} in category` : ""}
                      </span>
                      <span className="font-[family-name:var(--font-archivo-black)] text-xl">{formatScore(row.score)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-[#f3ead8] py-20">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-8">
            <h2 className="font-[family-name:var(--font-archivo-black)] text-[clamp(28px,4vw,44px)] uppercase leading-[0.95]">
              About <span className="bg-[#F5C518] px-2">{maker.company_name}</span>.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-9 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-3.5 text-base leading-relaxed text-black/80">
              {profile ? (
                <>
                  <p className="font-semibold text-black">{profile.intro}</p>
                  {profile.story.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  <p>
                    <strong className="text-black">The sauce: </strong>
                    {profile.sauceNote}
                  </p>
                  <p>
                    <strong className="text-black">Peppers: </strong>
                    {profile.peppers}
                  </p>
                  {profile.pairing && (
                    <p>
                      <strong className="text-black">Pairs with: </strong>
                      {profile.pairing}
                    </p>
                  )}
                  {profile.quote && (
                    <blockquote className="border-l-4 border-[#F5C518] py-1 pl-5 italic text-black/70">
                      &ldquo;{profile.quote.text}&rdquo;
                      <footer className="mt-2 text-sm not-italic font-semibold text-black">
                        &mdash; {profile.quote.attrib}
                      </footer>
                    </blockquote>
                  )}
                  {profile.find.length > 0 && (
                    <p className="text-sm">
                      <strong className="text-black">Find {profile.makerPerson.split(" ")[0]}: </strong>
                      {profile.find.map((f, i) => (
                        <span key={f.url}>
                          {i > 0 && ', '}
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#F5C518]">
                            {f.label}
                          </a>
                        </span>
                      ))}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p>
                    {maker.company_name} is based in <strong className="text-black">{maker.country}</strong>.
                  </p>
                  <p>
                    The brand entered EHSA {PREVIOUS_COMPETITION_YEAR} with {makerRows.length} sauce
                    {makerRows.length === 1 ? "" : "s"}. {aboutSentences.join(" ")}
                  </p>
                </>
              )}
            </div>
            <aside className="border-2 border-black bg-white p-6">
              <h4 className="mb-4 border-b-2 border-black pb-3 font-[family-name:var(--font-archivo-black)] text-[13px] uppercase tracking-[0.1em]">
                At a glance
              </h4>
              <div className="flex justify-between gap-4 border-b border-black/10 py-2.5 text-sm">
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-black/50">Based</span>
                <span className="text-right font-semibold">{profile?.region ?? maker.country}</span>
              </div>
              {profile && (
                <div className="flex justify-between gap-4 border-b border-black/10 py-2.5 text-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-black/50">Maker</span>
                  <span className="text-right font-semibold">{profile.makerPerson}</span>
                </div>
              )}
              {maker.contact_name && (
                <div className="flex justify-between gap-4 border-b border-black/10 py-2.5 text-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-black/50">Contact</span>
                  <span className="text-right font-semibold">{maker.contact_name}</span>
                </div>
              )}
              <div className="flex justify-between gap-4 border-b border-black/10 py-2.5 text-sm">
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-black/50">
                  EHSA categories
                </span>
                <span className="text-right font-semibold">{makerCategories.join(", ")}</span>
              </div>
              <div className="flex justify-between gap-4 py-2.5 text-sm">
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-black/50">
                  EHSA {PREVIOUS_COMPETITION_YEAR} medals
                </span>
                <span className="text-right font-semibold">
                  {[
                    medalCounts.gold > 0 ? `${medalCounts.gold} Gold` : null,
                    medalCounts.silver > 0 ? `${medalCounts.silver} Silver` : null,
                    medalCounts.bronze > 0 ? `${medalCounts.bronze} Bronze` : null,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* PRESS COVERAGE */}
      {coverage.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-[1240px] px-6">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-8">
              <h2 className="font-[family-name:var(--font-archivo-black)] text-[clamp(28px,4vw,44px)] uppercase leading-[0.95]">
                In the <span className="bg-[#F5C518] px-2">press</span>.
              </h2>
              <Link href="/press" className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50 hover:text-black">
                All press coverage &rarr;
              </Link>
            </div>
            <ol className="divide-y divide-black/10 border-y border-black/10">
              {coverage.map((p) => {
                const linkUrl = p.articleUrl || p.outletUrl;
                return (
                  <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-4 py-4">
                    <div>
                      {linkUrl ? (
                        <a
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="font-semibold hover:text-[#F5C518] hover:underline"
                        >
                          {p.outletName}
                        </a>
                      ) : (
                        <span className="font-semibold">{p.outletName}</span>
                      )}
                      {p.country && <span className="ml-2 text-xs text-black/40">{p.country}</span>}
                    </div>
                    <span className="text-sm text-black/50">
                      {p.pickupDate
                        ? new Date(p.pickupDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : ''}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* RELATED MAKERS */}
      {relatedMakers.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-[1240px] px-6">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
              <h2 className="font-[family-name:var(--font-archivo-black)] text-[clamp(28px,4vw,44px)] uppercase leading-[0.95]">
                Related <span className="bg-[#F5C518] px-2">makers</span>.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedMakers.map((r) => (
                <Link
                  key={r.company_name}
                  href={`/maker/${slugifyMaker(r.company_name)}`}
                  className="flex min-h-[200px] flex-col gap-2.5 border-2 border-black bg-white p-5 transition hover:-translate-y-1"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/50">
                    {r.relation}
                  </span>
                  <span className="font-[family-name:var(--font-archivo-black)] text-xl uppercase leading-none">
                    {r.company_name}
                  </span>
                  <div className="mt-1 text-[13px] leading-relaxed text-black/70">
                    EHSA {medalLabel(r)}, {r.category}
                    <br />
                    {r.country}
                  </div>
                  <div className="mt-auto border-t border-black/10 pt-3 font-[family-name:var(--font-archivo-black)] text-[11px] uppercase tracking-[0.1em]">
                    View maker &rarr;
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
              Writing about {maker.company_name}?
            </h3>
            <p className="mt-3 max-w-[540px] text-[15px] leading-relaxed text-gray-300">
              Get in touch for high-res photography, full EHSA scoring detail and a named maker contact.
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
