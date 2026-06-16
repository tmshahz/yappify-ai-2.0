import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { formatOutputMarkdown } from '../utils/formatOutputMarkdown';
import type { OutputDisplayProfile } from '../utils/outputDisplay';

interface OutputMarkdownProps {
  content: string;
  displayProfile?: OutputDisplayProfile;
}

function profileToFormatOptions(profile: OutputDisplayProfile) {
  switch (profile) {
    case 'plain-transcript':
      return { promoteSections: false, promoteSpeakers: false };
    case 'speaker-transcript':
      return { promoteSections: false, promoteSpeakers: true };
    case 'rich-markdown':
    default:
      return { promoteSections: true, promoteSpeakers: true };
  }
}

export const OutputMarkdown: React.FC<OutputMarkdownProps> = ({
  content,
  displayProfile = 'rich-markdown',
}) => {
  const markdown = useMemo(
    () => formatOutputMarkdown(content, profileToFormatOptions(displayProfile)),
    [content, displayProfile]
  );

  return (
    <div
      className={clsx(
        'yap-output-prose',
        displayProfile === 'plain-transcript' && 'yap-output-prose--plain'
      )}
    >
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};
