
import type { Metadata } from 'next';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the privacy policy for the European Hot Sauce Awards.',
};

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,56px)] uppercase leading-[0.95] text-white">
            Privacy <span className="bg-[#F5C518] px-2 text-black">policy</span>.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="border-[3px] border-black bg-white p-8 md:p-12">
            <div className="space-y-8">
              <div>
                <p className="text-black/75 leading-relaxed mb-4">
                  Last updated August 18, 2026
                </p>
                <p className="text-black/75 leading-relaxed mb-4">
                  This privacy notice for <strong className="text-black">Austin &amp; Gardner GbR</strong> (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) describes how and why we process your information when you use our services (&ldquo;Services&rdquo;), including when you:
                </p>
                <ul className="list-disc list-inside text-black/75 leading-relaxed mb-4 space-y-2">
                  <li>Visit <a href="https://heatawards.eu" className="text-black underline font-semibold hover:opacity-70">heatawards.eu</a>, or any site of ours linking to this notice</li>
                  <li>Enter a sauce, apply to judge, or apply for sponsorship in the European Hot Sauce Awards</li>
                  <li>Sign up for our newsletter, or otherwise contact us</li>
                </ul>
                <p className="text-black/75 leading-relaxed">
                  Questions or concerns about general use of the Services? Contact us at <a href="mailto:heataward@gmail.com" className="text-black underline font-semibold hover:opacity-70">heataward@gmail.com</a>. For matters relating specifically to this privacy notice or exercising your data protection rights, contact <a href="mailto:contact@republicofheat.com" className="text-black underline font-semibold hover:opacity-70">contact@republicofheat.com</a>.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">Summary of key points</h2>
                <div className="space-y-3 text-black/75 leading-relaxed">
                  <p><strong className="text-black">What do we collect?</strong> Names, emails, addresses, and — for entries and sponsorships — payment information, processed depending on how you interact with the Services.</p>
                  <p><strong className="text-black">Sensitive information?</strong> We do not knowingly process sensitive personal information.</p>
                  <p><strong className="text-black">Third-party sources?</strong> We do not receive information about you from third parties.</p>
                  <p><strong className="text-black">How do we use it?</strong> To run the competition (entries, judging, results), process payments, respond to sponsorship/press enquiries, send newsletter updates if you&rsquo;ve subscribed, and comply with legal obligations.</p>
                  <p><strong className="text-black">Who do we share it with?</strong> Our payment processor (Stripe) and email delivery infrastructure, as described below. We do not sell personal information.</p>
                  <p><strong className="text-black">Your rights?</strong> Under GDPR, you can access, correct, delete, or port your data, and object to or restrict processing. Contact us to exercise these.</p>
                </div>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">1. What information we collect</h2>
                <p className="text-black/75 leading-relaxed mb-3">
                  <strong className="text-black">Provided directly by you:</strong>
                </p>
                <ul className="list-disc list-inside text-black/75 leading-relaxed mb-3 space-y-1">
                  <li>Name, email address, phone number, postal address — collected when you submit a competition entry, apply to judge, enquire about sponsorship, use the contact form, or subscribe to the newsletter.</li>
                  <li>Business details (company name, VAT number) where relevant to entries or sponsorship invoicing.</li>
                  <li>Content you submit as part of an entry (sauce details, ingredients, allergen information).</li>
                </ul>
                <p className="text-black/75 leading-relaxed mb-3">
                  <strong className="text-black">Payment data:</strong> If you pay an entry fee, judge participation fee, or sponsorship invoice, payment is processed by Stripe. We do not store full card details ourselves — Stripe handles this. See <a href="https://stripe.com/en-gb-de/privacy" className="text-black underline font-semibold hover:opacity-70">Stripe&rsquo;s privacy policy</a>.
                </p>
                <p className="text-black/75 leading-relaxed">
                  <strong className="text-black">Automatically collected:</strong> Limited technical/analytics data via Google Analytics (GA4), only where you&rsquo;ve consented via our cookie banner. See our <a href="/cookies" className="text-black underline font-semibold hover:opacity-70">Cookie Policy</a> for full detail on what&rsquo;s collected and how to manage consent.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">2. How we process your information</h2>
                <p className="text-black/75 leading-relaxed mb-3">
                  We process your information to:
                </p>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li><strong className="text-black">Deliver our Services</strong> — running the competition, processing entries and judging logistics, fulfilling sponsorship agreements, responding to enquiries.</li>
                  <li><strong className="text-black">Communicate with you</strong> — transactional emails (entry confirmations, judging updates) sent via our SMTP email infrastructure, and newsletter updates if you&rsquo;ve opted in (stored via a Supabase-backed subscription list — we do not use a third-party email marketing platform).</li>
                  <li><strong className="text-black">Process payments and prevent fraud</strong>, via Stripe.</li>
                  <li><strong className="text-black">Comply with legal obligations</strong>, including German/EU tax and business record-keeping requirements.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">3. Legal bases (EU/UK)</h2>
                <p className="text-black/75 leading-relaxed mb-3">
                  Under GDPR and UK GDPR, we rely on:
                </p>
                <ul className="list-disc list-inside text-black/75 leading-relaxed mb-3 space-y-2">
                  <li><strong className="text-black">Consent</strong> — e.g. newsletter sign-up, analytics cookies. You can withdraw consent at any time.</li>
                  <li><strong className="text-black">Performance of a contract</strong> — e.g. processing your competition entry or sponsorship agreement.</li>
                  <li><strong className="text-black">Legal obligation</strong> — e.g. tax and accounting records.</li>
                  <li><strong className="text-black">Legitimate interests</strong> — e.g. responding to enquiries, maintaining the Services securely.</li>
                </ul>
                <p className="text-black/75 leading-relaxed">
                  We are the data controller for the personal information described in this notice.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">4. Who we share information with</h2>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li><strong className="text-black">Stripe</strong> (payment processing) — see their privacy policy linked above.</li>
                  <li><strong className="text-black">Google Analytics</strong> (GA4) — only if you&rsquo;ve consented via the cookie banner; see <a href="/cookies" className="text-black underline font-semibold hover:opacity-70">Cookie Policy</a>.</li>
                  <li>We may share information in connection with a business transfer (e.g. merger or acquisition) affecting the Company.</li>
                  <li>We do not sell personal information to third parties, and have not done so in the past 12 months.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">5. How long we keep your information</h2>
                <p className="text-black/75 leading-relaxed">
                  We keep personal information only as long as necessary for the purposes described here, or as required by German/EU tax and accounting law (which may require longer retention for invoicing/payment records — typically several years under German commercial law). When there&rsquo;s no ongoing need, we delete or anonymise the data.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">6. How we keep information safe</h2>
                <p className="text-black/75 leading-relaxed">
                  We use reasonable technical and organisational measures to protect your data. No method of transmission or storage is 100% secure, so we can&rsquo;t guarantee absolute security, but we take this seriously and will notify you as required by law if a breach affecting your data occurs.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">7. Children</h2>
                <p className="text-black/75 leading-relaxed">
                  Our Services are not directed at, and we do not knowingly collect data from, anyone under 18. If you believe a minor&rsquo;s data has been collected, contact us at <a href="mailto:heataward@gmail.com" className="text-black underline font-semibold hover:opacity-70">heataward@gmail.com</a> and we&rsquo;ll take reasonable steps to delete it.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">8. Your rights</h2>
                <p className="text-black/75 leading-relaxed mb-3">
                  If you&rsquo;re in the EEA, UK, or Switzerland, you have the right to:
                </p>
                <ul className="list-disc list-inside text-black/75 leading-relaxed mb-3 space-y-1">
                  <li>Access a copy of your personal information</li>
                  <li>Request correction or deletion</li>
                  <li>Restrict or object to processing</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent at any time (without affecting processing that already happened lawfully)</li>
                </ul>
                <p className="text-black/75 leading-relaxed">
                  To exercise any of these, email <a href="mailto:heataward@gmail.com" className="text-black underline font-semibold hover:opacity-70">heataward@gmail.com</a>. If you believe we&rsquo;re processing your data unlawfully, you can also complain to your local data protection authority — for Germany, the Berliner Beauftragte für Datenschutz und Informationsfreiheit, or find your national authority at <a href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm" target="_blank" rel="noopener noreferrer" className="text-black underline font-semibold hover:opacity-70">ec.europa.eu</a>.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">9. Changes to this notice</h2>
                <p className="text-black/75 leading-relaxed">
                  We may update this notice from time to time; the &ldquo;Last updated&rdquo; date above will reflect the latest revision. Material changes will be posted prominently on this page.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">10. Contact us</h2>
                <div className="text-black/75 leading-relaxed mb-4">
                  <p>Austin &amp; Gardner GbR</p>
                  <p>Südostallee 124</p>
                  <p>12487 Berlin, Germany</p>
                  <p>VAT: DE457184736</p>
                  <p>General enquiries: <a href="mailto:heataward@gmail.com" className="text-black underline font-semibold hover:opacity-70">heataward@gmail.com</a></p>
                  <p>Data protection / legal enquiries: <a href="mailto:contact@republicofheat.com" className="text-black underline font-semibold hover:opacity-70">contact@republicofheat.com</a></p>
                </div>
                <p className="text-black/75 leading-relaxed">
                  Austin &amp; Gardner GbR is the data controller of your information for the purposes of this notice. Authorized partners: Simon Gardner &amp; Nathan Austin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
};

export default PrivacyPage;
