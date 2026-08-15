'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { createSauceEntry, deleteSauce, createPaymentBatch, enterCompetitionYear, getSupplierPastSauces, reuseSauceEntry, updateSauceInfo, verifyEhcMembership } from '@/app/actions';
import { createClient } from '@/lib/supabase/client';
import { COMPETITION_YEAR } from '@/lib/config';
import type { EhcVerifyResult } from '@/lib/ehc/types';

interface UnpaidSauce {
  id: string;
  name: string;
  category: string;
  sauce_code: string;
  ingredients: string;
  allergens: string;
  webshop_link: string | null;
  tasting_notes: string | null;
  image_path: string | null;
  created_at: string;
}

interface PastSauce {
  id: string;
  name: string;
  category: string;
  image_path: string | null;
  competition_year: number;
  reenteredCategories: string[];
}

interface EhcData {
  ehcId: string | null;
  ehcStatus: string | null;
  ehcVerifiedAt: string | null;
}

interface SupplierSauceManagerProps {
  initialSauces: UnpaidSauce[];
  hasExistingPayment?: boolean;
  paymentStatus?: string | null;
  confirmedEntryCount?: number | null;
  hasOptedIn: boolean;
  ehcData: EhcData;
}

const CATEGORIES = [
  'Mild Chili Sauce',
  'Medium Chili Sauce',
  'Hot Chili Sauce',
  'Extra Hot Chili Sauce',
  'Extract Based Chili Sauce',
  'BBQ Chili Sauce',
  'Chili Ketchup',
  'Sweet',
  'Chili Honey',
  'Garlic Chili Sauce',
  'Sambal, Chutney & Pickles',
  'Chili Oil',
  'Freestyle',
  'Asian Style Chili Sauce',
  'Chili Paste',
  'Salt & Condiments',
];

// The EU's standard 14 allergens (Food Information to Consumers Regulation) —
// this is a pan-European competition, so this list applies regardless of
// where an individual supplier ships from.
const ALLERGENS = [
  'Cereals containing gluten',
  'Crustaceans',
  'Eggs',
  'Fish',
  'Peanuts',
  'Soybeans',
  'Milk',
  'Tree nuts',
  'Celery',
  'Mustard',
  'Sesame seeds',
  'Sulphur dioxide/sulphites',
  'Lupin',
  'Molluscs',
];

const BASE_PRICE = 50; // €50 per entry

const DISCOUNT_BANDS: { min: number; max: number; discount: number }[] = [
  { min: 1, max: 1, discount: 0 },
  { min: 2, max: 2, discount: 0.03 },
  { min: 3, max: 3, discount: 0.05 },
  { min: 4, max: 4, discount: 0.07 },
  { min: 5, max: 5, discount: 0.09 },
  { min: 6, max: 6, discount: 0.12 },
  { min: 7, max: 10, discount: 0.13 },
  { min: 11, max: 20, discount: 0.14 },
  { min: 21, max: 100, discount: 0.16 },
];

function resolveDiscount(entryCount: number) {
  const band = DISCOUNT_BANDS.find((tier) => entryCount >= tier.min && entryCount <= tier.max);
  return band ? band.discount : DISCOUNT_BANDS[DISCOUNT_BANDS.length - 1].discount;
}

// Mirrors calculatePaymentTotals in actions.ts — kept in sync manually since
// this one runs client-side for the live preview before any server round-trip.
function calculatePayment(entryCount: number, ehcQualifies: boolean) {
  const subtotal = entryCount * BASE_PRICE;
  const discountRate = resolveDiscount(entryCount);
  const volumeDiscount = subtotal * discountRate;
  const ehcDiscount = ehcQualifies && entryCount >= 3 ? BASE_PRICE : 0;
  const total = subtotal - volumeDiscount - ehcDiscount;
  return { subtotal, volumeDiscount, discountRate, ehcDiscount, total };
}

const EHC_QUALIFYING_STATUSES = new Set(['pending', 'member']);

const EHC_STATUS_CHIP: Record<string, { label: string; className: string }> = {
  member: { label: 'Verified — EHC member', className: 'bg-green-600 text-white' },
  pending: { label: 'EHC payment pending — discount applied', className: 'bg-[#F5C518] text-black' },
  new: { label: 'Not an active EHC member', className: 'bg-black/10 text-black/60' },
  lapsed: { label: 'EHC membership lapsed', className: 'bg-black/10 text-black/60' },
  declined: { label: 'Not an active EHC member', className: 'bg-black/10 text-black/60' },
  not_found: { label: 'EHC ID not found', className: 'bg-red-600 text-white' },
  mismatch: { label: "Email/company doesn't match this EHC ID", className: 'bg-red-600 text-white' },
  unavailable: { label: 'Verification temporarily unavailable — try again shortly', className: 'bg-black/10 text-black/60' },
};

function chipForResult(result: EhcVerifyResult | null, fallbackStatus: string | null): { label: string; className: string } | null {
  if (result) {
    if (result.outcome === 'verified') return EHC_STATUS_CHIP.member;
    if (result.outcome === 'pending_payment') return EHC_STATUS_CHIP.pending;
    if (result.outcome === 'not_qualifying') return EHC_STATUS_CHIP[result.status] ?? EHC_STATUS_CHIP.new;
    if (result.outcome === 'not_found') return EHC_STATUS_CHIP.not_found;
    if (result.outcome === 'mismatch') return EHC_STATUS_CHIP.mismatch;
    if (result.outcome === 'unavailable') return EHC_STATUS_CHIP.unavailable;
  }
  if (fallbackStatus && EHC_STATUS_CHIP[fallbackStatus]) return EHC_STATUS_CHIP[fallbackStatus];
  return null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);

const inputClass =
  'block w-full border-2 border-black px-4 py-2.5 text-base text-black placeholder-black/40 outline-none focus:border-[#F5C518]';
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-black/60';
const checkboxRowClass = 'flex items-center gap-2 text-sm text-black';
const checkboxClass = 'h-4 w-4 flex-shrink-0 accent-black';

function allergensToList(allergens: string): string[] {
  if (!allergens || allergens === 'None') return [];
  return allergens.split(',').map((a) => a.trim()).filter(Boolean);
}

function AllergenCheckboxes({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (allergen: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
      {ALLERGENS.map((allergen) => (
        <label key={allergen} className={checkboxRowClass}>
          <input
            type="checkbox"
            checked={selected.has(allergen)}
            onChange={() => onToggle(allergen)}
            className={checkboxClass}
          />
          {allergen}
        </label>
      ))}
    </div>
  );
}

export default function SupplierSauceManager({ initialSauces, hasExistingPayment = false, paymentStatus = null, confirmedEntryCount = null, hasOptedIn, ehcData }: SupplierSauceManagerProps) {
  const [sauces, setSauces] = useState<UnpaidSauce[]>(initialSauces);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadingImage, setUploadingImage] = useState(false);
  const supabase = createClient();

  const [optedIn, setOptedIn] = useState(hasOptedIn);
  const [entering, setEntering] = useState(false);
  const [pastSauces, setPastSauces] = useState<PastSauce[] | null>(null);
  const [loadingPastSauces, setLoadingPastSauces] = useState(false);

  const [addAllergens, setAddAllergens] = useState<Set<string>>(new Set());

  const [reenterTarget, setReenterTarget] = useState<PastSauce | null>(null);
  const [reenterSelected, setReenterSelected] = useState<Set<string>>(new Set());
  const [reenterSubmitting, setReenterSubmitting] = useState(false);

  const [editTarget, setEditTarget] = useState<UnpaidSauce | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editIngredients, setEditIngredients] = useState('');
  const [editAllergens, setEditAllergens] = useState<Set<string>>(new Set());
  const [editTastingNotes, setEditTastingNotes] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editUploadingImage, setEditUploadingImage] = useState(false);

  // Lock background scroll while a full-screen (mobile) modal is open.
  useEffect(() => {
    if (reenterTarget || editTarget) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [reenterTarget, editTarget]);

  const [ehcIdInput, setEhcIdInput] = useState(ehcData.ehcId ?? '');
  const [ehcResult, setEhcResult] = useState<EhcVerifyResult | null>(null);
  const [ehcVerifying, setEhcVerifying] = useState(false);
  const [ehcError, setEhcError] = useState<string | null>(null);

  const handleVerifyEhc = () => {
    if (!ehcIdInput.trim()) return;
    setEhcVerifying(true);
    setEhcError(null);
    startTransition(async () => {
      const result = await verifyEhcMembership(ehcIdInput);
      setEhcVerifying(false);
      if ('error' in result) {
        setEhcError(result.error);
      } else {
        setEhcResult(result.result);
      }
    });
  };

  const ehcChip = chipForResult(ehcResult, ehcData.ehcStatus);
  const ehcQualifies = EHC_QUALIFYING_STATUSES.has(
    ehcResult
      ? ('status' in ehcResult ? ehcResult.status ?? '' : '')
      : (ehcData.ehcStatus ?? '')
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageBucket = process.env.NEXT_PUBLIC_SAUCE_IMAGE_BUCKET || 'sauce-media';

  useEffect(() => {
    if (!optedIn || pastSauces !== null) return;
    setLoadingPastSauces(true);
    getSupplierPastSauces().then((result) => {
      if ('data' in result) {
        setPastSauces(result.data);
      } else {
        setPastSauces([]);
      }
      setLoadingPastSauces(false);
    });
  }, [optedIn, pastSauces]);

  const handleEnterCompetition = () => {
    setError(null);
    setEntering(true);
    startTransition(async () => {
      const result = await enterCompetitionYear();
      setEntering(false);
      if ('error' in result) {
        setError(result.error);
      } else {
        setOptedIn(true);
      }
    });
  };

  const openReenterModal = (sauce: PastSauce) => {
    setError(null);
    setReenterTarget(sauce);
    // Pre-select the sauce's original category, unless it's already been re-entered there.
    setReenterSelected(
      sauce.reenteredCategories.includes(sauce.category) ? new Set() : new Set([sauce.category])
    );
  };

  const toggleReenterCategory = (category: string) => {
    setReenterSelected((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const handleConfirmReenter = () => {
    if (!reenterTarget || reenterSelected.size === 0) return;
    setError(null);
    setReenterSubmitting(true);
    startTransition(async () => {
      const result = await reuseSauceEntry(reenterTarget.id, Array.from(reenterSelected));
      setReenterSubmitting(false);
      if ('error' in result) {
        setError(result.error);
      } else {
        setReenterTarget(null);
        setSuccess(`Added ${result.data.length} ${result.data.length === 1 ? 'entry' : 'entries'} for ${COMPETITION_YEAR}.`);
        window.location.reload();
      }
    });
  };

  const handleAddSauce = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    formData.set('allergens', Array.from(addAllergens).join(', '));
    const imageFile = formData.get('image') as File;

    // Upload image to Supabase Storage if provided
    let imagePath: string | null = null;
    if (imageFile && imageFile.size > 0) {
      setUploadingImage(true);
      try {
        const bucket = process.env.NEXT_PUBLIC_SAUCE_IMAGE_BUCKET || 'sauce-media';
        const pendingPath = `pending/${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(pendingPath, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) {
          setError(`Image upload failed: ${uploadError.message}`);
          setUploadingImage(false);
          return;
        }

        imagePath = pendingPath;
      } catch (err) {
        setError('Failed to upload image. Please try again.');
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    // Add imagePath to formData
    if (imagePath) {
      formData.set('imagePath', imagePath);
    }

    startTransition(async () => {
      const result = await createSauceEntry(formData);
      if ('error' in result) {
        setError(result.error);
        // Clean up uploaded image if sauce creation failed
        if (imagePath) {
          await supabase.storage.from(process.env.NEXT_PUBLIC_SAUCE_IMAGE_BUCKET || 'sauce-media').remove([imagePath]);
        }
      } else {
        setSuccess('Sauce entry created successfully!');
        // Refresh the page to get updated sauces (no need to reset form, reload will clear it)
        window.location.reload();
      }
    });
  };

  const handleDeleteSauce = async (sauceId: string) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await deleteSauce(sauceId);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Sauce entry deleted successfully!');
        setSauces(sauces.filter(s => s.id !== sauceId));
        setDeleteConfirm(null);
      }
    });
  };

  const openEditModal = (sauce: UnpaidSauce) => {
    setError(null);
    setEditTarget(sauce);
    setEditCategory(sauce.category);
    setEditIngredients(sauce.ingredients);
    setEditAllergens(new Set(allergensToList(sauce.allergens)));
    setEditTastingNotes(sauce.tasting_notes || '');
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setError(null);

    let pendingImagePath: string | null = null;
    if (editImageFile) {
      setEditUploadingImage(true);
      const bucket = process.env.NEXT_PUBLIC_SAUCE_IMAGE_BUCKET || 'sauce-media';
      const pendingPath = `pending/${Date.now()}_${editImageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(pendingPath, editImageFile, { contentType: editImageFile.type, upsert: false });
      setEditUploadingImage(false);

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`);
        return;
      }
      pendingImagePath = pendingPath;
    }

    setEditSubmitting(true);
    startTransition(async () => {
      const result = await updateSauceInfo(
        editTarget.id,
        {
          category: editCategory,
          ingredients: editIngredients,
          allergens: Array.from(editAllergens).join(', '),
          tastingNotes: editTastingNotes,
        },
        pendingImagePath
      );
      setEditSubmitting(false);
      if ('error' in result) {
        setError(result.error);
      } else {
        setEditTarget(null);
        window.location.reload();
      }
    });
  };

  const handleCreatePayment = async () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createPaymentBatch();
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Entries confirmed! Redirecting to dashboard...');
        setTimeout(() => window.location.reload(), 1500);
      }
    });
  };

  const payment = sauces.length > 0 ? calculatePayment(sauces.length, ehcQualifies) : null;
  const isConfirmed = hasExistingPayment && paymentStatus === 'deferred';
  const needsReconfirm = isConfirmed && confirmedEntryCount !== sauces.length;

  if (!optedIn) {
    return (
      <div className="border-[3px] border-dashed border-black bg-white p-8 text-center space-y-4">
        <p className="text-3xl">🌶️</p>
        <h2 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
          Ready for EHSA {COMPETITION_YEAR}?
        </h2>
        <p className="mx-auto max-w-md text-black/70">
          Judging is changing this year — professionals and press will be scoring entries live at a congress in
          Berlin, rather than judges scoring at home. Click below to get started: you can resubmit any of your
          previous sauces in one click, or add new ones.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleEnterCompetition}
          disabled={entering}
          className="bg-[#F5C518] px-6 py-3 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-black hover:text-[#F5C518] disabled:opacity-50"
        >
          {entering ? 'Starting…' : `Enter ${COMPETITION_YEAR} Competition`}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase">Manage your sauce entries</h2>
          <p className="mt-1 text-sm text-black/60">Add new sauce entries or remove unpaid entries</p>
        </div>
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="bg-black px-4 py-2.5 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
        >
          {showAddForm ? 'Cancel' : '+ Add sauce entry'}
        </button>
      </div>

      {pastSauces && pastSauces.length > 0 && (
        <div className="border-2 border-black bg-white p-6 space-y-4">
          <div>
            <h3 className="font-[family-name:var(--font-archivo-black)] text-base uppercase">Re-enter a previous sauce</h3>
            <p className="mt-1 text-sm text-black/60">
              Pick one of your past entries to resubmit for {COMPETITION_YEAR} — no retyping needed. You can enter
              the same sauce into more than one category if it fits.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {pastSauces.map((sauce) => {
              const alreadyEntered = sauce.reenteredCategories.length > 0;
              return (
                <div key={sauce.id} className="flex items-center justify-between gap-3 border-2 border-black/10 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {sauce.image_path && supabaseUrl ? (
                      <img
                        src={`${supabaseUrl}/storage/v1/object/public/${imageBucket}/${sauce.image_path}`}
                        alt={sauce.name}
                        className="h-12 w-12 flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 flex-shrink-0 bg-black/5" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-black">{sauce.name}</p>
                      <p className="text-xs text-black/50">{sauce.category} · {sauce.competition_year}</p>
                      {alreadyEntered && (
                        <p className="mt-0.5 text-xs font-semibold text-green-700">
                          Entered in {sauce.reenteredCategories.length} {sauce.reenteredCategories.length === 1 ? 'category' : 'categories'} this year
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openReenterModal(sauce)}
                    className={`flex-shrink-0 px-3 py-1.5 text-sm font-bold uppercase tracking-[0.04em] ${
                      alreadyEntered
                        ? 'bg-black/10 text-black/60 hover:bg-black/20'
                        : 'bg-[#F5C518] text-black hover:bg-black hover:text-[#F5C518]'
                    }`}
                  >
                    {alreadyEntered ? 'Add another category' : 'Confirm category & re-enter'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {loadingPastSauces && (
        <p className="text-sm text-black/50">Loading your previous entries…</p>
      )}

      {error && (
        <div className="border-2 border-red-600 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="border-2 border-black bg-[#F5C518]/30 p-4 text-sm text-black">
          {success}
        </div>
      )}

      {/* Re-enter category picker modal */}
      {reenterTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 sm:flex sm:items-center sm:justify-center sm:p-4">
          <div className="h-full w-full overflow-y-auto bg-white p-6 space-y-4 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-lg sm:border-[3px] sm:border-black">
            <div>
              <h3 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase">{reenterTarget.name}</h3>
              <p className="mt-1 text-sm text-black/60">
                Select every category you want to enter this sauce in for {COMPETITION_YEAR}.
              </p>
            </div>

            <div className="border-2 border-[#F5C518] bg-[#F5C518]/20 p-3 text-sm text-black">
              Each category selected is a <strong>separate paid entry</strong> and counts toward your total —
              entering the same sauce in 3 categories costs the same as 3 different sauces.
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CATEGORIES.map((category) => {
                const already = reenterTarget.reenteredCategories.includes(category);
                return (
                  <label
                    key={category}
                    className={`${checkboxRowClass} ${already ? 'opacity-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={already || reenterSelected.has(category)}
                      disabled={already}
                      onChange={() => toggleReenterCategory(category)}
                      className={checkboxClass}
                    />
                    {category}
                    {already && <span className="text-xs text-green-700">(already entered)</span>}
                  </label>
                );
              })}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3 border-t border-black/10 pt-4">
              <button
                onClick={() => setReenterTarget(null)}
                className="border-2 border-black px-4 py-2 text-sm font-semibold uppercase tracking-[0.04em] hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReenter}
                disabled={reenterSelected.size === 0 || reenterSubmitting}
                className="bg-black px-4 py-2 text-sm font-bold uppercase tracking-[0.04em] text-[#F5C518] hover:bg-black/80 disabled:opacity-50"
              >
                {reenterSubmitting ? 'Adding…' : `Confirm ${reenterSelected.size || ''} ${reenterSelected.size === 1 ? 'entry' : 'entries'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit sauce info modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 sm:flex sm:items-center sm:justify-center sm:p-4">
          <div className="h-full w-full overflow-y-auto bg-white p-6 space-y-4 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-lg sm:border-[3px] sm:border-black">
            <h3 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase">Edit {editTarget.name}</h3>

            <div>
              <label className={labelClass}>Category</label>
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputClass}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Ingredients <span className="text-red-600">*</span>
              </label>
              <textarea
                value={editIngredients}
                onChange={(e) => setEditIngredients(e.target.value)}
                required
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className={labelClass}>
                Photo <span className="normal-case text-black/40">(replace with an updated photo if you have one)</span>
              </label>
              <div className="flex items-center gap-3">
                {(editImagePreview || (editTarget.image_path && supabaseUrl)) && (
                  <img
                    src={editImagePreview || `${supabaseUrl}/storage/v1/object/public/${imageBucket}/${editTarget.image_path}`}
                    alt=""
                    className="h-14 w-14 flex-shrink-0 border-2 border-black/10 object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageSelect}
                  className="block w-full text-sm text-black file:mr-4 file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-[#F5C518] hover:file:bg-black/80"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Allergens</label>
              <AllergenCheckboxes
                selected={editAllergens}
                onToggle={(a) => setEditAllergens((prev) => {
                  const next = new Set(prev);
                  if (next.has(a)) next.delete(a); else next.add(a);
                  return next;
                })}
              />
            </div>

            <div>
              <label className={labelClass}>
                Tasting notes <span className="normal-case text-black/40">(what should judges experience?)</span>
              </label>
              <textarea
                value={editTastingNotes}
                onChange={(e) => setEditTastingNotes(e.target.value)}
                rows={4}
                placeholder="Describe the sauce — how it tastes, the heat profile, and what judges should notice when they taste it."
                className={`${inputClass} resize-none`}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3 border-t border-black/10 pt-4">
              <button
                onClick={() => setEditTarget(null)}
                className="border-2 border-black px-4 py-2 text-sm font-semibold uppercase tracking-[0.04em] hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSubmitting || editUploadingImage}
                className="bg-black px-4 py-2 text-sm font-bold uppercase tracking-[0.04em] text-[#F5C518] hover:bg-black/80 disabled:opacity-50"
              >
                {editUploadingImage ? 'Uploading photo…' : editSubmitting ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sauce Form */}
      {showAddForm && (
        <form onSubmit={handleAddSauce} className="border-[3px] border-black bg-white p-6 space-y-4">
          <h3 className="font-[family-name:var(--font-archivo-black)] text-base uppercase">Add new sauce entry</h3>

          <div>
            <label htmlFor="name" className={labelClass}>
              Sauce name <span className="text-red-600">*</span>
            </label>
            <input type="text" id="name" name="name" required className={inputClass} />
          </div>

          <div>
            <label htmlFor="category" className={labelClass}>
              Category <span className="text-red-600">*</span>
            </label>
            <select id="category" name="category" required className={inputClass}>
              <option value="">Select a category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ingredients" className={labelClass}>
              Ingredients <span className="text-red-600">*</span>
            </label>
            <textarea id="ingredients" name="ingredients" required rows={3} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>Allergens</label>
            <AllergenCheckboxes
              selected={addAllergens}
              onToggle={(a) => setAddAllergens((prev) => {
                const next = new Set(prev);
                if (next.has(a)) next.delete(a); else next.add(a);
                return next;
              })}
            />
          </div>

          <div>
            <label htmlFor="tastingNotes" className={labelClass}>
              Tasting notes <span className="normal-case text-black/40">(what should judges experience?)</span>
            </label>
            <textarea
              id="tastingNotes"
              name="tastingNotes"
              rows={4}
              placeholder="Describe the sauce — how it tastes, the heat profile, and what judges should notice when they taste it."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="webshopLink" className={labelClass}>Webshop link</label>
            <input type="url" id="webshopLink" name="webshopLink" placeholder="https://..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="image" className={labelClass}>Sauce image</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              className="block w-full border-2 border-black px-4 py-2.5 text-sm text-black file:mr-4 file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-[#F5C518] hover:file:bg-black/80"
            />
            <p className="mt-1 text-xs text-black/40">Recommended: Square image, at least 500x500px</p>
          </div>

          <button
            type="submit"
            disabled={isPending || uploadingImage}
            className="w-full bg-black py-3 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80 disabled:opacity-50"
          >
            {uploadingImage ? 'Uploading image…' : isPending ? 'Creating…' : 'Create sauce entry'}
          </button>
        </form>
      )}

      {/* Unpaid Sauces List */}
      {sauces.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-[family-name:var(--font-archivo-black)] text-base uppercase">
            Unpaid sauce entries ({sauces.length})
          </h3>

          <div className="space-y-3">
            {sauces.map((sauce) => (
              <div key={sauce.id} className="border-2 border-black bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 gap-3">
                    {sauce.image_path && supabaseUrl ? (
                      <img
                        src={`${supabaseUrl}/storage/v1/object/public/${imageBucket}/${sauce.image_path}`}
                        alt={sauce.name}
                        className="h-14 w-14 flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 flex-shrink-0 bg-black/5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-black">{sauce.name}</h4>
                      <p className="mt-1 text-sm text-black/60">{sauce.category}</p>
                      <p className="mt-2 line-clamp-2 text-xs text-black/50">{sauce.ingredients}</p>
                      {sauce.webshop_link && (
                      <a
                        href={sauce.webshop_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs font-semibold underline hover:text-[#F5C518]"
                      >
                        View in webshop →
                      </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    <button
                      onClick={() => openEditModal(sauce)}
                      className="border-2 border-black px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.04em] hover:bg-black hover:text-[#F5C518]"
                    >
                      Edit sauce info
                    </button>
                    {deleteConfirm === sauce.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteSauce(sauce.id)}
                          disabled={isPending}
                          className="bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          disabled={isPending}
                          className="bg-black/10 px-3 py-1.5 text-sm font-semibold text-black hover:bg-black/20"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(sauce.id)}
                        className="border-2 border-red-600 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* EHC Membership */}
          <div className="border-2 border-black bg-white p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-stretch">
              <div className="flex-1 space-y-3">
                <h3 className="font-[family-name:var(--font-archivo-black)] text-base uppercase">
                  European Heat Council membership
                </h3>
                <p className="text-sm text-black/60">
                  EHC members get their 3rd entry free. Enter your membership number to apply the discount.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <input
                    type="text"
                    value={ehcIdInput}
                    onChange={(e) => setEhcIdInput(e.target.value)}
                    onBlur={handleVerifyEhc}
                    placeholder="EHC-2026-00001"
                    className={`${inputClass} sm:max-w-xs`}
                  />
                  <button
                    onClick={handleVerifyEhc}
                    disabled={ehcVerifying || !ehcIdInput.trim()}
                    className="flex-shrink-0 border-2 border-black px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.04em] hover:bg-black hover:text-[#F5C518] disabled:opacity-50"
                  >
                    {ehcVerifying ? 'Checking…' : 'Verify'}
                  </button>
                </div>
                {ehcError && <p className="text-sm text-red-600">{ehcError}</p>}
                {ehcChip && (
                  <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-[0.04em] ${ehcChip.className}`}>
                    {ehcChip.label}
                  </span>
                )}
                {!ehcIdInput.trim() && !ehcChip && (
                  <a
                    href="https://europeanheatcouncil.eu/membership"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-semibold underline hover:text-[#F5C518]"
                  >
                    Not a member? Join EHC →
                  </a>
                )}
              </div>
              <div className="relative h-32 flex-shrink-0 sm:h-auto sm:w-56">
                <Image
                  src="/ehc-logo-transparent.png"
                  alt="European Heat Council"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {payment && (
            <div className="border-[3px] border-black bg-[#F5C518]/20 p-6 space-y-4">
              <h3 className="font-[family-name:var(--font-archivo-black)] text-base uppercase">Payment summary</h3>

              {isConfirmed && !needsReconfirm && (
                <p className="border-2 border-black bg-white px-3 py-2 text-sm font-semibold uppercase tracking-[0.04em] text-black">
                  Confirmed — payment due January
                </p>
              )}
              {needsReconfirm && (
                <p className="border-2 border-[#F5C518] bg-white px-3 py-2 text-sm text-black">
                  You've changed your entries since confirming — update your confirmation to lock in the new total.
                </p>
              )}

              <div className="border-2 border-black/10 bg-white">
                <p className="border-b border-black/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-black/50">
                  Sauces in this total
                </p>
                <ul className="divide-y divide-black/10">
                  {sauces.map((sauce) => (
                    <li key={sauce.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <span className="min-w-0 truncate text-black">{sauce.name}</span>
                      <span className="flex-shrink-0 text-black/50">{sauce.category}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-black/70">
                  <span>{sauces.length} {sauces.length === 1 ? 'entry' : 'entries'} × {formatCurrency(BASE_PRICE)}:</span>
                  <span>{formatCurrency(payment.subtotal)}</span>
                </div>
                {payment.volumeDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Volume discount ({(payment.discountRate * 100).toFixed(0)}%):</span>
                    <span>-{formatCurrency(payment.volumeDiscount)}</span>
                  </div>
                )}
                {payment.ehcDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>EHC member — 3rd entry free:</span>
                    <span>-{formatCurrency(payment.ehcDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 border-black pt-2 text-lg font-semibold text-black">
                  <span>Total due (January):</span>
                  <span>{formatCurrency(payment.total)}</span>
                </div>
              </div>

              <button
                onClick={handleCreatePayment}
                disabled={isPending || (isConfirmed && !needsReconfirm)}
                className="w-full bg-black py-3 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80 disabled:opacity-50"
              >
                {isPending
                  ? (isConfirmed ? 'Updating confirmation…' : 'Confirming…')
                  : needsReconfirm
                    ? 'Update confirmation'
                    : isConfirmed
                      ? 'Confirmed'
                      : 'Confirm entries'}
              </button>

              <p className="text-center text-xs text-black/50">
                {isConfirmed
                  ? "This locks in your entries — you won't be charged until January. You can still add or remove entries any time before then."
                  : "This confirms your entries — you won't be charged until January. You can still add or remove entries any time before then."}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="border-[3px] border-dashed border-black/20 bg-white py-12 text-center">
          <p className="text-black/70">No unpaid sauce entries</p>
          <p className="mt-1 text-sm text-black/40">Click &quot;Add sauce entry&quot; to create a new entry</p>
        </div>
      )}
    </div>
  );
}
