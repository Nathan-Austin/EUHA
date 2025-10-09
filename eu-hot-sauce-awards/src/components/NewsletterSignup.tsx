
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const NewsletterSignup = () => {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('Subscribing...');

    try {
      const { error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: { email },
      });

      if (error) {
        throw new Error(`Subscription failed: ${error.message}`);
      }

      setMessage('Thank you for subscribing!');
      setEmail('');

    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-center max-w-xl mx-auto">
      <h2 className="text-3xl font-bold text-amber-400 mb-4">Stay Updated</h2>
      <p className="mb-6 text-white/75">Subscribe to our newsletter for the latest on events, results, and more.</p>
      <form className="flex flex-col sm:flex-row justify-center gap-2" onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="your.email@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          className="bg-white/10 border-white/20 rounded-md py-2 px-3 text-white w-full max-w-sm focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50"
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] text-white font-bold py-2 px-6 rounded-md hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-sm font-semibold ${
          message.includes('Thank you') || message.includes('already subscribed')
            ? 'text-green-400'
            : message.includes('Subscribing')
            ? 'text-white/70'
            : 'text-red-400'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default NewsletterSignup;
