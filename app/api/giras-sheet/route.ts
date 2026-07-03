import { NextResponse } from 'next/server'

const API_KEY  = 'AIzaSyAcHd53OR2vn5Wk1o3p_wwmMe3TwLfOk5Y'
const SHEET_ID = '1ClJSoO4s4vc-a1DQr-cvnBX9gVv_tYm7FS8EWc4FmOE'
const TAB      = 'eventos actuales'

// Meses en inglés y español para parsear fechas del sheet
const MESES_EN: Record<string,number> = {
  january:0,february:1,march:2,april:3,may:4,june:5,
  july:6,august:7,september:8,october:9,november:10,december:11,
}

function parseFechaSheet(raw: string): string | null {
  if (!raw) return null
  const s = raw.toLowerCase().replace(/,/g,'').trim()
  // Buscar año (4 dígitos)
  const yearM = s.match(/\b(202[0-9])\b/)
  const year  = yearM ? parseInt(yearM[1]) : new Date().getFullYear()
  // Buscar mes en inglés
  let month = -1
  for (const [name, idx] of Object.entries(MESES_EN)) {
    if (s.includes(name)) { month = idx; break }
  }
  // Buscar día (1-31)
  const dayM = s.match(/\b(\d{1,2})\b/)
  const day  = dayM ? parseInt(dayM[1]) : -1
  if (month === -1 || day === -1) return null
  // Devolver YYYY-MM-DD
  const mm = String(month + 1).padStart(2,'0')
  const dd = String(day).padStart(2,'0')
  return `${year}-${mm}-${dd}`
}

export async function GET() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(TAB + '!A:E')}?key=${API_KEY}`
    const res  = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 400 })

    const rows: string[][] = data.values || []
    const today = new Date(); today.setHours(0,0,0,0)

    const eventos = rows.slice(1)
      .map(r => {
        const ciudad = (r[0] || '').toString().trim()
        const fechaRaw = (r[1] || '').toString().trim()
        const direccion = (r[3] || '').toString().trim()
        const hotel     = (r[4] || '').toString().trim()
        if (!ciudad || !fechaRaw) return null
        const fecha = parseFechaSheet(fechaRaw)
        if (!fecha) return null
        const lugar = hotel || direccion || ''
        return { ciudad, fecha, lugar }
      })
      .filter(Boolean)
      // Solo eventos futuros
      .filter(e => new Date(e!.fecha + 'T12:00:00') >= today)
      // Ordenar por fecha
      .sort((a, b) => a!.fecha.localeCompare(b!.fecha))

    return NextResponse.json({ eventos })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
