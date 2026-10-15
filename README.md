# Chandan Kumar — Portfolio

Responsive React, TypeScript, and Vite portfolio. Public content starts from `src/data/portfolio.json`; on Vercel it can load the latest published Supabase content. The existing GitHub Pages deployment remains a static fallback and does not provide the admin API.

## Current state

- Public GitHub Pages portfolio: <https://chandankumar25022009-beep.github.io/chandan-personal-workspace/>
- GitHub Pages continues to publish the static site from `.github/workflows/deploy.yml`.
- The secure admin implementation is prepared under `api/`, `src/AdminApp.tsx`, and `supabase/migrations/`.
- Admin authentication and persistent editing are **not active until Supabase and Vercel are configured**. `/admin/login` is intended for the Vercel deployment, not the GitHub Pages URL.
- No administrator password, Supabase key, or Vercel token belongs in this repository.

## Run checks

Node.js 22 is recommended. From the project directory:

```bash
npm install
npm test
npm run build
```

`npm test` exercises content validation, same-origin request checks, and login throttling. `npm run build` also typechecks the Vercel API. Local `npm run dev` serves the frontend only; use `vercel dev` after linking a Vercel project and pulling its private environment variables to exercise API routes locally.

## Update content without an admin service

Edit `src/data/portfolio.json` and run `npm run build`.

- Profile, education, skills, roadmap, contact, resume and site settings are separate top-level objects/arrays.
- Add a project to `projects` only when the project exists; set `published` to `true` only when ready to share.
- Add certificates only when they are real and verifiable.
- Keep skills and roadmap status at `Beginner`, `Learning`, `Planned`, or `Completed` only when accurate.
- The existing Google Docs resume link is external. Check its document sharing settings before publishing.

After Vercel is configured, the admin dashboard writes a private draft first or publishes the validated content to Supabase. The public API reads only published records.

## Secure admin architecture

- `/admin/login` and `/admin` are client routes served by Vercel's SPA rewrite.
- `api/admin/*` validates the Supabase user server-side on every protected operation. Login uses Supabase Auth; the server stores the session in HttpOnly, SameSite=Strict cookies, not browser local storage.
- The configured `ADMIN_EMAIL` and the Supabase user's server-controlled `app_metadata.role = admin` must both match.
- `supabase/migrations/0001_portfolio_admin.sql` creates the content/draft tables, RLS policies, and a private upload bucket. Public access is read-only for published portfolio content; writes require the admin JWT role.
- Uploads accept PDF, PNG, or JPEG up to 3 MB, verify file signatures, and stay in a private bucket. Public resume/certificate files receive short-lived signed URLs only when explicitly marked public.
- `api/admin/login.ts` has an in-memory per-instance limit (8 attempts per IP per 15 minutes) as defense in depth; Supabase Auth also applies its own limits. For higher traffic, add a distributed edge rate limit through the hosting provider.
- Never add `SUPABASE_SERVICE_ROLE_KEY` or any password to a `VITE_*` variable. The service role key is server-only and is used only to create short-lived signed links for explicitly public private-bucket files.

## Provider setup needed to activate admin

These are dashboard actions, not source-code secrets. Do not send passwords or keys in chat.

1. Create a Supabase project and keep its URL, publishable/anon key, and service-role key private.
2. In Supabase SQL Editor, run `supabase/migrations/0001_portfolio_admin.sql`.
3. In Supabase Authentication, create the administrator user using the Gmail address you want to use and a unique password. Keep sign-ups disabled. In the user's **app metadata** set `{"role":"admin"}`; do not put this in user-editable metadata.
4. Import this existing public GitHub repository into Vercel: <https://github.com/chandankumar25022009-beep/chandan-personal-workspace>. Use the root directory and Node.js 22. Keep the current Pages deployment available until Vercel is verified.
5. In Vercel Project → Settings → Environment Variables, add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ADMIN_EMAIL`, and `SUPABASE_SERVICE_ROLE_KEY` for Production (and Preview only if desired). These are server variables and must not start with `VITE_`.
6. Redeploy the Vercel project after adding variables. Verify `/api/content`, `/admin/login`, and the Actions/build logs before sharing the new Vercel URL. No Vercel project or Supabase credentials are configured by this repository yet, so the admin cannot be live-tested before this step.

For local API testing, link the Vercel project and run `vercel env pull .env.local` in your terminal (the file is gitignored), then run `vercel dev`. Never paste the generated file contents into chat.

## Backup and recovery

Supabase is the source of published content and drafts after activation. Periodically export the `portfolio_content` table from Supabase or use the provider's database backup/export tools; keep encrypted backups outside this public repository. Uploaded files live in the private Storage bucket and should be downloaded separately as part of a backup. To restore, import the table and files into the Supabase project and preserve their storage paths. Provider backup retention and paid-plan availability depend on the selected plan; check current Supabase pricing before relying on automated backups.

## Deployment paths

- Current Pages URL remains: <https://chandankumar25022009-beep.github.io/chandan-personal-workspace/>
- New admin-capable deployment requires Vercel + Supabase setup described above. Do not use the Pages URL as an admin URL; Pages is static-only.
- `vercel.json` rewrites direct `/admin` and `/admin/login` navigation to the React entry point. API routes remain under `/api/*`.
