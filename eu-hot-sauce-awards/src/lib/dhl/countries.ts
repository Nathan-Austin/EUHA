/**
 * Country Code Mapping for DHL API
 * DHL requires ISO 3166-1 alpha-3 country codes (e.g., 'DEU', 'GBR', 'NLD')
 */

const COUNTRY_CODE_MAP: Record<string, string> = {
  // Alpha-2 to Alpha-3 — Europe
  'DE': 'DEU', 'AT': 'AUT', 'BE': 'BEL', 'BG': 'BGR', 'HR': 'HRV',
  'CY': 'CYP', 'CZ': 'CZE', 'DK': 'DNK', 'EE': 'EST', 'FI': 'FIN',
  'FR': 'FRA', 'GR': 'GRC', 'HU': 'HUN', 'IE': 'IRL', 'IT': 'ITA',
  'LV': 'LVA', 'LT': 'LTU', 'LU': 'LUX', 'MT': 'MLT', 'NL': 'NLD',
  'PL': 'POL', 'PT': 'PRT', 'RO': 'ROU', 'SK': 'SVK', 'SI': 'SVN',
  'ES': 'ESP', 'SE': 'SWE', 'GB': 'GBR', 'UK': 'GBR', 'CH': 'CHE',
  'NO': 'NOR', 'IS': 'ISL', 'AL': 'ALB', 'AD': 'AND', 'AM': 'ARM',
  'AZ': 'AZE', 'BA': 'BIH', 'BY': 'BLR', 'GE': 'GEO', 'LI': 'LIE',
  'MD': 'MDA', 'MC': 'MCO', 'ME': 'MNE', 'MK': 'MKD', 'RU': 'RUS',
  'SM': 'SMR', 'RS': 'SRB', 'UA': 'UKR', 'VA': 'VAT',
  // Americas
  'US': 'USA', 'CA': 'CAN', 'MX': 'MEX', 'AR': 'ARG', 'BR': 'BRA',
  'CL': 'CHL', 'CO': 'COL', 'PE': 'PER', 'UY': 'URY', 'PY': 'PRY',
  'BO': 'BOL', 'VE': 'VEN', 'EC': 'ECU', 'GY': 'GUY', 'SR': 'SUR',
  'CR': 'CRI', 'GT': 'GTM', 'HN': 'HND', 'SV': 'SLV', 'NI': 'NIC',
  'PA': 'PAN', 'BZ': 'BLZ', 'JM': 'JAM', 'TT': 'TTO', 'BB': 'BRB',
  'BS': 'BHS', 'CU': 'CUB', 'DO': 'DOM', 'HT': 'HTI', 'PR': 'PRI',
  // Asia-Pacific
  'AU': 'AUS', 'NZ': 'NZL', 'JP': 'JPN', 'KR': 'KOR', 'CN': 'CHN',
  'HK': 'HKG', 'TW': 'TWN', 'SG': 'SGP', 'MY': 'MYS', 'TH': 'THA',
  'VN': 'VNM', 'ID': 'IDN', 'PH': 'PHL', 'IN': 'IND', 'PK': 'PAK',
  'LK': 'LKA', 'BD': 'BGD', 'NP': 'NPL', 'MV': 'MDV', 'BT': 'BTN',
  'MM': 'MMR', 'KH': 'KHM', 'LA': 'LAO', 'BN': 'BRN', 'MN': 'MNG',
  'KZ': 'KAZ', 'UZ': 'UZB', 'TM': 'TKM', 'KG': 'KGZ', 'TJ': 'TJK',
  'AF': 'AFG', 'IR': 'IRN', 'IQ': 'IRQ',
  // Middle East
  'AE': 'ARE', 'SA': 'SAU', 'IL': 'ISR', 'TR': 'TUR', 'JO': 'JOR',
  'LB': 'LBN', 'KW': 'KWT', 'QA': 'QAT', 'BH': 'BHR', 'OM': 'OMN',
  'YE': 'YEM', 'SY': 'SYR',
  // Africa
  'ZA': 'ZAF', 'NG': 'NGA', 'KE': 'KEN', 'GH': 'GHA', 'EG': 'EGY',
  'MA': 'MAR', 'TN': 'TUN', 'DZ': 'DZA', 'ET': 'ETH', 'TZ': 'TZA',
  'UG': 'UGA', 'RW': 'RWA', 'SN': 'SEN', 'CI': 'CIV', 'CM': 'CMR',
  'ZM': 'ZMB', 'ZW': 'ZWE', 'MZ': 'MOZ', 'AO': 'AGO', 'MG': 'MDG',

  // Full country names — Europe (including German-language variants)
  'GERMANY': 'DEU', 'DEUTSCHLAND': 'DEU',
  'AUSTRIA': 'AUT', 'ÖSTERREICH': 'AUT', 'OESTERREICH': 'AUT', 'BELGIUM': 'BEL', 'BULGARIA': 'BGR',
  'CROATIA': 'HRV', 'CYPRUS': 'CYP', 'CZECH REPUBLIC': 'CZE', 'CZECHIA': 'CZE',
  'DENMARK': 'DNK', 'ESTONIA': 'EST', 'FINLAND': 'FIN', 'ÅLAND': 'FIN', 'ALAND': 'FIN', 'FRANCE': 'FRA',
  'GREECE': 'GRC', 'HUNGARY': 'HUN', 'IRELAND': 'IRL', 'ITALY': 'ITA',
  'LATVIA': 'LVA', 'LITHUANIA': 'LTU', 'LUXEMBOURG': 'LUX', 'MALTA': 'MLT',
  'NETHERLANDS': 'NLD', 'THE NETHERLANDS': 'NLD',
  'POLAND': 'POL', 'PORTUGAL': 'PRT', 'ROMANIA': 'ROU',
  'SLOVAKIA': 'SVK', 'SLOVENIA': 'SVN', 'SLOVENIJA': 'SVN',
  'SPAIN': 'ESP', 'SWEDEN': 'SWE',
  'UNITED KINGDOM': 'GBR', 'GREAT BRITAIN': 'GBR', 'SWITZERLAND': 'CHE',
  'NORWAY': 'NOR', 'ICELAND': 'ISL', 'ALBANIA': 'ALB', 'ANDORRA': 'AND',
  'ARMENIA': 'ARM', 'AZERBAIJAN': 'AZE', 'BOSNIA AND HERZEGOVINA': 'BIH',
  'BELARUS': 'BLR', 'GEORGIA': 'GEO', 'LIECHTENSTEIN': 'LIE', 'MOLDOVA': 'MDA',
  'MONACO': 'MCO', 'MONTENEGRO': 'MNE', 'NORTH MACEDONIA': 'MKD', 'RUSSIA': 'RUS',
  'SAN MARINO': 'SMR', 'SERBIA': 'SRB', 'UKRAINE': 'UKR',
  // Americas
  'UNITED STATES': 'USA', 'UNITED STATES OF AMERICA': 'USA', 'USA': 'USA',
  'CANADA': 'CAN', 'MEXICO': 'MEX', 'ARGENTINA': 'ARG', 'BRAZIL': 'BRA',
  'CHILE': 'CHL', 'COLOMBIA': 'COL', 'PERU': 'PER', 'URUGUAY': 'URY',
  'PARAGUAY': 'PRY', 'BOLIVIA': 'BOL', 'VENEZUELA': 'VEN', 'ECUADOR': 'ECU',
  'GUYANA': 'GUY', 'SURINAME': 'SUR', 'COSTA RICA': 'CRI', 'GUATEMALA': 'GTM',
  'HONDURAS': 'HND', 'EL SALVADOR': 'SLV', 'NICARAGUA': 'NIC', 'PANAMA': 'PAN',
  'BELIZE': 'BLZ', 'JAMAICA': 'JAM', 'TRINIDAD AND TOBAGO': 'TTO',
  'BARBADOS': 'BRB', 'BAHAMAS': 'BHS', 'CUBA': 'CUB',
  'DOMINICAN REPUBLIC': 'DOM', 'HAITI': 'HTI',
  // Asia-Pacific
  'AUSTRALIA': 'AUS', 'NEW ZEALAND': 'NZL', 'JAPAN': 'JPN', 'SOUTH KOREA': 'KOR',
  'CHINA': 'CHN', 'HONG KONG': 'HKG', 'TAIWAN': 'TWN', 'SINGAPORE': 'SGP',
  'MALAYSIA': 'MYS', 'THAILAND': 'THA', 'VIETNAM': 'VNM', 'INDONESIA': 'IDN',
  'PHILIPPINES': 'PHL', 'INDIA': 'IND', 'PAKISTAN': 'PAK', 'SRI LANKA': 'LKA',
  'BANGLADESH': 'BGD', 'NEPAL': 'NPL', 'MYANMAR': 'MMR', 'CAMBODIA': 'KHM',
  'LAOS': 'LAO', 'BRUNEI': 'BRN', 'MONGOLIA': 'MNG', 'KAZAKHSTAN': 'KAZ',
  // Middle East
  'UNITED ARAB EMIRATES': 'ARE', 'UAE': 'ARE', 'SAUDI ARABIA': 'SAU',
  'ISRAEL': 'ISR', 'TURKEY': 'TUR', 'JORDAN': 'JOR', 'LEBANON': 'LBN',
  'KUWAIT': 'KWT', 'QATAR': 'QAT', 'BAHRAIN': 'BHR', 'OMAN': 'OMN',
  // Africa
  'SOUTH AFRICA': 'ZAF', 'NIGERIA': 'NGA', 'KENYA': 'KEN', 'GHANA': 'GHA',
  'EGYPT': 'EGY', 'MOROCCO': 'MAR', 'TUNISIA': 'TUN', 'ETHIOPIA': 'ETH',
  'TANZANIA': 'TZA', 'UGANDA': 'UGA', 'RWANDA': 'RWA', 'SENEGAL': 'SEN',
  'IVORY COAST': 'CIV', "COTE D'IVOIRE": 'CIV', 'CAMEROON': 'CMR',
  'ZAMBIA': 'ZMB', 'ZIMBABWE': 'ZWE', 'MOZAMBIQUE': 'MOZ', 'ANGOLA': 'AGO',
  'MADAGASCAR': 'MDG', 'ALGERIA': 'DZA',
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

/**
 * EU member states (ISO 3166-1 alpha-3) that are in the EU customs union.
 * Shipments to these countries from Germany do not require a customs declaration.
 */
export const EU_CUSTOMS_EXEMPT = new Set([
  'AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA',
  'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD',
  'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE',
]);

/**
 * Returns true if the destination country requires a customs declaration
 * (i.e. it is outside the EU customs union).
 */
export function needsCustoms(iso3: string): boolean {
  return !EU_CUSTOMS_EXEMPT.has(iso3.toUpperCase());
}

/**
 * Non-EU countries that use DHL Paket International (V53WPAK) instead of
 * Warenpost International due to unreliable customs processing times.
 */
const PAKET_INTERNATIONAL_COUNTRIES = new Set(['BLZ', 'CRI']);

/**
 * Returns the appropriate DHL product code for the destination country.
 *   Germany                    → V62KP   (Kleinpaket)
 *   EU countries               → V66WPI  (Warenpost International)
 *   Non-EU (Belize/Costa Rica) → V53WPAK (Paket International)
 *   Non-EU (all others)        → V66WPI  (Warenpost International + customs)
 */
export function getDhlProductCode(iso3: string): 'V62KP' | 'V66WPI' | 'V53WPAK' {
  const upper = iso3.toUpperCase();
  if (upper === 'DEU') return 'V62KP';
  if (EU_CUSTOMS_EXEMPT.has(upper)) return 'V66WPI';
  if (PAKET_INTERNATIONAL_COUNTRIES.has(upper)) return 'V53WPAK';
  return 'V66WPI';
}

export const AVAILABLE_SHIPPING_COUNTRIES = [
  // Europe
  { code: 'AL', iso3: 'ALB', name: 'Albania' },
  { code: 'AD', iso3: 'AND', name: 'Andorra' },
  { code: 'AM', iso3: 'ARM', name: 'Armenia' },
  { code: 'AT', iso3: 'AUT', name: 'Austria' },
  { code: 'AZ', iso3: 'AZE', name: 'Azerbaijan' },
  { code: 'BY', iso3: 'BLR', name: 'Belarus' },
  { code: 'BE', iso3: 'BEL', name: 'Belgium' },
  { code: 'BA', iso3: 'BIH', name: 'Bosnia and Herzegovina' },
  { code: 'BG', iso3: 'BGR', name: 'Bulgaria' },
  { code: 'HR', iso3: 'HRV', name: 'Croatia' },
  { code: 'CY', iso3: 'CYP', name: 'Cyprus' },
  { code: 'CZ', iso3: 'CZE', name: 'Czech Republic' },
  { code: 'DK', iso3: 'DNK', name: 'Denmark' },
  { code: 'EE', iso3: 'EST', name: 'Estonia' },
  { code: 'FI', iso3: 'FIN', name: 'Finland' },
  { code: 'FR', iso3: 'FRA', name: 'France' },
  { code: 'GE', iso3: 'GEO', name: 'Georgia' },
  { code: 'DE', iso3: 'DEU', name: 'Germany' },
  { code: 'GR', iso3: 'GRC', name: 'Greece' },
  { code: 'HU', iso3: 'HUN', name: 'Hungary' },
  { code: 'IS', iso3: 'ISL', name: 'Iceland' },
  { code: 'IE', iso3: 'IRL', name: 'Ireland' },
  { code: 'IT', iso3: 'ITA', name: 'Italy' },
  { code: 'KZ', iso3: 'KAZ', name: 'Kazakhstan' },
  { code: 'LV', iso3: 'LVA', name: 'Latvia' },
  { code: 'LI', iso3: 'LIE', name: 'Liechtenstein' },
  { code: 'LT', iso3: 'LTU', name: 'Lithuania' },
  { code: 'LU', iso3: 'LUX', name: 'Luxembourg' },
  { code: 'MT', iso3: 'MLT', name: 'Malta' },
  { code: 'MD', iso3: 'MDA', name: 'Moldova' },
  { code: 'MC', iso3: 'MCO', name: 'Monaco' },
  { code: 'ME', iso3: 'MNE', name: 'Montenegro' },
  { code: 'NL', iso3: 'NLD', name: 'Netherlands' },
  { code: 'MK', iso3: 'MKD', name: 'North Macedonia' },
  { code: 'NO', iso3: 'NOR', name: 'Norway' },
  { code: 'PL', iso3: 'POL', name: 'Poland' },
  { code: 'PT', iso3: 'PRT', name: 'Portugal' },
  { code: 'RO', iso3: 'ROU', name: 'Romania' },
  { code: 'RU', iso3: 'RUS', name: 'Russia' },
  { code: 'SM', iso3: 'SMR', name: 'San Marino' },
  { code: 'RS', iso3: 'SRB', name: 'Serbia' },
  { code: 'SK', iso3: 'SVK', name: 'Slovakia' },
  { code: 'SI', iso3: 'SVN', name: 'Slovenia' },
  { code: 'ES', iso3: 'ESP', name: 'Spain' },
  { code: 'SE', iso3: 'SWE', name: 'Sweden' },
  { code: 'CH', iso3: 'CHE', name: 'Switzerland' },
  { code: 'UA', iso3: 'UKR', name: 'Ukraine' },
  { code: 'GB', iso3: 'GBR', name: 'United Kingdom' },
  // Americas
  { code: 'AR', iso3: 'ARG', name: 'Argentina' },
  { code: 'BS', iso3: 'BHS', name: 'Bahamas' },
  { code: 'BB', iso3: 'BRB', name: 'Barbados' },
  { code: 'BZ', iso3: 'BLZ', name: 'Belize' },
  { code: 'BO', iso3: 'BOL', name: 'Bolivia' },
  { code: 'BR', iso3: 'BRA', name: 'Brazil' },
  { code: 'CA', iso3: 'CAN', name: 'Canada' },
  { code: 'CL', iso3: 'CHL', name: 'Chile' },
  { code: 'CO', iso3: 'COL', name: 'Colombia' },
  { code: 'CR', iso3: 'CRI', name: 'Costa Rica' },
  { code: 'CU', iso3: 'CUB', name: 'Cuba' },
  { code: 'DO', iso3: 'DOM', name: 'Dominican Republic' },
  { code: 'EC', iso3: 'ECU', name: 'Ecuador' },
  { code: 'SV', iso3: 'SLV', name: 'El Salvador' },
  { code: 'GT', iso3: 'GTM', name: 'Guatemala' },
  { code: 'GY', iso3: 'GUY', name: 'Guyana' },
  { code: 'HT', iso3: 'HTI', name: 'Haiti' },
  { code: 'HN', iso3: 'HND', name: 'Honduras' },
  { code: 'JM', iso3: 'JAM', name: 'Jamaica' },
  { code: 'MX', iso3: 'MEX', name: 'Mexico' },
  { code: 'NI', iso3: 'NIC', name: 'Nicaragua' },
  { code: 'PA', iso3: 'PAN', name: 'Panama' },
  { code: 'PY', iso3: 'PRY', name: 'Paraguay' },
  { code: 'PE', iso3: 'PER', name: 'Peru' },
  { code: 'SR', iso3: 'SUR', name: 'Suriname' },
  { code: 'TT', iso3: 'TTO', name: 'Trinidad and Tobago' },
  { code: 'US', iso3: 'USA', name: 'United States' },
  { code: 'UY', iso3: 'URY', name: 'Uruguay' },
  { code: 'VE', iso3: 'VEN', name: 'Venezuela' },
  // Asia-Pacific
  { code: 'AF', iso3: 'AFG', name: 'Afghanistan' },
  { code: 'AU', iso3: 'AUS', name: 'Australia' },
  { code: 'BD', iso3: 'BGD', name: 'Bangladesh' },
  { code: 'BT', iso3: 'BTN', name: 'Bhutan' },
  { code: 'BN', iso3: 'BRN', name: 'Brunei' },
  { code: 'KH', iso3: 'KHM', name: 'Cambodia' },
  { code: 'CN', iso3: 'CHN', name: 'China' },
  { code: 'HK', iso3: 'HKG', name: 'Hong Kong' },
  { code: 'IN', iso3: 'IND', name: 'India' },
  { code: 'ID', iso3: 'IDN', name: 'Indonesia' },
  { code: 'JP', iso3: 'JPN', name: 'Japan' },
  { code: 'KG', iso3: 'KGZ', name: 'Kyrgyzstan' },
  { code: 'LA', iso3: 'LAO', name: 'Laos' },
  { code: 'MY', iso3: 'MYS', name: 'Malaysia' },
  { code: 'MV', iso3: 'MDV', name: 'Maldives' },
  { code: 'MN', iso3: 'MNG', name: 'Mongolia' },
  { code: 'MM', iso3: 'MMR', name: 'Myanmar' },
  { code: 'NP', iso3: 'NPL', name: 'Nepal' },
  { code: 'NZ', iso3: 'NZL', name: 'New Zealand' },
  { code: 'PK', iso3: 'PAK', name: 'Pakistan' },
  { code: 'PH', iso3: 'PHL', name: 'Philippines' },
  { code: 'SG', iso3: 'SGP', name: 'Singapore' },
  { code: 'KR', iso3: 'KOR', name: 'South Korea' },
  { code: 'LK', iso3: 'LKA', name: 'Sri Lanka' },
  { code: 'TW', iso3: 'TWN', name: 'Taiwan' },
  { code: 'TJ', iso3: 'TJK', name: 'Tajikistan' },
  { code: 'TH', iso3: 'THA', name: 'Thailand' },
  { code: 'TM', iso3: 'TKM', name: 'Turkmenistan' },
  { code: 'UZ', iso3: 'UZB', name: 'Uzbekistan' },
  { code: 'VN', iso3: 'VNM', name: 'Vietnam' },
  // Middle East
  { code: 'BH', iso3: 'BHR', name: 'Bahrain' },
  { code: 'IR', iso3: 'IRN', name: 'Iran' },
  { code: 'IQ', iso3: 'IRQ', name: 'Iraq' },
  { code: 'IL', iso3: 'ISR', name: 'Israel' },
  { code: 'JO', iso3: 'JOR', name: 'Jordan' },
  { code: 'KW', iso3: 'KWT', name: 'Kuwait' },
  { code: 'LB', iso3: 'LBN', name: 'Lebanon' },
  { code: 'OM', iso3: 'OMN', name: 'Oman' },
  { code: 'QA', iso3: 'QAT', name: 'Qatar' },
  { code: 'SA', iso3: 'SAU', name: 'Saudi Arabia' },
  { code: 'SY', iso3: 'SYR', name: 'Syria' },
  { code: 'TR', iso3: 'TUR', name: 'Turkey' },
  { code: 'AE', iso3: 'ARE', name: 'United Arab Emirates' },
  { code: 'YE', iso3: 'YEM', name: 'Yemen' },
  // Africa
  { code: 'DZ', iso3: 'DZA', name: 'Algeria' },
  { code: 'AO', iso3: 'AGO', name: 'Angola' },
  { code: 'CM', iso3: 'CMR', name: 'Cameroon' },
  { code: 'CI', iso3: 'CIV', name: "Côte d'Ivoire" },
  { code: 'EG', iso3: 'EGY', name: 'Egypt' },
  { code: 'ET', iso3: 'ETH', name: 'Ethiopia' },
  { code: 'GH', iso3: 'GHA', name: 'Ghana' },
  { code: 'KE', iso3: 'KEN', name: 'Kenya' },
  { code: 'MG', iso3: 'MDG', name: 'Madagascar' },
  { code: 'MA', iso3: 'MAR', name: 'Morocco' },
  { code: 'MZ', iso3: 'MOZ', name: 'Mozambique' },
  { code: 'NG', iso3: 'NGA', name: 'Nigeria' },
  { code: 'RW', iso3: 'RWA', name: 'Rwanda' },
  { code: 'SN', iso3: 'SEN', name: 'Senegal' },
  { code: 'ZA', iso3: 'ZAF', name: 'South Africa' },
  { code: 'TZ', iso3: 'TZA', name: 'Tanzania' },
  { code: 'TN', iso3: 'TUN', name: 'Tunisia' },
  { code: 'UG', iso3: 'UGA', name: 'Uganda' },
  { code: 'ZM', iso3: 'ZMB', name: 'Zambia' },
  { code: 'ZW', iso3: 'ZWE', name: 'Zimbabwe' },
];
