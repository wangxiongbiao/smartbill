<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SmartBill Pro Mobile

SmartBill is an Expo/React Native application. The mobile client uses Supabase for authentication and sends the resulting access token to the SmartBill API for invoices, templates, profiles, and sharing.

## Run locally

**Prerequisites:** Node.js and an Expo-compatible simulator/device.

1. Install dependencies: `npm install`
2. Configure the public runtime values in `.env` (see `.env.local copy.example`).
3. Start Metro: `npm run start`
4. For the web target, use `npm run web`.

## Supabase connection

The following three settings must remain aligned:

- `.env` → `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- local Supabase CLI link → `supabase/.temp/project-ref`
- the `https://smartbillpro.com` backend → Supabase URL and server-only secret/service-role key

Verify the client configuration and CLI link without printing credentials:

```bash
HOME=/Users/admin npm run supabase:verify
```

A successful client check does not prove the backend has been migrated. This app currently offers Google sign-in only, so Google must also be enabled under the target Supabase project's Auth providers and use the matching Google client configuration. Before releasing a build, configure the backend for the same project ref and verify a real authenticated `/api/auth/me` request. Never place a secret/service-role key in Expo variables or commit it to this repository.
