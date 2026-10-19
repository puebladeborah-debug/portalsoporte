'use client'

import { useState } from 'react'
import { History, Loader2, Ticket } from 'lucide-react'
import { auth } from '@/lib/firebase'

const S = {
  border:       'var(--th-border)',
  silver:       'var(--th-silver)',
  silverBright: 'var(--th-bright)',
  silverDim:    'var(--th-dim)',
}

type Historial = {
  contacto: {
    email: string
    emails_conocidos?: string[]
    nombre?: string | null
    telefono?: string | null
    ubicacion?: string | null
    lifecycle_stage?: string | null
    primer_contacto?: { fecha?: string | null; fuente_sistema?: string | null; embudo?: string | null; utm_source?: string | null } | null
    ultima_actividad?: string | null
    ltv_cents?: number | null
  }
  eventos: {
    titulo?: string | null; tipo?: string | null; fecha?: string | null; embudo?: string | null
    escaneado?: boolean | null; escaneado_en?: string | null
  }[]
  compras: {
    producto?: string | null; plataforma?: string | null; estado?: string | null
    monto_cents?: number | null; monto_cobrado_cents?: number | null; currency?: string | null; fecha?: string | null
  }[]
  synergy_unlimited?: {
    elegible?: boolean | null; motivo?: string | null
    boletos_entregados?: { categoria?: string | null; pais?: string | null; estado?: string | null; es_titular?: boolean | null; asignado_nombre?: string | null }[]
  } | null
}

// Las fechas llegan en UTC; se muestran en hora de México.
function fmtFecha(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: 'short', year: 'numeric' })
}

// Los montos de Axis vienen en centavos.
function fmtMonto(cents?: number | null, currency?: string | null) {
  if (cents == null) return '—'
  return `${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || ''}`.trim()
}

function Dato({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] tracking-widest uppercase" style={{ color: S.silverDim }}>{label}</p>
      <p className="text-xs break-words" style={{ color: S.silverBright }}>{value || '—'}</p>
    </div>
  )
}

export default function HistorialAxis({ correo }: { correo: string }) {
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'ok' | 'sin-contacto' | 'error'>('idle')
  const [data, setData] = useState<Historial | null>(null)
  const [error, setError] = useState('')

  async function consultar() {
    setEstado('cargando'); setError(''); setData(null)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) { setError('No hay sesión activa. Vuelve a iniciar sesión.'); setEstado('error'); return }
      const res = await fetch(`/api/historial-cliente?email=${encodeURIComponent(correo.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json().catch(() => ({}))
      if (res.status === 404) { setEstado('sin-contacto'); return }
      if (!res.ok) { setError(body.error || 'No se pudo consultar el historial'); setEstado('error'); return }
      setData(body as Historial)
      setEstado('ok')
    } catch {
      setError('No se pudo consultar el historial'); setEstado('error')
    }
  }

  const c = data?.contacto
  const su = data?.synergy_unlimited

  return (
    <div className="rounded-xl p-3" style={{ border: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.03)' }}>
      <button type="button" onClick={consultar} disabled={!correo.trim() || estado === 'cargando'}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all"
        style={{ background: 'rgba(70,140,220,0.1)', color: '#6aaddc', border: '1px solid rgba(70,140,220,0.3)', opacity: !correo.trim() ? 0.5 : 1 }}>
        {estado === 'cargando' ? <Loader2 size={13} className="animate-spin" /> : <History size={13} />}
        {estado === 'cargando' ? 'Consultando…' : 'Ver historial del cliente (Axis)'}
      </button>

      {estado === 'sin-contacto' && (
        <p className="text-xs mt-3 text-center" style={{ color: S.silverDim }}>Este correo no existe en Axis.</p>
      )}
      {estado === 'error' && (
        <p className="text-xs mt-3 text-center" style={{ color: '#e07070' }}>{error}</p>
      )}

      {estado === 'ok' && c && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Dato label="Nombre" value={c.nombre} />
            <Dato label="Teléfono" value={c.telefono} />
            <Dato label="Ubicación" value={c.ubicacion} />
            <Dato label="Etapa" value={c.lifecycle_stage} />
            <Dato label="Primer contacto" value={c.primer_contacto?.fecha ? `${fmtFecha(c.primer_contacto.fecha)}${c.primer_contacto.fuente_sistema ? ` · ${c.primer_contacto.fuente_sistema}` : ''}` : null} />
            <Dato label="Última actividad" value={fmtFecha(c.ultima_actividad)} />
            <Dato label="Valor total (LTV)" value={c.ltv_cents != null ? fmtMonto(c.ltv_cents) : null} />
            {c.emails_conocidos && c.emails_conocidos.length > 1 && (
              <Dato label="Otros correos" value={c.emails_conocidos.filter(e => e !== c.email).join(', ')} />
            )}
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Compras ({data!.compras.length})</p>
            {data!.compras.length === 0 ? (
              <p className="text-xs" style={{ color: S.silverDim }}>Sin compras registradas.</p>
            ) : (
              <div className="space-y-1.5">
                {[...data!.compras].reverse().map((p, i) => (
                  <div key={i} className="rounded-lg px-2.5 py-2" style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}` }}>
                    <p className="text-xs font-semibold" style={{ color: S.silverBright }}>{p.producto || 'Sin nombre'}</p>
                    <p className="text-[11px]" style={{ color: S.silverDim }}>
                      {fmtFecha(p.fecha)} · {p.plataforma || '—'} · {p.estado || '—'} · {fmtMonto(p.monto_cobrado_cents ?? p.monto_cents, p.currency)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Registros y asistencias ({data!.eventos.length})</p>
            {data!.eventos.length === 0 ? (
              <p className="text-xs" style={{ color: S.silverDim }}>Sin eventos registrados.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {[...data!.eventos].reverse().map((e, i) => (
                  <div key={i} className="rounded-lg px-2.5 py-2" style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}` }}>
                    <p className="text-xs font-semibold" style={{ color: S.silverBright }}>{e.titulo || 'Sin título'}</p>
                    <p className="text-[11px]" style={{ color: S.silverDim }}>
                      {fmtFecha(e.fecha)} · {e.tipo === 'attendance' ? 'Asistió' : e.tipo === 'registration' ? 'Se registró' : e.tipo || '—'}
                      {e.escaneado != null && ` · ${e.escaneado ? 'boleto escaneado' : 'boleto sin escanear'}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {su && (
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Synergy Unlimited</p>
              <p className="text-xs" style={{ color: S.silverBright }}>
                {su.elegible ? 'Tiene derecho a boletos' : `Sin derecho a boletos${su.motivo ? `: ${su.motivo}` : ''}`}
              </p>
              {su.boletos_entregados?.map((b, i) => (
                <p key={i} className="text-[11px] flex items-center gap-1.5 mt-1" style={{ color: S.silverDim }}>
                  <Ticket size={11} /> {b.categoria || 'Boleto'}{b.pais ? ` · ${b.pais}` : ''}{b.estado ? ` · ${b.estado}` : ''}
                  {b.es_titular === false && b.asignado_nombre ? ` · asignado a ${b.asignado_nombre}` : ''}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
