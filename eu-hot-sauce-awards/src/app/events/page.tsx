
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upcoming Events',
  description: 'Find out about upcoming chili festivals and events related to the EU Hot Sauce Awards.',
};

// Mock data until DB is connected
const mockEvents = [
  {
    id: '1',
    title: 'BERLIN CHILI FEST : SPICY CHRISTMAS MARKET',
    date: '2025-12-06',
    location: 'Berlin, Germany',
    description: 'A very spicy Christmas Market at Berliner Berg Brauerei.',
    featured: true,
    url: '#'
  },
  {
    id: '2',
    title: 'Judging Weekend',
    date: '2026-04-11',
    location: 'Online / Various Locations',
    description: 'Our judges from all over Europe will be tasting and scoring the sauces.',
    featured: false,
    url: '#'
  },
  {
    id: '3',
    title: 'Results Announcement',
    date: '2026-05-15',
    location: 'Online',
    description: 'The winners of the 2026 European Hot Sauce Awards will be announced!',
    featured: false,
    url: '#'
  },
];

const EventsPage = () => {
  const featuredEvents = mockEvents.filter(e => e.featured);
  const upcomingEvents = mockEvents.filter(e => !e.featured);

  return (
    <div className="bg-[#08040e] min-h-screen">
      <Hero title="Upcoming Chili Events" />

      <div className="space-y-10 md:space-y-16 py-10 md:py-16">
        {featuredEvents.length > 0 && (
          <SectionContainer>
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-8">Featured Event</h2>
            <div className="space-y-6">
              {featuredEvents.map(event => (
                <div key={event.id} className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur">
                  <div className="grid md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-2 space-y-3">
                      <p className="text-xs uppercase tracking-wider text-white/60">
                        {new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <h3 className="text-2xl font-bold text-white">{event.title}</h3>
                      <p className="text-amber-200 font-semibold">📍 {event.location}</p>
                      <p className="text-white/75 leading-relaxed">{event.description}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <Link
                        href={event.url}
                        target="_blank"
                        className="inline-block rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:from-[#ff7033] hover:to-[#ffd060]"
                      >
                        View Event
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionContainer>
        )}

        <SectionContainer>
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-8">All Upcoming Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <div key={event.id} className="rounded-3xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur hover:bg-white/[0.1] transition">
                <p className="text-xs uppercase tracking-wider text-white/60 mb-2">
                  {new Date(event.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                <p className="text-amber-200 text-sm mb-3">📍 {event.location}</p>
                <p className="text-white/75 text-sm leading-relaxed mb-4">{event.description}</p>
                <Link
                  href={event.url}
                  target="_blank"
                  className="text-xs uppercase tracking-[0.2em] text-amber-200/70 transition hover:text-amber-200"
                >
                  Learn More &rarr;
                </Link>
              </div>
            ))}
          </div>
        </SectionContainer>
      </div>
    </div>
  );
};

export default EventsPage;
