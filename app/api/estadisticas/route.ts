import { NextResponse } from 'next/server'

const SHEET_ID  = '1IkFQJW8kMcwQ9hwl0ixalQFUyribvDYDahbrBOFQf_g'
const SHEET_TAB = 'Registro de atención'
const CSV_URL   = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_TAB)}`

// ── Columnas (letras de Google Sheets → índice 0-based) ─────────────────────
// A=0  B=1  C=2  D=3  E=4  F=5  G=6  H=7  I=8  J=9  K=10  L=11
const C = {
  nombre:    1,  // B - Nombre del alumno
  pais:      3,  // D - País
  fin:       5,  // F - Fecha fin de acceso  M/D/YYYY  (primer dígito = mes)
  evento:    7,  // H - EVENTO / tipo → "Renovación" = renovado, "BGI", "MAS", etc.
  acceso:    8,  // I - Acceso a plataforma (Si / No / Revocado / Renovación)
  membresia: 9,  // J - Tipo de membresía Skool (3 Meses / 6 Meses / 12 Meses)
                 //     Cualquier valor aquí = Skool activo
}

/* ── CSV parser ─────────────────────────────────────────────────────────────── */
function parseCSV(raw: string): string[][] {
  const rows: string[][] = []
  let cur = '', inQ = false, row: string[] = []
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]
    if (c === '"') {
      if (inQ && raw[i + 1] === '"') { cur += '"'; i++ }
      else inQ = !inQ
    } else if (c === ',' && !inQ) {
      row.push(cur.trim()); cur = ''
    } else if ((c === '\n' || c === '\r') && !inQ) {
      row.push(cur.trim()); rows.push(row); row = []; cur = ''
      if (c === '\r' && raw[i + 1] === '\n') i++
    } else {
      cur += c
    }
  }
  if (cur || row.length) { row.push(cur.trim()); rows.push(row) }
  return rows
}

// Formato M/D/YYYY — el primer número es el MES (formato USA)
function parseDate(s: string): Date | null {
  if (!s || s.includes('#') || s.includes('/')) {
    const parts = s.replace(/\s/g, '').split('/')
    if (parts.length !== 3) return null
    const m = Number(parts[0]), d = Number(parts[1]), y = Number(parts[2])
    if (!m || !d || !y || y < 2000 || y > 2100 || m > 12 || d > 31) return null
    const date = new Date(y, m - 1, d)
    return isNaN(date.getTime()) ? null : date
  }
  return null
}

// Re-write parseDate correctly (the if condition was wrong above)
function parseFecha(s: string): Date | null {
  if (!s) return null
  const clean = s.trim().replace(/\s/g, '')
  if (clean.includes('#') || !clean.includes('/')) return null
  const parts = clean.split('/')
  if (parts.length !== 3) return null
  const m = Number(parts[0]), d = Number(parts[1]), y = Number(parts[2])
  if (!m || !d || !y || y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null
  const date = new Date(y, m - 1, d)
  return isNaN(date.getTime()) ? null : date
}

function daysDiff(d: Date, today: Date): number {
  return Math.ceil((d.getTime() - today.getTime()) / 86_400_000)
}

/* ── Handler ─────────────────────────────────────────────────────────────── */
export async function GET() {
  try {
    const res = await fetch(CSV_URL, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw  = await res.text()
    const rows = parseCSV(raw)
    if (rows.length < 2) return NextResponse.json({ error: 'Sin datos' }, { status: 400 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thisY = today.getFullYear()
    const thisM = today.getMonth() // 0-based

    let total = 0
    let mexico = 0, usa = 0, latam = 0
    let conAcceso = 0, sinAcceso = 0
    let skoolActivo = 0, skoolVencido = 0
    let skool3 = 0, skool6 = 0, skool12 = 0
    let proxVencer = 0, vencidos = 0
    let renovados = 0, nuevosEsteMes = 0
    let bgi = 0, mas = 0

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i]
      if (!(r[C.nombre] || '').trim()) continue
      total++

      // ── País ──────────────────────────────────────────────────────────────
      const pais = (r[C.pais] || '').toLowerCase()
      if (pais.includes('méx') || pais.includes('mex')) mexico++
      else if (pais.includes('estados unidos') || pais.includes('+1')) usa++
      else if (pais.trim()) latam++

      // ── Acceso a plataforma (col I) ───────────────────────────────────────
      const acceso = (r[C.acceso] || '').toLowerCase().trim()
      if (acceso === 'si' || acceso === 'sí' || acceso.startsWith('renov')) conAcceso++
      else sinAcceso++

      // ── Col H: EVENTO → Renovados, BGI, MAS ──────────────────────────────
      const evento = (r[C.evento] || '').toLowerCase().trim()
      if (evento.includes('renovac')) renovados++
      if (evento.includes('bgi')) bgi++
      if (evento.includes('mas') || evento === 'mas') mas++

      // ── Col J: Tipo Membresía Skool ───────────────────────────────────────
      const memb = (r[C.membresia] || '').trim()
      if (memb) {
        skoolActivo++
        const membLow = memb.toLowerCase()
        if (membLow.includes('12')) skool12++
        else if (membLow.includes('6')) skool6++
        else if (membLow.includes('3')) skool3++
      } else {
        skoolVencido++ // sin membresía en col J = sin Skool activo
      }

      // ── Col F: Fecha fin M/D/YYYY → vencidos / próximos / nuevos ─────────
      const fechaVal = (r[C.fin] || '').trim()
      const fecha = parseFecha(fechaVal)
      if (fecha) {
        const diff = daysDiff(fecha, today)
        if (diff < 0)        vencidos++
        else if (diff <= 30) proxVencer++

        // Nuevos inscritos este mes (misma columna F)
        if (fecha.getFullYear() === thisY && fecha.getMonth() === thisM) nuevosEsteMes++
      }
    }

    return NextResponse.json({
      total, mexico, usa, latam,
      conAcceso, sinAcceso,
      skoolActivo, skoolVencido, skool3, skool6, skool12,
      proxVencer, vencidos,
      renovados, nuevosEsteMes,
      bgi, mas,
      actualizadoEn: new Date().toISOString(),
    })
  } catch (e) {
    console.error('estadisticas:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
