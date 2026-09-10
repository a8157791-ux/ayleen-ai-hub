'use client'

import { useState } from 'react'
import HeartButton from '@/components/HeartButton'
import EditorialCard from '@/components/EditorialCard'

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
        <div className="archive-results">
          <div className="editorial-grid featured-grid archive-featured-grid">
            {filtered.slice(0, 3).map(ref => <ReferenceCard key={ref.id} refItem={ref} compact={false} saved={savedMap.has(ref.url)} onToggle={handleToggle} />)}
          </div>
          {filtered.length > 3 && <div className="editorial-grid compact-grid separated-grid archive-compact-grid">
            {filtered.slice(3).map(ref => <ReferenceCard key={ref.id} refItem={ref} compact saved={savedMap.has(ref.url)} onToggle={handleToggle} />)}
          </div>}
        </div>
      )}
    </div>
  )
}

function ReferenceCard({ refItem, compact, saved, onToggle }: { refItem: Reference; compact: boolean; saved: boolean; onToggle: (ref: Reference) => void }) {
  return <div className="editorial-card-wrap">
    <EditorialCard compact={compact} href={refItem.url} external title={refItem.title || refItem.url}
      image={refItem.url.includes('instagram.com') ? null : refItem.imageUrl}
      eyebrow={refItem.refType ? (REF_TYPE_LABELS[refItem.refType] || refItem.refType) : refItem.category || 'REFERENCE'}
      description={compact ? null : refItem.desc} date={new Date(refItem.createdAt)} />
    <div className="editorial-card-save"><HeartButton isSaved={saved} size={16} onClick={() => onToggle(refItem)} /></div>
  </div>
}
