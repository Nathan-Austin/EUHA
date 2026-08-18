
import type { Metadata } from 'next';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read the official terms and conditions for entering and participating in the European Hot Sauce Awards.',
};

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Terms & Conditions' }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,56px)] uppercase leading-[0.95] text-white">
            Terms &amp; <span className="bg-[#F5C518] px-2 text-black">conditions</span>.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="border-[3px] border-black bg-white p-8 md:p-12">
            <div className="space-y-8">
              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">European Hot Sauce Awards – Terms and Conditions</h2>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase tracking-[0.03em] mb-3">1. Competition Eligibility</h2>

                <h3 className="text-base font-bold text-black mb-2 mt-4">1.1 Participant Requirements</h3>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>The competition is open to hot sauce producers from Europe and internationally</li>
                  <li>Only commercially available hot sauces are eligible to enter</li>
                  <li>Sauces must comply with all health, safety, and hygiene regulations</li>
                  <li>All entries must have a valid use-by date extending beyond May 2027</li>
                </ul>

                <h3 className="text-base font-bold text-black mb-2 mt-4">1.2 Entry Restrictions</h3>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>Producers may enter multiple sauces</li>
                  <li>Each sauce entered in multiple categories requires a separate entry</li>
                  <li>Sauces must be created within the past 12 months</li>
                </ul>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase tracking-[0.03em] mb-3">2. Entry Process</h2>

                <h3 className="text-base font-bold text-black mb-2 mt-4">2.1 Submission Requirements</h3>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>Complete online payment for entries</li>
                  <li>Submit detailed ingredients list</li>
                  <li>Provide accurate allergen information</li>
                  <li>Ship sauce samples according to provided guidelines</li>
                  <li>Ensure all entries reach the competition by Wednesday 10th March 2027</li>
                </ul>

                <h3 className="text-base font-bold text-black mb-2 mt-4">2.2 Fees and Payments</h3>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>Entry fees are non-refundable</li>
                  <li>Discounts apply for multiple sauce entries</li>
                  <li>Payment confirms acceptance of these terms and conditions</li>
                </ul>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase tracking-[0.03em] mb-3">3. Judging and Awards</h2>

                <h3 className="text-base font-bold text-black mb-2 mt-4">3.1 Judging Process</h3>
                <p className="text-black/75 leading-relaxed mb-2">
                  Judging will be conducted by professional & experienced tasters. Sauces will be evaluated on:
                </p>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>Flavor complexity</li>
                  <li>Heat balance</li>
                  <li>Ingredient quality</li>
                  <li>Originality</li>
                  <li>Overall sensory experience</li>
                </ul>

                <h3 className="text-base font-bold text-black mb-2 mt-4">3.2 Award Decisions</h3>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>Judges' decisions are final</li>
                  <li>Gold, Silver, and Bronze awards will be presented in each category</li>
                  <li>Top 20 highest-scoring sauces will be added to global rankings</li>
                </ul>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase tracking-[0.03em] mb-3">4. Intellectual Property and Usage Rights</h2>

                <h3 className="text-base font-bold text-black mb-2 mt-4">4.1 Sauce Submissions</h3>
                <p className="text-black/75 leading-relaxed mb-2">
                  By entering, participants grant the competition organisers:
                </p>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>Right to feature sauce names in press releases</li>
                  <li>Permission to use submitted information for promotional purposes</li>
                  <li>Ability to list winners on official websites</li>
                </ul>

                <h3 className="text-base font-bold text-black mb-2 mt-4">4.2 Ownership</h3>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>Submitted sauce samples become the property of the competition</li>
                  <li>Samples will not be returned unless prior arrangements are made</li>
                </ul>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase tracking-[0.03em] mb-3">5. Liability and Limitations</h2>

                <h3 className="text-base font-bold text-black mb-2 mt-4">5.1 Disclaimer</h3>
                <p className="text-black/75 leading-relaxed mb-2">
                  Competition organisers are not responsible for:
                </p>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>Lost or damaged entries during shipping</li>
                  <li>Technical issues with online submission</li>
                  <li>Errors in entry information provided by participants</li>
                </ul>

                <h3 className="text-base font-bold text-black mb-2 mt-4">5.2 Privacy</h3>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>Personal and business information will be handled confidentially</li>
                  <li>Contact information may be used for competition-related communications</li>
                </ul>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase tracking-[0.03em] mb-3">6. Miscellaneous</h2>

                <h3 className="text-base font-bold text-black mb-2 mt-4">6.1 Communication</h3>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>All official communication will be via the provided email: <a href="mailto:heataward@gmail.com" className="text-black underline font-semibold hover:opacity-70">heataward@gmail.com</a></li>
                  <li>Participants are responsible for maintaining updated contact information</li>
                </ul>

                <h3 className="text-base font-bold text-black mb-2 mt-4">6.2 Modifications</h3>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>Competition organisers reserve the right to modify competition rules</li>
                  <li>Any changes will be communicated to registered participants</li>
                </ul>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase tracking-[0.03em] mb-3">7. Acceptance of Terms</h2>
                <p className="text-black/75 leading-relaxed">
                  By submitting an entry to the European Hot Sauce Awards, you acknowledge that you have read, understood, and agree to these terms and conditions.
                </p>
                <p className="text-black/75 leading-relaxed mt-4">
                  Last Updated: 14th August 2026
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

export default TermsPage;
