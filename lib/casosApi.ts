import { createHash } from 'crypto'

// Lógica pura de la API interna de casos (reembolsos / contracargos), sin
// tocar red ni Firestore, para poder probarla con datos de ejemplo.

export type DocReembolso = {
  id: string
  evento?: string
  mes?: string
  plataforma?: string
  fechaDevolucion?: string
  monto?: number
  divisa?: string
  correo?: string
  nombre?: string
  producto?: string
  productoDetalle?: string
  acceso?: string
  numeroOperacion?: string
  notas?: string
  costoEmpresa?: number
  costoEmpresaDivisa?: string
  createdAt?: string
  updatedAt?: string
  apiUpdatedAt?: string
  importId?: string
  resultado?: 'completo' | 'parcial' | 'disputa-perdida'
  estatusCaso?: 'en-disputa' | 'ganada' | 'perdida' | ''
  fechaVencimiento?: string
}

export type Caso = ReturnType<typeof aCaso>

const PORTAL_URL = process.env.PORTAL_PUBLIC_URL || 'https://portalsoporte.vercel.app'

const iso = (v?: string) => {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

export function estatusDe(d: DocReembolso) {
  if (d.estatusCaso === 'en-disputa') return 'en_disputa'
  if (d.estatusCaso === 'ganada') return 'ganada'
  if (d.estatusCaso === 'perdida') return 'perdida'
  if (d.resultado === 'disputa-perdida') return 'perdida'
  if (d.resultado === 'completo') return 'completo'
  if (d.resultado === 'parcial') return 'parcial'
  return 'sin_clasificar'
}

export function actualizadoDe(d: DocReembolso) {
  return iso(d.apiUpdatedAt) || iso(d.updatedAt) || iso(d.createdAt) || '1970-01-01T00:00:00.000Z'
}

export function aCaso(d: DocReembolso, detalle = false) {
  const calidad: string[] = []
  if (!d.numeroOperacion) calidad.push('sin_id_externo')
  if (/fecha de venta/i.test(d.notas || '')) calidad.push('fecha_devolucion_aproximada')
  if (d.mes && d.fechaDevolucion && d.mes !== d.fechaDevolucion.slice(0, 7)) calidad.push('mes_no_coincide')

  const estatus = estatusDe(d)
  const caso = {
    id: d.id,
    tipo: d.estatusCaso || d.resultado === 'disputa-perdida' ? 'contracargo' : 'reembolso',
    estatus,
    monto: d.monto ?? 0,
    moneda: d.divisa || null,
    procesador: d.plataforma || null,
    id_externo: d.numeroOperacion || null,
    producto: d.producto || null,
    producto_detalle: d.productoDetalle || null,
    alumno: { email: d.correo || null, nombre: d.nombre || null },
    acceso: d.acceso || null,
    fechas: {
      devolucion: d.fechaDevolucion || null,
      creado: iso(d.createdAt),
      actualizado: actualizadoDe(d),
      vencimiento: d.fechaVencimiento || null,
    },
    origen: d.importId ? `import:${d.importId}` : 'manual',
    calidad,
    url_portal: `${PORTAL_URL}/reembolsos?caso=${encodeURIComponent(d.id)}`,
  }
  if (!detalle) return caso
  return {
    ...caso,
    notas: d.notas || null,
    costo_empresa: d.costoEmpresa ?? 0,
    costo_empresa_moneda: d.costoEmpresaDivisa || null,
  }
}

/* ─── Filtros ───────────────────────────────────────────────────────────── */
export type Filtros = {
  estatus?: string
  tipo?: string
  procesador?: string
  desde?: string
  hasta?: string
  updatedSince?: string
  email?: string
  emailSha256?: string
  idExterno?: string
}

const ESTATUS_VALIDOS = ['en_disputa', 'ganada', 'perdida', 'completo', 'parcial', 'sin_clasificar']
const TIPOS_VALIDOS = ['reembolso', 'contracargo']
const reFecha = /^\d{4}-\d{2}-\d{2}$/

export function leerFiltros(sp: URLSearchParams): Filtros | { error: string } {
  const f: Filtros = {}
  const g = (k: string) => sp.get(k)?.trim() || undefined

  f.estatus = g('estatus')
  if (f.estatus && !ESTATUS_VALIDOS.includes(f.estatus)) return { error: `estatus inválido. Valores: ${ESTATUS_VALIDOS.join(', ')}` }
  f.tipo = g('tipo')
  if (f.tipo && !TIPOS_VALIDOS.includes(f.tipo)) return { error: `tipo inválido. Valores: ${TIPOS_VALIDOS.join(', ')}` }
  f.procesador = g('procesador')
  f.desde = g('desde')
  f.hasta = g('hasta')
  if ((f.desde && !reFecha.test(f.desde)) || (f.hasta && !reFecha.test(f.hasta))) return { error: 'desde/hasta deben ser YYYY-MM-DD' }
  f.updatedSince = g('updated_since') || g('since')
  if (f.updatedSince && !iso(f.updatedSince)) return { error: 'updated_since/since debe ser una fecha ISO 8601' }
  f.email = g('email')?.toLowerCase()
  f.emailSha256 = g('email_sha256')?.toLowerCase()
  if (f.emailSha256 && !/^[0-9a-f]{64}$/.test(f.emailSha256)) return { error: 'email_sha256 debe ser un SHA-256 en hexadecimal' }
  f.idExterno = g('id_externo')
  return f
}

export function filtrar(docs: DocReembolso[], f: Filtros) {
  const desdeActual = f.updatedSince ? iso(f.updatedSince) : null
  return docs.filter(d => {
    if (f.estatus && estatusDe(d) !== f.estatus) return false
    if (f.tipo && aCaso(d).tipo !== f.tipo) return false
    if (f.procesador && (d.plataforma || '').toLowerCase() !== f.procesador.toLowerCase()) return false
    if (f.desde && (d.fechaDevolucion || '') < f.desde) return false
    if (f.hasta && (d.fechaDevolucion || '') > f.hasta) return false
    if (desdeActual && actualizadoDe(d) <= desdeActual) return false
    const correo = (d.correo || '').trim().toLowerCase()
    if (f.email && correo !== f.email) return false
    if (f.emailSha256 && createHash('sha256').update(correo).digest('hex') !== f.emailSha256) return false
    if (f.idExterno && d.numeroOperacion !== f.idExterno) return false
    return true
  })
}

/* ─── Orden estable y cursor ────────────────────────────────────────────── */
// Orden: actualizado + id como desempate. 'desc' para la lista normal,
// 'asc' para el endpoint de cambios (polling).
type Direccion = 'asc' | 'desc'

export function codificarCursor(u: string, i: string) {
  return Buffer.from(JSON.stringify({ u, i })).toString('base64url')
}

export function leerCursor(c: string): { u: string; i: string } | null {
  try {
    const o = JSON.parse(Buffer.from(c, 'base64url').toString('utf8'))
    return typeof o.u === 'string' && typeof o.i === 'string' ? o : null
  } catch { return null }
}

export function paginar(docs: DocReembolso[], dir: Direccion, limit: number, cursor: { u: string; i: string } | null) {
  const signo = dir === 'asc' ? 1 : -1
  const orden = [...docs].sort((a, b) => {
    const ua = actualizadoDe(a), ub = actualizadoDe(b)
    if (ua !== ub) return ua < ub ? -signo : signo
    return a.id < b.id ? -signo : a.id > b.id ? signo : 0
  })
  const desdeCursor = cursor
    ? orden.filter(d => {
        const u = actualizadoDe(d)
        if (u !== cursor.u) return dir === 'asc' ? u > cursor.u : u < cursor.u
        return dir === 'asc' ? d.id > cursor.i : d.id < cursor.i
      })
    : orden
  const pagina = desdeCursor.slice(0, limit)
  const hayMas = desdeCursor.length > limit
  const ultimo = pagina[pagina.length - 1]
  return {
    pagina,
    hayMas,
    siguiente: hayMas && ultimo ? codificarCursor(actualizadoDe(ultimo), ultimo.id) : null,
  }
}

export function leerLimit(sp: URLSearchParams): number | { error: string } {
  const raw = sp.get('limit')
  if (raw === null) return 50
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1 || n > 200) return { error: 'limit debe ser un entero entre 1 y 200' }
  return n
}
