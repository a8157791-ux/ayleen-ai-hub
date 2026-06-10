'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const TABS = [
  { value: 'all',       label: '전체' },
  { value: 'news',      label: '뉴스' },
  { value: 'study',     label: '스터디' },
  { value: 'tools',     label: '툴' },
  { value: 'prompts',   label: '프롬프트' },
  { value: 'saved',     label: '저장한 글' },
  { value: 'reference', label: '레퍼런스' },
]

const SECTION_LABELS: Record<string, string> = {
  news: '뉴스', study: '스터디', tools: 'AI 툴',
  prompts: '프롬프트', saved: '저장한 글', reference: '레퍼런스',
}

const SECTION_COLORS: Record<string, string> = {
  news: 'var(--color-blue)', study: 'var(--color-cyan)', tools: 'var(--color-purple)',
  prompts: 'var(--color-pink)', saved: 'var(--color-amber)', reference: 'var(--color-green)',
}

function highlight(text: string, q: string) {
  if (!q || !text) return text
  const parts = text.split(new RegExp(`(${q})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase()
      ? <mark key={i} style={{ background: 'rgba(59,130,246,0.3)', color: 'var(--color-blue)', borderRadius: 2, padding: '0 1px' }}>{part}</mark>
      : part
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR')
}

// ── 뉴스 아이템
function NewsItem({ item, q }: { item: any; q: string }) {
  const title = item.titleKo || item.title
  const summary = item.summaryKo || item.summary
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="search-item">
      <div className="search-item-header">
        <span className="search-item-badge" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--color-blue)' }}>
          {item.source}
        </span>
        {item.category && <span className="search-item-cat">{item.category}</span>}
        <span className="search-item-date">{formatDate(item.createdAt)}</span>
      </div>
      <div className="search-item-title">{highlight(title, q)}</div>
      {summary && <div className="search-item-desc">{highlight(summary.slice(0, 120), q)}...</div>}
    </a>
  )
}

// ── 스터디 아이템
function StudyItem({ item, q }: { item: any; q: string }) {
  return (
    <Link href={`/study/${item.id}`} className="search-item">
      <div className="search-item-header">
        {item.category && <span className="search-item-badge" style={{ background: 'rgba(6,182,212,0.12)', color: 'var(--color-cyan)' }}>{item.category}</span>}
        {item.tool && <span className="search-item-cat">{item.tool}</span>}
        <span className="search-item-date">{formatDate(item.studiedAt ?? item.createdAt)}</span>
      </div>
      <div className="search-item-title">{highlight(item.title, q)}</div>
      {item.content && <div className="search-item-desc">{highlight(item.content.slice(0, 100), q)}...</div>}
    </Link>
  )
}

// ── 툴 아이템
function ToolItem({ item, q }: { item: any; q: string }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="search-item">
      <div className="search-item-header">
        {item.category && <span className="search-item-badge" style={{ background: 'rgba(167,139,250,0.12)', color: 'var(--color-purple)' }}>{item.category}</span>}
        <span className="search-item-cat">{item.pricing}</span>
        <span className="search-item-date">{formatDate(item.createdAt)}</span>
      </div>
      <div className="search-item-title">{highlight(item.name, q)}</div>
      {item.description && <div className="search-item-desc">{highlight(item.description.slice(0, 100), q)}</div>}
    </a>
  )
}

// ── 프롬프트 아이템
function PromptItem({ item, q }: { item: any; q: string }) {
  return (
    <Link href={`/prompts`} className="search-item">
      <div className="search-item-header">
        {item.category && <span className="search-item-badge" style={{ background: 'rgba(244,114,182,0.12)', color: 'var(--color-pink)' }}>{item.category}</span>}
        {item.tool && <span className="search-item-cat">{item.tool}</span>}
        <span className="search-item-date">{formatDate(item.createdAt)}</span>
      </div>
      <div className="search-item-title">{highlight(item.title, q)}</div>
    </Link>
  )
}

// ── 저장한 글 아이템
function SavedItem({ item, q }: { item: any; q: string }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="search-item">
      <div className="search-item-header">
        {item.linkType && <span className="search-item-badge" style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--color-amber)' }}>{item.linkType}</span>}
        {item.category && <span className="search-item-cat">{item.category}</span>}
        <span className="search-item-date">{formatDate(item.createdAt)}</span>
      </div>
      <div className="search-item-title">{highlight(item.title, q)}</div>
    </a>
  )
}

// ── 레퍼런스 아이템
function ReferenceItem({ item, q }: { item: any; q: string }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="search-item">
      <div className="search-item-header">
        {item.refType && <span className="search-item-badge" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--color-green)' }}>{item.refType}</span>}
        {item.category && <span className="search-item-cat">{item.category}</span>}
        <span className="search-item-date">{formatDate(item.createdAt)}</span>
      </div>
      <div className="search-item-title">{highlight(item.title, q)}</div>
    </a>
  )
}

const ITEM_COMPONENTS: Record<string, React.FC<{ item: any; q: string }>> = {
  news: NewsItem, study: StudyItem, tools: ToolItem,
  prompts: PromptItem, saved: SavedItem, reference: ReferenceItem,
}

// ── 페이지네이션
function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 24 }}>
      <button onClick={() => onPage(page - 1)} disabled={page === 1} className="btn btn-ghost" style={{ padding: '6px 12px' }}>‹</button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className="btn"
          style={{
            padding: '6px 12px',
            background: p === page ? 'var(--color-blue)' : 'var(--color-bg-3)',
            color: p === page ? '#fff' : 'var(--color-text-2)',
            border: `1px solid ${p === page ? 'var(--color-blue)' : 'var(--color-border-2)'}`,
            borderRadius: 6, cursor: 'pointer', fontSize: 13,
          }}
        >
          {p}
        </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages} className="btn btn-ghost" style={{ padding: '6px 12px' }}>›</button>
    </div>
  )
}

// ── 메인
export default function SearchClient({
  initialQ, initialType, initialPage,
}: {
  initialQ: string; initialType: string; initialPage: number
}) {
  const router = useRouter()
  const [q, setQ] = useState(initialQ)
  const [inputVal, setInputVal] = useState(initialQ)
  const [type, setType] = useState(initialType)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const search = useCallback(async (query: string, t: string, p: number) => {
    if (!query.trim()) { setData(null); return }
    setLoading(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${t}&page=${p}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
    router.replace(`/search?q=${encodeURIComponent(query)}&type=${t}&page=${p}`, { scroll: false })
  }, [router])

  useEffect(() => {
    if (initialQ) search(initialQ, initialType, initialPage)
  }, [])

  const handleSearch = () => {
    setQ(inputVal)
    setType('all')
    setPage(1)
    search(inputVal, 'all', 1)
  }

  const handleTab = (t: string) => {
    setType(t)
    setPage(1)
    search(q, t, 1)
  }

  const handlePage = (p: number) => {
    setPage(p)
    search(q, type, p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalCount = data?.counts
    ? Object.values(data.counts as Record<string, number>).reduce((a, b) => a + b, 0)
    : data?.total ?? 0

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Search</div>
        <h1 className="hero-title">통합 <b>검색</b></h1>
      </div>

      {/* 검색 입력 */}
      <div style={{ maxWidth: 640, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="form-input"
            style={{ flex: 1, fontSize: 15 }}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="뉴스, 스터디, 툴 등 전체 검색..."
            autoFocus
          />
          <button onClick={handleSearch} className="btn btn-primary" style={{ padding: '0 20px', flexShrink: 0 }}>
            <i className="ti ti-search" style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>

      {/* 탭 */}
      {q && data && (
        <div className="tab-bar" style={{ marginBottom: 24 }}>
          {TABS.map(tab => {
            const count = tab.value === 'all'
              ? totalCount
              : data?.counts?.[tab.value] ?? data?.total ?? 0
            return (
              <button
                key={tab.value}
                onClick={() => handleTab(tab.value)}
                className={`tab-btn ${type === tab.value ? 'active' : ''}`}
              >
                {tab.label}
                {count > 0 && (
                  <span style={{
                    marginLeft: 5, fontSize: 10, padding: '1px 5px', borderRadius: 10,
                    background: type === tab.value ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-3)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '40px 0' }}>
          검색 중...
        </div>
      )}

      {/* 결과 없음 */}
      {!loading && q && data && totalCount === 0 && (
        <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 13, padding: '40px 0' }}>
          &ldquo;{q}&rdquo; 에 대한 검색 결과가 없습니다.
        </div>
      )}

      {/* 전체 탭 — 섹션별 표시 */}
      {!loading && data && type === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {Object.entries(data.results as Record<string, any[]>).map(([section, items]) => {
            if (!items || items.length === 0) return null
            const ItemComp = ITEM_COMPONENTS[section]
            if (!ItemComp) return null
            return (
              <div key={section}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 3, height: 16, borderRadius: 2,
                      background: SECTION_COLORS[section],
                      display: 'inline-block',
                    }} />
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--color-text)' }}>
                      {SECTION_LABELS[section]}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)' }}>
                      {items.length}건
                    </span>
                  </div>
                  {items.length >= 5 && (
                    <button
                      onClick={() => handleTab(section)}
                      style={{
                        fontSize: 11, color: 'var(--color-blue)', background: 'none', border: 'none',
                        cursor: 'pointer', fontFamily: 'var(--font-mono)',
                      }}
                    >
                      전체보기 →
                    </button>
                  )}
                </div>
                <div className="search-results">
                  {items.map((item: any) => <ItemComp key={item.id} item={item} q={q} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 섹션별 탭 — 페이징 */}
      {!loading && data && type !== 'all' && (
        <>
          <div className="search-results">
            {(data.results[type] ?? []).map((item: any) => {
              const ItemComp = ITEM_COMPONENTS[type]
              return ItemComp ? <ItemComp key={item.id} item={item} q={q} /> : null
            })}
          </div>
          <Pagination page={page} totalPages={data.totalPages ?? 1} onPage={handlePage} />
        </>
      )}

      {/* 초기 상태 */}
      {!q && !loading && (
        <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '40px 0' }}>
          검색어를 입력해주세요.
        </div>
      )}
    </>
  )
}
