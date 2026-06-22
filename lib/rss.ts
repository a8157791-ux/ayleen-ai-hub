// lib/rss.ts — RSS + YouTube RSS + NewsAPI 조합 AI 뉴스 수집

export interface NewsItem {
  title: string
  titleKo?: string
  url: string
  source: string
  summary?: string
  summaryKo?: string
  category?: string
  publishedAt?: string
  imageUrl?: string
}

// YouTube channel_id 기반 RSS URL 생성
function ytRss(channelId: string) {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
}

// YouTube URL에서 video ID 추출 → 썸네일 URL 생성
function getYouTubeThumbnail(url: string): string | undefined {
  const match = url.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/)
  if (!match) return undefined
  return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
}

// YouTube RSS 여부 확인
function isYouTubeFeed(url: string): boolean {
  return url.includes('youtube.com/feeds')
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
  { url: 'https://toss.tech/rss.xml', source: 'Toss Tech', category: 'design' },
  { url: 'https://medium.com/feed/@mkt_brand_design', source: 'MKT Brand Design', category: 'design' },
  { url:'https://uxplanet.org/feed', source:'UX Planet', category:'design' },

  // 🎬 AI 영상
  { url: 'https://runwayml.com/blog/rss', source: 'Runway Blog', category: 'video' },
  

  // 💻 AI 코딩 툴
  { url: 'https://www.joshwcomeau.com/rss.xml', source: 'Josh W Comeau', category: 'code' },

  // 🌐 HTML/CSS / 웹 표준
  { url: 'https://web.dev/feed.xml', source: 'web.dev', category: 'code' },
  { url: 'https://css-tricks.com/feed/', source: 'CSS-Tricks', category: 'code' },
  { url: 'https://www.smashingmagazine.com/feed/', source: 'Smashing Magazine', category: 'code' },

  // 🏆 웹디자인 레퍼런스
  { url: 'https://www.awwwards.com/rss/', source: 'Awwwards', category: 'design' },

  // 🎨 Figma / 디자인 인사이트
  { url: 'https://www.figma.com/blog/feed/', source: 'Figma Blog', category: 'design' },

  // ⚡ 프론트엔드 & 인터랙션
  { url: 'https://frontendfoc.us/rss', source: 'Frontend Focus', category: 'code' },

  // 🤖 AI 디자인
  { url: 'https://www.midjourney.com/updates/rss/', source: 'Midjourney', category: 'design' },

  // 🎨 디자인 시스템
  { url: 'https://m3.material.io/feed.xml', source: 'Material Design', category: 'design' },

  // 📺 YouTube — 디자인 / AI
  { url: ytRss('UCk_xkR8ORNwtMkaffvYArGA'), source: '디자인하는AI', category: 'design' },
  { url: ytRss('UCjyYouHWnID_L4QaQ6U4voQ'), source: 'NAVER', category: 'design' },
  { url: ytRss('UCeg5g-vWgtgzQ0cYNV2Cyow'), source: 'Toss', category: 'design' },
  { url: ytRss('UClKO7be7O9cUGL94PHnAeOA'), source: 'Google Design', category: 'design' },
  { url: ytRss('UCQsVmhSa4X-G3lHlUtejzLA'), source: 'Figma', category: 'design' },
  { url: ytRss('UCd7KZCoLd9JK_wNuLHQBPOA'), source: '피튜브(Figma Tutor)', category: 'design' },

  // 📺 YouTube — PPT / AI 활용
  { url: ytRss('UCbTbuhbYPJoGCHd93di7IWQ'), source: 'Icanedit', category: 'video' },
  { url: ytRss('UCWmuhz6LZ8u7QNYkITlNcpQ'), source: '피프(PPT Pro)', category: 'plan' },
  { url: ytRss('UCuZTrX3O9yVC1p2vWRqpn8g'), source: '미스터피피티', category: 'plan' },
  { url: ytRss('UCWt2bPyw2ZNweIxpSnB36Ew'), source: '헤이디_PPT디자인', category: 'plan' },
  { url: ytRss('UCowbfOj8HKvTeL6KGIt2waw'), source: '페이퍼로지', category: 'plan' },
  { url: ytRss('UCvh79XDQNnQRns5XSxWnmvw'), source: 'AI아스트라', category: 'research' },
  { url: ytRss('UCjf8cxzqPlayWaJpmtvNC-A'), source: '김이솝의AI가이드', category: 'research' },
  { url: ytRss('UCNkdLSKIRtTtoRNjvkLO1aQ'), source: '동테크', category: 'productivity' },
  
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
  } catch { }
  return undefined
}

// RSS XML에서 og:image 또는 enclosure 이미지 추출
function extractImageFromBlock(block: string): string | undefined {
  // <media:thumbnail> (YouTube RSS 등)
  const mediaThumbnail = block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)?.[1]
  if (mediaThumbnail) return mediaThumbnail

  // <enclosure> 이미지
  const enclosure = block.match(/<enclosure[^>]+url=["']([^"']+\.(?:jpg|jpeg|png|webp))["']/i)?.[1]
  if (enclosure) return enclosure

  // <media:content> 이미지
  const mediaContent = block.match(/<media:content[^>]+url=["']([^"']+)["'][^>]+medium=["']image["']/i)?.[1]
    || block.match(/<media:content[^>]+medium=["']image["'][^>]+url=["']([^"']+)["']/i)?.[1]
  if (mediaContent) return mediaContent

  // description 안의 첫 번째 <img src>
  const imgInDesc = block.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i)?.[1]
  if (imgInDesc) return imgInDesc

  return undefined
}

async function parseRSSFeed(feed: (typeof RSS_FEEDS)[0]): Promise<NewsItem[]> {
  const isYT = isYouTubeFeed(feed.url)

  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'AyleenAIHub/2.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const text = await res.text()
    const items: NewsItem[] = []

    // RSS 2.0 파싱
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

      const title = titleMatch[1].trim()
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '')
      const url = linkMatch[1].trim()
      const rawDesc = descMatch?.[1] ?? ''
      const summary = rawDesc
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '').replace(/&[a-z]+;/g, '')
        .trim().slice(0, 200)

      if (!title || !url || title.length < 5) continue

      // 이미지: YouTube면 video ID로, 아니면 RSS 블록에서 추출
      const imageUrl = isYT
        ? getYouTubeThumbnail(url)
        : extractImageFromBlock(block)

      items.push({
        title, url, source: feed.source,
        summary: summary || undefined,
        category: guessCategory(title) || feed.category,
        publishedAt: parseDate(pubMatch?.[1]?.trim()),
        imageUrl,
      })
      if (items.length >= ITEMS_PER_FEED) break
    }

    // Atom 피드 fallback (<entry>) — YouTube RSS도 Atom 형식
    if (items.length === 0) {
      const entryMatches = Array.from(text.matchAll(/<entry>([\s\S]*?)<\/entry>/g))
      for (const match of entryMatches) {
        const block = match[1]
        const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)
        const linkMatch =
          block.match(/<link[^>]+href=["'](https?:\/\/[^"']+)["']/) ||
          block.match(/<link>(https?:\/\/[^<]+)<\/link>/)
        const summaryMatch =
          block.match(/<media:description>([\s\S]*?)<\/media:description>/) ||
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

        // 이미지: YouTube면 video ID로, 아니면 RSS 블록에서 추출
        const imageUrl = isYT
          ? getYouTubeThumbnail(url)
          : extractImageFromBlock(block)

        items.push({
          title, url, source: feed.source,
          summary: summary || undefined,
          category: guessCategory(title) || feed.category,
          publishedAt: parseDate(pubMatch?.[1]?.trim()),
          imageUrl,
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
    return (data.articles || []).slice(0, 15).map((a: any) => ({
      title: a.title ?? '',
      url: a.url ?? '',
      source: a.source?.name ?? 'NewsAPI',
      summary: a.description?.slice(0, 200),
      category: guessCategory(a.title ?? ''),
      publishedAt: parseDate(a.publishedAt),
      imageUrl: a.urlToImage || undefined,
    })).filter((n: NewsItem) => n.title && n.url)
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

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) {
      console.error('Groq API error', res.status, res.statusText)
      return [...targets, ...rest]
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    const clean = text.replace(/```json|```/g, '').trim()

    let parsed: { i: number; titleKo: string; summaryKo: string }[] = []
    try {
      parsed = JSON.parse(clean)
    } catch {
      const jsonMatch = clean.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
      else return [...targets, ...rest]
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
    fetchTossCareerArticles(),
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


async function fetchTossCareerArticles(): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://toss.im/career/article', {
      headers: { 'User-Agent': 'AyleenAIHub/2.0' },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return []

    const html = await res.text()
    const matches = Array.from(html.matchAll(/href=["'](\/career\/article\/[^"']+)["'][\s\S]*?>([^<]+)</g))

    const items: NewsItem[] = []

    for (const match of matches) {
      const path = match[1]
      const rawTitle = match[2]

      const title = rawTitle
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .trim()

      if (!title || title.length < 5) continue

      const url = `https://toss.im${path}`

      items.push({
        title,
        url,
        source: 'Toss Career',
        category: guessCategory(title) || 'plan',
        publishedAt: undefined,
      })

      if (items.length >= ITEMS_PER_FEED) break
    }

    return items
  } catch {
    return []
  }
}