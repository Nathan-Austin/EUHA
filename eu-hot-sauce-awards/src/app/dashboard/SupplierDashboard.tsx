'use client';

import { useState, useTransition } from 'react';
import { submitTrackingInfo } from '@/app/actions';
import SupplierPaymentButton from './SupplierPaymentButton';
import SupplierSauceManager from './SupplierSauceManager';

interface PaymentQuote {
  id: string;
  entry_count: number;
  discount_percent: number;
  subtotal_cents: number;
  discount_cents: number;
  amount_due_cents: number;
  stripe_payment_status: string;
}

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

interface EnteredSauce {
  id: string;
  name: string;
  category: string;
  image_path: string | null;
  status: string;
}

interface SupplierDashboardProps {
  supplierData: {
    brandName: string;
    trackingNumber: string | null;
    postalServiceName: string | null;
    packageStatus: string;
    packageReceivedAt: string | null;
  };
  pendingPayment?: PaymentQuote | null;
  unpaidSauces: UnpaidSauce[];
  enteredSauces: EnteredSauce[];
  userEmail: string;
}

export default function SupplierDashboard({ supplierData, pendingPayment, unpaidSauces, enteredSauces: _enteredSauces, userEmail }: SupplierDashboardProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageBucket = process.env.NEXT_PUBLIC_SAUCE_IMAGE_BUCKET || 'sauce-media';

  // TODO: REMOVE — temporary mock data for layout preview
  const enteredSauces: EnteredSauce[] = [
    { id: '1', name: 'Dragon Breath Habanero', category: 'Hot Chili Sauce', image_path: null, status: 'arrived' },
    { id: '2', name: 'Smoky BBQ Reaper', category: 'BBQ Chili Sauce', image_path: null, status: 'registered' },
    { id: '3', name: 'Mango Madness', category: 'Sweet', image_path: null, status: 'boxed' },
  ];

  const [trackingNumber, setTrackingNumber] = useState(supplierData.trackingNumber || '');
  const [postalService, setPostalService] = useState(supplierData.postalServiceName || '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!trackingNumber.trim() || !postalService.trim()) {
      setError('Please fill in both tracking number and postal service');
      return;
    }

    startTransition(async () => {
      const result = await submitTrackingInfo(trackingNumber, postalService);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Tracking information submitted successfully! We\'ll notify you when your package arrives.');
      }
    });
  };

  const getStatusBadge = () => {
    switch (supplierData.packageStatus) {
      case 'received':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Package Received ✓</span>;
      case 'shipped':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">In Transit</span>;
      default:
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">Awaiting Shipment</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Supplier Dashboard</h2>
        <p className="text-gray-300">Welcome, {supplierData.brandName}!</p>
      </div>

      {enteredSauces.length > 0 && (
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Entered Sauces ({enteredSauces.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enteredSauces.map((sauce) => (
              <div key={sauce.id} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
                {sauce.image_path && supabaseUrl ? (
                  <img
                    src={`${supabaseUrl}/storage/v1/object/public/${imageBucket}/${sauce.image_path}`}
                    alt={sauce.name}
                    className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 text-xs">No img</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{sauce.name}</p>
                  <p className="text-sm text-gray-600">{sauce.category}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                    sauce.status === 'arrived' ? 'bg-green-100 text-green-800' :
                    sauce.status === 'boxed' ? 'bg-blue-100 text-blue-800' :
                    sauce.status === 'judged' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {sauce.status.charAt(0).toUpperCase() + sauce.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingPayment ? (
        <>
          <SupplierPaymentButton paymentQuote={pendingPayment} userEmail={userEmail} />

          {/* Show sauce manager below payment button - users can add more sauces to improve discount */}
          {unpaidSauces.length > 0 && (
            <div className="bg-white rounded-lg p-6">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> You can add more sauces below to get a better discount, then click "Update Payment Batch" to recalculate.
                </p>
              </div>
              <SupplierSauceManager initialSauces={unpaidSauces} hasExistingPayment={true} />
            </div>
          )}
          <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Tracking & Shipment</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Complete your payment to unlock shipping and tracking features
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Show sauce manager when no pending payment */}
          <div className="bg-white rounded-lg p-6">
            <SupplierSauceManager initialSauces={unpaidSauces} />
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Package Status</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {supplierData.packageStatus === 'received'
                    ? `Received on ${new Date(supplierData.packageReceivedAt!).toLocaleDateString()}`
                    : supplierData.packageStatus === 'shipped'
                    ? 'Your package is on its way'
                    : 'Please submit your tracking information below'}
                </p>
              </div>
              <div>{getStatusBadge()}</div>
            </div>
          </div>

          {supplierData.packageStatus !== 'received' && (
            <div className="border border-gray-300 rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {supplierData.trackingNumber ? 'Update Tracking Information' : 'Submit Tracking Information'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Tracking Number *
              </label>
              <input
                type="text"
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter tracking number"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <label htmlFor="postalService" className="block text-sm font-medium text-gray-700 mb-1">
                Postal Service *
              </label>
              <input
                type="text"
                id="postalService"
                value={postalService}
                onChange={(e) => setPostalService(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., DHL, UPS, An Post, FedEx"
                disabled={isPending}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-orange-400 transition-colors"
            >
              {isPending ? 'Submitting...' : supplierData.trackingNumber ? 'Update Tracking Info' : 'Submit Tracking Info'}
            </button>
          </form>
        </div>
      )}

          {supplierData.trackingNumber && (
            <div className="border border-gray-300 rounded-lg p-6 bg-white">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Submitted Tracking Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Tracking Number:</dt>
                  <dd className="text-sm text-gray-900 font-mono">{supplierData.trackingNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Postal Service:</dt>
                  <dd className="text-sm text-gray-900">{supplierData.postalServiceName}</dd>
                </div>
              </dl>
            </div>
          )}
        </>
      )}
    </div>
  );
}
