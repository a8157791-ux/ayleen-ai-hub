import { databaseEnabled, prisma } from '@/lib/db'
import StudyClient from './StudyClient'

export const revalidate = 3600

export default async function StudyPage() {
  if (!databaseEnabled) {
    return (
      <div className="page-hero">
        <div className="hero-eyebrow">Study Room</div>
        <h1 className="hero-title">데이터베이스 연결이 필요합니다</h1>
        <div className="hero-meta">DATABASE_URL을 설정하면 스터디 기록을 볼 수 있습니다.</div>
      </div>
    )
  }

  const [notes, total] = await Promise.all([
    prisma.studyNote.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } }),
    prisma.studyNote.count({ where: { published: true } }),
  ])

  return <StudyClient notes={notes} total={total} />
}