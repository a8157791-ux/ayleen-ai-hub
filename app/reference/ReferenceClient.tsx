'use client'

import { useState } from 'react'
import HeartButton from '@/components/HeartButton'

const REF_TYPE_LABELS: Record<string, string> = {
  website: 'Website', portfolio: 'Portfolio', tool: 'Tool',
  article: 'Article', inspiration: 'Inspiration',
}

const TABS = [
  { value: 'all', label: '전체' },
  { value: 'website', label: 'Website' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'tool', label: 'Tool' },
  { value: 'article', label: 'Article' },
  { value: 'inspiration', label: 'Inspiration' },
]

type Reference = {
  id: number
  title: string | null
  url: string
  refType: string | null
  category: string | null
  desc: string | null
  faviconUrl: string | null
  imageUrl: string | null
  createdAt: Date | string
}

export default function ReferenceClient({
  refs,
  savedUrls,
}: {
  refs: Reference[]
  savedUrls: Record<string, number>
}) {
  const [activeTab, setActiveTab] = useState('all')
  const [savedMap, setSavedMap] = useState<Map<string, number>>(
    () => new Map(Object.entries(savedUrls))
  )
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())

  const filtered = activeTab === 'all' ? refs : refs.filter(r => r.refType === activeTab)

  async function handleToggle(ref: Reference) {
    if (pendingIds.has(ref.id)) return
    setPendingIds(prev => new Set(prev).add(ref.id))
    const savedId = savedMap.get(ref.url)
    try {
      if (savedId) {
        setSavedMap(prev => { const next = new Map(prev); next.delete(ref.url); return next })
        const res = await fetch(`/api/saved/${savedId}`, { method: 'DELETE' })
        if (!res.ok) setSavedMap(prev => new Map(prev).set(ref.url, savedId))
      } else {
        const tempId = -ref.id
        setSavedMap(prev => new Map(prev).set(ref.url, tempId))
        const res = await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: ref.title, url: ref.url,
            linkType: 'keep', category: ref.refType, memo: ref.desc || null,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setSavedMap(prev => new Map(prev).set(ref.url, data.id))
        } else {
          setSavedMap(prev => { const next = new Map(prev); next.delete(ref.url); return next })
        }
      }
    } finally {
      setPendingIds(prev => { const next = new Set(prev); next.delete(ref.id); return next })
    }
  }

  return (
    <div>
      <div className="page-hero">
        <div className="hero-eyebrow">Main</div>
        <h1 className="hero-title">레퍼런스 <b>보드</b></h1>
        <div className="hero-meta">총 {refs.length}개</div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {TABS.map(tab => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={`tab-btn${activeTab === tab.value ? ' active' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '24px 0' }}>
          레퍼런스가 없어요.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(ref => (
            <div key={ref.id} style={{
              background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
              borderRadius: 10, overflow: 'hidden',
              display: 'flex', flexDirection: 'row', alignItems: 'stretch',
            }}>
              {/* 좌측 썸네일 */}
              {ref.imageUrl && !ref.url.includes('instagram.com') && (
                <a href={ref.url} target="_blank" rel="noopener noreferrer"
                  style={{ flexShrink: 0, display: 'block', width: 120 }}>
                  <img
                    src={ref.imageUrl}
                    alt=""
                    style={{ width: 120, height: '100%', minHeight: 80, objectFit: 'cover', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
                  />
                </a>
              )}

              {/* 우측 본문 */}
              <div style={{ flex: 1, minWidth: 0, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  {(!ref.imageUrl || ref.url.includes('instagram.com')) && ref.faviconUrl && (
                    <img src={ref.faviconUrl} width={18} height={18} alt=""
                      style={{ borderRadius: 4, flexShrink: 0, marginTop: 2 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: 14, color: 'var(--color-text)', fontWeight: 500,
                        textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {ref.title || ref.url}
                      </a>
                      {ref.refType && (
                        <span style={{
                          fontSize: 10, fontFamily: 'var(--font-mono)',
                          padding: '2px 7px', borderRadius: 4,
                          background: 'var(--color-bg-3)', color: 'var(--color-text-3)',
                          whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                          {REF_TYPE_LABELS[ref.refType] || ref.refType}
                        </span>
                      )}
                      {ref.category && (
                        <span style={{
                          fontSize: 10, fontFamily: 'var(--font-mono)',
                          padding: '2px 7px', borderRadius: 4,
                          background: 'rgba(59,130,246,0.1)', color: 'var(--color-blue)',
                          whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                          {ref.category}
                        </span>
                      )}
                    </div>
                    {ref.desc && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginBottom: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ref.desc}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{
                        fontSize: 11, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {ref.url}
                      </span>
                      <HeartButton
                        isSaved={savedMap.has(ref.url)}
                        size={16}
                        onClick={() => handleToggle(ref)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}