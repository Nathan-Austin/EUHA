import Link from 'next/link';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#F5C518]">404</p>
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(32px,5vw,52px)] uppercase leading-[0.95] text-white">
            Page <span className="bg-[#F5C518] px-2 text-black">not found</span>.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="border-[3px] border-black bg-white p-8 space-y-4 md:p-12">
            <p className="text-3xl">🌶️</p>
            <p className="text-black/70">
              We couldn&rsquo;t find the page you were looking for — it may have moved, or the link might be
              out of date.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href="/"
                className="inline-block bg-black px-6 py-3 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
              >
                Back to home
              </Link>
              <Link
                href="/contact"
                className="inline-block border-2 border-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.06em] hover:bg-black hover:text-[#F5C518]"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
