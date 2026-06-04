// lib/rss.ts — RSS + NewsAPI 조합 무료 AI 뉴스 수집 (v2 고도화)
// 변경사항: RSS 소스 확장(10→15), 피드당 수집 건수 3→5, publishedAt 파싱 강화, Atom 피드 지원

export interface NewsItem {
  title: string
  titleKo?: string    // ✅ 추가
  url: string
  source: string
  summary?: string
  summaryKo?: string  // ✅ 추가
  category?: string
  publishedAt?: string
}

const RSS_FEEDS = [
  // 🤖 LLM / 에이전트
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI Blog', category: 'research' },
  { url: 'https://www.anthropic.com/rss.xml', source: 'Anthropic Blog', category: 'research' },
  { url: 'https://huggingface.co/blog/feed.xml', source: 'HuggingFace Blog', category: 'code' },
  { url: 'https://deepmind.google/blog/rss/', source: 'Google DeepMind', category: 'research' },
  { url: 'https://feeds.feedburner.com/venturebeat/SZYF', source: 'VentureBeat AI', category: 'research' },
  { url: 'https://www.artificialintelligence-news.com/feed/', source: 'AI News', category: 'research' },
  { url: 'https://www.marktechpost.com/feed/', source: 'MarkTechPost', category: 'research' },
  { url: 'https://www.technologyreview.com/feed/', source: 'MIT Tech Review', category: 'research' },
  { url: 'https://towardsdatascience.com/feed', source: 'Towards Data Science', category: 'research' },
  { url: 'https://www.therundown.ai/feed', source: 'The Rundown AI', category: 'research' },

  // 🎨 AI 이미지 / 디자인
  { url: 'https://stability.ai/news/rss', source: 'Stability AI', category: 'design' },
  { url: 'https://aiartweekly.com/feed/', source: 'AI Art Weekly', category: 'design' },

  // 🎬 AI 영상
  { url: 'https://runwayml.com/blog/rss', source: 'Runway Blog', category: 'video' },

  // 💻 AI 코딩 툴
  { url: 'https://machinelearningmastery.com/feed/', source: 'ML Mastery', category: 'code' },
  { url: 'https://github.blog/feed/', source: 'GitHub Blog', category: 'code' },
  { url: 'https://code.visualstudio.com/feed.xml', source: 'VS Code Blog', category: 'code' },

  // 🎨 Figma / 디자인 툴
  { url: 'https://www.figma.com/blog/feed/', source: 'Figma Blog', category: 'design' },

  // 🌐 HTML/CSS / 웹 표준
  { url: 'https://web.dev/feed.xml', source: 'web.dev', category: 'code' },
  { url: 'https://css-tricks.com/feed/', source: 'CSS-Tricks', category: 'code' },
  { url: 'https://www.smashingmagazine.com/feed/', source: 'Smashing Magazine', category: 'code' },
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
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')  // ← 먼저 디코딩
        .replace(/<[^>]+>/g, '')   // ← 그 다음 태그 제거
        .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '').replace(/&[a-z]+;/g, '')
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

// 번역/요약 — 외부에서도 호출 가능하도록 export
export async function translateItems(items: NewsItem[]): Promise<NewsItem[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) {
    console.error(`GEMINI API key is missing. Translation skipped for ${items.length} item(s).`)
    return items
  }

  const targets = items.slice(0, 20)
  const rest = items.slice(20)

  try {
    const prompt = `아래 AI 뉴스 목록을 JSON 배열로 반환해줘.
각 항목마다 titleKo(제목 한국어 번역)와 summaryKo(한국어 요약 2문장)를 추가해줘.
원문이 이미 한국어면 그대로 써도 돼.
반드시 JSON만 반환하고 다른 텍스트나 마크다운 코드블록은 절대 쓰지 마.

입력:
${JSON.stringify(targets.map((t, i) => ({ i, title: t.title, summary: t.summary ?? '' })))}

출력 형식:
[{"i":0,"titleKo":"...","summaryKo":"..."},...]`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        }),
        signal: AbortSignal.timeout(30000),
      }
    )

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('Gemini API returned error', res.status, res.statusText, body.slice(0, 500))
      return [...targets, ...rest]
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    console.log('Gemini raw response:', text.slice(0, 200))
    const clean = text.replace(/```json|```/g, '').trim()

    let parsed: { i: number; titleKo: string; summaryKo: string }[] = []
    try {
      parsed = JSON.parse(clean)
    } catch (err) {
      const jsonMatch = clean.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        console.error('Failed to parse Gemini response JSON:', err, clean)
        return [...targets, ...rest]
      }
    }

    for (const p of parsed) {
      if (targets[p.i]) {
        targets[p.i].titleKo = p.titleKo
        targets[p.i].summaryKo = p.summaryKo
      }
    }
  } catch (e) {
    console.error('Translation failed:', e)
  }

  return [...targets, ...rest]
}

// fetchAllAINews — 번역 없이 수집만
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
  const unique = all.filter(item => {
    if (!item.url || seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })

  unique.sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0
    if (!a.publishedAt) return 1
    if (!b.publishedAt) return -1
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  return unique  // 번역 없이 반환
}