'use client';

import { useState, useEffect } from 'react';
import { getPendingProJudges, approveProJudge, rejectProJudge, type PendingProJudge } from '../actions';

export default function ProJudgeApproval() {
  const [judges, setJudges] = useState<PendingProJudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedJudge, setExpandedJudge] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  const loadJudges = async () => {
    setLoading(true);
    setError(null);
    const result = await getPendingProJudges();

    if ('error' in result && result.error) {
      setError(result.error);
    } else if ('judges' in result) {
      setJudges(result.judges || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadJudges();
  }, []);

  const handleApprove = async (judgeId: string) => {
    if (!confirm('Approve this pro judge and send them access?')) return;

    setProcessing(judgeId);
    setError(null);
    setSuccessMessage(null);

    const result = await approveProJudge(judgeId);

    if ('error' in result && result.error) {
      setError(result.error);
    } else if ('success' in result) {
      setSuccessMessage(result.message || 'Judge approved successfully!');
      loadJudges(); // Refresh the list
    }

    setProcessing(null);
  };

  const handleReject = async (judgeId: string) => {
    setProcessing(judgeId);
    setError(null);
    setSuccessMessage(null);

    const result = await rejectProJudge(judgeId, rejectionReason || undefined);

    if ('error' in result && result.error) {
      setError(result.error);
    } else if ('success' in result) {
      setSuccessMessage(result.message || 'Judge application rejected.');
      setShowRejectForm(null);
      setRejectionReason('');
      loadJudges(); // Refresh the list
    }

    setProcessing(null);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Pro Judge Approvals</h2>
        <p className="text-gray-600">Loading pending applications...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pro Judge Approvals</h2>
        <button
          onClick={loadJudges}
          className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-4 text-green-800">
          {successMessage}
        </div>
      )}

      {judges.length === 0 ? (
        <p className="text-gray-600">No pending pro judge applications.</p>
      ) : (
        <div className="space-y-4">
          {judges.map((judge) => (
            <div
              key={judge.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{judge.name}</h3>
                  <p className="text-sm text-gray-600">{judge.email}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Experience: <span className="font-medium">{judge.experience_level}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Applied: {new Date(judge.created_at).toLocaleDateString()}
                  </p>

                  {expandedJudge === judge.id && (
                    <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Address:</p>
                        <p className="text-sm text-gray-700">
                          {judge.address}<br />
                          {judge.city}, {judge.postal_code}<br />
                          {judge.country}
                        </p>
                      </div>
                      {judge.industry_affiliation && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Industry Affiliation:</p>
                          <p className="text-sm text-gray-700">
                            {judge.affiliation_details || 'Yes (details not provided)'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setExpandedJudge(expandedJudge === judge.id ? null : judge.id)}
                  className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  {expandedJudge === judge.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {showRejectForm === judge.id ? (
                <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">
                      Rejection Reason (optional - will be emailed to applicant):
                    </span>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
                      placeholder="Unfortunately, we are unable to accept your application at this time..."
                    />
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(judge.id)}
                      disabled={processing === judge.id}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processing === judge.id ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectForm(null);
                        setRejectionReason('');
                      }}
                      disabled={processing === judge.id}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4">
                  <button
                    onClick={() => handleApprove(judge.id)}
                    disabled={processing === judge.id}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing === judge.id ? 'Approving...' : 'Approve & Send Access'}
                  </button>
                  <button
                    onClick={() => setShowRejectForm(judge.id)}
                    disabled={processing === judge.id}
                    className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
