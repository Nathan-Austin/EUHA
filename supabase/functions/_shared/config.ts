/**
 * Shared configuration for Supabase Edge Functions
 *
 * IMPORTANT: Update COMPETITION_YEAR at the start of each new season.
 * This constant is used across all edge functions for:
 * - Judge/supplier intake webhooks
 * - Stripe payment processing
 * - Year-specific participation tracking
 */

export const COMPETITION_YEAR = 2026;
