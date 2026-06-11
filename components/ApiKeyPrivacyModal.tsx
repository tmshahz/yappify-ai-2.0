import React from 'react';
import { Shield } from 'lucide-react';
import { Modal } from './Modal';

interface ApiKeyPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PrivacySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold text-gray-900 dark:text-[var(--yap-text-1)]">{title}</h3>
      <div className="text-sm text-gray-600 dark:text-[var(--yap-text-2)] leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

export const ApiKeyPrivacyModal: React.FC<ApiKeyPrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Your API Key, Your Control"
      titleId="api-key-privacy-modal-title"
      zIndex={10000}
      align="start"
      maxWidth="lg"
      icon={
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Shield size={20} className="text-purple-600 dark:text-purple-400" />
        </div>
      }
      footer={
        <button
          type="button"
          onClick={onClose}
          className="yap-violet-button w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
        >
          Got it
        </button>
      }
    >
      <div className="space-y-5">
        <PrivacySection title="How yappify-ai uses your API key">
          <p>
            Yappify-ai uses a Bring Your Own Key (BYOK) model. Your Gemini API key is used only to
            communicate directly with Google&apos;s Gemini API.
          </p>
        </PrivacySection>

        <PrivacySection title="Does yappify-ai store my API key?">
          <p>
            <strong className="text-gray-800 dark:text-[var(--yap-text-1)]">Only if you choose to.</strong>
          </p>
          <p>
            When &quot;Save API Key Locally&quot; is enabled, your key is stored only in your browser on
            your device so you don&apos;t have to enter it every time.
          </p>
          <p>
            When disabled, your key is kept only for the current session and is not saved for future
            visits.
          </p>
        </PrivacySection>

        <PrivacySection title="Does yappify-ai send my API key to its servers?">
          <p>
            <strong className="text-gray-800 dark:text-[var(--yap-text-1)]">No.</strong>
          </p>
          <p>
            Yappify does not collect, store, or process your Gemini API key on its own servers.
            Requests are sent directly from your browser to Google&apos;s Gemini API.
          </p>
        </PrivacySection>

        <PrivacySection title="Why do I need my own API key?">
          <p>
            Using your own Gemini API key keeps yappify-ai free to use and gives you full control over
            your AI usage, limits, and billing directly through Google.
          </p>
        </PrivacySection>

        <PrivacySection title="Transparency">
          <p>
            Yappify-ai is designed around transparency and user control. Your API key remains yours,
            and you decide whether it is remembered on your device.
          </p>
        </PrivacySection>

        <div className="yap-glass-card bg-purple-50 dark:bg-[var(--yap-violet-mist)] border border-purple-100 dark:border-[var(--yap-active-border)] rounded-xl p-4">
          <p className="text-sm text-gray-700 dark:text-[var(--yap-text-2)] leading-relaxed">
            <span className="mr-1.5" aria-hidden="true">
              🔒
            </span>
            <strong className="text-gray-900 dark:text-[var(--yap-text-1)]">Privacy Tip:</strong>{' '}
            If you&apos;re using a shared computer, leave &quot;Save API Key Locally&quot; turned off and enter
            your key when needed.
          </p>
        </div>
      </div>
    </Modal>
  );
};
