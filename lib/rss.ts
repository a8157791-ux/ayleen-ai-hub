// lib/rss.ts — RSS + NewsAPI 조합 무료 AI 뉴스 수집

export interface NewsItem {
  title: string
  url: string
  source: string
  summary?: string
  category?: string
  publishedAt?: string
}

const RSS_FEEDS = [
  { url: 'https://feeds.feedburner.com/venturebeat/SZYF', source: 'VentureBeat AI', category: 'research' },
  { url: 'https://www.artificialintelligence-news.com/feed/', source: 'AI News', category: 'research' },
  { url: 'https://machinelearningmastery.com/feed/', source: 'ML Mastery', category: 'code' },
  { url: 'https://towardsdatascience.com/feed', source: 'Towards Data Science', category: 'research' },
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI Blog', category: 'research' },
  { url: 'https://huggingface.co/blog/feed.xml', source: 'HuggingFace Blog', category: 'code' },
  { url: 'https://stability.ai/news/rss', source: 'Stability AI', category: 'design' },
  { url: 'https://www.marktechpost.com/feed/', source: 'MarkTechPost', category: 'research' },
  { url: 'https://aiartweekly.com/feed/', source: 'AI Art Weekly', category: 'design' },
  { url: 'https://runwayml.com/blog/rss', source: 'Runway', category: 'video' },
]

function guessCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.match(/image|photo|stable diffusion|midjourney|dall-e|art|visual/)) return 'design'
  if (t.match(/video|sora|runway|pika|gen-2|animation/)) return 'video'
  if (t.match(/3d|blender|nerf|point cloud|spatial/)) return '3d'
  if (t.match(/code|copilot|cursor|github|programming|developer/)) return 'code'
  if (t.match(/plan|agent|workflow|automat|product|business/)) return 'plan'
  return 'research'
}

async function parseRSSFeed(feed: typeof RSS_FEEDS[0]): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'AyleenAIHub/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const text = await res.text()
    const items: NewsItem[] = []

    const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g)
    for (const match of itemMatches) {
      const block = match[1]

      const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)
      const linkMatch =
        block.match(/<link>(?:<!\[CDATA\[)?(https?:\/\/[^\s<]+?)(?:\]\]>)?<\/link>/) ||
        block.match(/<guid[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\s<]+?)(?:\]\]>)?<\/guid>/)
      const descMatch = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)
      const pubMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)

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
        .trim()
        .slice(0, 200)

      if (!title || !url || title.length < 5) continue

      items.push({
        title,
        url,
        source: feed.source,
        summary: summary || undefined,
        category: guessCategory(title) || feed.category,
        publishedAt: pubMatch?.[1]?.trim(),
      })

      if (items.length >= 3) break
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
      `https://newsapi.org/v2/everything?q=artificial+intelligence+OR+AI+model&language=en&pageSize=10&sortBy=publishedAt&apiKey=${apiKey}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return []

    const data = await res.json()
    return (data.articles || [])
      .slice(0, 10)
      .map((a: {
        title?: string; url?: string; source?: { name?: string };
        description?: string; publishedAt?: string
      }) => ({
        title: a.title ?? '',
        url: a.url ?? '',
        source: a.source?.name ?? 'NewsAPI',
        summary: a.description?.slice(0, 200),
        category: guessCategory(a.title ?? ''),
        publishedAt: a.publishedAt,
      }))
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

  const seen = new Set<string>()
  return all.filter(item => {
    if (!item.url || seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}
