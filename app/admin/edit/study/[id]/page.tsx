'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function EditStudyPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [form, setForm] = useState({
    title: '', content: '', category: 'image', tool: '',
    prompt: '', mediaUrl: '', tags: '', published: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch(`/api/study?id=${id}`).then(r => r.json()).then(data => {
      if (data) setForm(data)
      setLoading(false)
    })
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/study/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    router.push('/admin')
  }

  if (status !== 'authenticated' || loading) return null

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Admin</div>
        <h1 className="hero-title">스터디 노트 <b>편집</b></h1>
      </div>
      <form onSubmit={submit} style={{ maxWidth: 640 }}>
        <div className="admin-card">
          <div className="form-group">
            <label className="form-label">제목 *</label>
            <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">카테고리</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {['image', 'design', 'video', '3d', 'plan'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">사용 툴</label>
              <input className="form-input" value={form.tool ?? ''} onChange={e => set('tool', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">내용</label>
            <textarea className="form-textarea" value={form.content ?? ''} onChange={e => set('content', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">프롬프트</label>
            <textarea className="form-textarea" value={form.prompt ?? ''} onChange={e => set('prompt', e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
          </div>
          <div className="form-group">
            <label className="form-label">이미지 URL</label>
            <input className="form-input" value={form.mediaUrl ?? ''} onChange={e => set('mediaUrl', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">태그 (쉼표 구분)</label>
            <input className="form-input" value={form.tags ?? ''} onChange={e => set('tags', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '저장 중...' : '수정 저장'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => router.back()}>취소</button>
          </div>
        </div>
      </form>
    </>
  )
}
