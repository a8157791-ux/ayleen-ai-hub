import { prisma } from '@/lib/db'
import Link from 'next/link'

const catLabel: Record<string, string> = {
  image: 'Image', design: 'Design', video: 'Video', '3d': '3D', plan: 'Planning',
}

export const revalidate = 60

export default async function StudyPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }> | { cat?: string }
}) {
  const resolved = await Promise.resolve(searchParams)
  const cat = resolved.cat
  const where = { published: true, ...(cat ? { category: cat } : {}) }

  const [notes, total] = await Promise.all([
    prisma.studyNote.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.studyNote.count({ where: { published: true } }),
  ])

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Study Room</div>
        <h1 className="hero-title">스터디 <b>룸</b></h1>
        <div className="hero-meta">총 {total}건의 학습 기록</div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <a href="/study" className={`tab-btn ${!cat ? 'active' : ''}`}>전체</a>
        {Object.entries(catLabel).map(([val, label]) => (
          <a key={val} href={`/study?cat=${val}`} className={`tab-btn ${cat === val ? 'active' : ''}`}>
            {label}
          </a>
        ))}
      </div>

      <div className="cards-grid">
        {notes.map(note => (
          <Link key={note.id} href={`/study/${note.id}`} className="content-card">
            <div className="card-thumb">
              {note.mediaUrl ? (
                <img src={note.mediaUrl} alt={note.title} loading="lazy" />
              ) : (
                <i className="ti ti-photo-ai" style={{ fontSize: 32, color: 'var(--color-blue)', opacity: 0.35 }} />
              )}
              {note.category && (
                <span className="card-thumb-badge">{catLabel[note.category] ?? note.category}</span>
              )}
            </div>
            <div className="card-body">
              {note.category && (
                <div className={`card-cat cat-${note.category}`}>{catLabel[note.category] ?? note.category}</div>
              )}
              <div className="card-title">{note.title}</div>
              <div className="card-footer">
                {note.tool && <><span>{note.tool}</span><span className="card-footer-dot" /></>}
                <span>{note.createdAt.toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </Link>
        ))}
        {notes.length === 0 && (
          <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, gridColumn: '1/-1' }}>
            아직 스터디 노트가 없습니다.
          </div>
        )}
      </div>
    </>
  )
}
