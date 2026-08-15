'use client';

import { useState, useEffect } from 'react';
import { updateSupplierProfile, type SupplierProfileFields } from '@/app/actions';
import { createClient } from '@/lib/supabase/client';

interface ProducerInfo {
  brandName: string;
  contactName: string;
  addressStreet: string | null;
  addressHouseNumber: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  bio: string | null;
  website: string | null;
  instagram: string | null;
  logoPath: string | null;
  ehcSyncConsent: boolean;
  vatNumber: string | null;
  invoiceCompanyName: string | null;
  invoiceAddressStreet: string | null;
  invoiceAddressHouseNumber: string | null;
  invoiceAddressLine2: string | null;
  invoiceCity: string | null;
  invoiceState: string | null;
  invoicePostalCode: string | null;
  invoiceCountry: string | null;
}

const inputClass =
  'block w-full border-2 border-black px-4 py-2.5 text-base text-black placeholder-black/40 outline-none focus:border-[#F5C518]';
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-black/60';

const isAddressComplete = (info: ProducerInfo) =>
  Boolean(info.addressStreet && info.addressHouseNumber && info.city && info.postalCode && info.country);

export default function ProducerInfoModal({ info }: { info: ProducerInfo }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<ProducerInfo>(info);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const supabase = createClient();

  // Lock background scroll while the full-screen (mobile) modal is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  const hasDistinctInvoiceAddress = Boolean(
    info.invoiceAddressStreet || info.invoiceAddressHouseNumber || info.invoiceCity
    || info.invoicePostalCode || info.invoiceCountry
  );

  const [fields, setFields] = useState<SupplierProfileFields>({
    brandName: info.brandName,
    contactName: info.contactName,
    addressStreet: info.addressStreet || '',
    addressHouseNumber: info.addressHouseNumber || '',
    addressLine2: info.addressLine2 || '',
    city: info.city || '',
    state: info.state || '',
    postalCode: info.postalCode || '',
    country: info.country || '',
    phone: info.phone || '',
    bio: info.bio || '',
    website: info.website || '',
    instagram: info.instagram || '',
    ehcSyncConsent: info.ehcSyncConsent,
    vatNumber: info.vatNumber || '',
    invoiceCompanyName: info.invoiceCompanyName || '',
    invoiceSameAsDelivery: !hasDistinctInvoiceAddress,
    invoiceAddressStreet: info.invoiceAddressStreet || '',
    invoiceAddressHouseNumber: info.invoiceAddressHouseNumber || '',
    invoiceAddressLine2: info.invoiceAddressLine2 || '',
    invoiceCity: info.invoiceCity || '',
    invoiceState: info.invoiceState || '',
    invoicePostalCode: info.invoicePostalCode || '',
    invoiceCountry: info.invoiceCountry || '',
  });

  const set = (field: keyof Omit<SupplierProfileFields, 'ehcSyncConsent' | 'invoiceSameAsDelivery'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFields((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    let pendingLogoPath: string | null = null;
    if (logoFile) {
      setUploadingLogo(true);
      const bucket = process.env.NEXT_PUBLIC_SAUCE_IMAGE_BUCKET || 'sauce-media';
      const pendingPath = `pending/${Date.now()}_${logoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(pendingPath, logoFile, { contentType: logoFile.type, upsert: false });
      setUploadingLogo(false);

      if (uploadError) {
        setError(`Logo upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      pendingLogoPath = pendingPath;
    }

    const result = await updateSupplierProfile(fields, pendingLogoPath);
    setSaving(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    setSaved({
      brandName: fields.brandName,
      contactName: fields.contactName,
      addressStreet: fields.addressStreet,
      addressHouseNumber: fields.addressHouseNumber,
      addressLine2: fields.addressLine2 || null,
      city: fields.city,
      state: fields.state || null,
      postalCode: fields.postalCode,
      country: fields.country,
      phone: fields.phone || null,
      bio: fields.bio || null,
      website: fields.website || null,
      instagram: fields.instagram || null,
      logoPath: result.logoPath ?? saved.logoPath,
      ehcSyncConsent: fields.ehcSyncConsent,
      vatNumber: fields.vatNumber || null,
      invoiceCompanyName: fields.invoiceCompanyName || null,
      invoiceAddressStreet: fields.invoiceSameAsDelivery ? fields.addressStreet : (fields.invoiceAddressStreet || null),
      invoiceAddressHouseNumber: fields.invoiceSameAsDelivery ? fields.addressHouseNumber : (fields.invoiceAddressHouseNumber || null),
      invoiceAddressLine2: fields.invoiceSameAsDelivery ? (fields.addressLine2 || null) : (fields.invoiceAddressLine2 || null),
      invoiceCity: fields.invoiceSameAsDelivery ? fields.city : (fields.invoiceCity || null),
      invoiceState: fields.invoiceSameAsDelivery ? (fields.state || null) : (fields.invoiceState || null),
      invoicePostalCode: fields.invoiceSameAsDelivery ? fields.postalCode : (fields.invoicePostalCode || null),
      invoiceCountry: fields.invoiceSameAsDelivery ? fields.country : (fields.invoiceCountry || null),
    });
    setLogoFile(null);
    setOpen(false);
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageBucket = process.env.NEXT_PUBLIC_SAUCE_IMAGE_BUCKET || 'sauce-media';
  const logoUrl = saved.logoPath && supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/${imageBucket}/${saved.logoPath}`
    : null;
  const addressComplete = isAddressComplete(saved);

  return (
    <div className="border-[3px] border-black bg-white p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-14 w-14 flex-shrink-0 border-2 border-black/10 object-cover" />
          ) : (
            <div className="h-14 w-14 flex-shrink-0 border-2 border-dashed border-black/20 bg-black/5" />
          )}
          <div>
            <h2 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase">Producer info</h2>
            <p className="mt-1 text-sm text-black/60">
              Delivery address, profile bio and web links — used for shipping your award and press/promo outreach.
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex-shrink-0 border-2 border-black px-4 py-2 text-sm font-semibold uppercase tracking-[0.04em] hover:bg-black hover:text-[#F5C518]"
        >
          Edit producer info
        </button>
      </div>

      {!addressComplete && (
        <p className="border-2 border-[#F5C518] bg-[#F5C518]/20 p-3 text-sm text-black">
          No delivery address on file yet — add one so we can ship your award if you win.
        </p>
      )}

      <p className="border-2 border-black/10 bg-black/[0.03] p-3 text-sm text-black/70">
        The European Heat Council is building an EU hot sauce compendium for trade buyers and retailers.
        If you consent to sharing your data with EHC below, the more detail you add here — bio, website,
        Instagram, logo, and each sauce&apos;s product description — the more visibility your brand gets in it.
      </p>

      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/50">Delivery address</p>
          {addressComplete ? (
            <address className="not-italic text-black/80">
              {saved.addressStreet} {saved.addressHouseNumber}
              {saved.addressLine2 && <>, {saved.addressLine2}</>}<br />
              {saved.postalCode} {saved.city}{saved.state ? `, ${saved.state}` : ''}<br />
              {saved.country}
            </address>
          ) : (
            <p className="text-black/40">Not set</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/50">Profile</p>
          {saved.bio || saved.website || saved.instagram ? (
            <div className="space-y-1 text-black/80">
              {saved.bio && <p className="line-clamp-2">{saved.bio}</p>}
              {saved.website && <p className="truncate">{saved.website}</p>}
              {saved.instagram && <p className="truncate">{saved.instagram}</p>}
            </div>
          ) : (
            <p className="text-black/40">Not set</p>
          )}
          <p className="mt-1 text-xs text-black/50">
            EHC data sharing: <span className="font-semibold">{saved.ehcSyncConsent ? 'Consented' : 'Not consented'}</span>
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/50">Billing</p>
          {saved.vatNumber || saved.invoiceCompanyName ? (
            <p className="text-black/80">
              {saved.invoiceCompanyName && <>{saved.invoiceCompanyName}<br /></>}
              {saved.vatNumber ? `VAT: ${saved.vatNumber}` : 'No VAT number on file'}
            </p>
          ) : (
            <p className="text-black/40">No VAT number on file</p>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 sm:flex sm:items-center sm:justify-center sm:p-4">
          <div className="h-full w-full overflow-y-auto bg-white p-6 space-y-5 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-lg sm:border-[3px] sm:border-black">
            <h3 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase">Edit producer info</h3>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-black/50">Business</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Brand name <span className="text-red-600">*</span></label>
                  <input type="text" value={fields.brandName} onChange={set('brandName')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Contact name <span className="text-red-600">*</span></label>
                  <input type="text" value={fields.contactName} onChange={set('contactName')} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-black/10 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-black/50">Delivery address</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Street <span className="text-red-600">*</span></label>
                  <input type="text" value={fields.addressStreet} onChange={set('addressStreet')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>House number <span className="text-red-600">*</span></label>
                  <input type="text" value={fields.addressHouseNumber} onChange={set('addressHouseNumber')} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  Address line 2 <span className="normal-case text-black/40">(c/o, unit, floor — optional)</span>
                </label>
                <input type="text" value={fields.addressLine2} onChange={set('addressLine2')} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>City <span className="text-red-600">*</span></label>
                  <input type="text" value={fields.city} onChange={set('city')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State/province</label>
                  <input type="text" value={fields.state} onChange={set('state')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Postal code <span className="text-red-600">*</span></label>
                  <input type="text" value={fields.postalCode} onChange={set('postalCode')} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Country <span className="text-red-600">*</span></label>
                  <input type="text" value={fields.country} onChange={set('country')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone <span className="normal-case text-black/40">(optional)</span></label>
                  <input type="tel" value={fields.phone} onChange={set('phone')} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-black/10 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-black/50">VAT &amp; invoicing</h4>
              <p className="text-xs text-black/50">
                Prices include VAT. If you&apos;re VAT-registered outside Germany, adding your VAT number here lets
                us apply the EU reverse charge automatically — no VAT charged, you account for it yourself.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    VAT number <span className="normal-case text-black/40">(optional)</span>
                  </label>
                  <input type="text" value={fields.vatNumber} onChange={set('vatNumber')} placeholder="e.g. FR12345678901" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Invoice company name</label>
                  <input type="text" value={fields.invoiceCompanyName} onChange={set('invoiceCompanyName')} placeholder="Same as brand name if left blank" className={inputClass} />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-black">
                <input
                  type="checkbox"
                  checked={fields.invoiceSameAsDelivery}
                  onChange={(e) => setFields((prev) => ({ ...prev, invoiceSameAsDelivery: e.target.checked }))}
                  className="h-4 w-4 flex-shrink-0 accent-black"
                />
                Billing address is the same as the delivery address above
              </label>

              {!fields.invoiceSameAsDelivery && (
                <div className="space-y-4 border-l-2 border-black/10 pl-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Street</label>
                      <input type="text" value={fields.invoiceAddressStreet} onChange={set('invoiceAddressStreet')} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>House number</label>
                      <input type="text" value={fields.invoiceAddressHouseNumber} onChange={set('invoiceAddressHouseNumber')} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Address line 2 <span className="normal-case text-black/40">(optional)</span></label>
                    <input type="text" value={fields.invoiceAddressLine2} onChange={set('invoiceAddressLine2')} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className={labelClass}>City</label>
                      <input type="text" value={fields.invoiceCity} onChange={set('invoiceCity')} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>State/province</label>
                      <input type="text" value={fields.invoiceState} onChange={set('invoiceState')} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Postal code</label>
                      <input type="text" value={fields.invoicePostalCode} onChange={set('invoicePostalCode')} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input type="text" value={fields.invoiceCountry} onChange={set('invoiceCountry')} className={inputClass} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-black/10 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-black/50">
                Producer profile <span className="normal-case text-black/40">(for promo &amp; press use)</span>
              </h4>
              <p className="text-xs text-black/50">
                This is what appears in the EHC compendium if you consent to data sharing below — worth filling in.
              </p>
              <div>
                <label className={labelClass}>Bio</label>
                <textarea
                  value={fields.bio}
                  onChange={set('bio')}
                  rows={4}
                  placeholder="Tell us about your brand — who you are, your story, what makes your sauces distinctive."
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Website</label>
                  <input type="url" value={fields.website} onChange={set('website')} placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Instagram</label>
                  <input type="text" value={fields.instagram} onChange={set('instagram')} placeholder="@yourbrand" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Logo / photo</label>
                <div className="flex items-center gap-3">
                  {(logoPreview || logoUrl) && (
                    <img src={logoPreview || logoUrl || ''} alt="" className="h-12 w-12 flex-shrink-0 border-2 border-black/10 object-cover" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="block w-full text-sm text-black file:mr-4 file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:text-[#F5C518] hover:file:bg-black/80"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-black/10 pt-4">
              <label className="flex items-start gap-2.5 text-sm text-black">
                <input
                  type="checkbox"
                  checked={fields.ehcSyncConsent}
                  onChange={(e) => setFields((prev) => ({ ...prev, ehcSyncConsent: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-black"
                />
                <span>
                  Share my profile info (bio, website, Instagram, logo) with the European Heat Council for
                  promotional materials and press outreach — this is for your benefit, to help get your brand
                  featured. You can withdraw consent any time.
                </span>
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3 border-t border-black/10 pt-4">
              <button
                onClick={() => { setOpen(false); setError(null); setLogoFile(null); setLogoPreview(null); }}
                className="border-2 border-black px-4 py-2 text-sm font-semibold uppercase tracking-[0.04em] hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-black px-4 py-2 text-sm font-bold uppercase tracking-[0.04em] text-[#F5C518] hover:bg-black/80 disabled:opacity-50"
              >
                {uploadingLogo ? 'Uploading logo…' : saving ? 'Saving…' : 'Save producer info'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
