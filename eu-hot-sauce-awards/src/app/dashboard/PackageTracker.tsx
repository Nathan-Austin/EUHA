'use client';

import { useState, useTransition } from 'react';
import { markPackageReceived } from '@/app/actions';

interface Supplier {
  id: string;
  brandName: string;
  email: string;
  trackingNumber: string | null;
  postalServiceName: string | null;
  packageStatus: string;
  packageReceivedAt: string | null;
}

interface PackageTrackerProps {
  suppliers: Supplier[];
}

export default function PackageTracker({ suppliers }: PackageTrackerProps) {
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleMarkReceived = (supplierId: string) => {
    setError(null);
    setSuccess(null);
    setProcessingId(supplierId);

    startTransition(async () => {
      const result = await markPackageReceived(supplierId);
      setProcessingId(null);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(`Package from ${result.brandName} marked as received!`);
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Received</span>;
      case 'shipped':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">In Transit</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Pending</span>;
    }
  };

  const shippedSuppliers = suppliers.filter(s => s.packageStatus === 'shipped');
  const receivedSuppliers = suppliers.filter(s => s.packageStatus === 'received');
  const pendingSuppliers = suppliers.filter(s => s.packageStatus === 'pending');

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Package Tracking</h3>

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

      {/* In Transit - Priority */}
      {shippedSuppliers.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">In Transit ({shippedSuppliers.length})</h4>
          <div className="space-y-2">
            {shippedSuppliers.map((supplier) => (
              <div key={supplier.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-gray-900">{supplier.brandName}</h5>
                      {getStatusBadge(supplier.packageStatus)}
                    </div>
                    <p className="text-sm text-gray-600">{supplier.email}</p>
                    {supplier.trackingNumber && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Tracking:</span> <span className="font-mono">{supplier.trackingNumber}</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Service:</span> {supplier.postalServiceName}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleMarkReceived(supplier.id)}
                    disabled={isPending && processingId === supplier.id}
                    className="ml-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors"
                  >
                    {isPending && processingId === supplier.id ? 'Processing...' : 'Mark Received'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Tracking */}
      {pendingSuppliers.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">Awaiting Tracking ({pendingSuppliers.length})</h4>
          <div className="space-y-2">
            {pendingSuppliers.map((supplier) => (
              <div key={supplier.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-semibold text-gray-900">{supplier.brandName}</h5>
                      {getStatusBadge(supplier.packageStatus)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{supplier.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Received - Collapsed View */}
      {receivedSuppliers.length > 0 && (
        <details className="border border-gray-200 rounded-lg">
          <summary className="p-4 cursor-pointer hover:bg-gray-50 font-medium text-gray-900">
            Received Packages ({receivedSuppliers.length})
          </summary>
          <div className="p-4 pt-0 space-y-2">
            {receivedSuppliers.map((supplier) => (
              <div key={supplier.id} className="border border-green-200 rounded-lg p-3 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-900">{supplier.brandName}</h5>
                      {getStatusBadge(supplier.packageStatus)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Received: {new Date(supplier.packageReceivedAt!).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
