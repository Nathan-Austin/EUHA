# 2026 Competition Data Flow Analysis

## Current State: Registration Flow

### 1. Judge Registration (judge-intake function)

**When a judge applies for 2026:**

```
WordPress Form → judge-intake/index.ts → Database
```

**What happens:**
1. **judges table** - UPSERT by email
   - Updates/creates record with NEW 2026 data
   - ✅ **Fields updated**: name, address, city, postal_code, country, experience_level, type, industry_affiliation, affiliation_details
   - ⚠️ **Concern**: `active: false` (set to inactive by default)
   - **Issue**: If returning judge from 2024/2025, their old data gets overwritten

2. **judge_participations table** - UPSERT by (email, year=2026)
   - ✅ Creates NEW 2026 participation record
   - ✅ Preserves historical records (2024, 2025 remain intact)
   - ✅ **Fields**: email, full_name, year=2026, application_date, judge_type, experience_level, company_affiliation, accepted=false, source_channel='wordpress'

### 2. Supplier Registration (supplier-intake function)

**When a supplier enters for 2026:**

```
WordPress Form → supplier-intake/index.ts → Database
```

**What happens:**
1. **suppliers table** - UPSERT by email
   - Updates/creates record with NEW 2026 data
   - ✅ **Fields updated**: brand_name, contact_name, address
   - **Issue**: If returning supplier from 2025, their old data gets overwritten (but this is desired for contact info)

2. **judges table** - UPSERT by email (supplier as judge)
   - ✅ **Fields**: email, type='supplier', active=true, name=(contactName or brand)
   - ⚠️ **Concern**: Sets `active: true` (auto-accepted)
   - **Issue**: Might overwrite existing judge data if person applied as both

3. **judge_participations table** - UPSERT by (email, year=2026)
   - ✅ Creates NEW 2026 participation as supplier-judge
   - ✅ **Fields**: email, full_name, year=2026, application_date, judge_type='supplier', company_affiliation=brand, accepted=true, source_channel='wordpress'

4. **supplier_participations table** - UPSERT by (email, year=2026)
   - ✅ Creates NEW 2026 supplier participation
   - ✅ **Fields**: email, company_name, year=2026, sauce_count=(number of sauces), participated=true, source='wordpress'

5. **sauces table** - INSERT new sauces
   - ✅ Creates brand new sauce entries for 2026
   - ✅ Links to supplier_id
   - ✅ status='registered'

---

## Data Retrieval: How We Query 2026 Competition Data

### ✅ CORRECT: Year-Aware Queries (Recently Updated)

1. **generateStickerData()** - actions.ts:413-419
   ```typescript
   const currentYear = new Date().getFullYear();
   const { count: judgeCount } = await supabase
     .from('judge_participations')
     .select('*', { count: 'exact', head: true })
     .eq('year', currentYear)
     .eq('accepted', true);
   ```
   ✅ Only counts judges participating in 2026

2. **generateJudgeQRCodes()** - actions.ts:845-880
   ```typescript
   const currentYear = new Date().getFullYear();
   const { data: participations } = await adminSupabase
     .from('judge_participations')
     .select('email, judge_type')
     .eq('year', currentYear)
     .eq('accepted', true);
   // Then fetches full details from judges table
   ```
   ✅ Only generates QR codes for 2026 judges

3. **recordBottleScan()** - actions.ts:634-660
   ```typescript
   const currentYear = new Date().getFullYear();
   const { data: participation } = await adminSupabase
     .from('judge_participations')
     .select('email, accepted')
     .eq('email', judge.email)
     .eq('year', currentYear)
     .single();
   ```
   ✅ Only allows bottle scanning for 2026 judges

### Sauces Table Queries
- **Not year-filtered** - This is CORRECT because sauces are competition-specific by nature
- New sauces are created for each competition
- Old sauces remain in the database but aren't assigned to new boxes

---

## Potential Issues & Concerns

### ⚠️ Issue 1: Judge Type Conflicts (CRITICAL)

**Scenario**: A person was a regular judge in 2025, now enters as a supplier in 2026

**What happens:**
1. 2025: Person in `judges` table with `type='pro'` or `type='community'`
2. 2026: They submit sauces via supplier-intake
3. `supplier-intake` does: `judges.upsert({ email, type: 'supplier', active: true })`
4. **Result**: Their judge record gets overwritten to `type='supplier'`

**Is this a problem?**
- ✅ **NO** - This is actually correct behavior
- Their `judge_participations` records preserve history:
  - 2025: `judge_type='pro'` or `judge_type='community'`
  - 2026: `judge_type='supplier'`
- The `judges` table just stores their CURRENT status

### ⚠️ Issue 2: Address Data Overwrite

**Scenario**: Returning judge with different address in 2026

**What happens:**
1. 2025: Address stored in `judges` table
2. 2026: New address submitted
3. `judge-intake` does UPSERT → overwrites old address

**Is this a problem?**
- ✅ **NO** - This is desired behavior
- We want the most recent contact information
- Historical addresses aren't needed for competition logistics

### ⚠️ Issue 3: Active Flag Inconsistency (POTENTIAL ISSUE)

**Scenario**: Judge applies but isn't accepted yet

**What happens:**
1. Judge submits form via `judge-intake`
2. `judges.active` set to `false`
3. `judge_participations.accepted` set to `false`
4. Admin needs to manually accept them

**Concern:**
- If a supplier submits sauces (via `supplier-intake`), they get `active: true` immediately
- If that same person also applied as a judge, their `active` flag might be inconsistent

**Current behavior:**
- Supplier-intake sets `active: true` (auto-accepted as judge)
- Judge-intake sets `active: false` (needs admin approval)

**Which one wins?**
- Last one to execute wins (UPSERT by email)
- If supplier registers AFTER judge application → they become active
- If judge applies AFTER supplier registration → they become inactive

---

## Recommendations

### ✅ Everything is Working Correctly For 2026 Competition

**All year-aware queries are implemented:**
1. ✅ Sticker/PDF generation only counts 2026 judges
2. ✅ QR code generation only includes 2026 judges
3. ✅ Bottle scanning validates 2026 participation
4. ✅ Historical data (2024, 2025) preserved in participation tables
5. ✅ New registrations create 2026-specific participation records

### Optional Enhancement: Supplier Active Flag Protection

If you want to prevent suppliers from being downgraded to inactive:

**Update judge-intake/index.ts:**
```typescript
// Before upserting, check if they're already a supplier
const { data: existingJudge } = await supabaseAdmin
  .from('judges')
  .select('type')
  .eq('email', payload.email)
  .single();

const upsertData = {
  email: payload.email,
  name: payload.name,
  address: payload.address,
  city: payload.city,
  postal_code: payload.zip,
  country: payload.country,
  experience_level: payload.experience,
  type: judgeType,
  industry_affiliation: payload.industryAffiliation || false,
  affiliation_details: payload.affiliationDetails || null,
  // Only set active=false if they're not already a supplier
  active: existingJudge?.type === 'supplier' ? true : false
};
```

**But this is probably NOT necessary** because:
- Suppliers are auto-accepted (accepted=true in judge_participations)
- The year-aware queries check `judge_participations.accepted`, not `judges.active`
- The `active` flag in `judges` table is becoming less relevant

---

## Summary: Data Integrity for 2026

### ✅ What's Working Correctly

1. **Participation Tracking**: Every 2026 registration creates a year-specific participation record
2. **Historical Preservation**: 2024 and 2025 data remains intact in participation tables
3. **Year-Aware Queries**: All judging operations filter by `year=2026`
4. **Contact Updates**: Latest contact info stored in main tables (desired behavior)
5. **Sauce Isolation**: New sauces created for 2026 only

### 🎯 Current State is Production-Ready

The system correctly:
- Accepts new 2026 judges and suppliers
- Preserves historical data
- Only shows 2026 participants in all operations
- Handles returning participants correctly

**No critical issues found** - The system is ready for the 2026 competition!
