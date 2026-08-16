-- The Filfla Chilli Co. row in the 2026-08-14 press_pickups import inherited
-- 'filfla-chilli' as maker_name — a raw slug fallback from EHC's source data,
-- where producers.brand was NULL for this maker. slugifyMaker('filfla-chilli')
-- doesn't match the real maker page slug (filfla-chilli-co, derived from the
-- past_results company_name 'Filfla Chilli Co.'), so this pickup was silently
-- excluded from both /press's maker link and the maker's own coverage section.

UPDATE press_pickups
SET maker_name = 'Filfla Chilli Co.', maker_slug = 'filfla-chilli-co'
WHERE maker_slug = 'filfla-chilli' AND maker_name = 'filfla-chilli';
