# Sahyog — easy Supabase deployment

This package connects your frontend to Supabase Auth, Postgres, private Storage, and one Edge Function. No Render server or Docker is needed for hosted deployment.

## Existing deployment

This package is already configured for the deployed Sahyog project. Sections 1–4 describe setup for a separate fresh project only.

## 1. Create a project

Open https://supabase.com/dashboard and create a **new project named Sahyog**. Choose your region and save the database password. Use a fresh project, separate from your other applications.

## 2. Run the database setup

Open **SQL Editor → New query**. Paste the entire contents of `supabase/setup.sql` and click **Run**. Run it only once. It creates memberships, private application records, the account trigger, and the private photo bucket.

The same SQL is included under `supabase/migrations/` for CLI users. Choose SQL Editor OR CLI migration; do not run both against the same project. The deployment script below deploys only the function.

## 3. Connect the frontend

Open `js/config.js`. Copy the Project URL and publishable key from your Supabase project's Connect / Settings → API Keys panel:

```js
export const config = {
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabasePublishableKey: 'sb_publishable_YOUR_KEY'
};
```

The publishable key is public frontend configuration. **Never paste a secret or service_role key here.** The Edge Function reads its server key from Supabase's built-in environment: the new `SUPABASE_SECRET_KEYS` default key, or the legacy `SUPABASE_SERVICE_ROLE_KEY` fallback.

## 4. Deploy the backend

Install Node.js 22 or newer. Open a terminal in the folder containing `package.json`:

```powershell
npm ci
npm run deploy:backend -- YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with the 20-letter ID from your project URL. Follow the Supabase login prompt. Deployment uses Supabase's API, so Docker and a database password are unnecessary for this route.

The function's JWT gateway check is disabled in `supabase/config.toml` for modern key compatibility. The function itself verifies every user's access token using Supabase Auth before accessing data. Keep this authentication check intact.

## 5. Configure email sign-in

In Supabase **Authentication → URL Configuration**:

- Set Site URL to your deployed frontend URL, or `http://localhost:5173` during development.
- Add `http://localhost:5173/**` and your deployed frontend URL with `/**` to allowed redirects.
- Enable the Email provider. Google setup is unnecessary.

With email confirmation enabled, users must confirm before signing in. For a private hackathon demonstration, you can temporarily disable Confirm email. Hosted email rate limits still apply; configure custom SMTP for public use.

The interface includes sign up, sign in, sign out, and password reset.

## 6. Run or publish

```powershell
npm start
```

Open `http://localhost:5173`. Use a server instead of double-clicking the HTML file.

```powershell
npm run build
```

- Netlify drag-and-drop: upload the generated `dist` folder.
- Netlify Git deployment: use the supplied `netlify.toml`.
- Vercel Git deployment: use `vercel.json`; framework Other, build `npm run build`, output `dist`.

Fill `js/config.js` BEFORE building. The client is bundled locally in `assets/vendor/supabase.js`, with no runtime JavaScript CDN dependency. Publish `dist`, which contains only frontend files.

## 7. Create the first administrator

Sign up through Sahyog first. Then run this in Supabase SQL Editor with your actual email:

```sql
update public.sahyog_members
set role = 'admin'
where lower(email) = lower('YOUR_EMAIL@example.com');
```

Click **Refresh** in Sahyog. Administrators can open **User Verification → Manage** to assign roles and record verified safety certifications, one per line. Certification text must exactly match the resource's requirement.

Borrower and owner accounts can be created during signup. Owners manage only their own listings. Signup cannot grant administrator access or certifications. Changing user-editable auth metadata later does not change database permissions.

## 8. Try the complete flow

1. Sign up as an owner and add a resource with certification `None`, valid opening hours, and an optional photo. New workspaces start empty; fictional demo inventory is not imported as real equipment.
2. Sign out, create a borrower account, and request a future slot.
3. Sign in as the owner and approve the request.
4. Sign in as the borrower and Refresh. Check-in opens 15 minutes before the booking and closes at its end. Complete the checklist and attach a photo.
5. Submit a return photo. The owner compares both photos and completes inspection.
6. Try incidents, discussions, saved resources, profile changes, and exports. Reload or use another device to verify persistence.

Use separate browser profiles for simultaneous accounts. Click **Refresh** for updates from other members; realtime subscriptions are not implemented.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Setup message instead of sign-in | Fill both values in `js/config.js`, rebuild and redeploy. |
| Backend unavailable / Function not found | Deploy `sahyog-api` to the same project as the URL. Check Edge Functions logs. |
| Account setup missing | Run SQL setup before signup. For a pre-existing account, insert its member row through SQL Editor or recreate an unused test account after setup. |
| Email not confirmed | Confirm via email or adjust confirmation settings for the private demo. |
| Invalid API key | Use the publishable key from the same project as the URL. |
| Missing certification | Ask an administrator to record institution-verified training. |
| Another person updated the workspace | Refresh and retry; this protects concurrent allocations. |
| Photo upload fails | Ensure setup created `sahyog-evidence`; choose PNG/JPEG/WebP under 5 MB. |
| Old role or approval shown | Click Refresh to load current server records. |

## Architecture and scope

This is a small-campus pilot backend. Records live in one **private JSONB aggregate**, with a separate membership table. Every write uses an atomic revision check: two conflicting approval updates cannot both commit. The losing request must refresh and retry. Browser clients have no direct access to these tables. The Edge API checks permissions and returns only authorized records; other bookings expose busy intervals without borrower identities or purposes.

At larger scale, migrate resources, bookings, and events to normalized tables with transactional allocation and pagination. The current backend loads the aggregate per request. It does not implement institutional tenancy, scheduled reminders, payment collection, identity proofing, or a tamper-proof external audit system. Price watches are saved and evaluated in the interface without scheduled email. Passes do not operate physical locks. Qualifications must be verified by institutional staff.

Private photo URLs expire after five minutes; anyone holding the signed URL can use it until expiry. Browser clients cannot overwrite or delete evidence. Unattached uploads need periodic administrator cleanup and a suitable retention policy. Existing browser-demo records are not migrated automatically.

The frontend is deployed at https://sahyog-resource-sharing.vercel.app/ and configured for Supabase project ctejyptmhqdzhjitnhxc. The initial database setup must not be rerun against that project.

## Checks

```powershell
npm ci
npm test
npm run build
```

See TEST_REPORT.md for actual results and live-testing limitations.

Official docs:
- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/functions/deploy
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys
