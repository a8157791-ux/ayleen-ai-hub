import Link from 'next/link'
import EditorialCard from '@/components/EditorialCard'
import { databaseEnabled, prisma } from '@/lib/db'

export const revalidate = 1800

const categoryLabel: Record<string, string> = {
  design: 'DESIGN', code: 'CODING', video: 'VIDEO', '3d': '3D',
  plan: 'PLANNING', research: 'RESEARCH', image: 'IMAGE',
}

function SectionTitle({ title, caption, href }: { title: string; caption: string; href: string }) {
  return (
    <header className="edit-section-heading">
      <div><h2>{title}</h2><p>{caption}</p></div>
      <Link href={href}>전체보기 <span>↗</span></Link>
    </header>
  )
}

export default async function HomePage() {
  let news: any[] = []
  let studies: any[] = []
  let references: any[] = []
  let tools: any[] = []

  if (!databaseEnabled && process.env.AYLEEN_DEMO === '1') {
    const now = new Date()
    const covers = ['ai-editorial.webp', 'chrome.webp', 'brand.webp', 'default-editorial.webp']
    news = [
      ['새로운 창작의 방식을 탐구하다', 'AI와 함께 발견한 새로운 창작의 기준'],
      ['아이디어를 형태로 만드는 AI', '생각을 빠르게 시각화하고 비교하는 방법'],
      ['브랜드의 다음 가능성', '기술과 문화 사이에서 발견한 새로운 인상'],
      ['질문을 다듬는 작은 습관', null], ['내 작업에 맞는 AI 워크플로', null],
      ['결과보다 과정을 기록하기', null], ['정보를 나의 인사이트로 바꾸기', null],
    ].map((item, index) => ({ id: index + 1, title: item[0], titleKo: item[0], summaryKo: item[1], url: '#', source: 'Creative edit', category: 'design', createdAt: now, imageUrl: `/images/${covers[index % 4]}` }))
    references = [
      ['형태와 여백의 새로운 균형', 'architecture.webp'], ['타이포그래피로 만드는 인상', 'typography.webp'],
      ['디지털 경험의 작은 차이', 'glass.webp'], ['차분한 화면을 만드는 여백', null],
      ['재료에서 발견한 새로운 감각', null], ['오래 보고 싶은 색의 조합', null], ['편집 디자인의 작은 리듬', null],
    ].map((item, index) => ({ id: index + 1, title: item[0], url: '#', imageUrl: item[1] ? `/images/${item[1]}` : null, refType: 'inspiration', category: 'design', desc: index < 3 ? '오래 들여다보고 싶은 시각적 기준을 수집합니다.' : null, createdAt: now }))
    studies = ['Ayleen’s AI Hub 만들기', '무선 헤드폰 포스터', '포트폴리오 사이트 제작', '나만의 학습 노트 정리하기']
      .map((title, index) => ({ id: index + 1, title, mediaUrl: null, tool: ['BUILD', 'CHATGPT', 'FIGMA', 'NOTES'][index], category: 'design', content: '배우고 직접 시도한 과정을 짧게 기록합니다.', createdAt: now, studiedAt: now }))
    tools = ['Figma', 'ChatGPT', 'Aside', 'Notion'].map((name, index) => ({ id: index + 1, name, category: 'workflow', description: '생각을 발견하고 작업으로 옮길 때 사용하는 도구', url: '#' }))
  }

  if (databaseEnabled) {
    try {
      ;[news, studies, references, tools] = await Promise.all([
        prisma.aiNews.findMany({ orderBy: { createdAt: 'desc' }, take: 7 }),
        prisma.studyNote.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
        prisma.reference.findMany({ orderBy: { createdAt: 'desc' }, take: 7 }),
        prisma.aiTool.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
      ])
    } catch (error) {
      console.error('Home page DB error:', error)
    }
  }

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  })

  return (
    <>
      <div className="edit-date"><time>{today}</time></div>

      <section className="edit-section">
        <SectionTitle title="지금 주목할 AI" caption="THE CURRENT EDIT" href="/news" />
        {news.length ? (
          <>
            <div className="editorial-grid featured-grid">
              {news.slice(0, 3).map((item, index) => (
                <EditorialCard key={item.id} href={item.url} external title={item.titleKo || item.title}
                  image={item.imageUrl} eyebrow={categoryLabel[item.category] || item.source || 'AI'}
                  description={item.summaryKo || item.summary} date={item.publishedAt || item.createdAt} priority={index < 3} />
              ))}
            </div>
            {news.length > 3 && <div className="editorial-grid compact-grid separated-grid">
              {news.slice(3).map(item => <EditorialCard compact key={item.id} href={item.url} external
                title={item.titleKo || item.title} image={item.imageUrl}
                eyebrow={categoryLabel[item.category] || item.source || 'AI'} date={item.publishedAt || item.createdAt} />)}
            </div>}
          </>
        ) : <EmptySection text="아직 표시할 인사이트가 없어요." />}
      </section>

      <section className="edit-section">
        <SectionTitle title="영감을 넓히는 레퍼런스" caption="SELECTED REFERENCES" href="/reference" />
        {references.length ? (
          <>
            <div className="editorial-grid featured-grid">
              {references.slice(0, 3).map(ref => <EditorialCard key={ref.id} href={ref.url} external
                title={ref.title || ref.url} image={ref.imageUrl} eyebrow={ref.refType || ref.category || 'REFERENCE'}
                description={ref.desc} date={ref.createdAt} />)}
            </div>
            {references.length > 3 && <div className="editorial-grid compact-grid separated-grid">
              {references.slice(3).map(ref => <EditorialCard compact key={ref.id} href={ref.url} external
                title={ref.title || ref.url} image={ref.imageUrl} eyebrow={ref.refType || ref.category || 'REFERENCE'} date={ref.createdAt} />)}
            </div>}
          </>
        ) : <EmptySection text="아직 표시할 레퍼런스가 없어요." />}
      </section>

      <section className="edit-section tools-home">
        <SectionTitle title="작업에 도움이 되는 도구" caption="TOOLS FOR THOUGHT" href="/tools" />
        {tools.length ? <div className="home-tools-grid">{tools.map(tool => (
          <a key={tool.id} href={tool.url || '/tools'} target={tool.url ? '_blank' : undefined} rel="noopener noreferrer" className="home-tool-card">
            <span>{tool.category || 'TOOL'}</span><h3>{tool.name}</h3><p>{tool.description || tool.review || '작업에 활용하는 도구입니다.'}</p><b>↗</b>
          </a>
        ))}</div> : <EmptySection text="아직 표시할 도구가 없어요." />}
      </section>

      <section className="edit-section">
        <SectionTitle title="배우고, 직접 해본 것들" caption="NOTES IN PROGRESS" href="/study" />
        {studies.length ? <div className="editorial-grid compact-grid study-home-grid">
          {studies.map(note => <EditorialCard compact key={note.id} href={`/study/${note.id}`}
            title={note.title} image={note.mediaUrl} eyebrow={note.tool || note.category || 'STUDY'}
            description={note.content ? note.content.replace(/<[^>]+>/g, '').slice(0, 90) : null}
            date={note.studiedAt || note.createdAt} />)}
        </div> : <EmptySection text="아직 표시할 스터디 기록이 없어요." />}
      </section>
    </>
  )
}

function EmptySection({ text }: { text: string }) {
  return <div className="edit-empty"><span>[ e ]</span><p>{text}</p>{!databaseEnabled && <small>로컬 미리보기에는 DATABASE_URL이 연결되어 있지 않습니다.</small>}</div>
}
