'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function NewSavedPage() {
  const { status } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({ url: '', title: '', linkType: 'article', category: '', memo: '' })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/saved', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    router.push('/admin')
  }

  if (status !== 'authenticated') return null

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Admin</div>
        <h1 className="hero-title">링크 <b>저장</b></h1>
      </div>
      <form onSubmit={submit} style={{ maxWidth: 640 }}>
        <div className="admin-card">
          <div className="form-group">
            <label className="form-label">URL *</label>
            <input className="form-input" value={form.url} onChange={e => set('url', e.target.value)} required placeholder="https://..." />
          </div>
          <div className="form-group">
            <label className="form-label">제목</label>
            <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">타입</label>
              <select className="form-select" value={form.linkType} onChange={e => set('linkType', e.target.value)}>
                {['youtube', 'instagram', 'article', 'news'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">분야</label>
              <input className="form-input" value={form.category} onChange={e => set('category', e.target.value)} placeholder="AI, 디자인..." />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">메모</label>
            <textarea className="form-textarea" value={form.memo} onChange={e => set('memo', e.target.value)} style={{ minHeight: 80 }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => router.back()}>취소</button>
          </div>
        </div>
      </form>
    </>
  )
}
