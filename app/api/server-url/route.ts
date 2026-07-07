import { NextResponse } from 'next/server'
import os from 'os'

export async function GET() {
  // En Vercel (producción) usar siempre la URL pública — VERCEL_URL es automática
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    const url = `https://${vercelUrl}`
    return NextResponse.json({ url })
  }

  // En desarrollo local: usar la IP de red para que funcione escaneando en el mismo WiFi
  const nets = os.networkInterfaces()
  let ip = 'localhost'
  for (const name of Object.keys(nets)) {
    const ifaces = nets[name]
    if (!ifaces) continue
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ip = iface.address
        break
      }
    }
  }
  const port = process.env.PORT || '3000'
  const url = `http://${ip}:${port}`
  return NextResponse.json({ url })
}
