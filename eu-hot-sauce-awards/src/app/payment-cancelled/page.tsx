import Link from "next/link";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <section className="flex justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <div className="border-[3px] border-black bg-white p-8 text-center space-y-6 md:p-12">
            <p className="text-4xl">✕</p>
            <div className="space-y-3">
              <h1 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
                Payment cancelled
              </h1>
              <p className="text-black/70">Your payment was cancelled. No charges have been made to your account.</p>
            </div>

            <div className="border-2 border-black bg-[#faf6ec] p-5 text-left text-sm text-black/70">
              <ul className="space-y-2">
                <li>Your registration is saved but not yet confirmed.</li>
                <li>You can return to your dashboard and complete payment anytime.</li>
                <li>
                  If you experienced an issue, please contact us at{' '}
                  <a href="mailto:support@heatawards.eu" className="font-semibold text-black underline">
                    support@heatawards.eu
                  </a>
                  .
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-block bg-black px-6 py-3 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
              >
                Go to dashboard
              </Link>
              <Link
                href="/"
                className="inline-block border-2 border-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.06em] hover:bg-black hover:text-[#F5C518]"
              >
                Return home
              </Link>
            </div>
          </div>
        </div>
      </section>
      <HeatFooter />
    </div>
  );
}
