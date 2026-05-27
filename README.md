# GWP Recovery Platform

GWP Recovery Platform is a Next.js application for eating-disorder recovery support. It brings together urgent resources, moderated stories, reflection tools, private account flows, and subscription billing.

Live app: https://gwp-recovery-platform.netlify.app/

Repository: https://github.com/olena-ageyeva/gwp-recovery-platform

## Tech Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- shadcn-style local UI components
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Stripe Billing
- Netlify deployment
- Vitest unit tests

## Local Setup

Clone the repo:

```bash
git clone https://github.com/olena-ageyeva/gwp-recovery-platform.git
cd gwp-recovery-platform
npm install
```

Create a local env file:

```bash
cp .env.example .env.local
```

Ask the project owner for development Supabase and Stripe values. Do not commit `.env.local`.

Run the app:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Environment Variables

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_STORAGE_BUCKET=gwp-user-files
NEXT_PUBLIC_SITE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_LIGHT_PRICE_ID=
STRIPE_PLUS_PRICE_ID=
STRIPE_FAMILY_PRICE_ID=
```

For local development:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For Netlify:

```env
NEXT_PUBLIC_SITE_URL=https://gwp-recovery-platform.netlify.app
```

Use Stripe test keys and test product/price IDs while developing.

## Useful Commands

```bash
npm run dev
npm run build
npm test
```

`npm run build` verifies the Next.js production build. `npm test` runs unit tests for billing logic protections.

## Project Structure

Key directories:

```txt
app/
  api/billing/        Stripe checkout, portal, and webhook routes
  billing/success/    Checkout success page
  find-support/       Subscription/pricing page
  find-help/          Urgent help page
  heal/ live/ give/   Main content pages
  stories/            Stories page

components/
  auth/               Login/signup/account UI
  billing/            Checkout and billing portal buttons
  find-support/       Pricing cards and tiers
  layout/             Shared nav and footer
  pages/              Page-level content components
  ui/                 Shared UI primitives

lib/
  billing/            Stripe config, plans, and billing helpers
  supabase/           Supabase clients

supabase/
  schema.sql          Initial database schema
  billing.sql         Billing migration
```

## Supabase Setup

Run the initial schema in Supabase SQL Editor:

```txt
supabase/schema.sql
```

If the initial schema is already installed and only billing needs to be added, run:

```txt
supabase/billing.sql
```

The app uses Supabase Auth for login/signup and stores profile/subscription records in Supabase Postgres.

## Stripe Setup

Create Stripe products/prices in test mode or sandbox:

- Light: `$12/year`, shown as `$1/month billed annually`
- Plus Preview: `$60/year`, shown as `$5/month billed annually`
- Family Preview: `$228/year`, shown as `$19/month billed annually`

Use the Stripe IDs in env vars:

```env
STRIPE_LIGHT_PRICE_ID=price_or_prod_id
STRIPE_PLUS_PRICE_ID=price_or_prod_id
STRIPE_FAMILY_PRICE_ID=price_or_prod_id
```

The checkout API accepts either `price_...` IDs or `prod_...` IDs with a default price.

Webhook endpoint:

```txt
https://gwp-recovery-platform.netlify.app/api/billing/webhook
```

Webhook events:

```txt
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
```

## Contribution Workflow

Main branch is protected. Please do not commit directly to `main`.

Suggested workflow:

```bash
git checkout main
git pull
git checkout -b feature/short-description
```

Make changes, then run:

```bash
npm test
npm run build
```

Push your branch and open a pull request.

Netlify creates deploy previews and runs the production build for review before merge.

## Pull Request Checklist

Before requesting review:

- Run `npm test`
- Run `npm run build`
- Confirm no secrets are committed
- Include screenshots for UI changes
- Include setup notes for new env vars, database changes, or Stripe changes
- Confirm Netlify deploy preview passes

## Current Review Areas

Useful areas for contributors to test:

- Signup/login flow
- Account dialog
- Subscription page
- Stripe test checkout
- Billing portal behavior
- Stories page with videos and text stories
- Mobile navigation
- Supabase profile creation
- Billing error handling

## Security Notes

Never commit:

- `.env.local`
- Stripe secret keys
- Supabase secret keys
- webhook secrets
- production credentials

Only `NEXT_PUBLIC_...` variables are safe for browser exposure. Server secrets must stay in local env files or Netlify environment variables.
