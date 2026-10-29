import { NextResponse } from 'next/server'
import { autenticar, logAcceso } from './apiAuth'
import { adminConfigurado, adminDb } from './firebaseAdmin'
import {
  aCaso, filtrar, leerCursor, leerFiltros, leerLimit, paginar, type DocReembolso,
} from './casosApi'

// Lectura de la colección completa: el volumen es de cientos de registros,
// así que filtrar y ordenar en memoria es suficiente para la v1.
async function leerTodos(): Promise<DocReembolso[]> {
  const snap = await adminDb().collection('reembolsos').get()
  return snap.docs.map(d => ({ ...(d.data() as Omit<DocReembolso, 'id'>), id: d.id }))
}

function clasificarError(err: unknown) {
  const e = err as { code?: unknown; message?: string; name?: string }
  const msg = String(e?.message || '')
  if (e?.name === 'SyntaxError') return 'credencial_json_invalido'
  if (/private key|PEM|DECODER|asn1/i.test(msg)) return 'credencial_llave_invalida'
  if (/invalid_grant|UNAUTHENTICATED|default credentials|invalid_rapt|Getting metadata/i.test(msg) || e?.code === 16) return 'credencial_rechazada'
  if (/PERMISSION_DENIED|permission/i.test(msg) || e?.code === 7) return 'sin_permiso_firestore'
  if (/NOT_FOUND|does not exist|has not been used|disabled/i.test(msg) || e?.code === 5) return 'firestore_no_encontrado_o_desactivado'
  return 'desconocida'
}

function envolver(request: Request, trabajo: (consumidor: string) => Promise<NextResponse>) {
  const inicio = Date.now()
  const auth = autenticar(request)
  if (!auth.ok) return Promise.resolve(auth.respuesta)
  const respuesta = !adminConfigurado()
    ? Promise.resolve(NextResponse.json({ error: 'Base de datos no configurada en el servidor' }, { status: 503 }))
    : trabajo(auth.consumidor).catch(err => {
        // Se registra y se devuelve solo la categoría de la falla (nunca el mensaje
        // completo, que podría incluir datos de la credencial).
        const causa = clasificarError(err)
        console.error(JSON.stringify({ api: 'v1', error: causa, codigo: (err as { code?: unknown })?.code ?? null }))
        return NextResponse.json({ error: 'Error interno', causa }, { status: 500 })
      })
  return respuesta.then(r => { logAcceso(auth.consumidor, request, r.status, inicio); return r })
}

export function listarCasos(request: Request, modo: 'lista' | 'cambios') {
  return envolver(request, async () => {
    const sp = new URL(request.url).searchParams
    const filtros = leerFiltros(sp)
    if ('error' in filtros) return NextResponse.json({ error: filtros.error }, { status: 400 })
    const limit = leerLimit(sp)
    if (typeof limit !== 'number') return NextResponse.json({ error: limit.error }, { status: 400 })
    if (modo === 'cambios' && !filtros.updatedSince) {
      return NextResponse.json({ error: 'since es obligatorio (fecha ISO 8601)' }, { status: 400 })
    }
    let cursor = null
    const rawCursor = sp.get('cursor')
    if (rawCursor) {
      cursor = leerCursor(rawCursor)
      if (!cursor) return NextResponse.json({ error: 'cursor inválido' }, { status: 400 })
    }

    const docs = filtrar(await leerTodos(), filtros)
    const { pagina, hayMas, siguiente } = paginar(docs, modo === 'cambios' ? 'asc' : 'desc', limit, cursor)
    return NextResponse.json({
      data: pagina.map(d => aCaso(d)),
      page: { limit, next_cursor: siguiente, has_more: hayMas },
      meta: { generado: new Date().toISOString(), version: 'v1', total_filtrado: docs.length },
    })
  })
}

export function detalleCaso(request: Request, id: string) {
  return envolver(request, async () => {
    if (id.includes('/')) return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 })
    const snap = await adminDb().collection('reembolsos').doc(id).get()
    if (!snap.exists) return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 })
    const caso = aCaso({ ...(snap.data() as Omit<DocReembolso, 'id'>), id: snap.id }, true)
    return NextResponse.json({ data: caso, meta: { generado: new Date().toISOString(), version: 'v1' } })
  })
}

export const noPermitido = () =>
  NextResponse.json({ error: 'Método no permitido: la API es de solo lectura' }, { status: 405, headers: { Allow: 'GET' } })
