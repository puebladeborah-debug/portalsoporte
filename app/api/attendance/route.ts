import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'data', 'attendance.json')

function readRecords() {
  try {
    const raw = fs.readFileSync(FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeRecords(records: unknown[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(records, null, 2))
}

// GET — return all records (optionally filter by date prefix)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // e.g. "2026-05"
  const records = readRecords()
  const filtered = month ? records.filter((r: { date: string }) => r.date.startsWith(month)) : records
  return NextResponse.json(filtered)
}

// POST — create or update a record
export async function POST(req: NextRequest) {
  const body = await req.json()
  const records = readRecords()
  const idx = records.findIndex((r: { id: string }) => r.id === body.id)
  if (idx >= 0) {
    records[idx] = { ...records[idx], ...body }
  } else {
    records.push(body)
  }
  writeRecords(records)
  return NextResponse.json({ ok: true })
}

// PATCH — confirm status
export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json()
  const records = readRecords()
  const idx = records.findIndex((r: { id: string }) => r.id === id)
  if (idx >= 0) {
    records[idx].status = status
    records[idx].scannedAt = new Date().toISOString()
    writeRecords(records)
    return NextResponse.json({ ok: true, record: records[idx] })
  }
  return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
}
