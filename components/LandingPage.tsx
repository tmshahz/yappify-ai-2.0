import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  FileAudio,
  Key,
  Languages,
  Lock,
  Moon,
  Server,
  Sliders,
  Sparkles,
  Sun,
  Upload,
  Users,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { useSettings } from '../hooks/useSettings';

type IconType = React.ComponentType<{ size?: number }>;

// Bar data computed once at module level. Peak height, duration, and delay vary
// per bar to produce a natural voice-waveform envelope (tallest in the center).
const WAVEFORM_BARS = Array.from({ length: 28 }, (_, i) => {
  const t = i / 27;
  const envelope = Math.sin(t * Math.PI);
  const jitter = 0.3 + Math.abs(Math.sin(i * 1.9 + 0.8)) * 0.65;
  const peak = Math.max(0.18, Math.min(1, envelope * 0.7 + jitter * 0.45));
  const delay = ((i * 0.058 + Math.sin(i * 0.7) * 0.1) % 1.2).toFixed(3);
  const duration = (0.85 + Math.abs(Math.sin(i * 0.55)) * 0.95).toFixed(2);
  return { peak: peak.toFixed(2), delay, duration };
});

// Decorative waveform that animates without audio input via CSS custom properties.
// Replaces the existing Waveform canvas component which requires a real stream.
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

const SectionHeading: React.FC<{ eyebrow: string; title: string; sub?: string }> = ({
  eyebrow,
  title,
  sub,
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

  // Reveal-on-scroll — elements visible by default; adds entrance only when
  // motion is permitted (see .yap-reveal in global.css).
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
          {/* Desktop device mockups — xl+ only, absolutely positioned beside the hero copy */}
          <div className="yap-soft-in pointer-events-none absolute left-[1%] top-1/2 hidden -translate-y-1/2 xl:block 2xl:left-[4%]">
            <div className="yap-device yap-device--left pointer-events-auto w-[300px] 2xl:w-[400px]">
              <img
                src="/hero-dark.png"
                alt="yappify-ai workspace in dark mode"
                className="yap-device__img"
              />
            </div>
          </div>
          <div className="yap-soft-in pointer-events-none absolute right-[1%] top-1/2 hidden -translate-y-1/2 xl:block 2xl:right-[4%]">
            <div className="yap-device yap-device--right pointer-events-auto w-[300px] 2xl:w-[400px]">
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

            <h1
              className="yap-text-primary font-bold leading-[1.06] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(2.7rem, 6.4vw, 4.75rem)' }}
            >
              Yapp your thoughts over.
            </h1>

            <p className="yap-text-secondary max-w-xl text-lg leading-relaxed">
              A voice-first AI workflow that turns spoken thoughts and files into
              clean, usable output that's powered by your own Gemini API key.
            </p>

            <div className="mt-1 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                to="/app"
                className="yap-violet-button yap-hover-lift yap-glow-in inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all"
              >
                Open Workspace
                <ArrowRight size={18} aria-hidden />
              </Link>
              <a
                href="#how-it-works"
                className="yap-ghost-button inline-flex items-center gap-2 rounded-xl border px-6 py-3.5 text-base font-semibold transition-all"
              >
                See how it works
              </a>
            </div>

            <div className="mt-4 w-full max-w-md">
              <LandingWaveform />
            </div>
          </div>

          {/* Mobile screenshot — theme-aware, below hero copy, hidden on xl+ where side mockups appear */}
          <div className="mt-12 w-full max-w-sm xl:hidden">
            <img
              src={isDark ? '/hero-dark.png' : '/hero-light.png'}
              alt="yappify-ai workspace"
              className="yap-device__img mx-auto"
            />
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section id="how-it-works" className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              eyebrow="How it works"
              title="Three steps. No friction."
              sub="From the moment a thought arrives to the moment it becomes usable, the workflow stays linear and fast."
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.n} className="yap-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                  <div className="yap-glass-card yap-hover-lift yap-glow-in flex h-full flex-col gap-4 rounded-2xl p-6">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--yap-violet)] text-sm font-bold text-white">
                      {step.n}
                    </span>
                    <p className="text-base font-semibold yap-text-primary">{step.title}</p>
                    <p className="text-sm leading-relaxed yap-text-secondary">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Core features (mode-card pattern from the app) ───────────────── */}
        <section className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              eyebrow="Core features"
              title="The same modes you'll use inside."
              sub="These are the actual modes from the workspace, recognizable the moment you open it."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="yap-reveal" style={{ transitionDelay: `${(i % 4) * 60}ms` }}>
                    <div
                      className={clsx(
                        'yap-glass-card yap-hover-lift yap-glow-in h-full rounded-xl border p-5 transition-all',
                        'border-gray-200 bg-white hover:border-purple-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-purple-700',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="yap-icon-mist flex-shrink-0 rounded-lg bg-purple-100 p-2 text-purple-700 dark:bg-[var(--yap-violet-mist)] dark:text-[var(--yap-violet-hover)]">
                          <Icon size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-gray-800 dark:text-[var(--yap-text-1)]">
                            {feature.title}
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-[var(--yap-text-2)]">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── BYOK ─────────────────────────────────────────────────────────── */}
        <section className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              eyebrow="Bring your own key"
              title="You bring the key. yappify-ai gives you the workflow."
              sub="yappify-ai is the interface, not the AI provider. You connect directly to your own account and stay in control."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="yap-reveal">
                <div className="yap-glass-card yap-hover-lift flex h-full flex-col gap-4 rounded-xl border border-purple-100 bg-purple-50 p-6 dark:border-[var(--yap-active-border)] dark:bg-[var(--yap-violet-mist)]">
                  <div className="flex items-center gap-3">
                    <div className="yap-icon-mist flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg">
                      <Key size={18} />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider yap-text-primary">
                      Your key, your control
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed yap-text-secondary">
                    Connect your own Google Gemini API key. No shared backend, no resold
                    AI access. Your key is optionally saved in your browser, not on any
                    server.
                  </p>
                </div>
              </div>
              <div className="yap-reveal" style={{ transitionDelay: '80ms' }}>
                <div className="yap-glass-card yap-hover-lift flex h-full flex-col gap-4 rounded-xl border border-purple-100 bg-purple-50 p-6 dark:border-[var(--yap-active-border)] dark:bg-[var(--yap-violet-mist)]">
                  <div className="flex items-center gap-3">
                    <div className="yap-icon-mist flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg">
                      <Sparkles size={18} />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider yap-text-primary">
                      Free because we don't resell AI
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed yap-text-secondary">
                    Since you connect directly to your own account, we don't charge for
                    model usage. Google Gemini offers free-tier API access. Many users
                    can start without any cost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Privacy & Trust ──────────────────────────────────────────────── */}
        <section className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              eyebrow="Privacy & trust"
              title="Designed around your control."
              sub="Honest by design. yappify-ai minimizes unnecessary server-side storage, without overclaiming what it can't promise."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {TRUST.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="yap-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                    <div className="yap-glass-card yap-hover-lift yap-glow-in flex h-full flex-col gap-3 rounded-xl p-6">
                      <div className="yap-icon-mist flex h-9 w-9 items-center justify-center rounded-lg">
                        <Icon size={18} />
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

        {/* ── Practical use cases ──────────────────────────────────────────── */}
        <section className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              eyebrow="In practice"
              title="From messy input to usable output."
              sub="yappify-ai lives in the messy middle. The voice note before the email, the ramble before the notes."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((uc, i) => (
                <div key={uc.from} className="yap-reveal" style={{ transitionDelay: `${(i % 3) * 60}ms` }}>
                  <div className="yap-glass-card yap-hover-lift yap-glow-in flex h-full items-center gap-3 rounded-xl p-5">
                    <span className="text-sm font-medium yap-text-secondary">{uc.from}</span>
                    <ArrowRight size={16} className="flex-shrink-0 text-[var(--yap-violet)]" aria-hidden />
                    <span className="text-sm font-semibold yap-text-primary">{uc.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <SectionHeading eyebrow="Questions" title="Frequently asked." />
            <div className="flex flex-col gap-3">
              {FAQS.map((faq, i) => (
                <div key={faq.q} className="yap-reveal" style={{ transitionDelay: `${i * 50}ms` }}>
                  <details className="yap-faq yap-glass-card rounded-xl p-5">
                    <summary className="flex items-center justify-between gap-4">
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
              No account. No subscription. Bring your own key.
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
        <footer className="border-t border-gray-100 px-6 py-10 dark:border-[var(--yap-glass-border)]">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <img src="/yl.png" alt="yappify-ai" className="h-6 w-6 rounded-md" />
              <p className="max-w-md text-center text-xs leading-relaxed yap-text-secondary sm:text-left">
                yappify-ai processes your audio through your own Gemini API key. Data
                handling is subject to Google's privacy policy.
              </p>
            </div>
            <a
              href="https://www.tmshahz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="yap-hover-lift flex flex-shrink-0 items-center gap-2 text-sm font-semibold yap-text-secondary transition-colors hover:text-purple-600 dark:hover:text-[var(--yap-violet-hover)]"
            >
              <ExternalLink size={14} />
              About Developer
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
};

const STEPS = [
  {
    n: 1,
    title: 'Choose a mode',
    body: 'Speech-to-Text, Translate, or Upload. Each mode shapes how your input becomes output.',
  },
  {
    n: 2,
    title: 'Record or upload',
    body: 'Press the mic to speak, or drop an audio file. No typing required.',
  },
  {
    n: 3,
    title: 'Process and copy',
    body: 'Get a transcript, enhanced prompt, translation, summary, or speaking notes. Then copy and go.',
  },
];

const FEATURES: Array<{ icon: IconType; title: string; desc: string }> = [
  { icon: Sparkles, title: 'Prompt Enhancer', desc: 'Clean up speech, remove filler, and keep your intent as a stronger prompt.' },
  { icon: Zap, title: 'Quick Notes', desc: 'Turn a transcript into concise, high-density notes.' },
  { icon: Sliders, title: 'Custom Modes', desc: 'Tune yappify-ai for your own repeated workflows.' },
  { icon: Upload, title: 'Upload Files', desc: 'Process audio files into exactly the output you need.' },
  { icon: FileAudio, title: 'Raw Transcription', desc: 'Generate a clean transcript, nothing else.' },
  { icon: ClipboardList, title: 'Media Summary', desc: 'A structured summary with decisions and themes.' },
  { icon: Users, title: 'Speaker Recognition', desc: 'Transcript with speaker separation where possible.' },
  { icon: Languages, title: 'Translation', desc: 'Speak it, translate it, send it. Transliteration supported.' },
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

const USE_CASES = [
  { from: 'Rough voice note', to: 'Polished email' },
  { from: 'Messy idea', to: 'Structured prompt' },
  { from: 'Voice dump', to: 'Clean quick notes' },
  { from: 'Uploaded file', to: 'Speaking notes' },
  { from: 'Long recording', to: 'Media summary' },
  { from: 'Any language', to: 'Translated message' },
];

const FAQS = [
  {
    q: 'Is yappify-ai really free?',
    a: 'yappify-ai is free to use as an interface. You connect your own Google Gemini API key, so you are not paying us for model access. Google offers free-tier API access that many users can start with.',
  },
  {
    q: 'What does BYOK mean?',
    a: 'Bring Your Own Key. Instead of locking you into another subscription, yappify-ai lets you connect your own Gemini API key and stay in control of your AI access.',
  },
  {
    q: 'Where is my API key stored?',
    a: 'Your key stays under your control. You can optionally save it locally in your browser, or re-enter it each session. There is no required server-side account just to use the app.',
  },
  {
    q: 'Is my data private?',
    a: "yappify-ai is designed around user control and minimizes unnecessary server-side storage. Your requests are still sent to your chosen AI provider (Google Gemini), so their handling is subject to Google's privacy policy.",
  },
  {
    q: 'Do I need an account?',
    a: 'No signup wall. Add your key and start yapping.',
  },
  {
    q: 'What can I actually do with it?',
    a: 'Transcribe speech, enhance prompts, capture quick notes, translate, and process uploaded files into transcripts, summaries, speaker transcripts, or action items.',
  },
];
