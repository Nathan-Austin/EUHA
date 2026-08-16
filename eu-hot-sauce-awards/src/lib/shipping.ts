/**
 * Physical shipping address for incoming sauce entries.
 * Single source of truth — every page and email that tells a supplier where
 * to ship their bottles should read from here, not hardcode the address, so
 * a correction is a one-line change instead of a grep-and-replace.
 *
 * Current but UNCONFIRMED as of 2027 planning — verify with Nathan before
 * this goes out in a bulk email or gets printed on physical materials.
 */

export const SHIPPING_ADDRESS = {
  line1: 'EU Hot Sauce Awards',
  line2: 'c/o CBS Foods GmbH',
  street: 'Colditzstraße 35',
  postalCode: '12099',
  city: 'Berlin',
  country: 'Germany',
  // Full formatted address, one line per array entry — reused for both
  // plain-text emails (join with '\n') and HTML emails (join with '<br />').
  lines: ['EU Hot Sauce Awards', 'c/o CBS Foods GmbH', 'Colditzstraße 35', '12099 Berlin', 'Germany'],
} as const;

export function formatShippingAddressText(): string {
  return SHIPPING_ADDRESS.lines.join('\n');
}

export function formatShippingAddressHtml(): string {
  return SHIPPING_ADDRESS.lines.join('<br />');
}
