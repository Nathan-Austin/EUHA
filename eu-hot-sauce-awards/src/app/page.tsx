import Link from "next/link";

const categories = [
  {
    title: "Heritage & Tradition",
    description: "Celebrating long-standing producers who honour regional recipes with remarkable depth and balance.",
  },
  {
    title: "Innovation & Fusion",
    description: "Bold flavour experiments that blend European craftsmanship with global heat influences.",
  },
  {
    title: "Sustainable Fire",
    description: "Sauces championing local sourcing, regenerative agriculture, and low-impact packaging.",
  },
];

const milestones = [
  { label: "Applications Close", value: "28 Feb 2026" },
  { label: "Boxes Ship", value: "24 Mar 2026" },
  { label: "Judging Weekend", value: "11–12 Apr 2026" },
];

const stats = [
  { label: "Countries Represented", value: "24" },
  { label: "Sauces Blind-Tasted", value: "180" },
  { label: "Expert & Community Judges", value: "120" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08040e] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,77,0,0.22),_transparent_55%),_radial-gradient(circle_at_bottom_left,_rgba(241,177,46,0.2),_transparent_50%)]" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" aria-hidden />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-20 pt-24 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-amber-200/80">
              Heat Awards • 2026 Edition
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Welcome to the EU Hot Sauce Awards Judging Portal
            </h1>
            <p className="text-lg text-white/80 sm:text-xl">
              Hosted by <span className="font-semibold text-amber-300">Heat Awards Europe</span>, the 2026 competition brings together artisans, industry pioneers, and community fire-fans to celebrate the boldest sauces on the continent.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/login"
                className="rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060]"
              >
                Judge Login
              </Link>
              <Link
                href="/apply/judge"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
              >
                Apply to Judge
              </Link>
              <Link
                href="/apply/supplier"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
              >
                Enter a Sauce
              </Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
              2026 Key Dates
            </h2>
            <dl className="grid gap-3">
              {milestones.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-6 border-b border-white/10 pb-3 last:border-none last:pb-0">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/60">{label}</dt>
                  <dd className="text-base font-semibold text-white">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-white/60">
              Registered judges receive tasting kits and digital scorecards via this portal.
            </p>
            <Link
              href="/dashboard"
              className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200/80 transition hover:text-amber-200"
            >
              Admin Access
            </Link>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold sm:text-4xl">What to Expect</h2>
            <p className="text-base text-white/80 sm:text-lg">
              From iconic classics to trailblazing newcomers, the EU Hot Sauce Awards benchmark craftsmanship, sustainability, and flavour. Each entry is blind-tasted across multiple categories, with weighted scoring from pro, community, and supplier judges.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center shadow-[0_0_25px_rgba(241,177,46,0.08)]">
                  <div className="text-3xl font-semibold text-amber-300 sm:text-4xl">{value}</div>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0d0716]/80 p-6 backdrop-blur">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">Award Pillars</h3>
            <ul className="space-y-4">
              {categories.map(({ title, description }) => (
                <li key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h4 className="text-lg font-semibold text-white">{title}</h4>
                  <p className="mt-2 text-sm text-white/70">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Become Part of the Fire</h2>
              <p className="text-sm text-white/70 sm:max-w-3xl">
                New suppliers and aspiring judges can register interest with the Heat Awards team. We prioritise diversity across regions, heat levels, and flavour philosophies to reflect the breadth of Europe&apos;s heat culture.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="https://heatawards.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
              >
                Explore Heat Awards
              </Link>
              <Link
                href="/apply/judge"
                className="rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060]"
              >
                Apply to Judge
              </Link>
              <Link
                href="/apply/supplier"
                className="rounded-full border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
              >
                Submit a Sauce
              </Link>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-4 pb-4 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Heat Awards Europe. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="transition hover:text-white">
              Judge Login
            </Link>
            <Link href="/auth/auth-code-error" className="transition hover:text-white">
              Support
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
