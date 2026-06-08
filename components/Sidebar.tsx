'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

const mainNav = [
  { href: '/', label: '오늘의 AI', icon: 'ti-layout-dashboard' },
  { href: '/news', label: '트렌드 보드', icon: 'ti-trending-up' },
  { href: '/tools', label: '툴 라이브러리', icon: 'ti-tool' },
  { href: '/reference', label: '레퍼런스', icon: 'ti-bookmark' },
]

const myNav = [
  { href: '/study', label: '스터디룸', icon: 'ti-book' },
  { href: '/saved', label: '저장한 글', icon: 'ti-heart' },
]

let _setOpen: ((v: boolean | ((prev: boolean) => boolean)) => void) | null = null
export function toggleSidebar() {
  _setOpen?.(prev => !prev)
}

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    _setOpen = setOpen
    return () => { _setOpen = null }
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`sidebar-overlay${open ? ' active' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* 사이드바 */}
      <aside className={`aihub-sidebar${open ? ' open' : ''}`}>

        {/* 로고 */}
        <div className="sb-logo">
          <Link href="/">
            <div className="sb-logo-name">
              Ayleen<span>.</span>AI
            </div>
            <div className="sb-logo-sub">Trend Archive</div>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="sb-nav">
          <div className="sb-group">
            <div className="sb-group-label">Main</div>
            {mainNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-item${isActive(item.href) ? ' active' : ''}`}
              >
                <i className={`ti ${item.icon}`} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="sb-group">
            <div className="sb-group-label">My</div>
            {myNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-item${isActive(item.href) ? ' active' : ''}`}
              >
                <i className={`ti ${item.icon}`} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="sb-divider" />

          {session ? (
            <>
              <Link
                href="/admin"
                className={`sb-item${isActive('/admin') ? ' active' : ''}`}
              >
                <i className="ti ti-settings" />
                관리자 패널
              </Link>
              <button
                className="sb-item"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <i className="ti ti-logout" />
                로그아웃
              </button>
            </>
          ) : (
            <Link href="/admin/login" className="sb-item">
              <i className="ti ti-user" />
              로그인
            </Link>
          )}
        </nav>
      </aside>
    </>
  )
}
