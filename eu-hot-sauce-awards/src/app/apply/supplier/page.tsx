"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const categoryGroups = [
  {
    label: "Chili Sauce Categories",
    options: [
      "Mild Chili Sauce",
      "Medium Chili Sauce",
      "Hot Chili Sauce",
      "Extra Hot Chili Sauce",
    ],
  },
  {
    label: "Specialty Categories",
    options: [
      "Extract Based Chili Sauce",
      "BBQ Chili Sauce",
      "Chili Ketchup",
      "Sweet",
      "Chili Honey",
      "Garlic Chili Sauce",
      "Sambal, Chutney & Pickles",
      "Chili Oil",
      "Freestyle",
      "Asian Style Chili Sauce",
      "Salt & Condiments",
      "Chili Paste",
    ],
  },
];

const discountBands = [
  { min: 1, max: 1, percent: 0 },
  { min: 2, max: 2, percent: 3 },
  { min: 3, max: 3, percent: 5 },
  { min: 4, max: 4, percent: 7 },
  { min: 5, max: 5, percent: 9 },
  { min: 6, max: 6, percent: 12 },
  { min: 7, max: 10, percent: 13 },
  { min: 11, max: 20, percent: 14 },
  { min: 21, max: 100, percent: 16 },
];

const ENTRY_PRICE_CENTS = 5000; // 50.00 EUR
const IMAGE_BUCKET = process.env.NEXT_PUBLIC_SAUCE_IMAGE_BUCKET ?? "sauce-media";
const MAX_IMAGE_DIMENSION = 1600;
const WEBP_QUALITY = 0.85;

type SauceForm = {
  id: string;
  name: string;
  category: string;
  ingredients: string;
  allergens: string;
  webshopLink: string;
  imageFile: File | null;
  previewUrl: string | null;
};

type SubmittedSauce = {
  id: string;
  name: string;
  sauce_code?: string | null;
  image_path?: string | null;
};

type PaymentQuote = {
  id: string;
  entry_count: number;
  discount_percent: number;
  subtotal_cents: number;
  discount_cents: number;
  amount_due_cents: number;
};

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const createEmptySauce = (): SauceForm => ({
  id: generateId(),
  name: "",
  category: "",
  ingredients: "",
  allergens: "",
  webshopLink: "",
  imageFile: null,
  previewUrl: null,
});

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(cents / 100);

const resolveDiscountPercent = (entryCount: number) => {
  const band = discountBands.find((tier) => entryCount >= tier.min && entryCount <= tier.max);
  return band ? band.percent : discountBands[discountBands.length - 1].percent;
};

const normalizeUrl = (url: string): string => {
  if (!url.trim()) return "";
  const trimmed = url.trim();
  // Check if the URL already has a protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  // Add https:// if missing
  return `https://${trimmed}`;
};

async function fileToWebPBlob(file: File): Promise<Blob> {
  const dataUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = dataUrl;
    });

    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(image.width, image.height)
    );
    const targetWidth = Math.round(image.width * scale);
    const targetHeight = Math.round(image.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth || image.width;
    canvas.height = targetHeight || image.height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to process image");
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), "image/webp", WEBP_QUALITY)
    );

    if (!blob) {
      throw new Error("Unable to convert image to WebP");
    }

    return blob;
  } finally {
    URL.revokeObjectURL(dataUrl);
  }
}

export default function SupplierApplyPage() {
  const supabase = createClient();

  const [formValues, setFormValues] = useState({
    brand: "",
    contactName: "",
    email: "",
    address: "",
  });
  const [sauces, setSauces] = useState<SauceForm[]>([createEmptySauce()]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentQuote, setPaymentQuote] = useState<PaymentQuote | null>(null);
  const [submittedSauces, setSubmittedSauces] = useState<SubmittedSauce[]>([]);
  const [supplierEmail, setSupplierEmail] = useState<string>("");

  const entryCount = sauces.length;

  const liveQuote = useMemo(() => {
    const discountPercent = resolveDiscountPercent(entryCount);
    const subtotalCents = entryCount * ENTRY_PRICE_CENTS;
    const discountCents = Math.round(subtotalCents * (discountPercent / 100));
    const totalCents = subtotalCents - discountCents;

    return {
      discountPercent,
      subtotalCents,
      discountCents,
      totalCents,
    };
  }, [entryCount]);

  const handleBrandFieldChange = (
    field: keyof typeof formValues
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSauceFieldChange = (
    index: number,
    field: keyof Omit<SauceForm, "id" | "imageFile" | "previewUrl">
  ) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setSauces((prev) =>
        prev.map((sauce, sauceIndex) =>
          sauceIndex === index ? { ...sauce, [field]: value } : sauce
        )
      );
    };

  const handleImageChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSauces((prev) =>
      prev.map((sauce, sauceIndex) => {
        if (sauceIndex !== index) return sauce;

        if (sauce.previewUrl) {
          URL.revokeObjectURL(sauce.previewUrl);
        }

        if (!file) {
          return {
            ...sauce,
            imageFile: null,
            previewUrl: null,
          };
        }

        return {
          ...sauce,
          imageFile: file,
          previewUrl: URL.createObjectURL(file),
        };
      })
    );
  };

  const addSauce = () => {
    setSauces((prev) => [...prev, createEmptySauce()]);
  };

  const removeSauce = (id: string) => {
    setSauces((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      const sauceToRemove = prev.find((sauce) => sauce.id === id);
      if (sauceToRemove?.previewUrl) {
        URL.revokeObjectURL(sauceToRemove.previewUrl);
      }
      return prev.filter((sauce) => sauce.id !== id);
    });
  };

  const resetForm = () => {
    sauces.forEach((sauce) => {
      if (sauce.previewUrl) {
        URL.revokeObjectURL(sauce.previewUrl);
      }
    });

    setFormValues({ brand: "", contactName: "", email: "", address: "" });
    setSauces([createEmptySauce()]);
    setIsSubmitting(false);
    setIsComplete(false);
    setCheckoutLoading(false);
    setSuccessMessage(null);
    setErrorMessage(null);
    setPaymentQuote(null);
    setSubmittedSauces([]);
    setSupplierEmail("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (!formValues.brand.trim() || !formValues.email.trim() || !formValues.address.trim()) {
      setIsSubmitting(false);
      setErrorMessage("Please complete the brand, email, and address fields.");
      return;
    }

    const hasIncompleteSauce = sauces.some(
      (sauce) => !sauce.name.trim() || !sauce.category || !sauce.ingredients.trim()
    );

    if (hasIncompleteSauce) {
      setIsSubmitting(false);
      setErrorMessage("Please complete all sauce details before submitting.");
      return;
    }

    try {
      const processedSauces = await Promise.all(
        sauces.map(async (sauce) => {
          let imagePath: string | undefined;

          if (sauce.imageFile) {
            const webpBlob = await fileToWebPBlob(sauce.imageFile);
            const pendingPath = `pending/${generateId()}.webp`;
            const { error: uploadError } = await supabase.storage
              .from(IMAGE_BUCKET)
              .upload(pendingPath, webpBlob, {
                cacheControl: "3600",
                contentType: "image/webp",
                upsert: true,
              });

            if (uploadError) {
              throw new Error(uploadError.message);
            }

            imagePath = pendingPath;
          }

          return {
            name: sauce.name.trim(),
            category: sauce.category,
            ingredients: sauce.ingredients.trim(),
            allergens: sauce.allergens.trim() || "None",
            webshopLink: normalizeUrl(sauce.webshopLink),
            imagePath,
          };
        })
      );

      const payload = {
        brand: formValues.brand.trim(),
        contactName: formValues.contactName.trim() || undefined,
        email: formValues.email.trim().toLowerCase(),
        address: formValues.address.trim(),
        sauces: processedSauces,
      };

      const { data, error } = await supabase.functions.invoke("supplier-intake", {
        body: payload,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Note: Magic link will be sent after payment is completed via Stripe webhook
      // This prevents users from accessing the dashboard without paying

      setPaymentQuote(data?.payment ?? null);
      setSubmittedSauces(data?.sauces ?? []);
      setSupplierEmail(payload.email);
      setSuccessMessage(
        data?.payment
          ? `Thank you! ${data.payment.entry_count} sauces have been registered. Review the payment summary below and complete payment to confirm your entries.`
          : "Thank you! Your sauces have been registered."
      );
      setIsComplete(true);
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

  const handleCheckout = async () => {
    if (!paymentQuote || !supplierEmail) return;

    setCheckoutLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke("supplier-checkout", {
        body: {
          payment_id: paymentQuote.id,
          email: supplierEmail,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.alreadyPaid) {
        setSuccessMessage("We have already received payment for this submission. Thank you!");
      } else if (data?.url) {
        window.location.href = data.url as string;
      } else {
        setErrorMessage("Unable to start the Stripe checkout session. Please contact support.");
      }
    } catch (checkoutError) {
      if (checkoutError instanceof Error) {
        setErrorMessage(checkoutError.message);
      } else {
        setErrorMessage("Unable to initialise payment. Please try again.");
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08040e] text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,77,0,0.22),_transparent_55%),_radial-gradient(circle_at_bottom_left,_rgba(241,177,46,0.2),_transparent_50%)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" aria-hidden />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-10 px-6 pb-20 pt-24 sm:px-10 lg:px-12">
        <header className="space-y-4">
          <Link href="/apply" className="text-xs uppercase tracking-[0.3em] text-amber-200/70 transition hover:text-amber-200">
            ← Back to Applications
          </Link>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Supplier Entry</h1>
          <p className="text-base text-white/75 sm:text-lg">
            Enter multiple sauces in one submission. We apply tiered discounts automatically and email you a secure link to manage logistics inside the judging portal.
          </p>
        </header>

        <section className="space-y-6 rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/60">Brand Name *</span>
                <input
                  value={formValues.brand}
                  onChange={handleBrandFieldChange("brand")}
                  required
                  disabled={isComplete}
                  className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                  placeholder="Heat Awards Co."
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/60">Contact Name</span>
                <input
                  value={formValues.contactName}
                  onChange={handleBrandFieldChange("contactName")}
                  disabled={isComplete}
                  className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                  placeholder="Primary contact"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/60">Contact Email *</span>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={handleBrandFieldChange("email")}
                  required
                  disabled={isComplete}
                  className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                  placeholder="team@brand.com"
                />
              </label>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
                <p className="font-semibold uppercase tracking-[0.25em] text-amber-200/80">Pricing Snapshot</p>
                <ul className="mt-3 space-y-2 text-white/70">
                  <li className="flex justify-between text-sm">
                    <span>Entries</span>
                    <span>{entryCount}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(liveQuote.subtotalCents)}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span>Discount</span>
                    <span>{liveQuote.discountPercent}% ({formatCurrency(liveQuote.discountCents)})</span>
                  </li>
                  <li className="flex justify-between text-sm font-semibold text-amber-200">
                    <span>Total Due</span>
                    <span>{formatCurrency(liveQuote.totalCents)}</span>
                  </li>
                </ul>
              </div>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">Business Address *</span>
              <textarea
                value={formValues.address}
                onChange={handleBrandFieldChange("address")}
                required
                disabled={isComplete}
                rows={3}
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                placeholder="123 Scoville Street, 1010 Budapest, Hungary"
              />
            </label>

            <div className="space-y-6">
              {sauces.map((sauce, index) => (
                <div key={sauce.id} className="rounded-2xl border border-white/15 bg-black/30 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/80">
                      Sauce {index + 1}
                    </h2>
                    {sauces.length > 1 && !isComplete && (
                      <button
                        type="button"
                        onClick={() => removeSauce(sauce.id)}
                        className="text-xs uppercase tracking-[0.25em] text-white/60 transition hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-white/60">Sauce Name *</span>
                      <input
                        value={sauce.name}
                        onChange={handleSauceFieldChange(index, "name")}
                        required
                        disabled={isComplete}
                        className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                        placeholder="Northern Ember"
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-white/60">Category *</span>
                      <select
                        value={sauce.category}
                        onChange={handleSauceFieldChange(index, "category")}
                        required
                        disabled={isComplete}
                        className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white focus:border-amber-300 focus:outline-none disabled:opacity-60"
                      >
                        <option value="" disabled>
                          Select a category
                        </option>
                        {categoryGroups.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="mt-4 flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/60">Key Ingredients *</span>
                    <textarea
                      value={sauce.ingredients}
                      onChange={handleSauceFieldChange(index, "ingredients")}
                      required
                      disabled={isComplete}
                      rows={3}
                      className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                      placeholder="Fresh chilies, smoked paprika, cider vinegar, sea salt"
                    />
                  </label>
                  <label className="mt-4 flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/60">Allergens (if any)</span>
                    <input
                      value={sauce.allergens}
                      onChange={handleSauceFieldChange(index, "allergens")}
                      disabled={isComplete}
                      className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                      placeholder="Contains mustard seeds"
                    />
                  </label>
                  <label className="mt-4 flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/60">Webshop Link (optional)</span>
                    <input
                      type="url"
                      value={sauce.webshopLink}
                      onChange={handleSauceFieldChange(index, "webshopLink")}
                      disabled={isComplete}
                      className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-amber-300 focus:outline-none disabled:opacity-60"
                      placeholder="https://yourshop.com/sauce-name"
                    />
                    <span className="text-xs text-white/50">
                      Link to your product page - will be displayed on the results page
                    </span>
                  </label>
                  <label className="mt-4 flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/60">Upload Bottle Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange(index)}
                      disabled={isComplete}
                      className="block w-full cursor-pointer rounded-xl border border-dashed border-white/30 bg-black/30 px-4 py-3 text-sm text-white/80 transition hover:border-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.25em] file:text-white/90 hover:file:bg-white/20"
                    />
                    <span className="text-xs text-white/50">
                      We optimise images to WebP (max {MAX_IMAGE_DIMENSION}px). Clear, front-on bottle photos work best.
                    </span>
                    {sauce.previewUrl && (
                      <img
                        src={sauce.previewUrl}
                        alt={`Preview of ${sauce.name || `sauce ${index + 1}`}`}
                        className="mt-3 h-32 w-32 rounded-lg border border-white/20 object-cover"
                      />
                    )}
                  </label>
                </div>
              ))}

              {!isComplete && (
                <button
                  type="button"
                  onClick={addSauce}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/50 hover:bg-white/10"
                >
                  + Add another sauce
                </button>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-amber-200/20 bg-black/20 p-4 text-xs text-white/70">
              <p>
                By submitting this form you confirm that each sauce complies with EU food safety regulations and that you can ship samples to: EUROPEAN HOT SAUCE AWARDS, CBS Foods GmbH, Ossastr 21A, 12045 Berlin, Neukölln, Germany.
              </p>
              <p>
                We will send a confirmation email with logistics and a magic link to the supplier dashboard. Please check your spam folder if you don&apos;t receive it within a few minutes.
              </p>
            </div>

            {!isComplete && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : `Submit ${entryCount} Sauce${entryCount > 1 ? "s" : ""}`}
              </button>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                <p>{successMessage}</p>
                {submittedSauces.length > 0 && (
                  <ul className="mt-3 space-y-1 text-emerald-100">
                    {submittedSauces.map((sauce) => (
                      <li key={sauce.id} className="flex items-center justify-between gap-4 rounded-lg border border-emerald-200/20 bg-emerald-400/10 px-3 py-2">
                        <div className="flex items-center gap-3">
                          {sauce.sauce_code && (
                            <span className="rounded bg-emerald-600/30 px-2 py-1 font-mono text-xs font-semibold text-emerald-100">
                              {sauce.sauce_code}
                            </span>
                          )}
                          <span>{sauce.name}</span>
                        </div>
                        {sauce.image_path && (
                          <span className="text-xs uppercase tracking-[0.2em] text-emerald-200">Image uploaded</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 pt-4 border-t border-emerald-300/20">
                  <p className="mb-3 text-emerald-100">📦 Next step: Download and complete the packing sheet for your shipment</p>
                  <Link
                    href="/shipping-form.pdf"
                    target="_blank"
                    download
                    className="inline-block rounded-lg bg-emerald-600/30 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-600/40"
                  >
                    📄 Download Packing Sheet (PDF)
                  </Link>
                </div>
              </div>
            )}
            {errorMessage && (
              <div className="rounded-2xl border border-red-300/40 bg-red-500/10 p-4 text-sm text-red-200">
                {errorMessage}
              </div>
            )}
          </form>

          {paymentQuote && (
            <div className="space-y-4 rounded-2xl border border-white/20 bg-black/30 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80">
                Payment Summary
              </h2>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex justify-between">
                  <span>Entries</span>
                  <span>{paymentQuote.entry_count}</span>
                </li>
                <li className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(paymentQuote.subtotal_cents)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Discount</span>
                  <span>{paymentQuote.discount_percent}% ({formatCurrency(paymentQuote.discount_cents)})</span>
                </li>
                <li className="flex justify-between text-base font-semibold text-amber-200">
                  <span>Total due</span>
                  <span>{formatCurrency(paymentQuote.amount_due_cents)}</span>
                </li>
              </ul>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {checkoutLoading ? "Redirecting..." : "Proceed to Payment"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:border-white hover:bg-white/10"
                >
                  Start a New Submission
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-white/15 bg-white/[0.05] p-8 backdrop-blur">
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80">Discount Overview</h2>
          <table className="w-full text-left text-sm text-white/70">
            <thead className="text-xs uppercase tracking-[0.2em] text-white/50">
              <tr>
                <th className="pb-3">Entries</th>
                <th className="pb-3">Range</th>
                <th className="pb-3">Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <tr>
                <td className="py-3">1 × Product Entry</td>
                <td>1</td>
                <td>0%</td>
              </tr>
              <tr>
                <td className="py-3">2 × Product Entry</td>
                <td>2</td>
                <td>3%</td>
              </tr>
              <tr>
                <td className="py-3">3 × Product Entry</td>
                <td>3</td>
                <td>5%</td>
              </tr>
              <tr>
                <td className="py-3">4 × Product Entry</td>
                <td>4</td>
                <td>7%</td>
              </tr>
              <tr>
                <td className="py-3">5 × Product Entry</td>
                <td>5</td>
                <td>9%</td>
              </tr>
              <tr>
                <td className="py-3">6 × Product Entry</td>
                <td>6</td>
                <td>12%</td>
              </tr>
              <tr>
                <td className="py-3">7–10 × Product Entry</td>
                <td>7 – 10</td>
                <td>13%</td>
              </tr>
              <tr>
                <td className="py-3">11–20 × Product Entry</td>
                <td>11 – 20</td>
                <td>14%</td>
              </tr>
              <tr>
                <td className="py-3">21–100 × Product Entry</td>
                <td>21 – 100</td>
                <td>16%</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
