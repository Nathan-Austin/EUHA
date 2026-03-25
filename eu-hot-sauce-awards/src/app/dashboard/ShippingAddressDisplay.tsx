interface ShippingAddress {
  address: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  state: string | null;
  country: string | null;
}

export default function ShippingAddressDisplay({ address }: { address: ShippingAddress | null }) {
  const hasAddress = address?.address && address?.city && address?.postal_code && address?.country;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Mailing Address on File</p>
      {hasAddress ? (
        <address className="not-italic text-sm text-gray-800 space-y-0.5">
          <p>{address!.address}</p>
          {address!.address_line2 && <p>{address!.address_line2}</p>}
          <p>{address!.city}{address!.state ? `, ${address!.state}` : ''}{address!.postal_code ? ` ${address!.postal_code}` : ''}</p>
          <p>{address!.country}</p>
        </address>
      ) : (
        <p className="text-sm text-gray-500 italic">No address on file yet.</p>
      )}
    </div>
  );
}
