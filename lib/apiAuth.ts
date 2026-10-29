import { createHash, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import llaves from './apiKeys.json'

// Auth de la API interna (solo lectura). Cada consumidor (Donna, comercial,
// cron…) tiene su propia llave. Solo se guarda el HASH SHA-256 de cada llave
// (nunca la llave en claro), en lib/apiKeys.json y/o en la variable de entorno
//   PORTAL_API_KEYS_SHA256="donna:<hash>,comercial:<hash>"
// Se admiten varios hashes por consumidor para rotar sin cortar el servicio.
// Con llaves de 32 bytes aleatorios, el hash no permite recuperarlas.

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')

function consumidores() {
  const raw = process.env.PORTAL_API_KEYS_SHA256 || ''
  const deEnv = raw.split(',').map(p => p.trim()).filter(Boolean).map(p => {
    const i = p.indexOf(':')
    return { nombre: p.slice(0, i), hash: p.slice(i + 1).toLowerCase() }
  })
  const deArchivo = llaves.map(l => ({ nombre: l.consumidor, hash: l.sha256.toLowerCase() }))
  return [...deArchivo, ...deEnv].filter(c => c.nombre && /^[0-9a-f]{64}$/.test(c.hash))
}

function igual(a: string, b: string) {
  const ba = Buffer.from(a), bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

// Límite aproximado en memoria (cada instancia de Vercel cuenta aparte).
const LIMITE = 60
const VENTANA_MS = 60_000
const usos = new Map<string, { desde: number; n: number }>()

function excedeLimite(consumidor: string) {
  const ahora = Date.now()
  const u = usos.get(consumidor)
  if (!u || ahora - u.desde > VENTANA_MS) { usos.set(consumidor, { desde: ahora, n: 1 }); return false }
  u.n++
  return u.n > LIMITE
}

export type ResultadoAuth = { ok: true; consumidor: string } | { ok: false; respuesta: NextResponse }

export function autenticar(request: Request): ResultadoAuth {
  const lista = consumidores()
  if (!lista.length) {
    return { ok: false, respuesta: NextResponse.json({ error: 'API no configurada' }, { status: 503 }) }
  }
  const llave = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  const hash = llave ? sha256(llave) : ''
  const consumidor = hash ? lista.find(c => igual(c.hash, hash)) : undefined
  if (!consumidor) {
    return { ok: false, respuesta: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }
  if (excedeLimite(consumidor.nombre)) {
    return {
      ok: false,
      respuesta: NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429, headers: { 'Retry-After': '60' } }),
    }
  }
  return { ok: true, consumidor: consumidor.nombre }
}

// Log de acceso: quién, qué ruta y cómo terminó. Nunca la query string
// (puede traer correos) ni datos de los casos.
export function logAcceso(consumidor: string, request: Request, status: number, inicio: number) {
  const ruta = new URL(request.url).pathname
  console.log(JSON.stringify({ api: 'v1', consumidor, ruta, status, ms: Date.now() - inicio }))
}
