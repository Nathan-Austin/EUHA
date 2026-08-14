'use client';

import { sendContactEmail } from './actions';
import { useState } from 'react';
import { COMPANY_INFO } from '@/lib/company';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';

const inputClass =
  'block w-full border-2 border-black px-4 py-3 text-base text-black placeholder-black/40 outline-none focus:border-[#F5C518]';

const ContactPage = () => {
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setStatus(null);

    const result = await sendContactEmail(formData);

    if (result.success) {
      setStatus({ type: 'success', message: "Message sent successfully! We'll get back to you soon." });
      (document.getElementById('contact-form') as HTMLFormElement)?.reset();
    } else {
      setStatus({ type: 'error', message: result.error || 'Failed to send message. Please try again.' });
    }

    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
            Get in touch
          </p>
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,56px)] uppercase leading-[0.95] text-white">
            Contact <span className="bg-[#F5C518] px-2 text-black">us</span>.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-8 px-6 lg:grid-cols-2">
          <div className="border-[3px] border-black bg-white p-8">
            <h2 className="mb-6 font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.04em]">
              Contact information
            </h2>
            <div className="space-y-5">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Company</p>
                <p className="text-base">{COMPANY_INFO.name}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Email</p>
                <p className="text-base">{COMPANY_INFO.email}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Phone</p>
                <p className="text-base">{COMPANY_INFO.phone}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/50">WhatsApp</p>
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsapp.replace(/[^0-9]/g, '')}`}
                  className="border-b-2 border-black text-base font-semibold hover:opacity-70"
                >
                  Message us on WhatsApp
                </a>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Address</p>
                <address className="not-italic text-base leading-relaxed">
                  {COMPANY_INFO.address.line1}<br />
                  {COMPANY_INFO.address.line2}<br />
                  {COMPANY_INFO.address.street}<br />
                  {COMPANY_INFO.address.postalCode} {COMPANY_INFO.address.city}<br />
                  {COMPANY_INFO.address.country}
                </address>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/50">VAT</p>
                <p className="text-base">{COMPANY_INFO.vat.number}</p>
              </div>
            </div>
          </div>

          <div className="border-[3px] border-black bg-white p-8">
            <h2 className="mb-6 font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.04em]">
              Send us a message
            </h2>

            {status && (
              <div
                className={`mb-5 border-2 p-4 text-sm ${
                  status.type === 'success' ? 'border-black bg-[#F5C518]/30 text-black' : 'border-red-600 bg-red-50 text-red-700'
                }`}
              >
                {status.message}
              </div>
            )}

            <form id="contact-form" action={handleSubmit} className="space-y-4">
              <input type="text" id="name" name="name" required className={inputClass} placeholder="Your name" />
              <input type="email" id="email" name="email" required className={inputClass} placeholder="your.email@example.com" />
              <input type="text" id="subject" name="subject" required className={inputClass} placeholder="What's this about?" />
              <textarea id="message" name="message" rows={5} required className={`${inputClass} resize-none`} placeholder="Your message..." />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black py-3.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending…' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
};

export default ContactPage;
