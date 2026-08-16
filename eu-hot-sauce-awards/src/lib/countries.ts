/**
 * Single canonical country list for the whole app — supplier registration,
 * Producer Info delivery/billing addresses, VAT-treatment determination,
 * and (eventually) supplier DHL award-shipping labels all read from this
 * one list instead of each maintaining its own free-text matching.
 *
 * `name` is both the display label AND the value stored/selected — kept as
 * a readable name (not an ISO code) so every existing place that already
 * displays `suppliers.country` as-is keeps working unchanged. `isoCode` is
 * carried for future use (e.g. wiring supplier addresses into the DHL label
 * flow, which already keys off ISO codes in lib/dhl/countries.ts).
 *
 * Because this is now a closed list used via a <select> (not free text),
 * "recognized country" and "exact spelling" are the same question — no
 * fuzzy/variant matching needed anywhere downstream.
 */

export type CountryRegion = 'Europe' | 'Americas' | 'Asia Pacific' | 'Middle East & Africa';

export interface CountryOption {
  name: string;
  isoCode: string;
  isEuMember: boolean;
  region: CountryRegion;
}

export const COUNTRIES: CountryOption[] = [
  // Europe — EU members
  { name: 'Austria', isoCode: 'AT', isEuMember: true, region: 'Europe' },
  { name: 'Belgium', isoCode: 'BE', isEuMember: true, region: 'Europe' },
  { name: 'Bulgaria', isoCode: 'BG', isEuMember: true, region: 'Europe' },
  { name: 'Croatia', isoCode: 'HR', isEuMember: true, region: 'Europe' },
  { name: 'Cyprus', isoCode: 'CY', isEuMember: true, region: 'Europe' },
  { name: 'Czech Republic', isoCode: 'CZ', isEuMember: true, region: 'Europe' },
  { name: 'Denmark', isoCode: 'DK', isEuMember: true, region: 'Europe' },
  { name: 'Estonia', isoCode: 'EE', isEuMember: true, region: 'Europe' },
  { name: 'Finland', isoCode: 'FI', isEuMember: true, region: 'Europe' },
  { name: 'France', isoCode: 'FR', isEuMember: true, region: 'Europe' },
  { name: 'Germany', isoCode: 'DE', isEuMember: true, region: 'Europe' },
  { name: 'Greece', isoCode: 'GR', isEuMember: true, region: 'Europe' },
  { name: 'Hungary', isoCode: 'HU', isEuMember: true, region: 'Europe' },
  { name: 'Ireland', isoCode: 'IE', isEuMember: true, region: 'Europe' },
  { name: 'Italy', isoCode: 'IT', isEuMember: true, region: 'Europe' },
  { name: 'Latvia', isoCode: 'LV', isEuMember: true, region: 'Europe' },
  { name: 'Lithuania', isoCode: 'LT', isEuMember: true, region: 'Europe' },
  { name: 'Luxembourg', isoCode: 'LU', isEuMember: true, region: 'Europe' },
  { name: 'Malta', isoCode: 'MT', isEuMember: true, region: 'Europe' },
  { name: 'Netherlands', isoCode: 'NL', isEuMember: true, region: 'Europe' },
  { name: 'Poland', isoCode: 'PL', isEuMember: true, region: 'Europe' },
  { name: 'Portugal', isoCode: 'PT', isEuMember: true, region: 'Europe' },
  { name: 'Romania', isoCode: 'RO', isEuMember: true, region: 'Europe' },
  { name: 'Slovakia', isoCode: 'SK', isEuMember: true, region: 'Europe' },
  { name: 'Slovenia', isoCode: 'SI', isEuMember: true, region: 'Europe' },
  { name: 'Spain', isoCode: 'ES', isEuMember: true, region: 'Europe' },
  { name: 'Sweden', isoCode: 'SE', isEuMember: true, region: 'Europe' },

  // Europe — non-EU
  { name: 'United Kingdom', isoCode: 'GB', isEuMember: false, region: 'Europe' },
  { name: 'Switzerland', isoCode: 'CH', isEuMember: false, region: 'Europe' },
  { name: 'Norway', isoCode: 'NO', isEuMember: false, region: 'Europe' },
  { name: 'Iceland', isoCode: 'IS', isEuMember: false, region: 'Europe' },
  { name: 'Liechtenstein', isoCode: 'LI', isEuMember: false, region: 'Europe' },
  { name: 'Albania', isoCode: 'AL', isEuMember: false, region: 'Europe' },
  { name: 'Andorra', isoCode: 'AD', isEuMember: false, region: 'Europe' },
  { name: 'Bosnia and Herzegovina', isoCode: 'BA', isEuMember: false, region: 'Europe' },
  { name: 'Kosovo', isoCode: 'XK', isEuMember: false, region: 'Europe' },
  { name: 'Moldova', isoCode: 'MD', isEuMember: false, region: 'Europe' },
  { name: 'Monaco', isoCode: 'MC', isEuMember: false, region: 'Europe' },
  { name: 'Montenegro', isoCode: 'ME', isEuMember: false, region: 'Europe' },
  { name: 'North Macedonia', isoCode: 'MK', isEuMember: false, region: 'Europe' },
  { name: 'San Marino', isoCode: 'SM', isEuMember: false, region: 'Europe' },
  { name: 'Serbia', isoCode: 'RS', isEuMember: false, region: 'Europe' },
  { name: 'Ukraine', isoCode: 'UA', isEuMember: false, region: 'Europe' },

  // Americas
  { name: 'United States', isoCode: 'US', isEuMember: false, region: 'Americas' },
  { name: 'Canada', isoCode: 'CA', isEuMember: false, region: 'Americas' },
  { name: 'Mexico', isoCode: 'MX', isEuMember: false, region: 'Americas' },
  { name: 'Argentina', isoCode: 'AR', isEuMember: false, region: 'Americas' },
  { name: 'Brazil', isoCode: 'BR', isEuMember: false, region: 'Americas' },
  { name: 'Chile', isoCode: 'CL', isEuMember: false, region: 'Americas' },
  { name: 'Colombia', isoCode: 'CO', isEuMember: false, region: 'Americas' },
  { name: 'Peru', isoCode: 'PE', isEuMember: false, region: 'Americas' },
  { name: 'Costa Rica', isoCode: 'CR', isEuMember: false, region: 'Americas' },
  { name: 'Guatemala', isoCode: 'GT', isEuMember: false, region: 'Americas' },
  { name: 'Panama', isoCode: 'PA', isEuMember: false, region: 'Americas' },
  { name: 'Belize', isoCode: 'BZ', isEuMember: false, region: 'Americas' },
  { name: 'Jamaica', isoCode: 'JM', isEuMember: false, region: 'Americas' },
  { name: 'Dominican Republic', isoCode: 'DO', isEuMember: false, region: 'Americas' },

  // Asia Pacific
  { name: 'Australia', isoCode: 'AU', isEuMember: false, region: 'Asia Pacific' },
  { name: 'New Zealand', isoCode: 'NZ', isEuMember: false, region: 'Asia Pacific' },
  { name: 'Japan', isoCode: 'JP', isEuMember: false, region: 'Asia Pacific' },
  { name: 'South Korea', isoCode: 'KR', isEuMember: false, region: 'Asia Pacific' },
  { name: 'China', isoCode: 'CN', isEuMember: false, region: 'Asia Pacific' },
  { name: 'Hong Kong', isoCode: 'HK', isEuMember: false, region: 'Asia Pacific' },
  { name: 'Taiwan', isoCode: 'TW', isEuMember: false, region: 'Asia Pacific' },
  { name: 'Singapore', isoCode: 'SG', isEuMember: false, region: 'Asia Pacific' },
  { name: 'Malaysia', isoCode: 'MY', isEuMember: false, region: 'Asia Pacific' },
  { name: 'Thailand', isoCode: 'TH', isEuMember: false, region: 'Asia Pacific' },
  { name: 'Vietnam', isoCode: 'VN', isEuMember: false, region: 'Asia Pacific' },
  { name: 'Indonesia', isoCode: 'ID', isEuMember: false, region: 'Asia Pacific' },
  { name: 'Philippines', isoCode: 'PH', isEuMember: false, region: 'Asia Pacific' },
  { name: 'India', isoCode: 'IN', isEuMember: false, region: 'Asia Pacific' },

  // Middle East & Africa
  { name: 'United Arab Emirates', isoCode: 'AE', isEuMember: false, region: 'Middle East & Africa' },
  { name: 'Saudi Arabia', isoCode: 'SA', isEuMember: false, region: 'Middle East & Africa' },
  { name: 'Israel', isoCode: 'IL', isEuMember: false, region: 'Middle East & Africa' },
  { name: 'Turkey', isoCode: 'TR', isEuMember: false, region: 'Middle East & Africa' },
  { name: 'Qatar', isoCode: 'QA', isEuMember: false, region: 'Middle East & Africa' },
  { name: 'South Africa', isoCode: 'ZA', isEuMember: false, region: 'Middle East & Africa' },
  { name: 'Nigeria', isoCode: 'NG', isEuMember: false, region: 'Middle East & Africa' },
  { name: 'Kenya', isoCode: 'KE', isEuMember: false, region: 'Middle East & Africa' },
  { name: 'Egypt', isoCode: 'EG', isEuMember: false, region: 'Middle East & Africa' },
  { name: 'Morocco', isoCode: 'MA', isEuMember: false, region: 'Middle East & Africa' },
];

export const COUNTRY_REGIONS: CountryRegion[] = ['Europe', 'Americas', 'Asia Pacific', 'Middle East & Africa'];

const COUNTRY_BY_NAME = new Map(COUNTRIES.map((c) => [c.name, c]));

/** True only for an exact match against the canonical list — no fuzzy matching. */
export function findCountry(name: string | null | undefined): CountryOption | null {
  if (!name) return null;
  return COUNTRY_BY_NAME.get(name.trim()) || null;
}

export function isRecognizedCountry(name: string | null | undefined): boolean {
  return findCountry(name) !== null;
}

export function isEuMemberCountry(name: string | null | undefined): boolean {
  return findCountry(name)?.isEuMember ?? false;
}

export function isGermanyCountry(name: string | null | undefined): boolean {
  return findCountry(name)?.isoCode === 'DE';
}
