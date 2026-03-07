'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getJudgeForShipping, generateJudgeShippingLabel } from '@/app/actions';

const QrScanner = dynamic(
  async () => (await import('@yudiel/react-qr-scanner')).QrScanner,
  { ssr: false }
);

interface JudgePreview {
  id: string;
  name: string;
  email: string;
  type: string;
  address: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  dhl_tracking_number: string | null;
  dhl_label_url: string | null;
  label_generated_at: string | null;
  label_generation_error: string | null;
}

const TYPE_BADGE: Record<string, string> = {
  pro: 'bg-purple-100 text-purple-800',
  community: 'bg-blue-100 text-blue-800',
  supplier: 'bg-orange-100 text-orange-800',
};

function hasCompleteAddress(judge: JudgePreview): boolean {
  return !!(judge.address && judge.city && judge.postal_code && judge.country);
}

export default function DhlLabelScanner() {
  const [scanningEnabled, setScanningEnabled] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const [scannedInput, setScannedInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [judge, setJudge] = useState<JudgePreview | null>(null);
  const [labelResult, setLabelResult] = useState<{ trackingNumber?: string; labelUrl?: string; error?: string } | null>(null);
  const [lastProcessedScan, setLastProcessedScan] = useState<{ value: string; timestamp: number } | null>(null);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsCameraSupported(Boolean(navigator.mediaDevices?.getUserMedia));
    }
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  const showTimedMessage = useCallback((message: string, duration = 5000) => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    setScanMessage(message);
    messageTimeoutRef.current = setTimeout(() => setScanMessage(null), duration);
  }, []);

  const handleScan = useCallback(async (rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;

    const now = Date.now();
    if (lastProcessedScan && lastProcessedScan.value === value && now - lastProcessedScan.timestamp < 1500) return;
    setLastProcessedScan({ value, timestamp: now });

    // Extract UUID — judge QR codes are plain UUIDs
    const uuidMatch = value.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (!uuidMatch) {
      showTimedMessage('❌ Not a valid judge QR code. Expected a judge UUID.', 5000);
      return;
    }

    const judgeId = uuidMatch[1];
    setIsLookingUp(true);
    setJudge(null);
    setLabelResult(null);
    setScanMessage(null);

    const result = await getJudgeForShipping(judgeId);
    setIsLookingUp(false);

    if (result.error || !result.judge) {
      showTimedMessage(`❌ ${result.error || 'Judge not found'}`, 6000);
      return;
    }

    setJudge(result.judge);
    // Auto-disable scanners once judge is found
    setScanningEnabled(false);
    setCameraActive(false);
  }, [lastProcessedScan, showTimedMessage]);

  const handleGenerate = async () => {
    if (!judge) return;
    setIsGenerating(true);
    setLabelResult(null);

    const result = await generateJudgeShippingLabel(judge.id);
    setIsGenerating(false);

    if (result.success) {
      setJudge((prev) => prev ? { ...prev, dhl_tracking_number: result.trackingNumber || null, dhl_label_url: result.labelUrl || null } : prev);
      setLabelResult({ trackingNumber: result.trackingNumber, labelUrl: result.labelUrl });
    } else {
      setLabelResult({ error: result.error });
    }
  };

  // Hardware scanner keyboard listener
  useEffect(() => {
    if (!scanningEnabled) return;

    const handleKeyPress = async (e: KeyboardEvent) => {
      if (e.key === 'Enter' && scannedInput.trim()) {
        e.preventDefault();
        await handleScan(scannedInput);
        setScannedInput('');
      } else if (e.key === 'Backspace') {
        setScannedInput((prev) => prev.slice(0, -1));
      } else if (e.key.length === 1) {
        setScannedInput((prev) => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [scanningEnabled, scannedInput, handleScan]);

  const handleToggleHardware = () => {
    const next = !scanningEnabled;
    setScanningEnabled(next);
    if (next) {
      setCameraActive(false);
      setCameraError(null);
    } else {
      setScannedInput('');
    }
  };

  const handleToggleCamera = async () => {
    if (cameraActive) {
      setCameraActive(false);
      setCameraError(null);
      return;
    }
    if (!isCameraSupported) {
      setCameraError('Camera access is not supported on this device.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setScanningEnabled(false);
      setScannedInput('');
      setCameraActive(true);
    } catch (err) {
      setCameraError(`Unable to access camera: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleClear = () => {
    setJudge(null);
    setLabelResult(null);
    setScanMessage(null);
    setScannedInput('');
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Scan Judge Label</h3>
        <p className="mt-1 text-sm text-gray-600">
          Scan a judge QR code to look up their details and generate a DHL shipping label.
        </p>
      </div>

      {/* Scanner controls */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleToggleHardware}
            disabled={isLookingUp}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition ${
              scanningEnabled
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            } disabled:opacity-50`}
          >
            {scanningEnabled ? '🟢 Hardware Scanner Active' : 'Use Hardware QR Scanner'}
          </button>
          <button
            onClick={() => void handleToggleCamera()}
            disabled={!isCameraSupported || isLookingUp}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition ${
              cameraActive
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {cameraActive ? '📷 Camera Active' : 'Use Camera QR Scanner'}
          </button>
        </div>

        {scanningEnabled && (
          <div className="rounded-lg bg-white border border-blue-200 px-3 py-2 text-sm">
            <p className="font-medium text-blue-900">🔍 Ready — scan a judge QR code</p>
            <p className="mt-0.5 text-xs text-blue-700">Buffer: {scannedInput || '(waiting…)'}</p>
          </div>
        )}

        {cameraActive && (
          <div className="overflow-hidden rounded-xl border border-gray-300 bg-black">
            <QrScanner
              constraints={{ facingMode: { ideal: 'environment' } }}
              onDecode={(result) => { void handleScan(result); }}
              onError={(err) => {
                if (!err) return;
                setCameraError(err instanceof Error ? err.message : typeof err === 'string' ? err : 'Camera error');
              }}
            />
          </div>
        )}

        {cameraError && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{cameraError}</div>
        )}
      </div>

      {/* Scan message */}
      {scanMessage && (
        <div className={`rounded-lg border p-3 text-sm font-medium ${
          scanMessage.includes('❌') ? 'bg-red-50 border-red-300 text-red-800' : 'bg-blue-50 border-blue-300 text-blue-800'
        }`}>
          {scanMessage}
        </div>
      )}

      {/* Loading */}
      {isLookingUp && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 animate-pulse">
          Looking up judge…
        </div>
      )}

      {/* Judge preview */}
      {judge && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-gray-900">{judge.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_BADGE[judge.type] || 'bg-gray-100 text-gray-700'}`}>
                  {judge.type}
                </span>
              </div>
              <p className="text-sm text-gray-500">{judge.email}</p>
            </div>
            <button
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear
            </button>
          </div>

          {/* Address */}
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Shipping Address</p>
            {hasCompleteAddress(judge) ? (
              <div className="text-gray-800 space-y-0.5">
                {judge.address_line2 && <p className="text-gray-500">{judge.address_line2}</p>}
                <p>{judge.address}</p>
                <p>{judge.postal_code} {judge.city}</p>
                <p>{judge.country}</p>
              </div>
            ) : (
              <p className="text-orange-700 font-medium">⚠ Address incomplete — judge must fill in their address first</p>
            )}
          </div>

          {/* Existing label */}
          {judge.dhl_tracking_number && !labelResult && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm space-y-1">
              <p className="font-semibold text-green-800">✓ Label already generated</p>
              <p className="font-mono text-green-700">{judge.dhl_tracking_number}</p>
              {judge.dhl_label_url && (
                <a href={judge.dhl_label_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                  Download label ↗
                </a>
              )}
            </div>
          )}

          {/* Previous error */}
          {judge.label_generation_error && !judge.dhl_tracking_number && !labelResult && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Previous error: {judge.label_generation_error}
            </div>
          )}

          {/* Label result */}
          {labelResult && (
            <div className={`rounded-lg border px-4 py-3 text-sm space-y-1 ${
              labelResult.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'
            }`}>
              {labelResult.error ? (
                <p className="font-medium">❌ {labelResult.error}</p>
              ) : (
                <>
                  <p className="font-semibold">✓ DHL label generated</p>
                  <p className="font-mono">{labelResult.trackingNumber}</p>
                  {labelResult.labelUrl && (
                    <a href={labelResult.labelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                      Download label ↗
                    </a>
                  )}
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {!labelResult?.trackingNumber && (
              <button
                onClick={() => void handleGenerate()}
                disabled={!hasCompleteAddress(judge) || isGenerating}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? 'Generating…' : judge.dhl_tracking_number ? 'Regenerate DHL Label' : 'Generate DHL Label'}
              </button>
            )}
            {(labelResult?.trackingNumber || judge.dhl_tracking_number) && !labelResult?.error && (
              <button
                onClick={() => void handleGenerate()}
                disabled={isGenerating}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {isGenerating ? 'Regenerating…' : 'Regenerate'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
