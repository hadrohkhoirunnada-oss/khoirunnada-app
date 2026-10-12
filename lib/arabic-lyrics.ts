export const ARABIC_VERSE_SEPARATOR = '۞';

export function formatArabicLyrics(text: string): string {
  return text.replace(/[ \t]*\*[ \t]*/g, ` ${ARABIC_VERSE_SEPARATOR} `);
}

export function splitArabicStanzas(text: string): string[] {
  const authoredStanzas = formatArabicLyrics(text)
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((stanza) => stanza.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0);

  return authoredStanzas
    .flatMap((lines) => {
      // Keep intentional stanza breaks, including the longer final stanza in Ya Robba Makkah.
      if (authoredStanzas.length > 1 && lines.length <= 8) return [lines.join('\n')];

      const groupCount = Math.ceil(lines.length / 4);
      const baseSize = Math.floor(lines.length / groupCount);
      const extraLines = lines.length % groupCount;
      let start = 0;

      return Array.from({ length: groupCount }, (_, index) => {
        const size = baseSize + (index < extraLines ? 1 : 0);
        const stanza = lines.slice(start, start + size).join('\n');
        start += size;
        return stanza;
      });
    })
    .filter(Boolean);
}
