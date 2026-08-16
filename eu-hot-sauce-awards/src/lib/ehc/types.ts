/**
 * EHC Membership Verify API Type Definitions
 * GET /api/membership/verify?ehc_id=...&email=...&company_name=...
 */

export type EhcMembershipStatus = 'new' | 'pending' | 'member' | 'lapsed' | 'declined';

export interface EhcVerifyMatch {
  email_match: boolean;
  company_match: boolean;
}

export interface EhcVerifyApiResponse {
  valid: boolean;
  status: EhcMembershipStatus | null;
  match: EhcVerifyMatch;
}

export interface EhcVerifyRequest {
  ehcId: string;
  email: string;
  companyName: string;
}

/**
 * Outcome of a verify call, collapsed into the states the dashboard needs to
 * render a status chip for. Distinct from a raw API `valid: false` so a real
 * member is never told "not found" just because the EHC endpoint is
 * unreachable/unconfigured.
 */
export type EhcVerifyResult =
  | { outcome: 'verified'; status: 'member' }
  | { outcome: 'pending_payment'; status: 'pending' }
  | { outcome: 'not_qualifying'; status: EhcMembershipStatus }
  | { outcome: 'not_found' }
  | { outcome: 'mismatch'; status: EhcMembershipStatus | null }
  | { outcome: 'unavailable'; error: string };
