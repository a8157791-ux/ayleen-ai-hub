import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const refs = await prisma.reference.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(refs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch references' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, url, refType, category, desc, faviconUrl } = body

    if (!title || !url) {
      return NextResponse.json({ error: 'title and url are required' }, { status: 400 })
    }

    const ref = await prisma.reference.create({
      data: {
        title,
        url,
        refType: refType || 'website',
        category: category || null,
        desc: desc || null,
        faviconUrl: faviconUrl || null,
      },
    })

    return NextResponse.json(ref, { status: 201 })
  } catch (error) {
    console.error('Reference POST error:', error)
    return NextResponse.json({ error: 'Failed to create reference' }, { status: 500 })
  }
}
