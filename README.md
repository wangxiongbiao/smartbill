# SmartBill

SmartBill is a web-based invoice generator built with `Next.js`, `React`, and `Supabase`. It provides a landing page, Google sign-in, an invoice editor with live preview, dashboard management, and reusable invoice templates.

## Features

- Live invoice editing with side-by-side preview
- Automatic draft saving with local fallback when sync fails
- Invoice dashboard with search, status display, and delete flow
- Template center with built-in templates and custom template management
- Google OAuth via Supabase session cookies
- Browser-based export flow for printing or saving as PDF

## Project Structure

- `app/`: App Router pages, auth callbacks, dashboard, invoice routes, and API handlers
- `components/`: marketing page, dashboard, editor, preview, and auth UI
- `context/`: shared auth state
- `hooks/`: client-side autosave logic
- `lib/`: Supabase clients, invoice/template persistence, shared helpers
- `types/`: invoice and profile type definitions

## Getting Started

1. Install dependencies with `pnpm install`
2. Configure Supabase environment variables in `.env.local`
3. Start the dev server with `pnpm dev`
4. Run the type check with `pnpm lint`

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## Tech Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `Supabase`

## Notes

- The editor saves drafts to Supabase first and falls back to `localStorage` if cloud sync fails.
- Template preview/export is currently HTML/print based rather than a server-generated PDF pipeline.
