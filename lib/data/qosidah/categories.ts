import type { QosidahCategory } from '@/lib/types';

export const QOSIDAH_CATEGORIES: QosidahCategory[] = [
  {
    id: 'qosidah-arobiah',
    name: "Qosidah 'Arobiah",
    slug: 'qosidah-arobiah',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'qosidah-jawa',
    name: 'Qosidah Jawa',
    slug: 'qosidah-jawa',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'qosidah-indonesia',
    name: 'Qosidah Indonesia',
    slug: 'qosidah-indonesia',
    sort_order: 3,
    is_active: true,
  },
];
