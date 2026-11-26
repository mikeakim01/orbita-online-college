# Icon Engineering Institute

A deployable website for Icon Engineering Institute: public pages, student accounts, applications, an admin screen,
online exams that grade on the server, and certificates with a public verification page and a PDF download.

Built with Next.js 14 (App Router, TypeScript) and Supabase (Postgres and login). Hosted on Vercel.

> **Before launch**, set these Vercel environment variables (sections stay hidden until set):
> `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_CONTACT_ADDRESS`,
> `NEXT_PUBLIC_ACCREDITATION` (only if you hold real recognition), `NEXT_PUBLIC_RECTOR_NAME`,
> `NEXT_PUBLIC_REGISTRAR_NAME` (names printed on certificates), and `NEXT_PUBLIC_SITE_URL`.
> Review fees, policies and the legal pages in `lib/site.ts` and `app/(site)/legal/page.tsx`
> with a lawyer, and review the exam questions in `supabase/seed.sql`.

## What works

- Sign up with email confirmation, sign in, sign out, password reset by email
- Apply for a program (saved to the database), see the status on the dashboard
- Where `supabase/documents.sql` exists: applicants upload their documents (PDF, JPG, PNG up to 5 MB) after applying, and admins open them from the admin screen
- Admin screen: approve or reject applications, revoke or restore certificates
- Exams unlock after an application for that program is approved. Answers are graded on the server (the correct
  answers never reach the browser), 3 attempts per exam per 24 hours
- Passing an exam issues a certificate with an ID like `ICE-2026-123456`, a public verification page at
  `/certificates/<ID>` and a PDF with a QR code at `/certificates/<ID>/pdf`
- Fee calculator, fee table, FAQ, privacy, terms and cookie pages

Not included: online payments, automatic emails other than login emails, live classes.

## 1. Create the Supabase project

1. Go to https://supabase.com, create a project, and wait for it to finish starting.
2. Open **SQL editor > New query**, paste the whole of `supabase/schema.sql`, and run it.
3. Open a new query, paste `supabase/seed.sql`, and run it (this adds the sample exams).
   If your site has a `supabase/documents.sql` file, also run it in a new query. It adds applicant document uploads (a private storage bucket and its rules).
4. **Project settings > API**: copy the Project URL, the `anon` public key and the `service_role` key.
5. **Authentication > URL configuration**:
   - Site URL: your final address, for example `https://orbita-college.vercel.app`
   - Redirect URLs: add `https://YOUR-ADDRESS/auth/callback` and `http://localhost:3000/auth/callback`
6. **Authentication > Providers > Email**: keep "Confirm email" on.
7. Supabase's built-in email sender is limited to a few emails an hour. Before launch, add your own SMTP
   server under **Authentication > SMTP settings** (Resend, Postmark, Amazon SES and others work).

## 2. Run it on your computer (optional)

```bash
cp .env.example .env.local     # then fill in the four values
npm install
npm run dev                    # http://localhost:3000
```

## 3. Deploy to Vercel

1. Put this folder in a new GitHub repository (`git init`, commit, push).
2. In Vercel choose **Add New > Project**, import the repository. The framework is detected as Next.js.
3. Under **Environment Variables** add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (keep it secret: do not tick any "expose" option)
   - `NEXT_PUBLIC_SITE_URL` (your final address, no trailing slash)
4. Click **Deploy**. Add your own domain under **Project > Settings > Domains**, then update the Supabase
   Site URL and Redirect URLs to the final domain, and set `NEXT_PUBLIC_SITE_URL` to it and redeploy.

Or with the Vercel command line: `npm i -g vercel`, then `vercel` and `vercel --prod`.

## 4. Make yourself the admin

Register on the live site and confirm your email. Then run this in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

Reload the site: an **Open admin** button appears on your dashboard.

## 5. Try the whole flow

1. Register a student account, confirm the email, sign in.
2. Apply for a program. As admin, open `/admin` and approve it.
3. As the student, open the dashboard, take an exam, pass it, download the certificate.
4. Open the certificate address in a private window to see the public verification page.

## Security notes

- Row level security is on for every table. Students can read only their own rows.
- The service-role key is used only in server code (`lib/supabase/admin.ts`) and never sent to the browser.
- Admin pages check the role on the server on every request.
- Passwords are handled by Supabase Auth. This app never stores them.

## Where things are

- `lib/site.ts`: names, programs, fees, FAQ, certificate colours
- `components/Calculator.tsx`: the fee calculator rules
- `supabase/seed.sql`: exams and questions
- `app/actions.ts`: all form and exam logic that runs on the server
