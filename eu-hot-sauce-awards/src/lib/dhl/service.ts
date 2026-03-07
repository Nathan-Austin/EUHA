/**
 * DHL Business API Integration — EU Hot Sauce Awards
 * Handles shipping label generation for outgoing judge boxes.
 * Uses DHL Parcel DE API v2 (Production).
 */

import type {
  DHLAddress,
  DHLShipmentRequest,
  DHLShipmentResponse,
  DHLAddressValidationResult,
  DHLTokenResponse,
  DHLOrderResponse,
} from './types';

// ==================== CONFIGURATION ====================

const DHL_CONFIG = {
  shippingUrl: 'https://api-eu.dhl.com/parcel/de/shipping/v2',
  authUrl: 'https://api-eu.dhl.com/parcel/de/account/auth/ropc/v1/token',
  tokenUser: process.env.DHL_USERNAME!,
  tokenPass: process.env.DHL_PASSWORD!,
  apiKey: process.env.DHL_API_KEY!,
  apiSecret: process.env.DHL_API_SECRET!,
  defaultProduct: process.env.DHL_PRODUCT_CODE || 'V01PAK',

  billingNumbers: {
    'V01PAK':  process.env.DHL_BILLING_PAKET!,       // DHL Paket National
    'V53WPAK': process.env.DHL_BILLING_WARENPOST!,    // Warenpost International
    'V54EPAK': process.env.DHL_BILLING_PAKET_INT!,    // Paket International
    'V62WP':   process.env.DHL_BILLING_KLEINPAKET!,   // Kleinpaket
    'V07PAK':  process.env.DHL_BILLING_RETOURE!,      // Retoure
  },
} as const;

/**
 * Fixed shipper address for all outgoing EUHA judge boxes.
 * Set via environment variables.
 */
export function getShipperAddress(): DHLAddress {
  return {
    name1: process.env.DHL_SHIPPER_NAME1 || 'EU Hot Sauce Awards',
    name2: process.env.DHL_SHIPPER_NAME2,
    addressStreet: process.env.DHL_SHIPPER_STREET!,
    addressHouse: process.env.DHL_SHIPPER_HOUSE!,
    postalCode: process.env.DHL_SHIPPER_POSTAL!,
    city: process.env.DHL_SHIPPER_CITY!,
    country: process.env.DHL_SHIPPER_COUNTRY || 'DEU',
    email: process.env.DHL_SHIPPER_EMAIL,
  };
}

/**
 * Default box weight in kg. Update once actual box weight is confirmed.
 * Stored as an env var so it can be adjusted without a deploy.
 */
export function getBoxWeightKg(): number {
  const configured = parseFloat(process.env.DHL_BOX_WEIGHT_KG || '');
  return isNaN(configured) ? 0.8 : configured;
}

/**
 * Fixed box dimensions for all EUHA judging boxes: 240x140x70mm
 * Returns in cm as required by DHL API.
 */
export function getBoxDimensions() {
  return { length: 24, width: 14, height: 7 };
}

function validateConfig(): void {
  const missing: string[] = [];
  if (!DHL_CONFIG.apiKey)    missing.push('DHL_API_KEY');
  if (!DHL_CONFIG.apiSecret) missing.push('DHL_API_SECRET');
  if (!DHL_CONFIG.tokenUser) missing.push('DHL_USERNAME');
  if (!DHL_CONFIG.tokenPass) missing.push('DHL_PASSWORD');
  if (!process.env.DHL_SHIPPER_STREET) missing.push('DHL_SHIPPER_STREET');
  if (!process.env.DHL_SHIPPER_HOUSE)  missing.push('DHL_SHIPPER_HOUSE');
  if (!process.env.DHL_SHIPPER_POSTAL) missing.push('DHL_SHIPPER_POSTAL');
  if (!process.env.DHL_SHIPPER_CITY)   missing.push('DHL_SHIPPER_CITY');

  const hasBilling = Object.values(DHL_CONFIG.billingNumbers).some((n) => n?.length > 0);
  if (!hasBilling) missing.push('At least one DHL_BILLING_* variable');

  if (missing.length > 0) {
    throw new Error(`Missing DHL environment variables: ${missing.join(', ')}`);
  }
}

function getBillingNumber(productCode: string): string {
  const billing = DHL_CONFIG.billingNumbers[productCode as keyof typeof DHL_CONFIG.billingNumbers];
  if (!billing) {
    throw new Error(`No billing number configured for product ${productCode}`);
  }
  return billing;
}

// ==================== TOKEN MANAGEMENT ====================

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) return cachedToken;

  const params = new URLSearchParams({
    grant_type: 'password',
    username: DHL_CONFIG.tokenUser,
    password: DHL_CONFIG.tokenPass,
    client_id: DHL_CONFIG.apiKey,
    client_secret: DHL_CONFIG.apiSecret,
  });

  const response = await fetch(DHL_CONFIG.authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DHL auth failed: ${response.status} ${text}`);
  }

  const data: DHLTokenResponse = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in * 1000 - 60_000);
  return cachedToken;
}

// ==================== ADDRESS VALIDATION ====================

export function validateAddress(address: DHLAddress): DHLAddressValidationResult {
  const errors: string[] = [];

  if (!address.name1?.trim())          errors.push('Recipient name is required');
  if (!address.addressStreet?.trim())  errors.push('Street name is required');
  if (!address.addressHouse?.trim())   errors.push('House number is required');
  if (!address.postalCode?.trim())     errors.push('Postal code is required');
  if (!address.city?.trim())           errors.push('City is required');
  if (!address.country || address.country.length !== 3) {
    errors.push('Country must be a 3-letter ISO code (e.g. DEU, GBR)');
  }

  return { isValid: errors.length === 0, errors };
}

// ==================== LABEL GENERATION ====================

export async function generateShippingLabel(
  request: DHLShipmentRequest
): Promise<DHLShipmentResponse> {
  try {
    validateConfig();

    const token = await getAccessToken();
    const productCode = request.productCode || DHL_CONFIG.defaultProduct;
    const billingNumber = getBillingNumber(productCode);

    const payload = {
      profile: 'STANDARD_GRUPPENPROFIL',
      shipments: [
        {
          product: productCode,
          billingNumber,
          refNo: request.orderReference,
          shipDate: request.shipmentDate,

          shipper: {
            name1: request.shipper.name1,
            name2: request.shipper.name2,
            addressStreet: request.shipper.addressStreet,
            addressHouse: request.shipper.addressHouse,
            postalCode: request.shipper.postalCode,
            city: request.shipper.city,
            country: request.shipper.country,
            email: request.shipper.email,
          },

          consignee: {
            name1: request.consignee.name1,
            name2: request.consignee.name2,
            addressStreet: request.consignee.addressStreet,
            addressHouse: request.consignee.addressHouse,
            postalCode: request.consignee.postalCode,
            city: request.consignee.city,
            country: request.consignee.country,
            email: request.consignee.email,
          },

          details: {
            weight: { uom: 'kg', value: request.weight },
            ...(request.dimensions && {
              dim: {
                uom: 'cm',
                length: request.dimensions.length,
                width: request.dimensions.width,
                height: request.dimensions.height,
              },
            }),
          },
        },
      ],
    };

    const response = await fetch(`${DHL_CONFIG.shippingUrl}/orders?includeDocs=URL`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-GB',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = `DHL API error: ${response.status}`;
      try {
        const json = JSON.parse(errorText);
        if (json.detail) message += ` - ${json.detail}`;
        if (json.title)  message += ` (${json.title})`;
      } catch {
        message += ` - ${errorText}`;
      }
      return { success: false, error: message };
    }

    const data: DHLOrderResponse = await response.json();
    const item = data.items[0];

    if (!item?.shipmentNo) {
      if (item?.sstatus?.status > 200) {
        return { success: false, error: `DHL validation error: ${item.sstatus.title}` };
      }
      return { success: false, error: 'No shipment number returned from DHL API' };
    }

    return {
      success: true,
      shipmentNumber: item.shipmentNo,
      trackingNumber: item.shipmentNo,
      labelUrl: item.label?.url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function getTrackingUrl(trackingNumber: string): string {
  return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
}
