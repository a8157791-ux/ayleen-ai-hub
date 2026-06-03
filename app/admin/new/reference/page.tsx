'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface FormState {
  url: string
  title: string
  refType: string
  category: string
  desc: string
  faviconUrl: string
}

export default function NewReferencePage() {
  const { status } = useSession()
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    url: '', title: '', refType: 'website', category: '', desc: '', faviconUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }))

  // URL 입력 후 AI 자동 분석
  const analyzeUrl = async () => {
    if (!form.url || !form.url.startsWith('http')) {
      setAnalyzeError('올바른 URL을 입력해주세요 (http:// 또는 https://)')
      return
    }
    setAnalyzeError('')
    setAnalyzing(true)

    try {
      // 1) favicon 추출 (Google favicon API)
      const urlObj = new URL(form.url)
      const favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`

      // 2) Claude API로 URL 요약
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `당신은 웹사이트 URL을 분석해 핵심 정보를 추출하는 도우미입니다.
응답은 반드시 아래 JSON 형식만 출력하세요. 마크다운 코드블록 없이 순수 JSON만:
{
  "title": "사이트/페이지 제목 (한글 또는 영문, 간결하게)",
  "desc": "이 사이트가 무엇인지 2-3문장 한국어 요약. 어떤 서비스/콘텐츠인지, 누구에게 유용한지 포함.",
  "category": "AI / 디자인 / 개발 / 영상 / 뉴스 / 레퍼런스 중 가장 적합한 것 하나",
  "refType": "website / portfolio / tool / article / inspiration 중 하나"
}`,
          messages: [
            {
              role: 'user',
              content: `이 URL을 분석해주세요: ${form.url}

URL 구조와 도메인을 보고 어떤 사이트인지 추론해서 JSON을 작성해주세요.
실제 크롤링이 불가능하더라도 URL에서 파악할 수 있는 정보를 최대한 활용해주세요.`,
            },
          ],
        }),
      })

      if (!res.ok) throw new Error('API 오류')
      const data = await res.json()
      const text = data.content?.[0]?.text ?? ''

      // JSON 파싱
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      setForm(f => ({
        ...f,
        title: parsed.title || f.title,
        desc: parsed.desc || f.desc,
        category: parsed.category || f.category,
        refType: parsed.refType || f.refType,
        faviconUrl: favicon,
      }))
    } catch (err) {
      console.error(err)
      // favicon만 최소한 자동 입력
      try {
        const urlObj = new URL(form.url)
        const favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`
        setForm(f => ({ ...f, faviconUrl: favicon }))
      } catch {}
      setAnalyzeError('AI 분석에 실패했어요. 직접 입력해주세요.')
    } finally {
      setAnalyzing(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.url) return
    setSaving(true)
    await fetch('/api/reference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    router.push('/admin')
  }

  if (status !== 'authenticated') return null

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Admin</div>
        <h1 className="hero-title">레퍼런스 <b>추가</b></h1>
      </div>

      <form onSubmit={submit} style={{ maxWidth: 640 }}>
        <div className="admin-card">

          {/* URL 입력 + AI 분석 버튼 */}
          <div className="form-group">
            <label className="form-label">URL *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                value={form.url}
                onChange={e => set('url', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), analyzeUrl())}
                required
                placeholder="https://..."
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={analyzeUrl}
                disabled={analyzing}
                style={{ flexShrink: 0, minWidth: 110 }}
              >
                {analyzing ? (
                  <>
                    <i className="ti ti-loader" style={{ animation: 'spin 1s linear infinite' }} />
                    분석 중...
                  </>
                ) : (
                  <>
                    <i className="ti ti-sparkles" />
                    AI 분석
                  </>
                )}
              </button>
            </div>
            {analyzeError && (
              <div style={{ color: '#ef4444', fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 4 }}>
                {analyzeError}
              </div>
            )}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-3)', marginTop: 4 }}>
              URL 입력 후 AI 분석 버튼을 누르면 제목·요약·카테고리를 자동으로 채워줍니다
            </div>
          </div>

          {/* favicon 미리보기 */}
          {form.faviconUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '8px 12px', background: 'var(--color-bg-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <img src={form.faviconUrl} alt="" style={{ width: 16, height: 16 }} onError={e => (e.currentTarget.style.display = 'none')} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-3)' }}>favicon 자동 수집됨</span>
            </div>
          )}

          {/* 제목 */}
          <div className="form-group">
            <label className="form-label">제목</label>
            <input
              className="form-input"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="AI가 자동 입력 또는 직접 입력"
            />
          </div>

          {/* 타입 + 카테고리 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">타입</label>
              <select className="form-select" value={form.refType} onChange={e => set('refType', e.target.value)}>
                {['website', 'portfolio', 'tool', 'article', 'inspiration'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
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

          {/* 설명 */}
          <div className="form-group">
            <label className="form-label">설명</label>
            <textarea
              className="form-textarea"
              value={form.desc}
              onChange={e => set('desc', e.target.value)}
              placeholder="AI가 자동 요약 또는 직접 입력"
              style={{ minHeight: 80 }}
            />
          </div>

          {/* favicon URL (숨겨진 필드 — 직접 수정 가능) */}
          <details style={{ marginBottom: 16 }}>
            <summary style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-3)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              고급 설정
            </summary>
            <div className="form-group" style={{ marginTop: 10 }}>
              <label className="form-label">Favicon URL</label>
              <input
                className="form-input"
                value={form.faviconUrl}
                onChange={e => set('faviconUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </details>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={saving || !form.url}>
              {saving ? '저장 중...' : '저장'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
              취소
            </button>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </>
  )
}
