'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeId = 'default' | 'blue' | 'purple' | 'green' | 'amber'

export const THEMES: { id: ThemeId; label: string; color: string; bg: string }[] = [
  { id: 'default', label: 'Plata',      color: '#d4d8e8', bg: '#1a1a28' },
  { id: 'blue',    label: 'Azul',       color: '#b8d4f8', bg: '#102030' },
  { id: 'purple',  label: 'Púrpura',    color: '#d8c0f8', bg: '#1e1032' },
  { id: 'green',   label: 'Esmeralda',  color: '#a8e0c8', bg: '#0f2018' },
  { id: 'amber',   label: 'Ámbar',      color: '#e8cc70', bg: '#221806' },
]

const STORAGE_KEY = 'portal_theme_v1'

type Ctx = { theme: ThemeId; setTheme: (t: ThemeId) => void }
const ThemeCtx = createContext<Ctx>({ theme: 'default', setTheme: () => {} })
export const useThemeCtx = () => useContext(ThemeCtx)

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('default')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    if (saved && THEMES.some(t => t.id === saved)) apply(saved)
  }, [])

  function apply(t: ThemeId) {
    setThemeState(t)
    const el = document.documentElement
    if (t === 'default') el.removeAttribute('data-theme')
    else el.dataset.theme = t
    localStorage.setItem(STORAGE_KEY, t)
  }

  return (
    <ThemeCtx.Provider value={{ theme, setTheme: apply }}>
      {children}
    </ThemeCtx.Provider>
  )
}
