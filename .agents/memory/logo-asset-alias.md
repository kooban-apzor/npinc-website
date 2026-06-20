---
name: Logo asset alias
description: Where the NP Inc logo lives and how Vite resolves the @assets alias.
---

## Rule
The `@assets` Vite alias resolves to `attached_assets/` at the workspace root.

## Asset
Logo SVG: `attached_assets/np-inc-logo.svg` — imported as `import logoPath from "@assets/np-inc-logo.svg"`.
Used in: `Navbar.tsx`, `Footer.tsx`, `AdminLoginPage.tsx`.

## Why
The Vite config in `artifacts/website/vite.config.ts` sets `"@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets")`.
The original code referenced `@assets/NP Inc Logo.png` which didn't exist — caused 500 pre-transform errors on startup.
