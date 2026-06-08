'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CategorySelect } from '@/components/CategoryManager'
import { fetchConfig, DEFAULT_CONFIGS } from '@/lib/config'

export default function EditReferencePage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [refTypes, setRefTypes] = useState<string[]>(DEFAULT_CONFIGS.ref_categories)
  const [form, setForm] = useState({
    url: '', title: '', refType: DEFAULT_CONFIGS.ref_categories[0],
    category: '', desc: '', faviconUrl: '', imageUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [itemFound, setItemFound] = useState(true)
  const [ogFetching, setOgFetching] = useState(false)
  const fetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/reference?admin=1').then(r => r.json()),
      fetchConfig('ref_categories'),
    ]).then(([data, types]) => {
      setRefTypes(types)
      const item = data.find((e: any) => String(e.id) === String(id))
      if (item) {
        setForm({
          url: item.url ?? '',
          title: item.title ?? '',
          refType: item.refType ?? types[0] ?? 'website',
          category: item.category ?? '',
          desc: item.desc ?? '',
          faviconUrl: item.faviconUrl ?? '',
          imageUrl: item.imageUrl ?? '',
        })
        setItemFound(true)
      } else {
        setItemFound(false)
      }
      setLoading(false)
    })
  }, [id])

  // URL 변경 시 og 자동 파싱 (imageUrl 비어있을 때만)
  useEffect(() => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current)
    const url = form.url.trim()
    if (!url.startsWith('http') || form.imageUrl) return

    fetchTimer.current = setTimeout(async () => {
      setOgFetching(true)
      try {
        const res = await fetch(`/api/fetch-og?url=${encodeURIComponent(url)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.imageUrl) setForm(f => ({ ...f, imageUrl: data.imageUrl }))
          if (data.title && !form.title.trim()) setForm(f => ({ ...f, title: data.title }))
          if (data.desc && !form.desc.trim()) setForm(f => ({ ...f, desc: data.desc }))
        }
      } catch { }
      finally { setOgFetching(false) }
    }, 800)

    return () => { if (fetchTimer.current) clearTimeout(fetchTimer.current) }
  }, [form.url])

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
  if (!itemFound) return (
    <div className="page-hero">
      <div className="hero-eyebrow">Admin</div>
      <h1 className="hero-title">레퍼런스 <b>편집</b></h1>
      <p style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        해당 레퍼런스를 찾을 수 없습니다.
      </p>
    </div>
  )

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Admin</div>
        <h1 className="hero-title">레퍼런스 <b>편집</b></h1>
      </div>

      <form onSubmit={submit} style={{ maxWidth: 640 }}>
        <div className="admin-card">
          <div className="form-group">
            <label className="form-label">제목</label>
            <input className="form-input" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="사이트 제목" />
          </div>

          <div className="form-group">
            <label className="form-label">URL *</label>
            <input className="form-input" value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))} required placeholder="https://..." />
          </div>

          <CategorySelect
            configKey="ref_categories"
            value={form.refType}
            categories={refTypes}
            onChange={val => setForm(f => ({ ...f, refType: val }))}
            onCategoriesChange={setRefTypes}
          />

          <div className="form-group">
            <label className="form-label">분류 태그</label>
            <input className="form-input" value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              placeholder="AI / 디자인 / 개발..." />
          </div>

          <div className="form-group">
            <label className="form-label">설명</label>
            <textarea className="form-textarea" value={form.desc}
              onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              style={{ minHeight: 80 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Favicon URL</label>
            <input className="form-input" value={form.faviconUrl}
              onChange={e => setForm(f => ({ ...f, faviconUrl: e.target.value }))} placeholder="https://..." />
          </div>

          {/* 썸네일 이미지 */}
          <div className="form-group">
            <label className="form-label">
              썸네일 이미지 URL
              {ogFetching && <span style={{ fontSize: 11, color: 'var(--color-text-3)', marginLeft: 8 }}>불러오는 중...</span>}
            </label>
            <input className="form-input" value={form.imageUrl}
              onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
            {form.imageUrl && (
              <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
                <img
                  src={form.imageUrl}
                  alt="preview"
                  style={{ width: '100%', maxWidth: 400, height: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border)' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                  style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: 4, padding: '2px 7px', fontSize: 12, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '저장 중...' : '수정 저장'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => router.back()}>취소</button>
          </div>
        </div>
      </form>
    </>
  )
}
