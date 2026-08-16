import Link from "next/link";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import { COMPETITION_YEAR } from "@/lib/config";

const routes = [
  {
    href: "/login",
    title: "Supplier Entry",
    description:
      "Log in (or create an account) to enter your sauces for this year's European Hot Sauce Awards from your dashboard.",
    cta: "Log In to Enter",
  },
  {
    href: "/apply/judge",
    title: "Judge Application",
    description:
      "Apply to join the judging panel at the EHSA congress in Berlin — open to chefs, critics, retailers, and other food-industry professionals.",
    cta: "Apply to Judge",
  },
];

export default function ApplyLandingPage() {
  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Applications" }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#F5C518]">
            EHSA {COMPETITION_YEAR}
          </p>
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(32px,5vw,52px)] uppercase leading-[0.95] text-white">
            Bring the <span className="bg-[#F5C518] px-2 text-black">heat</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/75 sm:text-lg">
            Whether you craft exceptional sauces or you live to judge them, this is your gateway to the
            continent&rsquo;s definitive celebration of flavour and fire.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-4xl gap-8 px-6 sm:grid-cols-2">
          {routes.map(({ href, title, description, cta }) => (
            <Link
              key={href}
              href={href}
              className="group border-[3px] border-black bg-white p-8 transition hover:bg-black hover:text-white"
            >
              <div className="space-y-4">
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase">{title}</h2>
                <p className="text-sm text-black/70 group-hover:text-white/70">{description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.06em] text-black group-hover:text-[#F5C518]">
                  {cta}
                  <svg aria-hidden className="h-3 w-3" fill="none" viewBox="0 0 12 12">
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
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
