import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Portal de Soporte — Club Sinergetico',
    short_name: 'Portal DLP',
    description: 'Base de conocimiento y gestión del departamento de soporte',
    start_url: '/',
    display: 'standalone',
    background_color: '#060608',
    theme_color: '#060608',
    orientation: 'portrait-primary',
    categories: ['productivity', 'business'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
