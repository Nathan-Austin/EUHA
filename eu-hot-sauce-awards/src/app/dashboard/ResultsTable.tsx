'use client';

import { useEffect, useState } from 'react';
import { getResultsData, type SauceResult } from '@/app/actions';

const CAT_SHORT: Record<string, string> = {
  'Aroma': 'Aroma',
  'Flavor complexity': 'Flavor',
  'Heat balance': 'Heat',
  'Ingredient quality': 'Ingred.',
  'Originality': 'Origin.',
  'Overall sensory experience': 'Overall',
  'Visual presentation': 'Visual',
};

function fmt(n: number) {
  return n.toFixed(2);
}

function RegionBadge({ region }: { region: string }) {
  return region === 'international' ? (
    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">Intl.</span>
  ) : (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">EU</span>
  );
}

function ScoreCell({ score }: { score: number | undefined }) {
  if (score === undefined) return <td className="px-2 py-2 text-center text-gray-300 text-xs">—</td>;
  const color =
    score >= 8 ? 'text-green-700 font-semibold' :
    score >= 6 ? 'text-gray-800' :
    'text-red-600';
  return <td className={`px-2 py-2 text-center text-sm ${color}`}>{fmt(score)}</td>;
}

// Top 20 table — simpler, no per-scoring-category columns
function Top20Table({ results }: { results: SauceResult[] }) {
  const top20 = results.slice(0, 20);
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-3 py-3 text-left w-10">#</th>
            <th className="px-3 py-3 text-left">Code</th>
            <th className="px-3 py-3 text-left">Brand</th>
            <th className="px-3 py-3 text-left">Sauce</th>
            <th className="px-3 py-3 text-left">Category</th>
            <th className="px-3 py-3 text-center">Region</th>
            <th className="px-3 py-3 text-left">Country</th>
            <th className="px-3 py-3 text-center">Score</th>
            <th className="px-3 py-3 text-center">Judges</th>
          </tr>
        </thead>
        <tbody>
          {top20.map((sauce, i) => (
            <tr key={sauce.sauceId} className={`border-t ${i === 0 ? 'bg-yellow-50' : i === 1 ? 'bg-gray-50' : i === 2 ? 'bg-orange-50' : ''}`}>
              <td className="px-3 py-2 font-bold text-gray-500">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </td>
              <td className="px-3 py-2 font-mono text-xs font-semibold text-gray-700">{sauce.sauceCode}</td>
              <td className="px-3 py-2 text-gray-700">{sauce.brandName}</td>
              <td className="px-3 py-2 font-medium text-gray-900">{sauce.sauceName}</td>
              <td className="px-3 py-2 text-gray-500 text-xs">{sauce.sauceCategory}</td>
              <td className="px-3 py-2 text-center"><RegionBadge region={sauce.region} /></td>
              <td className="px-3 py-2 text-gray-500 text-xs">{sauce.country ?? '—'}</td>
              <td className="px-3 py-2 text-center font-bold text-orange-700">{fmt(sauce.finalScore)}</td>
              <td className="px-3 py-2 text-center text-gray-500">{sauce.judgeCount}</td>
            </tr>
          ))}
          {top20.length === 0 && (
            <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No scores yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Full detail table grouped by sauce category
function DetailTable({ results, scoringCategories }: { results: SauceResult[]; scoringCategories: string[] }) {
  // Group by sauce category, sort categories by best score in each group
  const grouped = new Map<string, SauceResult[]>();
  for (const r of results) {
    if (!grouped.has(r.sauceCategory)) grouped.set(r.sauceCategory, []);
    grouped.get(r.sauceCategory)!.push(r);
  }
  // Sort within each group by finalScore desc (already sorted globally but re-sort per group)
  for (const group of grouped.values()) {
    group.sort((a, b) => b.finalScore - a.finalScore);
  }
  // Sort groups by best score in group
  const sortedGroups = Array.from(grouped.entries()).sort(
    ([, a], [, b]) => (b[0]?.finalScore ?? 0) - (a[0]?.finalScore ?? 0)
  );

  if (sortedGroups.length === 0) {
    return <p className="py-8 text-center text-gray-400">No scores yet.</p>;
  }

  return (
    <div className="space-y-8">
      {sortedGroups.map(([category, sauces]) => (
        <div key={category}>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">{category}</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left w-8">#</th>
                  <th className="px-3 py-2 text-left">Code</th>
                  <th className="px-3 py-2 text-left">Brand</th>
                  <th className="px-3 py-2 text-left">Sauce</th>
                  <th className="px-3 py-2 text-left">Country</th>
                  {scoringCategories.map((cat) => (
                    <th key={cat} className="px-2 py-2 text-center text-xs" title={cat}>
                      {CAT_SHORT[cat] ?? cat}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-bold">Final</th>
                  <th className="px-3 py-2 text-center">Judges</th>
                </tr>
              </thead>
              <tbody>
                {sauces.map((sauce, i) => (
                  <tr key={sauce.sauceId} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 font-semibold text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs font-semibold text-gray-700">{sauce.sauceCode}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{sauce.brandName}</td>
                    <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{sauce.sauceName}</td>
                    <td className="px-3 py-2 text-gray-400 text-xs whitespace-nowrap">{sauce.country ?? '—'}</td>
                    {scoringCategories.map((cat) => (
                      <ScoreCell key={cat} score={sauce.categoryScores[cat]} />
                    ))}
                    <td className="px-3 py-2 text-center font-bold text-orange-700">{fmt(sauce.finalScore)}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{sauce.judgeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

type Tab = 'top20' | 'european' | 'international';

export default function ResultsTable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SauceResult[]>([]);
  const [scoringCategories, setScoringCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('top20');

  useEffect(() => {
    getResultsData().then((data) => {
      if ('error' in data) {
        setError(data.error);
      } else {
        setResults(data.results);
        setScoringCategories(data.scoringCategories);
      }
      setLoading(false);
    });
  }, []);

  const europeanResults = results.filter((r) => r.region === 'european');
  const internationalResults = results.filter((r) => r.region === 'international');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'top20', label: '🌍 World Top 20' },
    { id: 'european', label: `🇪🇺 European (${europeanResults.length})` },
    { id: 'international', label: `🌎 International (${internationalResults.length})` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        <span className="ml-3 text-gray-500">Loading results...</span>
      </div>
    );
  }

  if (error) {
    return <p className="py-8 text-center text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {results.length} sauces scored · Weights: Pro ×2.0 · Community ×1.0 · Supplier ×1.0
        </p>
        <button
          onClick={() => {
            setLoading(true);
            getResultsData().then((data) => {
              if (!('error' in data)) {
                setResults(data.results);
                setScoringCategories(data.scoringCategories);
              }
              setLoading(false);
            });
          }}
          className="text-xs text-orange-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'top20' && <Top20Table results={results} />}
      {activeTab === 'european' && (
        <DetailTable results={europeanResults} scoringCategories={scoringCategories} />
      )}
      {activeTab === 'international' && (
        <DetailTable results={internationalResults} scoringCategories={scoringCategories} />
      )}
    </div>
  );
}
