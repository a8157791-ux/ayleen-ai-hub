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

  // 각 탭 데이터
  const [studyNotes, setStudyNotes] = useState<any[]>([])
  const [tools, setTools] = useState<any[]>([])
  const [savedLinks, setSavedLinks] = useState<any[]>([])
  const [references, setReferences] = useState<any[]>([])
  const [loaded, setLoaded] = useState<Set<Tab>>(new Set())

  if (status === 'loading') return null
  if (!session) {
    router.push('/admin/login')
    return null
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function loadTab(t: Tab) {
    if (loaded.has(t)) return
    const endpointMap: Record<Tab, string> = {
      study: '/api/study',
      tools: '/api/tools',
      saved: '/api/saved',
      reference: '/api/reference',
    }
    try {
      const res = await fetch(endpointMap[t])
      const data = await res.json()
      if (t === 'study') setStudyNotes(data)
      else if (t === 'tools') setTools(data)
      else if (t === 'saved') setSavedLinks(data)
      else if (t === 'reference') setReferences(data)
      setLoaded(prev => new Set([...prev, t]))
    } catch {}
  }

  function handleTabChange(t: Tab) {
    setTab(t)
    loadTab(t)
  }

  async function handleCollect() {
    setCollecting(true)
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cron-secret': '' },
      })
      const data = await res.json()
      showToast(`✅ ${data.saved || 0}개 수집 완료`)
    } catch {
      showToast('❌ 수집 중 오류 발생')
    } finally {
      setCollecting(false)
    }
  }

  async function handleTranslate() {
    setTranslating(true)
    try {
      const res = await fetch('/api/news/translate', { method: 'POST' })
      const data = await res.json()
      showToast(`✅ ${data.translated || 0}개 번역 완료`)
    } catch {
      showToast('❌ 번역 중 오류 발생')
    } finally {
      setTranslating(false)
    }
  }

  async function handleDelete(type: Tab, id: number) {
    if (!confirm('삭제하시겠습니까?')) return
    const endpointMap: Record<Tab, string> = {
      study: `/api/study/${id}`,
      tools: `/api/tools/${id}`,
      saved: `/api/saved/${id}`,
      reference: `/api/reference/${id}`,
    }
    await fetch(endpointMap[type], { method: 'DELETE' })
    if (type === 'study') setStudyNotes(prev => prev.filter(i => i.id !== id))
    else if (type === 'tools') setTools(prev => prev.filter(i => i.id !== id))
    else if (type === 'saved') setSavedLinks(prev => prev.filter(i => i.id !== id))
    else if (type === 'reference') setReferences(prev => prev.filter(i => i.id !== id))
  }

  const tdStyle: React.CSSProperties = {
    padding:'10px 12px', borderBottom:'1px solid var(--color-border)',
    fontSize:13, color:'var(--color-text-2)', verticalAlign:'middle',
    maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
  }
  const thStyle: React.CSSProperties = {
    padding:'10px 12px', borderBottom:'1px solid var(--color-border)',
    fontSize:11, color:'var(--color-text-3)', fontFamily:'var(--font-mono)',
    textAlign:'left', fontWeight:400, whiteSpace:'nowrap',
  }
  const actionStyle: React.CSSProperties = {
    padding:'10px 12px', borderBottom:'1px solid var(--color-border)',
    whiteSpace:'nowrap', verticalAlign:'middle',
  }

  return (
    <div className="page-container">
      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', top:70, right:16, zIndex:999,
          background:'var(--color-bg-2)', border:'1px solid var(--color-border-2)',
          borderRadius:10, padding:'10px 16px', fontSize:13, color:'var(--color-text)',
          boxShadow:'0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}

      <div className="page-hero">
        <div className="hero-eyebrow">Admin Panel</div>
        <h1 className="hero-title">관리자 <b>패널</b></h1>
        <p style={{color:'var(--color-text-3)', fontSize:13, marginTop:4}}>{session.user?.email}</p>
      </div>

      {/* 액션 버튼 */}
      <div className="admin-card" style={{marginBottom:24}}>
        <div style={{display:'flex', flexWrap:'wrap', gap:10}}>
          <button className="btn btn-primary" onClick={handleCollect} disabled={collecting}>
            <i className="ti ti-refresh" style={{marginRight:6}} />
            {collecting ? '수집 중...' : 'AI 뉴스 지금 수집'}
          </button>
          <button className="btn btn-ghost" onClick={handleTranslate} disabled={translating}>
            <i className="ti ti-language" style={{marginRight:6}} />
            {translating ? '번역 중...' : '번역 보충'}
          </button>
          <Link href="/admin/new/study" className="btn btn-ghost">+ 스터디 노트 추가</Link>
          <Link href="/admin/new/tool" className="btn btn-ghost">+ 툴 추가</Link>
          <Link href="/admin/new/saved" className="btn btn-ghost">+ 링크 저장</Link>
          <Link href="/admin/new/reference" className="btn btn-ghost">+ 레퍼런스 추가</Link>
        </div>
      </div>

      {/* 탭 */}
      <div style={{display:'flex', gap:4, marginBottom:16, borderBottom:'1px solid var(--color-border)', overflowX:'auto'}}>
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => handleTabChange(t.value)}
            style={{
              padding:'8px 16px', border:'none', background:'transparent',
              color: tab === t.value ? 'var(--color-blue)' : 'var(--color-text-3)',
              borderBottom: tab === t.value ? '2px solid var(--color-blue)' : '2px solid transparent',
              fontSize:13, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="admin-card" style={{overflowX:'auto', padding:0}}>
        {tab === 'study' && (
          <table style={{width:'100%', borderCollapse:'collapse', minWidth:400}}>
            <thead>
              <tr>
                <th style={thStyle}>제목</th>
                <th style={thStyle}>카테고리</th>
                <th style={{...thStyle, whiteSpace:'nowrap'}}>관리</th>
              </tr>
            </thead>
            <tbody>
              {studyNotes.map(n => (
                <tr key={n.id}>
                  <td style={tdStyle}>{n.title}</td>
                  <td style={tdStyle}>{n.category}</td>
                  <td style={actionStyle}>
                    <Link href={`/admin/edit/study/${n.id}`} style={{fontSize:12, color:'var(--color-blue)', marginRight:10, textDecoration:'none'}}>편집</Link>
                    <button onClick={() => handleDelete('study', n.id)} style={{fontSize:12, color:'#f87171', border:'none', background:'transparent', cursor:'pointer'}}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'tools' && (
          <table style={{width:'100%', borderCollapse:'collapse', minWidth:400}}>
            <thead>
              <tr>
                <th style={thStyle}>이름</th>
                <th style={thStyle}>카테고리</th>
                <th style={{...thStyle, whiteSpace:'nowrap'}}>관리</th>
              </tr>
            </thead>
            <tbody>
              {tools.map(t => (
                <tr key={t.id}>
                  <td style={tdStyle}>{t.name}</td>
                  <td style={tdStyle}>{t.category}</td>
                  <td style={actionStyle}>
                    <Link href={`/admin/edit/tools/${t.id}`} style={{fontSize:12, color:'var(--color-blue)', marginRight:10, textDecoration:'none'}}>편집</Link>
                    <button onClick={() => handleDelete('tools', t.id)} style={{fontSize:12, color:'#f87171', border:'none', background:'transparent', cursor:'pointer'}}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'saved' && (
          <table style={{width:'100%', borderCollapse:'collapse', minWidth:400}}>
            <thead>
              <tr>
                <th style={thStyle}>제목</th>
                <th style={thStyle}>타입</th>
                <th style={{...thStyle, whiteSpace:'nowrap'}}>관리</th>
              </tr>
            </thead>
            <tbody>
              {savedLinks.map(l => (
                <tr key={l.id}>
                  <td style={tdStyle}>{l.title}</td>
                  <td style={tdStyle}>{l.linkType}</td>
                  <td style={actionStyle}>
                    <button onClick={() => handleDelete('saved', l.id)} style={{fontSize:12, color:'#f87171', border:'none', background:'transparent', cursor:'pointer'}}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'reference' && (
          <table style={{width:'100%', borderCollapse:'collapse', minWidth:400}}>
            <thead>
              <tr>
                <th style={thStyle}>제목</th>
                <th style={thStyle}>분류</th>
                <th style={{...thStyle, whiteSpace:'nowrap'}}>관리</th>
              </tr>
            </thead>
            <tbody>
              {references.map(r => (
                <tr key={r.id}>
                  <td style={{...tdStyle, maxWidth:200}}>{r.title}</td>
                  <td style={{...tdStyle, maxWidth:100}}>{r.refType}</td>
                  <td style={actionStyle}>
                    <button onClick={() => handleDelete('reference', r.id)} style={{fontSize:12, color:'#f87171', border:'none', background:'transparent', cursor:'pointer'}}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
