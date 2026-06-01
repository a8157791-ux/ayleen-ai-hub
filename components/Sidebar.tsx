'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'

const mainNav = [
  { href: '/', icon: 'ti-layout-dashboard', label: '오늘의 AI', badge: true },
  { href: '/news', icon: 'ti-chart-line', label: '트렌드 보드' },
  { href: '/tools', icon: 'ti-box', label: '툴 라이브러리' },
  { href: '/reference', icon: 'ti-bookmarks', label: '레퍼런스' },
]
const myNav = [
  { href: '/study', icon: 'ti-notebook', label: '스터디룸' },
  { href: '/prompts', icon: 'ti-sparkles', label: '프롬프트 보관함' },
  { href: '/saved', icon: 'ti-bookmark', label: '저장한 글' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  newsCount?: number
}

export default function Sidebar({ isOpen, onClose, newsCount }: SidebarProps) {
  const pathname = usePathname()
  const [clock, setClock] = useState('')
  const { data: session } = useSession()

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {isOpen && (
        <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      )}
      <aside className={`aihub-sidebar ${isOpen ? 'open' : ''}`} id="aihub-sidebar">
        {/* Logo */}
        <div className="sb-logo">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="sb-logo-name">Ayleen's <span>AI</span></div>
          </Link>
          <div className="sb-logo-sub">Trend Archive</div>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          <div className="sb-group">
            <div className="sb-group-label">Main</div>
            {mainNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-item ${isActive(item.href) ? 'active' : ''}`}
                onClick={onClose}
              >
                <i className={`ti ${item.icon}`} aria-hidden="true" />
                {item.label}
                {item.badge && newsCount ? (
                  <span className="sb-item-badge">{newsCount}</span>
                ) : null}
              </Link>
            ))}
          </div>

          <div className="sb-divider" />

          <div className="sb-group">
            <div className="sb-group-label">My</div>
            {myNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-item ${isActive(item.href) ? 'active' : ''}`}
                onClick={onClose}
              >
                <i className={`ti ${item.icon}`} aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </div>

          {session && (
            <>
              <div className="sb-divider" />
              <div className="sb-group">
                <div className="sb-group-label">Admin</div>
                <Link href="/admin" className={`sb-item ${isActive('/admin') ? 'active' : ''}`} onClick={onClose}>
                  <i className="ti ti-settings" aria-hidden="true" />
                  관리자 패널
                </Link>
                <button
                  className="sb-item"
                  onClick={() => signOut()}
                  style={{ width: '100%', textAlign: 'left' }}
                >
                  <i className="ti ti-logout" aria-hidden="true" />
                  로그아웃
                </button>
              </div>
            </>
          )}
        </nav>

        {/* Bottom clock */}
        <div className="sb-bottom">
          <span className="sb-clock">{clock}</span>
          <span className="sb-location">Seoul, KR</span>
        </div>
      </aside>
    </>
  )
}
