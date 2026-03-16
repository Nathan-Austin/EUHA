import Link from "next/link";

export default function JudgeApplyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08040e] text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,77,0,0.22),_transparent_55%),_radial-gradient(circle_at_bottom_left,_rgba(241,177,46,0.2),_transparent_50%)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" aria-hidden />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-10 px-6 pb-20 pt-24 sm:px-10 lg:px-12">
        <header className="space-y-4">
          <Link href="/apply" className="text-xs uppercase tracking-[0.3em] text-amber-200/70 transition hover:text-amber-200">
            ← Back to Applications
          </Link>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Judge Application</h1>
        </header>

        <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur text-center space-y-4">
          <p className="text-2xl">🌶️</p>
          <h2 className="text-xl font-semibold text-white">Applications are now closed</h2>
          <p className="text-white/70">
            Judge applications for the 2026 EU Hot Sauce Awards have closed. We look forward to welcoming you as a judge for the 2027 awards.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
