# Developer Setup & Contribution Guide - Engage AI

This guide is designed to help engineers set up, build, lint, and run Engage AI locally.

---

## 1. Directory Tree & Architecture
```bash
/dist                     # Compiled production release assets
/public                   # Static public assets (favicons, banners)
/src
  /assets                 # Global logo files and images
  /components             # Reusable UI component elements (ProtectedRoute, Toast)
  /contexts               # Context state managers (AuthContext, DashboardContext)
  /supabase               # Supabase Auth & database client config
  /hooks                  # Custom hooks (useTheme)
  /layouts                # Global page wraps and side navs (DashboardLayout)
  /pages                  # SPA page views (DashboardPage, AnalyzeVideoPage, LiveChatPage, AnalyticsPage, AiLearningPage, AdminPanelPage)
  App.tsx                 # Base router mapping definitions
  index.css               # Base Tailwind CSS styles and theme configs
  main.tsx                # Client entrypoint mounting root index
```

---

## 2. Local Setup Instructions

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env.local` based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
3. Boot the local development server:
   ```bash
   npm run dev
   ```

---

## 3. Development Commands

### Building for Release
Runs TypeScript compilation checks and builds assets inside `/dist`:
```bash
npm run build
```

### Code Quality Audits (Linting)
Runs `oxlint` to scan files for syntax compliance:
```bash
npm run lint
```

---

## 4. Code Standards & Guidelines
- **TypeScript Strictness**: Strictly type variables, avoid `any` where possible.
- **Component Design**: Build reusable, self-contained responsive layouts with clear ARIA accessibility parameters.
- **State Synchronization**: Update localStorage inside useEffect Hooks when updating lists.
- **Aesthetic Priority**: Strictly utilize the Tailwind color palette (primary-500, accent-500) and smooth micro-animations.
