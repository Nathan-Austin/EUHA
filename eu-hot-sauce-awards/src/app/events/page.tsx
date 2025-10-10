import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Upcoming Events',
  description: 'Find out about upcoming chili festivals and events related to the EU Hot Sauce Awards.',
};

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  venue: string | null;
  url: string | null;
  image_url: string | null;
  featured: boolean;
  active: boolean;
}

const EventsPage = async () => {
  const supabase = createClient(cookies());

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('active', true)
    .order('event_date', { ascending: true });

  const allEvents = events || [];
  const featuredEvents = allEvents.filter(e => e.featured);
  const upcomingEvents = allEvents.filter(e => !e.featured);

  return (
    <div className="bg-[#08040e] min-h-screen">
      <Hero title="Upcoming Chili Events" />

      <div className="space-y-10 md:space-y-16 py-10 md:py-16">
        {featuredEvents.length > 0 && (
          <SectionContainer>
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-8">Featured Event</h2>
            <div className="space-y-6">
              {featuredEvents.map(event => {
                const eventLink = event.url || `/events/${event.id}`;
                const isExternal = !!event.url;

                return (
                  <div key={event.id} className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur">
                    <div className="grid md:grid-cols-3 gap-8 items-center">
                      {event.image_url && (
                        <div className="md:col-span-3 mb-4">
                          <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-2xl">
                            <Image
                              src={event.image_url}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <div className="md:col-span-2 space-y-3">
                        <p className="text-xs uppercase tracking-wider text-white/60">
                          {new Date(event.event_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
                        </p>
                        <h3 className="text-2xl font-bold text-white">{event.title}</h3>
                        {event.location && <p className="text-amber-200 font-semibold">📍 {event.location}</p>}
                        {event.venue && <p className="text-white/60 text-sm">{event.venue}</p>}
                        {event.description && <p className="text-white/75 leading-relaxed">{event.description}</p>}
                      </div>
                      <div className="text-center md:text-right">
                        <Link
                          href={eventLink}
                          target={isExternal ? "_blank" : undefined}
                          rel={isExternal ? "noopener noreferrer" : undefined}
                          className="inline-block rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:from-[#ff7033] hover:to-[#ffd060]"
                        >
                          View Event
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionContainer>
        )}

        <SectionContainer>
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-8">All Upcoming Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => {
              const eventLink = event.url || `/events/${event.id}`;
              const isExternal = !!event.url;

              return (
                <div key={event.id} className="rounded-3xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur hover:bg-white/[0.1] transition">
                  {event.image_url && (
                    <div className="relative h-48 w-full overflow-hidden rounded-xl mb-4">
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-2">
                    {new Date(event.event_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                  </p>
                  <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                  {event.location && <p className="text-amber-200 text-sm mb-1">📍 {event.location}</p>}
                  {event.venue && <p className="text-white/50 text-xs mb-3">{event.venue}</p>}
                  {event.description && <p className="text-white/75 text-sm leading-relaxed mb-4">{event.description}</p>}
                  <Link
                    href={eventLink}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="text-xs uppercase tracking-[0.2em] text-amber-200/70 transition hover:text-amber-200"
                  >
                    Learn More &rarr;
                  </Link>
                </div>
              );
            })}
          </div>
        </SectionContainer>
      </div>
    </div>
  );
};

export default EventsPage;
