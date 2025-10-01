'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { submitAllScores } from '@/app/actions';

// The shape of our local storage data
interface StoredScore {
  sauceId: string;
  sauceName: string; // It's helpful to store the name too
  scores: Record<string, number>;
  comment: string;
}

export default function JudgeDashboard() {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Judge Dashboard</h2>
        <Link href="/judge/scan" className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
          Scan New Sauce
        </Link>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Sauces Pending Submission</h3>
        {storedScores.length > 0 ? (
          <div className="space-y-4">
            <div className="border rounded-md">
              <table className="min-w-full">
                <tbody>
                  {storedScores.map((score) => (
                    <tr key={score.sauceId} className="border-t">
                      <td className="px-4 py-3">
                        <p className="font-medium">{score.sauceName}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/judge/score/${score.sauceId}`} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                          Edit Score
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pt-4 text-right">
              <button
                onClick={handleSubmitAll}
                disabled={isSubmitting}
                className="px-6 py-3 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400"
              >
                {isSubmitting ? 'Submitting...' : 'Submit All Final Scores'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">You have no scores pending submission. Scan a QR code to begin.</p>
        )}
      </div>
      {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
      {success && <p className="mt-4 text-sm text-center text-green-600">{success}</p>}
    </div>
  );
}
