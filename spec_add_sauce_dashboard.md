# Feature Specification: In-Dashboard Sauce Registration

**Date:** January 22, 2026  
**Status:** Draft  
**Target Audience:** Development Team

## Executive Summary

**Objective:** Allow authenticated suppliers to register additional sauces directly from their dashboard (`/dashboard`) without re-entering their brand/contact details or logging out to use the public form.

**Difficulty Level:** **Low-Medium**  
The backend logic (`supplier-intake` Edge Function) already supports "upsert" logic, meaning it gracefully handles existing users adding new entries. The primary work is frontend refactoring to create a reusable "Sauce Entry Form" component.

---

## Architecture Analysis

### Current State
*   **Public Flow:** `apply/supplier/page.tsx` is a monolithic component containing form state, UI, validation, and API submission logic.
*   **Backend:** `supplier-intake` accepts a payload including email. If the email exists, it attaches new sauces to the existing supplier and creates a new payment record.
*   **Dashboard:** `dashboard/page.tsx` renders `SupplierDashboard` for suppliers. It currently shows status and pending payments.

### Proposed Architecture
1.  **Reuse:** Extract the sauce entry form logic from `apply/supplier/page.tsx` into a reusable component (`<SauceEntryForm />`).
2.  **New Route:** Create a new authenticated route `dashboard/add-sauce` that uses this component.
3.  **Context:** The new route will pre-fill "Brand", "Contact Name", "Email", and "Address" from the authenticated user's profile and lock these fields (read-only).

---

## Implementation Steps

### Phase 1: Frontend Refactoring (The "Hard" Part)
*Goal: Break the monolithic registration page into reusable parts.*

1.  **Create `components/sauce-entry/SauceEntryForm.tsx`**:
    *   Move the state management (`sauces`, `addSauce`, `removeSauce`) and the UI for the sauce list here.
    *   **Props:**
        *   `initialValues` (Optional): To pre-fill brand/contact info.
        *   `isAuthenticated` (Boolean): To toggle "read-only" mode for contact fields.
        *   `onSubmit`: Handler for the form submission.

2.  **Refactor `app/apply/supplier/page.tsx`**:
    *   Import the new `<SauceEntryForm />`.
    *   Pass `isAuthenticated={false}`.
    *   Ensure the public flow remains exactly the same to the end user.

### Phase 2: Dashboard Integration

1.  **Create `app/dashboard/add-sauce/page.tsx`**:
    *   **Server Component:** Fetch the current user's supplier details from Supabase (`brand_name`, `contact_name`, `address`).
    *   **Render:** Render `<SauceEntryForm />` passing the fetched data as `initialValues` and `isAuthenticated={true}`.

2.  **Update `components/SupplierDashboard.tsx`**:
    *   Add a visible CTA button: **"Add More Sauces"**.
    *   Link this button to `/dashboard/add-sauce`.

### Phase 3: Backend & API
*Goal: Ensure secure submission.*

1.  **No Edge Function Changes Required:**
    *   The `supplier-intake` function already looks up users by email.
    *   **Security Note:** In the authenticated form (`dashboard/add-sauce`), the `email` field must be **read-only** and set to the current user's email. This ensures they cannot submit sauces for a different email address.

2.  **Payment Redirect:**
    *   The `supplier-intake` response returns a `payment` object.
    *   The dashboard flow must handle this response exactly like the public flow: show a summary modal/step, then call `supplier-checkout` to redirect to Stripe.

---

## Risk Assessment

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Email Spoofing** | Medium | In the dashboard version of the form, the email input **must** be disabled (read-only) so the user cannot change it to someone else's email. |
| **Duplicate Payments** | Low | The system generates a unique `supplier_payments` record for each submission. This is already handled correctly by the backend. |
| **Data Consistency** | Low | If the user changes their address in the "Add Sauce" form, the backend `upsert` will update their main profile address. This is likely desired behavior. |

## Effort Estimate

*   **Refactoring:** 2-3 hours (Careful extraction of logic).
*   **New Page Creation:** 1 hour.
*   **Testing:** 1 hour (Verify both public and private flows).
*   **Total:** ~4-5 hours.

## Conclusion

This feature is highly feasible and leverages the robust backend logic already in place. The investment is primarily in code cleanup (refactoring), which will improve the codebase's long-term maintainability.
