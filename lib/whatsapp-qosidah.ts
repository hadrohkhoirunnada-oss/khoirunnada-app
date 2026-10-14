export const DEFAULT_DEVELOPER_WHATSAPP = '085173057576';

export interface QosidahDraft {
  id: string;
  title: string;
  category_id: string;
  category_name: string;
  arabic_text: string;
  created_by: string | null;
  created_at: string;
}

export function formatQosidahDraftsToWhatsApp(drafts: QosidahDraft[]): string {
  const greeting = [
    "Assalamu'alaikum Mas Dzarin (Developer Hadroh Khoirunnada),",
    `Berikut usulan ${drafts.length} Qosidah Baru dari Admin Hadroh:`,
  ];

  const entries = drafts.map(
    (draft, index) =>
      `${index + 1}. Judul: ${draft.title}\nKategori: ${draft.category_name}\nTeks Arab:\n${draft.arabic_text}`
  );

  return [...greeting, '', ...entries].join('\n');
}

export function generateWhatsAppUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  const internationalPhone = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;

  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(text)}`;
}

