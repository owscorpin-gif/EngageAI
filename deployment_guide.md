# Deployment & Hosting Guide - Engage AI

This guide documents the procedures required to package, bundle, compile, and deploy the Engage AI web application to static hosting providers.

---

## 1. Prerequisites
- **Node.js**: `v18.x` or higher.
- **NPM**: `v9.x` or higher.

---

## 2. Environment Variables Configuration
Create a `.env.production` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

> Get these from: **Supabase Dashboard → Project → Settings → API**.

---

## 3. Supabase Auth Setup
To enable real Google Sign-In with YouTube permissions:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Go to **Authentication → Providers** and enable **Google**.
3. Create a Google OAuth Client ID and Secret in [Google Cloud Console](https://console.cloud.google.com/).
4. Paste the Client ID and Secret into Supabase Google provider settings.
5. Add your deployed app's URL to the **Authorized redirect URIs** in Google Cloud Console.
6. Add your deployed URL to **Supabase → Authentication → URL Configuration → Redirect URLs**.

---

## 4. Production Bundling & Compiling
```bash
# Build the production bundle
npm run build

# Preview locally to verify routing
npm run preview
```

Output is generated in `/dist`:
- `dist/index.html` — Primary SPA route target.
- `dist/assets/` — Code-split lazy modules and optimized stylesheets.

---

## 5. Hosting Deployment

### Option A: Vercel (Recommended)
Connect your repository to Vercel. Set:
- **Build command**: `npm run build`
- **Output directory**: `dist`
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to **Vercel → Project → Settings → Environment Variables**.

### Option B: Netlify
- **Build command**: `npm run build`
- **Output directory**: `dist`
- Add a `public/_redirects` file with `/* /index.html 200` for SPA routing.
- Add environment variables in **Netlify → Site settings → Environment variables**.
