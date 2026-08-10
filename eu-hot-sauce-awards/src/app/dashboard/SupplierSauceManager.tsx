'use client';

import { useState, useEffect, useTransition } from 'react';
import { createSauceEntry, deleteSauce, createPaymentBatch, enterCompetitionYear, getSupplierPastSauces, reuseSauceEntry } from '@/app/actions';
import { createClient } from '@/lib/supabase/client';
import { COMPETITION_YEAR } from '@/lib/config';

interface UnpaidSauce {
  id: string;
  name: string;
  category: string;
  sauce_code: string;
  ingredients: string;
  allergens: string;
  webshop_link: string | null;
  created_at: string;
}

interface PastSauce {
  id: string;
  name: string;
  category: string;
  image_path: string | null;
  competition_year: number;
}

interface SupplierSauceManagerProps {
  initialSauces: UnpaidSauce[];
  hasExistingPayment?: boolean;
  hasOptedIn: boolean;
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

function calculatePayment(entryCount: number) {
  const subtotal = entryCount * BASE_PRICE;
  const discountRate = resolveDiscount(entryCount);
  const discount = subtotal * discountRate;
  const total = subtotal - discount;
  return { subtotal, discount, discountRate, total };
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);

export default function SupplierSauceManager({ initialSauces, hasExistingPayment = false, hasOptedIn }: SupplierSauceManagerProps) {
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
  const [reusingId, setReusingId] = useState<string | null>(null);

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

  const handleReuseSauce = (sauceId: string) => {
    setError(null);
    setSuccess(null);
    setReusingId(sauceId);
    startTransition(async () => {
      const result = await reuseSauceEntry(sauceId);
      setReusingId(null);
      if ('error' in result) {
        setError(result.error);
      } else {
        setSuccess(`Sauce re-entered for ${COMPETITION_YEAR}! Code: ${result.data.sauce_code}`);
        window.location.reload();
      }
    });
  };

  const handleAddSauce = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
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
        setSuccess(`Sauce entry created successfully! Code: ${result.data.sauce_code}`);
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

  const handleCreatePayment = async () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createPaymentBatch();
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Payment batch created! Redirecting to dashboard...');
        setTimeout(() => window.location.reload(), 1500);
      }
    });
  };

  const payment = sauces.length > 0 ? calculatePayment(sauces.length) : null;

  if (!optedIn) {
    return (
      <div className="text-center bg-white rounded-lg border-2 border-dashed border-orange-300 p-8 space-y-4">
        <p className="text-3xl">🌶️</p>
        <h2 className="text-2xl font-bold text-gray-900">Ready for the {COMPETITION_YEAR} EU Hot Sauce Awards?</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Judging is changing this year — professionals and press will be scoring entries live at an event in Berlin,
          rather than judges scoring at home. Click below to get started: you can resubmit any of your previous
          sauces in one click, or add new ones.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleEnterCompetition}
          disabled={entering}
          className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-orange-400 transition-colors"
        >
          {entering ? 'Starting...' : `Enter ${COMPETITION_YEAR} Competition`}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Your Sauce Entries</h2>
          <p className="text-sm text-gray-600 mt-1">
            Add new sauce entries or remove unpaid entries
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Sauce Entry'}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-900 space-y-1">
        <p><strong>Delivery window:</strong> ship your samples between 1 January and 28 February {COMPETITION_YEAR}.</p>
        <p>
          <strong>Shipping from outside Europe?</strong> Include your EORI number on the customs paperwork and ship
          via UPS — UPS clears customs and delivers directly to us, rather than us having to track the parcel down.
        </p>
      </div>

      {pastSauces && pastSauces.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Re-enter a Previous Sauce</h3>
            <p className="text-sm text-gray-600 mt-1">
              Pick one of your past entries to resubmit as-is for {COMPETITION_YEAR} — no retyping needed.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pastSauces.map((sauce) => (
              <div key={sauce.id} className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-3 min-w-0">
                  {sauce.image_path && supabaseUrl ? (
                    <img
                      src={`${supabaseUrl}/storage/v1/object/public/${imageBucket}/${sauce.image_path}`}
                      alt={sauce.name}
                      className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{sauce.name}</p>
                    <p className="text-xs text-gray-500">{sauce.category} · {sauce.competition_year}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleReuseSauce(sauce.id)}
                  disabled={isPending && reusingId === sauce.id}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 disabled:bg-green-400 flex-shrink-0"
                >
                  {reusingId === sauce.id ? 'Adding...' : 'Re-enter'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {loadingPastSauces && (
        <p className="text-sm text-gray-500">Loading your previous entries…</p>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Add Sauce Form */}
      {showAddForm && (
        <form onSubmit={handleAddSauce} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-blue-900">Add New Sauce Entry</h3>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Sauce Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
              Ingredients <span className="text-red-500">*</span>
            </label>
            <textarea
              id="ingredients"
              name="ingredients"
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="allergens" className="block text-sm font-medium text-gray-700 mb-1">
              Allergens
            </label>
            <input
              type="text"
              id="allergens"
              name="allergens"
              placeholder="None"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="webshopLink" className="block text-sm font-medium text-gray-700 mb-1">
              Webshop Link
            </label>
            <input
              type="url"
              id="webshopLink"
              name="webshopLink"
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Sauce Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: Square image, at least 500x500px
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending || uploadingImage}
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {uploadingImage ? 'Uploading image...' : isPending ? 'Creating...' : 'Create Sauce Entry'}
          </button>
        </form>
      )}

      {/* Unpaid Sauces List */}
      {sauces.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Unpaid Sauce Entries ({sauces.length})
          </h3>

          <div className="space-y-3">
            {sauces.map((sauce) => (
              <div key={sauce.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                        {sauce.sauce_code}
                      </span>
                      <h4 className="font-semibold text-gray-900">{sauce.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{sauce.category}</p>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{sauce.ingredients}</p>
                    {sauce.webshop_link && (
                      <a
                        href={sauce.webshop_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View in webshop →
                      </a>
                    )}
                  </div>

                  {deleteConfirm === sauce.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteSauce(sauce.id)}
                        disabled={isPending}
                        className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 disabled:bg-red-400"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        disabled={isPending}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(sauce.id)}
                      className="px-3 py-1 bg-red-50 text-red-700 text-sm font-semibold rounded hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          {payment && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-orange-900">Payment Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>{sauces.length} {sauces.length === 1 ? 'entry' : 'entries'} × {formatCurrency(BASE_PRICE)}:</span>
                  <span>{formatCurrency(payment.subtotal)}</span>
                </div>
                {payment.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount ({(payment.discountRate * 100).toFixed(0)}%):</span>
                    <span>-{formatCurrency(payment.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-orange-200">
                  <span>Total Due:</span>
                  <span>{formatCurrency(payment.total)}</span>
                </div>
              </div>

              <button
                onClick={handleCreatePayment}
                disabled={isPending}
                className="w-full px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-orange-400 transition-colors"
              >
                {isPending
                  ? (hasExistingPayment ? 'Updating Payment...' : 'Creating Payment...')
                  : (hasExistingPayment ? 'Update Payment Batch' : 'Proceed to Payment')}
              </button>

              <p className="text-xs text-orange-800 text-center">
                {hasExistingPayment
                  ? 'This will update your payment batch with the new discount'
                  : 'This will create a payment batch for all unpaid entries above'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600">No unpaid sauce entries</p>
          <p className="text-sm text-gray-500 mt-1">Click "Add Sauce Entry" to create a new entry</p>
        </div>
      )}
    </div>
  );
}
