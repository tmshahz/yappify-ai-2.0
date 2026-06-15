# DESIGN_BRIEF.md — yappify-ai

Source of truth for all landing pages, marketing surfaces, and future UI work.
Read this before creating any new surface. Do not invent tokens or patterns that already exist here.

---

## 1. Brand Personality

yappify-ai is not a platform. It is a tool.

It sits between messy human thought and polished, usable output. The personality of the product reflects that position: precise but not rigid, calm but not passive, minimalist but not sterile.

**In one phrase:** a sharp, quiet utility that respects the user's intelligence.

**Personality traits (in order of priority):**

| Trait | Meaning in practice |
|-------|---------------------|
| **Voice-first** | The microphone is the center of everything. Interface decisions defer to it. |
| **Calm** | No busy dashboards. No alert fatigue. Generous whitespace, restrained motion. |
| **Premium** | Crafted details: layered shadows, subtle glass surfaces, eased motion. Never feels rushed. |
| **Honest** | BYOK is explained plainly. Privacy claims are accurate. No dark patterns. |
| **Slightly playful** | "yapp your thoughts over" — the brand has permission to be human and memorable. |

**What yappify-ai is NOT:** a chatbot, a Gemini wrapper, a subscription replacement, or a corporate AI suite.

---

## 2. User Emotions We Want to Evoke

These are the emotional checkpoints a user should hit at each stage:

| Stage | Emotion | Design lever |
|-------|---------|--------------|
| Landing on the app | *"This feels different — calm, considered"* | Lavender atmosphere, generous spacing, no modal popups on load |
| First time seeing the mic button | *"That's the thing I press"* | Mic is 72 px, centered, breathing gently, surrounded by a violet halo |
| Recording | *"Something is happening — I can feel it"* | Record-pulse animation (600ms), red state, waveform canvas fills |
| Seeing AI output | *"That was fast"* | Panel fade-in (350ms), prose styling, RAW / AI toggle appears instantly |
| Copying output | *"Clean. Done."* | CopyToast enters from bottom, auto-exits — no confirmation modal needed |
| Exploring history | *"Everything is still here"* | History panel is persistent, items are recoverable |

**The overarching feeling must be:** competent, unhurried, and trustworthy.

---

## 3. Color Philosophy

### 3.1 Source of truth

All color values live in `styles/design-tokens.css` under the `--yap-*` namespace. Never introduce raw hex values into component files. Always reference a token.

### 3.2 Canonical brand color

```
--yap-violet: #7C5CFC
```

This is the **only** violet that represents yappify-ai. When in doubt, use this value.
- Hover state: `--yap-violet-hover: #8B6EFD`
- Dimmed/muted: `--yap-violet-dim: #5B42C4`

**Known inconsistency to avoid:** Tailwind `accent` in `tailwind.config.js` is `#9333ea`; `PWA theme-color` is `#8B5CF6`. These are legacy values. Do not introduce new surfaces using them.

### 3.3 Background system (dark theme)

```
--yap-void:      #0A090F   ← deepest background, page body
--yap-surface-1: #110F1A   ← primary panels
--yap-surface-2: #1A1726   ← secondary surfaces, toggles
--yap-surface-3: #221F30   ← input backgrounds, raised elements
```

Dark surfaces are almost black with a blue-purple cast, not neutral gray. This warm darkness prevents the UI from feeling cold.

### 3.4 Background system (light theme)

```
--yap-light-void:    #F8F5FF   ← pale lavender, page body
--yap-light-surface: #FFFCF8   ← warm off-white panels
--yap-light-panel:   rgba(255,255,255,0.66)
--yap-light-glass:   rgba(255,255,255,0.58)
--yap-lavender-1:    #F1EAFF
--yap-lavender-2:    #E7DCFF
--yap-lavender-3:    #C8B7FF
```

Light mode is NOT pure white. It uses lavender-tinted backgrounds with a warm peach breath in the top-left.

### 3.5 Atmosphere colors

These drive background radial gradients. Never use for text or borders.

```
--yap-aura-violet: rgba(124,92,252,0.22)   ← violet glow orbs
--yap-aura-soft:   rgba(185,160,255,0.22)  ← soft lavender haze
--yap-aura-warm:   rgba(255,236,213,0.42)  ← warm peach breath (bottom-right)
```

The atmosphere is always a two-orb composition: violet upper-left + warm peach lower-right. This asymmetry creates depth and warmth simultaneously.

### 3.6 Glass and border tokens

```
--yap-glass:        rgba(255,255,255,0.04)   ← dark panel fill
--yap-glass-border: rgba(255,255,255,0.08)   ← dark panel border
--yap-glass-hover:  rgba(255,255,255,0.06)   ← dark panel hover

--yap-violet-glow:  rgba(124,92,252,0.15)    ← violet ambient glow
--yap-violet-mist:  rgba(124,92,252,0.08)    ← violet icon backgrounds
--yap-violet-ring:  rgba(124,92,252,0.35)    ← focus rings
--yap-active-bg:    rgba(124,92,252,0.10)    ← selected card fill
--yap-active-border: rgba(124,92,252,0.28)   ← selected card border
```

### 3.7 Recording state

```
--yap-record:      #FF6B6B   ← warm coral red
--yap-record-glow: rgba(255,107,107,0.20)
```

Recording is the only red in the system. It is warm (coral), not alarming (pure red).

### 3.8 Text hierarchy

**Dark theme:**
```
--yap-text-1: #F0EDF8   ← primary content — near white with lavender cast
--yap-text-2: #8B87A0   ← secondary — muted lavender
--yap-text-3: #4E4B61   ← hint — barely legible, for decorative labels
```

**Light theme:**
```
--yap-light-text-1: #201A2E   ← very dark purple-black (not neutral black)
--yap-light-text-2: #625B73   ← mid purple-gray
--yap-light-text-3: #9A92AD   ← light purple hint
```

Text is never pure black (`#000`) or pure white (`#fff`) at any hierarchy level. There is always a purple-violet cast.

---

## 4. Typography Philosophy

### 4.1 Font stack

```css
--yap-font:      'Geist', 'Plus Jakarta Sans', -apple-system, sans-serif;
--yap-font-mono: 'Geist Mono', 'JetBrains Mono', monospace;
```

Geist is loaded from Google Fonts in `index.html`. Do not substitute it. The geometric, spacious letterforms carry the calm premium feel.

Mono is used for: status text during processing, raw transcript view, keyboard key labels, code within output.

### 4.2 Type scale (from usage in app)

| Role | Size | Weight | Notes |
|------|------|--------|-------|
| Section label | `text-xs` / 0.75rem | 700 | UPPERCASE, `tracking-wider` |
| Body / panel copy | `text-sm` / 0.875rem | 400 | Default reading text |
| Output prose | 0.96rem | 400 | `line-height: 1.7`, `word-break: break-word` |
| Mode switcher | 0.94rem (mobile) / 1rem (desktop) | 500 | `letter-spacing: -0.015em` |
| Status (mono) | `text-xs` | 400 | Mono, violet, animated `pulse` |
| Modal title | `text-lg` | 600 | |
| Hero heading (output H1) | 1.55rem | 700 | `letter-spacing: -0.02em` |
| Output H2 | 1.22rem | 700 | Has violet bottom border |
| Output H3 | 1.05rem | 700 | Colored `--yap-violet-dim` (light) / `--yap-violet-hover` (dark) |

### 4.3 Letter spacing principles

- Body text: default (0)
- Headings in output prose: `-0.02em` (tight, modern)
- Section labels: `tracking-wider` (wide, uppercase — creates visual separation from body)
- Mode switcher: `-0.015em` (tight for a compact pill)

### 4.4 Anti-patterns

- Do not use system UI serif at any size
- Do not use font weights below 400 or above 700 (Geist only ships 100–900, but the design only uses 400, 500, 600, 700)
- Do not set uppercase on body copy

---

## 5. Spacing Philosophy

### 5.1 Border radius tokens

```css
--yap-radius-sm:   6px    ← tags, kbd keys, inline code
--yap-radius-md:   10px   ← inputs, inline blocks, small cards
--yap-radius-lg:   14px   ← standard cards
--yap-radius-xl:   20px   ← panels, modals, the output surface
--yap-radius-full: 9999px ← pills, mode badge, mic button, mode switcher
```

The radius progression creates a deliberate sense of "softness at scale" — large containers feel more rounded, small inline elements are still softly rounded but feel precise.

### 5.2 Panel layout

The desktop layout uses a 12-column grid:
- Left panel: 3 columns (`lg:col-span-3`)
- Center panel: 6 columns (default, shrinks when panels collapse)
- Right panel: 3 columns (`lg:col-span-3`)

Panels are always `p-6` internally. The center panel header is `px-6 pt-5`.

### 5.3 Component internal spacing

| Context | Padding | Notes |
|---------|---------|-------|
| Modal content | `p-4 sm:p-6` | Responsive |
| Panel body | `p-6` | Fixed |
| Glass card interior | `p-4` | Standard info block |
| Action bar (bottom) | `mt-4`, `gap-3` | Between output and controls |
| Hero controls | `gap-6` | Between the 3 hero buttons |

### 5.4 Micro-spacing

Gaps inside rows/stacks follow `gap-2` (0.5rem), `gap-3` (0.75rem), `gap-5` (1.25rem), `gap-6` (1.5rem). There is no `gap-4` in hero areas — the 1.5rem gap is what gives the controls breathing room.

---

## 6. Visual Hierarchy

### 6.1 Elevation system

The design uses two elevation tracks — light and dark — both defined in `design-tokens.css`.

**Light elevation:**
```
--yap-elevation-1: 0 14px 36px rgba(34,24,76,0.10),  0 1px 0 rgba(255,255,255,0.45) inset
--yap-elevation-2: 0 24px 70px rgba(34,24,76,0.16),  0 1px 0 rgba(255,255,255,0.52) inset
--yap-elevation-3: 0 34px 110px rgba(31,20,74,0.24), 0 1px 0 rgba(255,255,255,0.62) inset
```

**Dark elevation:**
```
--yap-dark-elevation-1: 0 18px 50px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.06) inset
--yap-dark-elevation-2: 0 30px 90px rgba(0,0,0,0.38), 0 1px 0 rgba(255,255,255,0.08) inset
--yap-dark-elevation-3: 0 42px 130px rgba(0,0,0,0.48), 0 1px 0 rgba(255,255,255,0.10) inset
```

The `inset 0 1px 0` creates a top-edge highlight on every elevated surface — the defining detail of the glassmorphism language. It must appear on every panel, card, and modal.

**Elevation assignment:**
- Side panels → `elevation-1` / `dark-elevation-1`
- Modals → `shadow-2xl` + panel class (equivalent to elevation-2 range)
- Output surface → `elevation-3` / `dark-elevation-3` (the most prominent surface)

### 6.2 Reading order (center panel)

```
Header (mode switcher, settings)
  ↓
Hero controls (Transcribe | MIC | Promptify)
  ↓
Status text + RAW/AI toggle
  ↓
Waveform
  ↓
Output surface (scrollable)
  ↓
Action bar (Clear | Copy | Export)
```

The mic button is always visually dominant. Everything else is secondary to it.

### 6.3 The three button hierarchy

In the hero control row, three buttons sit side by side. Their size relationship enforces hierarchy:

| Button | Size | Role |
|--------|------|------|
| Transcribe (left) | 64×64 px, `rounded-2xl` | Secondary — action after capture |
| Mic (center) | 72×72 px, `rounded-full` | **Primary hero** — the first action |
| Promptify/Translate/Process (right) | 64×64 px, `rounded-2xl` | Secondary — action after transcription |

The 8px size difference is intentional and must be preserved on any surface that reproduces this control group.

---

## 7. Animation Philosophy

### 7.1 Principles

1. **Motion communicates state, not decoration.** Every animation tells the user something is happening, has happened, or is available.
2. **Slow atmosphere, fast feedback.** Background orbs drift over 48–64 seconds. UI responses complete in 120–350ms.
3. **Respects `prefers-reduced-motion`.** All keyframe animations are wrapped in `@media (prefers-reduced-motion: no-preference)`. The reduced-motion block collapses all durations to `0.01ms`.

### 7.2 Easing

```css
--yap-ease:     cubic-bezier(0.16, 1, 0.3, 1)   ← spring-like, overshoots slightly — all primary transitions
--yap-ease-out: cubic-bezier(0, 0, 0.2, 1)       ← pure deceleration — record pulse
```

Never use `ease-in` or `linear` for UI transitions. They feel mechanical.

### 7.3 Duration scale

```css
--yap-duration-sm: 120ms   ← hover states, color changes
--yap-duration-md: 200ms   ← all standard transitions (buttons, panels, inputs)
--yap-duration-lg: 350ms   ← panel entry, fade-in, modals
```

### 7.4 Named keyframes

| Keyframe | Duration | Purpose |
|----------|----------|---------|
| `yap-mic-breathe` | 4s, infinite | Mic button idle — subtle scale + glow pulse |
| `yap-record-pulse` | 600ms, infinite | Mic recording state — red ring expansion |
| `yap-mic-halo` | 5.6s, infinite | Ring around mic — opacity/scale breathe |
| `yap-drift-a` | 48s, infinite | Left atmosphere orb slow drift |
| `yap-drift-b` | 56s, infinite | Right atmosphere orb slow drift |
| `yap-drift-c` | 64s, infinite | Center content orb drift |
| `yap-panel-enter` | 350ms, once | Panel/modal slide-up entry (`translateY(6px → 0)`) |
| `yap-fade-in` | 350ms, once | Content fade-up entry (`translateY(4px → 0)`) |
| `yap-copy-toast` | 1s, once | CopyToast appear → hold → dismiss |
| `yap-processing-shimmer` | 1.4s, infinite | Shimmer on output surface during AI processing |

### 7.5 Interaction micro-animations

- `.yap-hover-lift`: `translateY(-2px)` on hover — applied to action buttons and cards
- `.yap-glow-in`: box-shadow expands to violet glow on hover
- Active/press: `active:scale-95` on mic and action buttons — must always be present for tactile feel
- Panel open (mobile drawer): `translateX(0 / -100%)`, `duration-300` — slightly slower than UI transitions because the drawer is a large surface

---

## 8. Glassmorphism Rules

Glassmorphism in yappify-ai is **functional**, not decorative. Every frosted surface exists because there is layered content beneath it. These rules prevent the glass from looking cheap.

### 8.1 Required properties for any glass surface

```css
background: rgba(255,255,255, N);          /* light: 0.58–0.78; dark: 0.025–0.06 */
border: 1px solid [glass-border token];    /* always present — defines the edge */
backdrop-filter: blur(Npx);               /* 12–26px; larger surfaces blur more */
-webkit-backdrop-filter: blur(Npx);       /* always pair with the above */
box-shadow: [elevation token];             /* always include the inset top highlight */
```

Never omit `border`. A borderless frosted surface will disappear against similar backgrounds.

### 8.2 Blur intensity by surface type

| Surface | Blur | Notes |
|---------|------|-------|
| Side panels | `blur(26px)` | Largest blur — persistent panels need strong separation |
| Glass cards | `blur(16px)` | Moderate — interactive content |
| Modal backdrop | `blur(24px)` | Blurs content behind the modal |
| Output surface | `blur(24px)` (light) / `blur(16px)` (dark) | Lower in dark — less contrast needed |
| Mode switcher | `blur(18px)` | Header pill |
| Drop zone | Inherits from panel | No explicit blur |

### 8.3 Dark vs light glass behavior

In **light mode**, glass fills are white-opaque enough to read against the lavender background. Borders use violet-tinted low-opacity values.

In **dark mode**, glass fills are nearly invisible (0.025–0.06 opacity). The surface is defined almost entirely by the border and the elevated shadow. The inset `0 1px 0 rgba(255,255,255,0.06)` top highlight becomes critical here.

### 8.4 Active/selected state

Selected cards add:
- `border-left: 2px solid var(--yap-violet)` — a violet left accent stripe
- Background shifts to `--yap-active-bg` (rgba violet at 10%)
- Border color becomes `--yap-active-border` (rgba violet at 28%)

Never remove the left border as the selection indicator — it is the canonical pattern in this system.

### 8.5 Hover state progression

```
Default → Hover → Active/Selected
border-color: ghost → soft violet → strong violet
background: near-transparent → slightly more opaque → violet-tinted
box-shadow: base → lift (+Y, +spread) → violet glow
```

The transition between states uses `--yap-duration-md` (200ms) with `--yap-ease`.

---

## 9. Reusable UI Patterns

These are the structural patterns extracted from the app. Reproduce them exactly on any new surface.

### 9.1 Atmosphere background

Every full-page surface uses a two-orb radial gradient composition:

```css
/* Light */
background:
  radial-gradient(circle at 14% 18%, rgba(185,160,255,0.22), transparent 34%),   /* top-left lavender */
  radial-gradient(circle at 88% 82%, rgba(255,236,213,0.44), transparent 32%),   /* bottom-right warm peach */
  linear-gradient(135deg, #FFFCF8 0%, #F8F5FF 48%, #F4EEFF 100%);               /* base lavender gradient */

/* Dark */
background: #0A090F;  /* --yap-void, solid — orbs are CSS pseudo-elements */
```

Dark mode atmosphere orbs are on `.yap-app-shell::before` and `::after` pseudo-elements, animated with `yap-drift-a` and `yap-drift-b`.

### 9.2 Section label pattern

```tsx
<h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-[var(--yap-text-2)]">
  Section Title
</h3>
```

Used for every panel section header, info block heading, and modal sub-section. Spacing below: `mb-3` to `mb-4`.

### 9.3 Modal icon header

```tsx
<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
  <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
</div>
```

Icon size for modal headers: always 20px. Lucide icons only.

### 9.4 Violet numbered steps (workflow list)

```tsx
<li className="flex items-start gap-2">
  <span className="flex-shrink-0 w-5 h-5 bg-purple-600 dark:bg-[var(--yap-violet)] text-white text-xs font-bold rounded-full flex items-center justify-center">
    1
  </span>
  <span><strong>Step title</strong> — description.</span>
</li>
```

This is the canonical way to show ordered workflows (onboarding, how-to sections).

### 9.5 Info block (glass card with label)

```tsx
<div className="yap-glass-card bg-purple-50 dark:bg-[var(--yap-violet-mist)] border border-purple-100 dark:border-[var(--yap-active-border)] rounded-xl p-4">
  <h3 className="text-xs font-bold text-purple-900 dark:text-[var(--yap-text-1)] uppercase tracking-wider mb-3">
    Block Title
  </h3>
  <ul className="space-y-2 text-sm text-gray-700 dark:text-[var(--yap-text-2)]">
    <li>…</li>
  </ul>
</div>
```

Used for "Workflow", "Important Notes", "Privacy", and similar grouped info panels.

### 9.6 Status / processing text

```tsx
<span className="text-xs font-mono text-purple-600 dark:text-[var(--yap-violet-hover)] animate-pulse">
  Processing...
</span>
```

Mono, violet, `animate-pulse`. Only visible when something is actively happening.

### 9.7 Error display

Red pill toast, anchored `top-20`, centered, above all content:

```tsx
<div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 z-50">
  {error}
</div>
```

Never use modal dialogs for transient errors.

### 9.8 Mode badge / pill

```tsx
<span className="yap-mode-badge rounded-full px-3 py-1 text-xs font-semibold">
  Speech · Prompt Enhancer
</span>
```

Used as a contextual indicator of current mode in empty states, not as navigation.

### 9.9 Icon container (mist background)

```tsx
<div className="yap-icon-mist p-3 rounded-xl">
  <Mic size={20} />
</div>
```

For hero empty-state icons: `p-4 rounded-full`, size 36px. For panel/modal icons: `p-2 rounded-lg`, size 16–20px.

### 9.10 Keyboard key visual

```tsx
<span className="yap-kbd-key">↑</span>
```

Used in keyboard shortcut guides. The `yap-kbd-key` class renders a realistic keycap with gradient background, border, and depth shadow.

---

## 10. Reusable Components

These are the React components from `components/` that must be used (not re-implemented) on any new surface.

| Component | File | Use case |
|-----------|------|----------|
| `Modal` | `components/Modal.tsx` | All overlays — provides portal, backdrop, escape-key, scroll-lock |
| `OutputMarkdown` | `components/OutputMarkdown.tsx` | Rendering AI prose output with `yap-output-prose` |
| `Waveform` | `components/Waveform.tsx` | Canvas audio visualizer — reads `--yap-violet` at runtime |
| `CopyToast` | `components/CopyToast.tsx` | Keyed copy confirmation toast |
| `PanelFooterLinks` | `components/PanelFooterLinks.tsx` | "How to Use" + developer link — use in every panel footer |
| `ModeSwitcher` | `components/ModeSwitcher.tsx` | App mode selector pill (Speech / Translate / Upload) |
| `KeyboardShortcutsGuide` | `components/KeyboardShortcutsGuide.tsx` | Arrow-key shortcut grid — embed in any help surface |

**Extension rules:**
- New modals → extend `Modal`, do not build ad-hoc portals
- New panels → follow `*Panel.tsx` structure: header + scrollable body + `PanelFooterLinks`
- New selectable lists → use `yap-glass-card` + `yap-glass-active` pattern (see section 8.4)

---

## 11. Empty State Philosophy

The empty state is the **primary onboarding experience**. There is no separate tutorial page. The app teaches itself through its own empty state.

### 11.1 Anatomy of the empty state

```
[circle icon container — p-4, rounded-full, violet-mist background]
  [Mic icon — 36px — dark:yap-violet-hover]
[Headline — "Speak something." — text-lg, font-bold, gray-500 / yap-text-1]
[Sub-hint — mode-aware instruction — text-sm, opacity-70]
[Mode badge — current mode label — yap-mode-badge, rounded-full]
```

### 11.2 Copy rules

- Headline is always `"Speak something."` — imperative, human, minimal. Do not change this.
- Sub-hint changes per mode:
  - Speech: `"Record, Transcribe, then Promptify."`
  - Translate: `"Record or transcribe, then translate."`
  - Upload: `"Upload or record audio, then process."`
- Mode badge shows the current active mode label (e.g., "Speech · Prompt Enhancer")

### 11.3 Empty state design rules

- The empty state must feel spacious, not abandoned
- Icon is circular and centered — it mirrors the mic button above it
- No call-to-action buttons in the empty state itself — the action buttons are always visible above in the hero controls
- The violet mist icon container creates visual continuity with the violet mic button
- Empty state text must never use `--yap-text-1` (too strong) — use `gray-500` / `--yap-text-2` as the base

### 11.4 What the empty state communicates

1. Voice is the primary input method (large mic icon)
2. The workflow is sequenced, not simultaneous (mode-specific hint)
3. The user is in a specific mode (mode badge)
4. The workspace is clean and ready (generous space, no noise)

---

## 12. Voice-First UX Philosophy

### 12.1 The mic button is the hero

Every layout decision radiates outward from the mic button. It is:
- 72×72 px (8px larger than the flanking action buttons)
- `rounded-full` (pill shape — softer, more approachable than rectangular)
- Breathing when idle (`yap-mic-breathe` — 4s loop)
- Pulsing when recording (`yap-record-pulse` — 600ms loop, red)
- Centered in the hero control row
- Violet on dark, white on light — always high contrast

### 12.2 Sequence: Talk → Transcribe → Transform

The workflow is linear and the UI reinforces it:

```
[Transcribe button] ← left  |  [MIC button] ← center  |  [Promptify/Translate/Process button] ← right
```

The left button acts on the recording. The right button acts on the transcript. The sequence flows left-to-right through the three buttons. This never changes.

### 12.3 Voice as the first class citizen

- The app opens directly to the recording interface — no onboarding screens, no landing page wall, no email signup
- The history panel preserves every session — users can always recover previous output
- Keyboard shortcuts mirror the button layout (arrow keys map to the same sequence)
- On mobile, the full center panel is always visible — panels slide in as overlays, never replacing the core controls

### 12.4 Output is secondary to input

- The output surface is below the hero controls, not above
- The "Speak something." empty state keeps the focus upward on the mic
- Output actions (Copy, Export) are at the bottom — they are the end of the flow, not the beginning

---

## 13. Landing Page Recommendations

There is currently no separate marketing landing page. When one is built, these rules apply.

### 13.1 Structure

A yappify-ai landing page must follow this section order:

```
1. Hero             — tagline, sub-headline, single CTA
2. Problem          — "Most AI tools are still too slow for everyday thinking"
3. Solution demo    — show the 3-step workflow (voice → transcribe → transform)
4. Feature set      — 6–9 capability tiles
5. BYOK explanation — honest, clear, with the "You bring the key" message
6. Privacy note     — accurate language (see BRAND_STORY.md §Privacy-Conscious Positioning)
7. CTA              — single action: open the workspace
```

Do not add: pricing tables, testimonials carousel, email capture on first visit, video autoplay with sound.

### 13.2 Hero section

**Tagline candidates (from BRAND_STORY.md):**
- *"Yapp your thoughts over."* — primary, playful, memorable
- *"Think out loud. Use it polished."* — value-led
- *"Speak it messy. Use it polished."* — contrast structure
- *"Less typing. More thinking."* — efficiency framing

**Sub-headline** must communicate the core mechanic in one sentence:
> "A voice-first AI workflow that turns spoken thoughts, rough notes, and uploaded files into clean, usable output — powered by your own Gemini API key."

**CTA button:** single, violet (`yap-violet-button`), text: "Open the Workspace" or "Start Yapping".

### 13.3 Feature tiles

Each feature tile follows the `yap-glass-card` pattern:

```tsx
<div className="yap-glass-card yap-hover-lift rounded-xl p-5">
  <div className="yap-icon-mist p-2 rounded-lg mb-3 w-fit">
    <[Icon] size={20} />
  </div>
  <h3 className="font-semibold text-sm mb-1">[Feature name]</h3>
  <p className="text-sm yap-text-secondary">[One-line description]</p>
</div>
```

Feature set to highlight (from BRAND_STORY.md):

| Feature | Icon (lucide) | One-liner |
|---------|--------------|-----------|
| Speech-to-Text | `Mic` | "Yapp your thoughts, get clean transcription." |
| Prompt Enhancer | `Sparkles` | "Turn messy input into a better AI prompt." |
| Quick Notes | `FileText` | "Capture ideas before they disappear." |
| Translation | `Languages` | "Speak it, translate it, send it." |
| Transliteration | `Type` | "Write the language in the script you can type." |
| Upload Files | `Upload` | "Process files into notes, summaries, or actions." |
| Speaking Notes | `Mic2` | "Turn rough input into notes you can actually say." |
| Custom Modes | `Sliders` | "Tune the workflow for your repeated tasks." |

### 13.4 BYOK section

Use the canonical phrase:
> **"You bring the key. yappify-ai gives you the workflow."**

Show the 3-part value visually:

```
[Key icon]          [Arrow icon]        [Sparkles icon]
Your Gemini key  →  yappify-ai layer  →  Polished output
```

Always follow with the honest privacy framing (not "your data never leaves your device"). See BRAND_STORY.md §Privacy-Conscious Positioning for exact language.

### 13.5 Typography on the landing page

- Use the same Geist + Geist Mono stack as the app
- Load from same Google Fonts CDN link as `index.html`
- Hero H1: 3–4rem, weight 700, `letter-spacing: -0.03em`
- Section headings: 1.5–2rem, weight 700, `letter-spacing: -0.02em`
- Body: 1rem, weight 400, `line-height: 1.7`
- All type follows the same color hierarchy as the app (never pure black)

### 13.6 What the landing page must NOT do

- Use any new color values not in `design-tokens.css`
- Use any third-party component library (shadcn, MUI, Chakra)
- Add social proof before the workflow explanation
- Claim total privacy (data goes to Google Gemini — this must be acknowledged)
- Describe yappify-ai as a "chatbot", "free AI", or "Gemini wrapper"
- Position "free" as the main value proposition (it is a benefit, not the lead)

---

## 14. Mobile Design Considerations

### 14.1 Current mobile patterns

The app uses a **mobile-first responsive approach** with two breakpoints:
- Default (mobile): single column, full-screen center panel
- `lg` (1024px+): 12-column 3-panel layout activates

On mobile:
- Left panel (mode settings) → slide-in drawer from left (`w-[84%] max-w-xs`, `translate-x-0 / -translate-x-full`)
- Right panel (history) → slide-in drawer from right (`translate-x-0 / translate-x-full`)
- Both drawers have `bg-black/50` backdrop, tap-to-dismiss

### 14.2 Mobile drawer spec

```
width: 84vw, max 320px
animation: translateX transition, duration-300
backdrop: bg-black/50, pointer-events-auto
z-index: 40
padding: p-6 (same as desktop panel)
```

### 14.3 Mobile hero controls

The hero controls (Transcribe | Mic | Promptify) must be reproduced at identical sizes on mobile. Do not scale them down. The 72px mic is the smallest it should ever be.

### 14.4 Touch considerations

- All interactive targets: minimum 44×44 px (iOS HIG)
- The mic button at 72px and flanking buttons at 64px already satisfy this
- `active:scale-95` on all buttons provides tactile press feedback
- `overscroll-behavior: contain` on the output surface prevents page bounce

### 14.5 Landing page mobile

On a landing page, the mobile experience must:
- Keep the hero section to 100dvh (full screen visible content above fold)
- Feature tiles go to single column on mobile
- BYOK diagram stacks vertically (`flex-col` on `sm:`)
- CTA button is full-width on mobile (`w-full sm:w-auto`)
- Navigation is a simple hamburger or anchored links — no mega-menu

---

## 15. Elements That Must Never Change

These elements form the identity of yappify-ai. Changing them would break user recognition or violate product integrity.

### 15.1 Visual identity

| Element | Value | Why it's fixed |
|---------|-------|----------------|
| Brand violet | `#7C5CFC` | Canonical accent — all brand recognition anchors here |
| Void background | `#0A090F` | Distinctive near-black with purple cast — core dark identity |
| Mic button size | 72×72 px, `rounded-full` | Hero element — size ratio to flanking buttons encodes hierarchy |
| Three-button layout order | Transcribe → Mic → Action | Encodes the workflow sequence in the UI |
| Font family | Geist + Geist Mono | Typography fingerprint of the product |
| Inset top highlight | `0 1px 0 rgba(255,255,255, N) inset` | Defines the glass surface across all elevations |
| `--yap-*` namespace | All tokens prefixed `--yap-` | Prevents collision, signals codebase intent |

### 15.2 Copy and naming

| Element | Fixed value |
|---------|-------------|
| Product name | `yappify-ai` (lowercase, hyphenated) |
| Verb | `yapp` |
| Empty state headline | `"Speak something."` |
| BYOK phrase | `"You bring the key. yappify-ai gives you the workflow."` |
| Footer developer link | `https://www.tmshahz.com` |

### 15.3 Behavior contracts

| Behavior | Rule |
|----------|------|
| Privacy claim language | Never claim total privacy; use accurate language from BRAND_STORY.md |
| API key handling | `saveApiKey: false` must clear the key before writing; never log |
| Animation respects motion preferences | All `@keyframes` must be inside `@media (prefers-reduced-motion: no-preference)` |
| Dark mode strategy | `darkMode: 'class'` on `<html>` — never `prefers-color-scheme` alone |
| Storage keys | `yappify.v2.*` namespace — changing these breaks existing user data |
| Modal pattern | Always use `Modal` component; never build ad-hoc portals |

### 15.4 Design system boundaries

| Never do | Because |
|----------|---------|
| Add shadcn, MUI, Radix, Chakra | Fragments the visual language; introduces conflicting tokens |
| Introduce new purple hex values | Consolidate to `--yap-violet` and its scale |
| Use `ease-in` or `linear` for transitions | Mechanical feel contradicts the calm premium identity |
| Omit the `border` from glass surfaces | Surface loses definition against layered backgrounds |
| Remove the left-border accent on selected cards | Primary selection indicator — removing it breaks the card pattern |
| Scale mic button below 72px | Mic is the hero — smaller size demotes it |
| Change `STORAGE_KEYS` without migration | Silently destroys user history and preferences |

---

## Appendix A — Quick Reference: Design Token Map

```
COLOR
  Brand:      --yap-violet (#7C5CFC) · --yap-violet-hover · --yap-violet-dim
  Surfaces:   --yap-void · --yap-surface-1/2/3 (dark)
              --yap-light-void · --yap-light-surface (light)
  Glass:      --yap-glass · --yap-glass-border · --yap-glass-hover
              --yap-light-panel · --yap-light-glass · --yap-light-border
  Accent FX:  --yap-violet-glow · --yap-violet-mist · --yap-violet-ring
              --yap-active-bg · --yap-active-border
  Recording:  --yap-record (#FF6B6B) · --yap-record-glow
  Text dark:  --yap-text-1/2/3
  Text light: --yap-light-text-1/2/3
  Lavender:   --yap-lavender-1/2/3
  Atmosphere: --yap-aura-violet · --yap-aura-soft · --yap-aura-warm
  Elevation:  --yap-elevation-1/2/3 · --yap-dark-elevation-1/2/3

TYPOGRAPHY
  Sans:  --yap-font (Geist, Plus Jakarta Sans, system-ui)
  Mono:  --yap-font-mono (Geist Mono, JetBrains Mono)

RADIUS
  --yap-radius-sm (6) · md (10) · lg (14) · xl (20) · full (9999)

MOTION
  Easing: --yap-ease (spring) · --yap-ease-out (deceleration)
  Speed:  --yap-duration-sm (120ms) · md (200ms) · lg (350ms)
```

## Appendix B — Quick Reference: Semantic CSS Classes

```
LAYOUT
  yap-app-shell         Root wrapper with atmosphere gradients + animated orbs
  yap-app-content       Content layer (z-index 1) above background
  yap-side-panel        Sidebar column — applies elevation-1
  yap-center-panel      Center column — has center violet halo pseudo-element
  yap-glass-panel       Frosted sidebar/modal container
  yap-hero-stack        Vertical stack for hero controls area
  yap-hero-controls     Row of 3 buttons — positions mic-button halo pseudo-element

INTERACTIVE SURFACES
  yap-glass-card        Selectable card — hover + selected states
  yap-glass-active      Selected card modifier — violet left border + tinted background
  yap-glass-input       Form input — focus ring uses --yap-violet-ring
  yap-output-surface    Main AI output area — highest elevation, shimmer-capable
  yap-drop-zone         File upload target — violet ring on drag-active
  yap-modal-backdrop    Frosted backdrop behind modals

BUTTONS
  yap-violet-button     Primary CTA — violet gradient
  yap-ghost-button      Secondary — translucent, subdued
  yap-action-button     Utility (Copy, Export, Transcribe, Promptify)
  yap-mic-button        Hero record button — breathing/recording states

TEXT
  yap-text-primary      text-1 (dark) / light-text-1 (light)
  yap-text-secondary    text-2 / light-text-2
  yap-text-hint         text-3 / light-text-3

DECORATION
  yap-icon-mist         Icon container with violet-mist background
  yap-mode-badge        Current mode pill
  yap-mode-switcher     Header mode select (with chevron)
  yap-kbd-key           Keyboard keycap visual
  yap-mono-output       Raw transcript monospace wrapper

ANIMATION UTILITIES
  yap-hover-lift        translateY(-2px) on hover
  yap-glow-in           Violet box-shadow on hover
  yap-fade-in           Entry: opacity+Y fade (350ms, once)
  yap-panel-enter       Entry: Y slide (350ms, once) — panels and modals
  yap-processing        Shimmer on output surface during AI processing
  yap-copy-toast        Keyed toast enter/hold/exit animation
  custom-scrollbar      6px thin scrollbar with rounded thumb
```

---

*This brief reflects the state of yappify-ai as of June 2026.
All values are derived from `styles/design-tokens.css`, `styles/global.css`, `styles/output-prose.css`, `BRAND_STORY.md`, and direct code analysis of `App.tsx` and `components/`.*
*Do not modify this file independently of the source files listed above.*
