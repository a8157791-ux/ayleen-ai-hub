'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CategorySelect } from '@/components/CategoryManager'
import { fetchConfig, DEFAULT_CONFIGS } from '@/lib/config'

export default function NewReferencePage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [refTypes, setRefTypes] = useState<string[]>(DEFAULT_CONFIGS.ref_categories)
  const [form, setForm] = useState({
    title: '',
    url: '',
    refType: DEFAULT_CONFIGS.ref_categories[0],
    category: '',
    desc: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchConfig('ref_categories').then(types => {
      setRefTypes(types)
      setForm(f => ({ ...f, refType: types[0] ?? f.refType }))
    })
  }, [])

  function getFaviconUrl(inputUrl: string) {
    try {
      const domain = new URL(inputUrl).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch { return null }
  }

  const faviconUrl = form.url ? getFaviconUrl(form.url) : null

  async function handleSubmit() {
    if (!form.title.trim() || !form.url.trim()) {
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
          title: form.title.trim(),
          url: form.url.trim(),
          refType: form.refType,
          category: form.category.trim() || null,
          desc: form.desc.trim() || null,
          faviconUrl: faviconUrl || null,
        }),
      })
      if (!res.ok) throw new Error('저장 실패')
      router.push('/admin')
    } catch {
      setError('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (status !== 'authenticated') return null

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Admin</div>
        <h1 className="hero-title">레퍼런스 <b>추가</b></h1>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div className="admin-card">
          {error && (
            <div style={{
              padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8,
              color: '#f87171', fontSize: 13, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {/* 제목 */}
          <div className="form-group">
            <label className="form-label">제목 *</label>
            <input
              className="form-input"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="사이트 이름 또는 제목"
            />
          </div>

          {/* URL */}
          <div className="form-group">
            <label className="form-label">URL *</label>
            <input
              type="url"
              className="form-input"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com"
            />
            {faviconUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <img src={faviconUrl} width={16} height={16} alt="" style={{ borderRadius: 3 }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>파비콘 자동 감지</span>
              </div>
            )}
          </div>

          {/* 분류 (refType) — CategorySelect 방식 */}
          <CategorySelect
            configKey="ref_categories"
            value={form.refType}
            categories={refTypes}
            onChange={val => setForm(f => ({ ...f, refType: val }))}
            onCategoriesChange={setRefTypes}
          />

          {/* 분류 태그 */}
          <div className="form-group">
            <label className="form-label">분류 태그 (선택)</label>
            <input
              className="form-input"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              placeholder="예: design, frontend, ai"
            />
          </div>

          {/* 설명 */}
          <div className="form-group">
            <label className="form-label">설명 / 메모</label>
            <textarea
              className="form-textarea"
              value={form.desc}
              onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="이 레퍼런스에 대한 메모"
              style={{ minHeight: 80 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
            <button className="btn btn-ghost" onClick={() => router.back()} disabled={saving}>
              취소
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
