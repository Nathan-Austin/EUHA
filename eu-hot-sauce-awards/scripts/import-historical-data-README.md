# Historical Data Import Scripts

This directory contains scripts to import historical judge and supplier data from CSV files into the participation tracking system.

## Prerequisites

1. **Supabase credentials**: Set environment variables
   ```bash
   export PROJECT_URL="your-supabase-project-url"
   export SERVICE_ROLE_KEY="your-service-role-key"
   ```

2. **Install dependencies**:
   ```bash
   cd scripts
   npm install
   ```

## Running the Import

```bash
npm run import
```

This will:
1. Import 2024 judges from `Heat_Awards_2024_Judges.csv`
2. Import 2025 judges from `Judge_applications_2025_awards.csv`
3. Import 2026 judges from `Judge_applications_2026_awards.csv`
4. Import 2025 suppliers from `Enriched_Chillifest_Results_2025.csv`
5. Cross-reference suppliers with judges (exact + fuzzy matching)
6. Sync latest contact data to main `judges` and `suppliers` tables

## What Gets Imported

### 2024 Judges
- Classifies judge types based on `Source-affiliation` column:
  - `"PRO"` or `"SOF"` → professional judge
  - Social platforms (Facebook, Telegram, etc.) → community judge
  - Company names → supplier-judge
- Stores source channel and company affiliations

### 2025 & 2026 Judges
- Maps experience levels to judge types:
  - Professional/Experienced → `pro`
  - Amateur → `community`
- Extracts application dates and affiliation details

### 2025 Suppliers
- Groups sauce entries by company email
- Counts total sauces per supplier
- Detects award winners (GOLD/SILVER/BRONZE)

### Cross-Referencing
- Matches suppliers with judges by email
- Updates judge type to `supplier` when match found
- Stores company affiliation

## Output

The script logs progress and any errors encountered. Review the output to verify:
- Import counts for each year
- Cross-reference matches
- Any skipped records (e.g., missing emails)

## Troubleshooting

**Missing emails**: Some 2024 judges have no email and will be skipped. Check the logs for details.

**Duplicate records**: The script uses `upsert` with `(email, year)` constraint to handle duplicates safely.

**Wrong classification**: If a judge type is incorrectly classified, you can manually update it in the `judge_participations` table.
