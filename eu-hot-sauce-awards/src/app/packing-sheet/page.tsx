
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Packing & Shipping',
  description: 'Find instructions for packing and shipping your sauce entries for the EU Hot Sauce Awards, and download the official packing sheet.',
};

const PackingSheetPage = () => {
  return (
    <div className="bg-[#08040e] min-h-screen">
      <Hero title="Packing & Shipping Guidelines" />

      <div className="space-y-10 md:space-y-16 py-10 md:py-16">
        <SectionContainer>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Shipping Instructions</h2>
              <div className="space-y-4 text-white/75 leading-relaxed">
                <p>
                  Please carefully pack your sauce samples to prevent breakage during transit. We recommend using bubble wrap or similar protective materials.
                </p>
                <p>
                  Include a copy of your completed packing sheet inside the box to ensure proper identification of your entries.
                </p>
                <div className="bg-black/30 p-4 rounded-lg mt-6">
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Important Deadline</p>
                  <p className="font-bold text-lg text-amber-200">Samples must arrive by: 28 February 2026</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/shipping-form.pdf"
                target="_blank"
                download
                className="inline-block rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:from-[#ff7033] hover:to-[#ffd060]"
              >
                📄 Download Packing Sheet (PDF)
              </Link>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Shipping Address</h2>
              <div className="bg-black/30 p-6 rounded-lg">
                <address className="not-italic text-white/80 leading-relaxed">
                  <span className="block font-semibold text-white mb-2">EUROPEAN HOT SAUCE AWARDS</span>
                  CBS Foods GmbH<br />
                  Ossastr 21A<br />
                  12045 Berlin, Neukölln<br />
                  Germany
                </address>
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>
    </div>
  );
};

export default PackingSheetPage;
