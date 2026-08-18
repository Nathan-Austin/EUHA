
import type { Metadata } from 'next';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import CookiePreferencesButton from '@/components/CookiePreferencesButton';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Read the cookie policy for the European Hot Sauce Awards.',
};

const CookiesPage = () => {
  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cookie Policy' }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,56px)] uppercase leading-[0.95] text-white">
            Cookie <span className="bg-[#F5C518] px-2 text-black">policy</span>.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="border-[3px] border-black bg-white p-8 md:p-12">
            <div className="space-y-8">
              <div>
                <p className="text-black/75 leading-relaxed mb-4">
                  This Cookie Policy was last updated on August 18, 2026 and applies to visitors to heatawards.eu, including citizens and residents of the European Economic Area, the UK, and Switzerland.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">1. Who we are</h2>
                <p className="text-black/75 leading-relaxed">
                  This website, <a href="https://heatawards.eu" className="text-black underline font-semibold hover:opacity-70">heatawards.eu</a> (the &ldquo;Site&rdquo;), is operated by:
                </p>
                <div className="text-black/75 leading-relaxed mt-3">
                  <p>Austin &amp; Gardner GbR</p>
                  <p>Südostallee 124</p>
                  <p>12487 Berlin, Germany</p>
                  <p>VAT: DE457184736</p>
                  <p>General enquiries: <a href="mailto:heataward@gmail.com" className="text-black underline font-semibold hover:opacity-70">heataward@gmail.com</a></p>
                  <p>Legal / data protection enquiries: <a href="mailto:contact@republicofheat.com" className="text-black underline font-semibold hover:opacity-70">contact@republicofheat.com</a></p>
                </div>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">2. What are cookies?</h2>
                <p className="text-black/75 leading-relaxed">
                  A cookie is a small file placed on your device by your browser when you visit a website. Cookies let a site recognize your device on return visits, remember choices you&rsquo;ve made, and — depending on the type — help site owners understand how the site is used.
                </p>
                <p className="text-black/75 leading-relaxed mt-3">
                  We also use similar technologies such as local storage; this policy refers to all of these collectively as &ldquo;cookies.&rdquo;
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">3. Categories of cookies we use</h2>

                <h3 className="text-base font-bold text-black mb-2 mt-4">3.1 Strictly necessary / functional cookies</h3>
                <p className="text-black/75 leading-relaxed">
                  These are required for core site functionality and can&rsquo;t be switched off:
                </p>
                <ul className="list-disc list-inside text-black/75 leading-relaxed mt-2 space-y-1">
                  <li>Session/authentication cookies for the magic-link login system, used by entrants, judges, and admins to stay logged in.</li>
                  <li>Local storage used during judging to hold scores before bulk submission, so a dropped connection doesn&rsquo;t lose a judge&rsquo;s work.</li>
                  <li>A cookie preference cookie, once you make a choice in the banner below, so we don&rsquo;t ask again on every visit.</li>
                </ul>

                <h3 className="text-base font-bold text-black mb-2 mt-4">3.2 Analytics / statistics cookies</h3>
                <p className="text-black/75 leading-relaxed">
                  With your consent, we use Google Analytics (GA4) to understand how visitors use the Site — pages viewed, general location (country-level), and interactions like sponsor link clicks. Google may process this data on servers outside the EEA. You can learn more at{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-black underline font-semibold hover:opacity-70">Google&rsquo;s Privacy Policy</a>{' '}
                  or opt out using the{' '}
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-black underline font-semibold hover:opacity-70">Google Analytics Opt-out Browser Add-on</a>.
                  These cookies are only set if you accept them in the cookie banner — see Section 5.
                </p>

                <h3 className="text-base font-bold text-black mb-2 mt-4">3.3 Payment processing</h3>
                <p className="text-black/75 leading-relaxed">
                  If you submit a competition entry or pay a sponsorship/judge participation fee through the Site, our payment processor Stripe sets cookies to process your payment securely and prevent fraud. Their privacy policy: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-black underline font-semibold hover:opacity-70">stripe.com/privacy</a>.
                </p>

                <h3 className="text-base font-bold text-black mb-2 mt-4">3.4 Social media</h3>
                <p className="text-black/75 leading-relaxed">
                  The Site links out to our Instagram profile. Clicking that link takes you to instagram.com, which may set its own cookies under Meta&rsquo;s policies — we don&rsquo;t control that, and no Instagram content is embedded directly on this Site.
                </p>

                <h3 className="text-base font-bold text-black mb-2 mt-4">3.5 Email / newsletter</h3>
                <p className="text-black/75 leading-relaxed">
                  Newsletter sign-ups and transactional emails (entry confirmations, judging updates) are sent directly by us and do not include third-party tracking pixels.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">4. Cookies we do NOT use</h2>
                <p className="text-black/75 leading-relaxed">
                  We do not use third-party advertising or retargeting cookies. We do not use PayPal, Mailchimp, WordPress/WooCommerce, Jetpack, or Wistia.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">5. Managing your cookie preferences</h2>
                <p className="text-black/75 leading-relaxed mb-4">
                  When you first visit the Site, you&rsquo;ll be shown a cookie banner where you can accept or decline analytics cookies. You can change your choice at any time using the{' '}
                  <CookiePreferencesButton className="text-black underline font-semibold hover:opacity-70" />{' '}
                  link in the footer of any page.
                </p>
                <p className="text-black/75 leading-relaxed">
                  You can also control or delete cookies through your browser settings. Note that blocking essential cookies may prevent parts of the Site — such as logging in to submit an entry or judge application — from working correctly.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">6. Your rights</h2>
                <p className="text-black/75 leading-relaxed mb-3">
                  If you are located in the EEA, UK, or Switzerland, you have rights under GDPR (or equivalent) regarding your personal data, including the right to access, correct, or delete data we hold about you, and the right to withdraw consent for non-essential cookies at any time without affecting the lawfulness of processing before withdrawal.
                </p>
                <p className="text-black/75 leading-relaxed mb-3">
                  For general questions about this policy, contact <a href="mailto:heataward@gmail.com" className="text-black underline font-semibold hover:opacity-70">heataward@gmail.com</a>. To exercise your data protection rights specifically, contact <a href="mailto:contact@republicofheat.com" className="text-black underline font-semibold hover:opacity-70">contact@republicofheat.com</a>.
                </p>
                <p className="text-black/75 leading-relaxed">
                  If you believe we are processing your data unlawfully, you also have the right to lodge a complaint with your local data protection authority. For Germany, this is the Berliner Beauftragte für Datenschutz und Informationsfreiheit (or the relevant authority for your state), or the EU&rsquo;s directory of supervisory authorities: <a href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm" target="_blank" rel="noopener noreferrer" className="text-black underline font-semibold hover:opacity-70">ec.europa.eu</a>.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">7. Changes to this policy</h2>
                <p className="text-black/75 leading-relaxed">
                  We may update this Cookie Policy from time to time, for example if we change the tools or third-party services the Site uses. The &ldquo;last updated&rdquo; date at the top will reflect the most recent revision. We encourage you to check back periodically.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">8. Contact us</h2>
                <div className="text-black/75 leading-relaxed">
                  <p>Austin &amp; Gardner GbR</p>
                  <p>Südostallee 124, 12487 Berlin, Germany</p>
                  <p>General enquiries: <a href="mailto:heataward@gmail.com" className="text-black underline font-semibold hover:opacity-70">heataward@gmail.com</a></p>
                  <p>Legal / data protection enquiries: <a href="mailto:contact@republicofheat.com" className="text-black underline font-semibold hover:opacity-70">contact@republicofheat.com</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
};

export default CookiesPage;
