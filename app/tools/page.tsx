import { databaseEnabled, prisma } from '@/lib/db'
import ToolsClient from './ToolsClient'

export const revalidate = 3600

export default async function ToolsPage() {
  if (!databaseEnabled) {
    return (
      <div className="page-hero">
        <div className="hero-eyebrow">Tool Library</div>
        <h1 className="hero-title">데이터베이스 연결이 필요합니다</h1>
        <div className="hero-meta">DATABASE_URL을 설정하면 툴 라이브러리를 볼 수 있습니다.</div>
      </div>
    )
  }

  const tools = await prisma.aiTool.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } })

  return <ToolsClient tools={tools} />
}