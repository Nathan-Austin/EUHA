'use client';

import { QrReader } from 'react-qr-reader';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ScanPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any, error: any) => {
    if (!!result) {
      const sauceId = result?.getText();
      if (sauceId) {
        // Basic validation for UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(sauceId)) {
          router.push(`/judge/score/${sauceId}`);
        } else {
          setError('Invalid QR code. Please scan an official sauce QR code.');
        }
      }
    }

    if (!!error) {
      // console.info(error);
      // We can add more specific error handling here if needed
    }
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Scan Sauce QR Code</h1>
      <div className="max-w-md mx-auto bg-gray-200 rounded-lg overflow-hidden shadow-lg">
        <QrReader
          onResult={handleScan}
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
