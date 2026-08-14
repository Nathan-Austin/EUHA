'use client';

import SupplierSauceManager from './SupplierSauceManager';
import RohFollowCTA from '@/components/RohFollowCTA';
import { COMPETITION_YEAR } from '@/lib/config';
import { COMPANY_INFO } from '@/lib/company';

interface EnteredSauce {
  id: string;
  name: string;
  category: string;
  image_path: string | null;
  status: string;
}

interface UnpaidSauce {
  id: string;
  name: string;
  category: string;
  sauce_code: string;
  ingredients: string;
  allergens: string;
  webshop_link: string | null;
  tasting_notes: string | null;
  created_at: string;
}

interface SupplierDashboardProps {
  supplierData: {
    brandName: string;
    packageStatus: string;
    packageReceivedAt: string | null;
  };
  enteredSauces: EnteredSauce[];
  hasOptedIn: boolean;
  unpaidSauces: UnpaidSauce[];
  hasExistingPayment: boolean;
}

const PACKAGE_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Not yet shipped', className: 'bg-black/5 text-black/60' },
  shipped: { label: 'Shipped', className: 'bg-[#F5C518] text-black' },
  received: { label: 'Received', className: 'bg-green-600 text-white' },
};

export default function SupplierDashboard({ supplierData, enteredSauces, hasOptedIn, unpaidSauces, hasExistingPayment }: SupplierDashboardProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageBucket = process.env.NEXT_PUBLIC_SAUCE_IMAGE_BUCKET || 'sauce-media';
  const status = PACKAGE_STATUS[supplierData.packageStatus] ?? PACKAGE_STATUS.pending;
  const hasEntries = enteredSauces.length > 0 || unpaidSauces.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#F5C518]">EHSA {COMPETITION_YEAR}</p>
        <h1 className="font-[family-name:var(--font-archivo-black)] text-3xl uppercase leading-none text-black">
          Welcome, {supplierData.brandName}
        </h1>
      </div>

      <SupplierSauceManager
        initialSauces={unpaidSauces}
        hasExistingPayment={hasExistingPayment}
        hasOptedIn={hasOptedIn}
      />

      {enteredSauces.length > 0 && (
        <div className="border-[3px] border-black bg-white p-6">
          <h2 className="mb-4 font-[family-name:var(--font-archivo-black)] text-lg uppercase">
            Your entries ({enteredSauces.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {enteredSauces.map((sauce) => (
              <div key={sauce.id} className="flex items-center gap-3 border-2 border-black/10 p-3">
                {sauce.image_path && supabaseUrl ? (
                  <img
                    src={`${supabaseUrl}/storage/v1/object/public/${imageBucket}/${sauce.image_path}`}
                    alt={sauce.name}
                    className="h-14 w-14 flex-shrink-0 object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 flex-shrink-0 bg-black/5" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-black">{sauce.name}</p>
                  <p className="text-sm text-black/60">{sauce.category}</p>
                  <span className="mt-1 inline-block bg-black/5 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.04em] text-black/70">
                    {sauce.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasOptedIn && hasEntries && (
        <div className="border-[3px] border-black bg-white p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase">Ship your samples</h2>
          <p className="text-sm text-black/70">
            Send one bottle of each entered sauce to our Berlin address between 1 January and 28 February {COMPETITION_YEAR}.
            Shipping from outside Europe? Include your EORI number on the customs paperwork and ship via UPS — UPS
            clears customs and delivers directly to us, rather than us having to track the parcel down.
          </p>
          <address className="not-italic border-l-4 border-[#F5C518] pl-4 text-sm leading-relaxed text-black">
            {COMPANY_INFO.address.line1}<br />
            {COMPANY_INFO.address.line2}<br />
            {COMPANY_INFO.address.street}<br />
            {COMPANY_INFO.address.postalCode} {COMPANY_INFO.address.city}<br />
            {COMPANY_INFO.address.country}
          </address>
          <div className="flex items-center gap-2 border-t border-black/10 pt-4">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-black/50">Status:</span>
            <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-[0.04em] ${status.className}`}>
              {status.label}
            </span>
          </div>
        </div>
      )}

      <RohFollowCTA />
    </div>
  );
}
