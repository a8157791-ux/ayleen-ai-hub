'use client'

import { useEffect, useState } from 'react'
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
    category: '', desc: '', faviconUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [itemFound, setItemFound] = useState(true)

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
        })
        setItemFound(true)
      } else {
        setItemFound(false)
      }
      setLoading(false)
    })
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

          {/* 분류 — CategorySelect */}
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
