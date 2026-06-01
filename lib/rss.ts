// lib/rss.ts — RSS + NewsAPI 조합 무료 AI 뉴스 수집 (v2 고도화)
// 변경사항: RSS 소스 확장(10→15), 피드당 수집 건수 3→5, publishedAt 파싱 강화, Atom 피드 지원

export interface NewsItem {
  title: string
  url: string
  source: string
  summary?: string
  category?: string
  publishedAt?: string
}

const RSS_FEEDS = [
  // --- Research / General ---
  { url: 'https://feeds.feedburner.com/venturebeat/SZYF', source: 'VentureBeat AI', category: 'research' },
  { url: 'https://www.artificialintelligence-news.com/feed/', source: 'AI News', category: 'research' },
  { url: 'https://www.marktechpost.com/feed/', source: 'MarkTechPost', category: 'research' },
  { url: 'https://towardsdatascience.com/feed', source: 'Towards Data Science', category: 'research' },
  { url: 'https://www.technologyreview.com/feed/', source: 'MIT Tech Review', category: 'research' },
  // --- Code / Dev ---
  { url: 'https://machinelearningmastery.com/feed/', source: 'ML Mastery', category: 'code' },
  { url: 'https://huggingface.co/blog/feed.xml', source: 'HuggingFace Blog', category: 'code' },
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI Blog', category: 'research' },
  { url: 'https://deepmind.google/blog/rss/', source: 'Google DeepMind', category: 'research' },
  // --- Design / Image ---
  { url: 'https://stability.ai/news/rss', source: 'Stability AI', category: 'design' },
  { url: 'https://aiartweekly.com/feed/', source: 'AI Art Weekly', category: 'design' },
  // --- Video ---
  { url: 'https://runwayml.com/blog/rss', source: 'Runway', category: 'video' },
  // --- Tools / Product ---
  { url: 'https://www.therundown.ai/feed', source: 'The Rundown AI', category: 'research' },
  { url: 'https://newsletter.theaiedge.io/feed', source: 'The AI Edge', category: 'research' },
  { url: 'https://www.aiweekly.co/feed', source: 'AI Weekly', category: 'research' },
]

const ITEMS_PER_FEED = 5  // 피드당 최대 수집 건수 (v1: 3 → v2: 5)

function guessCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.match(/image|photo|stable diffusion|midjourney|dall-e|art|visual|flux|adobe firefly/)) return 'design'
  if (t.match(/video|sora|runway|pika|gen-2|animation|kling|veo/)) return 'video'
  if (t.match(/3d|blender|nerf|point cloud|spatial|gaussian/)) return '3d'
  if (t.match(/code|copilot|cursor|github|programming|developer|coder|devin/)) return 'code'
  if (t.match(/plan|agent|workflow|automat|product|business|rag|langchain/)) return 'plan'
  return 'research'
}

// RFC 822 / ISO 8601 모두 파싱해서 ISO 문자열로 통일
function parseDate(raw?: string): string | undefined {
  if (!raw) return undefined
  try {
    const d = new Date(raw)
    if (!isNaN(d.getTime())) return d.toISOString()
  } catch {
    // ignore
  }
  return undefined
}

// RSS 2.0 파싱
async function parseRSSFeed(feed: (typeof RSS_FEEDS)[0]): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'AyleenAIHub/2.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const text = await res.text()
    const items: NewsItem[] = []

    // RSS 2.0: <item> 블록
    const itemMatches = Array.from(text.matchAll(/<item>([\s\S]*?)<\/item>/g))

    for (const match of itemMatches) {
      const block = match[1]

      const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)
      const linkMatch =
        block.match(/<link>(?:<!\[CDATA\[)?(https?:\/\/[^\s<]+?)(?:\]\]>)?<\/link>/) ||
        block.match(/<guid[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\s<]+?)(?:\]\]>)?<\/guid>/)
      const descMatch = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)
      const pubMatch =
        block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) ||
        block.match(/<dc:date>([\s\S]*?)<\/dc:date>/)

      if (!titleMatch || !linkMatch) continue

      const title = titleMatch[1]
        .trim()
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#\d+;/g, '')
      const url = linkMatch[1].trim()

      const rawDesc = descMatch?.[1] ?? ''
      const summary = rawDesc
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .trim()
        .slice(0, 200)

      if (!title || !url || title.length < 5) continue

      items.push({
        title,
        url,
        source: feed.source,
        summary: summary || undefined,
        category: guessCategory(title) || feed.category,
        publishedAt: parseDate(pubMatch?.[1]?.trim()),
      })

      if (items.length >= ITEMS_PER_FEED) break
    }

    // Atom 피드 fallback (<entry> 블록)
    if (items.length === 0) {
      const entryMatches = Array.from(text.matchAll(/<entry>([\s\S]*?)<\/entry>/g))
      for (const match of entryMatches) {
        const block = match[1]

        const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)
        const linkMatch = block.match(/<link[^>]+href=["'](https?:\/\/[^"']+)["']/)
        const summaryMatch =
          block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) ||
          block.match(/<content[^>]*>([\s\S]*?)<\/content>/)
        const pubMatch =
          block.match(/<published>([\s\S]*?)<\/published>/) ||
          block.match(/<updated>([\s\S]*?)<\/updated>/)

        if (!titleMatch || !linkMatch) continue

        const title = titleMatch[1].trim().replace(/&amp;/g, '&')
        const url = linkMatch[1].trim()
        const rawSummary = summaryMatch?.[1] ?? ''
        const summary = rawSummary.replace(/<[^>]+>/g, '').trim().slice(0, 200)

        if (!title || !url || title.length < 5) continue

        items.push({
          title,
          url,
          source: feed.source,
          summary: summary || undefined,
          category: guessCategory(title) || feed.category,
          publishedAt: parseDate(pubMatch?.[1]?.trim()),
        })

        if (items.length >= ITEMS_PER_FEED) break
      }
    }

    return items
  } catch {
    return []
  }
}

async function fetchFromNewsAPI(): Promise<NewsItem[]> {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=artificial+intelligence+OR+AI+model+OR+LLM&language=en&pageSize=15&sortBy=publishedAt&apiKey=${apiKey}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return []

    const data = await res.json()
    return (data.articles || [])
      .slice(0, 15)
      .map(
        (a: {
          title?: string
          url?: string
          source?: { name?: string }
          description?: string
          publishedAt?: string
        }) => ({
          title: a.title ?? '',
          url: a.url ?? '',
          source: a.source?.name ?? 'NewsAPI',
          summary: a.description?.slice(0, 200),
          category: guessCategory(a.title ?? ''),
          publishedAt: parseDate(a.publishedAt),
        })
      )
      .filter((n: NewsItem) => n.title && n.url)
  } catch {
    return []
  }
}

export async function fetchAllAINews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled([
    ...RSS_FEEDS.map(f => parseRSSFeed(f)),
    fetchFromNewsAPI(),
  ])

  const all: NewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value)
  }

  // URL 기준 중복 제거
  const seen = new Set<string>()
  const unique = all.filter(item => {
    if (!item.url || seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })

  // publishedAt 기준 최신순 정렬 (없는 항목은 뒤로)
  unique.sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0
    if (!a.publishedAt) return 1
    if (!b.publishedAt) return -1
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  return unique
}