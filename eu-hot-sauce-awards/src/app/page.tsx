import Link from "next/link";
import Image from "next/image";
import NewsletterSignup from "@/components/NewsletterSignup";
import SponsorLink from "@/components/SponsorLink";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";

// Data (can be moved later)
const categories = [
  { title: "Mild Chili Sauce" },
  { title: "Medium Chili Sauce" },
  { title: "Hot Chili Sauce" },
  { title: "Extra Hot Chili Sauce" },
  { title: "Extract Based Chili Sauce" },
  { title: "BBQ Chili Sauce" },
  { title: "Chili Ketchup" },
  { title: "Sweet" },
  { title: "Chili Honey" },
  { title: "Garlic Chili Sauce" },
  { title: "Sambal, Chutney & Pickles" },
  { title: "Chili Oil" },
  { title: "Freestyle" },
  { title: "Asian Style Chili Sauce" },
  { title: "Salt & Condiments" },
  { title: "Chili Paste" },
];

const milestones = [
  { label: "Applications Close", value: "28 Feb 2026" },
  { label: "Boxes Ship", value: "24 Mar 2026" },
  { label: "Judging Weekend", value: "11–12 Apr 2026" },
  { label: "Results Announced", value: "May 2026" },
];

const stats = [
  { label: "Countries", value: "24" },
  { label: "Sauces", value: "180+" },
  { label: "Judges", value: "120" },
];

const sponsors = [
  { name: "Flying Goose", logo_url: "/sponsors/flying-goose.png", url: "https://flyinggoosesriracha.com/?utm_source=heatawards&utm_medium=referral&utm_campaign=2026_awards" },
  { name: "Chilisaus.be", logo_url: "/sponsors/chilisaus.png", url: "https://chilisaus.be/?utm_source=heatawards&utm_medium=referral&utm_campaign=2026_awards" },
  { name: "Republic of Heat", logo_url: "/sponsors/ROH_LOGO.png", url: "https://republicofheat.com/?utm_source=heatawards&utm_medium=referral&utm_campaign=2026_awards" },
];

export default function Home() {
  return (
    <div className="bg-[#faf6ec] text-black">
      <HeatHeader />

      {/* HERO */}
      <section className="relative flex min-h-[560px] items-center bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/70 to-black/25" />
        <div className="relative mx-auto max-w-[1240px] px-6 py-20">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
            EU Hot Sauce Awards &middot; Judged in Berlin
          </p>
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(40px,7vw,84px)] uppercase leading-[0.95] text-white">
            Europe&rsquo;s best hot sauce,
            <br />
            <span className="bg-[#F5C518] px-2 text-black">judged by peers.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-200">
            The European Hot Sauce Awards are back for our third year, bringing together the
            finest producers, judges and chilli fans from across the continent and beyond.
            European and international entries are judged separately.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <div className="flex flex-col items-start gap-2">
              <span className="cursor-not-allowed bg-[#F5C518]/40 px-6 py-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black/50">
                Entries closed for 2026
              </span>
              <p className="text-xs text-gray-400">We look forward to seeing you for 2027.</p>
            </div>
            <Link
              href="/results/2026"
              className="border-[3px] border-white px-6 py-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-white hover:bg-white hover:text-black"
            >
              See 2026 results &rarr;
            </Link>
          </div>
          <div className="mt-11 flex flex-wrap gap-12">
            {stats.map((s) => (
              <div key={s.label}>
                <strong className="block font-[family-name:var(--font-archivo-black)] text-4xl text-[#F5C518]">
                  {s.value}
                </strong>
                <span className="mt-1 block text-xs uppercase tracking-[0.12em] text-gray-300">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="border-b border-black/10 py-14">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-black/50">
            Welcome to the Heat Awards
          </h2>
          <p className="text-base leading-relaxed text-black/75 sm:text-lg">
            We champion craftsmanship, innovation and sustainability in the world of hot sauce.
            Entry is open to all — European (continental) and international entries are judged
            separately by community, professional and supplier judges.
          </p>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
            <h2 className="font-[family-name:var(--font-archivo-black)] text-[clamp(28px,4vw,44px)] uppercase leading-[0.95]">
              16 categories.
              <br />
              <span className="bg-[#F5C518] px-2">One heat ladder.</span>
            </h2>
            <Link
              href="/prizes"
              className="border-b-[3px] border-black pb-1 text-xs font-bold uppercase tracking-[0.1em]"
            >
              How judging works &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="border-2 border-black bg-white p-4 text-center transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="font-[family-name:var(--font-archivo-black)] text-sm uppercase leading-tight">
                  {cat.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEY DATES */}
      <section className="bg-black py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <h2 className="mb-9 font-[family-name:var(--font-archivo-black)] text-2xl uppercase text-white">
            Key dates
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {milestones.map((m) => (
              <div key={m.label} className="border-2 border-[#F5C518] p-5 text-center">
                <div className="font-[family-name:var(--font-archivo-black)] text-lg text-[#F5C518]">
                  {m.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.12em] text-gray-300">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA TILES */}
      <section className="border-y-4 border-black bg-[#F5C518] py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="grid gap-7 md:grid-cols-3">
            <div className="flex min-h-[190px] flex-col justify-between bg-black p-8">
              <div>
                <h3 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-tight text-white">
                  For makers.
                  <br />
                  Enter EHSA 2027.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Ship a box for judging. Entries open ahead of the 2027 competition.
                </p>
              </div>
              <Link
                href="/apply/supplier"
                className="mt-5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.1em] text-[#F5C518]"
              >
                Register interest &rarr;
              </Link>
            </div>
            <div className="flex min-h-[190px] flex-col justify-between bg-black p-8">
              <div>
                <h3 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-tight text-white">
                  For judges.
                  <br />
                  Apply to score.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Community, professional and supplier judging slots open closer to the event.
                </p>
              </div>
              <Link
                href="/apply/judge"
                className="mt-5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.1em] text-[#F5C518]"
              >
                Apply to judge &rarr;
              </Link>
            </div>
            <div className="flex min-h-[190px] flex-col justify-between bg-black p-8">
              <div>
                <h3 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase leading-tight text-white">
                  For partners.
                  <br />
                  Become a sponsor.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Limited sponsor slots per year, matched by category fit.
                </p>
              </div>
              <Link
                href="/sponsors"
                className="mt-5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.1em] text-[#F5C518]"
              >
                Sponsor enquiries &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      <section className="border-b border-black/10 bg-[#faf6ec] py-14">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-16 px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            2026 Official Sponsors
          </span>
          {sponsors.map((s) => (
            <SponsorLink
              key={s.name}
              href={s.url}
              sponsorName={s.name}
              className="flex h-20 w-20 items-center justify-center p-3 transition hover:scale-105"
            >
              <Image src={s.logo_url} alt={s.name} width={80} height={80} className="object-contain" />
            </SponsorLink>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-black py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <NewsletterSignup />
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
