'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CategorySelect } from '@/components/CategoryManager'
import { fetchConfig, DEFAULT_CONFIGS } from '@/lib/config'

export default function NewReferencePage() {
  const { status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [refTypes, setRefTypes] = useState<string[]>(DEFAULT_CONFIGS.ref_categories)
  const [form, setForm] = useState({
    title: '',
    url: '',
    refType: DEFAULT_CONFIGS.ref_categories[0],
    category: '',
    desc: '',
    faviconUrl: '',
  })

  useEffect(() => {
    fetchConfig('ref_categories').then(types => {
      setRefTypes(types)
      setForm(f => ({ ...f, refType: types[0] ?? f.refType }))
    })
  }, [])

  // URL 입력 시 파비콘 자동 세팅
  const handleUrlChange = (url: string) => {
    setForm(f => {
      let faviconUrl = f.faviconUrl
      try {
        const domain = new URL(url).hostname
        faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      } catch {}
      return { ...f, url, faviconUrl }
    })
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.url.trim()) return alert('제목과 URL을 입력해주세요.')
    setSaving(true)
    const res = await fetch('/api/reference', {
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
        <h1 className="hero-title">레퍼런스 <b>추가</b></h1>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div className="admin-card">

          <div className="form-group">
            <label className="form-label">제목 *</label>
            <input
              className="form-input"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="레퍼런스 제목"
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL *</label>
            <input
              className="form-input"
              value={form.url}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="https://..."
            />
            {form.faviconUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <img src={form.faviconUrl} alt="" style={{ width: 16, height: 16, borderRadius: 3 }} />
                <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}>
                  파비콘 자동 감지
                </span>
              </div>
            )}
          </div>

          {/* refType을 CategorySelect로 관리 */}
          <CategorySelect
            configKey="ref_categories"
            value={form.refType}
            categories={refTypes}
            onChange={val => setForm(f => ({ ...f, refType: val }))}
            onCategoriesChange={setRefTypes}
          />

          <div className="form-group">
            <label className="form-label">분류 태그 (선택)</label>
            <input
              className="form-input"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              placeholder="예: AI, 디자인, 포트폴리오..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">설명 / 메모</label>
            <textarea
              className="form-textarea"
              value={form.desc}
              onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="왜 저장했는지, 어디서 발견했는지 등"
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
