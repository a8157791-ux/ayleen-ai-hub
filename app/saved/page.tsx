import { prisma } from '@/lib/db'
import SavedClient from './SavedClient'

export const revalidate = 0

export default async function SavedPage() {
  const links = await prisma.savedLink.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return <SavedClient links={links} />
}
