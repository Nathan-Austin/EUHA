"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MakerSummary } from "@/lib/pastResults";

function medalSummary(m: MakerSummary) {
  return [
    m.gold > 0 ? `${m.gold} Gold` : null,
    m.silver > 0 ? `${m.silver} Silver` : null,
    m.bronze > 0 ? `${m.bronze} Bronze` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function MakersDirectoryGrid({
  makers,
  initialQuery = "",
  initialCountry = "all",
}: {
  makers: MakerSummary[];
  initialQuery?: string;
  initialCountry?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [country, setCountry] = useState(initialCountry);

  const countries = useMemo(
    () => Array.from(new Set(makers.map((m) => m.country).filter((c): c is string => !!c))).sort(),
    [makers]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return makers
      .filter((m) => country === "all" || m.country === country)
      .filter(
        (m) =>
          q === "" ||
          m.company_name.toLowerCase().includes(q) ||
          (m.country ?? "").toLowerCase().includes(q) ||
          m.categories.some((c) => c.toLowerCase().includes(q))
      )
      .sort((a, b) => a.company_name.localeCompare(b.company_name));
  }, [makers, query, country]);

  return (
    <div>
      <div className="mb-9 flex flex-wrap gap-3.5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a maker, country or category"
          className="min-w-[280px] flex-1 border-[3px] border-black px-5 py-3.5 text-base outline-none focus:border-[#F5C518]"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="border-[3px] border-black bg-white px-4 py-3.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.04em] outline-none focus:border-[#F5C518]"
        >
          <option value="all">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
        {filtered.length} award-winning maker{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <p className="border-2 border-dashed border-black/20 p-10 text-center text-black/50">
          No makers match that search.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Link
              key={m.slug}
              href={`/maker/${m.slug}`}
              className="flex flex-col gap-2.5 border-2 border-black bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="font-[family-name:var(--font-archivo-black)] text-xl uppercase leading-none">
                {m.company_name}
              </span>
              <span className="text-xs uppercase tracking-[0.1em] text-black/60">{m.country}</span>
              <span className="text-[13px] text-black/70">{m.categories.join(", ")}</span>
              <div className="mt-auto flex items-baseline justify-between border-t border-black/10 pt-3">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-black/60">
                  {medalSummary(m)}
                </span>
                <span className="font-[family-name:var(--font-archivo-black)] text-lg">
                  {m.bestScore.toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
