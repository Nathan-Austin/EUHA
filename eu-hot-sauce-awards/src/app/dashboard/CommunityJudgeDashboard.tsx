import Link from 'next/link';

export default function CommunityJudgeDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Community Judge Dashboard</h2>
        <p className="mt-2 text-gray-600">Welcome! Your payment has been confirmed and you&apos;re ready to judge.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/judge/scan"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
          <p className="text-sm text-gray-600">Scan a sauce bottle to start judging</p>
        </Link>

        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Your Scores</h3>
          <p className="text-sm text-gray-600">View and manage your submitted scores</p>
        </div>
      </div>
    </div>
  );
}
