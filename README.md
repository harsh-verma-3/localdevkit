# LocalDevKit

**A privacy-first, browser-based developer toolbox.**  
Everything runs locally — no data ever leaves your device.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com)

---

## ✨ Features

- 🔒 **100% private** — all processing happens in your browser using native browser APIs
- ⚡ **Instant** — no round-trips to any server
- 📦 **18 tools** out of the box
- 🎨 **Dark / Light / System** theme
- ⌨️ **Keyboard-first** — `Ctrl+K` palette, `?` shortcuts, per-tool hotkeys
- 📱 **PWA-ready** — installable as a desktop/mobile app
- ♿ **Accessible** — ARIA labels, keyboard navigation, screen reader support

---

## 🧰 Tools

| Category | Tools |
|---|---|
| Encoding & Decoding | Base64, URL Encoder/Decoder, JWT Decoder, HTML Entities |
| Data Transformation | JSON Formatter, YAML ↔ JSON, CSV ↔ JSON |
| Generators | UUID (v4 + v7), Password, Hash (SHA-256/512), QR Code |
| Text | Regex Tester, Case Converter, Diff Viewer, Word Counter |
| Date & Time | Timestamp Converter |
| Preview | Markdown Preview |
| Reference | HTTP Status Codes |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18.17
- pnpm

### Installation

```bash
git clone https://github.com/your-org/localdevkit.git
cd localdevkit
pnpm install
pnpm dev
```

App runs at **http://localhost:3000**

### Build for production

```bash
pnpm build
pnpm start
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+K` | Open command palette / search |
| `?` | Show keyboard shortcuts |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+Shift+T` | Cycle theme (light → dark → system) |
| `Escape` | Close any open modal |
| `Ctrl+Enter` | Run / process current tool |
| `Ctrl+Shift+C` | Copy output |
| `Ctrl+Shift+X` | Clear input |

---

## 🏗️ Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout + theme provider
│   ├── page.tsx            # Dashboard
│   └── tools/[category]/[id]/   # Dynamic tool pages (SSG)
├── components/
│   ├── layout/             # AppShell, Sidebar, CommandPalette, ToolLayout
│   └── ui/                 # Button, Badge, CopyButton
├── core/
│   ├── types/plugin.ts     # ToolPluginV1 interface (the contract)
│   └── registry.ts         # Central tool registry
├── store/
│   ├── settingsStore.ts    # Theme, favorites, sidebar (persisted)
│   └── uiStore.ts          # Command palette, ephemeral UI state
├── tools/                  # Tool implementations
│   ├── data/               # JSON, YAML, CSV
│   ├── encoding/           # Base64, URL, JWT, HTML entities
│   ├── generators/         # UUID, Password, Hash, QR
│   ├── text/               # Regex, Case, Diff, Counter
│   ├── datetime/           # Timestamp
│   ├── preview/            # Markdown
│   └── reference/          # HTTP status codes
└── lib/utils.ts            # Shared utilities
```

### Adding a new tool (3 steps)

1. Create `src/tools/{category}/{tool-id}/{ToolName}Tool.tsx`
2. Register it in `src/core/registry.ts` with a `ToolPluginV1` entry
3. Done — it automatically appears in the sidebar, command palette, dashboard, sitemap, and SEO metadata

See [PLUGIN_CONTRACT.md](PLUGIN_CONTRACT.md) for the full interface specification.

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a PR.

---

## 🗺️ Roadmap

See [FUTURE.md](FUTURE.md) for the planned feature backlog.

**Short-term (v1.1):** XML formatter, Cron explainer, IP calculator  
**Medium-term (v1.2):** Image tools (WebAssembly-based)  
**Long-term (v2.0):** Community plugin system, PDF tools, CLI

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

> This project uses a Contributor License Agreement (CLA). See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.
