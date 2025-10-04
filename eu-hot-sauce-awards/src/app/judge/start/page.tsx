'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';

const QrScanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then(mod => mod.QrScanner),
  { ssr: false }
);

export default function JudgeStartPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ email: string; judgeId: string } | null>(null);

  useEffect(() => {
    // Check if user is logged in and is a judge
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.email) {
        router.push('/login');
        return;
      }

      // Get judge info
      const { data: judge, error: judgeError } = await supabase
        .from('judges')
        .select('id, type, active, stripe_payment_status')
        .eq('email', user.email)
        .single();

      if (judgeError || !judge) {
        setError('You are not registered as a judge. Please contact support.');
        setIsVerifying(false);
        return;
      }

      // Check if judge is allowed to judge
      if (judge.type === 'community' && judge.stripe_payment_status !== 'succeeded') {
        setError('Payment required. Please complete payment before judging.');
        setIsVerifying(false);
        return;
      }

      if (!judge.active && judge.type !== 'admin') {
        setError('Your judge account is not active. Please contact support.');
        setIsVerifying(false);
        return;
      }

      setCurrentUser({ email: user.email, judgeId: judge.id });
      setIsVerifying(false);
    };

    checkAuth();
  }, [router]);

  const handleDecode = useCallback(
    async (value: string | null) => {
      if (!value || isProcessing || !currentUser) {
        return;
      }

      setIsProcessing(true);
      setError(null);

      const trimmedValue = value.trim();

      // Extract UUID from the scanned value (judge QR codes are just UUIDs)
      const uuidMatch = trimmedValue.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      const scannedJudgeId = uuidMatch ? uuidMatch[1] : trimmedValue;

      // Verify this is the correct judge's QR code
      if (scannedJudgeId !== currentUser.judgeId) {
        setError(`This is not your judge QR code. Please scan the QR code assigned to ${currentUser.email}`);
        setIsProcessing(false);
        return;
      }

      // Store active judge session in localStorage
      localStorage.setItem('activeJudgeSession', JSON.stringify({
        judgeId: currentUser.judgeId,
        email: currentUser.email,
        timestamp: Date.now()
      }));

      // Redirect to confirmation
      router.push('/judge/ready');
    },
    [isProcessing, currentUser, router]
  );

  const handleError = useCallback((scanError: unknown) => {
    if (scanError instanceof Error && scanError.name !== 'NotFoundException') {
      setError(scanError.message);
    }
  }, []);

  if (isVerifying) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying your access...</h1>
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="max-w-md mx-auto bg-red-50 border border-red-300 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-red-800">Access Denied</h1>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Scan Your Judge QR Code</h1>
      <p className="text-gray-700 mb-6">
        Logged in as: <span className="font-semibold text-gray-900">{currentUser?.email}</span>
      </p>
      <div className="max-w-md mx-auto bg-gray-200 rounded-lg overflow-hidden shadow-lg">
        <QrScanner
          onDecode={handleDecode}
          onError={handleError}
          constraints={{ facingMode: 'environment' }}
          containerStyle={{ width: '100%' }}
        />
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md border border-red-300">
          <p className="font-medium">{error}</p>
        </div>
      )}
      <p className="mt-4 text-gray-700 font-medium">
        Point your camera at your judge QR code label to start your judging session.
      </p>
    </div>
  );
}
