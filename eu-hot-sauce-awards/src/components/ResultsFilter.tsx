'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

interface PastResult {
  id: string;
  code: string;
  area: string;
  category: string;
  award: string;
  position: number;
  global_rank: number | null;
  company_name: string;
  country: string | null;
  entry_name: string;
  short_description: string | null;
  flavor_profile: string | null;
  product_image_url: string | null;
  product_url: string | null;
  website: string | null;
}

interface ResultsFilterProps {
  results: PastResult[];
}

export default function ResultsFilter({ results }: ResultsFilterProps) {
  // Helper functions
  const getAwardIcon = (award: string) => {
    if (award.includes('GOLD')) return '🥇';
    if (award.includes('SILVER')) return '🥈';
    if (award.includes('BRONZE')) return '🥉';
    return '🏆';
  };

  const getCountryFlag = (country: string | null) => {
    if (!country) return '';
    const countryFlags: { [key: string]: string } = {
      'Germany': '🇩🇪',
      'UK': '🇬🇧',
      'Poland': '🇵🇱',
      'Austria': '🇦🇹',
      'Norway': '🇳🇴',
      'Netherlands': '🇳🇱',
      'Belgium': '🇧🇪',
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'USA': '🇺🇸',
      'Northern Ireland': '🇬🇧',
      'Ireland': '🇮🇪',
    };
    return countryFlags[country] || '🌍';
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAward, setSelectedAward] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [showTopTwentyOnly, setShowTopTwentyOnly] = useState(false);

  // Extract unique values for filters
  const categories = useMemo(() =>
    Array.from(new Set(results.map(r => r.category))).sort(),
    [results]
  );

  const awards = useMemo(() =>
    Array.from(new Set(results.map(r => r.award))).sort(),
    [results]
  );

  const countries = useMemo(() =>
    Array.from(new Set(results.map(r => r.country).filter(Boolean))).sort() as string[],
    [results]
  );

  const areas = useMemo(() =>
    Array.from(new Set(results.map(r => r.area).filter(Boolean))).sort() as string[],
    [results]
  );

  // Filter results
  const filteredResults = useMemo(() => {
    return results.filter(result => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          result.entry_name.toLowerCase().includes(search) ||
          result.company_name.toLowerCase().includes(search) ||
          result.code.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && result.category !== selectedCategory) return false;

      // Award filter
      if (selectedAward !== 'all' && result.award !== selectedAward) return false;

      // Country filter
      if (selectedCountry !== 'all' && result.country !== selectedCountry) return false;

      // Area filter
      if (selectedArea !== 'all' && result.area !== selectedArea) return false;

      // Top 20 filter
      if (showTopTwentyOnly && !result.global_rank) return false;

      return true;
    });
  }, [results, searchTerm, selectedCategory, selectedAward, selectedCountry, selectedArea, showTopTwentyOnly]);

  // Group by category
  const categorizedResults = useMemo(() => {
    const map = new Map<string, PastResult[]>();
    filteredResults.forEach(result => {
      if (!map.has(result.category)) {
        map.set(result.category, []);
      }
      map.get(result.category)!.push(result);
    });
    return Array.from(map.entries()).map(([category, winners]) => ({ category, winners }));
  }, [filteredResults]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedAward('all');
    setSelectedCountry('all');
    setSelectedArea('all');
    setShowTopTwentyOnly(false);
  };

  return (
    <>
      {/* Filter Controls */}
      <div className="mb-8 rounded-3xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80">
            Filter Results ({filteredResults.length} of {results.length})
          </h3>
          <button
            onClick={resetFilters}
            className="text-xs text-white/60 hover:text-white transition uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Sauce name, company, or code..."
              className="w-full bg-black/30 border border-white/20 rounded-lg py-2 px-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-black/30 border border-white/20 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Award Filter */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Award</label>
            <select
              value={selectedAward}
              onChange={(e) => setSelectedAward(e.target.value)}
              className="w-full bg-black/30 border border-white/20 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
            >
              <option value="all">All Awards</option>
              {awards.map(award => (
                <option key={award} value={award}>{award}</option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-black/30 border border-white/20 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
            >
              <option value="all">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Area Filter */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Area</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-black/30 border border-white/20 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
            >
              <option value="all">All Areas</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Top 20 Toggle */}
          <div className="flex items-end">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showTopTwentyOnly}
                onChange={(e) => setShowTopTwentyOnly(e.target.checked)}
                className="w-4 h-4 text-amber-500 bg-black/30 border-white/20 rounded focus:ring-amber-500/50 focus:ring-2"
              />
              <span className="ml-2 text-sm text-white/80">Top 20 Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      {categorizedResults.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/70 text-lg">No results match your filters</p>
        </div>
      ) : (
        categorizedResults.map((categoryGroup, idx) => (
          <div key={categoryGroup.category} className={idx > 0 ? 'mt-12' : ''}>
            <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-8 text-center">
                {categoryGroup.category}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryGroup.winners.map((winner) => (
                  <div
                    key={winner.id}
                    className="bg-black/30 p-6 rounded-lg border border-white/10 hover:border-amber-200/30 transition group"
                  >
                    {/* Product Image */}
                    {winner.product_image_url && (
                      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-black/20">
                        <Image
                          src={winner.product_image_url}
                          alt={winner.entry_name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    {/* Award Icon & Rank */}
                    <div className="text-center mb-3">
                      <div className="text-3xl mb-1">{getAwardIcon(winner.award)}</div>
                      {winner.global_rank && (
                        <div className="text-xs uppercase tracking-wider text-amber-200 font-bold">
                          Global Rank #{winner.global_rank}
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <h3 className="text-lg font-bold text-white mb-1 text-center line-clamp-2">
                      {winner.entry_name}
                    </h3>

                    {/* Company & Country */}
                    <p className="text-sm text-white/70 text-center mb-3">
                      by {winner.company_name} {getCountryFlag(winner.country)}
                    </p>

                    {/* Award Badge */}
                    <div className="text-center mb-3">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-200/20 text-amber-200 text-xs font-semibold uppercase tracking-wider">
                        {winner.award}
                      </span>
                    </div>

                    {/* Description */}
                    {winner.short_description && (
                      <p className="text-xs text-white/60 text-center line-clamp-3 mb-3">
                        {winner.short_description}
                      </p>
                    )}

                    {/* Links */}
                    <div className="flex justify-center gap-2 mt-4">
                      {winner.product_url && (
                        <a
                          href={winner.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-amber-200 hover:text-amber-100 transition"
                        >
                          View Product →
                        </a>
                      )}
                      {winner.website && (
                        <a
                          href={winner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white/60 hover:text-white/80 transition"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}
