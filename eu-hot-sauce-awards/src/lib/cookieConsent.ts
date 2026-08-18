export type ConsentStatus = "accepted" | "declined";

const STORAGE_KEY = "ehsa_cookie_consent";

// Fired by the footer's "Cookie preferences" link so the banner can be
// reopened from anywhere without wiring a shared React context.
export const COOKIE_CONSENT_REOPEN_EVENT = "ehsa:cookie-consent-reopen";

export function getStoredConsent(): ConsentStatus | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "accepted" || value === "declined" ? value : null;
}

export function setStoredConsent(status: ConsentStatus) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, status);
}

export function openCookiePreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_CONSENT_REOPEN_EVENT));
}
