'use client'

import { useState } from 'react'
import HeartButton from '@/components/HeartButton'
import Pagination from '@/components/Pagination'
import EditorialCard from '@/components/EditorialCard'

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

export default function NewsClient({
  initialNews,
  total,
  pageSize,
}: {
  initialNews: any[]
  total: number
  pageSize: number
}) {
  const [cat, setCat] = useState<string | null>(null)
  const [savedMap, setSavedMap] = useState<Map<number, number>>(new Map())

  const [news, setNews] = useState<any[]>(initialNews)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  // 카테고리 필터 시에는 전체 건수가 달라지므로 별도 total 관리
  const [listTotal, setListTotal] = useState(total)

  const totalPages = Math.max(1, Math.ceil(listTotal / pageSize))

  async function loadPage(nextPage: number, nextCat: string | null) {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(pageSize),
        sortBy: 'publishedAt',
      })
      if (nextCat) params.set('cat', nextCat)

      const res = await fetch(`/api/news?${params.toString()}`)
      const data = await res.json()
      setNews(data.items ?? [])
      setListTotal(data.total ?? 0)
      setPage(data.page ?? nextPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      // 실패 시 조용히 무시 — 기존 목록 유지
    } finally {
      setLoading(false)
    }
  }

  function handleCat(nextCat: string | null) {
    setCat(nextCat)
    loadPage(1, nextCat)
  }

  function handlePage(p: number) {
    if (p < 1 || p > totalPages || p === page) return
    loadPage(p, cat)
  }

  async function handleToggle(item: any, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const savedId = savedMap.get(item.id)

    if (savedId) {
      setSavedMap(prev => { const next = new Map(prev); next.delete(item.id); return next })
      fetch(`/api/saved/${savedId}`, { method: 'DELETE' }).catch(() => {
        setSavedMap(prev => new Map(prev).set(item.id, savedId))
      })
    } else {
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
          setSavedMap(prev => { const next = new Map(prev); next.delete(item.id); return next })
        })
    }
  }

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Trend Board</div>
        <h1 className="hero-title">트렌드 <b>보드</b></h1>
        <div className="hero-meta">총 {listTotal}건 수집됨</div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button onClick={() => handleCat(null)} className={`tab-btn ${!cat ? 'active' : ''}`}>전체</button>
        {Object.entries(catLabel).map(([val, label]) => (
          <button key={val} onClick={() => handleCat(val)} className={`tab-btn ${cat === val ? 'active' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="archive-results" style={{ opacity: loading ? 0.48 : 1 }} aria-busy={loading}>
        {news.length === 0 && (
          <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '24px 0' }}>
            아직 수집된 뉴스가 없습니다. 관리자 패널에서 뉴스를 수집해보세요.
          </div>
        )}
        {news.length > 0 && <>
          <div className="editorial-grid featured-grid archive-featured-grid">
          {news.slice(0, 3).map((item, i) => {
          const isNew = Date.now() - new Date(item.createdAt).getTime() < 86400000
          const displayTitle = item.titleKo || item.title
          const displaySummary = item.summaryKo || item.summary
          const isSaved = savedMap.has(item.id)
          return <div className="editorial-card-wrap" key={item.id}>
            <EditorialCard href={item.url} external title={displayTitle} image={item.imageUrl}
              eyebrow={catLabel[item.category] ?? item.source ?? (isNew ? 'NEW' : 'INSIGHT')}
              description={displaySummary} date={new Date(item.publishedAt || item.createdAt)} priority={i < 3} />
            <div className="editorial-card-save"><HeartButton isSaved={isSaved} size={17} onClick={(e) => handleToggle(item, e)} /></div>
          </div>
        })}
          </div>
          {news.length > 3 && <div className="editorial-grid compact-grid separated-grid archive-compact-grid">
            {news.slice(3).map(item => {
              const displayTitle = item.titleKo || item.title
              const isSaved = savedMap.has(item.id)
              return <div className="editorial-card-wrap" key={item.id}>
                <EditorialCard compact href={item.url} external title={displayTitle} image={item.imageUrl}
                  eyebrow={catLabel[item.category] ?? item.source ?? 'INSIGHT'} date={new Date(item.publishedAt || item.createdAt)} />
                <div className="editorial-card-save"><HeartButton isSaved={isSaved} size={16} onClick={(e) => handleToggle(item, e)} /></div>
              </div>
            })}
          </div>}
        </>}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={handlePage} />
    </>
  )
}
