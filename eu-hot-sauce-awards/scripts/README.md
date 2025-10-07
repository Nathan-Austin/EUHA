# Import Scripts

## 2025 Results Import

This script imports the 2025 competition results into the database.

### Prerequisites

1. **Database migrations applied:**
   ```bash
   cd /home/nathan/EUHA
   supabase db push
   ```

2. **CSV files in place:**
   - `past_results/2025_results_and_placements.csv`
   - `past_results/Enriched_Chillifest_Results - Enriched_Chillifest_Results.csv`

3. **Product images (optional):**
   - Place images in `past_results/images/` with filenames matching the sauce CODE (e.g., `B593.jpg`, `X499.png`)
   - Or use the URLs already in the enriched CSV

4. **Environment variables:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

### Running the Import

```bash
# From project root
cd /home/nathan/EUHA

# Install tsx if not already installed
npm install -g tsx

# Run the import
npx tsx eu-hot-sauce-awards/scripts/import-2025-results.ts
```

### What the Script Does

1. **Reads** both CSV files
2. **Merges** data by sauce CODE
3. **Parses** awards and global rankings
4. **Uploads** product images to Supabase Storage (`past-results-images/2025/`)
5. **Inserts** enriched data into `past_results` table

### Expected Output

```
🌶️  Starting 2025 results import...

📊 Loaded 338 basic results
📊 Loaded 138 enriched results

✅ Merged 338 results

✅ Inserted #1: Dragon's Breath (X499)
✅ Inserted #2: Sweet Yellow (M813)
...
✅ Inserted: BBQ sauce (B593)

🎉 Import complete!
✅ Successfully imported: 338
❌ Errors: 0
```

### Troubleshooting

**Error: "Missing Supabase credentials"**
- Make sure `.env` file has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

**Error: "duplicate key value violates unique constraint"**
- The script has already been run. Clear the `past_results` table first:
  ```sql
  DELETE FROM past_results WHERE year = 2025;
  ```

**Images not uploading:**
- Check that the `past-results-images` bucket exists in Supabase Storage
- Verify image file paths and formats (JPG, PNG supported)
- Run migration: `supabase/migrations/20251007100401_create_past_results_storage.sql`

### Viewing Results

After import:
- **All results:** `http://localhost:3000/results/2025`
- **Top 20 rankings:** `http://localhost:3000/rankings`

### Data Structure

The imported data includes:
- ✅ Core identification (area, code, category, award, rank)
- ✅ Company information (name, contact, website, country)
- ✅ Product details (name, description, flavor profile, images)
- ✅ Pricing & availability
- ✅ External links (product URL, company website)
