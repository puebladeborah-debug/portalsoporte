'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Sun, Moon, Clock, ChevronDown, ChevronUp, BarChart2, ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/components/LoginGate'
import { useFirestoreCollection } from '@/lib/firestoreCollection'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

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

type JornadaDoc = {
  id: string
  memberId: string
  memberName: string
  memberRole: string
  fecha: string
  tipo: 'inicio' | 'fin'
  horaEntrada?: string
  energia?: number
  horaSalida?: string
  casosResueltos?: number
  casosPendientes?: number
  escaladoDLP?: boolean
  calidadPercibida?: number
  devolucionesSolicitadas?: number
  devolucionesAutorizadas?: number
  status?: 'completo' | 'incompleto'
  createdAt: string
}

const TODAY = new Date().toISOString().split('T')[0]

const EMPTY_INI = { horaEntrada: '', energia: '3', whatsapp: '', zendesk: '', correo: '', llamadas: '', telegram: '', instagram: '', facebook: '', whatsappViejito: '', whatsappSoporte: '', whatsappSkool: '', ghl: '', skoolMdl: '', skoolCs: '', skoolLegendaria: '', whatsLegendaria: '' }

function fmtFecha(fecha: string) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

/* ─── Modal: registrar inicio de jornada ─────────────────────────────────── */
function InicioModal({ memberId, memberName, memberRole, onClose }: {
  memberId: string; memberName: string; memberRole: string; onClose: () => void
}) {
  const [form, setForm] = useState({ ...EMPTY_INI, horaEntrada: new Date().toTimeString().slice(0, 5) })
  const [saving, setSaving] = useState(false)

  function set(key: keyof typeof form, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function guardar() {
    if (!form.horaEntrada) return
    setSaving(true)
    await setDoc(doc(db, 'reportes_jornada', `${memberId}_${TODAY}_inicio`), {
      id: `${memberId}_${TODAY}_inicio`,
      memberId, memberName, memberRole,
      fecha: TODAY, tipo: 'inicio',
      horaEntrada: form.horaEntrada,
      energia: Number(form.energia) || 3,
      whatsapp:        Number(form.whatsapp)        || 0,
      zendesk:         Number(form.zendesk)         || 0,
      correo:          Number(form.correo)          || 0,
      llamadas:        Number(form.llamadas)        || 0,
      telegram:        Number(form.telegram)        || 0,
      instagram:       Number(form.instagram)       || 0,
      facebook:        Number(form.facebook)        || 0,
      whatsappViejito: Number(form.whatsappViejito) || 0,
      whatsappSoporte: Number(form.whatsappSoporte) || 0,
      whatsappSkool:   Number(form.whatsappSkool)   || 0,
      ghl:             Number(form.ghl)             || 0,
      skoolMdl:        Number(form.skoolMdl)        || 0,
      skoolCs:         Number(form.skoolCs)         || 0,
      skoolLegendaria: Number(form.skoolLegendaria) || 0,
      whatsLegendaria: Number(form.whatsLegendaria) || 0,
      createdAt: new Date().toISOString(),
    })
    setSaving(false)
    onClose()
  }

  const inputStyle = { background: 'var(--th-input)', border: `1px solid ${S.border}`, color: S.silverBright }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm mx-4 rounded-t-3xl md:rounded-2xl flex flex-col"
        style={{ background: 'var(--th-inner)', border: '1px solid rgba(100,160,240,0.25)', boxShadow: '0 0 60px rgba(0,0,0,0.95)', maxHeight: '90vh' }}>

        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${S.border}` }}>
          <Sun size={15} style={{ color: '#7ab0f0' }} />
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: S.silverBright }}>Inicio de Jornada</p>
            <p className="text-[10px] mt-0.5" style={{ color: S.silverDim }}>{TODAY}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Hora de entrada *</p>
            <input type="time" value={form.horaEntrada} onChange={e => set('horaEntrada', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm" style={inputStyle} />
          </div>

          <div>
            <p className="text-[9px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>Nivel de energía al iniciar</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => set('energia', String(n))}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: form.energia === String(n) ? 'rgba(100,160,240,0.2)' : 'rgba(180,185,210,0.04)',
                    color: form.energia === String(n) ? '#7ab0f0' : S.silverDim,
                    border: `1px solid ${form.energia === String(n) ? 'rgba(100,160,240,0.4)' : S.border}`,
                  }}>
                  {n}
                </button>
              ))}
            </div>
            <p className="text-[9px] mt-1 text-center" style={{ color: S.silverDim }}>1 = bajo · 5 = excelente</p>
          </div>

          <div>
            <p className="text-[9px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>Mensajes pendientes al iniciar (backlog)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'whatsapp' as const, label: 'WhatsApp', emoji: '💬' },
                { key: 'zendesk' as const, label: 'Zendesk', emoji: '🎫' },
                { key: 'correo' as const, label: 'Correo', emoji: '📧' },
                { key: 'llamadas' as const, label: 'Llamadas', emoji: '📞' },
                { key: 'telegram' as const, label: 'Telegram', emoji: '✈️' },
                { key: 'instagram' as const, label: 'Instagram', emoji: '📸' },
                { key: 'facebook' as const, label: 'Facebook', emoji: '👤' },
                { key: 'whatsappViejito' as const, label: 'WA Viejito', emoji: '📲' },
                { key: 'whatsappSoporte' as const, label: 'WA Soporte', emoji: '💬' },
                { key: 'whatsappSkool' as const, label: 'WA SKOOL', emoji: '🎓' },
                { key: 'ghl' as const, label: 'GHL', emoji: '⚙️' },
                { key: 'skoolMdl' as const, label: 'Skool MDL', emoji: '🎓' },
                { key: 'skoolCs' as const, label: 'Skool CS', emoji: '🎓' },
                { key: 'skoolLegendaria' as const, label: 'Skool Legendaria', emoji: '🎓' },
                { key: 'whatsLegendaria' as const, label: 'Whats Legendaria', emoji: '💬' },
              ].map(ch => (
                <div key={ch.key}>
                  <p className="text-[9px] mb-1" style={{ color: S.silverDim }}>{ch.emoji} {ch.label}</p>
                  <input type="number" min="0" value={form[ch.key]} onChange={e => set(ch.key, e.target.value)}
                    placeholder="0" className="w-full px-3 py-2 rounded-xl outline-none text-sm text-center" style={inputStyle} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${S.border}` }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm" style={{ color: S.silverDim, border: `1px solid ${S.border}` }}>
            Cancelar
          </button>
          <button disabled={!form.horaEntrada || saving} onClick={guardar}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={{
              background: form.horaEntrada ? 'rgba(100,160,240,0.15)' : 'rgba(180,185,210,0.04)',
              color: form.horaEntrada ? '#7ab0f0' : S.silverDim,
              border: `1px solid ${form.horaEntrada ? 'rgba(100,160,240,0.35)' : S.border}`,
              opacity: saving ? 0.6 : 1,
            }}>
            <Sun size={14} /> {saving ? 'Guardando…' : 'Registrar Inicio'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Página principal ───────────────────────────────────────────────────── */
export default function KpisPersonalPage() {
  const { session, member } = useAuth()
  const puedeVerEquipo = !!member?.isAdmin || !!member?.permissions?.includes('verKPIs')
  const [modalInicio, setModalInicio] = useState(false)
  const [abierto, setAbierto] = useState<string | null>(null)

  const { data: registros, loading } = useFirestoreCollection<JornadaDoc>('reportes_jornada', {
    where: ['memberId', '==', member?.id || ''],
  })

  const inicioHoy = registros.find(r => r.fecha === TODAY && r.tipo === 'inicio')
  const finHoy = registros.find(r => r.fecha === TODAY && r.tipo === 'fin')

  const porDia = useMemo(() => {
    const map = new Map<string, { inicio?: JornadaDoc; fin?: JornadaDoc }>()
    for (const r of registros) {
      const cur = map.get(r.fecha) || {}
      if (r.tipo === 'inicio') cur.inicio = r
      else cur.fin = r
      map.set(r.fecha, cur)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [registros])

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Mis KPIs</h1>
          <p className="text-sm mt-1" style={{ color: S.silverDim }}>Tu registro personal de llegada y salida — solo tú lo ves</p>
        </div>

        {/* Estado de hoy */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl px-4 py-4" style={{ background: 'rgba(100,160,240,0.08)', border: '1px solid rgba(100,160,240,0.25)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Sun size={13} style={{ color: '#7ab0f0' }} />
              <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(122,176,240,0.75)' }}>Entrada hoy</p>
            </div>
            {inicioHoy ? (
              <p className="text-xl font-black" style={{ color: '#7ab0f0' }}>{inicioHoy.horaEntrada}</p>
            ) : (
              <button onClick={() => setModalInicio(true)}
                className="text-xs font-bold mt-1 px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(100,160,240,0.15)', color: '#7ab0f0', border: '1px solid rgba(100,160,240,0.35)' }}>
                Registrar
              </button>
            )}
          </div>
          <div className="rounded-2xl px-4 py-4" style={{ background: 'rgba(180,120,220,0.08)', border: '1px solid rgba(180,120,220,0.25)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Moon size={13} style={{ color: '#b070e0' }} />
              <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(180,112,224,0.75)' }}>Salida hoy</p>
            </div>
            {finHoy ? (
              <p className="text-xl font-black" style={{ color: '#b070e0' }}>{finHoy.horaSalida}</p>
            ) : (
              <>
                <p className="text-[11px]" style={{ color: S.silverDim }}>Pendiente</p>
                <Link href="/" className="text-[11px] font-semibold flex items-center gap-1 mt-1" style={{ color: '#b070e0' }}>
                  Ir a Equipo → QR Fin de Jornada <ArrowRight size={11} />
                </Link>
              </>
            )}
          </div>
        </div>

        {puedeVerEquipo && (
          <Link href="/admin/kpis"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-6 transition-all"
            style={{ background: 'rgba(220,160,60,0.08)', color: '#dcaa50', border: '1px solid rgba(220,160,60,0.25)' }}>
            <BarChart2 size={16} />
            <span className="flex-1 text-sm font-bold">Ver estadísticas del equipo</span>
            <ArrowRight size={14} />
          </Link>
        )}

        <p className="text-[10px] tracking-widest uppercase mb-3 px-1" style={{ color: S.silverDim }}>Tu historial</p>

        {loading ? (
          <p className="text-center text-sm py-10" style={{ color: S.silverDim }}>Cargando…</p>
        ) : porDia.length === 0 ? (
          <div className="text-center py-12" style={{ color: S.silverDim }}>
            <Clock size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Sin registros todavía</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {porDia.map(([fecha, { inicio, fin }]) => {
              const open = abierto === fecha
              return (
                <div key={fecha} className="rounded-xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.border}` }}>
                  <button onClick={() => setAbierto(open ? null : fecha)} className="w-full flex items-center gap-3 px-4 py-3">
                    <p className="flex-1 text-left text-xs font-semibold capitalize" style={{ color: S.silverBright }}>{fmtFecha(fecha)}</p>
                    {inicio?.horaEntrada && <span className="text-[11px]" style={{ color: '#7ab0f0' }}>↳ {inicio.horaEntrada}</span>}
                    {fin?.horaSalida && <span className="text-[11px]" style={{ color: '#b070e0' }}>↴ {fin.horaSalida}</span>}
                    {open ? <ChevronUp size={14} style={{ color: S.silverDim }} /> : <ChevronDown size={14} style={{ color: S.silverDim }} />}
                  </button>
                  {open && (
                    <div className="px-4 py-3 space-y-1.5 text-[11px]" style={{ borderTop: `1px solid ${S.border}`, color: S.silver }}>
                      {inicio && (
                        <p>Entrada: <span style={{ color: S.silverBright }}>{inicio.horaEntrada || '—'}</span> · Energía: <span style={{ color: S.silverBright }}>{inicio.energia ?? '—'}/5</span></p>
                      )}
                      {fin && (
                        <>
                          <p>Salida: <span style={{ color: S.silverBright }}>{fin.horaSalida || '—'}</span> · Calidad: <span style={{ color: S.silverBright }}>{fin.calidadPercibida ?? '—'}/5</span></p>
                          <p>Casos resueltos: <span style={{ color: S.silverBright }}>{fin.casosResueltos ?? 0}</span> · Pendientes: <span style={{ color: S.silverBright }}>{fin.casosPendientes ?? 0}</span></p>
                        </>
                      )}
                      {!inicio && !fin && <p style={{ color: S.silverDim }}>Sin datos ese día</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modalInicio && member && (
        <InicioModal
          memberId={member.id}
          memberName={member.name}
          memberRole={member.role}
          onClose={() => setModalInicio(false)}
        />
      )}
    </div>
  )
}
