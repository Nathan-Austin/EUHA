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
}

export default function CommunityJudgeDashboard({ shippingAddress, trackingNumber, labelUrl }: Props) {
  const router = useRouter();
  const [storedScores, setStoredScores] = useState<StoredScore[]>([]);
  const [scoredSauces, setScoredSauces] = useState<ScoredSauce[]>([]);
  const [totalAssigned, setTotalAssigned] = useState<number>(0);
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
            {totalAssigned === 0 ? (
              <span className="font-semibold text-yellow-400">Check back here once your judging box arrives</span>
            ) : (
              <><span className="font-semibold text-orange-400">{scoredSauces.length}/{totalAssigned}</span> sauces judged</>
            )}
          </p>
        </div>
        {totalAssigned > 0 && scoredSauces.length < totalAssigned && (
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
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Completed Scores</h3>
        {scoredSauces.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {scoredSauces.map((sauce) => (
              <div
                key={sauce.sauceId}
                className="px-3 py-2 bg-green-50 border border-green-300 rounded-lg text-center"
              >
                <p className="text-sm font-semibold text-green-800">{sauce.sauceCode}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300 text-sm sm:text-base">No sauces scored yet. Scan a QR code to begin.</p>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-center text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-center text-green-400">{success}</p>}

      {/* Results announcement CTA */}
      <div className="pt-4 border-t border-gray-300">
        <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-4">
          <p className="text-sm font-semibold text-white mb-1">Find out when the winners are announced</p>
          <p className="text-xs text-gray-400 mb-3">
            Republic of Heat will reveal the results and present the winners on their social channels. Follow along so you don&apos;t miss it.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://www.instagram.com/republicofheat?utm_source=euha&utm_medium=judging_app&utm_campaign=euha_2026&utm_content=results_followcta"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Instagram
            </a>
            <a
              href="https://www.youtube.com/@republicofheat?utm_source=euha&utm_medium=judging_app&utm_campaign=euha_2026&utm_content=results_followcta"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              YouTube
            </a>
            <a
              href="https://republicofheat.com/en/about?utm_source=euha&utm_medium=judging_app&utm_campaign=euha_2026&utm_content=results_newsletter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
            >
              Sign up for newsletter →
            </a>
          </div>
        </div>
      </div>

      <RohFollowCTA />

      {/* DHL Tracking */}
      {trackingNumber && (
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

      {/* Shipping address */}
      <div className="pt-4 border-t border-gray-300 space-y-4">
        <ShippingAddressDisplay address={shippingAddress} />
        {!trackingNumber && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <JudgeShippingAddressForm current={shippingAddress} />
          </div>
        )}
      </div>
    </div>
  );
}
