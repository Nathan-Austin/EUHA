-- Normalize the two legacy suppliers.country values that don't exact-match
-- the new canonical country list (src/lib/countries.ts), now that country is
-- a <select> keyed by exact name match instead of free text. Confirmed via
-- live query these are the only two mismatches on file (4 rows total).
update suppliers set country = 'United States' where country = 'USA';
update suppliers set country = 'Norway' where country = 'NO';
