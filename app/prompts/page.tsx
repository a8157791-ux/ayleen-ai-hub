'use client'
import { useEffect, useState } from 'react'

interface Prompt { id: number; title: string; body: string; category?: string; tool?: string; createdAt: string }

const catLabel: Record<string, string> = { image: 'Image', video: 'Video', text: 'Text', system: 'System' }
const catColors: Record<string, string> = {
  image: 'var(--color-cyan)', video: 'var(--color-pink)',
  text: 'var(--color-purple)', system: 'var(--color-green)',
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [cat, setCat] = useState('')
  const [copied, setCopied] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/prompts${cat ? `?cat=${cat}` : ''}`)
      .then(r => r.json()).then(setPrompts)
  }, [cat])

  const copy = async (id: number, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1800)
  }

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Prompt Archive</div>
        <h1 className="hero-title">프롬프트 <b>보관함</b></h1>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button onClick={() => setCat('')} className={`tab-btn ${!cat ? 'active' : ''}`}>전체</button>
        {Object.entries(catLabel).map(([val, label]) => (
          <button key={val} onClick={() => setCat(val)} className={`tab-btn ${cat === val ? 'active' : ''}`}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {prompts.map(p => (
          <div key={p.id} style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 8px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                {p.category && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: catColors[p.category] ?? 'var(--color-text-3)' }}>
                    {catLabel[p.category] ?? p.category}
                  </span>
                )}
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--color-text)', marginTop: 2 }}>{p.title}</div>
              </div>
              <button
                onClick={() => copy(p.id, p.body)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 9, color: copied === p.id ? 'var(--color-green)' : 'var(--color-text-3)', padding: '3px 7px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
              >
                <i className={`ti ${copied === p.id ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: 12 }} />
                {copied === p.id ? '복사됨' : '복사'}
              </button>
            </div>
            <div style={{ padding: 12, fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.65, color: 'var(--color-text-2)', background: 'var(--color-bg-3)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {p.body}
            </div>
            <div style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-3)', display: 'flex', gap: 8 }}>
              {p.tool && <span>{p.tool}</span>}
              <span>{new Date(p.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
        ))}
        {prompts.length === 0 && (
          <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            아직 프롬프트가 없습니다.
          </div>
        )}
      </div>
    </>
  )
}
