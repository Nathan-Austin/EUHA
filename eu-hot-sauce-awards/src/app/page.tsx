import Link from "next/link";
import Image from "next/image";
import SectionContainer from "@/components/SectionContainer";
import NewsletterSignup from "@/components/NewsletterSignup";

// Data (can be moved later)
const categories = [
  { title: "Mild Chili Sauce" },
  { title: "Medium Chili Sauce" },
  { title: "Hot Chili Sauce" },
  { title: "Extra Hot Chili Sauce" },
  { title: "Extract Based Chili Sauce" },
  { title: "BBQ Chili Sauce" },
  { title: "Chili Ketchup" },
  { title: "Chili Jam" },
  { title: "Chili Honey" },
  { title: "Maple Syrup Chili Sauce" },
  { title: "Garlic Chili Sauce" },
  { title: "Chili Pickle" },
  { title: "Chili Chutney" },
  { title: "Chili Oil" },
  { title: "Freestyle" },
  { title: "Sweet/Sour Chili Sauce" },
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

// Mock data for new sections
const featuredJudges = [
  { name: "Judge 1", photo_url: "" },
  { name: "Judge 2", photo_url: "" },
  { name: "Judge 3", photo_url: "" },
];
const pastWinners = [
  { name: "Winner 1", photo_url: "" },
  { name: "Winner 2", photo_url: "" },
  { name: "Winner 3", photo_url: "" },
];
const sponsors = [
  { name: "Flying Goose", logo_url: "" },
  { name: "Chilisaus.be", logo_url: "" },
];


export default function Home() {
  return (
    <main className="relative bg-[#08040e]">
      {/* 1. Sticky Banner Image */}
      <div className="sticky top-0 -z-10 h-screen/2 md:h-screen/2">
        <Image 
          src="/cropped-banner-website.jpg" 
          alt="European Hot Sauce Awards Banner"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* 2. Scrolling Content */}
      <div className="relative z-10 bg-transparent">
        {/* This div creates space equal to the banner height before the real content starts */}
        <div className="h-screen/2 md:h-screen/2"></div>

        {/* Title and CTA Section */}
        <div className="bg-gradient-to-b from-transparent to-[#08040e]">
            <SectionContainer>
                <div className="text-center">
                  <h1 className="text-4xl font-semibold leading-tight sm:text-5xl text-white">European Hot Sauce Awards 2026</h1>
                  <p className="mt-4 text-lg text-white/75 sm:text-xl">Celebrating the best of European hot sauce craft and innovation.</p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Link href="/apply/supplier" className="rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060]">
                      Enter Competition
                    </Link>
                    <Link href="/apply/judge" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10">
                      Apply to Judge
                    </Link>
                  </div>
                </div>
            </SectionContainer>
        </div>

        <div className="bg-[#08040e] space-y-10 md:space-y-20 py-10 md:py-20">
            {/* Welcome Section */}
            <SectionContainer>
                <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur">
                    <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Welcome to the Heat Awards</h2>
                    <p className="text-center text-base text-white/75 sm:text-lg max-w-3xl mx-auto">
                        The European Hot Sauce Awards are back for our third year, bringing together the finest producers, judges, and chili fans from across the continent and beyond. We champion craftsmanship, innovation, and sustainability in the world of hot sauce.
                    </p>
                </div>
            </SectionContainer>

            {/* Other sections with the new styling */}
            <SectionContainer>
                <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur">
                    <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Competition Categories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map(cat => (
                          <div key={cat.title} className="bg-black/30 p-4 rounded-lg text-center">
                            <h3 className="font-semibold text-white">{cat.title}</h3>
                          </div>
                        ))}
                    </div>
                </div>
            </SectionContainer>

            <SectionContainer>
                <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur">
                    <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Key Dates</h2>
                    <div className="max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      {milestones.map(m => (
                        <div key={m.label} className="bg-black/30 p-4 rounded-lg">
                          <div className="font-semibold text-amber-200">{m.value}</div>
                          <div className="text-xs uppercase tracking-[0.2em] text-white/60">{m.label}</div>
                        </div>
                      ))}
                    </div>
                </div>
            </SectionContainer>

            <SectionContainer>
                <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur">
                    <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Sponsors</h2>
                     <div className="flex justify-center items-center space-x-8">
                        {sponsors.map(s => (
                          <div key={s.name} className="w-32 h-32 bg-black/30 rounded-lg flex items-center justify-center text-white/70">{s.name}</div>
                        ))}
                      </div>
                      <div className="text-center mt-6">
                        <Link href="/sponsors" className="text-xs uppercase tracking-[0.2em] text-amber-200/70 transition hover:text-amber-200">
                            Become a sponsor &rarr;
                        </Link>
                      </div>
                </div>
            </SectionContainer>

            <SectionContainer>
                <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur">
                    <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Newsletter</h2>
                    <NewsletterSignup />
                </div>
            </SectionContainer>
        </div>
      </div>
    </main>
  );
}
