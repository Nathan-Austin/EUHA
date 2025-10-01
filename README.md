# EU Hot Sauce Awards - Platform

This repository contains the frontend application and backend infrastructure for the EU Hot Sauce Awards judging platform.

---

## Application Flow

This document outlines the end-to-end user and data flow for the awards platform, from initial registration on WordPress to final results export.

### Part 1: Supplier & Judge Onboarding (via WordPress)

This phase covers how sauce suppliers and judges are registered in the system.

*   **Step 1: Registration on WordPress**
    *   A new supplier or judge signs up and pays through a form on an external WordPress website.

*   **Step 2: WordPress Webhook Trigger**
    *   Upon successful submission, WordPress sends a webhook containing the registration data (brand name, contact info, sauce details for suppliers; name and type for judges).

*   **Step 3: Supabase Edge Function Intake**
    *   The webhook is received by a dedicated Supabase Edge Function:
        *   `supplier-intake`: For new sauce/supplier registrations.
        *   `judge-intake`: For new judge registrations.

*   **Step 4: Database Population**
    *   The Edge Function processes the data and creates new entries in the Supabase database, specifically in the `suppliers`, `sauces`, and `judges` tables. This officially brings the user into the awards platform ecosystem.

### Part 2: Application Login & Payment

This phase covers how registered users access the platform.

*   **Step 1: Login**
    *   A registered user navigates to the Next.js application and logs in using Supabase Authentication, presumably with the same email used on WordPress.

*   **Step 2: Role-Based Dashboard**
    *   The application checks the user's role (`admin`, `pro`, `community`) from the `judges` table.
    *   It then dynamically renders the correct dashboard for the user.

*   **Step 3: Community Judge Payment (Conditional)**
    *   If the user is a `community` judge and has not yet paid, they are shown a payment prompt.
    *   They complete the payment using a Stripe Checkout session managed by the `stripe-checkout` Edge Function.
    *   A `stripe-webhook` function listens for the successful payment event from Stripe and updates the judge's `stripe_payment_status` in the database, granting them access to the judging features.

### Part 3: The Judging Process

This phase details how judges score sauces.

*   **Step 1: Scan QR Code**
    *   A judge navigates to the "Scan" page from their dashboard and uses their device's camera to scan a QR code on a sauce bottle.

*   **Step 2: Score Sauce**
    *   The QR code redirects them to the unique scoring page for that specific sauce.
    *   The judge enters scores and comments for various categories. As they do, the data is automatically saved to their browser's local storage to prevent data loss.

*   **Step 3: Review Pending Scores**
    *   After scoring, the judge can see a list of all their "Pending" scores on their dashboard. They can go back and edit these scores if needed.

*   **Step 4: Final Submission**
    *   Once they are satisfied with all their scores, the judge clicks "Submit All Final Scores".
    *   This triggers a server action (`submitAllScores`) that takes all the data from local storage and saves it permanently to the `judging_scores` table in the database.

### Part 4: Admin & Logistics

This phase covers the administrative backend functionality.

*   **Step 1: Sauce Status Management**
    *   An admin can view a list of all registered sauces and update their physical status (e.g., from `registered` to `arrived`).

*   **Step 2: Box Assignment**
    *   Once sauces have arrived, the admin uses the "Box Management" interface to digitally group sauces into judging boxes.

*   **Step 3: Export Results**
    *   At any point, the admin can export a complete CSV file of all judging scores, which includes weighted calculations based on judge type (`pro`, `community`).