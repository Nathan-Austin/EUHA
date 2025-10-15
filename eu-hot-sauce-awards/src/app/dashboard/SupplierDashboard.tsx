'use client';

import { useState, useTransition } from 'react';
import { submitTrackingInfo } from '@/app/actions';
import SupplierPaymentButton from './SupplierPaymentButton';

interface PaymentQuote {
  id: string;
  entry_count: number;
  discount_percent: number;
  subtotal_cents: number;
  discount_cents: number;
  amount_due_cents: number;
  stripe_payment_status: string;
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
  userEmail: string;
}

export default function SupplierDashboard({ supplierData, pendingPayment, userEmail }: SupplierDashboardProps) {
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

      {pendingPayment ? (
        <>
          <SupplierPaymentButton paymentQuote={pendingPayment} userEmail={userEmail} />
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
