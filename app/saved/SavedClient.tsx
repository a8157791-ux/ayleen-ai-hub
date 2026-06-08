'use client'

import { useState } from 'react'

const LINK_TYPE_LABELS: Record<string, string> = {
  youtube: 'YouTube', instagram: 'Instagram',
  article: 'Article', news: 'News', keep: '📌 Keep',
  tool: 'Tool', reference: 'Reference', study: 'Study',
}

const FIXED_TABS = [
  { value: 'all', label: '전체' },
  { value: 'keep', label: '📌 킵' },
  { value: 'news', label: 'News' },
  { value: 'tool', label: 'Tool' },
  { value: 'reference', label: 'Reference' },
  { value: 'article', label: 'Article' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
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

  // 탭 카운트 (0건 탭은 숨김)
  function count(type: string) {
    return type === 'all' ? links.length : links.filter(l => l.linkType === type).length
  }

  // 실제 존재하는 linkType만 탭에 표시 (all + keep 제외 나머지)
  const visibleTabs = FIXED_TABS.filter(tab => {
    if (tab.value === 'all') return true
    return count(tab.value) > 0
  })

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString('ko-KR')
  }

  const linkTypeBadgeStyle = (linkType: string | null): React.CSSProperties => ({
    fontSize: 10, fontFamily: 'var(--font-mono)',
    padding: '3px 8px', borderRadius: 4,
    background: linkType === 'keep' ? 'rgba(59,130,246,0.1)'
      : linkType === 'news' ? 'rgba(34,211,153,0.1)'
      : linkType === 'tool' ? 'rgba(167,139,250,0.1)'
      : 'var(--color-bg-3)',
    color: linkType === 'keep' ? 'var(--color-blue)'
      : linkType === 'news' ? 'var(--color-green)'
      : linkType === 'tool' ? 'var(--color-purple)'
      : 'var(--color-text-3)',
    whiteSpace: 'nowrap', flexShrink: 0,
  })

  return (
    <div>
      <div className="page-hero">
        <div className="hero-eyebrow">My</div>
        <h1 className="hero-title">저장한 <b>글</b></h1>
        <div className="hero-meta">총 {links.length}개 저장됨</div>
      </div>

      {/* 탭 */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {visibleTabs.map(tab => (
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
          {activeTab === 'keep'
            ? '아직 킵한 항목이 없어요. 뉴스·레퍼런스·툴에서 📌 버튼을 눌러보세요!'
            : '저장된 항목이 없어요.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
              className="saved-link-item">
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
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
              {link.linkType && (
                <span style={linkTypeBadgeStyle(link.linkType)}>
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
