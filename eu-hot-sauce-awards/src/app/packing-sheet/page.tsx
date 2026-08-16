import Link from 'next/link';
import type { Metadata } from 'next';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getCompetitionSetting } from '@/app/actions';
import { SHIPPING_ADDRESS } from '@/lib/shipping';

export const metadata: Metadata = {
  title: 'Packing & Shipping',
  description: 'Find instructions for packing and shipping your sauce entries for the European Hot Sauce Awards, and download the official packing sheet.',
};

export default async function PackingSheetPage() {
  const shippingOpen = await getCompetitionSetting('shipping_open');

  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Packing & Shipping' }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(32px,5vw,52px)] uppercase leading-[0.95] text-white">
            Packing &amp; <span className="bg-[#F5C518] px-2 text-black">shipping</span>.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          {!shippingOpen ? (
            <div className="border-[3px] border-black bg-white p-8 text-center space-y-4 md:p-12">
              <p className="text-3xl">📦</p>
              <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase">Not open yet</h2>
              <p className="text-black/70">
                Packing and shipping instructions aren&rsquo;t available yet. We&rsquo;ll email you once it&rsquo;s
                time to ship your sauces.
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-black px-6 py-3 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
              >
                Go to dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="border-[3px] border-black bg-white p-8 md:p-12">
                <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.25em] text-black/50">
                  Shipping instructions
                </h2>
                <div className="space-y-4 text-black/75 leading-relaxed">
                  <p>
                    Please carefully pack your sauce samples to prevent breakage during transit. We recommend
                    using bubble wrap or similar protective materials.
                  </p>
                  <p>
                    Include a copy of your completed packing sheet inside the box to ensure proper
                    identification of your entries.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/shipping-form.pdf"
                  target="_blank"
                  className="inline-block bg-black px-8 py-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
                >
                  Download packing sheet (PDF)
                </Link>
              </div>

              <div className="border-[3px] border-black bg-white p-8 md:p-12">
                <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.25em] text-black/50">
                  Shipping address
                </h2>
                <div className="border-2 border-black bg-[#faf6ec] p-6">
                  <address className="not-italic text-black/80 leading-relaxed">
                    {SHIPPING_ADDRESS.lines.map((line, i) => (
                      <span key={i} className={i === 0 ? 'mb-2 block font-semibold text-black' : 'block'}>
                        {line}
                      </span>
                    ))}
                  </address>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
