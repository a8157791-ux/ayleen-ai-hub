'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CategorySelect } from '@/components/CategoryManager'
import { fetchConfig, DEFAULT_CONFIGS } from '@/lib/config'

export default function NewSavedPage() {
  const { status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [linkTypes, setLinkTypes] = useState<string[]>(DEFAULT_CONFIGS.saved_categories)
  const [form, setForm] = useState({
    title: '',
    url: '',
    linkType: DEFAULT_CONFIGS.saved_categories[0],
    category: '',
    memo: '',
  })

  useEffect(() => {
    fetchConfig('saved_categories').then(types => {
      setLinkTypes(types)
      setForm(f => ({ ...f, linkType: types[0] ?? f.linkType }))
    })
  }, [])

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.url.trim()) return alert('제목과 URL을 입력해주세요.')
    setSaving(true)
    const res = await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) router.push('/admin')
    else alert('저장 실패')
  }

  if (status !== 'authenticated') return null

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Admin</div>
        <h1 className="hero-title">저장한 글 <b>추가</b></h1>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div className="admin-card">

          <div className="form-group">
            <label className="form-label">제목 *</label>
            <input
              className="form-input"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="저장할 콘텐츠 제목"
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL *</label>
            <input
              className="form-input"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          {/* linkType을 CategorySelect로 관리 */}
          <CategorySelect
            configKey="saved_categories"
            value={form.linkType}
            categories={linkTypes}
            onChange={val => setForm(f => ({ ...f, linkType: val }))}
            onCategoriesChange={setLinkTypes}
          />

          <div className="form-group">
            <label className="form-label">분류 태그 (선택)</label>
            <input
              className="form-input"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              placeholder="예: AI, 디자인, 개발..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">메모</label>
            <textarea
              className="form-textarea"
              value={form.memo}
              onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
              placeholder="저장 이유, 메모..."
              style={{ minHeight: 80 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSubmit} disabled={saving} className="btn btn-primary">
              {saving ? '저장 중...' : '저장'}
            </button>
            <button onClick={() => router.push('/admin')} className="btn btn-ghost">취소</button>
          </div>

        </div>
      </div>
    </>
  )
}
