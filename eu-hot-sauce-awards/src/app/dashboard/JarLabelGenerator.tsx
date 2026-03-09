"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import { generateStickerData, type StickerData } from "../actions";

function calcStickerPage(sauceIndex: number, stickerData: StickerData[]): number {
  let cumulative = 0;
  for (let i = 0; i < sauceIndex; i++) {
    cumulative += stickerData[i].stickersNeeded;
  }
  return Math.floor(cumulative / 40) + 1;
}

export default function JarLabelGenerator() {
  const [isGeneratingLabels, setIsGeneratingLabels] = useState(false);
  const [isGeneratingRef, setIsGeneratingRef] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ totalSauces: number; sheetsRequired: number } | null>(null);

  const handlePreview = async () => {
    setError(null);
    const result = await generateStickerData();
    if ('error' in result) {
      setError(result.error || 'Unknown error');
      return;
    }
    setPreview({
      totalSauces: result.stickerData.length,
      sheetsRequired: Math.ceil(result.stickerData.length / 40),
    });
  };

  const generateLabels = async () => {
    setIsGeneratingLabels(true);
    setError(null);
    try {
      const result = await generateStickerData();
      if ('error' in result) {
        setError(result.error || 'Unknown error');
        return;
      }
      const { stickerData } = result;

      // Avery L7781 specifications (in mm) — same layout as judging stickers
      const pageWidth = 210;
      const pageHeight = 297;
      const labelWidth = 45.7;
      const labelHeight = 25.4;
      const cols = 4;
      const rows = 10;
      const labelsPerPage = cols * rows;
      const marginLeft = 9.7;
      const marginTop = 21.5;
      const horizontalPitch = 48.3;
      const verticalPitch = 25.4;
      const contentBorder = 2;
      const contentWidth = labelWidth - contentBorder * 2;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const totalPages = Math.ceil(stickerData.length / labelsPerPage);
      let currentPage = 1;
      let labelIndex = 0;

      const addPageNumber = (page: number) => {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(150);
        pdf.text(`Page ${page} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        pdf.setTextColor(0);
      };

      addPageNumber(currentPage);

      for (let i = 0; i < stickerData.length; i++) {
        if (labelIndex >= labelsPerPage) {
          pdf.addPage();
          labelIndex = 0;
          currentPage++;
          addPageNumber(currentPage);
        }

        const sauce = stickerData[i];
        const stickerPage = calcStickerPage(i, stickerData);

        const col = labelIndex % cols;
        const row = Math.floor(labelIndex / cols);
        const x = marginLeft + col * horizontalPitch;
        const y = marginTop + row * verticalPitch;
        const contentX = x + contentBorder;
        const contentY = y + contentBorder;
        const textX = contentX + contentWidth / 2;

        // Brand name (small, muted, top)
        pdf.setFontSize(6.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(110);
        pdf.text(sauce.brandName, textX, contentY + 3.5, { align: 'center', maxWidth: contentWidth });

        // Sauce name (bold, middle)
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0);
        pdf.text(sauce.sauceName, textX, contentY + 9, { align: 'center', maxWidth: contentWidth });

        // Sauce code (left) and sticker page reference (right) at bottom
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0);
        pdf.text(sauce.sauceCode, contentX, contentY + 18);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120);
        pdf.text(`Sticker p.${stickerPage}`, contentX + contentWidth, contentY + 18, { align: 'right' });
        pdf.setTextColor(0);

        labelIndex++;
      }

      const today = new Date().toISOString().split('T')[0];
      pdf.save(`jar-labels-${today}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsGeneratingLabels(false);
    }
  };

  const generateReference = async () => {
    setIsGeneratingRef(true);
    setError(null);
    try {
      const result = await generateStickerData();
      if ('error' in result) {
        setError(result.error || 'Unknown error');
        return;
      }
      const { stickerData } = result;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const rowHeight = 8;

      // Title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sauce Reference — Judging Sticker Pages', margin, margin + 8);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(120);
      pdf.text(`Generated ${new Date().toLocaleDateString()}`, margin, margin + 15);
      pdf.setTextColor(0);

      // Column positions
      const colCode = margin;
      const colBrand = margin + 22;
      const colName = margin + 72;
      const colPage = pageWidth - margin;

      let y = margin + 25;

      // Header row
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Code', colCode, y);
      pdf.text('Brand', colBrand, y);
      pdf.text('Sauce Name', colName, y);
      pdf.text('Sticker Page', colPage, y, { align: 'right' });
      y += 10;

      pdf.setFont('helvetica', 'normal');

      for (let i = 0; i < stickerData.length; i++) {
        if (y + rowHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin + 10;
        }

        const sauce = stickerData[i];
        const stickerPage = calcStickerPage(i, stickerData);

        if (i % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, y - 5, pageWidth - margin * 2, rowHeight, 'F');
        }

        pdf.setFontSize(8);
        pdf.setTextColor(80);
        pdf.text(sauce.sauceCode || '—', colCode, y);
        pdf.setTextColor(0);
        pdf.text(sauce.brandName, colBrand, y, { maxWidth: 48 });
        pdf.text(sauce.sauceName, colName, y, { maxWidth: 70 });
        pdf.setTextColor(80);
        pdf.text(`p.${stickerPage}`, colPage, y, { align: 'right' });
        pdf.setTextColor(0);

        y += rowHeight;
      }

      const today = new Date().toISOString().split('T')[0];
      pdf.save(`sauce-reference-${today}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsGeneratingRef(false);
    }
  };

  const busy = isGeneratingLabels || isGeneratingRef;

  return (
    <div className="space-y-4 rounded-3xl border border-white/15 bg-white/[0.05] p-5 backdrop-blur sm:p-8">
      <h3 className="text-xl font-semibold">Jar Labels & Reference</h3>

      <p className="text-sm text-gray-600">
        Generate bottle labels (Avery L7781, same layout as judging stickers) showing sauce name, brand, sauce code, and the page in the judging stickers PDF where each sauce appears. Also generate a printable reference list.
      </p>

      {preview && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Label Preview</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>Total Sauces: <strong>{preview.totalSauces}</strong></li>
            <li>Sheets Required: <strong>{preview.sheetsRequired}</strong> (40 labels per sheet)</li>
          </ul>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          onClick={handlePreview}
          disabled={busy}
          className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:w-auto w-full"
        >
          Preview Label Count
        </button>

        <button
          onClick={generateLabels}
          disabled={busy}
          className="rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#ff7033] hover:to-[#ffd060] disabled:cursor-not-allowed disabled:opacity-70 sm:px-6 sm:w-auto w-full"
        >
          {isGeneratingLabels ? 'Generating...' : 'Generate Jar Labels (PDF)'}
        </button>

        <button
          onClick={generateReference}
          disabled={busy}
          className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:w-auto w-full"
        >
          {isGeneratingRef ? 'Generating...' : 'Generate Reference Doc (PDF)'}
        </button>
      </div>
    </div>
  );
}
