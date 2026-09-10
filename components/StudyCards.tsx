'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { X } from '@phosphor-icons/react'
import EditorialCard from './EditorialCard'
import EditorialImage from './EditorialImage'
import CopyButton from './CopyButton'

export type StudyCardNote = {
  id: number
  title: string
  category: string | null
  tool: string | null
  mediaUrl: string | null
  studiedAt: Date | string | null
  createdAt: Date | string
  content?: string | null
  prompt?: string | null
  siteUrl?: string | null
  tags?: string | null
}

const categoryLabel: Record<string, string> = {
  image: 'Image', design: 'Design', video: 'Video', '3d': '3D', plan: 'Planning',
}

function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
}

function getThumbSrc(mediaUrl: string | null): string | null {
  if (!mediaUrl) return null
  return /youtu\.be|youtube\.com/.test(mediaUrl) ? getYouTubeThumbnail(mediaUrl) : mediaUrl
}

export default function StudyCards({
  notes,
  className,
  showDescription = false,
}: {
  notes: StudyCardNote[]
  className: string
  showDescription?: boolean
}) {
  const [selected, setSelected] = useState<StudyCardNote | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

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

  function openNote(note: StudyCardNote, event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setSelected(note)
  }

  return (
    <>
      <div className={className}>
        {notes.map(note => (
          <div className="study-card-shell" key={note.id}>
            <EditorialCard
              compact
              href={`/study/${note.id}`}
              title={note.title}
              image={getThumbSrc(note.mediaUrl)}
              eyebrow={note.tool || (note.category ? categoryLabel[note.category] : 'STUDY')}
              description={showDescription && note.content ? note.content.replace(/<[^>]+>/g, '').slice(0, 90) : null}
              date={new Date(note.studiedAt ?? note.createdAt)}
              onClick={event => openNote(note, event)}
            />
          </div>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="study-story-dialog"
        aria-labelledby="study-dialog-title"
        onCancel={event => { event.preventDefault(); closeDialog() }}
        onClick={event => { if (event.target === dialogRef.current) closeDialog() }}
      >
        {selected && (
          <article className="study-dialog-body">
            <button className="study-dialog-close" onClick={closeDialog} aria-label="글 닫기">
              <X size={21} weight="thin" />
            </button>
            <div className="study-dialog-image">
              <EditorialImage src={getThumbSrc(selected.mediaUrl)} alt={selected.title} priority sizes="(max-width: 760px) 92vw, 740px" />
            </div>
            <div className="study-dialog-content">
              <div className="study-dialog-meta">
                <span>{selected.tool || (selected.category ? categoryLabel[selected.category] : 'STUDY')}</span>
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
              {selected.tags && (
                <div className="study-dialog-tags">
                  {selected.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => <span key={tag}>#{tag}</span>)}
                </div>
              )}
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
