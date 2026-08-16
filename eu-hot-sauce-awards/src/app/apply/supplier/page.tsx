import Link from "next/link";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function SupplierApplyPage() {
  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Applications", href: "/apply" }, { label: "Supplier Entry" }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(32px,5vw,52px)] uppercase leading-[0.95] text-white">
            Supplier <span className="bg-[#F5C518] px-2 text-black">entry</span>.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-2xl px-6">
          <div className="border-[3px] border-black bg-white p-8 text-center space-y-4 md:p-12">
            <p className="text-3xl">🌶️</p>
            <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase">
              Enter through your dashboard
            </h2>
            <p className="text-black/70">
              Sauce entries are managed from your supplier dashboard now — log in (or create an account) to
              add your sauces, track payment, and manage your producer info in one place.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href="/login"
                className="inline-block bg-black px-6 py-3 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
              >
                Log in to enter
              </Link>
              <Link
                href="/"
                className="inline-block border-2 border-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.06em] hover:bg-black hover:text-[#F5C518]"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
