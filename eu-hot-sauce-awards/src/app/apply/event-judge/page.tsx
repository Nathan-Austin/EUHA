import Link from 'next/link';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import { getCompetitionSetting } from '@/app/actions';
import EventJudgeRegisterForm from './EventJudgeRegisterForm';

export default async function EventJudgeRegisterPage() {
  const registrationOpen = await getCompetitionSetting('event_judge_registration_open');

  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <section className="flex justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {registrationOpen ? (
            <EventJudgeRegisterForm />
          ) : (
            <div className="border-[3px] border-black bg-white p-8 text-center space-y-4">
              <p className="text-3xl">🌶️</p>
              <h1 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase">Not open</h1>
              <p className="text-black/70">
                Event-judge registration isn&rsquo;t open right now. Judges are approved through the main
                application process instead.
              </p>
              <Link
                href="/apply/judge"
                className="inline-block bg-black px-6 py-3 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
              >
                Apply to judge
              </Link>
            </div>
          )}
        </div>
      </section>
      <HeatFooter />
    </div>
  );
}
