"use client";

import { useEffect, useState } from "react";
import { getPackingStatus, recordBottleScan, manuallyMarkAsBoxed, type SaucePackingStatus } from "../actions";

export default function AdminBoxPacker() {
  const [sauces, setSauces] = useState<SaucePackingStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scanningEnabled, setScanningEnabled] = useState(false);
  const [scannedInput, setScannedInput] = useState("");

  const loadPackingStatus = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getPackingStatus();

    if ('error' in result) {
      setError(result.error || 'Failed to load packing status');
      setIsLoading(false);
      return;
    }

    setSauces(result.sauces || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPackingStatus();
  }, []);

  useEffect(() => {
    if (!scanningEnabled) return;

    const handleKeyPress = async (e: KeyboardEvent) => {
      // QR scanners typically send characters followed by Enter
      if (e.key === 'Enter' && scannedInput.trim()) {
        e.preventDefault();

        // Extract sauce ID from scanned input
        // Assuming QR codes contain URLs like /judge/score/{sauceId}
        const match = scannedInput.match(/\/judge\/score\/([a-f0-9-]+)/i) ||
                      scannedInput.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);

        const sauceId = match ? match[1] : scannedInput.trim();

        setScannedInput("");
        setScanMessage(null);

        // Record the scan
        const result = await recordBottleScan(sauceId);

        if ('error' in result) {
          setScanMessage(`❌ Error: ${result.error}`);
        } else {
          setScanMessage(result.message || 'Scan recorded');

          // Reload status to update counts
          await loadPackingStatus();
        }

        // Clear message after 5 seconds
        setTimeout(() => setScanMessage(null), 5000);
      } else if (e.key.length === 1 || e.key === 'Backspace') {
        // Build up the scanned string
        if (e.key === 'Backspace') {
          setScannedInput(prev => prev.slice(0, -1));
        } else {
          setScannedInput(prev => prev + e.key);
        }
      }
    };

    if (scanningEnabled) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [scanningEnabled, scannedInput]);

  const handleManualMarkAsBoxed = async (sauceId: string) => {
    if (!confirm('Are you sure you want to manually mark this sauce as boxed? This will skip the 7-scan requirement.')) {
      return;
    }

    const result = await manuallyMarkAsBoxed(sauceId);

    if ('error' in result) {
      setError(result.error || 'Failed to mark as boxed');
    } else {
      setScanMessage('✓ Sauce manually marked as boxed');
      await loadPackingStatus();
    }
  };

  const completedSauces = sauces.filter(s => s.scanCount >= 7);
  const incompleteSauces = sauces.filter(s => s.scanCount < 7);

  return (
    <div className="space-y-4 rounded-3xl border border-white/15 bg-white/[0.05] p-8 backdrop-blur">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Box Packing Scanner</h3>
        <button
          onClick={() => loadPackingStatus()}
          disabled={isLoading}
          className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Scan sauce bottle QR codes to track packing progress. Each sauce needs 7 bottles scanned before being marked as boxed.
      </p>

      {/* Scanner Toggle */}
      <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <button
          onClick={() => setScanningEnabled(!scanningEnabled)}
          className={`px-6 py-3 rounded-lg font-semibold text-sm transition ${
            scanningEnabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {scanningEnabled ? '🟢 Scanner Active' : 'Start Scanning'}
        </button>

        {scanningEnabled && (
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-900">Scanner ready - scan bottle QR codes</div>
            <div className="text-xs text-blue-600 mt-1">Scanned buffer: {scannedInput || '(waiting...)'}</div>
          </div>
        )}
      </div>

      {/* Scan Messages */}
      {scanMessage && (
        <div className={`p-4 rounded-lg border ${
          scanMessage.includes('❌')
            ? 'bg-red-50 border-red-200 text-red-800'
            : scanMessage.includes('BOXED')
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="font-semibold">{scanMessage}</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{sauces.length}</div>
          <div className="text-sm text-gray-600">Total Sauces</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">{completedSauces.length}</div>
          <div className="text-sm text-green-700">Completed (7/7)</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-700">{incompleteSauces.length}</div>
          <div className="text-sm text-yellow-700">In Progress</div>
        </div>
      </div>

      {/* Incomplete Sauces */}
      {incompleteSauces.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-3 text-yellow-700">📦 In Progress ({incompleteSauces.length})</h4>
          <div className="space-y-2">
            {incompleteSauces.map((sauce) => (
              <div key={sauce.sauceId} className="bg-white border rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
                      {sauce.sauceCode}
                    </span>
                    <span className="font-medium">{sauce.sauceName}</span>
                    <span className="text-sm text-gray-500">by {sauce.brandName}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(sauce.scanCount / 7) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {sauce.scanCount}/7
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleManualMarkAsBoxed(sauce.sauceId)}
                  className="ml-4 px-4 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Mark Boxed
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Sauces */}
      {completedSauces.length > 0 && (
        <div>
          <h4 className="font-semibold text-lg mb-3 text-green-700">✅ Completed ({completedSauces.length})</h4>
          <div className="space-y-2">
            {completedSauces.map((sauce) => (
              <div key={sauce.sauceId} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold bg-green-100 px-2 py-1 rounded">
                    {sauce.sauceCode}
                  </span>
                  <span className="font-medium text-green-900">{sauce.sauceName}</span>
                  <span className="text-sm text-green-700">by {sauce.brandName}</span>
                  <span className="ml-auto text-xs font-semibold text-green-700">
                    {sauce.scanCount}/7 ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sauces.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No sauces with status "arrived" found. Update sauce statuses in the Sauce Management section.
        </div>
      )}
    </div>
  );
}
