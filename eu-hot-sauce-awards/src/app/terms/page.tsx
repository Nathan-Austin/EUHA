
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
                <h2 className="text-lg font-semibold text-amber-200 mb-3">1. Competition Eligibility</h2>
                <p className="text-white/75 leading-relaxed">
                  Placeholder text for competition eligibility rules. This section will detail who can enter the competition, what kinds of sauces are accepted, and any other requirements for entry.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">2. Entry Process</h2>
                <p className="text-white/75 leading-relaxed">
                  Placeholder text for the entry process. This will outline the step-by-step guide for participants to enter their sauces, including payment, ingredient submission, and shipping.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">3. Judging Criteria</h2>
                <p className="text-white/75 leading-relaxed">
                  Placeholder text for judging criteria. This section will explain how sauces are scored, what the judges are looking for, and the different categories for judging.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">4. Intellectual Property</h2>
                <p className="text-white/75 leading-relaxed">
                  Placeholder text for intellectual property rights. This will cover the rights of participants regarding their recipes and branding, and the rights of the event organizers.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">5. Liability Limitations</h2>
                <p className="text-white/75 leading-relaxed">
                  Placeholder text for liability limitations. This section will outline the responsibilities and liabilities of the event organizers and the participants.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">6. Communication & Contact</h2>
                <p className="text-white/75 leading-relaxed">
                  Placeholder text for communication and contact. This will specify how the event organizers will communicate with participants and how participants can get in touch.
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
