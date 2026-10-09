import type { Qosidah, QosidahCategory } from '@/lib/types';
import { QOSIDAH_CATEGORIES } from './categories';
import { sholawatNahdliyah } from './sholawat-nahdliyah';
import { yaThoybah } from './ya-thoybah';
import { mahalulQiyam } from './mahalul-qiyam';
import { rouhiFidak } from './rouhi-fidak';
import { busyroLana } from './busyro-lana';
import { qosidahBurdah } from './qosidah-burdah';
import { alQolbuMutayyam } from './al-qolbu-mutayyam';
import { doaPenutupMajelis } from './doa-penutup-majelis';
import { padhangBulan } from './padhang-bulan';
import { slukuSlukuBathok } from './sluku-sluku-bathok';
import { turiTuriPutih } from './turi-turi-putih';

// ==============================================================================
// 1. DAFTAR LIRIK QOSIDAH KHOIRUNNADA ('Arobiah & Jawa)
// ==============================================================================
export const QOSIDAH_LIST: Qosidah[] = [
  sholawatNahdliyah,
  yaThoybah,
  mahalulQiyam,
  rouhiFidak,
  busyroLana,
  qosidahBurdah,
  alQolbuMutayyam,
  doaPenutupMajelis,
  padhangBulan,
  slukuSlukuBathok,
  turiTuriPutih,
];

// Re-export semua file & kategori agar modular dan mudah diakses
export {
  QOSIDAH_CATEGORIES,
  sholawatNahdliyah,
  yaThoybah,
  mahalulQiyam,
  rouhiFidak,
  busyroLana,
  qosidahBurdah,
  alQolbuMutayyam,
  doaPenutupMajelis,
  padhangBulan,
  slukuSlukuBathok,
  turiTuriPutih,
};

// ==============================================================================
// 2. FUNGSI PEMBANTU (HELPER FUNCTIONS)
// ==============================================================================
export function getAllQosidahs(): Qosidah[] {
  return QOSIDAH_LIST;
}

export function getAllCategories(): QosidahCategory[] {
  return QOSIDAH_CATEGORIES;
}

export function getQosidahById(id: string): Qosidah | undefined {
  return QOSIDAH_LIST.find((q) => q.id === id);
}

export function getQosidahsByCategory(categoryId: string): Qosidah[] {
  if (categoryId === 'all') return QOSIDAH_LIST;
  return QOSIDAH_LIST.filter((q) => q.category_id === categoryId);
}
