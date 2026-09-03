import { NextResponse } from 'next/server'

const API_KEY   = 'AIzaSyAcHd53OR2vn5Wk1o3p_wwmMe3TwLfOk5Y'
const SHEET_ID  = '1ClJSoO4s4vc-a1DQr-cvnBX9gVv_tYm7FS8EWc4FmOE'
const SHEET_GID = 207969892

type SheetProperties = { properties: { sheetId: number; title: string } }

export async function GET() {
  try {
    // La API de Sheets identifica pestañas por nombre, no por gid — hay que
    // ubicar primero el nombre de la pestaña que corresponde a este gid.
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}&fields=sheets.properties`
    const metaRes = await fetch(metaUrl, { cache: 'no-store' })
    const meta = await metaRes.json()
    if (meta.error) return NextResponse.json({ error: meta.error.message }, { status: 400 })

    const hoja = ((meta.sheets || []) as SheetProperties[]).find(s => s.properties.sheetId === SHEET_GID)
    const tab = hoja?.properties?.title
    if (!tab) return NextResponse.json({ error: 'No se encontró la pestaña del sheet' }, { status: 400 })

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent("'" + tab + "'!A:C")}?key=${API_KEY}`
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 400 })

    const rows: string[][] = data.values || []
    const comunidades = rows.slice(1)
      .map(r => {
        const pais = (r[0] || '').toString().trim()
        const ciudad = (r[1] || '').toString().trim()
        const url = (r[2] || '').toString().trim()
        if (!ciudad || !url) return null
        return { pais, ciudad, url }
      })
      .filter(Boolean)

    return NextResponse.json({ comunidades })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
