"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORY_SLUGS, slugifyMaker } from "@/lib/categories";

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

function formatScore(score: string | number | null) {
  if (score === null) return "—";
  return Number(score).toFixed(2);
}

export default function ResultsExplorer({ rows, linkable }: { rows: Row[]; linkable: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [award, setAward] = useState("all");
  const [area, setArea] = useState("all");

  const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.category))).sort(), [rows]);
  const awards = useMemo(
    () => Array.from(new Set(rows.map((r) => r.award).filter((a): a is string => !!a))).sort(),
    [rows]
  );
  const areas = useMemo(
    () => Array.from(new Set(rows.map((r) => r.area).filter((a): a is string => !!a))).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => category === "all" || r.category === category)
      .filter((r) => award === "all" || r.award === award)
      .filter((r) => area === "all" || r.area === area)
      .filter(
        (r) =>
          q === "" ||
          r.entry_name.toLowerCase().includes(q) ||
          r.company_name.toLowerCase().includes(q) ||
          (r.country ?? "").toLowerCase().includes(q)
      )
      .sort((a, b) => (a.category === b.category ? (a.position ?? 99) - (b.position ?? 99) : a.category.localeCompare(b.category)));
  }, [rows, query, category, award, area]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3.5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a sauce, maker or country"
          className="min-w-[240px] flex-1 border-[3px] border-black px-5 py-3 text-base outline-none focus:border-[#F5C518]"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border-[3px] border-black bg-white px-3.5 py-3 font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.04em] outline-none focus:border-[#F5C518]"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={award}
          onChange={(e) => setAward(e.target.value)}
          className="border-[3px] border-black bg-white px-3.5 py-3 font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.04em] outline-none focus:border-[#F5C518]"
        >
          <option value="all">All awards</option>
          {awards.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {areas.length > 1 && (
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="border-[3px] border-black bg-white px-3.5 py-3 font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.04em] outline-none focus:border-[#F5C518]"
          >
            <option value="all">EURO + INT</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
        {filtered.length} of {rows.length} award-winning entries
      </p>

      {filtered.length === 0 ? (
        <p className="border-2 border-dashed border-black/20 p-10 text-center text-black/50">
          No entries match that search.
        </p>
      ) : (
        <div className="overflow-x-auto border-2 border-black">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-3.5 text-left font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.06em]">
                  Sauce
                </th>
                <th className="p-3.5 text-left font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.06em]">
                  Maker
                </th>
                <th className="p-3.5 text-left font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.06em]">
                  Category
                </th>
                <th className="p-3.5 text-left font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.06em]">
                  Country
                </th>
                <th className="p-3.5 text-left font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.06em]">
                  Award
                </th>
                <th className="p-3.5 text-right font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.06em]">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.code} className={i % 2 === 0 ? "bg-white" : "bg-[#faf6ec]"}>
                  <td className="border-t border-black/10 p-3.5 font-semibold">{r.entry_name}</td>
                  <td className="border-t border-black/10 p-3.5">
                    {linkable ? (
                      <Link href={`/maker/${slugifyMaker(r.company_name)}`} className="border-b-2 border-black hover:opacity-70">
                        {r.company_name}
                      </Link>
                    ) : (
                      r.company_name
                    )}
                  </td>
                  <td className="border-t border-black/10 p-3.5">
                    {linkable && CATEGORY_SLUGS[r.category] ? (
                      <Link href={`/category/${CATEGORY_SLUGS[r.category]}`} className="border-b-2 border-black hover:opacity-70">
                        {r.category}
                      </Link>
                    ) : (
                      r.category
                    )}
                  </td>
                  <td className="border-t border-black/10 p-3.5 text-black/70">{r.country ?? "—"}</td>
                  <td className="border-t border-black/10 p-3.5">
                    {r.award ? (
                      <span className="bg-[#F5C518] px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.04em]">
                        {r.award}
                      </span>
                    ) : (
                      "—"
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
      )}
    </div>
  );
}
