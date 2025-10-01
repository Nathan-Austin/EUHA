import Link from "next/link";

const routes = [
  {
    href: "/apply/supplier",
    title: "Supplier Entry",
    description:
      "Submit your sauce for consideration and receive official EU Hot Sauce Awards QR codes and logistics guidance.",
    cta: "Enter a Sauce",
  },
  {
    href: "/apply/judge",
    title: "Judge Application",
    description:
      "Join our panel of professionals and community tasters representing every corner of Europe’s heat culture.",
    cta: "Apply to Judge",
  },
];

export default function ApplyLandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08040e] text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,77,0,0.22),_transparent_55%),_radial-gradient(circle_at_bottom_left,_rgba(241,177,46,0.2),_transparent_50%)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" aria-hidden />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-16 px-6 pb-20 pt-24 sm:px-10 lg:px-12">
        <header className="space-y-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-amber-200/80">
            Heat Awards • Applications
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Bring the Heat to the 2026 EU Hot Sauce Awards
          </h1>
          <p className="mx-auto max-w-3xl text-base text-white/80 sm:text-lg">
            Whether you craft exceptional sauces or you live to judge them, this portal is your gateway to the continent’s definitive celebration of flavour and fire.
          </p>
        </header>

        <section className="grid gap-8 sm:grid-cols-2">
          {routes.map(({ href, title, description, cta }) => (
            <Link
              key={href}
              href={href}
              className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] p-8 backdrop-blur transition hover:border-white/25 hover:bg-white/[0.1]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative space-y-4">
                <h2 className="text-2xl font-semibold text-white">{title}</h2>
                <p className="text-sm text-white/70">{description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200 transition group-hover:translate-x-1">
                  {cta}
                  <svg
                    aria-hidden
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 12 12"
                  >
                    <path
                      d="M3 9l4-4-4-4"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
