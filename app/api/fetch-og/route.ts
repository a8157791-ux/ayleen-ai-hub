import { NextRequest, NextResponse } from 'next/server'

// HTML entity 디코딩 (숫자/이름 엔티티 모두 처리)
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .trim()
}

// GET /api/fetch-og?url=https://example.com
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  // 인스타그램 등 og 메타 크롤링 차단/오염 사이트 → 빈 값 반환 (파비콘 fallback 처리됨)
  const isInstagram = /instagram\.com/i.test(url)
  if (isInstagram) {
    return NextResponse.json({
      imageUrl: null,
      title: null,
      desc: null,
    })
  }

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
      imageUrl: ogImage ? decodeHtmlEntities(ogImage) : null,
      title: ogTitle ? decodeHtmlEntities(ogTitle) : null,
      desc: ogDesc ? decodeHtmlEntities(ogDesc) : null,
    })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
