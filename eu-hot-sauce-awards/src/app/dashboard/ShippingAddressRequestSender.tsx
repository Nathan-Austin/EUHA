'use client';

import { useState, useEffect, useTransition } from 'react';
import { getSuppliersMissingAddressInfo, sendShippingAddressRequests } from '@/app/actions';

const DEFAULT_SUBJECT = 'Action Required: Add Your Shipping Address for Your EUHA Judging Box';

const DEFAULT_BODY = `<p>Hi {{brandName}},</p>

<p>Great news — we're getting ready to ship out the judging boxes for the <strong>EU Hot Sauce Awards 2026</strong>.</p>

<p>As a participating supplier, you'll receive a judging set so you can taste and score the other entries. To make sure your box reaches you, we need your <strong>delivery address</strong>.</p>

<p style="margin: 30px 0; text-align: center;">
  <a href="{{magicLink}}" style="background-color: #ff4d00; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Add My Shipping Address</a>
</p>

<p>This link will take you directly to your dashboard where you can enter your address. It expires in <strong>24 hours</strong> — if it has expired, just visit <a href="https://heatawards.eu/login">heatawards.eu/login</a> to get a fresh one.</p>

<p>If you have any questions, reply to this email and we'll get back to you.</p>

<p>Thanks,<br/>The EU Hot Sauce Awards Team</p>`;

export default function ShippingAddressRequestSender() {
  const [recipients, setRecipients] = useState<{ name: string; email: string; brandName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [editMode, setEditMode] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; alreadyHave: number; errors: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getSuppliersMissingAddressInfo().then((res) => {
      if (res.suppliers) setRecipients(res.suppliers);
      setLoading(false);
    });
  }, []);

  const handleSend = () => {
    if (!confirm(`Send shipping address request to ${recipients.length} supplier${recipients.length !== 1 ? 's' : ''}?`)) return;
    startTransition(async () => {
      const res = await sendShippingAddressRequests(subject, body);
      setResult(res);
      // Refresh recipients
      const info = await getSuppliersMissingAddressInfo();
      if (info.suppliers) setRecipients(info.suppliers);
    });
  };

  const handleCancel = () => {
    setSubject(DEFAULT_SUBJECT);
    setBody(DEFAULT_BODY);
    setEditMode(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Shipping Address Request</h3>
        <p className="mt-1 text-sm text-gray-600">
          Send an email with a magic login link to suppliers who haven't provided a shipping address yet.
          Use <code className="bg-gray-100 px-1 rounded">{'{{brandName}}'}</code> and <code className="bg-gray-100 px-1 rounded">{'{{magicLink}}'}</code> as placeholders.
        </p>
      </div>

      {/* Recipients summary */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading recipients…</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900">
                {recipients.length} supplier{recipients.length !== 1 ? 's' : ''} missing an address
              </p>
              <button
                onClick={() => setShowRecipients(!showRecipients)}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium mt-0.5"
              >
                {showRecipients ? '▼ Hide list' : '▶ Show list'}
              </button>
            </>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={isPending || recipients.length === 0 || loading}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
        >
          {isPending ? 'Sending…' : `Send to ${recipients.length}`}
        </button>
      </div>

      {showRecipients && recipients.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Brand</th>
                <th className="px-4 py-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr key={r.email} className="border-t">
                  <td className="px-4 py-2 text-gray-900">{r.brandName}</td>
                  <td className="px-4 py-2 text-gray-500">{r.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${result.failed === 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
          <p className="font-medium">
            ✓ {result.sent} sent
            {result.failed > 0 && ` · ${result.failed} failed`}
            {result.alreadyHave > 0 && ` · ${result.alreadyHave} already had addresses`}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              {result.errors.map((e, i) => <li key={i}>⚠ {e}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Email editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">Email Template</h4>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-3 py-1.5 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Edit Template
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleCancel} className="px-3 py-1.5 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Reset to Default
              </button>
              <button onClick={() => setEditMode(false)} className="px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700">
                Done
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          {editMode ? (
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">{subject}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body (HTML)</label>
          {editMode ? (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-xs font-mono text-gray-700">{body}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
