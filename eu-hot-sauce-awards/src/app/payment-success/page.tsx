import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08040e] text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,77,0,0.22),_transparent_55%),_radial-gradient(circle_at_bottom_left,_rgba(241,177,46,0.2),_transparent_50%)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" aria-hidden />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-2xl space-y-8 rounded-3xl border border-emerald-300/30 bg-emerald-500/5 p-12 text-center backdrop-blur">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
            <svg
              className="h-10 w-10 text-emerald-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Payment Successful!
            </h1>
            <p className="text-lg text-white/75">
              Thank you for your payment. Your registration has been confirmed and your account is now active.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-200/20 bg-black/30 p-6 text-left text-sm text-white/70">
              <h2 className="font-semibold text-amber-200 mb-3">📦 Shipping Requirements</h2>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-amber-300">•</span>
                  <span><strong className="text-white">Required:</strong> 2 bottles of each sauce for judging</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-300">•</span>
                  <span><strong className="text-white">Optional:</strong> Include promotional stickers - we&apos;ll hand them out at Chili Fest</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-300">•</span>
                  <span><strong className="text-white">Optional:</strong> Include a 3rd bottle - we&apos;ll sell it at Chili Fest for charity</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-200/20 bg-black/30 p-6 text-left text-sm text-white/70">
              <h2 className="font-semibold text-emerald-200 mb-3">What happens next?</h2>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-emerald-300">•</span>
                  <span>You&apos;ll receive a confirmation email shortly with your registration details.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-300">•</span>
                  <span>Download the packing sheet from your dashboard and include it with your shipment.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-300">•</span>
                  <span>Ship your bottles to: EUROPEAN HOT SAUCE AWARDS, CBS Foods GmbH, Ossastr 21A, 12045 Berlin, Neukölln, Germany.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-300">•</span>
                  <span>Check your email regularly for updates about the judging event.</span>
                </li>
              </ul>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-block rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060]"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
