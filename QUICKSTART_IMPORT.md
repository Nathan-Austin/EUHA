# Quick Start: Historical Data Import

## Step-by-Step Guide

### 1. Deploy Database Migration

```bash
# Make sure you're in the EUHA directory
cd /home/nathan/EUHA

# Push migration to remote database
supabase db push
```

Expected output: Migration `20251106000102_create_participation_tracking.sql` applied successfully.

### 2. Install Script Dependencies

```bash
cd eu-hot-sauce-awards
npm install
```

This will install the new dependency:
- `fuse.js` - Fuzzy matching for cross-referencing

(Other dependencies like `@supabase/supabase-js` and `csv-parse` are already installed)

### 3. Set Environment Variables

Get your Supabase credentials from the dashboard, then:

```bash
export PROJECT_URL="https://your-project.supabase.co"
export SERVICE_ROLE_KEY="your-service-role-key-here"
```

**Security Note**: Use the SERVICE_ROLE_KEY (not the anon key). This bypasses RLS for admin operations.

### 4. Run the Import

```bash
# From the EUHA root directory
cd /home/nathan/EUHA

# Run the import script using tsx
npx tsx eu-hot-sauce-awards/scripts/import-historical-data.ts
```

### 5. Monitor the Output

The script will log:
- ✅ Successful imports with counts
- ⚠️ Warnings for skipped records (e.g., missing emails)
- ❌ Errors if something fails
- 🔗 Cross-reference matches found

### 6. Validate Results

Check the imported data in Supabase dashboard:

**Judge Participations**:
```sql
SELECT year, COUNT(*) as count, judge_type
FROM judge_participations
GROUP BY year, judge_type
ORDER BY year, judge_type;
```

Expected:
- 2024: ~110-115 judges (some skipped)
- 2025: 126 judges
- 2026: 50 judges

**Supplier Participations**:
```sql
SELECT year, COUNT(*) as count, SUM(sauce_count) as total_sauces
FROM supplier_participations
GROUP BY year;
```

Expected:
- 2025: ~60-70 suppliers with sauce counts

**Cross-Reference Matches**:
```sql
SELECT COUNT(*) FROM judge_participations
WHERE judge_type = 'supplier' AND company_affiliation IS NOT NULL;
```

## Troubleshooting

### Problem: "Cannot find module"
**Solution**: Make sure you ran `npm install` in the eu-hot-sauce-awards directory

### Problem: "Supabase connection failed"
**Solution**: Check your PROJECT_URL and SERVICE_ROLE_KEY environment variables

### Problem: "Migration already applied"
**Solution**: That's fine! The migration uses IF NOT EXISTS checks

### Problem: "CSV file not found"
**Solution**: Make sure you're running the script from `/home/nathan/EUHA` (the root directory)

### Problem: "Duplicate key error"
**Solution**: The script uses UPSERT, so this shouldn't happen. If it does, check the UNIQUE constraints.

## What Happens Next?

After successful import:

1. **Phase 3**: Update edge functions to track 2026 participations automatically
2. **Phase 4**: Create email campaign queries and execution plan
3. **Phase 5**: Import 2024 supplier data when emails are available

## Manual Data Inspection

### View All Participations for a Specific Person:
```sql
SELECT 'judge' as type, year, judge_type, accepted
FROM judge_participations
WHERE email = 'example@email.com'
UNION ALL
SELECT 'supplier' as type, year, company_name, has_awards
FROM supplier_participations
WHERE email = 'example@email.com'
ORDER BY year;
```

### Find Supplier-Judges (Cross-Referenced):
```sql
SELECT
  jp.email,
  jp.full_name,
  jp.year,
  sp.company_name,
  sp.has_awards
FROM judge_participations jp
JOIN supplier_participations sp ON jp.email = sp.email AND jp.year = sp.year
WHERE jp.judge_type = 'supplier';
```

### Check for Data Quality Issues:
```sql
-- Judges with no name
SELECT * FROM judge_participations WHERE full_name IS NULL OR full_name = '';

-- Suppliers with no company name
SELECT * FROM supplier_participations WHERE company_name IS NULL OR company_name = '';

-- Duplicate emails in same year (should be none due to UNIQUE constraint)
SELECT email, year, COUNT(*)
FROM judge_participations
GROUP BY email, year
HAVING COUNT(*) > 1;
```
