import { prisma } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function StudyDetailPage({ params }: { params: { id: string } }) {
  const note = await prisma.studyNote.findUnique({ where: { id: Number(params.id) } })
  if (!note || !note.published) notFound()

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Link href="/study" style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          <i className="ti ti-arrow-left" /> 스터디룸으로
        </Link>
      </div>

      <div style={{ maxWidth: 720 }}>
        <div className="hero-eyebrow">{note.tool ?? 'Study Note'}</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px,4vw,32px)', color: 'var(--color-text)', marginBottom: 12, lineHeight: 1.3 }}>
          {note.title}
        </h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-3)', marginBottom: 24 }}>
          {note.createdAt.toLocaleDateString('ko-KR')}
        </div>

        {note.mediaUrl && (
          <div style={{ marginBottom: 28, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <img src={note.mediaUrl} alt={note.title} style={{ width: '100%', display: 'block' }} />
          </div>
        )}

        {note.content && (
          <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--color-text-2)', marginBottom: 24, whiteSpace: 'pre-wrap' }}>
            {note.content}
          </div>
        )}

        {note.prompt && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
              사용한 프롬프트
            </div>
            <div style={{ background: 'var(--color-bg-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 16, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7, color: 'var(--color-text-2)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {note.prompt}
            </div>
          </div>
        )}

        {note.tags && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {note.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
              <span key={tag} style={{ background: 'var(--color-bg-3)', border: '1px solid var(--color-border)', borderRadius: 20, padding: '2px 10px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-3)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
