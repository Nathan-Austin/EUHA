/**
 * Company information and VAT details
 * Source of truth for all company-related data across the application
 */

export const COMPANY_INFO = {
  name: 'Chili Punk Berlin',
  email: 'heataward@gmail.com',
  phone: '+4917682204595',
  whatsapp: '+4917682204595',
  address: {
    line1: 'Chili Punk Berlin',
    line2: 'Co/ DUTTON',
    street: 'Urbanstraße 96',
    postalCode: '10967',
    city: 'Berlin',
    country: 'Germany',
    // Full formatted address
    full: 'Chili Punk Berlin\nCo/ DUTTON\nUrbanstraße 96\n10967 Berlin\nGermany'
  },
  vat: {
    number: 'DE314890098',
    rate: 0.19 // 19% Germany standard VAT rate
  }
} as const;

// EU member states (2026), for VAT purposes — deliberately NOT the same set
// as the broader "European" region used for shipping/logistics categorization
// elsewhere (that one includes non-EU countries like UK, Switzerland, Norway).
// Includes common name variants, matched case-insensitively.
const EU_MEMBER_COUNTRIES = new Set([
  'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czech republic', 'czechia',
  'denmark', 'estonia', 'finland', 'france', 'germany', 'greece', 'hungary', 'ireland',
  'italy', 'latvia', 'lithuania', 'luxembourg', 'malta', 'netherlands', 'poland',
  'portugal', 'romania', 'slovakia', 'slovenia', 'spain', 'sweden',
]);

const GERMANY_NAMES = new Set(['germany', 'deutschland', 'de']);

export type VatTreatment = 'standard' | 'reverse_charge' | 'outside_scope';

/**
 * Determines VAT treatment under the general EU B2B services rule (VAT
 * Directive Art. 44): taxed where the customer is established.
 * - Germany (seller's own country): standard rate, always.
 * - Elsewhere in the EU, WITH a VAT number on file: reverse charge (0%,
 *   buyer self-assesses) — a VAT number is required to prove reverse-charge
 *   eligibility, so without one this falls through to standard rate.
 * - Outside the EU: outside the scope of VAT entirely (0%).
 * - Unrecognized/blank country: standard rate (safe default — never
 *   zero-rate a sale without being sure of the buyer's jurisdiction).
 *
 * This encodes the general rule, not a substitute for accountant sign-off —
 * confirm the wording/legal basis before relying on it for real invoices.
 */
export function determineVatTreatment(country: string | null | undefined, vatNumber: string | null | undefined): VatTreatment {
  const normalizedCountry = (country || '').trim().toLowerCase();
  const hasVatNumber = Boolean(vatNumber && vatNumber.trim());

  if (!normalizedCountry) return 'standard';
  if (GERMANY_NAMES.has(normalizedCountry)) return 'standard';
  if (EU_MEMBER_COUNTRIES.has(normalizedCountry)) return hasVatNumber ? 'reverse_charge' : 'standard';
  return 'outside_scope';
}

/**
 * Calculate VAT breakdown. For 'standard' treatment, VAT is extracted from a
 * VAT-inclusive gross amount (the price charged doesn't change by buyer —
 * see calculateVAT's callers). For 'reverse_charge'/'outside_scope', 0% VAT
 * applies and the full amount counts as net.
 */
export function calculateVAT(grossAmountCents: number, treatment: VatTreatment = 'standard') {
  const gross = grossAmountCents / 100;

  if (treatment !== 'standard') {
    return {
      gross: Math.round(gross * 100) / 100,
      net: Math.round(gross * 100) / 100,
      vat: 0,
      vatRate: 0,
      treatment,
    };
  }

  const net = gross / (1 + COMPANY_INFO.vat.rate);
  const vat = gross - net;

  return {
    gross: Math.round(gross * 100) / 100,
    net: Math.round(net * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    vatRate: COMPANY_INFO.vat.rate,
    treatment,
  };
}

/**
 * Format currency in Euros
 */
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
