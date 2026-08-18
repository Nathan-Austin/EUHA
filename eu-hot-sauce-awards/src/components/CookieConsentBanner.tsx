"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  COOKIE_CONSENT_REOPEN_EVENT,
  type ConsentStatus,
  getStoredConsent,
  setStoredConsent,
} from "@/lib/cookieConsent";

// Only non-essential cookie category on the Site is analytics (GA4) — no
// other third-party embeds, ad tech, or preference cookies exist, so a
// single accept/decline choice covers it rather than a category picker.
export default function CookieConsentBanner({ gaId }: { gaId?: string }) {
  const [status, setStatus] = useState<ConsentStatus | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    setStatus(stored);
    if (stored === null) setVisible(true);

    const reopen = () => setVisible(true);
    window.addEventListener(COOKIE_CONSENT_REOPEN_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_CONSENT_REOPEN_EVENT, reopen);
  }, []);

  const decide = (next: ConsentStatus) => {
    setStoredConsent(next);
    setStatus(next);
    setVisible(false);
  };

  return (
    <>
      {gaId && status === "accepted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {visible && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t-[3px] border-[#F5C518] bg-black px-6 py-5 text-white">
          <div className="mx-auto flex max-w-[1240px] flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm leading-relaxed text-gray-300">
              We use cookies for essential site functions (staying logged in) and, with your consent, analytics
              to understand how the Site is used. See our{" "}
              <Link href="/cookies" className="underline hover:text-[#F5C518]">
                Cookie Policy
              </Link>{" "}
              for details.
            </p>
            <div className="flex flex-shrink-0 gap-3">
              <button
                type="button"
                onClick={() => decide("declined")}
                className="border-2 border-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-white hover:text-black"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                className="bg-[#F5C518] px-5 py-2.5 font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.08em] text-black hover:bg-[#e0a800]"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
