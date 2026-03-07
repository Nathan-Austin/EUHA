/**
 * Country Code Mapping for DHL API
 * DHL requires ISO 3166-1 alpha-3 country codes (e.g., 'DEU', 'GBR', 'NLD')
 */

const COUNTRY_CODE_MAP: Record<string, string> = {
  // Alpha-2 to Alpha-3
  'DE': 'DEU', 'AT': 'AUT', 'BE': 'BEL', 'BG': 'BGR', 'HR': 'HRV',
  'CY': 'CYP', 'CZ': 'CZE', 'DK': 'DNK', 'EE': 'EST', 'FI': 'FIN',
  'FR': 'FRA', 'GR': 'GRC', 'HU': 'HUN', 'IE': 'IRL', 'IT': 'ITA',
  'LV': 'LVA', 'LT': 'LTU', 'LU': 'LUX', 'MT': 'MLT', 'NL': 'NLD',
  'PL': 'POL', 'PT': 'PRT', 'RO': 'ROU', 'SK': 'SVK', 'SI': 'SVN',
  'ES': 'ESP', 'SE': 'SWE', 'GB': 'GBR', 'UK': 'GBR', 'CH': 'CHE',
  'NO': 'NOR', 'IS': 'ISL',

  // Full country names
  'GERMANY': 'DEU', 'AUSTRIA': 'AUT', 'BELGIUM': 'BEL', 'BULGARIA': 'BGR',
  'CROATIA': 'HRV', 'CYPRUS': 'CYP', 'CZECH REPUBLIC': 'CZE', 'CZECHIA': 'CZE',
  'DENMARK': 'DNK', 'ESTONIA': 'EST', 'FINLAND': 'FIN', 'FRANCE': 'FRA',
  'GREECE': 'GRC', 'HUNGARY': 'HUN', 'IRELAND': 'IRL', 'ITALY': 'ITA',
  'LATVIA': 'LVA', 'LITHUANIA': 'LTU', 'LUXEMBOURG': 'LUX', 'MALTA': 'MLT',
  'NETHERLANDS': 'NLD', 'POLAND': 'POL', 'PORTUGAL': 'PRT', 'ROMANIA': 'ROU',
  'SLOVAKIA': 'SVK', 'SLOVENIA': 'SVN', 'SPAIN': 'ESP', 'SWEDEN': 'SWE',
  'UNITED KINGDOM': 'GBR', 'GREAT BRITAIN': 'GBR', 'SWITZERLAND': 'CHE',
  'NORWAY': 'NOR', 'ICELAND': 'ISL',
};

/**
 * Convert country code/name to ISO 3166-1 alpha-3 required by DHL.
 * Accepts alpha-2 (DE), alpha-3 (DEU), or full name (Germany).
 */
export function toISO3(countryInput: string): string {
  if (!countryInput) return 'DEU';

  const normalized = countryInput.trim().toUpperCase();

  // Already a valid alpha-3 value
  if (Object.values(COUNTRY_CODE_MAP).includes(normalized)) {
    return normalized;
  }

  const mapped = COUNTRY_CODE_MAP[normalized];
  if (mapped) return mapped;

  console.warn(`[DHL] Unknown country "${countryInput}", defaulting to DEU`);
  return 'DEU';
}

/**
 * Parse a free-text street address into the separate street + house number
 * fields that DHL requires. Handles common German formats and c/o prefixes.
 *
 * Examples:
 *   "Martin-Luther-Str. 14"  → { street: "Martin-Luther-Str.", houseNumber: "14" }
 *   "Schinkestr.\n8"         → { street: "Schinkestr.", houseNumber: "8" }
 *   "98 Rudolf Seiffert"     → { street: "Rudolf Seiffert", houseNumber: "98" }
 */
export function parseStreetAddress(fullAddress: string): { street: string; houseNumber: string } {
  if (!fullAddress) return { street: '', houseNumber: '1' };

  // Strip c/o prefix if it wasn't already moved to address_line2
  const cleaned = fullAddress.replace(/^c\/o\s+[^,\n]+[,\n]\s*/i, '').trim();

  // Normalise newlines/tabs to spaces
  const normalised = cleaned.replace(/[\r\n\t]+/g, ' ').trim();

  // Standard format: "Street Name 123" or "Street Name 123a"
  const trailingNumber = normalised.match(/^(.+?)\s+(\d+[a-zA-Z]*)$/);
  if (trailingNumber) {
    return { street: trailingNumber[1].trim(), houseNumber: trailingNumber[2].trim() };
  }

  // Leading number format: "98 Rudolf Seiffert"
  const leadingNumber = normalised.match(/^(\d+[a-zA-Z]*)\s+(.+)$/);
  if (leadingNumber) {
    return { street: leadingNumber[2].trim(), houseNumber: leadingNumber[1].trim() };
  }

  console.warn(`[DHL] Could not parse house number from "${fullAddress}"`);
  return { street: normalised, houseNumber: '1' };
}

export const AVAILABLE_SHIPPING_COUNTRIES = [
  { code: 'DE', iso3: 'DEU', name: 'Germany' },
  { code: 'AT', iso3: 'AUT', name: 'Austria' },
  { code: 'BE', iso3: 'BEL', name: 'Belgium' },
  { code: 'BG', iso3: 'BGR', name: 'Bulgaria' },
  { code: 'HR', iso3: 'HRV', name: 'Croatia' },
  { code: 'CY', iso3: 'CYP', name: 'Cyprus' },
  { code: 'CZ', iso3: 'CZE', name: 'Czech Republic' },
  { code: 'DK', iso3: 'DNK', name: 'Denmark' },
  { code: 'EE', iso3: 'EST', name: 'Estonia' },
  { code: 'FI', iso3: 'FIN', name: 'Finland' },
  { code: 'FR', iso3: 'FRA', name: 'France' },
  { code: 'GR', iso3: 'GRC', name: 'Greece' },
  { code: 'HU', iso3: 'HUN', name: 'Hungary' },
  { code: 'IE', iso3: 'IRL', name: 'Ireland' },
  { code: 'IT', iso3: 'ITA', name: 'Italy' },
  { code: 'LV', iso3: 'LVA', name: 'Latvia' },
  { code: 'LT', iso3: 'LTU', name: 'Lithuania' },
  { code: 'LU', iso3: 'LUX', name: 'Luxembourg' },
  { code: 'MT', iso3: 'MLT', name: 'Malta' },
  { code: 'NL', iso3: 'NLD', name: 'Netherlands' },
  { code: 'PL', iso3: 'POL', name: 'Poland' },
  { code: 'PT', iso3: 'PRT', name: 'Portugal' },
  { code: 'RO', iso3: 'ROU', name: 'Romania' },
  { code: 'SK', iso3: 'SVK', name: 'Slovakia' },
  { code: 'SI', iso3: 'SVN', name: 'Slovenia' },
  { code: 'ES', iso3: 'ESP', name: 'Spain' },
  { code: 'SE', iso3: 'SWE', name: 'Sweden' },
  { code: 'CH', iso3: 'CHE', name: 'Switzerland' },
  { code: 'NO', iso3: 'NOR', name: 'Norway' },
  { code: 'IS', iso3: 'ISL', name: 'Iceland' },
];
