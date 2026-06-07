'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const REF_TYPES = [
  { value: 'website', label: 'Website' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'tool', label: 'Tool' },
  { value: 'article', label: 'Article' },
  { value: 'inspiration', label: 'Inspiration' },
]

export default function NewReferencePage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [refType, setRefType] = useState('website')
  const [category, setCategory] = useState('')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // URL 입력 시 파비콘 자동 추출용 도메인
  function getFaviconUrl(inputUrl: string) {
    try {
      const domain = new URL(inputUrl).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return null
    }
  }

  const faviconUrl = url ? getFaviconUrl(url) : null

  async function handleSubmit() {
    if (!title.trim() || !url.trim()) {
      setError('제목과 URL은 필수입니다.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          refType,
          category: category.trim() || null,
          desc: desc.trim() || null,
          faviconUrl: faviconUrl || null,
        }),
      })
      if (!res.ok) throw new Error('저장 실패')
      router.push('/admin?tab=reference')
    } catch {
      setError('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (!session) return null

  return (
    <div className="page-container">
      <div className="page-hero">
        <div className="hero-eyebrow">Admin</div>
        <h1 className="hero-title">레퍼런스 <b>추가</b></h1>
      </div>

      <div className="admin-card">
        {error && (
          <div style={{padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, color:'#f87171', fontSize:13, marginBottom:16}}>
            {error}
          </div>
        )}

        <div style={{display:'flex', flexDirection:'column', gap:20}}>
          {/* 제목 */}
          <div>
            <label style={{display:'block', fontSize:13, color:'var(--color-text-2)', marginBottom:6}}>제목 *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="사이트 이름 또는 제목"
              style={{width:'100%', background:'var(--color-bg-3)', border:'1px solid var(--color-border-2)', borderRadius:8, padding:'10px 12px', color:'var(--color-text)', fontSize:14, outline:'none', boxSizing:'border-box'}}
            />
          </div>

          {/* URL */}
          <div>
            <label style={{display:'block', fontSize:13, color:'var(--color-text-2)', marginBottom:6}}>URL *</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              style={{width:'100%', background:'var(--color-bg-3)', border:'1px solid var(--color-border-2)', borderRadius:8, padding:'10px 12px', color:'var(--color-text)', fontSize:14, outline:'none', boxSizing:'border-box'}}
            />
            {faviconUrl && (
              <div style={{display:'flex', alignItems:'center', gap:6, marginTop:8}}>
                <img src={faviconUrl} width={16} height={16} alt="" style={{borderRadius:3}} />
                <span style={{fontSize:12, color:'var(--color-text-3)'}}>파비콘 자동 감지</span>
              </div>
            )}
          </div>

          {/* 분류 (refType) — 라디오 방식 */}
          <div>
            <label style={{display:'block', fontSize:13, color:'var(--color-text-2)', marginBottom:10}}>분류</label>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {REF_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setRefType(t.value)}
                  style={{
                    padding:'6px 14px',
                    borderRadius:20,
                    border: refType === t.value ? '1px solid var(--color-blue)' : '1px solid var(--color-border-2)',
                    background: refType === t.value ? 'rgba(59,130,246,0.15)' : 'var(--color-bg-3)',
                    color: refType === t.value ? 'var(--color-blue)' : 'var(--color-text-2)',
                    fontSize:13,
                    cursor:'pointer',
                    transition:'all 0.15s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 카테고리 태그 */}
          <div>
            <label style={{display:'block', fontSize:13, color:'var(--color-text-2)', marginBottom:6}}>분류 태그 (선택)</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="예: design, frontend, ai"
              style={{width:'100%', background:'var(--color-bg-3)', border:'1px solid var(--color-border-2)', borderRadius:8, padding:'10px 12px', color:'var(--color-text)', fontSize:14, outline:'none', boxSizing:'border-box'}}
            />
          </div>

          {/* 설명 */}
          <div>
            <label style={{display:'block', fontSize:13, color:'var(--color-text-2)', marginBottom:6}}>설명 / 메모</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              placeholder="이 레퍼런스에 대한 메모"
              style={{width:'100%', background:'var(--color-bg-3)', border:'1px solid var(--color-border-2)', borderRadius:8, padding:'10px 12px', color:'var(--color-text)', fontSize:14, outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'var(--font-sans)'}}
            />
          </div>

          {/* 버튼 */}
          <div style={{display:'flex', gap:10}}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
            <button className="btn btn-ghost" onClick={() => router.back()} disabled={saving}>
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
