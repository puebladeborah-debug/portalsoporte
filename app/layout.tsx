import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import { AuthProvider } from '@/components/LoginGate'
import ClockWidget from '@/components/ClockWidget'

export const metadata: Metadata = {
  title: 'Portal de Soporte — DLP',
  description: 'Base de conocimiento y gestión de tareas del departamento de soporte',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased" style={{ background: '#060608' }}>
        <AuthProvider>
          <Navigation />
          <ClockWidget />
          <main className="pt-4 pb-24 md:pt-28 md:pb-8 min-h-screen" style={{ background: '#060608' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
