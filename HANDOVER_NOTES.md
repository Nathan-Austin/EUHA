# Project Handover & Deployment Checklist

This document outlines the necessary steps to set up and deploy the EU Hot Sauce Awards platform on a new machine and to a new hosting environment.

## 1. Local Machine Setup

### Prerequisites
- Node.js installed
- Git installed
- Supabase CLI installed (`npm install -g supabase`)

### Initial Setup
1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Log in to Supabase:**
    ```bash
    supabase login
    ```

3.  **Link the Supabase Project:**
    Replace `<project-ref>` with the project reference from your Supabase dashboard URL (`https://app.supabase.com/project/<project-ref>`).
    ```bash
    supabase link --project-ref <project-ref>
    ```

## 2. Configure Secrets

The following secret keys and environment variables must be set for the backend functions to work.

### Supabase Edge Function Secrets
Run these commands in your terminal. These secrets are stored securely on Supabase infrastructure.

1.  **`PROJECT_URL`**: Found in your Supabase Dashboard under **Project Settings > API**.
    ```bash
    supabase secrets set PROJECT_URL="your-project-url"
    ```

2.  **`SERVICE_ROLE_KEY`**: Found in your Supabase Dashboard under **Project Settings > API**. **Keep this secret!**
    ```bash
    supabase secrets set SERVICE_ROLE_KEY="your-service-role-key"
    ```

3.  **`STRIPE_SECRET_KEY`**: Your main Stripe secret key (`sk_live_...`). Found in your Stripe Dashboard. **Keep this secret!**
    ```bash
    supabase secrets set STRIPE_SECRET_KEY="your-stripe-secret-key"
    ```

4.  **`STRIPE_WEBHOOK_SIGNING_SECRET`**: This is generated after you create a webhook endpoint in Stripe that points to your deployed `stripe-webhook` function.
    ```bash
    supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET="your-webhook-signing-secret"
    ```

## 3. Deploy Backend Functions

Deploy all the edge functions to Supabase:
```bash
supabase functions deploy
```

After deploying, you can get the URL for the `stripe-webhook` function to complete step 2.4.

## 4. Vercel Frontend Setup

1.  **Connect to GitHub:** Ensure the project is on a GitHub account that you will connect to Vercel.
2.  **Create a New Vercel Project:** Import the GitHub repository in Vercel.
3.  **Set Environment Variables:** In the Vercel project settings, add the following environment variables. These are safe for the frontend.
    - `NEXT_PUBLIC_SUPABASE_URL`: Your project's Supabase URL.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your project's public `anon` key.

---
*This is a living document. Update it as new deployment or configuration steps are added.*
