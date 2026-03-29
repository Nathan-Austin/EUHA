"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/validation";

// Toggle this to reopen applications
const APPLICATIONS_OPEN = false;

const EXPERIENCE_OPTIONS = [
  "Professional Chili Person",
  "Experienced Food / Chili Person",
  "Very Keen Amateur Food / Chili Person",
];

export default function JudgeApplyPage() {
  const supabase = createClient();

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    experience: "",
    industryAffiliation: false,
    affiliationDetails: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleFieldChange =
    (field: keyof Omit<typeof formValues, "industryAffiliation">) =>
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
      !formValues.addressLine1.trim() ||
      !formValues.city.trim() ||
      !formValues.postalCode.trim() ||
      !formValues.country ||
      !formValues.experience
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
        address: formValues.addressLine1.trim(),
        addressLine2: formValues.addressLine2.trim() || undefined,
        city: formValues.city.trim(),
        state: formValues.state.trim() || undefined,
        zip: formValues.postalCode.trim(),
        country: formValues.country,
        experience: formValues.experience,
        industryAffiliation: formValues.industryAffiliation,
        affiliationDetails: formValues.affiliationDetails.trim() || undefined,
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
        </header>

        {!APPLICATIONS_OPEN ? (
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur text-center space-y-4">
            <p className="text-2xl">🌶️</p>
            <h2 className="text-xl font-semibold text-white">Applications are now closed</h2>
            <p className="text-white/70">
              Judge applications for the 2026 EU Hot Sauce Awards have closed. We look forward to welcoming you as a judge for the 2027 awards.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
            >
              Back to Home
            </Link>
          </div>
        ) : isComplete ? (
          <div className="rounded-3xl border border-emerald-300/40 bg-emerald-500/10 p-8 text-center space-y-4">
            <p className="text-2xl">✅</p>
            <h2 className="text-xl font-semibold text-emerald-200">Application received</h2>
            <p className="text-emerald-100/80">{successMessage}</p>
            <Link
              href="/"
              className="inline-block mt-4 rounded-full border border-emerald-300/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:border-emerald-200 hover:bg-emerald-500/10"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <section className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal details */}
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/60">Full Name *</span>
                  <input
                    value={formValues.name}
                    onChange={handleFieldChange("name")}
                    required
                    disabled={isComplete}
                    className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                    placeholder="Jane Smith"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/60">Email *</span>
                  <input
                    type="email"
                    value={formValues.email}
                    onChange={handleFieldChange("email")}
                    onBlur={handleEmailBlur}
                    required
                    disabled={isComplete}
                    className={`rounded-xl border bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60 ${
                      emailError ? "border-red-500" : "border-white/20"
                    }`}
                    placeholder="you@example.com"
                  />
                  {emailError && <span className="text-xs text-red-400">{emailError}</span>}
                </label>
              </div>

              {/* Experience */}
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/60">Experience Level *</span>
                <select
                  value={formValues.experience}
                  onChange={handleFieldChange("experience")}
                  required
                  disabled={isComplete}
                  className="rounded-xl border border-white/20 bg-[#0d0818] px-4 py-3 text-sm text-white focus:border-amber-300 focus:outline-none disabled:opacity-60"
                >
                  <option value="" disabled>Select your experience level</option>
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>

              {/* Industry affiliation */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formValues.industryAffiliation}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, industryAffiliation: e.target.checked }))}
                    disabled={isComplete}
                    className="h-4 w-4 rounded border-white/30 bg-black/30 accent-amber-400"
                  />
                  <span className="text-sm text-white/80">I have an industry affiliation (e.g. work for a hot sauce brand)</span>
                </label>
                {formValues.industryAffiliation && (
                  <label className="flex flex-col gap-2">
                    <span className="text-xs text-white/50">Please describe your affiliation</span>
                    <textarea
                      value={formValues.affiliationDetails}
                      onChange={handleFieldChange("affiliationDetails")}
                      disabled={isComplete}
                      rows={2}
                      className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                      placeholder="e.g. Brand owner at Firestarter Sauces"
                    />
                  </label>
                )}
              </div>

              {/* Shipping address */}
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Shipping Address <span className="normal-case text-white/40">(for judging box delivery)</span></p>
                <div className="grid gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs text-white/50">Street address *</span>
                    <input
                      value={formValues.addressLine1}
                      onChange={handleFieldChange("addressLine1")}
                      required
                      disabled={isComplete}
                      className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                      placeholder="123 Pepper Lane"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs text-white/50">Address line 2 <span className="text-white/30">(optional — apt, floor, c/o)</span></span>
                    <input
                      value={formValues.addressLine2}
                      onChange={handleFieldChange("addressLine2")}
                      disabled={isComplete}
                      className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                      placeholder="Flat 3"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs text-white/50">City *</span>
                      <input
                        value={formValues.city}
                        onChange={handleFieldChange("city")}
                        required
                        disabled={isComplete}
                        className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                        placeholder="Amsterdam"
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-xs text-white/50">Postal / ZIP code *</span>
                      <input
                        value={formValues.postalCode}
                        onChange={handleFieldChange("postalCode")}
                        required
                        disabled={isComplete}
                        className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                        placeholder="1011 AB"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs text-white/50">State / Province / Region <span className="text-white/30">(if applicable)</span></span>
                      <input
                        value={formValues.state}
                        onChange={handleFieldChange("state")}
                        disabled={isComplete}
                        className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                        placeholder="California"
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-xs text-white/50">Country *</span>
                      <select
                        value={formValues.country}
                        onChange={handleFieldChange("country")}
                        required
                        disabled={isComplete}
                        className="rounded-xl border border-white/20 bg-[#0d0818] px-4 py-3 text-sm text-white focus:border-amber-300 focus:outline-none disabled:opacity-60"
                      >
                        <option value="" disabled>Select country</option>
                        <optgroup label="Europe">
                          <option value="AT">Austria</option>
                          <option value="BE">Belgium</option>
                          <option value="BA">Bosnia &amp; Herzegovina</option>
                          <option value="BG">Bulgaria</option>
                          <option value="HR">Croatia</option>
                          <option value="CY">Cyprus</option>
                          <option value="CZ">Czech Republic</option>
                          <option value="DK">Denmark</option>
                          <option value="EE">Estonia</option>
                          <option value="FI">Finland</option>
                          <option value="FR">France</option>
                          <option value="DE">Germany</option>
                          <option value="GR">Greece</option>
                          <option value="HU">Hungary</option>
                          <option value="IS">Iceland</option>
                          <option value="IE">Ireland</option>
                          <option value="IT">Italy</option>
                          <option value="XK">Kosovo</option>
                          <option value="LV">Latvia</option>
                          <option value="LI">Liechtenstein</option>
                          <option value="LT">Lithuania</option>
                          <option value="LU">Luxembourg</option>
                          <option value="MT">Malta</option>
                          <option value="MD">Moldova</option>
                          <option value="ME">Montenegro</option>
                          <option value="NL">Netherlands</option>
                          <option value="MK">North Macedonia</option>
                          <option value="NO">Norway</option>
                          <option value="PL">Poland</option>
                          <option value="PT">Portugal</option>
                          <option value="RO">Romania</option>
                          <option value="RS">Serbia</option>
                          <option value="SK">Slovakia</option>
                          <option value="SI">Slovenia</option>
                          <option value="ES">Spain</option>
                          <option value="SE">Sweden</option>
                          <option value="CH">Switzerland</option>
                          <option value="TR">Turkey</option>
                          <option value="UA">Ukraine</option>
                          <option value="GB">United Kingdom</option>
                        </optgroup>
                        <optgroup label="Americas">
                          <option value="AR">Argentina</option>
                          <option value="BR">Brazil</option>
                          <option value="CA">Canada</option>
                          <option value="CL">Chile</option>
                          <option value="CO">Colombia</option>
                          <option value="MX">Mexico</option>
                          <option value="US">United States</option>
                        </optgroup>
                        <optgroup label="Asia Pacific">
                          <option value="AU">Australia</option>
                          <option value="CN">China</option>
                          <option value="IN">India</option>
                          <option value="JP">Japan</option>
                          <option value="NZ">New Zealand</option>
                          <option value="SG">Singapore</option>
                          <option value="KR">South Korea</option>
                          <option value="TW">Taiwan</option>
                          <option value="TH">Thailand</option>
                        </optgroup>
                        <optgroup label="Middle East &amp; Africa">
                          <option value="IL">Israel</option>
                          <option value="ZA">South Africa</option>
                          <option value="AE">United Arab Emirates</option>
                        </optgroup>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-300/40 bg-red-500/10 p-4 text-sm text-red-200">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
