# Historical Participant Tracking System - Implementation Checklist

## Phase 1: Database Infrastructure ✅

### 1.1 Create Participation Tracking Tables
- [x] Create migration file `20251106000102_create_participation_tracking.sql`
- [x] Add `supplier_participations` table
  - [x] Fields: id, email, company_name, year, sauce_count, has_awards, source, participated, invited_date, responded, created_at
  - [x] Add UNIQUE constraint on (email, year)
- [x] Add `judge_participations` table
  - [x] Fields: id, email, full_name, year, application_date, accepted, judge_type, experience_level, source_channel, company_affiliation, invited_date, responded, created_at
  - [x] Add UNIQUE constraint on (email, year)
- [x] Create indexes for email campaign queries
  - [x] Index on `supplier_participations(email, year)`
  - [x] Index on `judge_participations(email, year)`
  - [x] Additional indexes on year and invited_date for performance
- [ ] Test migration locally (skipped - will test on remote)
- [ ] Deploy migration to remote database

---

## Phase 2: Import Historical Data ✅

### 2.1 Create Import Script Framework
- [x] Create `scripts/import-historical-data.ts`
- [x] Add Supabase client setup with service role
- [x] Add CSV parsing utilities
- [x] Add fuzzy matching utilities (for name matching)
- [x] Add logging/error handling
- [x] Create package.json with dependencies

### 2.2 Import 2024 Judges
- [x] Parse `Heat_Awards_2024_Judges.csv`
- [x] Implement judge type classification logic:
  - [x] Company names in Source-affiliation → `judge_type = 'supplier'`
  - [x] "PRO" or "SOF" → `judge_type = 'pro'`
  - [x] Social platforms (Facebook/Telegram/WhatsApp) → `judge_type = 'community'`
- [x] Store source channel (Facebook, Telegram, etc.) in `source_channel`
- [x] Store company names in `company_affiliation`
- [x] Handle missing emails (skip and log)
- [x] Insert into `judge_participations` with `year = 2024`
- [ ] Test import with sample data
- [ ] Review logs for data quality issues

### 2.3 Import 2025 Judges
- [x] Parse `Judge_applications_2025_awards.csv`
- [x] Map experience levels to judge types:
  - [x] "Professional Chili Person" → `pro`
  - [x] "Experienced Food / Chili Person" → `pro`
  - [x] "Very Keen Amateur Food / Chili Person" → `community`
- [x] Extract application date from "Date Submitted"
- [x] Insert into `judge_participations` with `year = 2025`
- [ ] Test import
- [ ] Verify data accuracy

### 2.4 Import 2026 Judges
- [x] Parse `Judge_applications_2026_awards.csv`
- [x] Use same mapping logic as 2025
- [x] Insert into `judge_participations` with `year = 2026`
- [ ] Test import
- [ ] Verify data accuracy

### 2.5 Import 2025 Suppliers
- [x] Parse `Enriched_Chillifest_Results_2025.csv`
- [x] Extract unique companies by email (COMPANY + EMAIL columns)
- [x] Count sauce entries per company
- [x] Detect awards (check AWARD column for GOLD/SILVER/BRONZE)
- [x] Set `has_awards = true` if any awards found
- [x] Insert into `supplier_participations` with `year = 2025`
- [ ] Test import
- [ ] Verify supplier counts and award detection

### 2.6 Cross-Reference Matching
- [x] Implement exact email matching (suppliers ↔ judges)
- [x] Implement fuzzy name matching framework (TODO: enhance)
- [x] Update judge records where supplier match found:
  - [x] Set `judge_type = 'supplier'` if not already set
  - [x] Store company name in `company_affiliation`
- [x] Log all matches for review
- [ ] Test matching logic
- [ ] Review match accuracy

### 2.7 Sync Contact Data
- [x] Upsert latest judge info into `judges` table (by email)
- [x] Upsert latest supplier info into `suppliers` table (by email)
- [x] Handle conflicts (latest data wins)
- [ ] Test sync process
- [ ] Verify data integrity

### 2.8 Testing & Validation
- [x] Install script dependencies (`cd eu-hot-sauce-awards && npm install`)
- [x] Set environment variables (PROJECT_URL, SERVICE_ROLE_KEY)
- [x] Run full import script end-to-end
- [x] Validate data counts:
  - [x] 2024 judges: 107 imported (2 skipped - no email)
  - [x] 2025 judges: 125 imported
  - [x] 2026 judges: 50 imported
  - [x] 2025 suppliers: 43 imported
- [x] Check for duplicate records (handled by UNIQUE constraint)
- [x] Review cross-reference matches (2 exact matches found)
- [x] Check for data anomalies (all clean!)

---

## Phase 3: Edge Function Updates ✅

### 3.1 Update supplier-intake Function
- [x] Add participation tracking on successful supplier registration
- [x] Insert into `supplier_participations` with current year (2026)
- [x] Count sauce entries for the participation record
- [x] Insert into `judge_participations` with `judge_type='supplier'`
- [x] Add name field to judges table upsert
- [x] Both participations use UPSERT with (email, year) constraint
- [ ] Test with sample payload
- [ ] Deploy to remote

### 3.2 Update judge-intake Function
- [x] Add participation tracking on successful judge registration
- [x] Insert into `judge_participations` with current year (2026)
- [x] Set `accepted=false` by default for new judges
- [x] Add `source_channel='wordpress'` for tracking
- [ ] Test with sample payload
- [ ] Deploy to remote

### 3.3 Update actions.ts for Year-Aware Queries
- [x] Update `generateStickerData()` to query `judge_participations` by year
- [x] Update `generateJudgeQRCodes()` to query `judge_participations` by year
- [x] Update `recordBottleScan()` to validate against current year participation
- [x] Remove all `active=true` queries, replaced with year-based queries
- [ ] Test PDF generation with 2026 judges only
- [ ] Test QR code generation with 2026 judges only
- [ ] Test bottle scanning with year validation

### 3.4 Testing Edge Functions & Actions
- [ ] Test supplier-intake creates participation records (both tables)
- [ ] Test judge-intake creates participation record
- [ ] Test PDF generation only includes 2026 judges
- [ ] Test QR code generation only includes 2026 judges
- [ ] Test bottle scanning validates 2026 participation
- [ ] Verify no data loss or type conflicts

---

## Phase 4: Email Campaign Infrastructure ⏳

### 4.1 Create Campaign Query Templates
- [ ] Document query: VIP award winners (2024/2025)
- [ ] Document query: Past suppliers not in 2026
- [ ] Document query: Non-supplier judges (2024/2025)
- [ ] Document query: Loyal multi-year judges
- [ ] Document query: Exclude already invited (check invited_date)
- [ ] Test all queries with sample data
- [ ] Create campaign execution guide

### 4.2 Campaign Tracking
- [ ] Add `invited_date` update mechanism
- [ ] Add `responded` tracking mechanism
- [ ] Document how to mark campaigns as sent
- [ ] Document how to track responses

---

## Phase 5: 2024 Supplier Integration (WAITING ON DATA) ⏸️

### 5.1 Import 2024 Supplier Data
- [ ] Receive 2024 supplier email addresses
- [ ] Add 2024 supplier CSV parsing to import script
- [ ] Count sauce entries per 2024 supplier
- [ ] Detect 2024 award winners
- [ ] Insert into `supplier_participations` with `year = 2024`
- [ ] Test import

### 5.2 Cross-Reference with 2024 Judges
- [ ] Run exact email match (2024 suppliers ↔ 2024 judges)
- [ ] Run fuzzy name match
- [ ] Update judge records with supplier affiliations
- [ ] Log all matches

### 5.3 Complete Award Winner Tracking
- [ ] Verify all award winners marked correctly
- [ ] Test VIP campaign queries include 2024 winners
- [ ] Document award winner counts by year

---

## Testing & Deployment Checklist

### Local Testing
- [ ] Test all migrations apply cleanly
- [ ] Test import script with all CSV files
- [ ] Verify data accuracy in local database
- [ ] Test edge function updates locally
- [ ] Test email campaign queries

### Remote Deployment
- [ ] Push migrations to remote database
- [ ] Run import script against remote database
- [ ] Deploy updated edge functions
- [ ] Verify remote data integrity
- [ ] Test end-to-end flow (new registrations → participation tracking)

### Documentation
- [ ] Document import process
- [ ] Document email campaign queries
- [ ] Document participation tracking system
- [ ] Document how to handle future years

---

## Notes & Issues

### Data Quality Issues Found:
- 2 judges from 2024 skipped (Miles Lloyd, Thorsten Schneider) - no email addresses
- Only 2 exact email matches found between suppliers and judges (more may exist in 2024 supplier data)

### Decisions Made:
- Judge type classification: PRO/SOF → 'pro', social platforms → 'community', companies → 'supplier'
- Fuzzy matching enabled for cross-referencing
- Email campaigns will be executed after all historical data is imported
- Year-aware queries: All judging operations (PDFs, QR codes, bottle scanning) now filter by current year
- Participation tracking: Both edge functions (judge-intake, supplier-intake) now track participations automatically

### Completed Work Summary:
**Phase 1 (Database)**: ✅ Migration created with participation tracking tables
**Phase 2 (Import)**: ✅ Successfully imported 282 judges + 43 suppliers across 3 years
**Phase 3 (Code Updates)**: ✅ Edge functions and actions.ts updated for year-aware queries

### Files Modified:
- `/home/nathan/EUHA/supabase/migrations/20251106000102_create_participation_tracking.sql`
- `/home/nathan/EUHA/eu-hot-sauce-awards/scripts/import-historical-data.ts`
- `/home/nathan/EUHA/supabase/functions/judge-intake/index.ts`
- `/home/nathan/EUHA/supabase/functions/supplier-intake/index.ts`
- `/home/nathan/EUHA/eu-hot-sauce-awards/src/app/actions.ts`

### Future Enhancements:
- Import 2024 supplier data when available
- Enhance fuzzy matching for better supplier-judge cross-referencing
- Build email campaign UI/automation tools
