import Link from "next/link";
import Image from "next/image";
import NewsletterSignup from "@/components/NewsletterSignup";
import SponsorLink from "@/components/SponsorLink";
import SauceImage from "@/components/SauceImage";
import DirectorySearchForm from "@/components/DirectorySearchForm";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import { createClient } from "@/lib/supabase/server";
import { COMPETITION_YEAR, PREVIOUS_COMPETITION_YEAR } from "@/lib/config";
import { CATEGORY_GROUPS, CATEGORY_SLUGS, WILDCARD_CATEGORY } from "@/lib/categories";

const milestones = [
  { label: "Applications Close", value: `28 Feb ${COMPETITION_YEAR}` },
  { label: "Entry Delivery Window", value: `1 Feb – 15 Mar ${COMPETITION_YEAR}` },
  { label: "Judging Congress", value: `TBC Apr ${COMPETITION_YEAR}` },
  { label: "Awards Ceremony & Announcement", value: `27 May ${COMPETITION_YEAR}` },
];

// 2026 sponsor slots — hidden for now until 2027 sponsors are confirmed.
const SHOW_SPONSORS = false;

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

// Static snapshot of the 2026 European entrant roster (sauces + suppliers tables,
// competition_year=2026, region='european'). Not queried live on the homepage because
// both tables are correctly RLS-locked to authenticated/admin users (suppliers holds
// PII — email, address, tracking numbers), so an anonymous visitor gets zero rows.
// One supplier's country was recorded as "NO" (a Norway data-entry typo) — folded in
// below rather than shown as its own pill. Total: 104 makers, 24 countries, 386 sauces.
const EUROPEAN_ENTRANTS = [
  { country: "Germany", makers: 16 },
  { country: "Austria", makers: 10 },
  { country: "Spain", makers: 9 },
  { country: "Netherlands", makers: 8 },
  { country: "United Kingdom", makers: 7 },
  { country: "Portugal", makers: 7 },
  { country: "Switzerland", makers: 5 },
  { country: "Slovenia", makers: 5 },
  { country: "Norway", makers: 6 },
  { country: "Croatia", makers: 4 },
  { country: "Belgium", makers: 4 },
  { country: "Malta", makers: 3 },
  { country: "Hungary", makers: 3 },
  { country: "Czech Republic", makers: 3 },
  { country: "Italy", makers: 2 },
  { country: "Sweden", makers: 2 },
  { country: "Finland", makers: 2 },
  { country: "Ireland", makers: 2 },
  { country: "Latvia", makers: 1 },
  { country: "Lithuania", makers: 1 },
  { country: "France", makers: 1 },
  { country: "Poland", makers: 1 },
  { country: "Romania", makers: 1 },
  { country: "Bulgaria", makers: 1 },
].sort((a, b) => b.makers - a.makers);

// EUROPEAN_ENTRANTS above is sourced from sauces+suppliers (RLS-blocked for public
// queries, hence the static snapshot); /makers and every past_results-backed page
// use past_results, which spells country names slightly differently in places
// (e.g. "UK" not "United Kingdom"). Maps the pill's label to the string /makers
// actually needs to match on, so the link doesn't silently return zero results.
const PAST_RESULTS_COUNTRY_NAME: Record<string, string> = {
  "United Kingdom": "UK",
};

async function getHomepageData() {
  const { cookies } = await import("next/headers");
  const supabase = createClient(cookies());

  const [{ data: podium }, { data: categoryRows }] = await Promise.all([
    supabase
      .from("past_results")
      .select("code, entry_name, company_name, country, category, score, product_image_url, global_rank")
      .eq("year", PREVIOUS_COMPETITION_YEAR)
      .not("global_rank", "is", null)
      .lte("global_rank", 3)
      .order("global_rank", { ascending: true }),
    supabase
      .from("past_results")
      .select("code, entry_name, company_name, country, category, score, product_image_url, global_rank")
      .eq("year", PREVIOUS_COMPETITION_YEAR)
      .eq("area", "EURO")
      .eq("award", "GOLD (winner)"),
  ]);

  const categoryWinners = new Map<string, ResultRow>();
  for (const row of (categoryRows as ResultRow[]) ?? []) {
    categoryWinners.set(row.category, row);
  }

  const totalMakers = EUROPEAN_ENTRANTS.reduce((sum, c) => sum + c.makers, 0);

  return {
    podium: (podium as ResultRow[]) ?? [],
    categoryWinners,
    countries: EUROPEAN_ENTRANTS,
    stats: {
      countries: EUROPEAN_ENTRANTS.length,
      makers: totalMakers,
    },
  };
}

export default async function Home() {
  const { podium, categoryWinners, countries, stats } = await getHomepageData();
  const wildcardWinner = categoryWinners.get(WILDCARD_CATEGORY);

  return (
    <div className="bg-[#faf6ec] text-black">
      <HeatHeader />

      {/* HERO */}
      <section className="relative flex min-h-[620px] items-center bg-black">
        <Image
          src="/hero-flatlay-dark.jpeg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)",
          }}
        />
        <div className="relative mx-auto max-w-[1240px] px-6 py-20">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
            EHSA {PREVIOUS_COMPETITION_YEAR} &middot; Judged in Berlin
          </p>
          <h1 className="max-w-[880px] font-[family-name:var(--font-archivo-black)] text-[clamp(46px,7vw,88px)] uppercase leading-[0.95] text-white">
            Europe&rsquo;s best hot sauces of{" "}
            <span className="bg-[#F5C518] px-2 text-black">{PREVIOUS_COMPETITION_YEAR}</span>.
          </h1>

          {podium.length > 0 && (
            <div className="mt-11 grid max-w-[1000px] grid-cols-1 items-end gap-[18px] sm:grid-cols-[1fr_1.15fr_1fr]">
              {[2, 1, 3].map((rank) => {
                const entry = podium.find((p) => p.global_rank === rank);
                if (!entry) return null;
                const isGold = rank === 1;
                return (
                  <div
                    key={rank}
                    className={`flex min-h-[220px] min-w-0 flex-col justify-between p-[32px_24px_28px] shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${isGold ? "min-h-[280px] bg-[#F5C518]" : rank === 2 ? "bg-[#DCDCDC]" : "bg-[#DDA15E]"}`}
                  >
                    <div>
                      <span className="mb-[14px] inline-block bg-black px-[11px] py-[5px] font-[family-name:var(--font-archivo-black)] text-[11px] uppercase tracking-[0.08em] text-white">
                        {rank === 1 ? "Gold · 1st" : rank === 2 ? "Silver · 2nd" : "Bronze · 3rd"}
                      </span>
                      <div className={`font-[family-name:var(--font-archivo-black)] leading-[0.85] text-black/85 ${isGold ? "text-[110px] opacity-100" : "text-[80px] opacity-85"}`}>
                        0{rank}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="mt-3 truncate font-[family-name:var(--font-archivo-black)] text-[22px] uppercase leading-tight text-black">
                        {entry.entry_name}
                      </div>
                      <div className="mt-2 text-[13px] uppercase tracking-[0.1em] text-black/60">
                        {entry.company_name} &middot; {entry.country}
                      </div>
                      <div className="mt-[14px] font-[family-name:var(--font-archivo-black)] text-[18px] text-black">
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
              href={`/results/${PREVIOUS_COMPETITION_YEAR}`}
              className="bg-[#F5C518] px-6 py-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-[#e0a800]"
            >
              See all {PREVIOUS_COMPETITION_YEAR} results &rarr;
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

      {/* DIRECTORY SEARCH STRIP */}
      <section className="bg-black py-7">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-8 px-6">
          <p className="font-[family-name:var(--font-archivo-black)] text-base uppercase text-white">
            The European hot sauce directory. {stats.makers} makers, {stats.countries} countries.
          </p>
          <DirectorySearchForm />
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
            For {COMPETITION_YEAR}, judging comes to life in person — a multi-day congress in
            Berlin where press and invited industry professionals taste every entry together,
            before results are revealed.
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
                href="/makers"
                className="border-b-[3px] border-black pb-1 text-xs font-bold uppercase tracking-[0.1em]"
              >
                All {stats.countries} countries &rarr;
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-3.5">
              {countries.map(({ country, makers }) => (
                <Link
                  key={country}
                  href={`/makers?country=${encodeURIComponent(PAST_RESULTS_COUNTRY_NAME[country] ?? country)}`}
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
              All {categoryWinners.size} Golds of {PREVIOUS_COMPETITION_YEAR}.
            </h2>
            <Link
              href="/prizes"
              className="border-b-[3px] border-black pb-1 text-xs font-bold uppercase tracking-[0.1em]"
            >
              How judging works &rarr;
            </Link>
          </div>
          {CATEGORY_GROUPS.map((group, i) => (
            <div key={group.title}>
              <div
                className={`flex items-baseline justify-between border-b-[3px] border-black pb-2.5 ${i === 0 ? "" : "mt-14"} mb-[18px]`}
              >
                <h3 className="font-[family-name:var(--font-archivo-black)] text-[22px] uppercase tracking-[0.02em]">
                  {group.title}
                </h3>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
                  {group.meta}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-5">
                {group.categories.map((category) => {
                  const winner = categoryWinners.get(category);
                  if (!winner) return null;
                  return (
                    <Link
                      key={category}
                      href={`/category/${CATEGORY_SLUGS[category]}`}
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
          ))}

          {wildcardWinner && (
            <div>
              <div className="mt-14 mb-[18px] flex items-baseline justify-between border-b-[3px] border-black pb-2.5">
                <h3 className="font-[family-name:var(--font-archivo-black)] text-[22px] uppercase tracking-[0.02em]">
                  Wildcard
                </h3>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
                  Anything goes, 1 category
                </span>
              </div>
              <Link
                href={`/category/${CATEGORY_SLUGS[WILDCARD_CATEGORY]}`}
                className="relative grid min-h-[180px] grid-cols-1 items-center gap-6 overflow-hidden border-[3px] border-[#F5C518] bg-black p-9 transition hover:-translate-y-1 sm:grid-cols-[auto_1fr_auto] sm:gap-9 sm:p-[36px_44px]"
              >
                {wildcardWinner.product_image_url && (
                  <Image
                    src={wildcardWinner.product_image_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(110deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.25) 100%)",
                  }}
                />
                <div className="relative border-black/40 pr-0 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.12em] text-[#F5C518] sm:border-r-2 sm:pr-9">
                  Freestyle &middot; Gold
                </div>
                <div className="relative flex flex-col gap-1.5">
                  <div className="font-[family-name:var(--font-archivo-black)] text-[32px] uppercase leading-none text-white">
                    {wildcardWinner.entry_name}
                  </div>
                  <div className="text-[13px] uppercase tracking-[0.12em] text-gray-300">
                    {wildcardWinner.company_name} &middot; {wildcardWinner.country}
                  </div>
                </div>
                <div className="relative flex flex-col items-start gap-1.5 sm:items-end">
                  <div className="font-[family-name:var(--font-archivo-black)] text-[28px] leading-none text-[#F5C518]">
                    {formatScore(wildcardWinner.score)}
                  </div>
                  <div className="font-[family-name:var(--font-archivo-black)] text-[11px] uppercase tracking-[0.12em] text-white/80">
                    View category &rarr;
                  </div>
                </div>
              </Link>
            </div>
          )}
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
                  Enter EHSA {COMPETITION_YEAR}.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Send your entry to Berlin for the judging congress. Delivery window: 1 Feb – 15 Mar {COMPETITION_YEAR}.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.1em] text-[#F5C518]"
              >
                Log in to enter &rarr;
              </Link>
            </div>
            <div className="flex min-h-[190px] flex-col justify-between bg-black p-8">
              <div>
                <h3 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-tight text-white">
                  For press &amp; professionals.
                  <br />
                  Judge live in Berlin.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  EHSA {COMPETITION_YEAR} is judged in person by press and invited industry professionals over the congress days.
                </p>
              </div>
              <Link
                href="/contact"
                className="mt-5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.1em] text-[#F5C518]"
              >
                Get in touch &rarr;
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
      {SHOW_SPONSORS && (
        <section className="border-b border-black/10 bg-[#faf6ec] py-14">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-16 px-6">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              {PREVIOUS_COMPETITION_YEAR} Official Sponsors
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
      )}

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
