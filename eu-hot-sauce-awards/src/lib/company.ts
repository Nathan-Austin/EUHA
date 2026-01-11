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

/**
 * Calculate VAT breakdown from VAT-inclusive gross amount
 */
export function calculateVAT(grossAmountCents: number) {
  const gross = grossAmountCents / 100;
  const net = gross / (1 + COMPANY_INFO.vat.rate);
  const vat = gross - net;

  return {
    gross: Math.round(gross * 100) / 100,
    net: Math.round(net * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    vatRate: COMPANY_INFO.vat.rate
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
