import Image from "next/image";
import type { Metadata } from "next";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import SponsorLink from "@/components/SponsorLink";
import { getYearEntrants } from "@/lib/pastResults";
import { COMPETITION_YEAR, PREVIOUS_COMPETITION_YEAR } from "@/lib/config";

export const metadata: Metadata = {
  title: `Sponsor EHSA ${COMPETITION_YEAR} — European Hot Sauce Awards`,
  description: `Sponsorship opportunities at the ${COMPETITION_YEAR} European Hot Sauce Awards congress in Berlin.`,
};

// 2026 sponsors, kept from the previous sponsors page — real logos/links, not placeholders.
const currentSponsors = [
  { name: "Chilisaus.be", logo_url: "/sponsors/chilisaus.png", url: "https://chilisaus.be/?utm_source=heatawards&utm_medium=referral&utm_campaign=2026_awards" },
  { name: "Republic of Heat", logo_url: "/sponsors/ROH_LOGO.png", url: "https://republicofheat.com/?utm_source=heatawards&utm_medium=referral&utm_campaign=2026_awards" },
];

// Indicative price ranges only — pricing structure isn't finalised. Every tier says
// TBC in the UI; these ranges exist purely as an internal anchor to iterate from,
// not numbers that have been agreed or quoted to anyone.
const TIERS = [
  {
    name: "Headline Sponsor",
    slots: "1 slot",
    price: "€8,000 – €15,000 (indicative)",
    description: `Top-level partner of EHSA ${COMPETITION_YEAR}. Branding across the Berlin congress, the homepage, every category and country page, and all results communications.`,
    features: [
      "Logo on every page of heatawards.eu",
      "Named partner at the Berlin congress",
      "First right of refusal for future editions",
    ],
  },
  {
    name: "Best in Berlin",
    slots: "1 slot",
    price: "€2,000 – €4,000 (indicative)",
    description: "A standalone award tied to the congress itself, presented live in Berlin — exact shape still being defined.",
    features: ["Named award at the ceremony", "Feature on the results page", "Press mention alongside the reveal"],
  },
  {
    name: "Category Sponsor",
    slots: "16 slots",
    price: "€500 – €1,500 (indicative)",
    description: "Put your name behind one of the 16 judging categories, from Mild to Freestyle.",
    features: ["\"Presented by\" on that category's page", "Logo on the category's medal cards", "Choice of category, first come first served"],
  },
  {
    name: "Best in Country",
    slots: "~23 slots",
    price: "€300 – €800 (indicative)",
    description: "Back the top-scoring sauce from a specific country — a natural fit for national brands, retailers or tourism boards.",
    features: ["\"Presented by\" on that country's page", "Named award for that country's top entry", "Choice of country, first come first served"],
  },
];

export default async function SponsorsPage() {
  const rows = await getYearEntrants();
  const countries = new Set(rows.map((r) => r.country).filter(Boolean)).size;
  const makers = new Set(rows.map((r) => r.company_name)).size;

  return (
    <div className="bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sponsors" }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
            Partner with EHSA {COMPETITION_YEAR}
          </p>
          <h1 className="max-w-[820px] font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,64px)] uppercase leading-[0.95] text-white">
            Back Europe&rsquo;s <span className="bg-[#F5C518] px-2 text-black">hot sauce</span> scene.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-300">
            EHSA {COMPETITION_YEAR} brings press and invited industry professionals together for a
            multi-day judging congress in Berlin. Sponsorship puts your name in front of the makers,
            press and buyers who show up for it.
          </p>
          <div className="mt-9 flex flex-wrap gap-8 border-t border-white/15 pt-7">
            <div>
              <strong className="block font-[family-name:var(--font-archivo-black)] text-4xl text-[#F5C518]">
                {countries}
              </strong>
              <span className="text-[11px] uppercase tracking-[0.12em] text-gray-300">
                Countries ({PREVIOUS_COMPETITION_YEAR})
              </span>
            </div>
            <div>
              <strong className="block font-[family-name:var(--font-archivo-black)] text-4xl text-[#F5C518]">
                {makers}
              </strong>
              <span className="text-[11px] uppercase tracking-[0.12em] text-gray-300">
                Award-winning makers ({PREVIOUS_COMPETITION_YEAR})
              </span>
            </div>
            <div>
              <strong className="block font-[family-name:var(--font-archivo-black)] text-4xl text-[#F5C518]">
                16
              </strong>
              <span className="text-[11px] uppercase tracking-[0.12em] text-gray-300">Judging categories</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
            <h2 className="font-[family-name:var(--font-archivo-black)] text-[clamp(28px,4vw,44px)] uppercase leading-[0.95]">
              Sponsorship <span className="bg-[#F5C518] px-2">tiers</span>.
            </h2>
            <span className="max-w-sm text-xs font-semibold uppercase tracking-[0.1em] text-black/50">
              Pricing structure is still being finalised — every figure below is indicative, not a quote.
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {TIERS.map((tier) => (
              <div key={tier.name} className="flex flex-col border-[3px] border-black bg-white p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-none">
                    {tier.name}
                  </h3>
                  <span className="bg-[#F5C518] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.06em]">
                    {tier.slots}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-black/75">{tier.description}</p>
                <ul className="mt-5 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-black/70">
                      <span className="text-[#e0a800]">&bull;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-black/10 pt-5">
                  <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-black/40">
                    {tier.price}
                  </span>
                  <a
                    href="mailto:heataward@gmail.com?subject=Sponsorship enquiry"
                    className="mt-3 inline-block bg-black px-5 py-3 font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.08em] text-[#F5C518] hover:bg-black/80"
                  >
                    Enquire &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-black py-16 text-white">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-[family-name:var(--font-archivo-black)] text-[clamp(26px,3.5vw,38px)] uppercase leading-[0.95]">
              Your logo, on the <span className="bg-[#F5C518] px-2 text-black">trophy</span>.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-300">
              Category sponsors get branding on the physical award handed out at the Berlin
              congress — this is an illustrative concept, not a finished design.
            </p>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden border-[3px] border-[#F5C518]">
            <Image src="/sponsor-trophy-example.webp" alt="Example trophy design with a sponsor logo placement" fill className="object-cover" />
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-[#f3ead8] py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <h2 className="mb-9 text-center font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
            {PREVIOUS_COMPETITION_YEAR} sponsors
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-14">
            {currentSponsors.map((s) => (
              <SponsorLink
                key={s.name}
                href={s.url}
                sponsorName={s.name}
                className="flex h-24 w-24 items-center justify-center border-2 border-black bg-white p-4 transition hover:-translate-y-1"
              >
                <Image src={s.logo_url} alt={s.name} width={96} height={96} className="object-contain" />
              </SponsorLink>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6 text-center">
          <h2 className="mb-5 font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
            Let&rsquo;s talk sponsorship.
          </h2>
          <p className="mx-auto max-w-lg text-sm text-gray-300">
            Contact: Neil Numb &middot; heataward@gmail.com &middot; (+49) 17682204595
          </p>
          <a
            href="mailto:heataward@gmail.com?subject=Sponsorship enquiry"
            className="mt-7 inline-block border-[3px] border-[#F5C518] bg-[#F5C518] px-8 py-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-[#e0a800]"
          >
            Sponsorship enquiry &rarr;
          </a>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
