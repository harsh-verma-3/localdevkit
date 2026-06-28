# Future Plans — LocalDevKit

This document tracks all features that have been deliberately deferred from the MVP.
It serves as the canonical backlog. Work items should be moved to GitHub Issues when ready to be scheduled.

---

## v1.1 — Breadth

### Additional Tools
- [ ] XML Formatter + XML ↔ JSON
- [ ] Cron Expression Explainer (human-readable cron breakdown)
- [ ] HTTP MIME Type Lookup
- [ ] IP / CIDR Calculator
- [ ] User-Agent Parser

### Improvements
- [ ] Migrate tool input history to IndexedDB if localStorage proves insufficient for large payloads
- [ ] Add Download button to all tools that currently only have Copy

---

## v1.2 — Power

### Image Tools
- [ ] Image Resize (WebAssembly — evaluate @squoosh/lib or sharp-wasm)
- [ ] Image Conversion (PNG ↔ JPEG ↔ WebP ↔ AVIF)
- [ ] Image Compression
- [ ] EXIF Metadata Viewer
- [ ] Color Picker / Palette Extractor

### Analytics (Optional, Privacy-Preserving)
- [ ] Self-hosted Plausible Analytics
- [ ] Opt-in only — explicit user consent banner
- [ ] Collect only aggregate page views per tool route
- [ ] Document data collection in PRIVACY.md

---

## v2.0 — Platform

### PDF Tools
- [ ] PDF to Text extraction (PDF.js — lazy loaded, ~700KB)
- [ ] PDF Merge / Split (pdf-lib)
- [ ] Must be isolated in its own lazy chunk

### Community Plugins
- [ ] Define plugin submission workflow (GitHub PR + checklist)
- [ ] Plugin sandboxing mechanism (iframe sandbox or Web Worker)
- [ ] Automated plugin validator CI step
- [ ] Community-contributed tools documentation

### Tool Chaining
- [ ] Allow output of one tool to feed as input into another
- [ ] Pipeline mode UI (significant UX work required)
- [ ] Store pipeline definitions in localStorage

---

## Long-term / Speculative

- [ ] CLI tool (`devutil` command) — triggers monorepo evaluation
- [ ] VS Code extension — reuses core tool logic
- [ ] Raycast extension
- [ ] Collaborative shared workspaces (optional, anonymous)
- [ ] Custom tool builder (no-code)
- [ ] AGPL relicensing (if commercial forks emerge — requires CLA from all contributors)
- [ ] Monorepo conversion (pnpm workspaces + Turborepo — only if CLI/extension/SDK consumers emerge)
- [ ] i18n community translations (infrastructure is in place from MVP; just need translation files)

---

## Post-Launch Distribution

- [ ] Submit to Google Play Store via TWA (Trusted Web Activity + Bubblewrap CLI)
- [ ] Submit to Chrome Web Store as PWA
- [ ] Submit to Microsoft Edge Add-ons
- [ ] Product Hunt launch
- [ ] Google Developer Groups (GDG) showcase
