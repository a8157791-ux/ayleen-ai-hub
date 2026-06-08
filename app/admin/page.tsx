'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Tab = 'news' | 'study' | 'tools' | 'saved' | 'reference'

const TABS: { value: Tab; label: string }[] = [
  { value: 'news', label: 'AI 뉴스' },
  { value: 'study', label: '스터디룸' },
  { value: 'tools', label: '툴 라이브러리' },
  { value: 'saved', label: '저장한 글' },
  { value: 'reference', label: '레퍼런스' },
]

const API_MAP: Record<Tab, string> = {
  news: '/api/news?limit=100&sortBy=createdAt',
  study: '/api/study',
  tools: '/api/tools?admin=1',
  saved: '/api/saved',
  reference: '/api/reference',
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--color-bg-3)', border: '1px solid var(--color-border)',
      borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ height: 14, borderRadius: 4, background: 'var(--color-bg-2)', width: '60%', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
        <div style={{ height: 12, borderRadius: 4, background: 'var(--color-bg-2)', width: '35%', animation: 'skeleton-pulse 1.4s ease-in-out 0.2s infinite' }} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ width: 42, height: 26, borderRadius: 6, background: 'var(--color-bg-2)', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
        <div style={{ width: 42, height: 26, borderRadius: 6, background: 'var(--color-bg-2)', animation: 'skeleton-pulse 1.4s ease-in-out 0.1s infinite' }} />
      </div>
    </div>
  )
}

function SkeletonList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[0, 1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
    </div>
  )
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('news')
  const [collecting, setCollecting] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [toast, setToast] = useState('')

  const [data, setData] = useState<Record<Tab, any[] | null>>({
    news: null, study: null, tools: null, saved: null, reference: null,
  })
  const [loading, setLoading] = useState<Record<Tab, boolean>>({
    news: false, study: false, tools: false, saved: false, reference: false,
  })

  useEffect(() => {
    if (data[tab] !== null) return
    loadTab(tab)
  }, [tab])

  async function loadTab(t: Tab) {
    setLoading(p => ({ ...p, [t]: true }))
    try {
      const res = await fetch(API_MAP[t])
      const json = await res.json()
      setData(p => ({ ...p, [t]: json }))
    } catch {}
    finally { setLoading(p => ({ ...p, [t]: false })) }
  }

  function invalidateTab(t: Tab) {
    setData(p => ({ ...p, [t]: null }))
  }

  if (status === 'loading') return null
  if (!session) { router.push('/admin/login'); return null }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  async function handleCollect() {
    setCollecting(true)
    try {
      const res = await fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const d = await res.json()
      showToast(`✅ ${d.created || 0}개 수집 완료`)
      invalidateTab('news')
    } catch { showToast('❌ 수집 중 오류 발생') }
    finally { setCollecting(false) }
  }

  async function handleTranslate() {
    setTranslating(true)
    try {
      const res = await fetch('/api/news/translate', { method: 'POST' })
      const d = await res.json()
      showToast(`✅ ${d.translated || 0}개 번역 완료`)
      invalidateTab('news')
    } catch { showToast('❌ 번역 중 오류 발생') }
    finally { setTranslating(false) }
  }

  async function handleDeleteNews(id: number) {
    if (!confirm('삭제하시겠습니까?')) return
    await fetch(`/api/news/${id}`, { method: 'DELETE' })
    setData(p => ({ ...p, news: (p.news ?? []).filter(i => i.id !== id) }))
  }

  async function handleDelete(type: Exclude<Tab, 'news'>, id: number) {
    if (!confirm('삭제하시겠습니까?')) return
    const map = {
      study: `/api/study/${id}`, tools: `/api/tools/${id}`,
      saved: `/api/saved/${id}`, reference: `/api/reference/${id}`,
    }
    await fetch(map[type], { method: 'DELETE' })
    setData(p => ({ ...p, [type]: (p[type] ?? []).filter((i: any) => i.id !== id) }))
  }

  const editBtn: React.CSSProperties = {
    fontSize: 12, padding: '5px 11px', borderRadius: 6,
    border: '1px solid var(--color-border-2)',
    color: 'var(--color-text)', background: 'transparent',
    textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'pointer',
  }
  const delBtn: React.CSSProperties = {
    fontSize: 12, padding: '5px 11px', borderRadius: 6,
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171', background: 'transparent',
    whiteSpace: 'nowrap', cursor: 'pointer',
  }

  function ItemCard({ title, sub, badge, editHref, onDelete }: {
    title: string; sub?: string; badge?: string; editHref?: string; onDelete: () => void
  }) {
    return (
      <div style={{
        background: 'var(--color-bg-3)', border: '1px solid var(--color-border)',
        borderRadius: 10, padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title || '(제목 없음)'}
          </div>
          {sub && (
            <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sub}
            </div>
          )}
          {badge && (
            <span style={{ display: 'inline-block', marginTop: 5, fontSize: 12, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 4, background: 'var(--color-bg-2)', color: 'var(--color-text-3)' }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {editHref && <Link href={editHref} style={editBtn}>편집</Link>}
          <button onClick={onDelete} style={delBtn}>삭제</button>
        </div>
      </div>
    )
  }

  const currentData = data[tab]
  const isLoading = loading[tab]

  return (
    <div>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {toast && (
        <div style={{
          position: 'fixed', top: 70, right: 16, zIndex: 999,
          background: 'var(--color-bg-2)', border: '1px solid var(--color-border-2)',
          borderRadius: 10, padding: '12px 18px', fontSize: 13, color: 'var(--color-text)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}

      <div className="page-hero">
        <div className="hero-eyebrow">Admin Panel</div>
        <h1 className="hero-title">관리자 <b>패널</b></h1>
        <p style={{ color: 'var(--color-text-3)', fontSize: 13, marginTop: 4 }}>{session.user?.email}</p>
      </div>

      {/* 액션 버튼 — 저장한 글 추가 버튼 제거 (북마크 전용) */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button className="btn btn-primary" onClick={handleCollect} disabled={collecting}>
            <i className={`ti ${collecting ? 'ti-loader-2' : 'ti-refresh'}`} style={{ marginRight: 6, ...(collecting ? { animation: 'spin 1s linear infinite' } : {}) }} />
            {collecting ? '수집 중...' : 'AI 뉴스 지금 수집'}
          </button>
          <button className="btn btn-ghost" onClick={handleTranslate} disabled={translating}>
            <i className={`ti ${translating ? 'ti-loader-2' : 'ti-language'}`} style={{ marginRight: 6, ...(translating ? { animation: 'spin 1s linear infinite' } : {}) }} />
            {translating ? '번역 중...' : '번역 보충'}
          </button>
          <Link href="/admin/new/study" className="btn btn-ghost">+ 스터디룸</Link>
          <Link href="/admin/new/tool" className="btn btn-ghost">+ 툴</Link>
          <Link href="/admin/new/reference" className="btn btn-ghost">+ 레퍼런스</Link>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)} style={{
            padding: '8px 16px', border: 'none', background: 'transparent',
            color: tab === t.value ? 'var(--color-blue)' : 'var(--color-text-3)',
            borderBottom: tab === t.value ? '2px solid var(--color-blue)' : '2px solid transparent',
            fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
          }}>
            {t.label}
            {data[t.value] !== null && (
              <span style={{ marginLeft: 5, fontSize: 12, opacity: 0.6, fontFamily: 'var(--font-mono)' }}>
                {data[t.value]?.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && <SkeletonList />}

      {!isLoading && currentData !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {tab === 'news' && (currentData.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-3)', fontSize: 13 }}>
                아직 수집된 뉴스가 없습니다.
              </div>
            : currentData.map(n => {
                const title = n.titleKo || n.title
                const hasKo = n.titleKo && n.titleKo !== n.title
                return (
                  <div key={n.id} style={{
                    background: 'var(--color-bg-3)', border: '1px solid var(--color-border)',
                    borderRadius: 10, padding: '12px 14px',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                        {title}
                      </div>
                      {hasKo && (
                        <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                          {n.title}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {n.category && (
                          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 4, background: 'var(--color-bg-2)', color: 'var(--color-text-3)' }}>
                            {n.category}
                          </span>
                        )}
                        {n.source && (
                          <span style={{ fontSize: 12, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}>
                            {n.source}
                          </span>
                        )}
                        {!n.titleKo && (
                          <span style={{ fontSize: 12, padding: '2px 7px', borderRadius: 4, background: 'rgba(251,191,36,0.15)', color: 'var(--color-amber)', fontFamily: 'var(--font-mono)' }}>
                            미번역
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <a href={n.url} target="_blank" rel="noopener noreferrer" style={editBtn}>링크</a>
                      <button onClick={() => handleDeleteNews(n.id)} style={delBtn}>삭제</button>
                    </div>
                  </div>
                )
              })
          )}

          {tab === 'study' && (currentData.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-3)', fontSize: 13 }}>등록된 스터디룸이 없습니다.</div>
            : currentData.map(n => (
              <ItemCard key={n.id} title={n.title} sub={n.siteUrl || n.mediaUrl || ''}
                badge={n.category} editHref={`/admin/edit/study/${n.id}`}
                onDelete={() => handleDelete('study', n.id)} />
            ))
          )}

          {tab === 'tools' && (currentData.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-3)', fontSize: 13 }}>등록된 툴이 없습니다.</div>
            : currentData.map(t => (
              <ItemCard key={t.id} title={t.name} sub={t.url}
                badge={[t.category, t.pricing].filter(Boolean).join(' · ')}
                editHref={`/admin/edit/tools/${t.id}`}
                onDelete={() => handleDelete('tools', t.id)} />
            ))
          )}

          {/* 저장한 글 — 삭제만 가능, 편집 버튼 없음 */}
          {tab === 'saved' && (currentData.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-3)', fontSize: 13 }}>저장한 글이 없습니다.</div>
            : currentData.map(l => (
              <div key={l.id} style={{
                background: 'var(--color-bg-3)', border: '1px solid var(--color-border)',
                borderRadius: 10, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                    {l.linkType === 'keep' && <span style={{ marginRight: 5 }}>📌</span>}
                    {l.title || l.url}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {l.linkType && (
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 4, background: 'var(--color-bg-2)', color: 'var(--color-text-3)' }}>
                        {l.linkType}
                      </span>
                    )}
                    {l.category && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}>
                        {l.category}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                      {l.url}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" style={editBtn}>링크</a>
                  <button onClick={() => handleDelete('saved', l.id)} style={delBtn}>삭제</button>
                </div>
              </div>
            ))
          )}

          {tab === 'reference' && (currentData.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-3)', fontSize: 13 }}>등록된 레퍼런스가 없습니다.</div>
            : currentData.map(r => (
              <ItemCard key={r.id} title={r.title || r.url} sub={r.url}
                badge={[r.refType, r.category].filter(Boolean).join(' · ')}
                editHref={`/admin/edit/reference/${r.id}`}
                onDelete={() => handleDelete('reference', r.id)} />
            ))
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
