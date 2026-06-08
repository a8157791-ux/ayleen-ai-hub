// lib/rss.ts — RSS + NewsAPI 조합 무료 AI 뉴스 수집 (v2 고도화)
// 변경사항: RSS 소스 확장(10→15), 피드당 수집 건수 3→5, publishedAt 파싱 강화, Atom 피드 지원

export interface NewsItem {
  title: string
  titleKo?: string
  url: string
  source: string
  summary?: string
  summaryKo?: string
  category?: string
  publishedAt?: string
}

const RSS_FEEDS = [
  // 🤖 LLM / 에이전트
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI Blog', category: 'research' },
  { url: 'https://www.anthropic.com/rss.xml', source: 'Anthropic Blog', category: 'research' },
  { url: 'https://deepmind.google/blog/rss/', source: 'Google DeepMind', category: 'research' },
  { url: 'https://www.therundown.ai/feed', source: 'The Rundown AI', category: 'research' },

  // 🎨 AI 이미지 / 디자인
  { url: 'https://stability.ai/news/rss', source: 'Stability AI', category: 'design' },
  { url: 'https://aiartweekly.com/feed/', source: 'AI Art Weekly', category: 'design' },
  { url: 'https://tympanus.net/codrops/feed', source: 'Codrops', category: 'design' },
  { url: 'https://uxdesign.cc/feed', source: 'UX Collective', category: 'design' },
  { url: 'https://abduzeedo.com/rss.xml', source: 'Abduzeedo', category: 'design' },
  { url: 'https://blog.secondbrush.co.kr/rss/', source: 'Daily Prompt', category: 'design' },
  { url: 'https://designcompass.org/feed', source: 'Design Compass', category: 'design' },

  // 🎬 AI 영상
  { url: 'https://runwayml.com/blog/rss', source: 'Runway Blog', category: 'video' },

  // 💻 AI 코딩 툴
  { url: 'https://github.blog/feed/', source: 'GitHub Blog', category: 'code' },
  { url: 'https://blog.codepen.io/feed', source: 'CodePen Blog', category: 'code' },
  { url: 'https://www.joshwcomeau.com/rss.xml', source: 'Josh W Comeau', category: 'code' },

  // 🌐 HTML/CSS / 웹 표준
  { url: 'https://web.dev/feed.xml', source: 'web.dev', category: 'code' },
  { url: 'https://css-tricks.com/feed/', source: 'CSS-Tricks', category: 'code' },
  { url: 'https://www.smashingmagazine.com/feed/', source: 'Smashing Magazine', category: 'code' },

  // 🏆 웹디자인 레퍼런스
  { url: 'https://www.awwwards.com/rss/', source: 'Awwwards', category: 'design' },

  // 🎨 Figma / 디자인 인사이트
  { url: 'https://www.creativebloq.com/feed', source: 'Creative Bloq', category: 'design' },
  { url: 'https://www.figma.com/blog/feed/', source: 'Figma Blog', category: 'design' },

  // 🎨 Adobe / Behance
  { url: 'https://blog.behance.net/feed', source: 'Behance Blog', category: 'design' },

  // ⚡ 프론트엔드 & 인터랙션
  { url: 'https://frontendfoc.us/rss', source: 'Frontend Focus', category: 'code' },

  // 🤖 AI 디자인
  { url: 'https://www.midjourney.com/updates/rss/', source: 'Midjourney', category: 'design' },

  // 🎨 디자인 시스템
  { url: 'https://m3.material.io/feed.xml', source: 'Material Design', category: 'design' },
]

const ITEMS_PER_FEED = 5

function guessCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.match(/image|photo|stable diffusion|midjourney|dall-e|art|visual|flux|adobe firefly/)) return 'design'
  if (t.match(/video|sora|runway|pika|gen-2|animation|kling|veo/)) return 'video'
  if (t.match(/3d|blender|nerf|point cloud|spatial|gaussian/)) return '3d'
  if (t.match(/code|copilot|cursor|github|programming|developer|coder|devin/)) return 'code'
  if (t.match(/plan|agent|workflow|automat|product|business|rag|langchain/)) return 'plan'
  return 'research'
}

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

async function parseRSSFeed(feed: (typeof RSS_FEEDS)[0]): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'AyleenAIHub/2.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const text = await res.text()
    const items: NewsItem[] = []

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
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        .replace(/<[^>]+>/g, '')
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

// ✅ v18: 번역 프롬프트 개선 — 구체적 인사이트 중심 요약
export async function translateItems(items: NewsItem[]): Promise<NewsItem[]> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('GROQ_API_KEY is missing. Translation skipped.')
    return items
  }

  const targets = items.slice(0, 20)
  const rest = items.slice(20)

  try {
    const prompt = `You are a Korean tech/design journalist. Translate and summarize each article below for Korean readers.

Rules:
- titleKo: Translate naturally into Korean. Keep product names, company names, and proper nouns in English (e.g. "ChatGPT", "Figma", "Runway").
- summaryKo: Write 1-2 Korean sentences capturing the KEY INSIGHT or NEW FACT from the article.
  - Lead with the most important finding, number, or change
  - Be specific: include names, percentages, product names, or concrete details if present
  - NEVER use filler phrases like "~에 대해 알아보겠습니다", "이는 ~에 대해 다룹니다", "~을 확인해 보세요"
  - Write as if briefing a busy colleague: direct and informative
- If the original title is already in Korean (contains 한글), copy it as-is to titleKo and copy summary as-is to summaryKo.
- Return ONLY valid JSON array. No markdown, no code blocks, no explanation.

Input:
${JSON.stringify(targets.map((t, i) => ({ i, title: t.title, summary: t.summary ?? '' })))}

Output format:
[{"i":0,"titleKo":"...","summaryKo":"..."},...]`

    const res = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(60000),
      }
    )

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('Groq API returned error', res.status, res.statusText, body.slice(0, 500))
      return [...targets, ...rest]
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    console.log('Groq raw response:', text.slice(0, 200))
    const clean = text.replace(/```json|```/g, '').trim()

    let parsed: { i: number; titleKo: string; summaryKo: string }[] = []
    try {
      parsed = JSON.parse(clean)
    } catch (err) {
      const jsonMatch = clean.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        console.error('Failed to parse Groq response JSON:', err, clean)
        return [...targets, ...rest]
      }
    }

    for (const p of parsed) {
      if (targets[p.i]) {
        const hasKorean = /[\uAC00-\uD7AF]/.test(targets[p.i].title)
        targets[p.i].titleKo = hasKorean ? targets[p.i].title : p.titleKo
        targets[p.i].summaryKo = hasKorean ? (targets[p.i].summary ?? '') : p.summaryKo
      }
    }
  } catch (e) {
    console.error('Translation failed:', e)
  }

  return [...targets, ...rest]
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

  return unique
}
