import { NextResponse } from 'next/server'

// Consulta el historial de un cliente en Axis por correo. La llave de Axis
// vive solo aquí, en el servidor (variable de entorno) — nunca llega al
// navegador. Además, solo responde si quien pregunta tiene sesión real del
// equipo: se valida el token de Firebase que manda la app, porque esta ruta
// devuelve datos personales de clientes.
const AXIS_URL = 'https://axis.sinergeticos.com/api/internal/historial-cliente'
const FIREBASE_API_KEY = 'AIzaSyAuT4T1o30m5qLuVW6bK4odoeyeq9dinJU'

async function sesionValida(idToken: string) {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) },
    )
    return res.ok
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const idToken = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!idToken || !(await sesionValida(idToken))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const secret = process.env.AXIS_HISTORIAL_SECRET || process.env.AXIS_API_TOKEN
  if (!secret) {
    return NextResponse.json({ error: 'Falta configurar la llave de Axis en el servidor' }, { status: 500 })
  }

  const email = new URL(request.url).searchParams.get('email')?.trim()
  if (!email) return NextResponse.json({ error: 'email inválido o faltante' }, { status: 400 })

  try {
    const res = await fetch(`${AXIS_URL}?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: 'no-store',
    })
    const body = await res.json().catch(() => ({}))
    // 404 es un caso normal (el correo no existe en Axis), se pasa tal cual.
    // Un 401 de Axis significa llave mala del servidor, no sesión del usuario.
    if (res.status === 401) {
      return NextResponse.json({ error: 'Axis rechazó la llave configurada en el servidor' }, { status: 502 })
    }
    return NextResponse.json(body, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con Axis' }, { status: 502 })
  }
}
