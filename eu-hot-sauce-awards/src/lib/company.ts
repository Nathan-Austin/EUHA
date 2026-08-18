/**
 * Company information and VAT details
 * Source of truth for all company-related data across the application
 */

import { findCountry } from './countries';

// EHSA is formally structured under Austin & Gardner GbR (the same legal
// entity behind Republic of Heat / republicofheat.com) as of Aug 2026.
// Details sourced from ROH's own live Impressum (republicofheat.com/de-en/legal/impressum).
//
// Email is intentionally split: `email` stays the existing general/support
// inbox used everywhere day-to-day (contact form, sponsorship, entrant/judge
// support); `legalEmail` is only for GDPR-controller / Impressum contact
// points. Don't collapse these into one.
export const COMPANY_INFO = {
  name: 'Austin & Gardner GbR',
  partners: 'Simon Gardner & Nathan Austin',
  email: 'heataward@gmail.com',
  legalEmail: 'contact@republicofheat.com',
  phone: '+4917682204595',
  whatsapp: '+4917682204595',
  address: {
    line1: 'Austin & Gardner GbR',
    street: 'Südostallee 124',
    postalCode: '12487',
    city: 'Berlin',
    country: 'Germany',
    // Full formatted address
    full: 'Austin & Gardner GbR\nSüdostallee 124\n12487 Berlin\nGermany'
  },
  vat: {
    number: 'DE457184736',
    rate: 0.19 // 19% Germany standard VAT rate
  }
} as const;

export type VatTreatment = 'standard' | 'reverse_charge' | 'outside_scope';

/**
 * Determines VAT treatment under the general EU B2B services rule (VAT
 * Directive Art. 44): taxed where the customer is established.
 * - Germany (seller's own country): standard rate, always.
 * - Elsewhere in the EU, WITH a VAT number on file: reverse charge (0%,
 *   buyer self-assesses) — a VAT number is required to prove reverse-charge
 *   eligibility, so without one this falls through to standard rate.
 * - A recognized non-EU country: outside the scope of VAT entirely (0%).
 * - Blank, or a country we don't recognize (legacy free-text data from
 *   before the country field became a <select> — see lib/countries.ts):
 *   standard rate (safe default — never zero-rate a sale without being sure
 *   of the buyer's jurisdiction).
 *
 * This encodes the general rule, not a substitute for accountant sign-off —
 * confirm the wording/legal basis before relying on it for real invoices.
 */
export function determineVatTreatment(country: string | null | undefined, vatNumber: string | null | undefined): VatTreatment {
  const hasVatNumber = Boolean(vatNumber && vatNumber.trim());
  const match = findCountry(country);

  if (!match) return 'standard';
  if (match.isoCode === 'DE') return 'standard';
  if (match.isEuMember) return hasVatNumber ? 'reverse_charge' : 'standard';
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
