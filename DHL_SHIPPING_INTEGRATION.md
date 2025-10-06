# DHL Shipping Integration - Future Enhancement

## Overview
Automatically generate DHL shipping labels when all 12 sauces are assigned to a box.

## Workflow
1. Admin assigns sauces to boxes via `assignSaucesToBox` action
2. When a box reaches 12 sauces (full), trigger DHL API call
3. Generate shipping label via DHL Business API
4. Send label to packing sticker printer
5. Update box record with tracking number

## Implementation Points

### 1. DHL API Integration
- Endpoint: DHL Business Shipping API
- Required: DHL Business account credentials
- Store as Supabase secrets:
  - `DHL_API_KEY`
  - `DHL_API_SECRET`
  - `DHL_ACCOUNT_NUMBER`

### 2. Database Changes
Add to `box_assignments` or create new `boxes` table:
```sql
- dhl_tracking_number: text
- shipping_label_url: text
- label_printed_at: timestamptz
```

### 3. Code Changes
- Create `/api/generate-dhl-label` API route
- Update `assignSaucesToBox` to check box capacity
- Call DHL API when box is full
- Store tracking number and label URL

### 4. Printer Integration
- Network printer setup
- Direct print from API or download PDF
- Confirmation/retry logic

## Current Box Assignment Logic
Location: `src/app/actions.ts` - `assignSaucesToBox()`
- Currently assigns sauces to boxes manually
- Updates sauce status to 'boxed'
- No automatic shipping label generation yet

## Files to Modify When Implementing
- `src/app/actions.ts` - Add DHL API call after box assignment
- `src/app/api/generate-dhl-label/route.ts` - New API endpoint
- Database migration - Add tracking fields
- Supabase secrets - Add DHL credentials

## Testing Considerations
- Use DHL sandbox API for development
- Test with different box configurations
- Handle API failures gracefully
- Implement retry logic for printer failures
