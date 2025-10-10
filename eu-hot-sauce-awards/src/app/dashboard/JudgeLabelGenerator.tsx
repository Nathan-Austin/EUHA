"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { generateJudgeQRCodes, type JudgeLabelData } from "../actions";

export default function JudgeLabelGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ totalJudges: number } | null>(null);

  const handlePreview = async () => {
    setError(null);
    const result = await generateJudgeQRCodes();

    if ('error' in result) {
      setError(result.error || 'Failed to generate judge QR codes');
      return;
    }

    setPreview({
      totalJudges: result.judges.length,
    });
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateJudgeQRCodes();

      if ('error' in result) {
        setError(result.error || 'Failed to generate judge QR codes');
        return;
      }

      const { judges } = result;

      // Avery 6605 label template (70mm × 37mm, 24 per page)
      const Avery6605 = {
        page: { width: 210, height: 297 },   // A4 in mm
        label: { width: 70, height: 37 },
        layout: { rows: 8, cols: 3 },
        margins: { top: 0.5, bottom: 0.5, left: 0, right: 0 },
        gap: { x: 0, y: 0 },
        pitch: { x: 70, y: 37 }
      };

      const pageWidth = Avery6605.page.width;
      const pageHeight = Avery6605.page.height;
      const labelWidth = Avery6605.label.width;
      const labelHeight = Avery6605.label.height;
      const cols = Avery6605.layout.cols;
      const rows = Avery6605.layout.rows;
      const labelsPerPage = cols * rows; // 24
      const marginX = Avery6605.margins.left;
      const marginY = Avery6605.margins.top;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let labelIndex = 0;

      // Generate 2 labels per judge
      const labelData = judges.flatMap(judge => [judge, judge]);

      for (const judge of labelData) {
        // Add new page if needed
        if (labelIndex >= labelsPerPage && labelIndex > 0) {
          pdf.addPage();
          labelIndex = 0;
        }

        // Calculate position
        const col = labelIndex % cols;
        const row = Math.floor(labelIndex / cols);
        const x = marginX + (col * Avery6605.pitch.x);
        const y = marginY + (row * Avery6605.pitch.y);

        // Draw border (optional, for alignment checking)
        // pdf.setDrawColor(200, 200, 200);
        // pdf.rect(x, y, labelWidth, labelHeight);

        // QR Code (centered at top) - smaller for compact labels
        const qrSize = 25;
        const qrX = x + (labelWidth - qrSize) / 2;
        const qrY = y + 2;

        if (judge.judgeId) {
          try {
            // Generate QR code locally with the judge ID
            const qrDataUrl = await QRCode.toDataURL(judge.judgeId, {
              width: 400,
              margin: 1,
              errorCorrectionLevel: 'M',
            });

            pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
          } catch (err) {
            console.error('Failed to generate QR code:', err);
          }
        }

        // Text below QR code - compact layout for smaller labels
        const textY = qrY + qrSize + 1;

        // Judge Name (smaller font for compact labels)
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const nameText = judge.name || 'Judge';
        pdf.text(nameText, x + labelWidth / 2, textY, { align: 'center', maxWidth: labelWidth - 4 });

        // Judge Type
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        const typeText = judge.type.toUpperCase();
        const typeColor = judge.type === 'pro' ? [0, 100, 200] : judge.type === 'community' ? [100, 150, 0] : [150, 0, 150];
        pdf.setTextColor(typeColor[0], typeColor[1], typeColor[2]);
        pdf.text(typeText, x + labelWidth / 2, textY + 4, { align: 'center' });

        // Reset text color
        pdf.setTextColor(0, 0, 0);

        labelIndex++;
      }

      // Save PDF
      const today = new Date().toISOString().split('T')[0];
      pdf.save(`judge-labels-${today}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-white/15 bg-white/[0.05] p-5 backdrop-blur sm:p-8">
      <h3 className="text-xl font-semibold">Judge Labels</h3>

      <p className="text-sm text-gray-600">
        Generate printable labels with QR codes for all active judges. Use these for box assignment scanning to prevent conflicts of interest.
      </p>

      {preview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 mb-2">Label Preview</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Active Judges: <strong>{preview.totalJudges}</strong></li>
            <li>Labels per page: <strong>8</strong> (99.1 × 67.7 mm)</li>
            <li>Sheets Required: <strong>{Math.ceil(preview.totalJudges / 8)}</strong></li>
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
          className="w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
        >
          Preview Judge Count
        </button>

        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="w-full rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-6"
        >
          {isGenerating ? 'Generating PDF...' : 'Generate Judge Labels (PDF)'}
        </button>
      </div>
    </div>
  );
}
