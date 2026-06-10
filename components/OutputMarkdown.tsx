import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { formatOutputMarkdown } from '../utils/formatOutputMarkdown';

interface OutputMarkdownProps {
  content: string;
  raw?: boolean;
}

export const OutputMarkdown: React.FC<OutputMarkdownProps> = ({ content, raw = false }) => {
  const markdown = useMemo(
    () => (raw ? content : formatOutputMarkdown(content)),
    [content, raw]
  );

  return (
    <div className={clsx('yap-output-prose', raw && 'yap-output-prose--raw yap-mono-output')}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};
