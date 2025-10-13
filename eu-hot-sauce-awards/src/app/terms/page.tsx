
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read the official terms and conditions for entering and participating in the EU Hot Sauce Awards.',
};

const TermsPage = () => {
  return (
    <div className="bg-[#08040e] min-h-screen">
      <Hero title="Terms & Conditions" />

      <div className="space-y-10 md:space-y-16 py-10 md:py-16">
        <SectionContainer>
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur max-w-4xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-amber-200 mb-4">European Hot Sauce Awards – Terms and Conditions</h2>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">1. Competition Eligibility</h2>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">1.1 Participant Requirements</h3>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li>The competition is open to hot sauce producers from Europe and internationally</li>
                  <li>Only commercially available hot sauces are eligible to enter</li>
                  <li>Sauces must comply with all health, safety, and hygiene regulations</li>
                  <li>All entries must have a valid use-by date extending beyond May 2026</li>
                </ul>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">1.2 Entry Restrictions</h3>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li>Producers may enter multiple sauces</li>
                  <li>Each sauce entered in multiple categories requires a separate entry</li>
                  <li>Sauces must be created within the past 12 months</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">2. Entry Process</h2>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">2.1 Submission Requirements</h3>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li>Complete online payment for entries</li>
                  <li>Submit detailed ingredients list</li>
                  <li>Provide accurate allergen information</li>
                  <li>Ship sauce samples according to provided guidelines</li>
                  <li>Ensure all entries reach the competition by Saturday 28th February 2025</li>
                </ul>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">2.2 Fees and Payments</h3>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li>Entry fees are non-refundable</li>
                  <li>Discounts apply for multiple sauce entries</li>
                  <li>Payment confirms acceptance of these terms and conditions</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">3. Judging and Awards</h2>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">3.1 Judging Process</h3>
                <p className="text-white/75 leading-relaxed mb-2">
                  Judging will be conducted by professional & experienced tasters. Sauces will be evaluated on:
                </p>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li>Flavor complexity</li>
                  <li>Heat balance</li>
                  <li>Ingredient quality</li>
                  <li>Originality</li>
                  <li>Overall sensory experience</li>
                </ul>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">3.2 Award Decisions</h3>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li>Judges' decisions are final</li>
                  <li>Gold, Silver, and Bronze awards will be presented in each category</li>
                  <li>Top 20 highest-scoring sauces will be added to global rankings</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">4. Intellectual Property and Usage Rights</h2>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">4.1 Sauce Submissions</h3>
                <p className="text-white/75 leading-relaxed mb-2">
                  By entering, participants grant the competition organizers:
                </p>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li>Right to feature sauce names in press releases</li>
                  <li>Permission to use submitted information for promotional purposes</li>
                  <li>Ability to list winners on official websites</li>
                </ul>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">4.2 Ownership</h3>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li>Submitted sauce samples become the property of the competition</li>
                  <li>Samples will not be returned unless prior arrangements are made</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">5. Liability and Limitations</h2>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">5.1 Disclaimer</h3>
                <p className="text-white/75 leading-relaxed mb-2">
                  Competition organizers are not responsible for:
                </p>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li>Lost or damaged entries during shipping</li>
                  <li>Technical issues with online submission</li>
                  <li>Errors in entry information provided by participants</li>
                </ul>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">5.2 Privacy</h3>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li>Personal and business information will be handled confidentially</li>
                  <li>Contact information may be used for competition-related communications</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">6. Miscellaneous</h2>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">6.1 Communication</h3>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li>All official communication will be via the provided email: <a href="mailto:heataward@gmail.com" className="text-amber-300 hover:text-amber-200 underline">heataward@gmail.com</a></li>
                  <li>Participants are responsible for maintaining updated contact information</li>
                </ul>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">6.2 Modifications</h3>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li>Competition organizers reserve the right to modify competition rules</li>
                  <li>Any changes will be communicated to registered participants</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">7. Acceptance of Terms</h2>
                <p className="text-white/75 leading-relaxed">
                  By submitting an entry to the European Hot Sauce Awards, you acknowledge that you have read, understood, and agree to these terms and conditions.
                </p>
                <p className="text-white/75 leading-relaxed mt-4">
                  Last Updated: 25th March 2025
                </p>
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>
    </div>
  );
};

export default TermsPage;
