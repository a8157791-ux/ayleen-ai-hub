'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CategorySelect } from '@/components/CategoryManager'
import { fetchConfig, DEFAULT_CONFIGS } from '@/lib/config'

export default function NewToolPage() {
  const { status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<string[]>(DEFAULT_CONFIGS.tool_categories)
  const [form, setForm] = useState({
    name: '',
    description: '',
    url: '',
    category: DEFAULT_CONFIGS.tool_categories[0],
    pricing: 'free',
    rating: '',
    review: '',
    published: true,
  })

  useEffect(() => {
    fetchConfig('tool_categories').then(cats => {
      setCategories(cats)
      setForm(f => ({ ...f, category: cats[0] ?? f.category }))
    })
  }, [])

  const handleSubmit = async () => {
    if (!form.name.trim()) return alert('툴 이름을 입력해주세요.')
    setSaving(true)
    const res = await fetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        rating: form.rating ? parseFloat(form.rating) : null,
      }),
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
        <h1 className="hero-title">AI 툴 <b>추가</b></h1>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div className="admin-card">

          <div className="form-group">
            <label className="form-label">툴 이름 *</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="예: Midjourney"
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL</label>
            <input
              className="form-input"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <CategorySelect
            configKey="tool_categories"
            value={form.category}
            categories={categories}
            onChange={val => setForm(f => ({ ...f, category: val }))}
            onCategoriesChange={setCategories}
          />

          <div className="form-group">
            <label className="form-label">가격 정책</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['free', 'freemium', 'paid'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, pricing: p }))}
                  style={{
                    padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontFamily: 'var(--font-mono)',
                    background: form.pricing === p ? 'var(--color-blue)' : 'var(--color-bg-3)',
                    color: form.pricing === p ? '#fff' : 'var(--color-text-2)',
                    transition: 'all 0.15s',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">설명</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="툴 설명"
              style={{ minHeight: 80 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">평점 (0~5)</label>
              <input
                type="number"
                min="0" max="5" step="0.1"
                className="form-input"
                value={form.rating}
                onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
                placeholder="4.5"
              />
            </div>
            <div className="form-group">
              <label className="form-label">한줄 리뷰</label>
              <input
                className="form-input"
                value={form.review}
                onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
                placeholder="짧은 리뷰"
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: 'var(--color-blue)' }}
              />
              <span className="form-label" style={{ margin: 0 }}>공개</span>
            </label>
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
