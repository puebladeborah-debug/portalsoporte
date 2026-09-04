'use client'

import { useRef, useState, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'

const S = {
  border:       'var(--th-border)',
  silverBright: 'var(--th-bright)',
  silverDim:    'var(--th-dim)',
}

const boxStyle = {
  background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright,
}

function soloDigitos(v: string, max: number) {
  return v.replace(/\D/g, '').slice(0, max)
}

// Fecha dividida en tres cuadros (día / mes / año) que se puede teclear
// directo, con avance automático al llenar cada uno — más un botón de
// calendario que abre el selector nativo del dispositivo para elegirla
// visualmente en vez de teclear.
export default function FechaInput({ value, onChange }: {
  value: string
  onChange: (iso: string) => void
}) {
  const [dia, setDia] = useState('')
  const [mes, setMes] = useState('')
  const [anio, setAnio] = useState('')

  const diaRef = useRef<HTMLInputElement>(null)
  const mesRef = useRef<HTMLInputElement>(null)
  const anioRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-')
      setDia(d); setMes(m); setAnio(y)
    } else {
      setDia(''); setMes(''); setAnio('')
    }
  }, [value])

  function emitir(d: string, m: string, y: string) {
    if (d.length !== 2 || m.length !== 2 || y.length !== 4) return
    const dd = parseInt(d, 10), mm = parseInt(m, 10)
    if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return
    onChange(`${y}-${m}-${d}`)
  }

  function handleDia(v: string) {
    v = soloDigitos(v, 2)
    setDia(v)
    emitir(v, mes, anio)
    if (v.length === 2) mesRef.current?.focus()
  }
  function handleMes(v: string) {
    v = soloDigitos(v, 2)
    setMes(v)
    emitir(dia, v, anio)
    if (v.length === 2) anioRef.current?.focus()
  }
  function handleAnio(v: string) {
    v = soloDigitos(v, 4)
    setAnio(v)
    emitir(dia, mes, v)
  }

  function backspaceAtras(e: React.KeyboardEvent<HTMLInputElement>, actual: string, prevRef: React.RefObject<HTMLInputElement | null>) {
    if (e.key === 'Backspace' && actual === '') prevRef.current?.focus()
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
    <div className="flex items-center gap-1.5">
      <input ref={diaRef} value={dia} onChange={e => handleDia(e.target.value)}
        inputMode="numeric" placeholder="DD" maxLength={2}
        className="w-12 text-center py-2.5 rounded-xl outline-none text-sm" style={boxStyle} />
      <span style={{ color: S.silverDim }}>/</span>
      <input ref={mesRef} value={mes} onChange={e => handleMes(e.target.value)}
        onKeyDown={e => backspaceAtras(e, mes, diaRef)}
        inputMode="numeric" placeholder="MM" maxLength={2}
        className="w-12 text-center py-2.5 rounded-xl outline-none text-sm" style={boxStyle} />
      <span style={{ color: S.silverDim }}>/</span>
      <input ref={anioRef} value={anio} onChange={e => handleAnio(e.target.value)}
        onKeyDown={e => backspaceAtras(e, anio, mesRef)}
        inputMode="numeric" placeholder="AAAA" maxLength={4}
        className="w-16 text-center py-2.5 rounded-xl outline-none text-sm" style={boxStyle} />

      <button type="button" onClick={abrirCalendario}
        className="ml-1 w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}
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
        className="absolute opacity-0 pointer-events-none w-0 h-0"
      />
    </div>
  )
}
