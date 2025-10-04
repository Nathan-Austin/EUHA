'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const QrScanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then(mod => mod.QrScanner),
  { ssr: false }
);

export default function ScanPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const handleDecode = useCallback(
    (value: string | null) => {
      if (!value || isProcessing) {
        return;
      }

      setIsProcessing(true);
      setError(null);

      const trimmedValue = value.trim();

      // Check if this is a sauce URL (contains /judge/score/ pattern)
      const sauceUrlMatch = trimmedValue.match(/\/judge\/score\/([a-f0-9-]+)/i);

      if (sauceUrlMatch) {
        // Extract sauce ID from URL
        const sauceId = sauceUrlMatch[1];
        router.push(`/judge/score/${sauceId}`);
      } else {
        // Check if it's a plain UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (uuidRegex.test(trimmedValue)) {
          router.push(`/judge/score/${trimmedValue}`);
        } else {
          setError('Invalid QR code. Please scan an official sauce QR code.');
          setIsProcessing(false);
        }
      }
    },
    [isProcessing, router]
  );

  const handleError = useCallback((scanError: unknown) => {
    if (scanError instanceof Error && scanError.name !== 'NotFoundException') {
      setError(scanError.message);
    }
  }, []);

  useEffect(() => {
    // Check if active judge session exists
    const sessionData = localStorage.getItem('activeJudgeSession');
    if (!sessionData) {
      router.push('/judge/start');
      return;
    }

    // Session exists, allow scanning
    setIsCheckingSession(false);
  }, [router]);

  if (isCheckingSession) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying session...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Scan Sauce QR Code</h1>
      <div className="max-w-md mx-auto bg-gray-200 rounded-lg overflow-hidden shadow-lg">
        <QrScanner
          onDecode={handleDecode}
          onError={handleError}
          constraints={{ facingMode: 'environment' }}
          containerStyle={{ width: '100%' }}
        />
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}
      <p className="mt-4 text-gray-600">Point your camera at the QR code on the sauce bottle.</p>
    </div>
  );
}
