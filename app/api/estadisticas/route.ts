import { NextResponse } from 'next/server'

const SHEET_ID  = '1IkFQJW8kMcwQ9hwl0ixalQFUyribvDYDahbrBOFQf_g'
const SHEET_TAB = 'Registro de atención'
const CSV_URL   = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_TAB)}`

/* ── CSV parser minimal ─────────────────────────────────────────────────── */
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

/* ── Parsear fecha DD/MM/YYYY ────────────────────────────────────────────── */
function parseDate(s: string): Date | null {
  if (!s) return null
  const [d, m, y] = s.split('/').map(Number)
  if (!d || !m || !y || y < 2000) return null
  return new Date(y, m - 1, d)
}

function daysDiff(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000)
}

/* ── Handler ─────────────────────────────────────────────────────────────── */
export async function GET() {
  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 300 } }) // caché 5 min
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw  = await res.text()
    const rows = parseCSV(raw)

    if (rows.length < 2) return NextResponse.json({ error: 'Sin datos' }, { status: 400 })

    // Identificar columnas por encabezado (dinámico + fallback por posición)
    const header = rows[0].map(h => h.toLowerCase().trim())
    const col = (name: string, fallback = -1) => {
      const idx = header.findIndex(h => h.includes(name.toLowerCase()))
      return idx >= 0 ? idx : fallback
    }
    // Búsqueda exhaustiva para FIN DEL ACCESO (puede estar en col 26-30)
    const cFin = (() => {
      for (let i = 20; i < Math.min(header.length, 40); i++) {
        if (header[i].includes('fin del acceso') || header[i].includes('fin de acceso')) return i
      }
      return 28 // fallback comprobado
    })()

    const cPais     = col('pais',     4)
    const cAcceso   = col('acceso a plataforma', 8)
    const cSkool    = (() => { // Vencimiento Skool: primera col vacía tras "tipo de membresia"
      const base = col('tipo de membresia', 9)
      return base + 1 // suele ser la siguiente col vacía
    })()
    const cFechaIns = (() => { // fecha inscripción: col vacía inmediatamente antes de Pais
      return cPais > 0 ? cPais + 1 : 5 // columna justo después de País
    })()
    const cRenov    = col('renovaci', 28) // "Renovación" puede tener distintos acentos

    const today = new Date()
    const thisY = today.getFullYear()
    const thisM = today.getMonth()

    let total = 0, mexico = 0, usa = 0, latam = 0
    let conAcceso = 0, sinAcceso = 0
    let skoolActivo = 0, skoolVencido = 0
    let proxVencer = 0, vencidos = 0
    let renovados = 0, nuevosEsteMes = 0

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i]
      if (!r[1]?.trim()) continue // sin Nombre = fila vacía
      total++

      // País
      const pais = (r[cPais] || '').toLowerCase()
      if (pais.includes('méx') || pais.includes('mex')) mexico++
      else if (pais.includes('estados unidos') || pais.includes('usa') || pais.includes('+1')) usa++
      else if (pais.trim()) latam++

      // Acceso a plataforma
      const acceso = (r[cAcceso] || '').toLowerCase()
      if (acceso === 'si' || acceso === 'sí' || acceso === 'renovación' || acceso === 'renovacion') conAcceso++
      else sinAcceso++

      // Skool (col 10)
      const skoolStr = r[cSkool] || ''
      if (skoolStr) {
        const skoolDate = parseDate(skoolStr)
        if (skoolDate) {
          if (skoolDate >= today) skoolActivo++
          else skoolVencido++
        }
      }

      // FIN DEL ACCESO → próximos a vencer / vencidos
      const finStr = cFin >= 0 ? (r[cFin] || '') : ''
      if (finStr) {
        const fin = parseDate(finStr)
        if (fin) {
          const diff = daysDiff(fin)
          if (diff < 0) vencidos++
          else if (diff <= 30) proxVencer++
        }
      }

      // Renovación
      const renov = cRenov >= 0 ? (r[cRenov] || '') : ''
      if (renov && renov !== '0' && renov.trim() !== '') renovados++

      // Nuevos este mes (fecha inscripción)
      const insStr = r[cFechaIns] || ''
      if (insStr) {
        const ins = parseDate(insStr)
        if (ins && ins.getFullYear() === thisY && ins.getMonth() === thisM) nuevosEsteMes++
      }
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
