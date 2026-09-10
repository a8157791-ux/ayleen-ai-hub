'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { X } from '@phosphor-icons/react'
import EditorialCard from '@/components/EditorialCard'
import EditorialImage from '@/components/EditorialImage'
import CopyButton from '@/components/CopyButton'

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

type NoteDetail = Note & {
  content: string | null
  prompt: string | null
  siteUrl: string | null
  tags: string | null
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
  const [selected, setSelected] = useState<NoteDetail | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const filtered = cat ? notes.filter(n => n.category === cat) : notes

  useEffect(() => {
    const dialog = dialogRef.current
    if (selected && dialog && !dialog.open) {
      previousFocus.current = document.activeElement as HTMLElement
      dialog.showModal()
      document.body.classList.add('dialog-open')
    }
    return () => document.body.classList.remove('dialog-open')
  }, [selected])

  function closeDialog() {
    dialogRef.current?.close()
    document.body.classList.remove('dialog-open')
    setSelected(null)
    previousFocus.current?.focus()
  }

  async function openNote(note: Note, event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (loadingId) return
    setLoadingId(note.id)
    try {
      const response = await fetch(`/api/study/${note.id}`)
      if (!response.ok) throw new Error('Failed to load study note')
      setSelected(await response.json())
    } catch {
      window.location.href = `/study/${note.id}`
    } finally {
      setLoadingId(null)
    }
  }

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
          const thumbSrc = getThumbSrc(note.mediaUrl)
          return (
            <div className={`study-card-shell${loadingId === note.id ? ' loading' : ''}`} key={note.id}>
              <EditorialCard compact href={`/study/${note.id}`} title={note.title}
                image={thumbSrc} eyebrow={note.tool || (note.category ? catLabel[note.category] : 'STUDY')}
                date={new Date(note.studiedAt ?? note.createdAt)} onClick={(event) => openNote(note, event)} />
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, gridColumn: '1/-1' }}>
            아직 스터디 노트가 없습니다.
          </div>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className="study-story-dialog"
        aria-labelledby="study-dialog-title"
        onCancel={(event) => { event.preventDefault(); closeDialog() }}
        onClick={(event) => { if (event.target === dialogRef.current) closeDialog() }}
      >
        {selected && (
          <article className="study-dialog-body">
            <button className="study-dialog-close" onClick={closeDialog} aria-label="글 닫기">
              <X size={21} weight="thin" />
            </button>
            <div className="study-dialog-image">
              <EditorialImage src={getThumbSrc(selected.mediaUrl)} alt={selected.title} priority />
            </div>
            <div className="study-dialog-content">
              <div className="study-dialog-meta">
                <span>{selected.tool || (selected.category ? catLabel[selected.category] : 'STUDY')}</span>
                <time>{new Date(selected.studiedAt ?? selected.createdAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}</time>
              </div>
              <h2 id="study-dialog-title">{selected.title}</h2>
              {selected.content && <div className="study-dialog-copy">{selected.content}</div>}
              {selected.prompt && (
                <div className="study-dialog-prompt">
                  <header><span>PROMPT</span><CopyButton text={selected.prompt} /></header>
                  <pre>{selected.prompt}</pre>
                </div>
              )}
              {selected.tags && <div className="study-dialog-tags">
                {selected.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => <span key={tag}>#{tag}</span>)}
              </div>}
              <footer className="study-dialog-footer">
                {selected.siteUrl && <a href={selected.siteUrl} target="_blank" rel="noopener noreferrer">관련 사이트 열기 <i className="ti ti-arrow-up-right" /></a>}
                <Link href={`/study/${selected.id}`}>전체 페이지로 열기 <i className="ti ti-arrow-right" /></Link>
              </footer>
            </div>
          </article>
        )}
      </dialog>
    </>
  )
}
