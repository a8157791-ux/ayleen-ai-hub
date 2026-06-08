'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Tab = 'study' | 'tools' | 'saved' | 'reference'

const TABS: { value: Tab; label: string }[] = [
  { value: 'study', label: '스터디 노트' },
  { value: 'tools', label: '툴 라이브러리' },
  { value: 'saved', label: '저장한 글' },
  { value: 'reference', label: '레퍼런스' },
]

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('study')
  const [collecting, setCollecting] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [toast, setToast] = useState('')

  const [studyNotes, setStudyNotes] = useState<any[]>([])
  const [tools, setTools] = useState<any[]>([])
  const [savedLinks, setSavedLinks] = useState<any[]>([])
  const [references, setReferences] = useState<any[]>([])
  const [loaded, setLoaded] = useState<Set<Tab>>(new Set())

  if (status === 'loading') return null
  if (!session) { router.push('/admin/login'); return null }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function loadTab(t: Tab) {
    if (loaded.has(t)) return
    const map: Record<Tab, string> = {
      study: '/api/study', tools: '/api/tools?admin=1',
      saved: '/api/saved', reference: '/api/reference',
    }
    try {
      const res = await fetch(map[t])
      const data = await res.json()
      if (t === 'study') setStudyNotes(data)
      else if (t === 'tools') setTools(data)
      else if (t === 'saved') setSavedLinks(data)
      else if (t === 'reference') setReferences(data)
      setLoaded(prev => new Set([...prev, t]))
    } catch {}
  }

  function handleTabChange(t: Tab) { setTab(t); loadTab(t) }

  async function handleCollect() {
    setCollecting(true)
    try {
      const res = await fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      showToast(`✅ ${data.saved || data.created || 0}개 수집 완료`)
    } catch { showToast('❌ 수집 중 오류 발생') }
    finally { setCollecting(false) }
  }

  async function handleTranslate() {
    setTranslating(true)
    try {
      const res = await fetch('/api/news/translate', { method: 'POST' })
      const data = await res.json()
      showToast(`✅ ${data.translated || 0}개 번역 완료`)
    } catch { showToast('❌ 번역 중 오류 발생') }
    finally { setTranslating(false) }
  }

  async function handleDelete(type: Tab, id: number) {
    if (!confirm('삭제하시겠습니까?')) return
    const map: Record<Tab, string> = {
      study: `/api/study/${id}`, tools: `/api/tools/${id}`,
      saved: `/api/saved/${id}`, reference: `/api/reference/${id}`,
    }
    await fetch(map[type], { method: 'DELETE' })
    if (type === 'study') setStudyNotes(p => p.filter(i => i.id !== id))
    else if (type === 'tools') setTools(p => p.filter(i => i.id !== id))
    else if (type === 'saved') setSavedLinks(p => p.filter(i => i.id !== id))
    else if (type === 'reference') setReferences(p => p.filter(i => i.id !== id))
  }

  // 편집/삭제 버튼 스타일 — 흰색 테두리
  const editBtn: React.CSSProperties = {
    fontSize: 12, padding: '4px 10px', borderRadius: 6,
    border: '1px solid var(--color-border-2)',
    color: 'var(--color-text)', background: 'transparent',
    textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'pointer',
  }
  const delBtn: React.CSSProperties = {
    fontSize: 12, padding: '4px 10px', borderRadius: 6,
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
            <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sub}
            </div>
          )}
          {badge && (
            <span style={{
              display: 'inline-block', marginTop: 4,
              fontSize: 10, fontFamily: 'var(--font-mono)',
              padding: '2px 7px', borderRadius: 4,
              background: 'var(--color-bg-2)', color: 'var(--color-text-3)',
            }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {editHref && (
            <Link href={editHref} style={editBtn}>편집</Link>
          )}
          <button onClick={onDelete} style={delBtn}>삭제</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: 70, right: 16, zIndex: 999,
          background: 'var(--color-bg-2)', border: '1px solid var(--color-border-2)',
          borderRadius: 10, padding: '10px 16px', fontSize: 13, color: 'var(--color-text)',
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

      {/* 액션 버튼 */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button className="btn btn-primary" onClick={handleCollect} disabled={collecting}>
            <i className="ti ti-refresh" style={{ marginRight: 6 }} />
            {collecting ? '수집 중...' : 'AI 뉴스 지금 수집'}
          </button>
          <button className="btn btn-ghost" onClick={handleTranslate} disabled={translating}>
            <i className="ti ti-language" style={{ marginRight: 6 }} />
            {translating ? '번역 중...' : '번역 보충'}
          </button>
          <Link href="/admin/new/study" className="btn btn-ghost">+ 스터디 노트</Link>
          <Link href="/admin/new/tool" className="btn btn-ghost">+ 툴</Link>
          <Link href="/admin/new/saved" className="btn btn-ghost">+ 링크 저장</Link>
          <Link href="/admin/new/reference" className="btn btn-ghost">+ 레퍼런스</Link>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => handleTabChange(t.value)} style={{
            padding: '8px 16px', border: 'none', background: 'transparent',
            color: tab === t.value ? 'var(--color-blue)' : 'var(--color-text-3)',
            borderBottom: tab === t.value ? '2px solid var(--color-blue)' : '2px solid transparent',
            fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 카드 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tab === 'study' && (
          studyNotes.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-3)', fontSize: 13 }}>탭을 눌러 불러오기</div>
            : studyNotes.map(n => (
              <ItemCard key={n.id} title={n.title} sub={n.siteUrl || n.mediaUrl || ''}
                badge={n.category} editHref={`/admin/edit/study/${n.id}`}
                onDelete={() => handleDelete('study', n.id)} />
            ))
        )}

        {tab === 'tools' && (
          tools.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-3)', fontSize: 13 }}>탭을 눌러 불러오기</div>
            : tools.map(t => (
              <ItemCard key={t.id} title={t.name} sub={t.url}
                badge={[t.category, t.pricing].filter(Boolean).join(' · ')}
                editHref={`/admin/edit/tools/${t.id}`}
                onDelete={() => handleDelete('tools', t.id)} />
            ))
        )}

        {tab === 'saved' && (
          savedLinks.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-3)', fontSize: 13 }}>탭을 눌러 불러오기</div>
            : savedLinks.map(l => (
              <ItemCard key={l.id} title={l.title || l.url} sub={l.url}
                badge={l.linkType}
                editHref={`/admin/edit/saved/${l.id}`}
                onDelete={() => handleDelete('saved', l.id)} />
            ))
        )}

        {tab === 'reference' && (
          references.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-3)', fontSize: 13 }}>탭을 눌러 불러오기</div>
            : references.map(r => (
              <ItemCard key={r.id} title={r.title || r.url} sub={r.url}
                badge={[r.refType, r.category].filter(Boolean).join(' · ')}
                editHref={`/admin/edit/reference/${r.id}`}
                onDelete={() => handleDelete('reference', r.id)} />
            ))
        )}
      </div>
    </div>
  )
}
