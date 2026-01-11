'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { sendVatEmail } from '@/app/actions';

interface Supplier {
  id: string;
  brand_name: string;
  email: string;
  contact_name: string | null;
}

export default function SendVatEmailButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    message?: string;
    data?: {
      invoiceNumber: string;
      supplierName: string;
      entryCount: number;
      grossAmount: string;
      netAmount: string;
      vatAmount: string;
    };
  } | null>(null);

  // Fetch suppliers when modal opens
  useEffect(() => {
    if (isOpen && suppliers.length === 0) {
      fetchSuppliers();
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, brand_name, email, contact_name')
        .order('brand_name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedSupplierId) {
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const response = await sendVatEmail(selectedSupplierId);
      setResult(response);

      if (response.success) {
        // Auto-close modal after 3 seconds on success
        setTimeout(() => {
          setIsOpen(false);
          setSelectedSupplierId('');
          setResult(null);
        }, 5000);
      }
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Failed to send VAT email' });
    } finally {
      setIsSending(false);
    }
  };

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
      >
        Send VAT Email
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Send VAT Invoice</h2>
                <p className="text-sm text-gray-600">Select a supplier to send their VAT invoice for current year entries</p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedSupplierId('');
                  setResult(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Supplier Selector */}
              <div>
                <label htmlFor="supplier" className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Supplier
                </label>
                <select
                  id="supplier"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  disabled={loading || isSending}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="">
                    {loading ? 'Loading suppliers...' : 'Choose a supplier...'}
                  </option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.brand_name} ({supplier.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              {selectedSupplier && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier:</span>
                      <span className="font-medium text-gray-900">{selectedSupplier.brand_name}</span>
                    </div>
                    {selectedSupplier.contact_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact:</span>
                        <span className="font-medium text-gray-900">{selectedSupplier.contact_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{selectedSupplier.email}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-medium text-gray-900">Current Year (2026)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className={`rounded-lg border p-4 ${
                  result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}>
                  {result.success && result.data ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-semibold text-green-800">Invoice Sent Successfully!</p>
                      </div>
                      <div className="space-y-2 text-sm text-green-800">
                        <div className="flex justify-between">
                          <span>Invoice Number:</span>
                          <span className="font-bold">{result.data.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Supplier:</span>
                          <span className="font-medium">{result.data.supplierName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Entries:</span>
                          <span className="font-medium">{result.data.entryCount}</span>
                        </div>
                        <div className="pt-2 border-t border-green-300 space-y-1">
                          <div className="flex justify-between">
                            <span>Net Amount:</span>
                            <span className="font-medium">{result.data.netAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>VAT:</span>
                            <span className="font-medium">{result.data.vatAmount}</span>
                          </div>
                          <div className="flex justify-between font-bold text-base">
                            <span>Total:</span>
                            <span>{result.data.grossAmount}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-green-700 mt-2">
                        This modal will close automatically in a few seconds...
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-red-800">Error</p>
                        <p className="text-sm text-red-700">{result.error || 'Failed to send VAT email'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedSupplierId('');
                  setResult(null);
                }}
                disabled={isSending}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!selectedSupplierId || isSending}
                className="rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSending ? 'Sending...' : 'Send Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
