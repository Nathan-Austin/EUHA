'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { lookupSupplierByTracking, markPackageReceived } from '@/app/actions';

const QrScanner = dynamic(
  async () => (await import('@yudiel/react-qr-scanner')).QrScanner,
  { ssr: false }
);

interface SupplierMatch {
  id: string;
  brandName: string;
  email: string;
  trackingNumber: string | null;
  postalServiceName: string | null;
  packageStatus: string;
  packageReceivedAt: string | null;
}

export default function PackageReceiveScanner() {
  const [scanningEnabled, setScanningEnabled] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const [scannedInput, setScannedInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [supplier, setSupplier] = useState<SupplierMatch | null>(null);
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

    setIsLookingUp(true);
    setSupplier(null);
    setScanMessage(null);

    const result = await lookupSupplierByTracking(value);
    setIsLookingUp(false);

    if (result.error || !result.supplier) {
      showTimedMessage(`Not found: ${result.error || 'No match'}`, 6000);
      return;
    }

    setSupplier(result.supplier);
    setScanningEnabled(false);
    setCameraActive(false);
  }, [lastProcessedScan, showTimedMessage]);

  const handleMarkReceived = async () => {
    if (!supplier) return;
    setIsMarking(true);

    const result = await markPackageReceived(supplier.id);
    setIsMarking(false);

    if (result.error) {
      showTimedMessage(`Error: ${result.error}`, 6000);
    } else {
      setSupplier((prev) => prev ? { ...prev, packageStatus: 'received', packageReceivedAt: new Date().toISOString() } : prev);
      showTimedMessage(`Package from ${result.brandName} marked as received!`, 8000);
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
    setSupplier(null);
    setScanMessage(null);
    setScannedInput('');
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Scan Incoming Package</h3>
        <p className="mt-1 text-sm text-gray-600">
          Scan the QR or barcode on an arriving package to match it to a supplier and mark it as received.
        </p>
      </div>

      {/* Scanner controls */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 space-y-3">
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
            {scanningEnabled ? '🟢 Hardware Scanner Active' : 'Use Hardware Scanner'}
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
            {cameraActive ? '📷 Camera Active' : 'Use Camera Scanner'}
          </button>
        </div>

        {scanningEnabled && (
          <div className="rounded-lg bg-white border border-orange-200 px-3 py-2 text-sm">
            <p className="font-medium text-orange-900">🔍 Ready — scan the package barcode or QR code</p>
            <p className="mt-0.5 text-xs text-orange-700">Buffer: {scannedInput || '(waiting…)'}</p>
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
          scanMessage.startsWith('Not found') || scanMessage.startsWith('Error')
            ? 'bg-red-50 border-red-300 text-red-800'
            : 'bg-green-50 border-green-300 text-green-800'
        }`}>
          {scanMessage}
        </div>
      )}

      {/* Loading */}
      {isLookingUp && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 animate-pulse">
          Looking up tracking number…
        </div>
      )}

      {/* Supplier match */}
      {supplier && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-gray-900">{supplier.brandName}</p>
              <p className="text-sm text-gray-500">{supplier.email}</p>
            </div>
            <button
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear
            </button>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tracking Info</p>
            {supplier.trackingNumber && (
              <p className="font-mono text-gray-800">{supplier.trackingNumber}</p>
            )}
            {supplier.postalServiceName && (
              <p className="text-gray-600">via {supplier.postalServiceName}</p>
            )}
          </div>

          {supplier.packageStatus === 'received' ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm">
              <p className="font-semibold text-green-800">Package already marked as received</p>
              {supplier.packageReceivedAt && (
                <p className="text-green-700 text-xs mt-0.5">
                  {new Date(supplier.packageReceivedAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => void handleMarkReceived()}
              disabled={isMarking}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isMarking ? 'Marking as received…' : 'Mark Package as Received'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
