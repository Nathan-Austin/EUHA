import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export interface PressPickup {
  id: string;
  pickupDate: string | null;
  outletName: string;
  outletUrl: string | null;
  articleUrl: string | null;
  country: string | null;
  language: string | null;
  makerSlug: string | null;
  makerName: string | null;
  campaign: string;
}

export async function getPressPickups(): Promise<PressPickup[]> {
  const supabase = createClient(cookies());

  const { data } = await supabase
    .from('press_pickups')
    .select('id, pickup_date, outlet_name, outlet_url, article_url, country, language, maker_slug, maker_name, campaign')
    .order('pickup_date', { ascending: false, nullsFirst: false });

  return (data || []).map((row) => ({
    id: row.id,
    pickupDate: row.pickup_date,
    outletName: row.outlet_name,
    outletUrl: row.outlet_url,
    articleUrl: row.article_url,
    country: row.country,
    language: row.language,
    makerSlug: row.maker_slug,
    makerName: row.maker_name,
    campaign: row.campaign,
  }));
}

export interface PressStats {
  count: number;
  outlets: number;
  countries: number;
}

export function getPressStats(pickups: PressPickup[]): PressStats {
  const outlets = new Set(pickups.map((p) => p.outletName.toLowerCase()));
  const countries = new Set(pickups.map((p) => p.country?.toUpperCase()).filter(Boolean));
  return {
    count: pickups.length,
    outlets: outlets.size,
    countries: countries.size,
  };
}
