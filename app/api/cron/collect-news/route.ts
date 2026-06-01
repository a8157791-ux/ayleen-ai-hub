import { NextRequest, NextResponse } from 'next/server'

// Vercel Cron: runs daily at 06:00 KST (21:00 UTC)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://ayleen-ai-hub.vercel.app'
  const res = await fetch(`${baseUrl}/api/news`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cron-secret': process.env.CRON_SECRET ?? '',
    },
  })
  const data = await res.json()
  return NextResponse.json(data)
}
