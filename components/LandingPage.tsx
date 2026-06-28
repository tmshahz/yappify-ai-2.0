import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  ChevronDown,
  Cloud,
  Code2,
  ClipboardList,
  ExternalLink,
  FileAudio,
  FileText,
  Github,
  GraduationCap,
  Key,
  Languages,
  ListChecks,
  Lock,
  Mic,
  Moon,
  PenLine,
  Server,
  Sliders,
  Sparkles,
  Sun,
  Type,
} from 'lucide-react';
import clsx from 'clsx';
import { useSettings } from '../hooks/useSettings';

type IconType = React.ComponentType<{ size?: number; className?: string }>;

// ─── Module-level constants ───────────────────────────────────────────────────

// Hero waveform bar data — envelope tallest in the center.
const WAVEFORM_BARS = Array.from({ length: 28 }, (_, i) => {
  const t = i / 27;
  const envelope = Math.sin(t * Math.PI);
  const jitter = 0.3 + Math.abs(Math.sin(i * 1.9 + 0.8)) * 0.65;
  const peak = Math.max(0.18, Math.min(1, envelope * 0.7 + jitter * 0.45));
  const delay = ((i * 0.058 + Math.sin(i * 0.7) * 0.1) % 1.2).toFixed(3);
  const duration = (0.85 + Math.abs(Math.sin(i * 0.55)) * 0.95).toFixed(2);
  return { peak: peak.toFixed(2), delay, duration };
});

const SUBSTACK_LINKS = [
  {
    label: 'Introduction',
    href: 'https://substack.com/@tmshahz/note/p-201830115?utm_source=notes-share-action&utm_medium=web',
  },
  {
    label: 'Getting started',
    href: 'https://substack.com/@tmshahz/note/p-201844633?utm_source=notes-share-action&utm_medium=web',
  },
] as const;

function getSubstackLink(label: (typeof SUBSTACK_LINKS)[number]['label']) {
  return SUBSTACK_LINKS.find((link) => link.label === label)!;
}

// Smaller waveform used in the demo stage 1 (active mic/recording visual).
const MINI_BARS = Array.from({ length: 14 }, (_, i) => {
  const t = i / 13;
  const envelope = Math.sin(t * Math.PI);
  const jitter = 0.25 + Math.abs(Math.sin(i * 2.1)) * 0.65;
  const peak = Math.max(0.15, Math.min(1, envelope * 0.55 + jitter * 0.5));
  const delay = (i * 0.065 % 0.85).toFixed(2);
  const duration = (0.7 + Math.abs(Math.sin(i * 0.55)) * 0.8).toFixed(2);
  return { peak: peak.toFixed(2), delay, duration };
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const LandingWaveform: React.FC = () => (
  <div className="yap-landing-waveform" aria-hidden>
    {WAVEFORM_BARS.map((bar, i) => (
      <div
        key={i}
        className="yap-landing-waveform__bar"
        style={{
          '--bar-peak': bar.peak,
          '--bar-duration': `${bar.duration}s`,
          '--bar-delay': `${bar.delay}s`,
        } as React.CSSProperties}
      />
    ))}
  </div>
);

const MiniWaveform: React.FC = () => (
  <div className="yap-mini-waveform" aria-hidden>
    {MINI_BARS.map((bar, i) => (
      <div
        key={i}
        className="yap-mini-waveform__bar"
        style={{
          '--bar-peak': bar.peak,
          '--bar-duration': `${bar.duration}s`,
          '--bar-delay': `${bar.delay}s`,
        } as React.CSSProperties}
      />
    ))}
  </div>
);

const HERO_CYCLE_WORDS = ['thoughts', 'prompts', 'ideas', 'notes', 'workflows'] as const;
const HERO_WORD_HOLD_MS = 2500;
const HERO_WORD_TRANSITION_MS = 600;

const HeroCyclingWord: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let current = 0;
    let clearAnim: ReturnType<typeof setTimeout> | undefined;

    const intervalId = window.setInterval(() => {
      setPrevIndex(current);
      current = (current + 1) % HERO_CYCLE_WORDS.length;
      setIndex(current);
      setIsAnimating(true);

      clearAnim = window.setTimeout(() => {
        setPrevIndex(null);
        setIsAnimating(false);
      }, HERO_WORD_TRANSITION_MS);
    }, HERO_WORD_HOLD_MS + HERO_WORD_TRANSITION_MS);

    return () => {
      window.clearInterval(intervalId);
      if (clearAnim) window.clearTimeout(clearAnim);
    };
  }, []);

  return (
    <span className="yap-hero-cycle" aria-hidden>
      {prevIndex !== null && (
        <span className="yap-hero-cycle__word yap-hero-cycle__word--exit">
          {HERO_CYCLE_WORDS[prevIndex]}
        </span>
      )}
      <span
        className={clsx(
          'yap-hero-cycle__word',
          isAnimating ? 'yap-hero-cycle__word--enter' : 'yap-hero-cycle__word--idle',
        )}
      >
        {HERO_CYCLE_WORDS[index]}
      </span>
    </span>
  );
};

const HeroTitle: React.FC = () => (
  <h1
    aria-label="yapp your thoughts"
    className="yap-hero-title yap-text-primary font-bold leading-[1.06] tracking-[-0.03em]"
    style={{ fontSize: 'clamp(2.7rem, 6.4vw, 4.75rem)' }}
  >
    <span className="yap-hero-title__line">yapp your</span>
    <HeroCyclingWord />
  </h1>
);

const XSocialIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SocialLinksRow: React.FC<{ align?: 'center' | 'start' }> = ({ align = 'center' }) => (
  <div
    className={clsx(
      'yap-social-links',
      align === 'start' ? 'justify-start' : 'justify-center',
    )}
  >
    {SOCIAL_LINKS.map(({ label, href, Icon }) => (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="yap-social-link"
      >
        <Icon size={18} aria-hidden />
      </a>
    ))}
  </div>
);

const SectionHeading: React.FC<{ eyebrow: string; title: string; sub?: string }> = ({
  eyebrow, title, sub,
}) => (
  <div className="yap-reveal mb-12 text-center">
    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider yap-text-secondary">
      {eyebrow}
    </h3>
    <h2
      className="yap-text-primary font-bold tracking-tight"
      style={{ fontSize: 'clamp(1.7rem, 3.6vw, 2.5rem)', letterSpacing: '-0.02em' }}
    >
      {title}
    </h2>
    {sub && (
      <p className="yap-text-secondary mx-auto mt-4 max-w-xl text-lg leading-relaxed">
        {sub}
      </p>
    )}
  </div>
);

const SubstackGuideLink: React.FC<{
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}> = ({ href, label, children, className }) => (
  <div className={clsx('yap-reveal flex justify-center', className)}>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="yap-hover-lift yap-glass-card inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold yap-text-secondary transition-colors hover:border-purple-300 hover:text-purple-600 dark:border-[var(--yap-glass-border)] dark:hover:border-[var(--yap-violet-ring)] dark:hover:text-[var(--yap-violet-hover)]"
    >
      {children}
      <ExternalLink size={14} aria-hidden />
    </a>
  </div>
);

// ─── Merged interactive modes/features section ───────────────────────────────

interface ModeFeature {
  icon: IconType;
  title: string;
  desc: string;
  from: string;
  to: string;
  inputExample: string;
  outputExample: string;
}

interface ParentMode {
  label: string;
  icon: IconType;
  features: ModeFeature[];
}

const ModesSection: React.FC = () => {
  const [parentIdx, setParentIdx] = useState(0);
  const [featureIdx, setFeatureIdx] = useState(0);

  const parent = PARENT_MODES[parentIdx];
  const feature = parent.features[featureIdx];
  const selectParent = (i: number) => { setParentIdx(i); setFeatureIdx(0); };

  return (
    <section id="features" className="yap-landing-anchor px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Modes"
          title="The same modes you'll use inside."
          sub="Pick a parent mode, then explore the features inside it. Click any feature to see a real before-and-after."
        />

        {/* Centered parent mode selectors */}
        <div className="yap-reveal mb-10 flex justify-center">
          <div className="yap-mode-tabs">
            {PARENT_MODES.map((tab, i) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.label}
                  onClick={() => selectParent(i)}
                  className={clsx('yap-mode-tab', parentIdx === i && 'is-active')}
                >
                  <TabIcon size={14} aria-hidden />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inner feature cards */}
        <div key={`p-${parentIdx}`} className="yap-tab-enter mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {parent.features.map((f, i) => {
            const Icon = f.icon;
            const selected = featureIdx === i;
            return (
              <button
                key={f.title}
                onClick={() => setFeatureIdx(i)}
                className={clsx(
                  'yap-glass-card yap-hover-lift flex h-full text-left rounded-xl border p-5 transition-all',
                  selected
                    ? 'yap-glass-active border-purple-600 dark:border-[var(--yap-active-border)]'
                    : 'border-gray-200 hover:border-purple-300 dark:border-gray-800 dark:hover:border-purple-700',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="yap-icon-mist flex-shrink-0 rounded-lg bg-purple-100 p-2 text-purple-700 dark:bg-[var(--yap-violet-mist)] dark:text-[var(--yap-violet-hover)]">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-gray-800 dark:text-[var(--yap-text-1)]">
                      {f.title}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-[var(--yap-text-2)]">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected feature preview panel */}
        <div key={`f-${parentIdx}-${featureIdx}`} className="yap-tab-enter">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium yap-text-secondary dark:border-[var(--yap-glass-border)] dark:bg-[var(--yap-surface-2)]">
              {feature.from}
            </span>
            <ArrowRight size={13} className="flex-shrink-0 text-[var(--yap-violet)] opacity-50" aria-hidden />
            <span className="inline-flex items-center rounded-full border border-[rgba(124,92,252,0.2)] bg-[rgba(124,92,252,0.06)] px-3 py-1 text-xs font-medium text-[var(--yap-violet)]">
              {feature.to}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="yap-glass-card rounded-2xl p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider yap-text-hint">Input</p>
              <p className="text-sm leading-relaxed yap-text-secondary italic">{feature.inputExample}</p>
            </div>
            <div className="yap-glass-card rounded-2xl border-[rgba(124,92,252,0.18)] bg-[rgba(124,92,252,0.04)] p-5 dark:bg-[var(--yap-violet-mist)]">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--yap-violet)]">Output</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed yap-text-primary">{feature.outputExample}</p>
            </div>
          </div>
        </div>

        <SubstackGuideLink
          href={getSubstackLink('Getting started').href}
          label={getSubstackLink('Getting started').label}
          className="mt-10"
        >
          Read the getting started guide
        </SubstackGuideLink>
      </div>
    </section>
  );
};

// ─── Context management section ───────────────────────────────────────────────

const ContextSection: React.FC = () => (
  <section id="context" className="yap-landing-anchor px-6 py-24 sm:py-32">
    <div className="mx-auto max-w-5xl">
      <SectionHeading
        eyebrow="Context"
        title="Context is the hard part. Yappify helps clean it."
        sub="AI tools are only as good as the context you give them. Yappify captures messy thoughts, preserves intent, removes the noise, and turns rough speech into clean prompts, notes, translations, and instructions you can reuse across tools."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Raw yapping — with voice input active module */}
        <div className="yap-reveal">
          <div className="yap-glass-card flex h-full flex-col gap-4 rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <div className="yap-demo-record-dot" aria-hidden />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider yap-text-secondary">
                Voice input active
              </span>
            </div>
            <p className="text-sm leading-relaxed yap-text-secondary italic">
              "so um, okay, basically I want to, like, build an onboarding flow, please, and uh it should be fast and not annoying and also maybe show progress, sorry I keep saying maybe, but yeah that's the idea..."
            </p>
            <div className="mt-1">
              <MiniWaveform />
            </div>
            <p className="text-xs yap-text-hint">Raw transcript. Filler, repetition, false starts, rambling.</p>
          </div>
        </div>

        {/* Cleaning — with prompt enhancer processing animation */}
        <div className="yap-reveal" style={{ transitionDelay: '70ms' }}>
          <div className="yap-glass-card flex h-full flex-col gap-4 rounded-2xl border-purple-100 bg-purple-50 p-6 dark:border-[var(--yap-active-border)] dark:bg-[var(--yap-violet-mist)]">
            <div className="flex items-center gap-2">
              <div className="yap-icon-mist flex h-7 w-7 items-center justify-center rounded-lg">
                <Sparkles size={14} />
              </div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--yap-violet)]">
                Yappify cleans it
              </span>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(124,92,252,0.22)] bg-[rgba(124,92,252,0.07)] px-3 py-1 text-[11px] font-semibold text-[var(--yap-violet)]">
                <Sparkles size={11} aria-hidden />
                Prompt Enhancer
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="yap-processing-dot"
                    style={{ animationDelay: `${i * 0.18}s` }}
                    aria-hidden
                  />
                ))}
              </div>
              <span className="font-mono text-xs yap-text-secondary">Processing...</span>
            </div>
            <div className="yap-demo-progress rounded-full" aria-hidden />

            <ul className="flex flex-col gap-2 text-sm leading-relaxed yap-text-secondary">
              <li className="flex items-center gap-2"><CheckCircle size={13} className="text-[var(--yap-violet)] opacity-70" aria-hidden /> Removes filler and repetition</li>
              <li className="flex items-center gap-2"><CheckCircle size={13} className="text-[var(--yap-violet)] opacity-70" aria-hidden /> Strips unnecessary pleasantries</li>
              <li className="flex items-center gap-2"><CheckCircle size={13} className="text-[var(--yap-violet)] opacity-70" aria-hidden /> Preserves the real intent</li>
            </ul>
            <p className="text-xs yap-text-hint">Less tokens. Clearer signal.</p>
          </div>
        </div>

        {/* Clean context */}
        <div className="yap-reveal" style={{ transitionDelay: '140ms' }}>
          <div className="yap-demo-stage yap-demo-stage--inverted flex h-full flex-col gap-4 rounded-2xl p-6">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 dark:text-emerald-500">
              <CheckCircle size={13} aria-hidden />
              Clean context
            </div>
            <p className="yap-demo-output whitespace-pre-wrap text-xs leading-relaxed font-mono">
              {`Build an onboarding flow.\n- Fast and non-intrusive\n- Show clear progress\n- Prioritize first-run clarity`}
            </p>
            <p className="text-xs opacity-60 yap-text-secondary">Ready to paste into any tool.</p>
          </div>
        </div>
      </div>

      {/* Use-with */}
      <div className="yap-reveal mt-10">
        <p className="mb-4 text-center text-sm yap-text-secondary">
          Cleaned outputs drop straight into the tools you already use:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {CONTEXT_USE_WITH.map(label => (
            <span
              key={label}
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold yap-text-secondary transition-colors hover:border-purple-300 hover:text-[var(--yap-violet)] dark:border-[var(--yap-glass-border)] dark:bg-[var(--yap-surface-2)]"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── Who it's for section ─────────────────────────────────────────────────────

const AudienceSection: React.FC = () => (
  <section id="who" className="yap-landing-anchor px-6 py-24 sm:py-32">
    <div className="mx-auto max-w-5xl">
      <SectionHeading
        eyebrow="Who it's for"
        title="Built for people who think out loud."
        sub="If you think faster than you type, Yappify fits the way you already work."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={a.title} className="yap-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="yap-glass-card yap-hover-lift yap-glow-in flex h-full flex-col gap-4 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
                <div className="yap-icon-mist flex h-10 w-10 items-center justify-center rounded-xl">
                  <Icon size={20} />
                </div>
                <p className="text-base font-semibold yap-text-primary">{a.title}</p>
                <p className="text-sm leading-relaxed yap-text-secondary">{a.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <SubstackGuideLink
        href={getSubstackLink('Introduction').href}
        label={getSubstackLink('Introduction').label}
        className="mt-10"
      >
        Read the Yappify introduction
      </SubstackGuideLink>
    </div>
  </section>
);

// ─── Gemini section ───────────────────────────────────────────────────────────

const GeminiSection: React.FC = () => (
  <section id="gemini" className="yap-landing-anchor px-6 py-24 sm:py-32">
    <div className="mx-auto max-w-5xl">
      <SectionHeading
        eyebrow="Powered by Gemini"
        title="Powered by Gemini. Controlled by your key."
        sub="Yappify is designed around the latest Gemini models for fast speech, text transformation, translation, and prompt-cleaning workflows. Your own key decides how far it goes."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {GEMINI_POINTS.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={p.title} className="yap-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="yap-glass-card yap-hover-lift flex h-full flex-col gap-3 rounded-xl p-6">
                <div className="yap-icon-mist flex h-9 w-9 items-center justify-center rounded-lg">
                  <Icon size={18} />
                </div>
                <p className="text-sm font-semibold yap-text-primary">{p.title}</p>
                <p className="text-sm leading-relaxed yap-text-secondary">{p.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="yap-reveal mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed yap-text-hint">
        Usage depends on your own Gemini API tier, limits, and billing setup, not Yappify.
        Yappify does not provide Gemini access or free usage directly.
      </p>
    </div>
  </section>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const LandingPage: React.FC = () => {
  const { settings, setSettings } = useSettings();
  const isDark = settings.theme === 'dark';

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  useEffect(() => {
    const prev = document.title;
    document.title = 'yappify-ai — Voice-First AI Workspace';
    return () => { document.title = prev; };
  }, []);

  // Reveal-on-scroll. Visible by default so reduced-motion / no-JS is safe.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const nodes = Array.from(document.querySelectorAll('.yap-reveal'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <div className="yap-app-shell min-h-[100dvh] w-full font-sans">
      <div className="yap-app-content">

        {/* ── Nav ──────────────────────────────────────────────────────────── */}
        <nav className="yap-glass-panel yap-panel-enter sticky top-0 z-50 w-full border-b border-gray-100 dark:border-[var(--yap-glass-border)] backdrop-blur-[24px]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-6">
            <span className="flex items-center gap-2.5">
              <img
                src="/yl.png"
                alt="yappify-ai"
                className="h-7 w-7 rounded-lg shadow-[0_6px_16px_rgba(124,92,252,0.28)]"
              />
              <span className="text-base font-bold tracking-tight yap-text-primary">
                yappify-ai
              </span>
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="yap-ghost-button flex h-9 w-9 items-center justify-center rounded-lg border transition-all"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <Link
                to="/app"
                className="yap-violet-button flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all"
              >
                <span className="hidden sm:inline">Open Workspace</span>
                <span className="sm:hidden">Open</span>
                <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative flex min-h-[calc(100dvh-57px)] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-10">

          {/* Desktop device mockups — xl+ only, inset toward hero center */}
          <div className="yap-hero-device-wrap yap-hero-device-wrap--left yap-soft-in">
            <div className="yap-device yap-device--left yap-hero-device pointer-events-auto">
              <img
                src="/hero-dark.png"
                alt="yappify-ai workspace in dark mode"
                className="yap-device__img"
              />
            </div>
          </div>
          <div className="yap-hero-device-wrap yap-hero-device-wrap--right yap-soft-in">
            <div className="yap-device yap-device--right yap-hero-device pointer-events-auto">
              <img
                src="/hero-light.png"
                alt="yappify-ai workspace in light mode"
                className="yap-device__img"
              />
            </div>
          </div>

          {/* Hero content */}
          <div className="yap-fade-in relative z-10 flex max-w-2xl flex-col items-center gap-7 text-center">
            <span className="yap-landing-logo-wrap">
              <img
                src="/yl.png"
                alt="yappify-ai"
                className="yap-landing-logo h-36 w-36 sm:h-44 sm:w-44"
              />
            </span>

            <HeroTitle />

            <p className="yap-text-secondary max-w-xl text-lg leading-relaxed">
              A voice-first AI workflow that turns spoken thoughts and files into
              clean, usable output powered by your own Gemini API key.
            </p>

            <SocialLinksRow />

            <div className="mt-1 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                to="/app"
                className="yap-violet-button yap-hover-lift yap-glow-in inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all"
              >
                Open Workspace
                <ArrowRight size={18} aria-hidden />
              </Link>
              <a
                href="#context"
                className="yap-ghost-button inline-flex items-center gap-2 rounded-xl border px-6 py-3.5 text-base font-semibold transition-all"
              >
                See how it works
              </a>
            </div>

            <div className="mt-4 w-full max-w-md">
              <LandingWaveform />
            </div>
          </div>

          {/* Mobile screenshot — theme-aware, hidden on xl+ */}
          <div className="mt-12 w-full max-w-sm xl:hidden">
            <img
              src={isDark ? '/hero-dark.png' : '/hero-light.png'}
              alt="yappify-ai workspace"
              className="yap-device__img mx-auto"
            />
          </div>
        </section>

        {/* ── Context management ───────────────────────────────────────────── */}
        <ContextSection />

        {/* ── Who it's for ─────────────────────────────────────────────────── */}
        <AudienceSection />

        {/* ── Merged interactive modes / features ──────────────────────────── */}
        <ModesSection />

        {/* ── BYOK ─────────────────────────────────────────────────────────── */}
        <section id="byok" className="yap-landing-anchor px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              eyebrow="Bring your own key"
              title="No account. No subscription. Your API key powers the workspace."
              sub="Yappify provides the workflow. Your own Gemini API key powers the AI usage. You control access, usage, and cost."
            />

            {/* Flow visualization: Your Key → yappify-ai → AI Provider */}
            <div className="yap-reveal mb-10">
              <div className="yap-byok-flow mx-auto max-w-2xl rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-0">
                  {BYOK_FLOW.map((step, i) => (
                    <React.Fragment key={step.label}>
                      <div className="flex flex-1 flex-col items-center gap-3 text-center">
                        {step.isLogo ? (
                          <img
                            src="/yl.png"
                            alt="yappify-ai"
                            className="h-12 w-12 rounded-xl shadow-[0_8px_24px_rgba(124,92,252,0.32)]"
                          />
                        ) : (
                          <div className="yap-icon-mist flex h-12 w-12 items-center justify-center rounded-xl">
                            {step.icon && <step.icon size={22} />}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold yap-text-primary">{step.label}</p>
                          <p className="mt-0.5 text-xs yap-text-secondary">{step.sub}</p>
                        </div>
                      </div>
                      {i < BYOK_FLOW.length - 1 && (
                        <div className="flex items-center justify-center self-center sm:px-4">
                          <ArrowRight
                            size={18}
                            className="rotate-90 text-[var(--yap-violet)] opacity-40 sm:rotate-0"
                            aria-hidden
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BYOK_CARDS.map((card, i) => {
                const CardIcon = card.icon;
                return (
                  <div key={card.title} className="yap-reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                    <div className="yap-glass-card yap-hover-lift flex h-full flex-col gap-4 rounded-xl border border-purple-100 bg-purple-50 p-6 dark:border-[var(--yap-active-border)] dark:bg-[var(--yap-violet-mist)]">
                      <div className="flex items-center gap-3">
                        <div className="yap-icon-mist flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg">
                          <CardIcon size={18} />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider yap-text-primary">
                          {card.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed yap-text-secondary">{card.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Gemini ───────────────────────────────────────────────────────── */}
        <GeminiSection />

        {/* ── Privacy & Trust ──────────────────────────────────────────────── */}
        <section id="privacy" className="yap-landing-anchor px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              eyebrow="Privacy and trust"
              title="Designed around your control."
              sub="Honest by design. yappify-ai minimizes unnecessary server-side storage, without overclaiming what it cannot promise."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {TRUST.map((item, i) => {
                const TrustIcon = item.icon;
                return (
                  <div key={item.title} className="yap-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                    <div className="yap-glass-card yap-hover-lift yap-glow-in flex h-full flex-col gap-3 rounded-xl p-6">
                      <div className="yap-icon-mist flex h-9 w-9 items-center justify-center rounded-lg">
                        <TrustIcon size={18} />
                      </div>
                      <p className="text-sm font-semibold yap-text-primary">{item.title}</p>
                      <p className="text-sm leading-relaxed yap-text-secondary">{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section id="faq" className="yap-landing-anchor px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <SectionHeading eyebrow="Questions" title="Frequently asked." />
            <div className="flex flex-col gap-3">
              {FAQS.map((faq, i) => (
                <div key={faq.q} className="yap-reveal" style={{ transitionDelay: `${i * 50}ms` }}>
                  <details className="yap-faq yap-glass-card rounded-xl p-5">
                    <summary className="flex cursor-pointer items-center justify-between gap-4">
                      <span className="text-sm font-semibold yap-text-primary sm:text-base">
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={18}
                        className="yap-faq__chevron flex-shrink-0 text-[var(--yap-violet)]"
                        aria-hidden
                      />
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed yap-text-secondary">
                      {faq.a}
                    </p>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <section className="px-6 py-28 text-center sm:py-36">
          <div className="yap-reveal mx-auto flex max-w-xl flex-col items-center gap-6">
            <h2
              className="yap-text-primary font-bold tracking-tight"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', letterSpacing: '-0.02em' }}
            >
              Start yapping.
            </h2>
            <p className="text-base leading-relaxed yap-text-secondary">
              Open-source. No account. No subscription. Bring your own key.
            </p>
            <Link
              to="/app"
              className="yap-violet-button yap-hover-lift yap-glow-in inline-flex w-full items-center justify-center gap-2 rounded-xl px-10 py-4 text-base font-semibold transition-all sm:w-auto"
            >
              Open Workspace
              <ArrowRight size={18} aria-hidden />
            </Link>
            <div className="mt-2 w-full max-w-md">
              <LandingWaveform />
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-100 px-6 pt-12 pb-8 dark:border-[var(--yap-glass-border)]">
          <div className="mx-auto max-w-5xl">
            {/* Top row */}
            <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <img src="/yl.png" alt="yappify-ai" className="h-7 w-7 rounded-lg shadow-[0_4px_12px_rgba(124,92,252,0.24)]" />
                  <span className="text-base font-bold tracking-tight yap-text-primary">yappify-ai</span>
                </div>
                <p className="text-sm leading-relaxed yap-text-secondary max-w-[240px]">
                  Bring your own key. Keep control.
                  A voice-first AI workflow without another subscription.
                </p>
                <SocialLinksRow align="start" />
              </div>
              {/* Navigation */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-wider yap-text-hint">Navigate</p>
                <nav className="flex flex-col gap-2.5">
                  {FOOTER_LINKS.map(link => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm yap-text-secondary transition-colors hover:text-purple-600 dark:hover:text-[var(--yap-violet-hover)] w-fit"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
              {/* Substack */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-wider yap-text-hint">Substack</p>
                <nav className="flex flex-col gap-2.5">
                  {SUBSTACK_LINKS.map(link => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm yap-text-secondary transition-colors hover:text-purple-600 dark:hover:text-[var(--yap-violet-hover)] w-fit"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
              {/* Developer */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-wider yap-text-hint">About</p>
                <a
                  href="https://www.tmshahz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="yap-hover-lift inline-flex w-fit items-center gap-2 text-sm font-semibold yap-text-secondary transition-colors hover:text-purple-600 dark:hover:text-[var(--yap-violet-hover)]"
                >
                  <ExternalLink size={14} aria-hidden />
                  About the developer
                </a>
                <Link
                  to="/app"
                  className="yap-violet-button inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all"
                >
                  Open Workspace
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            </div>
            {/* Bottom bar */}
            <div className="border-t border-gray-100 pt-6 dark:border-[var(--yap-glass-border)]">
              <p className="text-xs leading-relaxed yap-text-hint text-center sm:text-left">
                yappify-ai processes your audio through your own Gemini API key.
                Data handling is subject to Google's privacy policy.
                yappify-ai does not store your key on any server.
              </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

// ─── Data ────────────────────────────────────────────────────────────────────

const PARENT_MODES: ParentMode[] = [
  {
    label: 'Speech-to-Text',
    icon: Mic,
    features: [
      {
        icon: Sparkles,
        title: 'Prompt Enhancer',
        desc: 'Clean up speech, remove filler, and keep your intent as a stronger prompt.',
        from: 'Rough idea',
        to: 'Structured AI prompt',
        inputExample: '"write me a prompt that helps me make product descriptions that sound premium but not over-hyped and still honest"',
        outputExample: 'You are a product copywriter with a premium, honest voice. Write a product description for [PRODUCT]. Keep it under 80 words. Sound confident and clear, never exaggerated. Lead with the core benefit, then add supporting detail. Avoid buzzwords.',
      },
      {
        icon: FileText,
        title: 'Quick Notes',
        desc: 'Turn a transcript into concise, high-density notes.',
        from: 'Rough rambling recording',
        to: 'Clean bullet notes',
        inputExample: '"I need to write up what happened in the meeting today, we talked about the timeline and Sarah wants to push the launch date but Mark is worried about QA and we still need to hear back from legal about the contracts..."',
        outputExample: 'Meeting summary: 24 June\n\n• Launch timeline under review\n• Sarah: push launch forward\n• Mark: QA blockers unresolved\n• Pending: legal review of contracts\n• Action: Follow up with legal by EOD',
      },
      {
        icon: Sliders,
        title: 'Custom Modes',
        desc: 'Tune yappify-ai for your own repeated workflows.',
        from: 'Your custom instruction',
        to: 'Consistent output every time',
        inputExample: '[Custom mode: Rewrite my draft to sound professional and warm. Remove filler. Keep the key ask clear and direct. No corporate speak.]',
        outputExample: 'Hi [Name], I hope you are well. Following up on the proposal from last week. Would you be open to a 20-minute call to discuss next steps? I am available Thursday or Friday afternoon. Looking forward to it.',
      },
    ],
  },
  {
    label: 'Translation',
    icon: Languages,
    features: [
      {
        icon: Languages,
        title: 'Translate',
        desc: 'Speak it, translate it, send it. Quick multilingual communication.',
        from: 'Source text or speech',
        to: 'Translated message',
        inputExample: '"Hello, I wanted to ask about the return policy for an order I placed last week. The item arrived damaged and I would like a replacement or refund."',
        outputExample: 'Spanish:\n"Hola, queria preguntar sobre la politica de devoluciones de un pedido que realize la semana pasada. El articulo llego danado y me gustaria un reemplazo o reembolso."',
      },
      {
        icon: Type,
        title: 'Transliteration',
        desc: 'Write the language in the script you can actually type.',
        from: 'Translated text',
        to: 'Readable in your script',
        inputExample: '[Translation output in Devanagari script, hard to type or paste into most chat tools.]',
        outputExample: 'Romanized:\n"Namaste, aap kaise hain? Meeting kal sham chaar baje hai."',
      },
      {
        icon: Mic,
        title: 'Speak & Translate',
        desc: 'Record in one language, send it in another, no retyping.',
        from: 'Spoken input',
        to: 'Translated output',
        inputExample: '[Voice note spoken in English: asking a host to check late check-in availability for Saturday.]',
        outputExample: "French:\n\"Bonjour, serait-il possible de prevoir un enregistrement tardif ce samedi ? Nous arriverons en fin d'apres-midi. Merci beaucoup.\"",
      },
    ],
  },
  {
    label: 'Upload Mode',
    icon: FileAudio,
    features: [
      {
        icon: FileAudio,
        title: 'Raw Transcription',
        desc: 'Turn uploaded audio or video into a clean transcript, with speaker separation where useful.',
        from: 'Uploaded media file',
        to: 'Clean transcript',
        inputExample: '[45-minute interview recording, 2 speakers, uploaded as MP3]',
        outputExample: '[00:02] Speaker 1: Thanks for making time. Can you walk me through how your team plans sprints?\n[00:18] Speaker 2: Sure. We start with a backlog review, then point the tickets together...\n[11:42] Speaker 1: And how do you handle carryover?',
      },
      {
        icon: ClipboardList,
        title: 'Media Summary',
        desc: 'Turn uploaded audio, video, or transcripts into a concise summary with the key themes.',
        from: 'Uploaded audio, video, or transcript',
        to: 'Concise summary',
        inputExample: '[40-minute strategy call recording, 3 speakers, uploaded as MP3]',
        outputExample: 'Summary: Strategy call, 24 June\n\nThemes:\n• Quarterly review cycle adopted\n• Two-market pilot approved (UK, Canada)\n• Q3 hiring target: 4 new roles\n\nOpen question: budget sign-off still pending from finance.',
      },
      {
        icon: ListChecks,
        title: 'Action Items',
        desc: 'Pull clear next steps, owners, and tasks out of uploaded meetings, calls, or media.',
        from: 'Uploaded meeting or audio',
        to: 'Clear action items',
        inputExample: '[30-minute project sync recording, uploaded as M4A]',
        outputExample: 'Action items:\n• Book UK kick-off call (Maya, by July 8)\n• Draft pilot brief (Ravi, by July 5)\n• Share resource plan with board (Marcus)\n• Confirm QA window before pilot (Lead, by July 3)',
      },
    ],
  },
];

const CONTEXT_USE_WITH = [
  'ChatGPT',
  'Claude',
  'Cursor',
  'Gemini',
  'Local AI models',
  'Coding workflows',
  'Documents',
  'Emails',
  'Notes',
];

const AUDIENCES: Array<{ icon: IconType; title: string; body: string }> = [
  {
    icon: GraduationCap,
    title: 'Students',
    body: 'Turn lectures, study thoughts, and rough notes into cleaner summaries and study material.',
  },
  {
    icon: Code2,
    title: 'Builders',
    body: 'Talk through bugs, app ideas, feature changes, and implementation plans, then turn them into prompts for Cursor, Claude, ChatGPT, Gemini, or local models.',
  },
  {
    icon: PenLine,
    title: 'Creators',
    body: 'Turn idea dumps into scripts, captions, outlines, hooks, content plans, and posts.',
  },
  {
    icon: Briefcase,
    title: 'Professionals',
    body: 'Turn client notes, meeting thoughts, updates, and rough messages into structured, polished outputs.',
  },
];

const GEMINI_POINTS: Array<{ icon: IconType; title: string; body: string }> = [
  {
    icon: Key,
    title: 'Keys via Google AI Studio',
    body: 'Gemini API keys are available through Google AI Studio for Google account users. Bring yours and plug it in.',
  },
  {
    icon: Sparkles,
    title: 'Great for light use',
    body: 'Free-tier usage can be great for casual use, hobbyists, testing, and light workflows. It is a solid way to try Yappify.',
  },
  {
    icon: Cloud,
    title: 'Add credits for headroom',
    body: 'For heavier usage, add billing or API credits to your own Google account for more headroom and a smoother experience.',
  },
  {
    icon: Server,
    title: 'Your tier, your limits',
    body: 'Rate limits, model access, and capacity depend on your own Gemini API tier and billing setup, not Yappify.',
  },
];

interface ByokFlowStep {
  label: string;
  sub: string;
  icon?: IconType;
  isLogo?: boolean;
}

const BYOK_FLOW: ByokFlowStep[] = [
  { label: 'Your API Key',     sub: 'From Google AI Studio',      icon: Key   },
  { label: 'yappify-ai',       sub: 'Workflow and interface',      isLogo: true },
  { label: 'AI Provider',      sub: 'Google Gemini',               icon: Cloud },
];

const BYOK_CARDS: Array<{ icon: IconType; title: string; body: string }> = [
  {
    icon: Key,
    title: 'User-owned Gemini key',
    body: 'Connect your own Google Gemini API key. No shared backend, no resold AI access. Your key is optionally saved in your browser, not on any server.',
  },
  {
    icon: Sparkles,
    title: 'No Yappify account',
    body: 'No signup wall. No Yappify subscription. Add your key and start yapping. The workflow is free to use as an interface.',
  },
  {
    icon: Github,
    title: 'Open-source workflow',
    body: 'Yappify is open-source. Inspect it, run it, and adapt it. The interface is the product. Your API key powers the AI usage, and you stay in control.',
  },
];

const TRUST: Array<{ icon: IconType; title: string; body: string }> = [
  {
    icon: Key,
    title: 'Your key, your control',
    body: 'Connect your own Gemini API key and manage it directly with your provider. No shared backend, no resold AI access.',
  },
  {
    icon: Lock,
    title: 'Optional local storage',
    body: 'Save your key locally in your browser, or re-enter it each session. There is no required server-side account just to use the app.',
  },
  {
    icon: Server,
    title: 'Honest about the provider',
    body: "Requests are sent to Google Gemini to be processed. Data handling is subject to Google's privacy policy. yappify-ai minimizes unnecessary server-side storage.",
  },
];

const FAQS = [
  {
    q: 'Can I use Yappify with Gemini\'s free tier?',
    a: 'Yes. Gemini API keys are available through Google AI Studio for Google account users, and free-tier usage can be great for casual use, hobbyists, testing, and light workflows. Yappify itself does not provide Gemini access. You bring your own key.',
  },
  {
    q: 'Why would I add API credits?',
    a: 'For heavier usage, adding billing or API credits to your own Google account can provide more headroom, longer usage, and a smoother experience. Credits go directly to your Google account, not to Yappify.',
  },
  {
    q: 'Does Yappify charge a subscription?',
    a: 'No. There is no Yappify account and no Yappify subscription. Yappify is a free, open-source workflow layer. Your own Gemini API key powers the AI usage, and you control cost.',
  },
  {
    q: 'What happens if I hit a Gemini rate limit?',
    a: 'Rate limits, model access, and capacity are set by your own Gemini API tier and billing setup. If you hit a limit, you can wait, reduce usage, or add billing/API credits to your Google account for more headroom.',
  },
  {
    q: 'Can I use the output in ChatGPT, Claude, Cursor, Gemini, or local AI models?',
    a: 'Yes. Yappify turns messy input into clean prompts, notes, translations, and instructions. Copy the output into ChatGPT, Claude, Cursor, Gemini, local AI models, coding workflows, documents, emails, or notes, wherever you work.',
  },
  {
    q: 'Is Yappify open source?',
    a: 'Yes. Yappify is open-source. You can inspect it, run it, and adapt it. Your API key stays under your control, and there is no required server-side account just to use the app.',
  },
  {
    q: 'What does BYOK mean?',
    a: 'Bring Your Own Key. Instead of locking you into another subscription, Yappify lets you connect your own Gemini API key and stay in control of your AI access.',
  },
  {
    q: 'Where is my API key stored?',
    a: 'Your key stays under your control. You can optionally save it locally in your browser, or re-enter it each session. There is no required server-side account just to use the app.',
  },
  {
    q: 'Is my data private?',
    a: "Yappify is designed around user control and minimizes unnecessary server-side storage. Your requests are still sent to your chosen AI provider (Google Gemini), so their handling is subject to Google's privacy policy.",
  },
  {
    q: 'What can I actually do with it?',
    a: 'Transcribe speech, enhance prompts, capture quick notes, translate with optional transliteration, build custom modes for repeated workflows, and process uploaded files into transcripts, summaries, speaker transcripts, or action items.',
  },
];

const FOOTER_LINKS = [
  { label: 'How it works', href: '#context' },
  { label: 'Context',      href: '#context' },
  { label: 'Modes',        href: '#features' },
  { label: 'BYOK',         href: '#byok' },
  { label: 'Gemini',       href: '#gemini' },
  { label: 'Privacy',      href: '#privacy' },
  { label: 'FAQ',          href: '#faq' },
];

const SOCIAL_LINKS: Array<{ label: string; href: string; Icon: IconType }> = [
  { label: 'X (Twitter)', href: 'https://x.com/yappify_ai', Icon: XSocialIcon },
  { label: 'GitHub', href: 'https://github.com/tmshahz/yappify-ai-2.0', Icon: Github },
];
