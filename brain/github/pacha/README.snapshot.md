<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/pacha/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# Pasha International Food & Bar

[![Netlify Status](https://api.netlify.com/api/v1/badges/5d8c44b5-d679-43b5-b57d-ce3c83aa0256/deploy-status)](https://app.netlify.com/projects/pacharestaurant/deploys)

Next.js App Router website and lightweight owner CMS for Pasha International Food & Bar in Bergen.

Package manager: npm.

## Local setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

The public site uses local restaurant images and fallback content until Supabase credentials are configured. Run the SQL in `supabase/migrations` in a Supabase project, add the environment variables, then create an admin user in `admin_users` for CMS access.

For Supabase, set `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Netlify should use the same names. Server-only maintenance keys can use `SUPABASE_SECRET_KEY` or legacy `SUPABASE_SERVICE_ROLE_KEY`, but they are not required for the owner CMS.
