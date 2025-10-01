"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const experiences = [
  {
    value: "Professional Chili Person",
    label: "Professional Chili Person",
  },
  {
    value: "Experienced Food / Chili Person",
    label: "Experienced Food & Flavor Professional",
  },
  {
    value: "Very Keen Amateur Food / Chili Person",
    label: "Passionate Food Enthusiast",
  },
];

const countries = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "United Kingdom",
  "Norway",
  "Switzerland",
];

export default function JudgeApplyPage() {
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
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      address: String(formData.get("address") || ""),
      zip: String(formData.get("zip") || ""),
      city: String(formData.get("city") || ""),
      country: String(formData.get("country") || ""),
      experience: String(formData.get("experience") || ""),
    };

    if (!payload.name || !payload.email || !payload.address || !payload.city || !payload.zip || !payload.country) {
      setIsSubmitting(false);
      setErrorMessage("Please complete all required fields before submitting.");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("judge-intake", {
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
        data?.judge_id
          ? `Application received! Your judge profile (${data.judge_id}) has been created. Check your inbox for a magic link and payment instructions if required.`
          : "Application received! Check your inbox for a magic link and payment instructions."
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
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Judge Application</h1>
          <p className="text-base text-white/75 sm:text-lg">
            Apply to judge the 2026 EU Hot Sauce Awards. We welcome experienced industry professionals and passionate enthusiasts from across Europe.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">Full Name *</span>
              <input
                name="name"
                required
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
                placeholder="Aine O'Flaherty"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">Email *</span>
              <input
                name="email"
                type="email"
                required
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
                placeholder="aine@example.com"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-white/60">Street Address *</span>
            <textarea
              name="address"
              required
              rows={3}
              className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
              placeholder="12 Pepper Lane"
            />
          </label>

          <div className="grid gap-6 sm:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">City *</span>
              <input
                name="city"
                required
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
                placeholder="Lisbon"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">Postal Code *</span>
              <input
                name="zip"
                required
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none"
                placeholder="1200-001"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">Country *</span>
              <select
                name="country"
                required
                defaultValue=""
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white focus:border-amber-300 focus:outline-none"
              >
                <option value="" disabled>
                  Select country
                </option>
                {countries.map((country) => (
                  <option key={country} value={country} className="bg-[#08040e] text-white">
                    {country}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-white/60">Experience Level *</span>
            <select
              name="experience"
              required
              defaultValue=""
              className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white focus:border-amber-300 focus:outline-none"
            >
              <option value="" disabled>
                Select your background
              </option>
              {experiences.map(({ value, label }) => (
                <option key={value} value={value} className="bg-[#08040e] text-white">
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-3 rounded-2xl border border-amber-200/20 bg-black/20 p-4 text-xs text-white/70">
            <p>
              Pro judges are selected based on culinary credentials. Community judges will be invited to confirm their seat with a €15 fee that supports logistics and tasting kits.
            </p>
            <p>All judges receive digital scorecards and scheduling updates via email and this portal.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : "Submit Judge Application"}
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
