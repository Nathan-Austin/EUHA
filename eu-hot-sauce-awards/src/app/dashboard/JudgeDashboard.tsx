'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { submitAllScores } from '@/app/actions';

// The shape of our local storage data
interface StoredScore {
  sauceId: string;
  sauceName: string; // It's helpful to store the name too
  scores: Record<string, number>;
  comment: string;
}

export default function JudgeDashboard() {
  const router = useRouter();
  const [storedScores, setStoredScores] = useState<StoredScore[]>([]);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Load data from localStorage when the component mounts
    const savedScores = localStorage.getItem('judgeScores');
    if (savedScores) {
      setStoredScores(Object.values(JSON.parse(savedScores)));
    }
  }, []);

  const handleSubmitAll = () => {
    setError(null);
    setSuccess(null);

    startSubmitTransition(async () => {
        const result = await submitAllScores(JSON.stringify(storedScores));
        if (result?.error) {
          setError(result.error);
        } else {
          setSuccess('All scores submitted successfully!');
          localStorage.removeItem('judgeScores');
          setStoredScores([]);
        }
    });
  };

  const handleStartJudging = () => {
    // Go directly to scanner - it will auto-create session from logged-in user
    router.push('/judge/scan');
  };

  return (
    <>
      {/* Header Banner */}
      <div className="w-full -mx-8 -mt-14 mb-6">
        <img
          src="/cropped-banner-website.jpg"
          alt="EU Hot Sauce Awards"
          className="w-full h-auto"
        />
      </div>

      <div className="space-y-4 sm:space-y-6">

      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Judge Dashboard</h2>
        <button
          onClick={handleStartJudging}
          className="w-full sm:w-auto px-4 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 text-center"
        >
          Scan Sauce QR Code
        </button>
      </div>

      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">Sauces Pending Submission</h3>
        {storedScores.length > 0 ? (
          <div className="space-y-4">
            {/* Mobile: Card layout, Desktop: Table */}
            <div className="space-y-3 sm:space-y-0 sm:border sm:border-gray-300 sm:rounded-md sm:bg-white">
              {storedScores.map((score, index) => (
                <div
                  key={score.sauceId}
                  className="border border-gray-300 rounded-lg p-4 bg-white sm:border-0 sm:rounded-none sm:border-t sm:first:border-t-0 sm:p-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
                    <div className="flex-1 sm:px-4 sm:py-3">
                      <p className="font-medium text-gray-900">{score.sauceName}</p>
                    </div>
                    <div className="sm:px-4 sm:py-3">
                      <Link
                        href={`/judge/score/${score.sauceId}`}
                        className="block w-full sm:inline-block sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 text-center"
                      >
                        Edit Score
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <button
                onClick={handleSubmitAll}
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:float-right px-6 py-3 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400"
              >
                {isSubmitting ? 'Submitting...' : 'Submit All Final Scores'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-sm sm:text-base">You have no scores pending submission. Scan a QR code to begin.</p>
        )}
      </div>
        {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
        {success && <p className="mt-4 text-sm text-center text-green-600">{success}</p>}
      </div>
    </>
  );
}
