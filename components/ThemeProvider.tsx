'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeId = 'default' | 'blue' | 'purple' | 'green' | 'amber' | 'white'

export const THEMES: { id: ThemeId; label: string; color: string; bg: string }[] = [
  { id: 'default', label: 'Plata',     color: '#d4d8e8', bg: '#1a1a28' },
  { id: 'blue',    label: 'Azul',      color: '#b8d4f8', bg: '#102030' },
  { id: 'purple',  label: 'Púrpura',   color: '#d8c0f8', bg: '#1e1032' },
  { id: 'green',   label: 'Esmeralda', color: '#a8e0c8', bg: '#0f2018' },
  { id: 'amber',   label: 'Ámbar',     color: '#e8cc70', bg: '#221806' },
  { id: 'white',   label: 'Blanco',    color: '#1a1e38', bg: '#ffffff' },
]

// Colores de acento predefinidos para el tema Blanco
export const ACCENT_PRESETS = [
  { label: 'Índigo',   hex: '#4f46e5' },
  { label: 'Azul',     hex: '#2563eb' },
  { label: 'Celeste',  hex: '#0891b2' },
  { label: 'Verde',    hex: '#16a34a' },
  { label: 'Morado',   hex: '#9333ea' },
  { label: 'Rosa',     hex: '#db2777' },
  { label: 'Naranja',  hex: '#ea580c' },
  { label: 'Rojo',     hex: '#dc2626' },
]

const STORAGE_KEY  = 'portal_theme_v1'
const ACCENT_KEY   = 'portal_white_accent_v1'
const DEFAULT_ACCENT = '#4f46e5'

/* ── Helpers de color ────────────────────────────────────────────────────── */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]
}
function darken(hex: string, f: number): string {
  const [r,g,b] = hexToRgb(hex)
  return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`
}
function tintWith(hex: string, f: number): string {
  const [r,g,b] = hexToRgb(hex)
  return `rgb(${Math.round(r+(255-r)*(1-f))},${Math.round(g+(255-g)*(1-f))},${Math.round(b+(255-b)*(1-f))})`
}

function applyWhiteAccent(hex: string) {
  const root = document.documentElement
  root.style.setProperty('--th-bright',        darken(hex, 0.75))   // texto oscuro (títulos)
  root.style.setProperty('--th-silver',         darken(hex, 0.90))   // texto medio (cuerpo)
  root.style.setProperty('--th-dim',            tintWith(hex, 0.35)) // texto sutil (labels)
  root.style.setProperty('--th-border',         tintWith(hex, 0.25)) // borde
  root.style.setProperty('--th-border-light',   tintWith(hex, 0.15)) // borde suave
  root.style.setProperty('--th-border-active',  `${hex}55`)          // borde activo
}

function clearWhiteAccent() {
  const root = document.documentElement
  ;['--th-bright','--th-silver','--th-dim','--th-border','--th-border-light','--th-border-active']
    .forEach(v => root.style.removeProperty(v))
}

/* ── Contexto ────────────────────────────────────────────────────────────── */
type Ctx = {
  theme: ThemeId
  accentColor: string
  setTheme: (t: ThemeId) => void
  setAccentColor: (hex: string) => void
}

const ThemeCtx = createContext<Ctx>({
  theme: 'default', accentColor: DEFAULT_ACCENT,
  setTheme: () => {}, setAccentColor: () => {},
})
export const useThemeCtx = () => useContext(ThemeCtx)

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('default')
  const [accentColor, setAccentState] = useState(DEFAULT_ACCENT)

  useEffect(() => {
    const savedTheme  = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    const savedAccent = localStorage.getItem(ACCENT_KEY) || DEFAULT_ACCENT
    setAccentState(savedAccent)
    if (savedTheme && THEMES.some(t => t.id === savedTheme)) {
      applyTheme(savedTheme, savedAccent)
    }
  }, [])

  function applyTheme(t: ThemeId, accent: string) {
    setThemeState(t)
    const el = document.documentElement
    if (t === 'default') el.removeAttribute('data-theme')
    else el.dataset.theme = t
    // Si salimos del blanco, limpiamos las custom vars del acento
    if (t !== 'white') clearWhiteAccent()
    else applyWhiteAccent(accent)
    localStorage.setItem(STORAGE_KEY, t)
  }

  function setTheme(t: ThemeId) {
    applyTheme(t, accentColor)
  }

  function setAccentColor(hex: string) {
    setAccentState(hex)
    localStorage.setItem(ACCENT_KEY, hex)
    if (theme === 'white') applyWhiteAccent(hex)
  }

  return (
    <ThemeCtx.Provider value={{ theme, accentColor, setTheme, setAccentColor }}>
      {children}
    </ThemeCtx.Provider>
  )
}
