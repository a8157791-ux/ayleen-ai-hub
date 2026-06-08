import { prisma } from '@/lib/db'
import ReferenceClient from './ReferenceClient'

export const revalidate = 0

export default async function ReferencePage() {
  const [refs, savedLinks] = await Promise.all([
    prisma.reference.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.savedLink.findMany({
      where: { linkType: 'keep' },
      select: { id: true, url: true },
    }),
  ])

  const savedUrls: Record<string, number> = {}
  for (const s of savedLinks) {
    savedUrls[s.url] = s.id
  }

  return <ReferenceClient refs={refs} savedUrls={savedUrls} />
}
