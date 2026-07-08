import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import CopyButton from '@/components/CopyButton'
import StudyToc from './StudyToc'

const catLabel: Record<string, string> = {
  image: '이미지',
  video: '영상',
  prompt: '프롬프트',
  research: '리서치',
  website: '웹사이트',
  etc: '기타',
}

const catClass: Record<string, string> = {
  image: 'cat-design',
  video: 'cat-video',
  prompt: 'cat-purple',
  research: 'cat-research',
  website: 'cat-cyan',
  etc: 'cat-plan',
}

function formatStudiedAt(date: Date | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  const today = new Date()
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  const formatted = d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return isToday ? `${formatted} (오늘)` : formatted
}

function isYouTube(url: string) {
  return /youtu\.be|youtube\.com/.test(url)
}

function getYouTubeEmbedUrl(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export default async function StudyDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const note = await prisma.studyNote.findUnique({ where: { id } })

  if (!note || !note.published) notFound()

  // 이전 / 다음 (published, id 기준)
  const [prev, next] = await Promise.all([
    prisma.studyNote.findFirst({
      where: { published: true, id: { lt: id } },
      orderBy: { id: 'desc' },
      select: { id: true, title: true },
    }),
    prisma.studyNote.findFirst({
      where: { published: true, id: { gt: id } },
      orderBy: { id: 'asc' },
      select: { id: true, title: true },
    }),
  ])

  const tags = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const embedUrl = note.mediaUrl && isYouTube(note.mediaUrl)
    ? getYouTubeEmbedUrl(note.mediaUrl)
    : null

  // TOC 섹션 (실제로 존재하는 것만)
  const sections = [
    note.mediaUrl && { id: 'sd-preview', label: '미리보기' },
    note.content && { id: 'sd-note', label: '노트' },
    note.prompt && { id: 'sd-prompt', label: '프롬프트' },
    tags.length > 0 && { id: 'sd-tags', label: '태그' },
  ].filter(Boolean) as { id: string; label: string }[]

  return (
    <div className="sd-wrap">
      <article className="sd-main">
        {/* 브레드크럼 */}
        <div className="sd-crumb">
          <Link href="/study">스터디룸</Link>
          <span className="sep">/</span>
          <span className="here">{note.title}</span>
        </div>

        {/* 헤더 */}
        <header>
          <div className="sd-chips">
            {note.category && (
              <span className={`cat-badge ${catClass[note.category] ?? ''}`}>
                {catLabel[note.category] ?? note.category}
              </span>
            )}
            {note.tool && <span className="sd-tool">{note.tool}</span>}
          </div>

          <h1 className="sd-title">{note.title}</h1>

          <div className="sd-meta">
            {note.studiedAt && (
              <div className="sd-meta-item">
                <i className="ti ti-calendar" style={{ fontSize: 14 }} />
                {formatStudiedAt(note.studiedAt)}
              </div>
            )}
            {note.category && (
              <div className="sd-meta-item">
                <i className="ti ti-folder" style={{ fontSize: 14 }} />
                {catLabel[note.category] ?? note.category}
              </div>
            )}
            {note.siteUrl && (
              <a href={note.siteUrl} target="_blank" rel="noopener noreferrer" className="sd-site">
                <i className="ti ti-world" style={{ fontSize: 13 }} />
                웹사이트 바로가기
                <i className="ti ti-external-link" style={{ fontSize: 11, opacity: 0.7 }} />
              </a>
            )}
          </div>
        </header>

        {/* 미디어 — 16:9 히어로 */}
        {note.mediaUrl && (
          <section id="sd-preview" className="sd-section" style={{ marginTop: 0 }}>
            <div className="sd-hero">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={note.mediaUrl}
                  alt={note.title}
                  className={note.category === 'image' ? 'contain' : ''}
                />
              )}
            </div>
            {!embedUrl && (
              <a href={note.mediaUrl} target="_blank" rel="noopener noreferrer" className="sd-caption">
                <i className="ti ti-external-link" style={{ fontSize: 12 }} />
                원본 링크 열기
              </a>
            )}
          </section>
        )}

        {/* 노트 본문 */}
        {note.content && (
          <section id="sd-note" className="sd-section">
            <div className="sd-eyebrow">
              <h2>노트</h2>
            </div>
            <div className="sd-prose">{note.content}</div>
          </section>
        )}

        {/* 프롬프트 — 라벨 코드블록 */}
        {note.prompt && (
          <section id="sd-prompt" className="sd-section">
            <div className="sd-code">
              <div className="sd-code-bar">
                <span>Prompt</span>
                <CopyButton text={note.prompt} />
              </div>
              <pre>{note.prompt}</pre>
            </div>
          </section>
        )}

        {/* 태그 */}
        {tags.length > 0 && (
          <section id="sd-tags" className="sd-section">
            <div className="sd-eyebrow">
              <h2>태그</h2>
            </div>
            <div className="sd-tags">
              {tags.map(tag => (
                <span key={tag} className="sd-tag">#{tag}</span>
              ))}
            </div>
          </section>
        )}

        {/* 이전 / 다음 */}
        {(prev || next) && (
          <nav className="sd-nav">
            {prev ? (
              <Link href={`/study/${prev.id}`} className="sd-navcard prev">
                <span className="dir"><i className="ti ti-arrow-left" style={{ fontSize: 12 }} />이전</span>
                <span className="t">{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/study/${next.id}`} className="sd-navcard next">
                <span className="dir">다음<i className="ti ti-arrow-right" style={{ fontSize: 12 }} /></span>
                <span className="t">{next.title}</span>
              </Link>
            ) : <span />}
          </nav>
        )}
      </article>

      {/* 우측 TOC */}
      <aside className="sd-toc">
        <StudyToc sections={sections} />
      </aside>
    </div>
  )
}
