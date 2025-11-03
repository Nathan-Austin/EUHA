/**
 * Application Configuration
 *
 * IMPORTANT: Update COMPETITION_YEAR at the start of each new season.
 * This constant is used throughout the application for:
 * - Judge/supplier participation tracking
 * - Approval workflows
 * - QR code generation
 * - Box assignment
 * - Email campaigns
 */

export const COMPETITION_YEAR = 2026;

/**
 * Helper to validate that the competition year is current
 * Call this during application startup to catch configuration issues early
 */
export function validateCompetitionYear() {
  const currentDate = new Date();
  const currentCalendarYear = currentDate.getFullYear();

  // Competition year should typically be current year or next year (for early prep)
  if (COMPETITION_YEAR < currentCalendarYear - 1 || COMPETITION_YEAR > currentCalendarYear + 1) {
    console.warn(
      `⚠️ COMPETITION_YEAR (${COMPETITION_YEAR}) may be outdated. ` +
      `Current year is ${currentCalendarYear}. ` +
      `Please review lib/config.ts`
    );
  }
}
