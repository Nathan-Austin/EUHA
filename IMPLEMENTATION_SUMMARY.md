# Historical Participant Tracking System - Implementation Summary

## ✅ What We've Built

### Phase 1: Database Infrastructure (COMPLETE)
**Migration File**: `supabase/migrations/20251106000102_create_participation_tracking.sql`

Created two participation tracking tables:

1. **`supplier_participations`** - Tracks supplier participation by year
   - Stores: email, company name, year, sauce count, awards, invitation status
   - Enables: Supplier re-invitation campaigns, VIP award winner targeting

2. **`judge_participations`** - Tracks judge participation by year
   - Stores: email, name, year, judge type, experience level, source channel, company affiliation
   - Enables: Judge recruitment campaigns, loyalty tracking, role classification

**Indexes**: Optimized for email campaign queries (email+year, invited_date)

### Phase 2: Import Script (COMPLETE - READY TO TEST)
**Script**: `eu-hot-sauce-awards/scripts/import-historical-data.ts`

#### What It Imports:

**2024 Judges** (from `Heat_Awards_2024_Judges.csv`)
- Smart classification based on `Source-affiliation`:
  - "PRO" / "SOF" → Professional judge
  - Company names → Supplier-judge
  - Facebook/Telegram/WhatsApp → Community judge
- Handles missing emails gracefully (skips and logs)
- Tracks acceptance status

**2025 Judges** (from `Judge_applications_2025_awards.csv`)
- Maps experience levels to judge types
- Extracts application dates
- Stores company affiliations

**2026 Judges** (from `Judge_applications_2026_awards.csv`)
- Same logic as 2025
- Marked as not yet accepted

**2025 Suppliers** (from `Enriched_Chillifest_Results_2025.csv`)
- Groups sauce entries by company email
- Counts total sauces per supplier
- Detects award winners (GOLD/SILVER/BRONZE)

**Cross-Referencing**
- Exact email matching between suppliers and judges
- Updates judge type to 'supplier' when matched
- Stores company affiliations
- Framework for fuzzy name matching (can be enhanced)

**Contact Data Sync**
- Upserts latest info to `judges` and `suppliers` tables
- Latest year data wins for contact details

## 📋 Next Steps

### Immediate Actions Required:

1. **Deploy Migration to Remote Database**
   ```bash
   supabase db push
   ```

2. **Install Import Script Dependencies**
   ```bash
   cd eu-hot-sauce-awards
   npm install  # Installs fuse.js
   ```

3. **Set Environment Variables**
   ```bash
   export PROJECT_URL="your-supabase-url"
   export SERVICE_ROLE_KEY="your-service-role-key"
   ```

4. **Run Import Script**
   ```bash
   cd /home/nathan/EUHA
   npx tsx eu-hot-sauce-awards/scripts/import-historical-data.ts
   ```

5. **Validate Imported Data**
   - Check counts for each year
   - Review cross-reference matches
   - Verify award detection
   - Check for any data anomalies in logs

### Phase 3: Edge Function Updates (TODO)

Update these functions to track current year participations:

**`supplier-intake/index.ts`**
- Add INSERT to `supplier_participations` on successful registration
- Protect against judge type downgrades

**`judge-intake/index.ts`**
- Add INSERT to `judge_participations` on successful registration
- Don't overwrite supplier judge types

### Phase 4: Email Campaign Infrastructure (TODO)

Create query templates for:
- VIP award winners (2024/2025)
- Past suppliers not in 2026
- Non-supplier judges (2024/2025)
- Loyal multi-year judges

### Phase 5: 2024 Supplier Integration (WAITING ON DATA)

When 2024 supplier emails arrive:
- Add 2024 supplier import to script
- Cross-reference with 2024 judges
- Complete award winner tracking

## 📊 Expected Data Counts

Based on CSV files:
- **2024 Judges**: ~119 (some may be skipped due to missing emails)
- **2025 Judges**: 126
- **2026 Judges**: 50
- **2025 Suppliers**: ~60-70 (grouped by email from sauce entries)

## 🔗 Email Campaign Use Cases

### Campaign 1: Re-invite Past Suppliers
**Target**: Suppliers from 2024/2025 who haven't entered 2026
**Query**:
```sql
SELECT email, company_name FROM supplier_participations
WHERE year IN (2024, 2025)
AND email NOT IN (SELECT email FROM supplier_participations WHERE year = 2026)
AND invited_date IS NULL;
```

### Campaign 2: VIP Award Winners
**Target**: Award-winning suppliers for special invitation
**Query**:
```sql
SELECT email, company_name FROM supplier_participations
WHERE year IN (2024, 2025)
AND has_awards = true
AND email NOT IN (SELECT email FROM supplier_participations WHERE year = 2026);
```

### Campaign 3: Past Non-Supplier Judges
**Target**: Community/pro judges to invite for judging again
**Query**:
```sql
SELECT DISTINCT email, full_name FROM judge_participations
WHERE year IN (2024, 2025)
AND judge_type != 'supplier'
AND email NOT IN (SELECT email FROM judge_participations WHERE year = 2026)
AND invited_date IS NULL;
```

### Campaign 4: Loyal Multi-Year Judges
**Target**: Judges who participated multiple years (special recognition)
**Query**:
```sql
SELECT email, full_name, COUNT(DISTINCT year) as years
FROM judge_participations
WHERE year < 2026
GROUP BY email, full_name
HAVING COUNT(DISTINCT year) >= 2
AND email NOT IN (SELECT email FROM judge_participations WHERE year = 2026);
```

## 📁 Files Created

### Database
- `supabase/migrations/20251106000102_create_participation_tracking.sql`

### Scripts
- `eu-hot-sauce-awards/scripts/import-historical-data.ts` - Main import script
- `eu-hot-sauce-awards/scripts/import-historical-data-README.md` - Usage instructions
- `eu-hot-sauce-awards/package.json` - Updated with fuse.js dependency

### Documentation
- `HISTORICAL_DATA_IMPORT_TODO.md` - Detailed checklist
- `IMPLEMENTATION_SUMMARY.md` - This file

## ⚠️ Important Notes

### Data Quality Issues to Watch:
- Some 2024 judges have missing emails (will be skipped)
- Source-affiliation column in 2024 is mixed (social + companies)
- 2024 supplier emails not yet available

### Technical Decisions:
- Email is the primary key for matching across years
- Latest year data wins for contact information updates
- Judge type can be upgraded (community → supplier) but protected from downgrades
- Fuzzy matching framework in place but basic (can be enhanced)

### Security:
- Import script uses SERVICE_ROLE_KEY (bypasses RLS)
- Should only be run by administrators
- Environment variables must be secured
