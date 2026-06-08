'use client'

import { useState } from 'react'
import HeartButton from '@/components/HeartButton'

const LINK_TYPE_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  article: 'Article',
  news: 'News',
  keep: 'Keep',
  tool: 'Tool',
  reference: 'Reference',
}

type SavedLink = {
  id: number
  title: string | null
  url: string
  linkType: string | null
  category: string | null
  memo: string | null
  createdAt: Date | string
}

export default function SavedClient({ links: initialLinks }: { links: SavedLink[] }) {
  const [links, setLinks] = useState(initialLinks)
  const [activeTab, setActiveTab] = useState('all')

  // 실제 존재하는 linkType 기반으로 동적 탭 생성
  const existingTypes = Array.from(new Set(initialLinks.map(l => l.linkType).filter(Boolean))) as string[]

  const tabs = [
    { value: 'all', label: '전체' },
    ...existingTypes.map(type => ({
      value: type,
      label: LINK_TYPE_LABELS[type] || type,
    })),
  ]

  const filtered = activeTab === 'all' ? links : links.filter(l => l.linkType === activeTab)

  function count(type: string) {
    return type === 'all' ? links.length : links.filter(l => l.linkType === type).length
  }

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString('ko-KR')
  }

  async function handleRemove(link: SavedLink, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    // 낙관적 업데이트
    setLinks(prev => prev.filter(l => l.id !== link.id))
    fetch(`/api/saved/${link.id}`, { method: 'DELETE' }).catch(() => {
      // 실패 시 롤백
      setLinks(prev => [...prev, link].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    })
  }

  return (
    <div>
      <div className="page-hero">
        <div className="hero-eyebrow">My</div>
        <h1 className="hero-title">저장한 <b>글</b></h1>
        <div className="hero-meta">총 {links.length}개 저장됨</div>
      </div>

      {/* linkType 기반 동적 탭 */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {tabs.map(tab => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={`tab-btn${activeTab === tab.value ? ' active' : ''}`}>
            {tab.label}
            {count(tab.value) > 0 && (
              <span style={{
                marginLeft: 5, fontSize: 10, padding: '1px 5px', borderRadius: 10,
                background: activeTab === tab.value ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-3)',
                fontFamily: 'var(--font-mono)',
              }}>
                {count(tab.value)}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '40px 0', textAlign: 'center' }}>
          저장된 항목이 없어요.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
              className="saved-link-item">
              {/* 채워진 하트 — 클릭하면 삭제 */}
              <HeartButton
                isSaved={true}
                size={16}
                onClick={(e) => handleRemove(link, e)}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, color: 'var(--color-text)', fontWeight: 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3,
                }}>
                  {link.title || link.url}
                </div>
                {link.memo && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginBottom: 4, lineHeight: 1.5 }}>
                    {link.memo}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {link.linkType && (
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--font-mono)',
                      padding: '2px 7px', borderRadius: 4,
                      background: 'var(--color-bg-3)', color: 'var(--color-text-3)',
                    }}>
                      {LINK_TYPE_LABELS[link.linkType] || link.linkType}
                    </span>
                  )}
                  {link.category && (
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)' }}>
                      {link.category}
                    </span>
                  )}
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)' }}>
                    {formatDate(link.createdAt)}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
