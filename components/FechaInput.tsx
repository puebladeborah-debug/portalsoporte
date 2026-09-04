'use client'

import { useRef, useState, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'

const S = {
  border:       'var(--th-border)',
  silverBright: 'var(--th-bright)',
  silverDim:    'var(--th-dim)',
}

function formatDisplay(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function parseDisplay(texto: string): string | null {
  const m = texto.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (!m) return null
  const dia = parseInt(m[1], 10), mes = parseInt(m[2], 10), anio = parseInt(m[3], 10)
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

// Fecha que se puede teclear como texto (DD/MM/AAAA) o elegir con el
// calendario nativo — un <input type="date"> solo no siempre deja escribir
// cómodo en todos los navegadores/celulares, así que se combina con un
// campo de texto libre sincronizado.
export default function FechaInput({ value, onChange, placeholder = 'DD/MM/AAAA' }: {
  value: string
  onChange: (iso: string) => void
  placeholder?: string
}) {
  const dateRef = useRef<HTMLInputElement>(null)
  const [texto, setTexto] = useState(formatDisplay(value))

  useEffect(() => { setTexto(formatDisplay(value)) }, [value])

  function handleTexto(v: string) {
    setTexto(v)
    const iso = parseDisplay(v)
    if (iso) onChange(iso)
  }

  function abrirCalendario() {
    const el = dateRef.current
    if (!el) return
    const conPicker = el as HTMLInputElement & { showPicker?: () => void }
    if (typeof conPicker.showPicker === 'function') {
      try { conPicker.showPicker() } catch { el.focus() }
    } else {
      el.focus()
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={texto}
        onChange={e => handleTexto(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-3 pr-10 py-2.5 rounded-xl outline-none text-sm"
        style={{ background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }}
      />
      <button type="button" onClick={abrirCalendario}
        className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: S.silverDim }}
        title="Abrir calendario">
        <CalendarDays size={16} />
      </button>
      {/* Input nativo invisible: solo se usa para abrir el calendario del sistema */}
      <input
        ref={dateRef}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 opacity-0 pointer-events-none"
      />
    </div>
  )
}
