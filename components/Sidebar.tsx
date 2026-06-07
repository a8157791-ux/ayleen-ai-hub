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

// 전역 토글 함수 — Topbar에서 import해서 사용
let _setOpen: ((v: boolean | ((prev: boolean) => boolean)) => void) | null = null
export function toggleSidebar() {
  _setOpen?.(prev => !prev)
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  // 전역에 setter 등록
  useEffect(() => {
    _setOpen = setMobileOpen
    return () => { _setOpen = null }
  }, [])

  // 경로 변경 시 사이드바 닫기
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div
          style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:99}}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        style={{
          position:'fixed', top:0, left:0, height:'100vh', width:224,
          background:'var(--color-sidebar, #090C14)',
          borderRight:'1px solid var(--color-border)',
          display:'flex', flexDirection:'column',
          zIndex:100,
          transition:'transform 0.25s ease',
          transform: mobileOpen ? 'translateX(0)' : undefined,
        }}
        className="sidebar"
      >
        {/* 로고 */}
        <div style={{padding:'20px 16px 16px', borderBottom:'1px solid var(--color-border)'}}>
          <Link href="/" style={{textDecoration:'none'}}>
            <div style={{fontFamily:'var(--font-display)', fontSize:20, color:'var(--color-text)', letterSpacing:-0.5}}>
              Ayleen<span style={{color:'var(--color-blue)'}}>.</span>AI
            </div>
            <div style={{fontSize:10, color:'var(--color-text-3)', fontFamily:'var(--font-mono)', marginTop:2, letterSpacing:2}}>
              TREND ARCHIVE
            </div>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav style={{flex:1, overflowY:'auto', padding:'12px 8px'}}>
          {/* Main */}
          <div style={{fontSize:10, color:'var(--color-text-3)', fontFamily:'var(--font-mono)', letterSpacing:2, padding:'4px 8px', marginBottom:4}}>
            MAIN
          </div>
          {mainNav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'8px 10px', borderRadius:8, marginBottom:2,
                textDecoration:'none', fontSize:14,
                background: isActive(item.href) ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: isActive(item.href) ? 'var(--color-blue)' : 'var(--color-text-2)',
                transition:'all 0.15s',
              }}
            >
              <i className={`ti ${item.icon}`} style={{fontSize:16}} />
              {item.label}
            </Link>
          ))}

          {/* My */}
          <div style={{fontSize:10, color:'var(--color-text-3)', fontFamily:'var(--font-mono)', letterSpacing:2, padding:'12px 8px 4px', marginBottom:4}}>
            MY
          </div>
          {myNav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'8px 10px', borderRadius:8, marginBottom:2,
                textDecoration:'none', fontSize:14,
                background: isActive(item.href) ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: isActive(item.href) ? 'var(--color-blue)' : 'var(--color-text-2)',
                transition:'all 0.15s',
              }}
            >
              <i className={`ti ${item.icon}`} style={{fontSize:16}} />
              {item.label}
            </Link>
          ))}

          {/* 구분선 */}
          <div style={{height:1, background:'var(--color-border)', margin:'12px 8px'}} />

          {/* 관리자 */}
          {session ? (
            <>
              <Link
                href="/admin"
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'8px 10px', borderRadius:8, marginBottom:2,
                  textDecoration:'none', fontSize:14,
                  background: isActive('/admin') ? 'rgba(59,130,246,0.12)' : 'transparent',
                  color: isActive('/admin') ? 'var(--color-blue)' : 'var(--color-text-2)',
                  transition:'all 0.15s',
                }}
              >
                <i className="ti ti-settings" style={{fontSize:16}} />
                관리자 패널
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'8px 10px', borderRadius:8, marginBottom:2,
                  width:'100%', border:'none', background:'transparent',
                  color:'var(--color-text-3)', fontSize:14, cursor:'pointer',
                  transition:'all 0.15s',
                }}
              >
                <i className="ti ti-logout" style={{fontSize:16}} />
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/admin/login"
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'8px 10px', borderRadius:8, marginBottom:2,
                textDecoration:'none', fontSize:14,
                color:'var(--color-text-3)',
                transition:'all 0.15s',
              }}
            >
              <i className="ti ti-user" style={{fontSize:16}} />
              로그인
            </Link>
          )}
        </nav>
      </aside>
    </>
  )
}
