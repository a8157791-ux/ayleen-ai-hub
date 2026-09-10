'use client'
import { useState } from 'react'
import Link from 'next/link'
import EditorialCard from '@/components/EditorialCard'

const catLabel: Record<string, string> = {
  image: 'Image', design: 'Design', video: 'Video', '3d': '3D', plan: 'Planning',
}

type Note = {
  id: number
  title: string
  category: string | null
  tool: string | null
  mediaUrl: string | null
  studiedAt: Date | null   // ← 추가
  createdAt: Date
}

function isYouTube(url: string) {
  return /youtu\.be|youtube\.com/.test(url)
}

function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
}

function getThumbSrc(mediaUrl: string | null): string | null {
  if (!mediaUrl) return null
  if (isYouTube(mediaUrl)) return getYouTubeThumbnail(mediaUrl)
  return mediaUrl
}

export default function StudyClient({ notes, total }: { notes: Note[], total: number }) {
  const [cat, setCat] = useState<string | null>(null)
  const [failedThumbs, setFailedThumbs] = useState<Set<number>>(new Set())
  const filtered = cat ? notes.filter(n => n.category === cat) : notes

  const markFailed = (id: number) => setFailedThumbs(prev => new Set(prev).add(id))

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

      <div className="editorial-grid compact-grid study-archive-grid">
        {filtered.map(note => {
          const thumbSrc = !failedThumbs.has(note.id) ? getThumbSrc(note.mediaUrl) : null
          return (
            <EditorialCard compact key={note.id} href={`/study/${note.id}`} title={note.title}
              image={thumbSrc} eyebrow={note.tool || (note.category ? catLabel[note.category] : 'STUDY')}
              date={new Date(note.studiedAt ?? note.createdAt)} />
          )
        })}
        {filtered.length === 0 && (
          <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, gridColumn: '1/-1' }}>
            아직 스터디 노트가 없습니다.
          </div>
        )}
      </div>
    </>
  )
}
