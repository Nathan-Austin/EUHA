import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import LinkifyText from '@/components/LinkifyText';
import type { Metadata } from 'next';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient(cookies());

  const { data: event } = await supabase
    .from('events')
    .select('title, description')
    .eq('id', params.id)
    .eq('active', true)
    .single();

  if (!event) {
    return {
      title: 'Event Not Found',
    };
  }

  return {
    title: event.title,
    description: event.description || 'Find out more about this event from the European Hot Sauce Awards.',
  };
}

export default async function EventDetailPage({ params }: Props) {
  const supabase = createClient(cookies());

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .eq('active', true)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Events', href: '/events' }, { label: event.title }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(32px,5vw,52px)] uppercase leading-[0.95] text-white">
            {event.title}
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          {event.image_url && (
            <div className="relative mx-auto mb-10 aspect-[16/9] w-full max-w-3xl border-[3px] border-black">
              <Image src={event.image_url} alt={event.title} fill className="object-cover" priority />
            </div>
          )}

          <div className="grid grid-cols-1 gap-9 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-4 font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em]">
                About this event
              </h2>
              {event.description ? (
                <div className="whitespace-pre-wrap text-base leading-relaxed text-black/75">
                  <LinkifyText text={event.description} />
                </div>
              ) : (
                <p className="italic text-black/50">No description available.</p>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-4 border-[3px] border-black bg-white p-6">
                <h3 className="font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.08em] text-black/50">
                  Event details
                </h3>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-black/50">Date &amp; time</p>
                  <p className="font-semibold">
                    {new Date(event.event_date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                    {event.event_time && ` · ${event.event_time.slice(0, 5)}`}
                  </p>
                  {event.end_date && (
                    <p className="mt-1 text-sm text-black/60">
                      to {new Date(event.end_date).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                      {event.end_time && ` · ${event.end_time.slice(0, 5)}`}
                    </p>
                  )}
                </div>

                {event.location && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-black/50">Location</p>
                    <p className="font-semibold">{event.location}</p>
                  </div>
                )}

                {event.venue && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-black/50">Venue</p>
                    <p>{event.venue}</p>
                  </div>
                )}

                {event.url && (
                  <div className="border-t border-black/10 pt-4">
                    <Link
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-black py-3 text-center font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
                    >
                      Visit event website
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/events" className="block text-center text-sm font-semibold underline">
                &larr; Back to all events
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
