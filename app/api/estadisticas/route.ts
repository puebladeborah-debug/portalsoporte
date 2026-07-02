import { NextResponse } from 'next/server'

// ── Mismos IDs y tabs que el CRM ──────────────────────────────────────────────
const API_KEY   = 'AIzaSyAcHd53OR2vn5Wk1o3p_wwmMe3TwLfOk5Y'
const SHEET1    = '1IkFQJW8kMcwQ9hwl0ixalQFUyribvDYDahbrBOFQf_g'
const SHEET2    = '11TZWXznYDiu4ETuFNBN9_31pPPPrFy8bAzxdDqsihhA'
const SKOOL_TABS = ['WB MX JS','WB MX MDL','WB LATAM','WB USA','PRESENCIALES','BLACKS','BGI','MAS','MBA','BECAS','CLUB SINERGETICO LITE','RENOVACIONES','MEMBRESIA EXPIRADA','REVOCADOS']

// ── Fetch Google Sheets ───────────────────────────────────────────────────────
async function fetchRange(sheetId: string, range: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${API_KEY}`
  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  if (data.error) {
    if (data.error.code === 404 || data.error.code === 400) return []
    throw new Error(data.error.message)
  }
  return data.values || []
}

// ── parseDate idéntico al CRM ─────────────────────────────────────────────────
// Soporta: serial Sheets, MM/DD/YY con hora, YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
function parseDate(s: string): Date | null {
  if (!s) return null
  s = s.toString().trim()

  // Serial numérico de Google Sheets
  const serial = parseInt(s)
  if (!isNaN(serial) && serial > 40000 && serial < 60000) {
    const d = new Date(1899, 11, 30)
    d.setDate(d.getDate() + serial)
    return d
  }

  let m: RegExpMatchArray | null

  // MM/DD/YY HH:MM (formato USA con hora — el más común en este sheet)
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+\d{1,2}:\d{2}/)
  if (m) {
    let y = parseInt(m[3]); if (y < 100) y += 2000
    if (parseInt(m[1]) <= 12 && parseInt(m[2]) <= 31)
      return new Date(y, parseInt(m[1]) - 1, parseInt(m[2]))
  }

  // YYYY-MM-DD
  m = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/)
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]))

  // MM/DD/YYYY o DD/MM/YYYY (sin hora)
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (m) {
    let y = parseInt(m[3]); if (y < 100) y += 2000
    const a = parseInt(m[1]), b = parseInt(m[2])
    if (a > 12) return new Date(y, b - 1, a)   // DD/MM forzado (día > 12)
    return new Date(y, a - 1, b)                // MM/DD (formato USA)
  }

  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

// ── parseSkoolDate igual al CRM ───────────────────────────────────────────────
// Desambigua fechas cuando ambos números ≤12 usando la inscripción y duración
function parseSkoolDate(venceStr: string, inscripcionStr: string, memTipo: string): Date | null {
  if (!venceStr) return null
  const dV = parseDate(venceStr)
  if (!dV) return null

  const m = venceStr.toString().trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (!m) return dV

  const a = parseInt(m[1]), b = parseInt(m[2])
  if (a > 12 || b > 12) return dV // ya desambiguada

  let y = parseInt(m[3]); if (y < 100) y += 2000
  const dUSA = new Date(y, a - 1, b)
  const dMX  = new Date(y, b - 1, a)
  const dIns = inscripcionStr ? parseDate(inscripcionStr) : null

  if (dIns) {
    const usaOk = dUSA >= dIns, mxOk = dMX >= dIns
    if (usaOk && !mxOk) return dUSA
    if (mxOk && !usaOk) return dMX
    if (memTipo) {
      const t = memTipo.toLowerCase()
      let meses = 0
      if (t.includes('12') || t.includes('1a') || t.includes('1 a')) meses = 12
      else if (t.includes('6')) meses = 6
      else if (t.includes('3')) meses = 3
      if (meses) {
        const dEsp = new Date(dIns.getTime())
        dEsp.setMonth(dEsp.getMonth() + meses)
        return Math.abs(dUSA.getTime() - dEsp.getTime()) <= Math.abs(dMX.getTime() - dEsp.getTime()) ? dUSA : dMX
      }
    }
  }
  return dUSA
}

function daysUntil(d: Date, today: Date): number {
  return Math.ceil((d.getTime() - today.getTime()) / 86_400_000)
}

function gv(row: string[], idx: number): string {
  return (row[idx] || '').toString().trim()
}

// ── Handler ────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const thisY = today.getFullYear()
    const thisM = today.getMonth()

    // ── 1. SHEET1: hoja principal CRM ───────────────────────────────────────
    const rows1 = await fetchRange(SHEET1, 'A:Z')
    if (rows1.length < 2) return NextResponse.json({ error: 'Sin datos en Sheet1' }, { status: 400 })

    // Columnas verificadas del CRM (mismas posiciones que SCHEMA_CRM)
    // A=0 B=1 C=2 D=3 E=4 F=5 G=6 H=7 I=8 J=9 K=10 ...
    const C = {
      nombre:    1,   // B
      correo:    2,   // C
      pais:      3,   // D
      inscripcion: 5, // F — MM/DD/YY (primer número = mes, formato USA)
      evento:    7,   // H
      acceso:    8,   // I — 'Si', 'En automático', 'No', 'Revocado'…
      memTipo:   9,   // J — Tipo de Membresía Skool (cualquier valor = activo Skool en Sheet1)
      memVence:  10,  // K — Vencimiento Skool (Sheet1)
    }

    // Carga todos los contactos
    type Contact = {
      correo: string; nombre: string; pais: string
      inscripcion: string; evento: string; acceso: string
      memTipo: string; memVence: string
      skMem: string; skVence: string; skHoja: string
    }

    const all: Contact[] = rows1.slice(1)
      .filter(r => r[C.nombre]?.trim())
      .map(r => ({
        correo:      gv(r, C.correo).toLowerCase(),
        nombre:      gv(r, C.nombre),
        pais:        gv(r, C.pais),
        inscripcion: gv(r, C.inscripcion),
        evento:      gv(r, C.evento),
        acceso:      gv(r, C.acceso),
        memTipo:     gv(r, C.memTipo),
        memVence:    gv(r, C.memVence),
        skMem: '', skVence: '', skHoja: '',
      }))

    // ── 2. SHEET2: todas las pestañas Skool ─────────────────────────────────
    // Columnas Skool: correo=col3, mem=col8, vence=col10, estado=col12
    const skoolMap: Record<string, { mem: string; vence: string; hoja: string }> = {}

    // Fetch en lotes de 3 para no saturar quota
    for (let i = 0; i < SKOOL_TABS.length; i += 3) {
      const batch = SKOOL_TABS.slice(i, i + 3)
      await Promise.all(batch.map(async (tab) => {
        try {
          const data = await fetchRange(SHEET2, `'${tab}'!A:P`)
          if (data.length < 2) return
          data.slice(1).forEach(r => {
            const correo = (r[3] || '').toString().toLowerCase().trim()
            if (!correo || !correo.includes('@')) return
            if (!skoolMap[correo]) {
              skoolMap[correo] = {
                mem:   (r[8]  || '').toString().trim(),
                vence: (r[10] || '').toString().trim(),
                hoja:  tab,
              }
            }
          })
        } catch { /* pestaña no encontrada — normal */ }
      }))
      // Pequeña pausa entre lotes
      if (i + 3 < SKOOL_TABS.length) await new Promise(r => setTimeout(r, 250))
    }

    // ── 3. Merge Skool en contactos ──────────────────────────────────────────
    all.forEach(c => {
      const sk = skoolMap[c.correo]
      if (sk) { c.skMem = sk.mem; c.skVence = sk.vence; c.skHoja = sk.hoja }
    })

    // ── 4. Calcular estadísticas — misma lógica que updateStats() del CRM ───
    let total = 0, mexico = 0, usa = 0, latam = 0
    let conAcceso = 0, sinAcceso = 0
    let skoolActivo = 0, skoolVencido = 0
    let skool3 = 0, skool6 = 0, skool12 = 0
    let proxVencer = 0, vencidos = 0
    let renovados = 0, nuevosEsteMes = 0
    let bgi = 0, mas = 0, black = 0
    let conSkool = 0   // tienen Skool (activos + vencidos, excluye los sin registro)

    for (const c of all) {
      total++

      // País
      const pais = c.pais.toLowerCase()
      if (pais.includes('méx') || pais.includes('mex')) mexico++
      else if (pais.includes('estados unidos') || pais.includes('+1')) usa++
      else if (pais.trim()) latam++

      // Acceso — misma condición que el CRM
      const ac = c.acceso.trim()
      if (ac === 'Si' || ac === 'Sí' || ac === 'En automático' || ac.toLowerCase().startsWith('renov'))
        conAcceso++
      else
        sinAcceso++

      // Renovados — col H (evento) contiene "renovacion" en cualquier combinación de
      // mayúsculas/minúsculas y con o sin acento (RENOVACIÓN, renovacion, Renovación…)
      if (c.evento.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().includes('renovacion')) renovados++

      // BGI, MAS y BLACK — col H (EVENTO) contiene esa palabra en mayúsculas
      if (c.evento.includes('BGI'))   bgi++
      if (c.evento.includes('MAS'))   mas++
      if (c.evento.includes('BLACK')) black++

      // Skool — usa la misma lógica parseSkoolDate del CRM
      const vRef  = c.memVence || c.skVence
      const mRef  = c.memTipo  || c.skMem
      if (vRef) {
        conSkool++ // tiene algún registro Skool (activo o vencido)
        const d = parseSkoolDate(vRef, c.inscripcion, mRef)
        const days = d ? daysUntil(d, today) : null
        if (days !== null) {
          if (days >= 0)  skoolActivo++
          else            skoolVencido++
          if (days < 0)       vencidos++
          else if (days <= 30) proxVencer++
        } else {
          skoolVencido++ // tiene fecha pero no parseable → sin acceso Skool
        }
      } else {
        skoolVencido++ // sin fecha registrada → no tiene Skool
      }

      // Duración Skool
      const mem = mRef.toLowerCase()
      if (mem.includes('12') || mem.includes('1a') || mem.includes('1 a')) skool12++
      else if (mem.includes('6')) skool6++
      else if (mem.includes('3')) skool3++

      // Nuevos este mes — col F (inscripcion) MM/DD/YY formato USA
      const ins = parseDate(c.inscripcion)
      if (ins && ins.getFullYear() === thisY && ins.getMonth() === thisM) nuevosEsteMes++
    }

    return NextResponse.json({
      total, mexico, usa, latam,
      conAcceso, sinAcceso,
      skoolActivo, skoolVencido, skool3, skool6, skool12,
      proxVencer, vencidos,
      renovados, nuevosEsteMes,
      bgi, mas, black,
      conSkool,
      actualizadoEn: new Date().toISOString(),
    })

  } catch (e) {
    console.error('estadisticas:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
