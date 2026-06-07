import { prisma } from '@/lib/db'
import ReferenceClient from './ReferenceClient'

export const revalidate = 0

export default async function ReferencePage() {
  const refs = await prisma.reference.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return <ReferenceClient refs={refs} />
}
