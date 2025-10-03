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

      // A4 page dimensions (mm)
      const pageWidth = 210;
      const pageHeight = 297;

      // Label dimensions (using larger labels for judges - 99.1 × 67.7 mm, 8 per page)
      const labelWidth = 99.1;
      const labelHeight = 67.7;
      const cols = 2;
      const rows = 4;
      const labelsPerPage = cols * rows; // 8

      // Calculate margins
      const totalLabelsWidth = cols * labelWidth;
      const totalLabelsHeight = rows * labelHeight;
      const marginX = (pageWidth - totalLabelsWidth) / 2;
      const marginY = (pageHeight - totalLabelsHeight) / 2;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let labelIndex = 0;

      for (const judge of judges) {
        // Add new page if needed
        if (labelIndex >= labelsPerPage && labelIndex > 0) {
          pdf.addPage();
          labelIndex = 0;
        }

        // Calculate position
        const col = labelIndex % cols;
        const row = Math.floor(labelIndex / cols);
        const x = marginX + (col * labelWidth);
        const y = marginY + (row * labelHeight);

        // Draw border (optional, for alignment checking)
        // pdf.setDrawColor(200, 200, 200);
        // pdf.rect(x, y, labelWidth, labelHeight);

        // QR Code (centered at top) - generate locally with judge ID
        const qrSize = 40;
        const qrX = x + (labelWidth - qrSize) / 2;
        const qrY = y + 8;

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

        // Text below QR code
        const textY = qrY + qrSize + 6;

        // Judge Name
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const nameText = judge.name || 'Judge';
        pdf.text(nameText, x + labelWidth / 2, textY, { align: 'center', maxWidth: labelWidth - 10 });

        // Judge Type
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const typeText = judge.type.toUpperCase();
        const typeColor = judge.type === 'pro' ? [0, 100, 200] : judge.type === 'community' ? [100, 150, 0] : [150, 0, 150];
        pdf.setTextColor(typeColor[0], typeColor[1], typeColor[2]);
        pdf.text(typeText, x + labelWidth / 2, textY + 6, { align: 'center' });

        // Address lines
        pdf.setFontSize(8);
        pdf.setTextColor(60, 60, 60);
        const addressLines = [judge.addressLine1, judge.addressLine2].filter(Boolean);
        let addressY = textY + 11;
        for (const line of addressLines) {
          const splitLine = pdf.splitTextToSize(line, labelWidth - 10);
          for (const segment of splitLine) {
            pdf.text(segment, x + labelWidth / 2, addressY, { align: 'center' });
            addressY += 4;
          }
        }

        // Email (smaller)
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        const emailSplit = pdf.splitTextToSize(judge.email, labelWidth - 10);
        for (const segment of emailSplit) {
          pdf.text(segment, x + labelWidth / 2, addressY + 2, { align: 'center' });
          addressY += 4;
        }

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
    <div className="space-y-4 rounded-3xl border border-white/15 bg-white/[0.05] p-8 backdrop-blur">
      <h3 className="text-xl font-semibold mb-4">Judge Labels</h3>

      <p className="text-sm text-gray-600 mb-4">
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

      <div className="flex gap-3">
        <button
          onClick={handlePreview}
          disabled={isGenerating}
          className="rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Preview Judge Count
        </button>

        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? 'Generating PDF...' : 'Generate Judge Labels (PDF)'}
        </button>
      </div>
    </div>
  );
}
