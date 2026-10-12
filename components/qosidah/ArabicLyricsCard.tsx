import { ARABIC_VERSE_SEPARATOR, splitArabicStanzas } from '@/lib/arabic-lyrics';

type ArabicLyricsCardProps = {
  title: string;
  alternateTitle?: string;
  text: string;
  className?: string;
};

export function ArabicLyricsCard({
  title,
  alternateTitle,
  text,
  className = '',
}: ArabicLyricsCardProps) {
  const stanzas = splitArabicStanzas(text);

  return (
    <div
      className={`overflow-hidden rounded-[24px] border border-[#D9C9A9] bg-[#FFFEFB] shadow-[0_8px_30px_rgba(58,42,17,0.07)] ${className}`}
    >
      <div className="border-b border-[#EAE0CC] bg-[#FBF7EE] px-5 py-5 text-center sm:px-8 sm:py-6">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#865D19]">
          Lirik Arab
        </p>
        <h2 className="text-base font-bold leading-snug text-[#24231E] sm:text-lg">
          {title}
        </h2>
        {alternateTitle && (
          <p className="mt-1 text-xs leading-relaxed text-[#625D52] sm:text-sm">
            {alternateTitle}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-[46rem] px-5 py-3 sm:px-9 sm:py-5">
        {stanzas.map((stanza, index) => (
          <div key={index}>
            {index > 0 && (
              <div className="flex items-center gap-3 text-[#A67B34]" aria-hidden="true">
                <span className="h-px flex-1 bg-[#E9DFCD]" />
                <span lang="ar" className="text-xl leading-none" style={{ fontFamily: 'var(--font-noto-arabic)' }}>
                  {ARABIC_VERSE_SEPARATOR}
                </span>
                <span className="h-px flex-1 bg-[#E9DFCD]" />
              </div>
            )}
            <p
              lang="ar"
              dir="rtl"
              className="arabic-font py-5 text-right text-[#20221F] sm:py-6 [font-size:clamp(1.55rem,4.8vw,1.95rem)] !leading-[2.15] whitespace-pre-line break-words selection:bg-[#EAD8AF]"
            >
              {stanza}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
