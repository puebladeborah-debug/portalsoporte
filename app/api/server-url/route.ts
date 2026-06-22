import { NextResponse } from 'next/server'
import os from 'os'

export async function GET() {
  // Get the machine's local network IP
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

  return NextResponse.json({ url, ip, port })
}
