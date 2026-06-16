const KNOWN_SECTIONS = new Set([
  'translation',
  'transliteration',
  'original text',
  'executive summary',
  'action items',
  'key decisions',
  'key points',
  'key takeaways',
  'key topics',
  'important quotes',
  'notable details',
  'follow-ups',
  'follow ups',
  'next steps',
  'discussion summary',
  'meeting notes',
  'meeting summary',
  'media summary',
  'speaker transcript',
  'speaker transcription',
  'raw transcription',
  'summary',
  'overview',
  'conclusion',
  'recommendations',
  'risks',
  'decisions',
  'themes',
  'attendees',
  'owners',
  'deadlines',
  'tasks',
  'notes',
  'prompt output',
  'context',
]);

const SPEAKER_LABEL = /^Speaker\s+([A-Z0-9]+)\s*:?\s*(.*)$/i;

export interface FormatOutputMarkdownOptions {
  promoteSections?: boolean;
  promoteSpeakers?: boolean;
}

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isLikelySectionTitle(label: string): boolean {
  const trimmed = label.trim();
  if (!trimmed || trimmed.length > 56) return false;
  if (/[.!?]$/.test(trimmed)) return false;

  const normalized = normalizeLabel(trimmed);
  if (KNOWN_SECTIONS.has(normalized)) return true;

  const words = trimmed.split(/\s+/);
  if (words.length > 6) return false;

  const titleCase = words.every((word) => /^[A-Z][a-z0-9'/-]*$/.test(word) || /^[A-Z]{2,}$/.test(word));
  return titleCase && words.length >= 1 && words.length <= 4;
}

/**
 * Promotes common AI section labels (e.g. "Translation:") to markdown headings
 * so ReactMarkdown can render visual hierarchy without changing Gemini prompts.
 */
export function formatOutputMarkdown(
  text: string,
  options: FormatOutputMarkdownOptions = {}
): string {
  if (!text) return '';

  const promoteSections = options.promoteSections ?? true;
  const promoteSpeakers = options.promoteSpeakers ?? true;

  const lines = text.split('\n');
  const output: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      output.push('');
      continue;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      output.push(line);
      continue;
    }

    if (promoteSpeakers) {
      const speakerMatch = trimmed.match(SPEAKER_LABEL);
      if (speakerMatch) {
        const speaker = `Speaker ${speakerMatch[1].toUpperCase()}`;
        const rest = speakerMatch[2].trim();
        output.push('');
        output.push(`## ${speaker}`);
        output.push('');
        if (rest) output.push(rest);
        continue;
      }
    }

    if (promoteSections) {
      const colonMatch = trimmed.match(/^([A-Za-z][A-Za-z0-9\s/&()'-]{1,50}):\s*(.*)$/);
      if (colonMatch) {
        const title = colonMatch[1].trim();
        const rest = colonMatch[2].trim();

        if (isLikelySectionTitle(title)) {
          output.push('');
          output.push(`## ${title}`);
          output.push('');
          if (rest) output.push(rest);
          continue;
        }
      }

      if (isLikelySectionTitle(trimmed) && !trimmed.endsWith(':')) {
        const nextLine = lines[index + 1]?.trim() ?? '';
        const previousLine = lines[index - 1]?.trim() ?? '';
        const startsSection = !previousLine || /^#{1,6}\s+/.test(previousLine);

        if (startsSection && nextLine && !isLikelySectionTitle(nextLine) && !/^#{1,6}\s+/.test(nextLine)) {
          output.push('');
          output.push(`## ${trimmed}`);
          output.push('');
          continue;
        }
      }
    }

    output.push(line);
  }

  return output.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
