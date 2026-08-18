"use client";

import { openCookiePreferences } from "@/lib/cookieConsent";

export default function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openCookiePreferences} className={className}>
      Cookie preferences
    </button>
  );
}
