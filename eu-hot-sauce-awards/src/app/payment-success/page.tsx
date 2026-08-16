import Link from "next/link";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <section className="flex justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <div className="border-[3px] border-black bg-white p-8 text-center space-y-6 md:p-12">
            <p className="text-4xl">✅</p>
            <div className="space-y-3">
              <h1 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
                Payment successful
              </h1>
              <p className="text-black/70">
                Thank you — your payment is confirmed and your account is now active.
              </p>
            </div>

            <div className="border-2 border-black bg-[#faf6ec] p-5 text-left text-sm text-black/70">
              <p>
                Check your dashboard for what happens next — including any shipping or entry details
                specific to you. We&rsquo;ll also email you a confirmation shortly.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-block bg-black px-8 py-3.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </section>
      <HeatFooter />
    </div>
  );
}
