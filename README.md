# SmartBill

SmartBill is a Next.js 15 invoice app for freelancers and small teams. It includes:

- invoice editing and PDF export
- invoice records with local-first sync
- reusable invoice templates
- Supabase auth and persistence
- share links and email delivery
- AI-assisted invoice drafting

## Stack

- Next.js 15
- React 19
- Tailwind CSS
- Supabase
- Resend
- DeepSeek

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create local env vars:

```bash
cp .env.example .env.local
```

3. Fill in the required values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Optional features:

- `DEEPSEEK_API_KEY`: enables AI chat in the editor
- `RESEND_API_KEY`: enables real email sending for shared invoices
- `GEMINI_API_KEY`: enables legacy Gemini helper functions

5. Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev
pnpm lint
pnpm build
pnpm start
```

## Notes

- Google OAuth is configured in the Supabase dashboard, not in `.env.local`.
- Without `RESEND_API_KEY`, invoice email sending falls back to mock mode.
- Public invoice sharing depends on the Supabase share tables and RPC functions in the SQL files in this repo.
