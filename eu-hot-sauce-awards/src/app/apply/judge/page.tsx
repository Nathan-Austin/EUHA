"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/validation";
import HeatHeader from "@/components/HeatHeader";
import HeatFooter from "@/components/HeatFooter";
import Breadcrumbs from "@/components/Breadcrumbs";

// Toggle this to open applications for the 2027 congress
const APPLICATIONS_OPEN = false;

const inputClass =
  "block w-full border-2 border-black px-4 py-3 text-base text-black placeholder-black/40 outline-none focus:border-[#F5C518] disabled:opacity-60";

// Option values must stay exactly "Professional Chili Person" / "Experienced Food / Chili Person" —
// the judge-intake edge function maps those two strings (and only those two) to judge type "pro".
const ROLE_OPTIONS = [
  { value: "Professional Chili Person", label: "Chef / culinary professional" },
  { value: "Experienced Food / Chili Person", label: "Food & drink writer, critic, or educator" },
];

export default function JudgeApplyPage() {
  const supabase = createClient();

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    country: "",
    experience: "",
    affiliationDetails: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleFieldChange =
    (field: keyof typeof formValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setFormValues((prev) => ({ ...prev, [field]: value }));
      if (field === "email") setEmailError(null);
    };

  const handleEmailBlur = () => {
    if (formValues.email.trim()) {
      const validation = validateEmail(formValues.email);
      if (!validation.isValid) {
        setEmailError(validation.error || "Invalid email");
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setEmailError(null);

    if (
      !formValues.name.trim() ||
      !formValues.email.trim() ||
      !formValues.experience ||
      !formValues.affiliationDetails.trim()
    ) {
      setIsSubmitting(false);
      setErrorMessage("Please complete all required fields.");
      return;
    }

    const emailValidation = validateEmail(formValues.email);
    if (!emailValidation.isValid) {
      setIsSubmitting(false);
      setEmailError(emailValidation.error || "Invalid email");
      setErrorMessage(emailValidation.error || "Please enter a valid email address.");
      return;
    }

    try {
      const payload = {
        name: formValues.name.trim(),
        email: formValues.email.trim().toLowerCase(),
        country: formValues.country.trim() || undefined,
        experience: formValues.experience,
        industryAffiliation: true,
        affiliationDetails: formValues.affiliationDetails.trim(),
      };

      const { error } = await supabase.functions.invoke("judge-intake", {
        body: payload,
      });

      if (error) {
        let detail = "";
        try {
          const body = await error.context?.json?.();
          if (body?.error) detail = body.error;
        } catch {
          // context may not be available
        }
        throw new Error(detail || error.message);
      }

      setSuccessMessage(
        "Thank you for applying! We'll review your application and be in touch soon."
      );
      setIsComplete(true);
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setErrorMessage(submissionError.message);
      } else {
        setErrorMessage("Something went wrong. Please try again or contact the team.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Judges", href: "/judges" }, { label: "Apply" }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(32px,5vw,52px)] uppercase leading-[0.95] text-white">
            Judge <span className="bg-[#F5C518] px-2 text-black">application</span>.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-2xl px-6">
          {!APPLICATIONS_OPEN ? (
            <div className="border-[3px] border-black bg-white p-8 text-center space-y-4 md:p-12">
              <p className="text-3xl">🌶️</p>
              <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase">
                Applications aren’t open yet
              </h2>
              <p className="text-black/70">
                Judge applications for the European Hot Sauce Awards congress in Berlin haven’t opened. Check
                back soon, or read more about what judging involves.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link
                  href="/judges"
                  className="inline-block border-2 border-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.06em] hover:bg-black hover:text-[#F5C518]"
                >
                  About judging
                </Link>
                <Link
                  href="/"
                  className="inline-block bg-black px-6 py-3 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
                >
                  Back to home
                </Link>
              </div>
            </div>
          ) : isComplete ? (
            <div className="border-[3px] border-black bg-white p-8 text-center space-y-4 md:p-12">
              <p className="text-3xl">✅</p>
              <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase">
                Application received
              </h2>
              <p className="text-black/70">{successMessage}</p>
              <Link
                href="/"
                className="inline-block bg-black px-6 py-3 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
              >
                Back to home
              </Link>
            </div>
          ) : (
            <div className="border-[3px] border-black bg-white p-8 md:p-12">
              <p className="mb-8 text-sm leading-relaxed text-black/70">
                Judging takes place in person at the congress in Berlin. If your application is approved,
                we’ll send an invitation with full details, including the participation fee to attend —
                food, drink, and hospitality are included throughout.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50">Full name *</span>
                    <input
                      value={formValues.name}
                      onChange={handleFieldChange("name")}
                      required
                      disabled={isComplete}
                      className={inputClass}
                      placeholder="Jane Smith"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50">Email *</span>
                    <input
                      type="email"
                      value={formValues.email}
                      onChange={handleFieldChange("email")}
                      onBlur={handleEmailBlur}
                      required
                      disabled={isComplete}
                      className={`${inputClass} ${emailError ? "border-red-600" : ""}`}
                      placeholder="you@example.com"
                    />
                    {emailError && <span className="text-xs text-red-600">{emailError}</span>}
                  </label>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50">
                    Country <span className="normal-case text-black/40">(optional — helps us plan travel logistics)</span>
                  </span>
                  <input
                    value={formValues.country}
                    onChange={handleFieldChange("country")}
                    disabled={isComplete}
                    className={inputClass}
                    placeholder="Netherlands"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50">Professional role *</span>
                  <select
                    value={formValues.experience}
                    onChange={handleFieldChange("experience")}
                    required
                    disabled={isComplete}
                    className={inputClass}
                  >
                    <option value="" disabled>Select your role</option>
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50">
                    Tell us about your professional background *
                  </span>
                  <textarea
                    value={formValues.affiliationDetails}
                    onChange={handleFieldChange("affiliationDetails")}
                    required
                    disabled={isComplete}
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder="e.g. Head chef at Firestarter, Berlin — five years cooking with fermented chillies..."
                  />
                </label>

                {errorMessage && (
                  <div className="border-2 border-red-600 bg-red-50 p-4 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black py-3.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting…" : "Submit application"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <HeatFooter />
    </div>
  );
}
