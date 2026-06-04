import { NextRequest, NextResponse } from 'next/server'

// Vercel Cron: runs daily at 06:00 KST (21:00 UTC)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://ayleen-ai-hub.vercel.app'
  const headers = {
    'Content-Type': 'application/json',
    'x-cron-secret': process.env.CRON_SECRET ?? '',
  }

  // 1. 수집
  const collectRes = await fetch(`${baseUrl}/api/news`, {
    method: 'POST',
    headers,
  })
  const collectData = await collectRes.json()

  // 2. 번역 (수집 완료 후 바로 실행)
  const translateRes = await fetch(`${baseUrl}/api/news/translate`, {
    method: 'POST',
    headers,
  })
  const translateData = await translateRes.json()

  return NextResponse.json({ collect: collectData, translate: translateData })
}