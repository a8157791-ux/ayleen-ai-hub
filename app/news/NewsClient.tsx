'use client'

import { useState } from 'react'
import HeartButton from '@/components/HeartButton'

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
  // itemId → savedLink DB id
  const [savedMap, setSavedMap] = useState<Map<number, number>>(new Map())

  const filtered = cat ? news.filter(item => item.category === cat) : news

  async function handleToggle(item: any, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const savedId = savedMap.get(item.id)

    // ✅ 낙관적 업데이트 — UI 즉시 반응
    if (savedId) {
      setSavedMap(prev => { const next = new Map(prev); next.delete(item.id); return next })
      fetch(`/api/saved/${savedId}`, { method: 'DELETE' }).catch(() => {
        // 실패 시 롤백
        setSavedMap(prev => new Map(prev).set(item.id, savedId))
      })
    } else {
      // 임시 ID로 즉시 저장 상태 표시
      const tempId = -Date.now()
      setSavedMap(prev => new Map(prev).set(item.id, tempId))
      fetch('/api/saved', {
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
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setSavedMap(prev => new Map(prev).set(item.id, data.id)))
        .catch(() => {
          // 실패 시 롤백
          setSavedMap(prev => { const next = new Map(prev); next.delete(item.id); return next })
        })
    }
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
                  <div style={{ fontSize: 13, color: 'var(--color-text-2)', marginTop: 4, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {displaySummary}
                  </div>
                )}
                <div className="news-footer">
                  <span>{timeAgo(item.createdAt)}</span>
                  {item.source && <span className="news-source">{item.source}</span>}
                  {isNew && <span className="badge badge-new">NEW</span>}
                </div>
              </div>
              <HeartButton isSaved={isSaved} size={17} onClick={(e) => handleToggle(item, e)} />
            </a>
          )
        })}
      </div>
    </>
  )
}