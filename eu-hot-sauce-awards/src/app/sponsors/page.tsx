
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sponsors',
  description: 'Meet the sponsors of the EU Hot Sauce Awards and learn about sponsorship opportunities.',
};

// Mock data until DB is set up
const sponsors = [
  {
    name: "Flying Goose Brand",
    logo_url: "/sponsors/flying-goose.png",
    url: "https://flyinggoosesriracha.com/?utm_source=heatawards&utm_medium=referral&utm_campaign=2026_awards"
  },
  {
    name: "Chilisaus.be",
    logo_url: "/sponsors/chilisaus.png",
    url: "https://chilisaus.be/?utm_source=heatawards&utm_medium=referral&utm_campaign=2026_awards"
  },
  {
    name: "ROH",
    logo_url: "/sponsors/ROH_LOGO.png",
    url: "https://republicofheat.com/?utm_source=heatawards&utm_medium=referral&utm_campaign=2026_awards"
  }
];

const SponsorsPage = () => {
  return (
    <div className="bg-[#08040e] min-h-screen">
      <Hero title="Our Sponsors" />

      <div className="space-y-10 md:space-y-16 py-10 md:py-16">
        <SectionContainer>
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-8">Current Sponsors</h2>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {sponsors.map(sponsor => (
                <a
                  key={sponsor.name}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-6 rounded-2xl transition hover:shadow-lg hover:scale-105"
                >
                  <div className="w-48 h-48 flex items-center justify-center relative">
                    <Image
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      width={192}
                      height={192}
                      className="object-contain"
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur text-center">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Become a Sponsor</h2>
            <p className="text-base text-white/75 sm:text-lg max-w-3xl mx-auto mb-8">
              Support Europe's fastest-growing chili community. Benefits include your logo on our social media, printed on awards, and featured at the Berlin Chili Festival.
            </p>

            <div className="bg-black/30 p-6 rounded-lg max-w-xl mx-auto mb-8">
              <h3 className="font-semibold text-amber-200 mb-4">Contact Information</h3>
              <div className="space-y-2 text-white/80">
                <p><span className="text-white/60">Contact:</span> Neil Numb</p>
                <p><span className="text-white/60">Email:</span> heataward@gmail.com</p>
                <p><span className="text-white/60">Phone:</span> (+49) 17682204595</p>
              </div>
            </div>

            <Link href="/contact" className="rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:from-[#ff7033] hover:to-[#ffd060]">
              Sponsorship Enquiry
            </Link>
          </div>
        </SectionContainer>
      </div>
    </div>
  );
};

export default SponsorsPage;
