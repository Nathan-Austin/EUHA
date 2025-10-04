'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function JudgeReadyPage() {
  const router = useRouter();
  const [judgeEmail, setJudgeEmail] = useState<string>('');

  useEffect(() => {
    // Check if judge session exists
    const sessionData = localStorage.getItem('activeJudgeSession');
    if (!sessionData) {
      router.push('/judge/start');
      return;
    }

    const session = JSON.parse(sessionData);
    setJudgeEmail(session.email);
  }, [router]);

  return (
    <div className="container mx-auto p-4 text-center">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-green-800">You're Ready to Judge!</h1>

        <p className="text-lg text-gray-700 mb-2">
          Judge: <span className="font-semibold">{judgeEmail}</span>
        </p>

        <p className="text-gray-600 mb-8">
          Your judging session is now active. You can start scanning sauce QR codes to begin scoring.
        </p>

        <div className="space-y-4">
          <Link
            href="/judge/scan"
            className="block w-full px-6 py-4 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
          >
            Start Scanning Sauces
          </Link>

          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t text-sm text-gray-600">
          <p className="mb-2"><strong>Important Notes:</strong></p>
          <ul className="text-left space-y-1 max-w-md mx-auto">
            <li>• You have 12 sauces to judge</li>
            <li>• Your scores are saved automatically as you go</li>
            <li>• You can pause and resume judging at any time</li>
            <li>• Each sauce can only be scored once</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
