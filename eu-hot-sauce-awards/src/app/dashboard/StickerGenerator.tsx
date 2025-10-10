"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { generateStickerData, type StickerData } from "../actions";

export default function StickerGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ totalJudges: number; boxesNeeded: number; stickersPerSauce: number; totalStickers: number } | null>(null);

  const handlePreview = async () => {
    setError(null);
    const result = await generateStickerData();

    if ('error' in result) {
      setError(result.error || 'Unknown error');
      return;
    }

    const totalStickers = result.stickerData.reduce((sum, sauce) => sum + sauce.stickersNeeded, 0);
    setPreview({
      totalJudges: result.totalJudges,
      boxesNeeded: result.boxesNeeded,
      stickersPerSauce: result.stickersPerSauce,
      totalStickers,
    });
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateStickerData();

      if ('error' in result) {
        setError(result.error || 'Unknown error');
        return;
      }

      const { stickerData } = result;

      // Avery L7781 specifications (in mm)
      const pageWidth = 210; // A4 width
      const pageHeight = 297; // A4 height
      const labelWidth = 45.7;
      const labelHeight = 25.4;
      const cols = 4;
      const rows = 10;
      const labelsPerPage = cols * rows; // 40 labels per sheet

      const marginLeft = 9.7;
      const marginTop = 21.5;
      const horizontalPitch = 48.3; // label width + horizontal gap
      const verticalPitch = 25.4; // label height + vertical gap (no gap)

      // Content area (with 2mm border)
      const contentBorder = 2;
      const contentWidth = labelWidth - (contentBorder * 2);
      const contentHeight = labelHeight - (contentBorder * 2);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let labelIndex = 0;

      // Flatten sticker data (repeat each sauce N times)
      const allStickers: StickerData[] = [];
      for (const sauce of stickerData) {
        for (let i = 0; i < sauce.stickersNeeded; i++) {
          allStickers.push(sauce);
        }
      }

      for (const sticker of allStickers) {
        // Add new page if needed
        if (labelIndex >= labelsPerPage) {
          pdf.addPage();
          labelIndex = 0;
        }

        // Calculate position
        const col = labelIndex % cols;
        const row = Math.floor(labelIndex / cols);
        const x = marginLeft + (col * horizontalPitch);
        const y = marginTop + (row * verticalPitch);

        // Content area position (inside border)
        const contentX = x + contentBorder;
        const contentY = y + contentBorder;

        // Generate QR code
        const qrSize = 18; // QR code size in mm
        const qrCodeDataUrl = await QRCode.toDataURL(
          `${window.location.origin}/judge/score/${sticker.sauceId}`,
          {
            width: 200,
            margin: 0,
            errorCorrectionLevel: 'M',
          }
        );

        // Center QR code horizontally in the label
        const qrX = contentX + (contentWidth - qrSize) / 2;
        const qrY = contentY + 1;
        pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

        // Sauce code centered below QR code
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        const codeY = qrY + qrSize + 3;
        const textX = contentX + contentWidth / 2;
        pdf.text(sticker.sauceCode, textX, codeY, { align: 'center' });

        labelIndex++;
      }

      // Save PDF
      const today = new Date().toISOString().split('T')[0];
      pdf.save(`judging-stickers-${today}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-white/15 bg-white/[0.05] p-5 backdrop-blur sm:p-8">
      <h3 className="text-xl font-semibold">Judging Stickers</h3>

      <p className="text-sm text-gray-600">
        Generate printable Avery L7781 label sheets (45.7 × 25.4 mm, 40 labels per A4 sheet) with QR codes and sauce codes for the judging process.
      </p>

      {preview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 mb-2">Sticker Preview</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Active Judges: <strong>{preview.totalJudges}</strong></li>
            <li>Judging Boxes Needed: <strong>{preview.boxesNeeded}</strong></li>
            <li>Stickers per Sauce: <strong>{preview.stickersPerSauce}</strong> (7 bottles × {preview.boxesNeeded} boxes + 2 spares)</li>
            <li>Total Stickers: <strong>{preview.totalStickers}</strong></li>
            <li>Sheets Required: <strong>{Math.ceil(preview.totalStickers / 40)}</strong> (40 labels per sheet)</li>
          </ul>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handlePreview}
          disabled={isGenerating}
          className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:w-auto w-full"
        >
          Preview Sticker Count
        </button>

        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060] disabled:cursor-not-allowed disabled:opacity-70 sm:px-6 sm:w-auto w-full"
        >
          {isGenerating ? 'Generating PDF...' : 'Generate Stickers (PDF)'}
        </button>
      </div>
    </div>
  );
}
