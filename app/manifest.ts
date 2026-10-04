import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Khoirunnada — Hadroh Management & Qosidah',
    short_name: 'Khoirunnada',
    description: 'Aplikasi Operasional Internal & Qosidah Hadroh Khoirunnada',
    start_url: '/app',
    display: 'standalone',
    background_color: '#F8F6F0',
    theme_color: '#996A19',
    icons: [
      {
        src: '/logo-khoirunnada-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo-khoirunnada-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/logo-khoirunnada.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}