import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Image from 'next/image';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Upcoming Events',
  description: 'Find out about upcoming chili festivals and events related to the European Hot Sauce Awards.',
};

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  end_date: string | null;
  end_time: string | null;
  location: string | null;
  venue: string | null;
  url: string | null;
  image_url: string | null;
  featured: boolean;
  active: boolean;
}

function EventCard({ event, featured }: { event: Event; featured?: boolean }) {
  const eventLink = event.url || `/events/${event.id}`;
  const isExternal = !!event.url;

  return (
    <div className={`flex flex-col border-2 ${featured ? 'border-[3px] border-black' : 'border-black'} bg-white transition hover:-translate-y-1 hover:shadow-lg`}>
      {event.image_url && (
        <div className="relative aspect-[4/3] border-b-2 border-black">
          <Image src={event.image_url} alt={event.title} fill className="object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {featured && (
          <span className="w-fit bg-[#F5C518] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.06em]">
            Featured
          </span>
        )}
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50">
          {new Date(event.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          {event.event_time && ` · ${event.event_time.slice(0, 5)}`}
          {event.end_date && ` – ${new Date(event.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
          {event.end_time && event.end_date && ` · ${event.end_time.slice(0, 5)}`}
        </p>
        <h3 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase leading-tight">{event.title}</h3>
        {event.location && <p className="text-sm font-semibold">{event.location}</p>}
        {event.venue && <p className="text-xs text-black/50">{event.venue}</p>}
        {event.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-black/70">{event.description}</p>
        )}
        <Link
          href={eventLink}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="mt-auto border-t border-black/10 pt-3 font-[family-name:var(--font-archivo-black)] text-xs uppercase tracking-[0.1em]"
        >
          Learn more &rarr;
        </Link>
      </div>
    </div>
  );
}

const EventsPage = async () => {
  const supabase = createClient(cookies());

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('active', true)
    .order('event_date', { ascending: true });

  const allEvents = events || [];
  const featuredEvents = allEvents.filter((e) => e.featured);
  const upcomingEvents = allEvents.filter((e) => !e.featured);

  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Events' }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,56px)] uppercase leading-[0.95] text-white">
            Upcoming <span className="bg-[#F5C518] px-2 text-black">events</span>.
          </h1>
        </div>
      </section>

      {featuredEvents.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-[1240px] px-6">
            <h2 className="mb-8 font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
              Featured <span className="bg-[#F5C518] px-2">event</span>.
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={featuredEvents.length > 0 ? 'border-t border-black/10 py-16' : 'py-16'}>
        <div className="mx-auto max-w-[1240px] px-6">
          <h2 className="mb-8 font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
            All upcoming <span className="bg-[#F5C518] px-2">events</span>.
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-black/60">No upcoming events right now — check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <HeatFooter />
    </div>
  );
};

export default EventsPage;
