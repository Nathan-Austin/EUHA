'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SendPaymentRemindersButton() {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    remindersSent?: number;
    totalPending?: number;
    details?: Array<{ email: string; brand: string; days_pending: number }>;
    errors?: Array<{ email?: string; error: string }>;
    message?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendReminders = async () => {
    setIsSending(true);
    setError(null);
    setResult(null);

    try {
      const supabase = createClient();
      const { data, error: invokeError } = await supabase.functions.invoke('send-payment-reminders');

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reminders');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Reminders</h3>
          <p className="text-sm text-gray-600">Send reminder emails to suppliers with pending payments</p>
        </div>
        <button
          onClick={handleSendReminders}
          disabled={isSending}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? 'Sending...' : 'Send Reminders'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">Error</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className={`rounded-lg border p-4 ${
          result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? '✓ Reminders Sent' : 'Error'}
              </p>
              {result.remindersSent !== undefined && result.totalPending !== undefined && (
                <span className="text-sm text-gray-700">
                  {result.remindersSent} of {result.totalPending} suppliers notified
                </span>
              )}
            </div>

            {result.message && (
              <p className="text-sm text-gray-700">{result.message}</p>
            )}

            {result.details && result.details.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Emails Sent:</p>
                <div className="space-y-1">
                  {result.details.map((detail, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center justify-between py-1 px-2 bg-white rounded border border-gray-200">
                      <span className="font-medium">{detail.brand}</span>
                      <span className="text-gray-500">{detail.email}</span>
                      <span className="text-orange-600">{detail.days_pending} days pending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.errors && result.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-red-700 mb-2">Errors:</p>
                <div className="space-y-1">
                  {result.errors.map((err, index) => (
                    <div key={index} className="text-xs text-red-600 py-1 px-2 bg-red-100 rounded">
                      {err.email ? `${err.email}: ` : ''}{err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
