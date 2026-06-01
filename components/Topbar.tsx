'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Sidebar from './Sidebar'

const greetings = [
  '오늘도 좋은 하루!',
  'AI 트렌드를 탐색하세요',
  '새로운 발견이 기다려요',
  '무엇을 배울까요?',
]

export default function Topbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dateStr, setDateStr] = useState('')
  const [greeting, setGreeting] = useState('')
  const { data: session } = useSession()

  useEffect(() => {
    const now = new Date()
    setDateStr(now.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }))
    setGreeting(greetings[now.getHours() % greetings.length])
  }, [])

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <header className="aihub-topbar">
        <div className="topbar-left">
          <button
            className="topbar-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="메뉴 열기"
          >
            <i className="ti ti-menu-2" />
          </button>
          <span className="topbar-date">{dateStr}</span>
          <span className="topbar-greeting">{greeting}</span>
        </div>
        <div className="topbar-right">
          <span className="topbar-pill">
            <i className="ti ti-robot" />
            AI Hub
          </span>
          {session ? (
            <Link href="/admin" className="topbar-icon-btn" title="관리자">
              <i className="ti ti-settings" />
            </Link>
          ) : (
            <Link href="/admin/login" className="topbar-icon-btn" title="로그인">
              <i className="ti ti-user" />
            </Link>
          )}
        </div>
      </header>
    </>
  )
}
