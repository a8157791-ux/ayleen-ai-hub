'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function EditToolPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [form, setForm] = useState({ name: '', description: '', url: '', category: 'image', pricing: 'free', rating: 0, review: '', published: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    // fetch single item via list and filter
    fetch('/api/tools').then(r => r.json()).then((data: {id: number}[]) => {
      const item = data.find(t => t.id === Number(id))
      if (item) setForm(item as typeof form)
      setLoading(false)
    })
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/tools/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    router.push('/admin')
  }

  if (status !== 'authenticated' || loading) return null

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Admin</div>
        <h1 className="hero-title">AI 툴 <b>편집</b></h1>
      </div>
      <form onSubmit={submit} style={{ maxWidth: 640 }}>
        <div className="admin-card">
          <div className="form-group">
            <label className="form-label">툴 이름 *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">카테고리</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {['image','video','3d','code','plan','music'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">가격</label>
              <select className="form-select" value={form.pricing} onChange={e => set('pricing', e.target.value)}>
                {['free','freemium','paid'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">평점</label>
              <input type="number" min={0} max={5} step={0.5} className="form-input" value={form.rating} onChange={e => set('rating', Number(e.target.value))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">URL</label>
            <input className="form-input" value={form.url ?? ''} onChange={e => set('url', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">한줄평</label>
            <input className="form-input" value={form.review ?? ''} onChange={e => set('review', e.target.value)} />
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
