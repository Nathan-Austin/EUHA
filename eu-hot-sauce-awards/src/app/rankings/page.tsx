import Link from "next/link";
import type { Metadata } from "next";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import SauceImage from "@/components/SauceImage";
import { createClient } from "@/lib/supabase/server";
import { PREVIOUS_COMPETITION_YEAR } from "@/lib/config";
import { CATEGORY_SLUGS, slugifyMaker } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Global Rankings — European Hot Sauce Awards",
  description: "The top 20 hot sauces from the European Hot Sauce Awards global rankings.",
};

interface RankedSauce {
  code: string;
  global_rank: number;
  entry_name: string;
  company_name: string;
  country: string | null;
  category: string;
  award: string | null;
  product_image_url: string | null;
  score: string | number | null;
}

function formatScore(score: string | number | null) {
  if (score === null) return "—";
  return Number(score).toFixed(2);
}

async function getTopRankings(year: number) {
  const { cookies } = await import("next/headers");
  const supabase = createClient(cookies());
  const { data } = await supabase
    .from("past_results")
    .select("code, global_rank, entry_name, company_name, country, category, award, product_image_url, score")
    .eq("year", year)
    .not("global_rank", "is", null)
    .order("global_rank", { ascending: true })
    .limit(20);
  return (data as RankedSauce[]) ?? [];
}

export default async function RankingsPage({ searchParams }: { searchParams: { year?: string } }) {
  const year = searchParams.year ? parseInt(searchParams.year, 10) : PREVIOUS_COMPETITION_YEAR;
  const rankings = await getTopRankings(year);
  const isCurrentYear = year === PREVIOUS_COMPETITION_YEAR;
  const top3 = rankings.filter((r) => r.global_rank <= 3);
  const rest = rankings.filter((r) => r.global_rank > 3);

  return (
    <div className="bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Results", href: "/results" },
          { label: "Global Rankings" },
        ]}
      />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
            EHSA {year} &middot; Global Top 20
          </p>
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,64px)] uppercase leading-[0.95] text-white">
            The <span className="bg-[#F5C518] px-2 text-black">Top {rankings.length || 20}</span>.
          </h1>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href={`/rankings?year=${year - 1}`}
              className="border-[3px] border-white px-5 py-3 font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.06em] text-white hover:bg-white hover:text-black"
            >
              &larr; {year - 1}
            </Link>
            <Link
              href={`/rankings?year=${year + 1}`}
              className="border-[3px] border-white px-5 py-3 font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.06em] text-white hover:bg-white hover:text-black"
            >
              {year + 1} &rarr;
            </Link>
          </div>
        </div>
      </section>

      {rankings.length === 0 ? (
        <section className="py-20 text-center">
          <p className="text-lg text-black/60">Rankings will be available after the competition.</p>
          <Link href="/results" className="mt-4 inline-block border-b-2 border-black font-semibold">
            View all results &rarr;
          </Link>
        </section>
      ) : (
        <>
          {top3.length > 0 && (
            <section className="py-16">
              <div className="mx-auto max-w-[1000px] px-6">
                <div className="grid grid-cols-1 items-end gap-[18px] sm:grid-cols-[1fr_1.15fr_1fr]">
                  {[2, 1, 3].map((rank) => {
                    const entry = top3.find((r) => r.global_rank === rank);
                    if (!entry) return null;
                    const isGold = rank === 1;
                    const href = isCurrentYear ? `/maker/${slugifyMaker(entry.company_name)}` : undefined;
                    const Card = (
                      <div
                        className={`flex min-h-[220px] min-w-0 flex-col justify-between border-[3px] border-black p-[28px_22px] shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition hover:-translate-y-1 ${isGold ? "min-h-[260px] bg-[#F5C518]" : rank === 2 ? "bg-[#DCDCDC]" : "bg-[#DDA15E]"}`}
                      >
                        <div>
                          <span className="mb-3 inline-block bg-black px-[10px] py-[4px] font-[family-name:var(--font-archivo-black)] text-[11px] uppercase tracking-[0.08em] text-white">
                            Rank {rank}
                          </span>
                          <div className={`font-[family-name:var(--font-archivo-black)] leading-[0.85] text-black/85 ${isGold ? "text-[90px]" : "text-[64px] opacity-85"}`}>
                            0{rank}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-[family-name:var(--font-archivo-black)] text-lg uppercase leading-tight">
                            {entry.entry_name}
                          </div>
                          <div className="mt-1.5 truncate text-[12px] uppercase tracking-[0.1em] text-black/60">
                            {entry.company_name} &middot; {entry.country}
                          </div>
                          <div className="mt-3 font-[family-name:var(--font-archivo-black)] text-base">
                            {formatScore(entry.score)}
                          </div>
                        </div>
                      </div>
                    );
                    return href ? (
                      <Link key={rank} href={href}>
                        {Card}
                      </Link>
                    ) : (
                      <div key={rank}>{Card}</div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section className="pb-16">
              <div className="mx-auto max-w-[1240px] px-6">
                <div className="flex flex-col border-2 border-black">
                  {rest.map((r, i) => (
                    <div
                      key={r.code}
                      className={`flex items-center gap-5 p-4 ${i % 2 === 0 ? "bg-white" : "bg-[#faf6ec]"} ${i > 0 ? "border-t border-black/10" : ""}`}
                    >
                      <span className="w-12 flex-shrink-0 text-center font-[family-name:var(--font-archivo-black)] text-2xl text-black/70">
                        {r.global_rank}
                      </span>
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden border-2 border-black bg-[#F5C518]">
                        <SauceImage code={r.code} productImageUrl={r.product_image_url} name={r.entry_name} className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{r.entry_name}</div>
                        <div className="truncate text-xs uppercase tracking-[0.06em] text-black/50">
                          {isCurrentYear && CATEGORY_SLUGS[r.category] ? (
                            <Link href={`/category/${CATEGORY_SLUGS[r.category]}`} className="hover:underline">
                              {r.category}
                            </Link>
                          ) : (
                            r.category
                          )}{" "}
                          &middot;{" "}
                          {isCurrentYear ? (
                            <Link href={`/maker/${slugifyMaker(r.company_name)}`} className="hover:underline">
                              {r.company_name}
                            </Link>
                          ) : (
                            r.company_name
                          )}
                          {r.country ? ` · ${r.country}` : ""}
                        </div>
                      </div>
                      {r.award && (
                        <span className="hidden flex-shrink-0 bg-[#F5C518] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] sm:inline-block">
                          {r.award}
                        </span>
                      )}
                      <span className="w-16 flex-shrink-0 text-right font-[family-name:var(--font-archivo-black)] text-lg">
                        {formatScore(r.score)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="border-t border-black/10 bg-[#f3ead8] py-14">
            <div className="mx-auto max-w-[1240px] px-6">
              <h3 className="mb-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.12em] text-black/60">
                Methodology
              </h3>
              <p className="max-w-3xl text-[15px] leading-relaxed text-black/75">
                The Global Rankings are the top 20 sauces across every category at EHSA {year}, ranked by
                judges&rsquo; weighted average score. Each sauce is evaluated across flavour complexity, heat
                balance, ingredient quality, originality and overall sensory experience.
              </p>
              <div className="mt-7 flex flex-wrap gap-3.5">
                <Link
                  href={`/results/${year}`}
                  className="border-[3px] border-black bg-black px-6 py-3.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
                >
                  View all {year} results &rarr;
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      <HeatFooter />
    </div>
  );
}
