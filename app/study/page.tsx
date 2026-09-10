import { databaseEnabled, prisma } from '@/lib/db'
import StudyClient from './StudyClient'

export const revalidate = 600

export default async function StudyPage() {
  const notes = databaseEnabled ? await prisma.studyNote.findMany({
    where: { published: true },
    orderBy: [{ studiedAt: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      category: true,
      tool: true,
      mediaUrl: true,
      content: true,
      prompt: true,
      siteUrl: true,
      tags: true,
      studiedAt: true,
      createdAt: true,
    },
  }) : []

  return <StudyClient notes={notes} total={notes.length} />
}
