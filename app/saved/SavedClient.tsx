'use client'

import { useState } from 'react'

const LINK_TYPE_LABELS: Record<string, string> = {
  youtube: 'YouTube', instagram: 'Instagram',
  article: 'Article', news: 'News', keep: '📌 Keep',
}

// 저장한 글에 있는 고유 탭 동적 계산용 (keep 포함)
const FIXED_TABS = [
  { value: 'all', label: '전체' },
  { value: 'keep', label: '📌 킵' },
  { value: 'article', label: 'Article' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'news', label: 'News' },
]

type SavedLink = {
  id: number
  title: string | null
  url: string
  linkType: string | null
  category: string | null
  memo: string | null
  createdAt: Date | string
}

export default function SavedClient({ links }: { links: SavedLink[] }) {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all' ? links : links.filter(l => l.linkType === activeTab)

  // 탭별 카운트
  function count(type: string) {
    return type === 'all' ? links.length : links.filter(l => l.linkType === type).length
  }

  return (
    <div>
      <div className="page-hero">
        <div className="hero-eyebrow">My</div>
        <h1 className="hero-title">저장한 <b>글</b></h1>
        <div className="hero-meta">총 {links.length}개 저장됨</div>
      </div>

      {/* 탭 */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {FIXED_TABS.map(tab => (
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
        <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '24px 0' }}>
          {activeTab === 'keep' ? '아직 킵한 항목이 없어요. 레퍼런스 보드에서 📌 버튼을 눌러보세요!' : '저장된 글이 없어요.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
              className="saved-link-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, color: 'var(--color-text)', fontWeight: 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3,
                }}>
                  {link.linkType === 'keep' && <span style={{ marginRight: 6 }}>📌</span>}
                  {link.title || link.url}
                </div>
                {link.memo && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginBottom: 4, lineHeight: 1.5 }}>
                    {link.memo}
                  </div>
                )}
                <div style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {link.url}
                </div>
              </div>
              {link.linkType && (
                <span style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)',
                  padding: '3px 8px', borderRadius: 4,
                  background: link.linkType === 'keep' ? 'rgba(59,130,246,0.1)' : 'var(--color-bg-3)',
                  color: link.linkType === 'keep' ? 'var(--color-blue)' : 'var(--color-text-3)',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {LINK_TYPE_LABELS[link.linkType] || link.linkType}
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
