import { NextResponse } from 'next/server'

const SHEET_ID  = '1IkFQJW8kMcwQ9hwl0ixalQFUyribvDYDahbrBOFQf_g'
const SHEET_TAB = 'Registro de atención'
const CSV_URL   = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_TAB)}`

// ── Columnas verificadas con inspeccion directa del CSV ─────────────────────
// Col 0: # (índice)
// Col 1: Nombre
// Col 3: País
// Col 5: Fecha inscripción  (DD/MM/YYYY)
// Col 8: Acceso a plataforma
// Col 9: Tipo de Membresía
// Col 10: Vencimiento Skool (DD/MM/YYYY)
// Col 26: FIN DEL ACCESO    (DD/MM/YYYY)
// Col 28: Renovación
const C = {
  nombre: 1,
  pais:   3,
  fechaIns: 5,
  acceso: 8,
  skool:  10,
  fin:    26,
  renov:  28,
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

/* ── Parsear fecha DD/MM/YYYY o D/M/YYYY ──────────────────────────────────── */
function parseDate(s: string): Date | null {
  if (!s || s.includes('#') || s.includes('N/A')) return null
  // Formato DD/MM/YYYY o D/M/YYYY
  const parts = s.split('/')
  if (parts.length !== 3) return null
  const d = Number(parts[0]), m = Number(parts[1]), y = Number(parts[2])
  if (!d || !m || !y || y < 2000 || y > 2100 || m > 12 || d > 31) return null
  const date = new Date(y, m - 1, d)
  if (isNaN(date.getTime())) return null
  return date
}

function daysDiff(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000)
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
    const thisM = today.getMonth()

    let total = 0, mexico = 0, usa = 0, latam = 0
    let conAcceso = 0, sinAcceso = 0
    let skoolActivo = 0, skoolVencido = 0
    let proxVencer = 0, vencidos = 0
    let renovados = 0, nuevosEsteMes = 0

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i]
      const nombre = (r[C.nombre] || '').trim()
      if (!nombre) continue
      total++

      // País
      const pais = (r[C.pais] || '').toLowerCase()
      if (pais.includes('méx') || pais.includes('mex')) mexico++
      else if (pais.includes('estados unidos') || pais.includes('+1')) usa++
      else if (pais.trim()) latam++

      // Acceso a plataforma
      const acceso = (r[C.acceso] || '').toLowerCase().trim()
      if (acceso === 'si' || acceso === 'sí' || acceso.startsWith('renov')) conAcceso++
      else sinAcceso++

      // Vencimiento Skool
      const skoolDate = parseDate(r[C.skool] || '')
      if (skoolDate) {
        if (skoolDate >= today) skoolActivo++
        else skoolVencido++
      }

      // FIN DEL ACCESO
      const fin = parseDate(r[C.fin] || '')
      if (fin) {
        const diff = daysDiff(fin)
        if (diff < 0)      vencidos++
        else if (diff <= 30) proxVencer++
      }

      // Renovación (col 28): cualquier valor no vacío ni "0" significa renovado
      const renov = (r[C.renov] || '').trim()
      if (renov && renov !== '0' && !renov.startsWith('#')) renovados++

      // Nuevos este mes (fecha de inscripción col 5)
      const ins = parseDate(r[C.fechaIns] || '')
      if (ins && ins.getFullYear() === thisY && ins.getMonth() === thisM) nuevosEsteMes++
    }

    return NextResponse.json({
      total, mexico, usa, latam,
      conAcceso, sinAcceso,
      skoolActivo, skoolVencido,
      proxVencer, vencidos,
      renovados, nuevosEsteMes,
      actualizadoEn: new Date().toISOString(),
    })
  } catch (e) {
    console.error('estadisticas error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
