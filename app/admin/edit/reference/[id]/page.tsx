'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

const REF_TYPES = ['website', 'portfolio', 'tool', 'article', 'inspiration']

export default function EditReferencePage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [form, setForm] = useState({
    url: '',
    title: '',
    refType: 'website',
    category: '',
    desc: '',
    faviconUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [itemFound, setItemFound] = useState(true)
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch('/api/reference?admin=1')
      .then(r => r.json())
      .then((data: any[]) => {
        const item = data.find((entry: any) => String(entry.id) === String(id))
        if (item) {
          setForm({
            url: item.url ?? '',
            title: item.title ?? '',
            refType: item.refType ?? 'website',
            category: item.category ?? '',
            desc: item.desc ?? '',
            faviconUrl: item.faviconUrl ?? '',
          })
          setItemFound(true)
        } else {
          setItemFound(false)
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.url.trim()) return alert('URL을 입력해주세요.')
    setSaving(true)
    const res = await fetch(`/api/reference/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) router.push('/admin')
    else alert('저장에 실패했습니다.')
  }

  if (status !== 'authenticated' || loading) return null
  if (!itemFound) {
    return (
      <div className="page-hero">
        <div className="hero-eyebrow">Admin</div>
        <h1 className="hero-title">레퍼런스 <b>편집</b></h1>
        <p style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          해당 레퍼런스를 찾을 수 없습니다.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Admin</div>
        <h1 className="hero-title">레퍼런스 <b>편집</b></h1>
      </div>

      <form onSubmit={submit} style={{ maxWidth: 640 }}>
        <div className="admin-card">
          <div className="form-group">
            <label className="form-label">URL *</label>
            <input
              className="form-input"
              value={form.url}
              onChange={e => set('url', e.target.value)}
              required
              placeholder="https://..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">제목</label>
            <input
              className="form-input"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="사이트 제목"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">타입</label>
              <select className="form-select" value={form.refType} onChange={e => set('refType', e.target.value)}>
                {REF_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">카테고리</label>
              <input
                className="form-input"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                placeholder="AI / 디자인 / 개발..."
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">설명</label>
            <textarea
              className="form-textarea"
              value={form.desc}
              onChange={e => set('desc', e.target.value)}
              style={{ minHeight: 100 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Favicon URL</label>
            <input
              className="form-input"
              value={form.faviconUrl}
              onChange={e => set('faviconUrl', e.target.value)}
              placeholder="https://..."
            />
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
