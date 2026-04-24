'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { submitAllScores, getJudgeScoredSauces } from '@/app/actions';
import ShippingAddressDisplay from './ShippingAddressDisplay';
import RohFollowCTA from '@/components/RohFollowCTA';
import { JUDGING_OPEN } from '@/lib/config';

interface StoredScore {
  sauceId: string;
  sauceCode: string;
  scores: Record<string, number>;
  comment: string;
}

interface ScoredSauce {
  sauceId: string;
  sauceCode: string;
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
    packageStatus: string;
    packageReceivedAt: string | null;
  };
  judgeData: {
    address: string | null;
    address_line2: string | null;
    city: string | null;
    postal_code: string | null;
    state: string | null;
    country: string | null;
    dhl_tracking_number: string | null;
    dhl_label_url: string | null;
  } | null;
  enteredSauces: EnteredSauce[];
}

export default function SupplierDashboard({ supplierData, judgeData, enteredSauces }: SupplierDashboardProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageBucket = process.env.NEXT_PUBLIC_SAUCE_IMAGE_BUCKET || 'sauce-media';

  const router = useRouter();
  const [storedScores, setStoredScores] = useState<StoredScore[]>([]);
  const [scoredSauces, setScoredSauces] = useState<ScoredSauce[]>([]);
  const [totalAssigned, setTotalAssigned] = useState<number>(0);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const savedScores = localStorage.getItem('judgeScores');
    if (savedScores) {
      setStoredScores(Object.values(JSON.parse(savedScores)));
    }

    const loadScoredSauces = async () => {
      const result = await getJudgeScoredSauces();
      if ('scoredSauces' in result && result.scoredSauces) {
        setScoredSauces(result.scoredSauces);
        setTotalAssigned(result.totalAssigned || 0);
      }
    };
    loadScoredSauces();
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

  const isComplete = storedScores.length === 0 && totalAssigned > 0 && scoredSauces.length >= totalAssigned;

  if (isComplete) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Supplier Dashboard</h2>
          <p className="text-gray-300">Welcome, {supplierData.brandName}!</p>
        </div>

        <div className="bg-white rounded-lg p-6 text-center space-y-3">
          <div className="text-4xl">🌶️</div>
          <h3 className="text-xl font-bold text-gray-900">That&apos;s all for 2026 — thank you!</h3>
          <p className="text-gray-600">
            Your scores are in and judging is complete. We&apos;ll be in touch with the results.
            2027 entries will open late September.
          </p>
          {JUDGING_OPEN && (
          <>
            <p className="text-sm text-gray-500">Need to change a score? Just rescan the sauce QR code.</p>
            <button
              onClick={() => router.push('/judge/scan')}
              className="w-full px-4 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Scan Sauce QR Code
            </button>
          </>
        )}
        </div>

        <RohFollowCTA />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Supplier Dashboard</h2>
        <p className="text-gray-300">Welcome, {supplierData.brandName}!</p>
      </div>

      {/* Their entered sauces */}
      {enteredSauces.length > 0 && (
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Entries ({enteredSauces.length})
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
                  <div className="w-14 h-14 rounded-md bg-gray-100 flex-shrink-0" />
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

      {!JUDGING_OPEN && (
        <div className="rounded-lg bg-white border border-gray-200 px-6 py-5 text-center space-y-2">
          <p className="text-3xl">🌶️🏆</p>
          <h3 className="text-lg font-bold text-gray-900">Judging is now closed</h3>
          <p className="text-sm text-gray-600">
            Thank you for entering the 2026 EU Hot Sauce Awards. Winners will be announced on Republic of Heat&apos;s social media channels — follow along so you don&apos;t miss the reveal!
          </p>
        </div>
      )}

      {/* Judging section */}
      {JUDGING_OPEN && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Your Judging</h3>
              <p className="text-sm text-gray-300 mt-1">
                {totalAssigned === 0 ? (
                  <span className="text-yellow-400">Check back here once your judging box arrives</span>
                ) : (
                  <><span className="font-semibold text-orange-400">{scoredSauces.length}/{totalAssigned}</span> sauces scored</>
                )}
              </p>
            </div>
            {totalAssigned > 0 && (
              <button
                onClick={() => router.push('/judge/scan')}
                className="w-full sm:w-auto px-4 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 text-center"
              >
                Scan Sauce QR Code
              </button>
            )}
          </div>

          {/* Pending local scores */}
          {storedScores.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-white">Scores Pending Submission</h4>
              <div className="space-y-3 sm:space-y-0 sm:border sm:border-gray-300 sm:rounded-md sm:bg-white">
                {storedScores.map((score) => (
                  <div
                    key={score.sauceId}
                    className="border border-gray-300 rounded-lg p-4 bg-white sm:border-0 sm:rounded-none sm:border-t sm:first:border-t-0 sm:p-0"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
                      <div className="flex-1 sm:px-4 sm:py-3">
                        <p className="font-medium text-gray-900">Code: {score.sauceCode}</p>
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
          )}

          {/* Completed scores */}
          {scoredSauces.length > 0 && (
            <div className="pt-4 border-t border-gray-600">
              <h4 className="text-base font-semibold text-white mb-1">Completed Scores</h4>
              <p className="text-sm text-gray-400 mb-3">Need to change a score? Just rescan the sauce QR code.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {scoredSauces.map((sauce) => (
                  <Link
                    key={sauce.sauceId}
                    href={`/judge/score/${sauce.sauceId}`}
                    className="px-3 py-2 bg-green-50 border border-green-300 rounded-lg text-center hover:bg-green-100"
                  >
                    <p className="text-sm font-semibold text-green-800">{sauce.sauceCode}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-center text-red-400">{error}</p>}
          {success && <p className="text-sm text-center text-green-400">{success}</p>}
        </div>
      )}

      <RohFollowCTA />

      {/* Judging box shipping address */}
      <div className="border border-gray-300 rounded-lg p-6 bg-white space-y-4">
        <ShippingAddressDisplay
          address={{
            address: judgeData?.address ?? null,
            address_line2: judgeData?.address_line2 ?? null,
            city: judgeData?.city ?? null,
            postal_code: judgeData?.postal_code ?? null,
            state: judgeData?.state ?? null,
            country: judgeData?.country ?? null,
          }}
        />
        {judgeData?.dhl_tracking_number && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Judging Box Shipping</h3>
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 space-y-1">
              <p className="text-sm font-medium text-green-800">Your judging box has been shipped!</p>
              <p className="font-mono text-sm text-green-700">Tracking: {judgeData.dhl_tracking_number}</p>
              <a
                href={`https://www.dhl.com/en/express/tracking.html?AWB=${judgeData.dhl_tracking_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:underline"
              >
                Track on DHL ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
