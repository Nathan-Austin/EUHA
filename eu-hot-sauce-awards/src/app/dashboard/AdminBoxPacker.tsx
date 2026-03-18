"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { getPackingStatus, recordBottleScan, manuallyMarkAsBoxed, checkConflictOfInterest, checkProCoverage, getJudgeBoxAssignments, removeBoxAssignment, lookupSauceByCode, type SaucePackingStatus, type JudgeBoxAssignment } from "../actions";

const QrScanner = dynamic(
  async () => (await import("@yudiel/react-qr-scanner")).QrScanner,
  { ssr: false }
);

const BOX_TARGET = 12;

export default function AdminBoxPacker() {
  const [sauces, setSauces] = useState<SaucePackingStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scanningEnabled, setScanningEnabled] = useState(false);
  const [scannedInput, setScannedInput] = useState("");
  const [currentJudgeId, setCurrentJudgeId] = useState<string | null>(null);
  const [currentJudgeName, setCurrentJudgeName] = useState<string | null>(null);
  const [currentJudgeType, setCurrentJudgeType] = useState<string | null>(null);
  const [boxSauces, setBoxSauces] = useState<JudgeBoxAssignment[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const [lastProcessedScan, setLastProcessedScan] = useState<{ value: string; timestamp: number } | null>(null);
  const [removeModal, setRemoveModal] = useState<JudgeBoxAssignment | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentJudgeIdRef = useRef<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const loadPackingStatus = useCallback(async () => {
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
  }, []);

  const clearScanMessage = useCallback(() => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
    setScanMessage(null);
  }, []);

  const showTimedMessage = useCallback((message: string, duration = 5000) => {
    clearScanMessage();
    setScanMessage(message);
    messageTimeoutRef.current = setTimeout(() => {
      setScanMessage(null);
      messageTimeoutRef.current = null;
    }, duration);
  }, [clearScanMessage]);

  const loadJudgeBoxAssignments = useCallback(async (judgeId: string): Promise<{ assignments: JudgeBoxAssignment[]; judgeName?: string; judgeType?: string; error?: string }> => {
    if (!judgeId) {
      setBoxSauces([]);
      return { assignments: [], judgeName: undefined, judgeType: undefined, error: 'No judge selected' };
    }

    const result = await getJudgeBoxAssignments(judgeId);

    if ('error' in result) {
      setBoxSauces([]);
      return { assignments: [], judgeName: undefined, judgeType: undefined, error: result.error || 'Unable to load box assignments' };
    }

    const assignments = result.assignments || [];
    const judgeLabel = result.judgeName || `Judge ${judgeId.substring(0, 8)}`;
    const judgeType = result.judgeType || 'unknown';
    setBoxSauces(assignments);
    setCurrentJudgeName(judgeLabel);
    setCurrentJudgeType(judgeType);

    return { assignments, judgeName: judgeLabel, judgeType };
  }, []);

  const resetJudgeContext = useCallback(() => {
    setCurrentJudgeId(null);
    currentJudgeIdRef.current = null;
    setCurrentJudgeName(null);
    setCurrentJudgeType(null);
    setBoxSauces([]);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    void loadPackingStatus();
  }, [loadPackingStatus]);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const supported = Boolean(navigator.mediaDevices?.getUserMedia);
      setIsCameraSupported(supported);
      if (!supported) {
        setCameraActive(false);
      }
    }
  }, []);

  const handleScan = useCallback(async (rawValue: string) => {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) {
      return;
    }

    const now = Date.now();
    if (
      lastProcessedScan &&
      lastProcessedScan.value === trimmedValue &&
      now - lastProcessedScan.timestamp < 1500
    ) {
      return;
    }

    setLastProcessedScan({ value: trimmedValue, timestamp: now });

    // Check if this is a sauce QR code (contains /judge/score/ URL pattern)
    const sauceUrlMatch = trimmedValue.match(/\/judge\/score\/([a-f0-9-]+)/i);

    // If it's a sauce URL but we don't have a judge yet, show error
    if (sauceUrlMatch && !currentJudgeIdRef.current) {
      showTimedMessage('❌ Please scan a judge QR code first before scanning sauces.', 5000);
      return;
    }

    // If no judge selected yet, treat this as a judge scan
    if (!currentJudgeIdRef.current) {
      // Extract UUID from plain value (judge QR codes are just UUIDs)
      const judgeIdMatch = trimmedValue.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      const judgeId = judgeIdMatch ? judgeIdMatch[1] : trimmedValue;

      setCurrentJudgeId(judgeId);
      currentJudgeIdRef.current = judgeId;
      setBoxSauces([]);
      const assignmentInfo = await loadJudgeBoxAssignments(judgeId);
      const judgeLabel = assignmentInfo?.judgeName || `Judge ${judgeId.substring(0, 8)}`;
      setCurrentJudgeName(judgeLabel);
      const assignedCount = assignmentInfo?.assignments.length ?? 0;

      if (assignmentInfo?.error) {
        showTimedMessage(`⚠️ ${assignmentInfo.error}. Scanned: "${trimmedValue.substring(0, 50)}". Extracted ID: "${judgeId}"`, 10000);
      } else {
        showTimedMessage(`✓ ${judgeLabel} scanned. Box currently has ${assignedCount}/${BOX_TARGET} sauces. Start scanning bottles.`, 6000);
      }
      return;
    }

    // We have a judge, now scan the sauce
    const sauceId = sauceUrlMatch ? sauceUrlMatch[1] : trimmedValue;
    const activeJudgeId = currentJudgeIdRef.current!;

    // Check if we're accidentally scanning a judge QR code instead of a sauce
    const isPossiblyJudgeQR = !sauceUrlMatch && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(trimmedValue);
    if (isPossiblyJudgeQR && trimmedValue === activeJudgeId) {
      showTimedMessage('⚠️ You scanned the same judge QR code again. Please scan a sauce QR code.', 4000);
      return;
    }

    const conflictCheck = await checkConflictOfInterest(activeJudgeId, sauceId);

    if ('error' in conflictCheck) {
      showTimedMessage(`❌ Error: ${conflictCheck.error}`, 6000);
      return;
    }

    if (conflictCheck.conflict) {
      showTimedMessage(conflictCheck.message || '⚠️ Conflict of interest detected!', 8000);
      return;
    }

    const coverageCheck = await checkProCoverage(activeJudgeId, sauceId);

    if ('error' in coverageCheck) {
      showTimedMessage(`❌ Error: ${coverageCheck.error}`, 6000);
      return;
    }

    if (coverageCheck.warning) {
      showTimedMessage(coverageCheck.message || '⚠️ Pro coverage warning!', 10000);
      return;
    }

    const result = await recordBottleScan(activeJudgeId, sauceId);

    if ('error' in result) {
      showTimedMessage(`❌ Error: ${result.error}`, 6000);
      return;
    }

    const assignmentInfo = await loadJudgeBoxAssignments(activeJudgeId);
    const judgeLabel = assignmentInfo?.judgeName ?? result.judgeName ?? currentJudgeName ?? `Judge ${activeJudgeId.substring(0, 8)}`;
    setCurrentJudgeName(judgeLabel);

    if (assignmentInfo?.error) {
      const fallback = result.message || `Scan recorded for ${judgeLabel}`;
      showTimedMessage(`⚠️ ${assignmentInfo.error}. ${fallback}`, 7000);
    } else {
      const messageParts = [result.boxMessage, result.message].filter(Boolean);
      const finalMessage = messageParts.length > 0 ? messageParts.join(' • ') : `✓ ${judgeLabel}: scan recorded`;
      showTimedMessage(finalMessage, 7000);
    }

    await loadPackingStatus();
  }, [currentJudgeId, currentJudgeName, lastProcessedScan, loadJudgeBoxAssignments, loadPackingStatus, showTimedMessage]);

  useEffect(() => {
    if (!scanningEnabled) {
      return;
    }

    const handleKeyPress = async (e: KeyboardEvent) => {
      // QR scanners typically send characters followed by Enter
      if (e.key === 'Enter' && scannedInput.trim()) {
        e.preventDefault();
        clearScanMessage();

        await handleScan(scannedInput);

        setScannedInput("");
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
  }, [scanningEnabled, scannedInput, clearScanMessage, handleScan]);

  const handleToggleHardwareScanner = useCallback(() => {
    const nextState = !scanningEnabled;
    setScanningEnabled(nextState);

    if (nextState) {
      setCameraActive(false);
      setCameraError(null);
    } else {
      resetJudgeContext();
      setScannedInput("");
      clearScanMessage();
    }
  }, [clearScanMessage, resetJudgeContext, scanningEnabled]);

  const handleToggleCamera = useCallback(async () => {
    if (cameraActive) {
      setCameraActive(false);
      setCameraError(null);
      return;
    }

    if (!isCameraSupported || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not supported on this device.');
      setIsCameraSupported(false);
      return;
    }

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
      stream.getTracks().forEach(track => track.stop());
      setScanningEnabled(false);
      setScannedInput("");
      setCameraActive(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to access camera.';
      setCameraError(`Unable to access camera: ${message}`);
    }
  }, [cameraActive, isCameraSupported]);

  const handleManualMarkAsBoxed = async (sauceId: string) => {
    if (!confirm('Are you sure you want to manually mark this sauce as boxed? This will skip the 7-scan requirement.')) {
      return;
    }

    const result = await manuallyMarkAsBoxed(sauceId);

    if ('error' in result) {
      setError(result.error || 'Failed to mark as boxed');
    } else {
      showTimedMessage('✓ Sauce manually marked as boxed', 4000);
      await loadPackingStatus();
    }
  };

  const handlePhotoCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same photo can be retried
    if (photoInputRef.current) photoInputRef.current.value = "";

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      // Upscale to max 3000px on longest side — gives jsQR more pixels for dense QR codes
      const scale = Math.min(1, 3000 / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        showTimedMessage("❌ Could not read image.", 5000);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });
      if (code?.data) {
        clearScanMessage();
        await handleScan(code.data);
      } else {
        showTimedMessage("❌ No QR code found in photo. Try moving closer to the QR code and retaking.", 5000);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      showTimedMessage("❌ Could not load image.", 5000);
    };

    img.src = url;
  }, [clearScanMessage, handleScan, showTimedMessage]);

  const handleManualCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim() || !currentJudgeId) return;
    setIsManualSubmitting(true);
    clearScanMessage();

    const lookup = await lookupSauceByCode(manualCode.trim());
    if ('error' in lookup) {
      showTimedMessage(`❌ ${lookup.error}`, 6000);
      setIsManualSubmitting(false);
      return;
    }

    await handleScan(lookup.sauceId);
    setManualCode("");
    setIsManualSubmitting(false);
  };

  const handleRemoveFromBox = async () => {
    if (!removeModal || !currentJudgeId) return;
    setIsRemoving(true);
    const result = await removeBoxAssignment(currentJudgeId, removeModal.sauceId);
    setIsRemoving(false);
    setRemoveModal(null);
    if ('error' in result) {
      setError(result.error || 'Failed to remove sauce from box');
    } else {
      await loadJudgeBoxAssignments(currentJudgeId);
      showTimedMessage(`✓ ${removeModal.sauceCode} removed from box`, 4000);
    }
  };

  const completedSauces = sauces.filter(s => s.scanCount >= 7);
  const incompleteSauces = sauces.filter(s => s.scanCount < 7);

  return (
    <div className="space-y-4 rounded-3xl border border-gray-300 bg-white p-4 sm:p-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Box Packing Scanner</h3>
        <button
          onClick={() => void loadPackingStatus()}
          disabled={isLoading}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        Scan sauce bottle QR codes to track packing progress. Each sauce needs 7 bottles scanned before being marked as boxed.
      </p>

      {/* Scanner Toggle */}
      <div className="flex flex-col gap-4 rounded-lg border border-blue-300 bg-blue-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              onClick={handleToggleHardwareScanner}
              className={`px-6 py-3 text-sm font-semibold transition rounded-lg ${
                scanningEnabled
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {scanningEnabled ? '🟢 Hardware Scanner Active' : 'Use Hardware QR Scanner'}
            </button>
            <button
              onClick={() => void handleToggleCamera()}
              disabled={!isCameraSupported}
              className={`px-6 py-3 text-sm font-semibold transition rounded-lg ${
                cameraActive
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              } ${!isCameraSupported ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {cameraActive ? '📷 Camera Scanner Active' : 'Use Camera QR Scanner'}
            </button>
            <label className="cursor-pointer px-6 py-3 text-sm font-semibold transition rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-center">
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

          {currentJudgeId && (
            <button
              onClick={() => {
                resetJudgeContext();
                showTimedMessage('Judge cleared. Scan a new judge QR code.', 3000);
              }}
              className="px-4 py-2 text-sm border border-gray-300 bg-white rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Clear Judge
            </button>
          )}
        </div>

        {scanningEnabled && (
          <div className="rounded-lg border border-blue-300 bg-white p-3 text-sm">
            <div className="font-medium text-blue-900">
              {currentJudgeId
                ? `📦 Packing ${currentJudgeType ? `[${currentJudgeType}]` : ''} box for ${currentJudgeName}`
                : '🔍 Scan judge QR code first'}
            </div>
            <div className="mt-1 text-xs text-blue-700">Scanned buffer: {scannedInput || '(waiting...)'}</div>
          </div>
        )}

        {cameraActive && (
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-xl border border-gray-300 bg-black">
              <QrScanner
                constraints={{ facingMode: { ideal: 'environment' } }}
                onDecode={(result) => {
                  void handleScan(result);
                }}
                onError={(error) => {
                  if (!error) {
                    return;
                  }
                  const message = error instanceof Error
                    ? error.message
                    : typeof error === 'string'
                      ? error
                      : 'Camera error encountered.';
                  setCameraError(message);
                }}
              />
            </div>
            <p className="text-xs text-blue-900">
              Tip: Grant camera permissions when prompted. For best results on mobile, steady the QR code within the frame.
            </p>
          </div>
        )}

        {cameraError && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {cameraError}
          </div>
        )}
      </div>

      {/* Manual sauce code entry */}
      {currentJudgeId && (
        <form onSubmit={(e) => void handleManualCodeSubmit(e)} className="flex gap-2 items-center rounded-lg border border-orange-300 bg-orange-50 p-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-orange-900 mb-1">Manual sauce entry</label>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="e.g. H027"
              className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm font-mono uppercase placeholder:normal-case placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              disabled={isManualSubmitting}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={!manualCode.trim() || isManualSubmitting}
            className="mt-5 px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {isManualSubmitting ? 'Adding...' : 'Add'}
          </button>
        </form>
      )}

      {/* Scan Messages */}
      {scanMessage && (
        <div className={`p-4 rounded-lg border ${
          scanMessage.includes('❌')
            ? 'bg-red-50 border-red-300 text-red-800'
            : scanMessage.includes('BOXED')
            ? 'bg-green-50 border-green-300 text-green-800'
            : 'bg-blue-50 border-blue-300 text-blue-800'
        }`}>
          <div className="font-semibold">{scanMessage}</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Current Box Progress */}
      {currentJudgeId && (
        <div className="p-4 bg-purple-50 border border-purple-300 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-purple-900">
              Current Box: {currentJudgeName || 'Judge selected'}
              {currentJudgeType && <span className="ml-2 text-xs font-normal bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full capitalize">{currentJudgeType}</span>}
            </h4>
            <span className="text-sm font-semibold text-purple-900">{boxSauces.length}/{BOX_TARGET} sauces</span>
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                boxSauces.length >= BOX_TARGET ? 'bg-green-600' : 'bg-purple-600'
              }`}
              style={{ width: `${Math.min((boxSauces.length / BOX_TARGET) * 100, 100)}%` }}
            />
          </div>
          {boxSauces.length >= BOX_TARGET && (
            <div className="mt-2 text-sm text-green-800 font-semibold">✓ Box complete! Scan a new judge to start another box.</div>
          )}
        </div>
      )}

      {currentJudgeId && (
        <div className="rounded-2xl border border-gray-300 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Box Contents</h4>
            <span className="text-xs font-medium text-gray-600">{boxSauces.length}/{BOX_TARGET}</span>
          </div>
          {boxSauces.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {boxSauces.map((item) => (
                <li
                  key={item.sauceId}
                  onClick={() => setRemoveModal(item)}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <span className="font-mono text-xs font-semibold bg-white border border-gray-200 px-2 py-1 rounded text-gray-900">{item.sauceCode}</span>
                  <span className="font-medium text-gray-900">{item.sauceName}</span>
                  <span className="text-xs text-gray-600">by {item.brandName}</span>
                  <span className="ml-auto text-xs text-gray-400">tap to remove</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-600">No sauces scanned for this box yet.</p>
          )}
        </div>
      )}

      {/* Progress Summary */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
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
              <div key={sauce.sauceId} className="flex flex-col gap-4 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
                      {sauce.sauceCode}
                    </span>
                    <span className="font-medium">{sauce.sauceName}</span>
                    <span className="text-sm text-gray-500">by {sauce.brandName}</span>
                  </div>
                  <div>
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
                <div className="sm:ml-4">
                  <button
                    onClick={() => handleManualMarkAsBoxed(sauce.sauceId)}
                    className="w-full sm:w-auto px-4 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    Mark Boxed
                  </button>
                </div>
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
              <div key={sauce.sauceId} className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-semibold bg-green-100 px-2 py-1 rounded">
                    {sauce.sauceCode}
                  </span>
                  <span className="font-medium text-green-900">{sauce.sauceName}</span>
                  <span className="text-sm text-green-700">by {sauce.brandName}</span>
                </div>
                <span className="block text-xs font-semibold text-green-700 sm:ml-auto">
                  {sauce.scanCount}/7 ✓
                </span>
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

      {/* Remove from box modal */}
      {removeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove from box?</h3>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-mono font-semibold text-gray-900">{removeModal.sauceCode}</span> — {removeModal.sauceName}
            </p>
            <p className="text-xs text-gray-500 mb-6">by {removeModal.brandName}</p>
            <div className="flex gap-3">
              <button
                onClick={() => void handleRemoveFromBox()}
                disabled={isRemoving}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isRemoving ? 'Removing...' : 'Remove from box'}
              </button>
              <button
                onClick={() => setRemoveModal(null)}
                disabled={isRemoving}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
