import { prisma } from '@/lib/db'
import StudyClient from './StudyClient'

export const dynamic = 'force-dynamic'

export default async function StudyPage() {
  const notes = await prisma.studyNote.findMany({
    where: { published: true },
    orderBy: [{ studiedAt: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      category: true,
      tool: true,
      mediaUrl: true,
      studiedAt: true,
      createdAt: true,
    },
  })

  return <StudyClient notes={notes} total={notes.length} />
}
