import Link from "next/link";
import Image from "next/image";
import NewsletterSignup from "@/components/NewsletterSignup";
import SponsorLink from "@/components/SponsorLink";
import SauceImage from "@/components/SauceImage";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import { createClient } from "@/lib/supabase/server";
import { PAST_RESULTS_YEAR } from "@/lib/config";

// Category display order matches the entry form / judging categories.
const CATEGORY_ORDER = [
  "Mild Chili Sauce",
  "Medium Chili Sauce",
  "Hot Chili Sauce",
  "Extra Hot Chili Sauce",
  "Extract Based Chili Sauce",
  "BBQ Chili Sauce",
  "Chili Ketchup",
  "Sweet",
  "Chili Honey",
  "Garlic Chili Sauce",
  "Sambal, Chutney & Pickles",
  "Chili Oil",
  "Freestyle",
  "Asian Style Chili Sauce",
  "Salt & Condiments",
  "Chili Paste",
];

const milestones = [
  { label: "Applications Close", value: "28 Feb 2026" },
  { label: "Boxes Ship", value: "24 Mar 2026" },
  { label: "Judging Weekend", value: "11–12 Apr 2026" },
  { label: "Results Announced", value: "May 2026" },
];

const sponsors = [
  { name: "Flying Goose", logo_url: "/sponsors/flying-goose.png", url: "https://flyinggoosesriracha.com/?utm_source=heatawards&utm_medium=referral&utm_campaign=2026_awards" },
  { name: "Chilisaus.be", logo_url: "/sponsors/chilisaus.png", url: "https://chilisaus.be/?utm_source=heatawards&utm_medium=referral&utm_campaign=2026_awards" },
  { name: "Republic of Heat", logo_url: "/sponsors/ROH_LOGO.png", url: "https://republicofheat.com/?utm_source=heatawards&utm_medium=referral&utm_campaign=2026_awards" },
];

interface ResultRow {
  code: string;
  entry_name: string;
  company_name: string;
  country: string | null;
  category: string;
  score: string | number | null;
  product_image_url: string | null;
  global_rank: number | null;
}

function formatScore(score: string | number | null) {
  if (score === null) return null;
  return Number(score).toFixed(2);
}

function countryTier(makers: number) {
  if (makers >= 10) return "huge";
  if (makers >= 6) return "large";
  if (makers >= 4) return "med";
  if (makers >= 2) return "small";
  return "tiny";
}

const TIER_STYLES: Record<string, string> = {
  huge: "px-9 py-6 text-3xl",
  large: "px-7 py-5 text-2xl",
  med: "px-5 py-4 text-xl",
  small: "px-4 py-3 text-base",
  tiny: "px-3 py-2 text-sm",
};

async function getHomepageData() {
  const { cookies } = await import("next/headers");
  const supabase = createClient(cookies());

  const [{ data: podium }, { data: categoryRows }, { data: euroRows }] = await Promise.all([
    supabase
      .from("past_results")
      .select("code, entry_name, company_name, country, category, score, product_image_url, global_rank")
      .eq("year", PAST_RESULTS_YEAR)
      .not("global_rank", "is", null)
      .lte("global_rank", 3)
      .order("global_rank", { ascending: true }),
    supabase
      .from("past_results")
      .select("code, entry_name, company_name, country, category, score, product_image_url, global_rank")
      .eq("year", PAST_RESULTS_YEAR)
      .eq("area", "EURO")
      .eq("award", "GOLD (winner)"),
    supabase
      .from("past_results")
      .select("country, company_name")
      .eq("year", PAST_RESULTS_YEAR)
      .eq("area", "EURO"),
  ]);

  const categoryWinners = new Map<string, ResultRow>();
  for (const row of (categoryRows as ResultRow[]) ?? []) {
    categoryWinners.set(row.category, row);
  }

  const makersByCountry = new Map<string, Set<string>>();
  for (const row of (euroRows as { country: string | null; company_name: string }[]) ?? []) {
    if (!row.country) continue;
    if (!makersByCountry.has(row.country)) makersByCountry.set(row.country, new Set());
    makersByCountry.get(row.country)!.add(row.company_name);
  }
  const countries = Array.from(makersByCountry.entries())
    .map(([country, makers]) => ({ country, makers: makers.size }))
    .sort((a, b) => b.makers - a.makers);

  const totalMakers = new Set((euroRows ?? []).map((r: { company_name: string }) => r.company_name)).size;

  return {
    podium: (podium as ResultRow[]) ?? [],
    categoryWinners,
    countries,
    stats: {
      countries: countries.length,
      makers: totalMakers,
    },
  };
}

export default async function Home() {
  const { podium, categoryWinners, countries, stats } = await getHomepageData();
  const heroWinner = podium.find((p) => p.global_rank === 1);

  return (
    <div className="bg-[#faf6ec] text-black">
      <HeatHeader />

      {/* HERO */}
      <section className="relative flex min-h-[560px] items-center bg-black">
        {heroWinner?.product_image_url && (
          <Image
            src={heroWinner.product_image_url}
            alt=""
            fill
            className="object-cover opacity-40"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/50" />
        <div className="relative mx-auto max-w-[1240px] px-6 py-20">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
            EHSA {PAST_RESULTS_YEAR} &middot; Judged in Berlin
          </p>
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,72px)] uppercase leading-[0.95] text-white">
            Europe&rsquo;s best hot sauces
            <br />
            of <span className="bg-[#F5C518] px-2 text-black">{PAST_RESULTS_YEAR}</span>.
          </h1>

          {podium.length > 0 && (
            <div className="mt-11 grid max-w-3xl grid-cols-1 items-end gap-4 sm:grid-cols-3">
              {[2, 1, 3].map((rank) => {
                const entry = podium.find((p) => p.global_rank === rank);
                if (!entry) return null;
                const isGold = rank === 1;
                return (
                  <div
                    key={rank}
                    className={`flex flex-col justify-between p-6 ${isGold ? "min-h-[210px] bg-[#F5C518]" : "min-h-[170px] bg-white/95"}`}
                  >
                    <div>
                      <span className="mb-3 inline-block bg-black px-2.5 py-1 font-[family-name:var(--font-archivo-black)] text-[11px] uppercase tracking-[0.08em] text-white">
                        {rank === 1 ? "Gold · 1st" : rank === 2 ? "Silver · 2nd" : "Bronze · 3rd"}
                      </span>
                      <div className={`font-[family-name:var(--font-archivo-black)] leading-none text-black/85 ${isGold ? "text-6xl" : "text-4xl"}`}>
                        0{rank}
                      </div>
                    </div>
                    <div>
                      <div className="font-[family-name:var(--font-archivo-black)] text-lg uppercase leading-tight text-black">
                        {entry.entry_name}
                      </div>
                      <div className="mt-1.5 text-xs uppercase tracking-[0.1em] text-black/60">
                        {entry.company_name} &middot; {entry.country}
                      </div>
                      <div className="mt-2 font-[family-name:var(--font-archivo-black)] text-base text-black">
                        {formatScore(entry.score)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href={`/results/${PAST_RESULTS_YEAR}`}
              className="bg-[#F5C518] px-6 py-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-[#e0a800]"
            >
              See all {PAST_RESULTS_YEAR} results &rarr;
            </Link>
            <Link
              href="/rankings"
              className="border-[3px] border-white px-6 py-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-white hover:bg-white hover:text-black"
            >
              Global Top 20 &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* DIRECTORY STRIP */}
      <section className="bg-black py-7">
        <div className="mx-auto max-w-[1240px] px-6">
          <p className="font-[family-name:var(--font-archivo-black)] text-base uppercase text-white">
            The European hot sauce directory. {stats.makers} makers, {stats.countries} countries.
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section className="border-b border-black/10 py-14">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-black/50">
            Welcome to the Heat Awards
          </h2>
          <p className="text-base leading-relaxed text-black/75 sm:text-lg">
            We champion craftsmanship, innovation and sustainability in the world of hot sauce.
            Entry is open to all — European (continental) and international entries are judged
            separately by community, professional and supplier judges.
          </p>
        </div>
      </section>

      {/* COUNTRIES */}
      {countries.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-[1240px] px-6">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
              <h2 className="font-[family-name:var(--font-archivo-black)] text-[clamp(28px,4vw,44px)] uppercase leading-[0.95]">
                Browse by <span className="bg-[#F5C518] px-2">country</span>.
              </h2>
              <Link
                href={`/results/${PAST_RESULTS_YEAR}`}
                className="border-b-[3px] border-black pb-1 text-xs font-bold uppercase tracking-[0.1em]"
              >
                All {stats.countries} countries &rarr;
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-3.5">
              {countries.map(({ country, makers }) => (
                <Link
                  key={country}
                  href={`/results/${PAST_RESULTS_YEAR}`}
                  className={`inline-flex items-baseline gap-3 border-2 border-black bg-[#F5C518] transition hover:-translate-y-0.5 hover:shadow-lg ${TIER_STYLES[countryTier(makers)]}`}
                >
                  <span className="font-[family-name:var(--font-archivo-black)] leading-none">{makers}</span>
                  <span className="font-[family-name:var(--font-archivo-black)] text-[0.5em] uppercase tracking-[0.04em]">
                    {country}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BEST IN CATEGORY */}
      <section className="bg-[#faf6ec] py-20">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
            <h2 className="font-[family-name:var(--font-archivo-black)] text-[clamp(28px,4vw,44px)] uppercase leading-[0.95]">
              Best in <span className="bg-[#F5C518] px-2">category</span>.
              <br />
              All {categoryWinners.size} Golds of {PAST_RESULTS_YEAR}.
            </h2>
            <Link
              href="/prizes"
              className="border-b-[3px] border-black pb-1 text-xs font-bold uppercase tracking-[0.1em]"
            >
              How judging works &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORY_ORDER.map((category) => {
              const winner = categoryWinners.get(category);
              if (!winner) return null;
              return (
                <Link
                  key={category}
                  href={`/results/${PAST_RESULTS_YEAR}`}
                  className="flex flex-col border-2 border-black bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] border-b-2 border-black bg-[#F5C518]">
                    <SauceImage
                      code={winner.code}
                      productImageUrl={winner.product_image_url}
                      name={winner.entry_name}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 border-b-2 border-black bg-[#F5C518] px-3.5 py-2.5">
                    <span className="font-[family-name:var(--font-archivo-black)] text-xs uppercase leading-tight">
                      {category}
                    </span>
                    <span className="flex-shrink-0 bg-black px-1.5 py-0.5 font-[family-name:var(--font-archivo-black)] text-[10px] uppercase tracking-[0.08em] text-[#F5C518]">
                      Gold
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-3.5">
                    <div>
                      <div className="font-[family-name:var(--font-archivo-black)] text-sm uppercase leading-tight">
                        {winner.entry_name}
                      </div>
                      <div className="mt-2 text-[11px] uppercase tracking-[0.1em] text-black/60">
                        {winner.company_name}
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between border-t border-black/10 pt-3">
                      <span className="text-[11px] text-black/50">{winner.country}</span>
                      <span className="font-[family-name:var(--font-archivo-black)] text-sm">
                        {formatScore(winner.score)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* KEY DATES */}
      <section className="bg-black py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <h2 className="mb-9 font-[family-name:var(--font-archivo-black)] text-2xl uppercase text-white">
            Key dates
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {milestones.map((m) => (
              <div key={m.label} className="border-2 border-[#F5C518] p-5 text-center">
                <div className="font-[family-name:var(--font-archivo-black)] text-lg text-[#F5C518]">
                  {m.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.12em] text-gray-300">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA TILES */}
      <section className="border-y-4 border-black bg-[#F5C518] py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="grid gap-7 md:grid-cols-3">
            <div className="flex min-h-[190px] flex-col justify-between bg-black p-8">
              <div>
                <h3 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-tight text-white">
                  For makers.
                  <br />
                  Enter EHSA 2027.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Ship a box for judging. Entries open ahead of the 2027 competition.
                </p>
              </div>
              <Link
                href="/apply/supplier"
                className="mt-5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.1em] text-[#F5C518]"
              >
                Register interest &rarr;
              </Link>
            </div>
            <div className="flex min-h-[190px] flex-col justify-between bg-black p-8">
              <div>
                <h3 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-tight text-white">
                  For judges.
                  <br />
                  Apply to score.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Community, professional and supplier judging slots open closer to the event.
                </p>
              </div>
              <Link
                href="/apply/judge"
                className="mt-5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.1em] text-[#F5C518]"
              >
                Apply to judge &rarr;
              </Link>
            </div>
            <div className="flex min-h-[190px] flex-col justify-between bg-black p-8">
              <div>
                <h3 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-tight text-white">
                  For partners.
                  <br />
                  Become a sponsor.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Limited sponsor slots per year, matched by category fit.
                </p>
              </div>
              <Link
                href="/sponsors"
                className="mt-5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.1em] text-[#F5C518]"
              >
                Sponsor enquiries &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      <section className="border-b border-black/10 bg-[#faf6ec] py-14">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-16 px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            {PAST_RESULTS_YEAR} Official Sponsors
          </span>
          {sponsors.map((s) => (
            <SponsorLink
              key={s.name}
              href={s.url}
              sponsorName={s.name}
              className="flex h-20 w-20 items-center justify-center p-3 transition hover:scale-105"
            >
              <Image src={s.logo_url} alt={s.name} width={80} height={80} className="object-contain" />
            </SponsorLink>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-black py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <NewsletterSignup />
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
