"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const categories = [
  "Classic / Heritage",
  "Fruit-Forward",
  "Smoky",
  "Fermented",
  "Experimental",
  "No-Heat (EU Retail)",
];

export default function SupplierApplyPage() {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);

    const payload = {
      brand: String(formData.get("brand") || ""),
      name: String(formData.get("sauceName") || ""),
      ingredients: String(formData.get("ingredients") || ""),
      allergens: String(formData.get("allergens") || "None"),
      category: String(formData.get("category") || ""),
      address: String(formData.get("address") || ""),
      email: String(formData.get("email") || ""),
    };

    if (!payload.brand || !payload.name || !payload.category || !payload.email) {
      setIsSubmitting(false);
      setErrorMessage("Please complete all required fields before submitting.");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("supplier-intake", {
        body: payload,
      });

      if (error) {
        throw new Error(error.message);
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: payload.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (otpError) {
        throw new Error(otpError.message);
      }

      event.currentTarget.reset();
      setSuccessMessage(
        data?.sauce_id
          ? `Thank you! Your sauce has been registered. Reference: ${data.sauce_id}. Check your inbox for a magic link to access logistics.`
          : "Thank you! Your sauce has been registered. Check your inbox for a magic link to access logistics."
      );
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setErrorMessage(submissionError.message);
      } else {
        setErrorMessage("Something went wrong. Please try again or contact the Heat Awards team.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08040e] text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,77,0,0.22),_transparent_55%),_radial-gradient(circle_at_bottom_left,_rgba(241,177,46,0.2),_transparent_50%)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" aria-hidden />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-10 px-6 pb-20 pt-24 sm:px-10 lg:px-12">
        <header className="space-y-4">
          <Link href="/apply" className="text-xs uppercase tracking-[0.3em] text-amber-200/70 transition hover:text-amber-200">
            ← Back to Applications
          </Link>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Supplier Entry</h1>
          <p className="text-base text-white/75 sm:text-lg">
            Submit your sauce to the EU Hot Sauce Awards 2026. Once accepted, you&apos;ll receive QR codes, packing guidance, and updates directly through this portal.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">Brand Name *</span>
              <input
                name="brand"
                required
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
                placeholder="Heat Awards Co."
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">Contact Email *</span>
              <input
                name="email"
                type="email"
                required
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
                placeholder="team@brand.com"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-white/60">Sauce Name *</span>
            <input
              name="sauceName"
              required
              className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
              placeholder="Northern Ember"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-white/60">Category *</span>
            <select
              name="category"
              required
              defaultValue=""
              className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white focus:border-amber-300 focus:outline-none"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category} value={category} className="bg-[#08040e] text-white">
                  {category}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">Key Ingredients *</span>
              <textarea
                name="ingredients"
                required
                rows={3}
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
                placeholder="Fresh chilies, smoked paprika, cider vinegar, sea salt"
              />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">Allergens (if any)</span>
              <input
                name="allergens"
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
                placeholder="Contains mustard seeds"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-white/60">Business Address *</span>
            <textarea
              name="address"
              required
              rows={3}
              className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
              placeholder="123 Scoville Street, 1010 Budapest, Hungary"
            />
          </label>

          <div className="space-y-3 rounded-2xl border border-amber-200/20 bg-black/20 p-4 text-xs text-white/70">
            <p>
              By submitting this form you confirm that your sauce complies with EU food safety regulations and that you can ship samples to our judging hub in Dublin, Ireland.
            </p>
            <p>
              We will send you a confirmation email with next steps and a secure login link. Check your spam folder if you don&apos;t hear from us within a few minutes.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : "Submit Sauce Entry"}
          </button>

          {successMessage && (
            <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="rounded-2xl border border-red-300/40 bg-red-500/10 p-4 text-sm text-red-200">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
