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
import { shalallahuAlaMuhammad } from './shalallahu-ala-muhammad';
import { yaRabbamakah } from './ya-rabbamakah';
import { shilYaNabi } from './shil-ya-nabi';
import { yamimNahwalMadinah } from './yamim-nahwal-madinah';
import { analFaqiru } from './anal-faqiru';
import { tholaalBadru } from './tholaal-badru';
import { sholluAlaManJaaAna } from './shollu-ala-man-jaa-ana';
import { mughrom } from './mughrom';
import { bimaulidilHadi } from './bimaulidil-hadi';
import { ahmadYaHabibi } from './ahmad-ya-habibi';
import { annabiSholuAlaih } from './annabi-sholu-alaih';
import { habibiYaMuhammad } from './habibi-ya-muhammad';
import { yaHayatiruh } from './ya-hayatiruh';
import { rohmaka } from './rohmaka';
import { yaAbalHasanin } from './ya-abal-hasanin';
import { dinunaya } from './dinunaya';
import { isyfalana } from './isyfalana';
import { yaRasulullahiSyafaah } from './ya-rasulullahi-syafaah';
import { shollualaihAlaMuhammad } from './shollualaih-ala-muhammad';
import { hayathuYaumal } from './hayathu-yaumal';
import { alaNur } from './ala-nur';
import { sholluAlaihiWasalimu } from './shollu-alaihi-wasalimu';
import { shobahTak } from './shobah-tak';
import { sadunaFidunya } from './saduna-fidunya';
import { yaAyuhannabi } from './ya-ayuhannabi';
import { subhanamanDzikruhu } from './subhanaman-dzikruhu';
import { yaminNahwaladinah } from './yamin-nahwaladinah';
import { allahAllahuAllah } from './allah-allahu-allah';
import { sholatullohAlaTohalYamani } from './sholatulloh-ala-tohal-yamani';
import { dilluni } from './dilluni';
import { rahmanYaRahman } from './rahman-ya-rahman';
import { alfasholallah } from './alfasholallah';
import { ahbabRasulullah } from './ahbab-rasulullah';
import { sholluAlaNurilladzi } from './shollu-ala-nurilladzi';
import { nurulMusthofa } from './nurul-musthofa';
import { robbiSalimna } from './robbi-salimna';
import { yaImamarusli } from './ya-imamarusli';
import { azkaTaslimi } from './azka-taslimi';
import { yaKhoirolHadi } from './ya-khoirol-hadi';
import { wulidalHuda } from './wulidal-huda';
import { aktsirBidzikrillah } from './aktsir-bidzikrillah';
import { sholiDzaljalali } from './sholi-dzaljalali';
import { hubbuAhmadi } from './hubbu-ahmadi';
import { laIlahaIllallahAllahYaMaulana } from './la-ilaha-illallah-allah-ya-maulana';
import { sholliwasalim } from './sholliwasalim';

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
  shalallahuAlaMuhammad,
  yaRabbamakah,
  shilYaNabi,
  yamimNahwalMadinah,
  analFaqiru,
  tholaalBadru,
  sholluAlaManJaaAna,
  mughrom,
  bimaulidilHadi,
  ahmadYaHabibi,
  annabiSholuAlaih,
  habibiYaMuhammad,
  yaHayatiruh,
  rohmaka,
  yaAbalHasanin,
  dinunaya,
  isyfalana,
  yaRasulullahiSyafaah,
  shollualaihAlaMuhammad,
  hayathuYaumal,
  alaNur,
  sholluAlaihiWasalimu,
  shobahTak,
  sadunaFidunya,
  yaAyuhannabi,
  subhanamanDzikruhu,
  yaminNahwaladinah,
  allahAllahuAllah,
  sholatullohAlaTohalYamani,
  dilluni,
  rahmanYaRahman,
  alfasholallah,
  ahbabRasulullah,
  sholluAlaNurilladzi,
  nurulMusthofa,
  robbiSalimna,
  yaImamarusli,
  azkaTaslimi,
  yaKhoirolHadi,
  wulidalHuda,
  aktsirBidzikrillah,
  sholiDzaljalali,
  hubbuAhmadi,
  laIlahaIllallahAllahYaMaulana,
  sholliwasalim,
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
  shalallahuAlaMuhammad,
  yaRabbamakah,
  shilYaNabi,
  yamimNahwalMadinah,
  analFaqiru,
  tholaalBadru,
  sholluAlaManJaaAna,
  mughrom,
  bimaulidilHadi,
  ahmadYaHabibi,
  annabiSholuAlaih,
  habibiYaMuhammad,
  yaHayatiruh,
  rohmaka,
  yaAbalHasanin,
  dinunaya,
  isyfalana,
  yaRasulullahiSyafaah,
  shollualaihAlaMuhammad,
  hayathuYaumal,
  alaNur,
  sholluAlaihiWasalimu,
  shobahTak,
  sadunaFidunya,
  yaAyuhannabi,
  subhanamanDzikruhu,
  yaminNahwaladinah,
  allahAllahuAllah,
  sholatullohAlaTohalYamani,
  dilluni,
  rahmanYaRahman,
  alfasholallah,
  ahbabRasulullah,
  sholluAlaNurilladzi,
  nurulMusthofa,
  robbiSalimna,
  yaImamarusli,
  azkaTaslimi,
  yaKhoirolHadi,
  wulidalHuda,
  aktsirBidzikrillah,
  sholiDzaljalali,
  hubbuAhmadi,
  laIlahaIllallahAllahYaMaulana,
  sholliwasalim,
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
