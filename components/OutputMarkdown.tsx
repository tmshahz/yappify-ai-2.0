import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { formatOutputMarkdown } from '../utils/formatOutputMarkdown';

interface OutputMarkdownProps {
  content: string;
  /** Plain monospace transcript view (Speech-to-Text RAW tab only). */
  plainRaw?: boolean;
}

export const OutputMarkdown: React.FC<OutputMarkdownProps> = ({ content, plainRaw = false }) => {
  const markdown = useMemo(
    () => (plainRaw ? content : formatOutputMarkdown(content)),
    [content, plainRaw]
  );

  return (
    <div className={clsx('yap-output-prose', plainRaw && 'yap-output-prose--raw yap-mono-output')}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};
