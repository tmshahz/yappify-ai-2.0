# CLAUDE.md — Yappify AI 2.0

This file is the authoritative guide for AI-assisted development on this project. Read it fully before making any changes.

---

## Project Purpose

**Yappify** is a minimalist, voice-first AI workspace that turns spoken audio and uploaded files into structured text using Google Gemini.

**Core capabilities:**
- **Speech-to-Text** — Record audio, transcribe, then "Promptify" (transform) via built-in or custom prompt modes
- **Translate** — Transcribe and translate with optional transliteration
- **Upload** — Process audio files into raw transcripts, speaker-labeled transcripts, meeting summaries, or action items

**Product positioning:** A calm, premium glassmorphism tool for creators who want fast voice → structured output without a complex UI. All processing runs client-side against the Gemini API; persistence is local to the browser.

**Origin:** Forked from a Google AI Studio template. AI Studio link: https://ai.studio/apps/drive/1E8tevdkEgtrM_fhKwdFVf5I9eSe05ie4

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 (functional components + hooks) |
| Build tool | Vite 6 |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS 3 + custom CSS design system (`yap-*`) |
| Icons | `lucide-react` |
| Markdown | `react-markdown` |
| Class utilities | `clsx` |
| AI API | Google Gemini REST (`generativelanguage.googleapis.com/v1beta`) |
| Persistence | Browser `localStorage` |
| Fonts | Geist + Geist Mono (Google Fonts) |

**Not in this repo:** Next.js, React Router, Supabase, Sanity, backend/API routes, server actions, auth, Redux/Zustand, ESLint/Prettier configs, test framework.

**Scripts:**
```bash
npm install          # Install dependencies
npm run dev          # Dev server on port 3000 (0.0.0.0)
npm run build        # Production build → dist/
npm run preview      # Preview production build
```

**Environment:** Set `GEMINI_API_KEY` in `.env.local` (gitignored). Vite injects it via `define` in `vite.config.ts`, but runtime API calls primarily use the key entered in Settings UI / saved to localStorage.

---

## Project Architecture

This is a **single-page application (SPA)** — not a multi-route app. There is no `app/`, `pages/`, or URL-based routing.

### Entry flow

```
index.html (#root)
  └── index.tsx (StrictMode, imports styles)
        └── App.tsx (orchestrator)
              ├── hooks/          (persisted + ephemeral state)
              ├── services/       (Gemini API client)
              ├── lib/storage.ts  (localStorage helpers)
              ├── prompts.ts      (built-in + merged custom modes)
              └── components/     (panels, modals, UI)
```

### State architecture

| Category | Mechanism | Location |
|----------|-----------|----------|
| Workflow state | `useState` in `App.tsx` | `AppState` enum drives UI (IDLE → RECORDING → TRANSCRIBING → …) |
| User preferences | `useLocalStorageState` | `yappify.v2.prefs` — active mode, panels, translate/upload settings |
| Settings | `useSettings` | `yappify.v2.settings` — theme, API key, mic, model |
| History | `useHistory` | `yappify.v2.history` — up to 100 items |
| Analytics | `useAnalytics` | `yappify.v2.analytics` — up to 500 usage records |
| Custom modes | `useCustomModes` | `yappify.v2.customModes` — 3 editable prompt modes |

No React Context, no global store. `App.tsx` (~925 lines) is the central coordinator.

### Layout (12-column grid)

```
┌─────────────────────────────────────────────────────────────┐
│  Header: ModeSwitcher (center) | Settings (right)           │
├──────────┬──────────────────────────────┬───────────────────┤
│ Left     │         Center Panel         │ Right             │
│ Panel    │  Hero controls (3 buttons)   │ History Panel     │
│ (3 col)  │  Waveform + status           │ (3 col)           │
│          │  Output surface              │                   │
│          │  Clear / Copy / Export       │                   │
└──────────┴──────────────────────────────┴───────────────────┘
```

- **Desktop (`lg+`):** Persistent 3-column layout; side panels collapsible
- **Mobile:** Side panels become slide-in drawers (`w-[84%] max-w-xs`) with backdrop

### Mode switching (state-based, not routes)

| Concept | Enum / mechanism |
|---------|------------------|
| App modes | `AppMode`: SPEECH, TRANSLATE, UPLOAD — via `ModeSwitcher` |
| View modes | `ViewMode`: RAW vs TRANSFORMED — toggle when AI output exists |
| Prompt modes | `PromptMode`: ENHANCER, NOTES, CUSTOM_1/2/3 |

### Data / API layer

All network I/O is browser-side `fetch` in `services/geminiService.ts`:
- `transcribeAudio`, `transformText`, `translateText`, `processUpload`
- `fetchAvailableModels`, `validateModelAvailable`
- Default model: `gemini-2.5-flash`

API key is passed as query param `?key=`. No backend proxy.

### Storage keys (`lib/storage.ts`)

```
yappify.v2.settings
yappify.v2.customModes
yappify.v2.history
yappify.v2.analytics
yappify.v2.prefs
```

Legacy migration from `yappify_settings` and `yappify_custom_prompt` is handled in hooks.

---

## Existing Design System

Yappify uses a **custom "Yap" design system** — not shadcn, not Radix, no `components/ui/` folder.

### Source of truth (in order)

1. `styles/design-tokens.css` — all `--yap-*` CSS custom properties
2. `styles/global.css` — semantic `.yap-*` component classes
3. `styles/output-prose.css` — markdown output typography
4. `styles/tailwind.css` — Tailwind directives
5. `tailwind.config.js` — minimal extensions (secondary; see color note below)

### Import order (`index.tsx`)

```ts
import './styles/tailwind.css';
import './styles/design-tokens.css';
import './styles/global.css';
import './styles/output-prose.css';
```

### Design tokens (`--yap-*` prefix)

**Backgrounds (dark):**
- `--yap-void` `#0A090F`
- `--yap-surface-1/2/3` `#110F1A` / `#1A1726` / `#221F30`
- `--yap-glass`, `--yap-glass-border`, `--yap-glass-hover`

**Accent (brand violet):**
- `--yap-violet` `#7C5CFC` ← canonical brand color
- `--yap-violet-hover` `#8B6EFD`
- `--yap-violet-dim`, `--yap-violet-glow`, `--yap-violet-mist`, `--yap-violet-ring`
- `--yap-active-bg`, `--yap-active-border`

**Recording state:**
- `--yap-record` `#FF6B6B`
- `--yap-record-glow`

**Text hierarchy:**
- Dark: `--yap-text-1/2/3` → `#F0EDF8` / `#8B87A0` / `#4E4B61`
- Light: `--yap-light-text-1/2/3` → `#201A2E` / `#625B73` / `#9A92AD`

**Typography:**
- `--yap-font`: Geist, Plus Jakarta Sans, system sans
- `--yap-font-mono`: Geist Mono, JetBrains Mono

**Radius:** `--yap-radius-sm/md/lg/xl/full` → 6 / 10 / 14 / 20 / 9999px

**Motion:**
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Durations: 120ms / 200ms / 350ms
- Respects `prefers-reduced-motion`

**Atmosphere:** Lavender + warm peach radial gradients, blurred aura orbs on `.yap-app-shell`

### Semantic CSS classes

| Class | Purpose |
|-------|---------|
| `yap-app-shell` | Root wrapper with gradient background + animated aura |
| `yap-app-content` | Content layer above background effects |
| `yap-glass-panel` | Sidebars, modals — frosted panel |
| `yap-glass-card` | Selectable cards (modes, history, info blocks) |
| `yap-glass-active` | Selected card (violet left border) |
| `yap-glass-input` | Form inputs |
| `yap-output-surface` | Main transcript/output area |
| `yap-side-panel` / `yap-center-panel` | Layout regions |
| `yap-violet-button` | Primary CTA |
| `yap-ghost-button` | Secondary/cancel |
| `yap-action-button` | Transcribe, Copy, Export |
| `yap-mic-button` | Central record button (+ `.is-recording`) |
| `yap-hover-lift` | `translateY(-2px)` on hover |
| `yap-glow-in` | Violet glow shadow on hover |
| `yap-fade-in` / `yap-panel-enter` | Entry animations |
| `yap-text-primary/secondary/hint` | Text hierarchy utilities |
| `yap-mode-badge` | Pill badges for current mode |
| `yap-icon-mist` | Icon container with violet mist background |
| `yap-output-prose` | Markdown output (see `output-prose.css`) |
| `custom-scrollbar` | Thin 6px scrollbar |

### Dark mode

- Strategy: `darkMode: 'class'` on `<html>`
- Applied in `hooks/useSettings.ts` via `document.documentElement.classList`
- Default theme: **dark**

### Known color inconsistency

Multiple purple values coexist. Prefer `--yap-violet` (`#7C5CFC`) as canonical:
- Tailwind `accent` in config: `#9333ea` (not widely used)
- PWA/meta theme: `#8B5CF6`
- Components often mix Tailwind `purple-*` with CSS variables

When adding new UI, use `--yap-violet` and `--yap-*` tokens first; avoid introducing new purple hex values.

### Dual Tailwind setup (caution)

`index.html` loads Tailwind via CDN **in addition to** the PostCSS build pipeline. The Vite-compiled CSS from `index.tsx` is authoritative. Do not add new CDN-only utilities; extend `design-tokens.css` / `global.css` / `tailwind.config.js` instead.

---

## Brand Principles

1. **Voice-first, calm, premium** — The mic button is the hero. UI should feel spacious, not cluttered.
2. **Minimalist** — Every element earns its place. Avoid feature bloat and dense dashboards.
3. **Glassmorphism with warmth** — Frosted panels, soft lavender atmospheres, subtle motion — not flat Material or harsh neon.
4. **Honest about data** — Gemini API key is user-supplied; data stays local unless sent to Google. Copy reflects this (see `InfoModal`, `ApiKeyPrivacyModal`).
5. **Mode-aware guidance** — Empty states and hints change per `AppMode`; the app teaches itself inline.
6. **Accessible motion** — Animations enhance feedback (recording pulse, mic breathe) but respect reduced-motion preferences.

**Product copy anchors:**
- Tagline: *"Minimalist voice-to-text and AI prompt structuring tool."*
- Value prop: *"Turns voice and audio files into transcripts, prompts, translations, and meeting artifacts using Google Gemini."*
- Empty state CTA: *"Speak something."*

**Developer link:** https://www.tmshahz.com (footer in `PanelFooterLinks`)

---

## UI Conventions

### Component structure

- `React.FC<Props>` with explicit `interface *Props`
- `clsx` for conditional Tailwind + `yap-*` classes
- `lucide-react` icons (size 14–20 typical)
- Relative imports (`../types`, `./Modal`) — `@/*` alias exists but is unused

### Panel headers

```tsx
<h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
  Section Title
</h3>
```

Close button: `PanelLeftClose` / `PanelRightClose`, 16px, gray hover states.

### Modal icon header (repeated pattern)

```tsx
<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
  <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
</div>
```

Always use the shared `Modal` component — never build ad-hoc dialogs.

### Selectable card pattern

```tsx
clsx(
  "yap-glass-card yap-hover-lift yap-glow-in rounded-xl transition-all duration-200",
  "border hover:border-purple-300 dark:hover:border-purple-700",
  isSelected
    ? "yap-glass-active border-purple-600 dark:border-[var(--yap-active-border)]"
    : "border-gray-200 dark:border-gray-800"
)
```

### Dark mode text/border pattern

Prefer CSS variables in dark mode:
```tsx
className="text-gray-900 dark:text-[var(--yap-text-1)]"
className="border-gray-100 dark:border-[var(--yap-glass-border)]"
```

### Status text

Mono, violet, pulsing during processing:
```tsx
<span className="text-xs font-mono text-purple-600 dark:text-[var(--yap-violet-hover)] animate-pulse">
```

### Keyboard shortcuts

Arrow keys (when not in inputs): talk / transcribe / right action / copy. See `useKeyboardShortcuts.ts` and `KeyboardShortcutsGuide.tsx`. Skip on touch-only devices without hardware keyboards.

### Error display

Red pill toast at top center of center panel — not modal dialogs for transient errors.

---

## File Organization

```
yappify-ai-2.0/
├── App.tsx                 # Main orchestrator (~925 lines)
├── index.tsx               # React entry + style imports
├── index.html              # HTML shell, fonts, PWA meta
├── types.ts                # All shared types and enums
├── prompts.ts              # Built-in prompt modes + buildPromptModes()
├── metadata.json           # AI Studio metadata
├── vite.config.ts          # Dev server, env, @ alias, CORS plugin
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
│
├── components/             # 19 UI components (panels, modals, UI)
│   ├── Modal.tsx           # Base dialog — extend this
│   ├── *Panel.tsx          # Left/right sidebar panels
│   ├── *Modal.tsx          # Feature modals
│   └── Waveform.tsx, OutputMarkdown.tsx, etc.
│
├── hooks/                  # 6 custom hooks
│   ├── useLocalStorageState.ts  # Generic persistence primitive
│   ├── useSettings.ts
│   ├── useHistory.ts
│   ├── useAnalytics.ts
│   ├── useCustomModes.ts
│   └── useKeyboardShortcuts.ts
│
├── services/
│   └── geminiService.ts    # All Gemini API calls
│
├── lib/
│   └── storage.ts          # STORAGE_KEYS + read/write helpers
│
├── utils/
│   ├── labels.ts           # User-facing mode labels
│   ├── formatOutputMarkdown.ts
│   └── outputDisplay.ts
│
├── styles/
│   ├── tailwind.css
│   ├── design-tokens.css   # ← Design token source of truth
│   ├── global.css          # ← Semantic yap-* classes
│   └── output-prose.css
│
└── public/                 # Favicons, PWA manifest, logo (yl.png unused)
```

**No `src/` folder.** Application code lives at project root or in subfolders above.

### Where to put new code

| Addition | Location |
|----------|----------|
| New UI component | `components/NewComponent.tsx` |
| New persisted state | New hook in `hooks/` using `useLocalStorageState` |
| New API operation | `services/geminiService.ts` |
| New type/enum | `types.ts` |
| New user-facing label | `utils/labels.ts` |
| New design token | `styles/design-tokens.css` → consume in `global.css` |
| New prompt mode (built-in) | `prompts.ts` + `types.ts` enum |

---

## Coding Conventions

### Naming

| Kind | Convention | Example |
|------|------------|---------|
| Components | PascalCase file + export | `SettingsModal.tsx` |
| Hooks | `use` prefix, camelCase | `useSettings.ts` |
| Utils/services | camelCase | `geminiService.ts` |
| Enums | SCREAMING_SNAKE members | `AppState.RECORDING` |
| Storage keys | Dotted namespace | `yappify.v2.settings` |
| CSS classes | `yap-` prefix | `yap-glass-panel` |
| CSS variables | `--yap-` prefix | `--yap-violet` |

### Imports (grouped)

1. React
2. Third-party (`lucide-react`, `clsx`)
3. Local types (`../types`)
4. Services / lib / hooks
5. Components
6. Utils

### TypeScript

- Shared types in root `types.ts` (no `types/` directory)
- Service-specific types may live in their module (e.g. `GeminiModel`)
- `strict` is not enabled in tsconfig; match existing style
- Use explicit `interface` for component props

### Error boundaries

`App.tsx` and `SettingsModal.tsx` use class-based error boundaries for markdown/settings failures. Follow this pattern for render-heavy subtrees.

### Persistence pattern

```ts
export function useFeature() {
  const [data, setData] = useLocalStorageState<T>(
    STORAGE_KEYS.feature,
    DEFAULT,
    migrateFromLegacy  // optional
  );
  return { data, setData };
}
```

### API key handling

- Never log or commit API keys
- `saveApiKey: false` clears key before writing to localStorage
- `requireApiKey()` in `App.tsx` opens Settings modal when missing

---

## Reusable Component Patterns

### 1. Modal stack (`components/Modal.tsx`)

Foundation for all overlays. Features:
- `createPortal` to `document.body`
- `yap-modal-backdrop` + `yap-glass-panel`
- Props: `maxWidth`, `align`, `zIndex`, `icon`, `footer`, `closeOnEscape`
- Escape key handling; backdrop click closes

**Extend `Modal`** for new dialogs — do not duplicate portal/backdrop logic.

### 2. Side panels (`*Panel.tsx`)

Structure:
```
flex flex-col h-full
  → header (title + close)
  → scrollable content
  → PanelFooterLinks (optional)
```

Panels: `PromptifyPanel`, `TranslatePanel`, `UploadPanel`, `HistoryPanel`

### 3. Mode cards (selection lists)

Used in `PromptifyPanel`, `HistoryPanel`. Pattern: `yap-glass-card` + `yap-glass-active` + keyboard `role="button"` + `tabIndex`.

### 4. Output rendering (`OutputMarkdown.tsx`)

Wraps `react-markdown` with `yap-output-prose`. Post-processing via `formatOutputMarkdown.ts` promotes labels to `##` headings. Plain monospace for Speech RAW via `shouldUsePlainRawOutput()`.

### 5. Waveform (`Waveform.tsx`)

Canvas visualizer; reads `--yap-violet` from computed styles at runtime.

### 6. Copy feedback (`CopyToast.tsx`)

Keyed toast animation — not a persistent notification system.

### 7. Footer links (`PanelFooterLinks.tsx`)

"How to Use" (opens `InfoModal`) + "About Developer" external link.

---

## Rules for Maintaining Visual Consistency

1. **Tokens first** — Add or change colors in `design-tokens.css`, not inline hex in components.
2. **Semantic classes second** — New repeated patterns become `.yap-*` in `global.css`.
3. **Tailwind for layout only** — Spacing, flex/grid, responsive breakpoints (`sm:`, `lg:`). Avoid one-off color utilities when a token exists.
4. **Dark + light pairs** — Every new surface needs both `dark:` and light styles. Test both themes.
5. **Reuse existing buttons** — `yap-violet-button`, `yap-ghost-button`, `yap-action-button`; don't invent new button styles.
6. **Match modal structure** — Icon header, `yap-glass-card` info blocks, violet numbered steps (see `InfoModal`).
7. **Typography hierarchy** — Section labels: `text-xs font-bold uppercase tracking-wider`. Body: `text-sm`. Hints: `opacity-70` or `yap-text-hint`.
8. **Motion consistency** — Use existing keyframes (`yap-fade-in`, `yap-panel-enter`, `yap-mic-breathe`). New animations go in `global.css`.
9. **Icon sizing** — 14px (inline actions), 16px (panel controls), 20px (modal headers), 36px (empty state hero).
10. **Don't add shadcn/Radix** — The design system is custom; introducing third-party UI libraries will fragment the visual language.

---

## Landing Page Requirements

**Current state:** There is **no separate marketing landing page**. The entire app is a single workspace rendered by `App.tsx`. Users land directly in the product.

### What serves as the entry experience today

| Surface | Role |
|---------|------|
| Empty state (center panel) | Primary onboarding — mic icon, "Speak something.", mode-specific hint, mode badge |
| `InfoModal` | Full workflow explanation (3 steps), privacy notes, keyboard shortcuts |
| `PanelFooterLinks` | "How to Use" entry point |
| PWA manifest | `site.webmanifest` — standalone display, theme `#8B5CF6` |

### If adding a marketing landing page

Any future landing page must:

1. **Match brand** — Violet glassmorphism, Geist typography, warm lavender atmosphere (reuse `design-tokens.css` + `global.css`)
2. **Communicate value in one line** — Voice/audio → transcripts, prompts, translations, meeting artifacts via Gemini
3. **Show the 3-step workflow** — Choose mode → Record/upload → Process (mirror `InfoModal`)
4. **Be honest about architecture** — Client-side, user API key, local storage; no false "cloud sync" claims
5. **CTA leads to app** — Single clear action to enter the workspace (not a signup wall unless auth is added)
6. **Responsive** — Mobile-first; the app already uses drawer patterns on small screens
7. **Performance** — No heavy dependencies; keep landing lightweight (Vite SPA or separate static route)
8. **SEO basics** — Title "Yappify", meta description from `metadata.json`, favicon/manifest from `public/`
9. **Do not break the SPA** — If added as a separate route, use a router; do not fork the design system

Until a landing page exists, treat the **empty state + InfoModal** as the canonical first-run experience. Changes to onboarding copy belong in `App.tsx` (empty state) and `InfoModal.tsx`.

---

## Safe Editing Guidelines

### High-risk files (read fully before editing)

| File | Risk |
|------|------|
| `App.tsx` | Central state machine; changes affect entire app |
| `services/geminiService.ts` | API contracts, cost estimation, all AI features |
| `types.ts` | Enums/interfaces used everywhere |
| `styles/design-tokens.css` | Global visual identity |
| `styles/global.css` | All semantic component styles |
| `lib/storage.ts` | Storage key changes break user data |
| `hooks/useSettings.ts` | Theme application, API key persistence |

### Safe extension points

- New modal → `components/NewModal.tsx` using `Modal`
- New panel section → extend existing `*Panel.tsx`
- New label → `utils/labels.ts`
- New built-in prompt → `prompts.ts` + `PromptMode` enum
- New analytics action → `useAnalytics` + call site in `App.tsx`

### Do NOT

- Change `STORAGE_KEYS` values without migration logic (users lose data)
- Add a backend, auth, or CMS without explicit user request (net-new architecture)
- Introduce shadcn, MUI, Chakra, or other component libraries
- Remove or bypass `MarkdownErrorBoundary` around output rendering
- Commit `.env.local` or API keys
- Add URL routing without discussing SPA implications
- Use `@/*` alias in new code unless migrating imports project-wide
- Modify `index.html` CDN Tailwind without understanding dual-build implications

### Testing changes locally

```bash
npm run dev     # Test in browser at http://localhost:3000
npm run build   # Verify production build succeeds
```

Manually verify: dark + light theme, all 3 app modes, recording flow, modal open/close, mobile drawer layout.

### Legacy migration

Hooks support v1 → v2 localStorage migration. If changing storage shape, add `migrate()` to the relevant hook — never silently overwrite keys.

---

## Mandatory Workflow

**Every non-trivial change MUST follow this sequence. Do not skip steps.**

### 1. Analyze

Before writing code:
- Read this `CLAUDE.md` fully
- Read the files you will touch (and their imports/dependents)
- Identify affected modes, storage keys, API calls, and UI surfaces
- Note design system classes/tokens involved
- State what is **not** changing

### 2. Plan

Produce a concrete plan that includes:
- Goal and scope (what problem, what boundary)
- Files to create/modify (explicit list)
- Approach (data flow, UI changes, edge cases)
- Design system impact (new tokens? new classes? or reuse existing?)
- Risks and rollback considerations
- What you will **not** do (scope control)

Keep plans proportional — a one-file fix needs a short plan, not a design doc.

### 3. Wait for approval

**Stop and present the plan to the user. Do not implement until they approve.**

If the user says "just do it" or gives explicit go-ahead, that counts as approval.

For question-only or read-only requests, skip to answering — no implementation.

### 4. Then implement

After approval:
- Make the **smallest correct diff** — no drive-by refactors
- Match existing naming, imports, and patterns
- Update `design-tokens.css` / `global.css` before sprinkling inline styles
- Verify dark + light themes if UI changed
- Run `npm run build` if changes are non-trivial
- Summarize what changed and what to test

---

## Quick Reference

### AppState lifecycle

```
IDLE → RECORDING → RECORDED → TRANSCRIBING → READY
  → PROMPTIFYING | TRANSLATING | PROCESSING_UPLOAD → DONE
```

### AppMode → left panel

| AppMode | Panel |
|---------|-------|
| SPEECH | `PromptifyPanel` |
| TRANSLATE | `TranslatePanel` |
| UPLOAD | `UploadPanel` |

### Built-in prompt modes

| Mode | Title |
|------|-------|
| ENHANCER | Prompt Enhancer |
| NOTES | Quick Notes |
| CUSTOM_1/2/3 | User-defined (local) |

### Upload processing types

`raw-transcription` | `speaker-transcript` | `meeting-summary` | `action-items`

### Key dependencies between modules

```
App.tsx
  → hooks (settings, history, analytics, customModes, prefs, shortcuts)
  → geminiService (all AI)
  → prompts.buildPromptModes(customModes)
  → components (panels render based on AppMode)
  → utils/labels, utils/outputDisplay, utils/formatOutputMarkdown
```

---

*Last updated from full codebase analysis. This project is a client-only Vite/React SPA with a custom Yap design system and no backend.*
