'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import jsQR from 'jsqr';
import { createClient } from '@/lib/supabase/client';
import { lookupSauceByCodeForJudge } from '@/app/actions';


const QrScanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then(mod => mod.QrScanner),
  { ssr: false }
);

export default function ScanPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

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
    // Auto-create session from logged-in user
    const initializeSession = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user?.email) {
          console.error('Auth error:', userError);
          router.push('/login');
          return;
        }

        // Get judge info
        const { data: judge, error: judgeError } = await supabase
          .from('judges')
          .select('id, type, stripe_payment_status')
          .ilike('email', user.email)
          .single();

        if (judgeError || !judge) {
          console.error('Judge lookup error:', judgeError);
          router.push('/dashboard');
          return;
        }

        // Create/update session automatically (only in browser)
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('activeJudgeSession', JSON.stringify({
            judgeId: judge.id,
            email: user.email,
            timestamp: Date.now()
          }));
        }

        setIsCheckingSession(false);
      } catch (err) {
        console.error('Session initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize session');
        setIsCheckingSession(false);
      }
    };

    initializeSession();
  }, [router]);

  const handlePhotoCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoInputRef.current) photoInputRef.current.value = '';

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); setError('Could not read image.'); return; }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code?.data) {
        handleDecode(code.data);
      } else {
        setError('No QR code found in photo. Try again with better lighting or angle.');
      }
    };

    img.onerror = () => { URL.revokeObjectURL(url); setError('Could not load image.'); };
    img.src = url;
  }, [handleDecode]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim() || isManualSubmitting) return;
    setIsManualSubmitting(true);
    setError(null);

    const result = await lookupSauceByCodeForJudge(manualCode.trim());
    if ('error' in result) {
      setError(result.error ?? 'Sauce not found');
      setIsManualSubmitting(false);
      return;
    }

    router.push(`/judge/score/${result.sauceId}`);
  };

  if (isCheckingSession) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Preparing scanner...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Scan Sauce QR Code</h1>
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
      <p className="mt-4 text-gray-700 font-medium">Point your camera at the QR code on the sauce bottle.</p>

      <div className="mt-4 max-w-md mx-auto">
        <p className="text-sm text-gray-500 mb-2">Live scanner not working? Take a photo instead:</p>
        <label className="cursor-pointer inline-block w-full rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center">
          📸 Take Photo to Scan
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => void handlePhotoCapture(e)}
          />
        </label>
      </div>

      <div className="mt-4 max-w-md mx-auto">
        <p className="text-sm text-gray-500 mb-2">Scanner not working? Enter the sauce code manually:</p>
        <form onSubmit={(e) => void handleManualSubmit(e)} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            placeholder="e.g. H027"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono uppercase placeholder:normal-case placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isManualSubmitting}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!manualCode.trim() || isManualSubmitting}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isManualSubmitting ? 'Finding...' : 'Go'}
          </button>
        </form>
      </div>
    </div>
  );
}
