'use client'

import { useState } from 'react'

const catLabel: Record<string, string> = {
  design: 'Design', code: 'Coding', video: 'Video',
  '3d': '3D', plan: 'Planning', research: 'Research',
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return '방금 전'
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

export default function NewsClient({ news, total }: { news: any[], total: number }) {
  const [cat, setCat] = useState<string | null>(null)
  const [savedMap, setSavedMap] = useState<Map<number, number>>(new Map())
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const filtered = cat ? news.filter(item => item.category === cat) : news

  async function handleToggle(item: any, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loadingId === item.id) return
    setLoadingId(item.id)
    try {
      const savedId = savedMap.get(item.id)
      if (savedId) {
        const res = await fetch(`/api/saved/${savedId}`, { method: 'DELETE' })
        if (res.ok) {
          setSavedMap(prev => { const next = new Map(prev); next.delete(item.id); return next })
        }
      } else {
        const res = await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.titleKo || item.title,
            url: item.url,
            linkType: 'news',
            category: item.category || null,
            memo: null,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setSavedMap(prev => new Map(prev).set(item.id, data.id))
        }
      }
    } catch {}
    finally { setLoadingId(null) }
  }

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Trend Board</div>
        <h1 className="hero-title">트렌드 <b>보드</b></h1>
        <div className="hero-meta">총 {total}건 수집됨</div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button onClick={() => setCat(null)} className={`tab-btn ${!cat ? 'active' : ''}`}>전체</button>
        {Object.entries(catLabel).map(([val, label]) => (
          <button key={val} onClick={() => setCat(val)} className={`tab-btn ${cat === val ? 'active' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="news-list">
        {filtered.length === 0 && (
          <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '24px 0' }}>
            아직 수집된 뉴스가 없습니다. 관리자 패널에서 뉴스를 수집해보세요.
          </div>
        )}
        {filtered.map((item, i) => {
          const isNew = Date.now() - new Date(item.createdAt).getTime() < 86400000
          const displayTitle = item.titleKo || item.title
          const displaySummary = item.summaryKo || item.summary
          const isSaved = savedMap.has(item.id)
          const isLoading = loadingId === item.id
          return (
            <a key={item.id} href={item.url} className="news-item" target="_blank" rel="noopener noreferrer">
              <span className="news-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="news-body">
                {item.category && (
                  <div className={`news-cat cat-${item.category}`}>
                    {catLabel[item.category] ?? item.category}
                  </div>
                )}
                <div className="news-title">{displayTitle}</div>
                {item.titleKo && item.titleKo !== item.title && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {item.title}
                  </div>
                )}
                {displaySummary && (
                  <div style={{ fontSize: 13, color: 'var(--color-text-2)', marginTop: 4, lineHeight: 1.5 }}>
                    {displaySummary}
                  </div>
                )}
                <div className="news-footer">
                  <span>{timeAgo(item.createdAt)}</span>
                  {item.source && <span className="news-source">{item.source}</span>}
                  {isNew && <span className="badge badge-new">NEW</span>}
                </div>
              </div>
              <button
                onClick={(e) => handleToggle(item, e)}
                disabled={isLoading}
                title={isSaved ? '저장 취소' : '저장한 글에 추가'}
                style={{
                  flexShrink: 0, alignSelf: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: '50%',
                  border: 'none', background: 'transparent',
                  color: isSaved ? '#f472b6' : 'var(--color-text-3)',
                  cursor: isLoading ? 'default' : 'pointer',
                  transition: 'color 0.15s, transform 0.15s',
                  transform: isLoading ? 'scale(0.85)' : 'scale(1)',
                }}
              >
                <i className={`ti ${isSaved ? 'ti-heart-filled' : 'ti-heart'}`} style={{ fontSize: 17 }} />
              </button>
            </a>
          )
        })}
      </div>
    </>
  )
}
