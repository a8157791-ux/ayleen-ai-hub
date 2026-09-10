'use client'
import { useState } from 'react'
import StudyCards, { type StudyCardNote } from '@/components/StudyCards'

const catLabel: Record<string, string> = {
  image: 'Image', design: 'Design', video: 'Video', '3d': '3D', plan: 'Planning',
}

export default function StudyClient({ notes, total }: { notes: StudyCardNote[], total: number }) {
  const [cat, setCat] = useState<string | null>(null)
  const filtered = cat ? notes.filter(n => n.category === cat) : notes

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Study Room</div>
        <h1 className="hero-title">스터디 <b>룸</b></h1>
        <div className="hero-meta">총 {total}건의 학습 기록</div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button onClick={() => setCat(null)} className={`tab-btn ${!cat ? 'active' : ''}`}>전체</button>
        {Object.entries(catLabel).map(([val, label]) => (
          <button key={val} onClick={() => setCat(val)} className={`tab-btn ${cat === val ? 'active' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <StudyCards notes={filtered} className="editorial-grid compact-grid study-archive-grid" />
      ) : (
          <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, gridColumn: '1/-1' }}>
            아직 스터디 노트가 없습니다.
          </div>
      )}
    </>
  )
}
