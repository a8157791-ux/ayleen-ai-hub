import { NextRequest, NextResponse } from 'next/server'

// GET /api/fetch-og?url=https://example.com
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AyleenAIHub/2.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return NextResponse.json({ error: 'fetch failed' }, { status: 400 })

    const html = await res.text()

    // og:image
    const ogImage =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]

    // og:title (제목 자동 완성용)
    const ogTitle =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1] ||
      html.match(/<title>([^<]+)<\/title>/i)?.[1]

    // og:description
    const ogDesc =
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1] ||
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]

    return NextResponse.json({
      imageUrl: ogImage || null,
      title: ogTitle?.trim() || null,
      desc: ogDesc?.trim() || null,
    })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
