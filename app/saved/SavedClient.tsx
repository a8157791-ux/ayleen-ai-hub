'use client'

import { useState } from 'react'

const LINK_TYPE_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  article: 'Article',
  news: 'News',
  keep: '📌 Keep',
}

const TABS = [
  { value: 'all', label: '전체' },
  { value: 'keep', label: '📌 Keep' },
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

  return (
    <div className="page-container">
      <div className="page-hero">
        <div className="hero-eyebrow">My</div>
        <h1 className="hero-title">저장한 <b>글</b></h1>
        <p style={{color:'var(--color-text-2)', fontSize:14, marginTop:6}}>
          총 {links.length}개 저장됨
        </p>
      </div>

      {/* 탭 */}
      <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:24}}>
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            style={{
              padding:'6px 14px', borderRadius:20, fontSize:13,
              border: activeTab === tab.value ? '1px solid var(--color-blue)' : '1px solid var(--color-border-2)',
              background: activeTab === tab.value ? 'rgba(59,130,246,0.15)' : 'var(--color-bg-2)',
              color: activeTab === tab.value ? 'var(--color-blue)' : 'var(--color-text-2)',
              cursor:'pointer', transition:'all 0.15s',
            }}
          >
            {tab.label}
            <span style={{fontSize:11, marginLeft:4, opacity:0.7}}>
              {tab.value === 'all' ? links.length : links.filter(l => l.linkType === tab.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div style={{textAlign:'center', padding:'60px 20px', color:'var(--color-text-3)'}}>
          {activeTab === 'keep' ? '아직 킵한 항목이 없어요.' : '저장된 글이 없어요.'}
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {filtered.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:'block', textDecoration:'none',
                background:'var(--color-bg-2)',
                border:'1px solid var(--color-border)',
                borderRadius:12, padding:'14px 16px',
                transition:'border-color 0.15s',
              }}
            >
              <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12}}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{
                    fontSize:14, color:'var(--color-text)', fontWeight:500,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                  }}>
                    {link.linkType === 'keep' && <span style={{marginRight:6}}>📌</span>}
                    {link.title || link.url}
                  </div>
                  {link.memo && (
                    <div style={{fontSize:12, color:'var(--color-text-2)', marginTop:4, lineHeight:1.5}}>
                      {link.memo}
                    </div>
                  )}
                  <div style={{marginTop:6}}>
                    <span style={{
                      fontSize:10, fontFamily:'var(--font-mono)',
                      color:'var(--color-text-3)',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      display:'block', maxWidth:'100%',
                    }}>
                      {link.url}
                    </span>
                  </div>
                </div>
                <span style={{
                  fontSize:10, fontFamily:'var(--font-mono)',
                  padding:'3px 8px', borderRadius:4,
                  background:'var(--color-bg-3)',
                  color: link.linkType === 'keep' ? 'var(--color-blue)' : 'var(--color-text-3)',
                  whiteSpace:'nowrap', flexShrink:0,
                }}>
                  {link.linkType ? (LINK_TYPE_LABELS[link.linkType] || link.linkType) : ''}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
