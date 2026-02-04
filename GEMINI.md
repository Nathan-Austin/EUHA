# GEMINI.md

## Project Context
**Project Name:** EU Hot Sauce Awards
**Description:** A comprehensive judging platform for the European Hot Sauce Awards. It handles the entire lifecycle of the competition: registration (suppliers/judges), payments (Stripe), logistics (box packing, bottle scanning), judging (QR codes, weighted scoring), and results.
**Tech Stack:** Next.js 14 (App Router), TypeScript, Supabase (Auth, Database, Storage, Edge Functions), Stripe, Tailwind CSS.
**Version:** 2026 Competition System (Rebuilt from WordPress).

## Architecture

### Frontend (`eu-hot-sauce-awards/`)
-   **Framework:** Next.js 14 (App Router).
-   **Language:** TypeScript.
-   **Styling:** Tailwind CSS.
-   **State Management:** React Hooks + Local Storage (for offline judging support).
-   **Path Aliases:** `@/*` maps to `./src/*`.

### Backend (`supabase/`)
-   **Database:** PostgreSQL (Supabase).
-   **Auth:** Supabase Auth (Magic Links).
-   **Edge Functions:** TypeScript (Deno). Used for:
    -   `supplier-intake` / `judge-intake`: Registration webhooks.
    -   `stripe-checkout` / `supplier-checkout`: Payment sessions.
    -   `stripe-webhook`: Payment confirmation & status updates.

### Key Workflows
1.  **Registration:** Users apply via web forms -> Edge Functions -> DB.
2.  **Payments:** Stripe Checkout -> Webhook -> DB update (`judges.stripe_payment_status`).
3.  **Judging:**
    -   Judges scan QR codes on bottles.
    -   Scores are saved to `localStorage` first (prevents data loss).
    -   Bulk submission sends scores to `judging_scores`.
4.  **Admin:**
    -   **Box Packing:** QR scanner checks conflicts and assigns sauces to boxes.
    -   **Results:** Weighted average calculation based on judge type.

## Key Directories & Files

-   **Frontend Root:** `eu-hot-sauce-awards/` (Run all `npm` commands here).
-   **Server Actions:** `eu-hot-sauce-awards/src/app/actions.ts`
    -   Contains critical business logic for status updates, bulk scoring, and results export.
    -   **Note:** Judge Weights are defined here (`pro: 2.0`, `community: 1.0`, `supplier: 1.0`).
-   **Database Schema:** `supabase/migrations/`
    -   `suppliers`, `sauces`, `judges`, `judging_categories`, `judging_scores`.
-   **Edge Functions:** `supabase/functions/`

## Common Commands

### Frontend Development
*Run inside `eu-hot-sauce-awards/`*
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Backend / Database
*Run inside project root*
```bash
supabase functions deploy               # Deploy all edge functions
supabase db push                        # Push local migrations to remote DB
supabase db reset                       # Reset local database
```

## Development Standards

-   **Weighting Logic:** Pro Judges have a weight of 2.0. Community and Supplier Judges have a weight of 1.0. This is defined in `actions.ts`.
-   **Sauce Codes:** Unique codes (e.g., `D001`, `H042`) are auto-generated based on category letters.
-   **Environment Variables:**
    -   Frontend: `.env.local` (Supabase URL/Key, Stripe Public Key).
    -   Backend: Managed via `supabase secrets set`.
-   **Git/Deployment:**
    -   Vercel for Frontend.
    -   Supabase for Backend.

## Conventions
-   **Imports:** Use absolute imports (`@/components/...`) where possible.
-   **Testing:** Critical flows (judging, payments) should be verified carefully. Local storage logic is key for the judging experience.
