import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import { AuthProvider } from '@/components/LoginGate'
import ClockWidget from '@/components/ClockWidget'
import ThemeProvider from '@/components/ThemeProvider'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Portal de Soporte — DLP',
  description: 'Base de conocimiento y gestión de tareas del departamento de soporte',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Portal DLP',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#060608',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased" style={{ background: 'var(--th-bg)' }}>
        <ThemeProvider>
          <AuthProvider>
            <Navigation />
            <main className="pt-4 md:pt-[96px] md:pb-8 min-h-screen main-mobile-pad" style={{ background: 'var(--th-bg)' }}>
              <ClockWidget />
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
        <Script id="register-sw" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {})
          }
        `}</Script>
      </body>
    </html>
  )
}
