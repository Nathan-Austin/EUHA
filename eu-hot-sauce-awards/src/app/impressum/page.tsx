
import type { Metadata } from 'next';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import { COMPANY_INFO } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Legal notice (Impressum) for the European Hot Sauce Awards, per §5 TMG.',
};

const ImpressumPage = () => {
  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Impressum' }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,56px)] uppercase leading-[0.95] text-white">
            Impressum<span className="bg-[#F5C518] px-2 text-black">.</span>
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
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">Information according to § 5 TMG</h2>
                <div className="text-black/75 leading-relaxed space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-1">Company</p>
                    <p>{COMPANY_INFO.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-1">Authorized Partners (Vertretungsberechtigte Gesellschafter)</p>
                    <p>{COMPANY_INFO.partners}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-1">Address</p>
                    <address className="not-italic">
                      {COMPANY_INFO.address.street}<br />
                      {COMPANY_INFO.address.postalCode} {COMPANY_INFO.address.city}, {COMPANY_INFO.address.country}
                    </address>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-1">Phone</p>
                    <p>{COMPANY_INFO.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-1">Email</p>
                    <p><a href={`mailto:${COMPANY_INFO.legalEmail}`} className="text-black underline font-semibold hover:opacity-70">{COMPANY_INFO.legalEmail}</a></p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50 mb-1">VAT ID (Umsatzsteuer-ID acc. § 27a UStG)</p>
                    <p>{COMPANY_INFO.vat.number}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">Consumer Dispute Resolution / Universal Arbitration Board</h2>
                <p className="text-black/75 leading-relaxed">
                  We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">Liability for Content / Links / Copyright</h2>
                <p className="text-black/75 leading-relaxed">
                  We make every effort to keep the information on our website current, but accept no liability for the content provided. Pursuant to §7 para. 1 of TMG, we as service providers are liable for our own content on these pages in accordance with general laws. However, pursuant to §§8 to 10 of the TMG, we as service providers are not obliged to monitor external information transmitted or stored, or to investigate circumstances that indicate illegal activity. Our obligations to remove or block the use of information under general law remain unaffected by this.
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

export default ImpressumPage;
