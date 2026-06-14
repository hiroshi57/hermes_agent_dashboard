# AI Agent Dashboard — UI Template

A fully-featured, single-file HTML/CSS/JS dashboard UI for AI agent frameworks.  
Originally designed to replicate the look and feel of **Nous Research Hermes Agent**, fully rebrandable for any AI agent product.

## Live Demo

Open `index.html` in any browser — no build step, no dependencies (only Google Fonts).

GitHub Pages: https://hiroshi57.github.io/hermes_agent_dashboard/  
Vercel: https://hermesagentdashboard.vercel.app/

## Why this template?

| Feature | Description |
|---------|-------------|
| **Single file** | Everything in one `index.html` — easy to embed, customize, and sell |
| **Zero build** | No webpack, no npm install. Works offline. |
| **18 pages** | Complete dashboard coverage out of the box |
| **Fully rebrandable** | Change brand name, colors, and logo in one `BRAND_CONFIG` block |
| **Demo data swap** | All sample data lives in one `DEMO_DATA` block — replace with your own in minutes |

## Pages (18 screens)

| Group | Pages |
|-------|-------|
| Operations | Status · Sessions · Kanban · Cron · Analytics · Logs Viewer |
| Agent | Profiles · Profile Builder · SOUL · Memory · Skills · MCP · Chat |
| Admin | Settings · Secrets · Channels · Security · Checkpoints |

## Highlights

### Kanban — Live Agent Monitoring
- HTML5 drag & drop across columns (Backlog → Running → Review → Done)
- Sub-agent simulation with live log stream (`delegate_task` / `max_concurrent=3` / auto queue promotion)
- **Monitoring panel** with 3 tabs: Logs · Stats · Inject Instructions
- Per-card controls: ⏸ Pause / ▶ Resume / 🔄 Restart
- Mid-task edits: change priority, reassign profile, inject instructions to running agents

### Profile Builder — 4-Step Wizard
- **Step 1**: Define goal → AI recommends agent type, skills, and MCPs (human makes final decision)
- **Step 2**: Identity / Model selection
- **Step 3**: Skills + MCP configuration (178 skills, 15 categories with sidebar navigation)
- **Step 4**: Review with live YAML preview (diff highlighting on change)

### Command Palette (⌘K / Ctrl+K)
- Fuzzy-search every page **and key actions** (switch language, change theme,
  add task, export settings/chat, run security audit) from anywhere
- Arrow keys + Enter to run; Escape to dismiss
- Labels follow the active language (i18n)

### Skills Catalog
- 178 skills across 15 categories
- Category sidebar + grouped display
- Search filter
- One-click select / deselect

### Theming
- Dark teal + cream design system (CSS custom properties)
- All colors defined in `:root` — swap the whole palette in one block
- `BRAND_CONFIG` object for name, tagline, and accent color

## Tech Stack

- **Vanilla JS** — no framework, no dependencies
- **Fonts**: IBM Plex Sans JP + JetBrains Mono (Google Fonts)
- **Responsive**: sidebar collapses below 980px
- **Accessible**: `:focus-visible` / `aria-label` / `prefers-reduced-motion`
- **No browser storage** — all state in JS variables (no cookies, no localStorage)

## Customization

### 1. Brand Config

Find the `BRAND_CONFIG` block near the top of the `<script>` tag:

```js
const BRAND_CONFIG = {
  name:    'Hermes Agent',   // Product name shown in sidebar & title
  tagline: 'v0.9 · multi-agent runtime',
  accentColor: '#2DD4BF',    // Teal — replaces all --teal CSS variables at runtime
  logoText: 'H',             // Single letter shown in the logo square
};
```

Change these four values to rebrand the entire dashboard instantly.

### 2. Demo Data

All sample data (profiles, sessions, Kanban tasks, cron jobs, etc.) is collected in the `DEMO_DATA` section:

```js
/* ================================================================
   DEMO DATA — replace with your own data here
================================================================ */
```

Each data array is documented with inline comments explaining the schema.

## Marketplace & Licensing

This template is designed for distribution on:
- **Gumroad** (digital download)
- **ThemeForest** (HTML templates category)
- **Lemon Squeezy**

The template does not include the Nous Research logo or registered trademarks. The design system (color palette, layout patterns) is original and freely distributable.

## File Structure

```
hermes_agent_dashboard/
├── index.html      ← Dashboard (single file, self-contained)
├── README.md       ← Japanese documentation
├── README.en.md    ← This file
├── Next.tasks.md   ← Improvement task list
├── docs/
│   └── QA_CHECKLIST.md  ← Browser & device QA checklist
└── skills/         ← Claude Code skill definitions (dev use)
```

> 🧪 **QA:** Before shipping, run through [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md)
> — a page-by-page browser and mobile-device verification checklist.

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Full support |
| Edge    | 90+     | ✅ Full support |
| Firefox | 88+     | ✅ Full support |
| Safari  | 14+     | ✅ Full support |
| iOS Safari | 14+ | ✅ Kanban drag via Pointer Events fallback |
| Android Chrome | 90+ | ✅ Kanban drag via Pointer Events fallback |
