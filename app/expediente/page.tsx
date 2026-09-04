'use client'

import { useState, useEffect } from 'react'
import { IdCard, ChevronLeft, ScrollText, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/LoginGate'
import { getMembers, TeamMember, EXEC_IDS } from '@/lib/teamStore'
import ReglamentoSeccion from '@/components/ReglamentoSeccion'
import DatosPersonalesSeccion from '@/components/DatosPersonalesSeccion'

const S = {
  bg:           'var(--th-bg)',
  card:         'var(--th-card)',
  border:       'var(--th-border)',
  borderLight:  'var(--th-border-light)',
  borderActive: 'var(--th-border-active)',
  silver:       'var(--th-silver)',
  silverBright: 'var(--th-bright)',
  silverDim:    'var(--th-dim)',
}

function nombreCorto(nombre: string) {
  return nombre.includes(' · ') ? nombre.split(' · ').pop()! : nombre
}

export default function ExpedientePage() {
  const { session, member } = useAuth()
  const esAdmin = member?.isAdmin ?? false

  const [miembros, setMiembros] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [viendoId, setViendoId] = useState<string | null>(null)

  useEffect(() => {
    getMembers().then(m => { setMiembros(m); setLoading(false) })
  }, [])

  if (!session || !member) return null

  function actualizarLocal(id: string, fields: Partial<TeamMember>) {
    setMiembros(prev => prev.map(m => (m.id === id ? { ...m, ...fields } : m)))
  }

  const propio = miembros.find(m => m.id === session.memberId) ?? member
  const viendo = viendoId ? miembros.find(m => m.id === viendoId) ?? null : propio
  const esPropio = !viendoId || viendoId === session.memberId

  const listaEquipo = miembros
    .filter(m => !EXEC_IDS.includes(m.id))
    .sort((a, b) => nombreCorto(a.name).localeCompare(nombreCorto(b.name), 'es'))

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6 flex items-center gap-2">
          <IdCard size={20} style={{ color: S.silver }} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Expediente del colaborador</h1>
            <p className="text-sm mt-1" style={{ color: S.silverDim }}>
              {esAdmin ? 'Tú puedes ver el expediente de todo el equipo' : 'Solo tú puedes ver tu expediente'}
            </p>
          </div>
        </div>

        {esAdmin && viendoId && (
          <button onClick={() => setViendoId(null)}
            className="flex items-center gap-1.5 mb-4 text-xs font-semibold" style={{ color: S.silverDim }}>
            <ChevronLeft size={14} /> Volver a mi expediente
          </button>
        )}

        {esAdmin && !viendoId && (
          <div className="mb-6">
            <p className="text-[10px] tracking-widest uppercase mb-2 px-1" style={{ color: S.silverDim }}>Equipo</p>
            <div className="space-y-1.5">
              {listaEquipo.filter(m => m.id !== session.memberId).map(m => (
                <button key={m.id} onClick={() => setViendoId(m.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                  style={{ background: S.card, border: `1px solid ${S.border}` }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: 'rgba(180,185,210,0.1)', color: S.silver }}>
                    {m.initial}
                  </div>
                  <span className="flex-1 text-left text-sm font-medium" style={{ color: S.silverBright }}>
                    {nombreCorto(m.name)}
                  </span>
                  {m.reglamentoFirmado ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(100,200,120,0.1)', color: '#70c080', border: '1px solid rgba(100,200,120,0.25)' }}>
                      <CheckCircle2 size={10} /> Firmado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(220,150,50,0.1)', color: '#d4a050', border: '1px solid rgba(220,150,50,0.25)' }}>
                      <AlertCircle size={10} /> Sin firmar
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
        ) : !viendo ? (
          <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>No se encontró este expediente.</p>
        ) : (
          <div className="space-y-4">
            {esAdmin && viendoId && (
              <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: S.silver }}>
                <ScrollText size={13} /> Expediente de {nombreCorto(viendo.name)}
              </p>
            )}
            <ReglamentoSeccion member={viendo}
              soloLectura={!esPropio}
              onSaved={fields => actualizarLocal(viendo.id, fields)} />
            <DatosPersonalesSeccion member={viendo}
              soloLectura={!esPropio}
              onSaved={fields => actualizarLocal(viendo.id, fields)} />
          </div>
        )}
      </div>
    </div>
  )
}
