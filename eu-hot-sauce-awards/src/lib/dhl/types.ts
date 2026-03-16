/**
 * DHL API Type Definitions
 * For DHL Parcel DE Shipping API v2
 */

export interface DHLAddress {
  name1: string;
  name2?: string; // c/o, company, apartment etc.
  addressStreet: string;
  addressHouse: string;
  postalCode: string;
  city: string;
  country: string; // ISO 3166-1 alpha-3 (e.g., 'DEU', 'GBR', 'NLD')
  email?: string;
  phone?: string;
}

export interface DHLPackageDimensions {
  length: number; // cm
  width: number;  // cm
  height: number; // cm
}

export interface DHLCustomsItem {
  itemDescription: string;
  packagedQuantity: number;
  itemValue: { value: number; currency: string };
  itemWeight: number;      // kg, plain number
  countryOfOrigin: string; // ISO 3166-1 alpha-3 (e.g. 'DEU')
  hsCode: string;          // 6-11 digit HS tariff code
}

export interface DHLCustomsDetails {
  exportType: 'OTHER' | 'PRESENT' | 'COMMERCIAL_GOODS' | 'COMMERCIAL_SAMPLE' | 'DOCUMENTS' | 'RETURN_OF_GOODS';
  exportDescription: string;
  shippingConditions?: 'DAP' | 'DDP' | 'DDU';
  customsAmount: number;   // EUR
  customsCurrency: string;
  postalCharges: number;   // Shipping cost in EUR (required by UPU since 2021)
  items: DHLCustomsItem[];
}

export interface DHLShipmentRequest {
  judgeId: string;
  orderReference: string; // e.g. judge name or box label
  shipper: DHLAddress;
  consignee: DHLAddress;
  weight: number; // kg
  dimensions?: DHLPackageDimensions;
  shipmentDate: string; // YYYY-MM-DD
  productCode?: string; // V01PAK, V53WPAK, V54EPAK, V62WP, V07PAK
  customs?: DHLCustomsDetails;
}

export interface DHLShipmentResponse {
  success: boolean;
  shipmentNumber?: string;
  trackingNumber?: string;
  labelUrl?: string;
  error?: string;
}

export interface DHLAddressValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface DHLTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface DHLOrderResponse {
  items: Array<{
    shipmentNo: string;
    label: {
      url: string;
    };
    sstatus: {
      title: string;
      status: number;
    };
  }>;
}
