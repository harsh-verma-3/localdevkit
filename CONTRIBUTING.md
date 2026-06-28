# Contributing to LocalDevKit

Thank you for your interest in contributing! This document outlines how to get involved.

---

## Code of Conduct

Be respectful. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) v2.1.

---

## Contributor License Agreement (CLA)

By submitting a pull request, you agree that your contribution is licensed under the **MIT License** and that you have the right to submit it.

If your employer has rights to intellectual property you create, you must ensure they have signed the CLA or waive those rights before contributing.

> **Note:** A formal CLA automation (e.g., CLA Assistant) will be added before the project reaches significant adoption.

---

## How to Contribute

### 🐛 Bug Reports

1. Search [existing issues](https://github.com/your-org/localdevkit/issues) first
2. If not found, open a new issue with:
   - Browser + version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### 💡 Feature Requests

1. Check [FUTURE.md](FUTURE.md) — it may already be planned
2. Open a [feature request issue](https://github.com/your-org/localdevkit/issues/new)
3. Describe the use case, not just the solution

### 🔧 Pull Requests

1. **Fork** the repository and create a branch from `main`
2. **Install** dependencies: `pnpm install`
3. **Develop**: `pnpm dev`
4. **Follow the checklist** below before opening a PR

---

## PR Checklist

### All PRs
- [ ] Code compiles without TypeScript errors (`pnpm build`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] No `console.log` statements left in production code
- [ ] Commit messages are clear and descriptive

### New Tool PRs
- [ ] Tool is registered in `src/core/registry.ts`
- [ ] Tool component is in `src/tools/{category}/{id}/{Name}Tool.tsx`
- [ ] Tool uses dynamic import (lazy loaded) — see [PLUGIN_CONTRACT.md](PLUGIN_CONTRACT.md)
- [ ] Tool ID is kebab-case and unique
- [ ] Tool makes **no network requests**
- [ ] Input is persisted using `saveToolInput` / `loadToolInput`
- [ ] Error states are handled and displayed inline with `role="alert"`
- [ ] Empty state is shown when there is no input
- [ ] All interactive elements have `aria-label`
- [ ] Tool is responsive on mobile (≥ 375px width)
- [ ] Tool has been manually tested in Chrome and Firefox

### UI/UX PRs
- [ ] Uses design tokens from `globals.css` (not hardcoded colors)
- [ ] Dark mode tested
- [ ] Light mode tested
- [ ] No horizontal scroll introduced on mobile

---

## Development Setup

```bash
# Install pnpm (if not installed)
npm install -g pnpm

# Clone and install
git clone https://github.com/your-org/localdevkit.git
cd localdevkit
pnpm install

# Start dev server
pnpm dev         # → http://localhost:3000

# Type check
pnpm build       # full type-check + build

# Lint
pnpm lint

# Format
pnpm format
```

---

## Project Structure

See [README.md](README.md#architecture) for the full directory layout.

---

## What We Won't Accept

- Tools that make server-side requests or call external APIs at runtime
- Analytics, tracking, or telemetry of any kind
- Tools that store user data outside of `localStorage` / `IndexedDB` on the user's own device
- Large binary assets committed to the repository (use CDN or generate at runtime)
- Breaking changes to the `ToolPluginV1` interface without a migration plan

---

## Questions?

Open a [GitHub Discussion](https://github.com/your-org/localdevkit/discussions) for questions, ideas, or general feedback.
