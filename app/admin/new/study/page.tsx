'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const CATEGORIES = [
  { value: 'image', label: '이미지' },
  { value: 'video', label: '영상' },
  { value: 'prompt', label: '프롬프트' },
  { value: 'research', label: '리서치' },
  { value: 'website', label: '웹사이트' },
  { value: 'etc', label: '기타' },
]

export default function NewStudyPage() {
  const { status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    category: 'image',
    tool: '',
    content: '',
    prompt: '',
    siteUrl: '',
    mediaUrl: '',
    tags: '',
    studiedAt: new Date().toISOString().slice(0, 10),
    published: true,
  })

  const setToday = () => {
    setForm(f => ({ ...f, studiedAt: new Date().toISOString().slice(0, 10) }))
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert('제목을 입력해주세요.')
    setSaving(true)
    const res = await fetch('/api/study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        studiedAt: form.studiedAt ? new Date(form.studiedAt).toISOString() : null,
      }),
    })
    setSaving(false)
    if (res.ok) router.push('/admin')
    else alert('저장 실패')
  }

  if (status !== 'authenticated') return null

  const isWebsite = form.category === 'website'
  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Admin</div>
        <h1 className="hero-title">스터디 노트 <b>추가</b></h1>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div className="admin-card">

          {/* 제목 */}
          <div className="form-group">
            <label className="form-label">제목 *</label>
            <input
              className="form-input"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="스터디 노트 제목"
            />
          </div>

          {/* 카테고리 + 사용 툴 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">카테고리</label>
              <select
                className="form-select"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">사용 툴</label>
              <input
                className="form-input"
                value={form.tool}
                onChange={e => setForm(f => ({ ...f, tool: e.target.value }))}
                placeholder="예: Claude, Midjourney"
              />
            </div>
          </div>

          {/* 공부 날짜 */}
          <div className="form-group">
            <label className="form-label">공부 날짜</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="date"
                className="form-input"
                style={{ flex: 1 }}
                value={form.studiedAt}
                onChange={e => setForm(f => ({ ...f, studiedAt: e.target.value }))}
              />
              <button
                type="button"
                onClick={setToday}
                className="btn btn-ghost"
                style={{
                  background: form.studiedAt === todayStr ? 'var(--color-blue)' : undefined,
                  color: form.studiedAt === todayStr ? '#fff' : undefined,
                  flexShrink: 0,
                }}
              >
                오늘
              </button>
            </div>
          </div>

          {/* 웹사이트 URL */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              웹사이트 URL
              {isWebsite && (
                <span style={{
                  fontSize: 9, padding: '2px 6px',
                  background: 'rgba(6,182,212,0.15)', color: 'var(--color-cyan)',
                  borderRadius: 4, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  website 카테고리
                </span>
              )}
            </label>
            <input
              className="form-input"
              value={form.siteUrl}
              onChange={e => setForm(f => ({ ...f, siteUrl: e.target.value }))}
              placeholder="https://example.com"
              style={isWebsite ? { borderColor: 'rgba(6,182,212,0.3)' } : {}}
            />
          </div>

          {/* 내용 */}
          <div className="form-group">
            <label className="form-label">내용</label>
            <textarea
              className="form-textarea"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="공부한 내용, 메모, 링크 등"
              style={{ minHeight: 120 }}
            />
          </div>

          {/* 프롬프트 */}
          <div className="form-group">
            <label className="form-label">프롬프트</label>
            <textarea
              className="form-textarea"
              value={form.prompt}
              onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
              placeholder="사용한 프롬프트 (선택)"
              style={{ minHeight: 80 }}
            />
          </div>

          {/* 이미지/영상 URL */}
          <div className="form-group">
            <label className="form-label">
              이미지 / 영상 URL
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-3)', marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Imgur · YouTube · Vimeo 등 외부 링크
              </span>
            </label>
            <input
              className="form-input"
              value={form.mediaUrl}
              onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))}
              placeholder="https://i.imgur.com/... 또는 https://youtu.be/..."
            />
            {form.mediaUrl && (
              <a
                href={form.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  marginTop: 6, fontSize: 11, color: 'var(--color-blue)', textDecoration: 'none',
                }}
              >
                <i className="ti ti-external-link" style={{ fontSize: 12 }} />
                미리보기 열기
              </a>
            )}
          </div>

          {/* 태그 */}
          <div className="form-group">
            <label className="form-label">
              태그
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-3)', marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                쉼표 구분
              </span>
            </label>
            <input
              className="form-input"
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="웹사이트, 영어, 스터디"
            />
          </div>

          {/* 공개 여부 */}
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

          {/* 버튼 */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="btn btn-ghost"
            >
              취소
            </button>
          </div>

        </div>
      </div>
    </>
  )
}