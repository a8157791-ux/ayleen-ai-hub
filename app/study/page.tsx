import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'
import StudyClient from './StudyClient'

export const dynamic = 'force-dynamic'

const getPublishedStudyNotes = unstable_cache(
  () => prisma.studyNote.findMany({
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
  }),
  ['published-study-notes'],
  { revalidate: 600, tags: ['study-notes'] },
)

export default async function StudyPage() {
  const notes = await getPublishedStudyNotes()

  return <StudyClient notes={notes} total={notes.length} />
}
