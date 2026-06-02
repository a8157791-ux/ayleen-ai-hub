'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Tab = 'news' | 'study' | 'tools' | 'prompts' | 'saved' | 'reference'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('news')
  const [collecting, setCollecting] = useState(false)
  const [toast, setToast] = useState('')
  const [items, setItems] = useState<Record<string, any>[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') fetchItems()
  }, [tab, status])

  const fetchItems = async () => {
    const endpoints: Record<Tab, string> = {
      news: '/api/news?limit=200',
      study: '/api/study',
      tools: '/api/tools?admin=1',
      prompts: '/api/prompts?admin=1',
      saved: '/api/saved',
      reference: '/api/reference',
    }
    const res = await fetch(endpoints[tab])
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
  }

  const collectNews = async () => {
    setCollecting(true)
    setToast('')
    const res = await fetch('/api/news', { method: 'POST' })
    const data = await res.json()
    setCollecting(false)
    if (data.ok) {
      setToast(`✓ ${data.created}건 새로 수집 (중복 ${data.skipped}건 제외)`)
      fetchItems()
    } else {
      setToast('수집 실패: ' + (data.error ?? '알 수 없는 오류'))
    }
    setTimeout(() => setToast(''), 4000)
  }

  const deleteItem = async (id: number) => {
    if (!confirm('삭제할까요?')) return
    const endpoints: Record<Tab, string> = {
      news: '/api/news', study: '/api/study', tools: '/api/tools',
      prompts: '/api/prompts', saved: '/api/saved', reference: '/api/reference',
    }
    await fetch(`${endpoints[tab]}/${id}`, { method: 'DELETE' })
    fetchItems()
  }

  if (status === 'loading') return null
  if (status === 'unauthenticated') return null

  const tabs: { id: Tab; label: string }[] = [
    { id: 'news', label: 'AI 뉴스' },
    { id: 'study', label: '스터디 노트' },
    { id: 'tools', label: '툴 라이브러리' },
    { id: 'prompts', label: '프롬프트' },
    { id: 'saved', label: '저장한 글' },
    { id: 'reference', label: '레퍼런스' },
  ]

  // edit 경로 매핑 (saved, reference, news는 편집 없음)
  const editPath: Partial<Record<Tab, string>> = {
    study: 'study',
    tools: 'tools',
    prompts: 'prompts',
  }

  return (
    <>
      <div className="page-hero">
        <div className="hero-eyebrow">Admin Panel</div>
        <h1 className="hero-title">관리자 <b>패널</b></h1>
        <div className="hero-meta">{session?.user?.email}</div>
      </div>

      <div className="admin-card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={collectNews} className="btn btn-primary" disabled={collecting}>
          <i className="ti ti-refresh" />
          {collecting ? 'AI 뉴스 수집 중...' : 'AI 뉴스 지금 수집'}
        </button>
        <Link href="/admin/new/study" className="btn btn-ghost">
          <i className="ti ti-plus" /> 스터디 노트 추가
        </Link>
        <Link href="/admin/new/tool" className="btn btn-ghost">
          <i className="ti ti-plus" /> 툴 추가
        </Link>
        <Link href="/admin/new/prompt" className="btn btn-ghost">
          <i className="ti ti-plus" /> 프롬프트 추가
        </Link>
        <Link href="/admin/new/saved" className="btn btn-ghost">
          <i className="ti ti-plus" /> 링크 저장
        </Link>
        <Link href="/admin/new/reference" className="btn btn-ghost">
          <i className="ti ti-plus" /> 레퍼런스 추가
        </Link>
      </div>

      <div className="tab-bar" style={{ marginBottom: 16 }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>제목</th>
              <th style={{ width: 80 }}>카테고리</th>
              <th style={{ width: 100 }}>날짜</th>
              <th style={{ width: 80 }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id as number}>
                <td style={{ maxWidth: 400 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(item.title ?? item.name ?? item.url) as string}
                  </div>
                  {item.url && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.url as string}
                    </div>
                  )}
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                    {(item.category ?? item.linkType ?? item.refType ?? '—') as string}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-3)' }}>
                  {new Date(item.createdAt as string).toLocaleDateString('ko-KR')}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {editPath[tab] && (
                      <Link href={`/admin/edit/${editPath[tab]}/${item.id}`} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10 }}>
                        편집
                      </Link>
                    )}
                    <button onClick={() => deleteItem(item.id as number)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 10 }}>
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', fontSize: 11, padding: '24px' }}>
                  항목 없음
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className={`toast ${toast.startsWith('✓') ? 'success' : 'error'}`}>
          {toast}
        </div>
      )}
    </>
  )
}
