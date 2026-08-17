'use client';

import { useState, useEffect } from 'react';

interface CategoryScore {
  category: string;
  avg_score: number;
}

interface SupplierResultSauce {
  sauceId: string;
  sauceCode: string;
  sauceName: string;
  category: string;
  award: string | null;
  globalRank: number | null;
  categoryRank: number | null;
  categoryTotal: number | null;
  overallAvg: number;
  scores: CategoryScore[];
  comments: string[];
}

interface SupplierResultsViewProps {
  year: number;
  sauces: SupplierResultSauce[];
}

function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

const AWARD_STYLES: Record<string, { label: string; className: string }> = {
  'GOLD (winner)': { label: '🏆 Category winner', className: 'bg-[#F5C518] text-black border-black' },
  GOLD: { label: '🥇 Gold', className: 'bg-[#F5C518] text-black border-black' },
  SILVER: { label: '🥈 Silver', className: 'bg-[#d9d9d9] text-black border-black' },
  BRONZE: { label: '🥉 Bronze', className: 'bg-[#cd7f32] text-white border-black' },
};

function ResultBadge({ sauce }: { sauce: SupplierResultSauce }) {
  if (sauce.award) {
    const style = AWARD_STYLES[sauce.award] ?? { label: sauce.award, className: 'bg-black/10 text-black border-black' };
    return (
      <span className={`inline-block border-2 px-3 py-1 text-xs font-bold uppercase tracking-[0.04em] ${style.className}`}>
        {style.label}
      </span>
    );
  }
  if (sauce.categoryRank && sauce.categoryTotal) {
    return (
      <span className="inline-block border-2 border-black/20 bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] text-black/70">
        {ordinalSuffix(sauce.categoryRank)} of {sauce.categoryTotal} in {sauce.category}
      </span>
    );
  }
  return null;
}

function SauceResultCard({ sauce }: { sauce: SupplierResultSauce }) {
  return (
    <div className="border-2 border-black p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-[family-name:var(--font-archivo-black)] text-base uppercase leading-tight">
            {sauce.sauceName}
          </h4>
          <p className="text-sm text-black/60">{sauce.category}</p>
        </div>
        <ResultBadge sauce={sauce} />
      </div>

      {sauce.globalRank && (
        <p className="text-sm font-semibold text-black">🌍 Global rank #{sauce.globalRank}</p>
      )}

      <div className="overflow-hidden border-2 border-black/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/5">
              <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.04em] text-black/60">Category</th>
              <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-[0.04em] text-black/60">Score</th>
            </tr>
          </thead>
          <tbody>
            {sauce.scores.map((s) => (
              <tr key={s.category} className="border-t border-black/10">
                <td className="px-3 py-2 text-black/80">{s.category}</td>
                <td className="px-3 py-2 text-right font-semibold text-black">{Number(s.avg_score).toFixed(1)}<span className="text-black/40">/10</span></td>
              </tr>
            ))}
            <tr className="border-t-2 border-black bg-[#F5C518]/20">
              <td className="px-3 py-2 font-bold uppercase tracking-[0.04em] text-black">Overall average</td>
              <td className="px-3 py-2 text-right text-base font-bold text-black">{Number(sauce.overallAvg).toFixed(2)}<span className="text-black/40 text-sm">/10</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {sauce.comments.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-black/50">Judge comments</p>
          <ul className="space-y-2 border-l-4 border-[#F5C518] bg-black/[0.03] py-3 pl-4 pr-3">
            {sauce.comments.map((c, i) => (
              <li key={i} className="text-sm italic leading-relaxed text-black/80">&ldquo;{c}&rdquo;</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function SupplierResultsView({ year, sauces }: SupplierResultsViewProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (sauces.length === 0) return null;

  const medalCount = sauces.filter((s) => s.award).length;

  return (
    <div className="border-[3px] border-black bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase">
            Your {year} results
          </h2>
          <p className="mt-1 text-sm text-black/60">
            {sauces.length} sauce{sauces.length === 1 ? '' : 's'} judged
            {medalCount > 0 && <> &bull; {medalCount} medal{medalCount === 1 ? '' : 's'}</>}
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex-shrink-0 border-2 border-black bg-black px-4 py-2 text-sm font-bold uppercase tracking-[0.04em] text-[#F5C518] hover:bg-black/80"
        >
          View {year} results
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 sm:flex sm:items-center sm:justify-center sm:p-4">
          <div className="h-full w-full overflow-y-auto bg-[#faf6ec] p-6 space-y-5 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-2xl sm:border-[3px] sm:border-black">
            <div className="flex items-center justify-between">
              <h3 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase">Your {year} results</h3>
              <button
                onClick={() => setOpen(false)}
                className="border-2 border-black px-3 py-1 text-sm font-semibold uppercase tracking-[0.04em] hover:bg-black hover:text-[#F5C518]"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-black/50">
              Scores are averaged across all judges on a scale of 1&ndash;10. We don&apos;t share individual judge details.
            </p>

            <div className="space-y-4">
              {sauces.map((sauce) => (
                <SauceResultCard key={sauce.sauceId} sauce={sauce} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
