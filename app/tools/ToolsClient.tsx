'use client'
import { useState } from 'react'
import HeartButton from '@/components/HeartButton'

const catLabel: Record<string, string> = {
  image: 'Image', video: 'Video', '3d': '3D', code: 'Code',
  plan: 'Planning', music: 'Music', presentation: 'Presentation',
}
function getFaviconUrl(url?: string | null): string | null {
  if (!url) return null
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch { return null }
}

type Tool = {
  id: number
  name: string
  url: string | null
  category: string | null
  pricing: string | null
  review: string | null
  rating: number | null
}

export default function ToolsClient({ tools }: { tools: Tool[] }) {
  const [cat, setCat] = useState<string | null>(null)
  const [savedMap, setSavedMap] = useState<Map<number, number>>(new Map())

  const filtered = cat ? tools.filter(t => t.category === cat) : tools

  async function handleToggle(tool: Tool, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!tool.url) return

    const savedId = savedMap.get(tool.id)

    if (savedId) {
      setSavedMap(prev => { const next = new Map(prev); next.delete(tool.id); return next })
      fetch(`/api/saved/${savedId}`, { method: 'DELETE' }).catch(() => {
        setSavedMap(prev => new Map(prev).set(tool.id, savedId))
      })
    } else {
      const tempId = -Date.now()
      setSavedMap(prev => new Map(prev).set(tool.id, tempId))
      fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: tool.name,
          url: tool.url,
          linkType: 'tool',
          category: tool.category || null,
          memo: tool.review || null,
        }),
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setSavedMap(prev => new Map(prev).set(tool.id, data.id)))
        .catch(() => {
          setSavedMap(prev => { const next = new Map(prev); next.delete(tool.id); return next })
        })
    }
  }

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Tool Library</div>
        <h1 className="hero-title">툴 <b>라이브러리</b></h1>
        <div className="hero-meta">{tools.length}개의 도구</div>
      </div>

      <div className="tools-trend-banner">
        <span className="tools-trend-label">
          <i className="ti ti-trending-up"></i>
          AI 툴 트렌드
        </span>
        <div className="tools-trend-links">
          <a href="https://www.toolify.ai/Best-trending-AI-Tools" target="_blank" rel="noopener noreferrer" className="tools-trend-link">
            <i className="ti ti-chart-bar"></i>
            Toolify 월간 랭킹
          </a>
          <span className="tools-trend-divider">·</span>
          <a href="https://www.airankings.co" target="_blank" rel="noopener noreferrer" className="tools-trend-link">
            <i className="ti ti-bolt"></i>
            AI Rankings 실사용 순위
          </a>
        </div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button onClick={() => setCat(null)} className={`tab-btn ${!cat ? 'active' : ''}`}>전체</button>
        {Object.entries(catLabel).map(([val, label]) => (
          <button key={val} onClick={() => setCat(val)} className={`tab-btn ${cat === val ? 'active' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="tool-library-grid">
        {filtered.map(tool => {
          const favicon = getFaviconUrl(tool.url)
          const isSaved = savedMap.has(tool.id)
          return (
            <article key={tool.id} className="tool-library-card">
              <div className="tool-card-head">
                {favicon && (
                  <img src={favicon} alt="" width={24} height={24} />
                )}
                <h2>{tool.name}</h2>
                {tool.pricing && (
                  <span className="tool-price">
                    {tool.pricing}
                  </span>
                )}
                {tool.url && (
                  <HeartButton isSaved={isSaved} size={15} onClick={(e) => handleToggle(tool, e)} />
                )}
              </div>
              {tool.review && (
                <p>{tool.review}</p>
              )}
              {tool.rating && (
                <div className="tool-rating" aria-label={`평점 ${tool.rating}점`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i key={i} className={`ti ti-star${i < Math.round(tool.rating!) ? '-filled' : ''}`}
                      data-active={i < Math.round(tool.rating!)} />
                  ))}
                </div>
              )}
              <footer className="tool-card-footer">
                <span>{tool.category ? (catLabel[tool.category] ?? tool.category) : ''}</span>
                {tool.url && (
                  <a href={tool.url} target="_blank" rel="noopener noreferrer">
                    바로가기 <i className="ti ti-external-link" style={{ fontSize: 10 }} />
                  </a>
                )}
              </footer>
            </article>
          )
        })}
        {filtered.length === 0 && (
          <div className="archive-empty">
            아직 등록된 툴이 없습니다.
          </div>
        )}
      </div>
    </>
  )
}
