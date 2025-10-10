import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

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
    description: event.description || 'Find out more about this event from the EU Hot Sauce Awards.',
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
    <div className="bg-[#08040e] min-h-screen">
      <Hero title={event.title} />

      <div className="py-10 md:py-16">
        <SectionContainer>
          <div className="space-y-8">
            {event.image_url && (
              <div className="relative h-64 md:h-[500px] w-full overflow-hidden rounded-3xl">
                <Image
                  src={event.image_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
                  {event.description ? (
                    <p className="text-white/75 leading-relaxed text-lg whitespace-pre-wrap">
                      {event.description}
                    </p>
                  ) : (
                    <p className="text-white/50 italic">No description available.</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur space-y-4">
                  <h3 className="text-lg font-semibold text-amber-400">Event Details</h3>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Date</p>
                    <p className="text-white font-medium">
                      {new Date(event.event_date).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {event.end_date && (
                      <p className="text-white/60 text-sm mt-1">
                        to {new Date(event.end_date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>

                  {event.location && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Location</p>
                      <p className="text-amber-200 font-semibold">📍 {event.location}</p>
                    </div>
                  )}

                  {event.venue && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Venue</p>
                      <p className="text-white/90">{event.venue}</p>
                    </div>
                  )}

                  {event.url && (
                    <div className="pt-4 border-t border-white/10">
                      <Link
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:from-[#ff7033] hover:to-[#ffd060]"
                      >
                        Visit Event Website
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/events"
                  className="block text-center text-sm text-amber-200/70 transition hover:text-amber-200"
                >
                  ← Back to All Events
                </Link>
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>
    </div>
  );
}
