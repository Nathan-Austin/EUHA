-- reuseSauceEntry checked for existing re-entries before inserting, but nothing
-- enforced it at the DB level, so a double-click or two open tabs could race
-- past the check and create duplicate re-entries for the same source sauce +
-- category + competition year.
CREATE UNIQUE INDEX sauces_reentry_unique
ON sauces (reused_from_sauce_id, category, competition_year)
WHERE reused_from_sauce_id IS NOT NULL;
