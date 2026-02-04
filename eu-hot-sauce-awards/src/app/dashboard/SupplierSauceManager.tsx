'use client';

import { useState, useTransition } from 'react';
import { createSauceEntry, deleteSauce, createPaymentBatch } from '@/app/actions';
import { createClient } from '@/lib/supabase/client';

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

interface SupplierSauceManagerProps {
  initialSauces: UnpaidSauce[];
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

export default function SupplierSauceManager({ initialSauces }: SupplierSauceManagerProps) {
  const [sauces, setSauces] = useState<UnpaidSauce[]>(initialSauces);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadingImage, setUploadingImage] = useState(false);
  const supabase = createClient();

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
      if (result.error) {
        setError(result.error);
        // Clean up uploaded image if sauce creation failed
        if (imagePath) {
          await supabase.storage.from(process.env.NEXT_PUBLIC_SAUCE_IMAGE_BUCKET || 'sauce-media').remove([imagePath]);
        }
      } else {
        setSuccess(`Sauce entry created successfully! Code: ${result.data?.sauce_code}`);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Your Sauce Entries</h2>
          <p className="text-sm text-gray-600 mt-1">
            Add new sauce entries or remove unpaid entries before completing payment
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Sauce Entry'}
        </button>
      </div>

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
                {isPending ? 'Creating Payment...' : 'Proceed to Payment'}
              </button>

              <p className="text-xs text-orange-800 text-center">
                This will create a payment batch for all unpaid entries above
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
