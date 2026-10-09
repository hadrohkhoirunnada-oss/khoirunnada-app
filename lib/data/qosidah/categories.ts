import type { QosidahCategory } from '@/lib/types';

export const QOSIDAH_CATEGORIES: QosidahCategory[] = [
  {
    id: 'pembukaan',
    name: 'Pembukaan',
    slug: 'pembukaan',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'sholawat',
    name: 'Sholawat',
    slug: 'sholawat',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'mahalul-qiyam',
    name: 'Mahalul Qiyam',
    slug: 'mahalul-qiyam',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'qosidah-inti',
    name: 'Qosidah Inti',
    slug: 'qosidah-inti',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'penutup',
    name: 'Penutup',
    slug: 'penutup',
    sort_order: 5,
    is_active: true,
  },
];
