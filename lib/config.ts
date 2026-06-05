// lib/config.ts
// 각 폼의 카테고리/툴 기본값 정의

export const DEFAULT_CONFIGS: Record<string, string[]> = {
  study_categories: ['image', 'video', 'prompt', 'research', 'website', 'etc'],
  tool_categories:  ['image', 'video', '3d', 'code', 'plan', 'music', 'presentation'],
  saved_categories: ['youtube', 'instagram', 'article', 'news'],
  ref_categories:   ['website', 'portfolio', 'tool', 'article', 'inspiration'],
  tool_tags:        ['Claude', 'Midjourney', 'ChatGPT', 'Runway', 'Figma', 'Stable Diffusion', 'Sora', 'Gemini'],
}

export async function fetchConfig(key: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/config?key=${key}`, { cache: 'no-store' })
    const data = await res.json()
    if (data.value && Array.isArray(data.value) && data.value.length > 0) {
      return data.value
    }
  } catch {}
  return DEFAULT_CONFIGS[key] ?? []
}

export async function saveConfig(key: string, value: string[]): Promise<void> {
  await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  })
}
