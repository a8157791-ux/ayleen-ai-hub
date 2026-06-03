import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'

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
  const note = await prisma.studyNote.findUnique({
    where: { id: parseInt(params.id) },
  })

  if (!note || !note.published) notFound()

  const tags = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const embedUrl = note.mediaUrl && isYouTube(note.mediaUrl)
    ? getYouTubeEmbedUrl(note.mediaUrl)
    : null

  return (
    <div className="page-container">
      {/* 브레드크럼 */}
      <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'20px'}}>
        <Link href="/study" style={{color:'var(--color-text-3)', fontSize:'13px', textDecoration:'none'}}>
          스터디룸
        </Link>
        <span style={{color:'var(--color-text-3)', fontSize:'13px'}}>/</span>
        <span style={{color:'var(--color-text-2)', fontSize:'13px'}}>{note.title}</span>
      </div>

      {/* 헤더 */}
      <div style={{marginBottom:'28px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px', flexWrap:'wrap'}}>
          {note.category && (
            <span className={`cat-badge ${catClass[note.category] ?? ''}`}>
              {catLabel[note.category] ?? note.category}
            </span>
          )}
          {note.tool && (
            <span style={{
              fontSize:'11px', padding:'3px 8px',
              background:'var(--color-bg-3)', color:'var(--color-text-2)',
              border:'1px solid var(--color-border)', borderRadius:'5px',
              fontFamily:'var(--font-mono)',
            }}>
              {note.tool}
            </span>
          )}
        </div>

        <h1 style={{
          fontFamily:'var(--font-serif)', fontSize:'clamp(22px, 4vw, 32px)',
          color:'var(--color-text)', lineHeight:1.4, marginBottom:'14px',
        }}>
          {note.title}
        </h1>

        {/* 메타 행 — 날짜 + 웹사이트 바로가기 */}
        <div style={{display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap'}}>
          {note.studiedAt && (
            <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
              <i className="ti ti-calendar" style={{fontSize:'14px', color:'var(--color-text-3)'}} />
              <span style={{
                fontSize:'12px', color:'var(--color-text-3)',
                fontFamily:'var(--font-mono)',
              }}>
                {formatStudiedAt(note.studiedAt)}
              </span>
            </div>
          )}

          {note.siteUrl && (
            <a
              href={note.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:'inline-flex', alignItems:'center', gap:'6px',
                padding:'5px 12px',
                background:'rgba(59,130,246,0.1)',
                border:'1px solid rgba(59,130,246,0.25)',
                borderRadius:'20px',
                color:'var(--color-blue)',
                fontSize:'12px',
                textDecoration:'none',
                transition:'all 0.15s',
              }}
            >
              <i className="ti ti-world" style={{fontSize:'13px'}} />
              웹사이트 바로가기
              <i className="ti ti-external-link" style={{fontSize:'11px', opacity:0.7}} />
            </a>
          )}
        </div>
      </div>

      {/* 미디어 — YouTube 임베드 or 이미지 */}
      {note.mediaUrl && (
        <div style={{marginBottom:'28px'}}>
          {embedUrl ? (
            <div style={{
              position:'relative', paddingTop:'56.25%',
              background:'var(--color-bg-2)', borderRadius:'12px', overflow:'hidden',
              border:'1px solid var(--color-border)',
            }}>
              <iframe
                src={embedUrl}
                style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none'}}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{borderRadius:'12px', overflow:'hidden', border:'1px solid var(--color-border)'}}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={note.mediaUrl}
                alt={note.title}
                style={{width:'100%', maxHeight:'480px', objectFit:'contain', background:'var(--color-bg-2)', display:'block'}}
              />
            </div>
          )}
          {!embedUrl && (
            <a
              href={note.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:'inline-flex', alignItems:'center', gap:'4px',
                marginTop:'8px', fontSize:'11px', color:'var(--color-text-3)',
                textDecoration:'none',
              }}
            >
              <i className="ti ti-external-link" style={{fontSize:'12px'}} />
              원본 링크 열기
            </a>
          )}
        </div>
      )}

      {/* 본문 */}
      {note.content && (
        <div style={{
          background:'var(--color-bg-2)', border:'1px solid var(--color-border)',
          borderRadius:'12px', padding:'24px', marginBottom:'20px',
        }}>
          <h2 style={{
            fontSize:'12px', fontFamily:'var(--font-mono)', color:'var(--color-text-3)',
            letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'14px',
          }}>
            NOTE
          </h2>
          <p style={{
            fontSize:'15px', lineHeight:1.8, color:'var(--color-text)',
            whiteSpace:'pre-wrap', wordBreak:'break-word',
          }}>
            {note.content}
          </p>
        </div>
      )}

      {/* 프롬프트 */}
      {note.prompt && (
        <div style={{
          background:'rgba(167,139,250,0.06)', border:'1px solid rgba(167,139,250,0.15)',
          borderRadius:'12px', padding:'20px', marginBottom:'20px',
        }}>
          <h2 style={{
            fontSize:'12px', fontFamily:'var(--font-mono)', color:'var(--color-purple)',
            letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'12px',
          }}>
            PROMPT
          </h2>
          <p style={{
            fontSize:'14px', lineHeight:1.7, color:'var(--color-text-2)',
            whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:'var(--font-mono)',
          }}>
            {note.prompt}
          </p>
        </div>
      )}

      {/* 태그 */}
      {tags.length > 0 && (
        <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
          {tags.map(tag => (
            <span
              key={tag}
              style={{
                fontSize:'11px', padding:'4px 10px',
                background:'var(--color-bg-3)', color:'var(--color-text-3)',
                border:'1px solid var(--color-border)', borderRadius:'20px',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}