'use client';

import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import { sendContactEmail } from './actions';
import { useState } from 'react';
import { COMPANY_INFO } from '@/lib/company';

const ContactPage = () => {
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setStatus(null);

    const result = await sendContactEmail(formData);

    if (result.success) {
      setStatus({ type: 'success', message: 'Message sent successfully! We\'ll get back to you soon.' });
      // Reset form
      (document.getElementById('contact-form') as HTMLFormElement)?.reset();
    } else {
      setStatus({ type: 'error', message: result.error || 'Failed to send message. Please try again.' });
    }

    setIsSubmitting(false);
  }
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
                  <p className="text-base">{COMPANY_INFO.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Email</p>
                  <p className="text-base">{COMPANY_INFO.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Phone</p>
                  <p className="text-base">{COMPANY_INFO.phone}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">WhatsApp</p>
                  <a href={`https://wa.me/${COMPANY_INFO.whatsapp.replace(/[^0-9]/g, '')}`} className="text-base text-amber-200 hover:text-amber-100 transition">
                    Message us on WhatsApp
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Address</p>
                  <address className="not-italic text-base">
                    {COMPANY_INFO.address.line1}<br />
                    {COMPANY_INFO.address.line2}<br />
                    {COMPANY_INFO.address.street}<br />
                    {COMPANY_INFO.address.postalCode} {COMPANY_INFO.address.city}<br />
                    {COMPANY_INFO.address.country}
                  </address>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">VAT</p>
                  <p className="text-base">{COMPANY_INFO.vat.number}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Send us a Message</h2>

              {status && (
                <div className={`mb-4 p-4 rounded-lg ${status.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-200' : 'bg-red-500/20 border border-red-500/30 text-red-200'}`}>
                  {status.message}
                </div>
              )}

              <form id="contact-form" action={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-wider text-white/60 mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
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
                    required
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
                    required
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
                    required
                    className="w-full bg-black/30 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition resize-none"
                    placeholder="Your message..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:from-[#ff7033] hover:to-[#ffd060] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Submit'}
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
