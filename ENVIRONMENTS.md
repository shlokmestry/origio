# Environments

## Local Development
- Run: `npm run dev`
- URL: http://localhost:3000
- Database: origio-dev (Supabase project `pafvtdujnvwuchvjyehm`, eu-west-2)
- Stripe: Test keys → no real charges
- Config: `.env.local`

## Production (Vercel)
- URL: https://findorigio.com
- Database: origio (Supabase project `towrbbimvrsglguprsdk`, eu-west-2)
- Stripe: Live keys → real charges
- Config: Vercel environment variables (Production only)

## Dev Supabase Keys
- URL: https://pafvtdujnvwuchvjyehm.supabase.co
- Anon key: in `.env.local`
- Service role key: Supabase dashboard → origio-dev → Settings → API

## Workflow
1. `npm run dev` → local → DEV database
2. Test freely — create accounts, break things, run wizard
3. `git push` → Vercel auto-deploys → PROD database
4. Verify on findorigio.com

## Auth URL Config
- DEV Supabase: add `http://localhost:3000` + `http://localhost:3000/**` to allowed URLs
- PROD Supabase: `https://findorigio.com` + `https://findorigio.com/**`

## ⚠ Never
- Use `.env.local` Supabase URL in Vercel
- Use live Stripe keys locally
- Share `.env.local` or `.env.production.local`
- Push untested code to main

## Rollback
- Code: `git revert [hash] && git push`
- Data: Supabase dashboard → origio → Backups

## RLS Note (prod)
Three lead tables have RLS disabled — intentional (anon inserts needed):
- `city_comparison_leads`
- `country_comparison_leads`  
- `salary_calc_leads`
