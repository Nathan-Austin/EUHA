'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { submitAllScores, getJudgeScoredSauces } from '@/app/actions';
import JudgeShippingAddressForm from './JudgeShippingAddressForm';
import ShippingAddressDisplay from './ShippingAddressDisplay';
import RohFollowCTA from '@/components/RohFollowCTA';

// The shape of our local storage data
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

interface ShippingAddress {
  address: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  state: string | null;
  country: string | null;
}

interface Props {
  shippingAddress: ShippingAddress;
  trackingNumber: string | null;
  labelUrl: string | null;
  isEventJudge?: boolean;
  openJudging?: boolean;
}

export default function CommunityJudgeDashboard({ shippingAddress, trackingNumber, labelUrl, isEventJudge, openJudging }: Props) {
  const router = useRouter();
  const [storedScores, setStoredScores] = useState<StoredScore[]>([]);
  const [scoredSauces, setScoredSauces] = useState<ScoredSauce[]>([]);
  const [totalAssigned, setTotalAssigned] = useState<number>(0);
  const [isEventJudgeFromServer, setIsEventJudgeFromServer] = useState<boolean>(false);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Load data from localStorage when the component mounts
    const savedScores = localStorage.getItem('judgeScores');
    if (savedScores) {
      setStoredScores(Object.values(JSON.parse(savedScores)));
    }

    // Load scored sauces from database
    const loadScoredSauces = async () => {
      const result = await getJudgeScoredSauces();
      if ('scoredSauces' in result && result.scoredSauces) {
        setScoredSauces(result.scoredSauces);
        setTotalAssigned(result.totalAssigned || 0);
        if (result.isEventJudge) setIsEventJudgeFromServer(true);
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

  const handleStartJudging = () => {
    // Go directly to scanner - it will auto-create session from logged-in user
    router.push('/judge/scan');
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Judge Dashboard</h2>
          <p className="text-sm text-gray-300 mt-1">
            {(isEventJudge || isEventJudgeFromServer || openJudging) ? (
              <span className="font-semibold text-orange-400">{scoredSauces.length} sauces judged</span>
            ) : totalAssigned === 0 ? (
              <span className="font-semibold text-yellow-400">Check back here once your judging box arrives</span>
            ) : (
              <><span className="font-semibold text-orange-400">{scoredSauces.length}/{totalAssigned}</span> sauces judged</>
            )}
          </p>
        </div>
        {(isEventJudge || isEventJudgeFromServer || openJudging || totalAssigned > 0) && (
          <button
            onClick={handleStartJudging}
            className="w-full sm:w-auto px-4 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 text-center"
          >
            Scan Sauce QR Code
          </button>
        )}
      </div>

      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Sauces Pending Submission</h3>
        {storedScores.length > 0 ? (
          <div className="space-y-4">
            {/* Mobile: Card layout, Desktop: Table */}
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
        ) : (
          <p className="text-gray-300 text-sm sm:text-base">You have no scores pending submission.</p>
        )}
      </div>

      {/* Scored Sauces Section */}
      <div className="pt-4 border-t border-gray-300">
        <h3 className="text-lg sm:text-xl font-semibold mb-1 text-white">Completed Scores</h3>
        <p className="text-sm text-gray-400 mb-3">Need to change a score? Just rescan the sauce QR code.</p>
        {scoredSauces.length > 0 ? (
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
        ) : (
          <p className="text-gray-300 text-sm sm:text-base">No sauces scored yet. Scan a QR code to begin.</p>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-center text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-center text-green-400">{success}</p>}

      <RohFollowCTA />

      {/* DHL Tracking */}
      {!(isEventJudge || isEventJudgeFromServer || openJudging) && trackingNumber && (
        <div className="pt-4 border-t border-gray-300">
          <h3 className="text-lg font-semibold mb-2 text-white">Box Shipping</h3>
          <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 space-y-1">
            <p className="text-sm font-medium text-green-800">Your judging box has been shipped!</p>
            <p className="font-mono text-sm text-green-700">Tracking: {trackingNumber}</p>
            {labelUrl && (
              <a
                href={`https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:underline"
              >
                Track on DHL ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* Shipping address — not relevant for event judges */}
      {!(isEventJudge || isEventJudgeFromServer || openJudging) && (
        <div className="pt-4 border-t border-gray-300 space-y-4">
          <ShippingAddressDisplay address={shippingAddress} />
          {!trackingNumber && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <JudgeShippingAddressForm current={shippingAddress} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
