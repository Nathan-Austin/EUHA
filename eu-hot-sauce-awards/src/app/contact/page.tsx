
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the EU Hot Sauce Awards team. Send us a message or find our contact details.',
};

const ContactPage = () => {
  return (
    <div className="bg-[#08040e] min-h-screen">
      <Hero title="Get in Touch" />

      <div className="space-y-10 md:space-y-16 py-10 md:py-16">
        <SectionContainer>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Contact Information</h2>
              <div className="space-y-4 text-white/80">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Company</p>
                  <p className="text-base">Chili Punk Berlin</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Email</p>
                  <p className="text-base">heataward@gmail.com</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Phone</p>
                  <p className="text-base">+4917682204595</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">WhatsApp</p>
                  <a href="https://wa.me/4917682204595" className="text-base text-amber-200 hover:text-amber-100 transition">
                    Message us on WhatsApp
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Address</p>
                  <address className="not-italic text-base">
                    Heat Awards, Neil Long CO/ Saunders<br />
                    Neißestraße 2<br />
                    12051 Berlin<br />
                    Germany
                  </address>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">VAT</p>
                  <p className="text-base">DE314890098</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Send us a Message</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-wider text-white/60 mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full bg-black/30 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs uppercase tracking-wider text-white/60 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full bg-black/30 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-xs uppercase tracking-wider text-white/60 mb-2">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full bg-black/30 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs uppercase tracking-wider text-white/60 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full bg-black/30 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition resize-none"
                    placeholder="Your message..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:from-[#ff7033] hover:to-[#ffd060]"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </SectionContainer>
      </div>
    </div>
  );
};

export default ContactPage;
