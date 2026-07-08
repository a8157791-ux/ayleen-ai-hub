'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useTheme } from './ThemeProvider'

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

function Clock() {
  const [now, setNow] = useState('')
  useEffect(() => {
    const tick = () => {
      setNow(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Seoul',
        })
      )
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="sb-clock">
      <div className="sb-clock-time">{now || '--:--'}</div>
      <div className="sb-clock-sub">Seoul · KST</div>
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchVal.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setSearchVal('')
    setOpen(false)
  }

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

        {/* 검색 */}
        <form className="sb-search" onSubmit={handleSearch}>
          <i className="ti ti-search" />
          <input
            className="sb-search-input"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="통합 검색..."
            aria-label="통합 검색"
          />
          <span className="sb-search-kbd">⌘K</span>
        </form>

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

        {/* 푸터 — 시계 + 아이콘 테마 토글 */}
        <div className="sb-footer">
          <Clock />
          <div className="sb-theme-seg" role="group" aria-label="테마">
            <button
              className={`sb-theme-opt${theme === 'light' ? ' active' : ''}`}
              onClick={() => { if (theme !== 'light') toggle() }}
              aria-label="라이트 모드"
              aria-pressed={theme === 'light'}
            >
              <i className="ti ti-sun" />
            </button>
            <button
              className={`sb-theme-opt${theme === 'dark' ? ' active' : ''}`}
              onClick={() => { if (theme !== 'dark') toggle() }}
              aria-label="다크 모드"
              aria-pressed={theme === 'dark'}
            >
              <i className="ti ti-moon" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
