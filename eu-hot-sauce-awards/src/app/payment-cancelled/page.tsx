import Link from "next/link";

export default function PaymentCancelledPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08040e] text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,77,0,0.22),_transparent_55%),_radial-gradient(circle_at_bottom_left,_rgba(241,177,46,0.2),_transparent_50%)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" aria-hidden />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-2xl space-y-8 rounded-3xl border border-amber-300/30 bg-amber-500/5 p-12 text-center backdrop-blur">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
            <svg
              className="h-10 w-10 text-amber-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Payment Cancelled
            </h1>
            <p className="text-lg text-white/75">
              Your payment was cancelled. No charges have been made to your account.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-amber-200/20 bg-black/30 p-6 text-left text-sm text-white/70">
            <h2 className="font-semibold text-amber-200">What now?</h2>
            <ul className="space-y-2">
              <li className="flex gap-3">
                <span className="text-amber-300">•</span>
                <span>Your registration is saved but not yet confirmed.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-300">•</span>
                <span>You can return to your dashboard and complete payment anytime.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-300">•</span>
                <span>If you experienced an issue, please contact us at support@heatawards.eu</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-block rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060]"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-block rounded-full border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
