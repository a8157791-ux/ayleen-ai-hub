'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  BookmarkSimple,
  BookOpen,
  Heart,
  House,
  Newspaper,
  SquaresFour,
  User,
} from '@phosphor-icons/react'

const navigation = [
  { href: '/', label: '홈', icon: House },
  { href: '/news', label: '인사이트', icon: Newspaper },
  { href: '/tools', label: '도구', icon: SquaresFour },
  { href: '/reference', label: '레퍼런스', icon: BookmarkSimple },
  { href: '/study', label: '스터디', icon: BookOpen },
]

let setSidebarOpen: ((value: boolean | ((value: boolean) => boolean)) => void) | null = null
export function toggleSidebar() {
  setSidebarOpen?.(value => !value)
}

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen = setOpen
    return () => { setSidebarOpen = null }
  }, [])
  useEffect(() => setOpen(false), [pathname])

  const active = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <button className={`sidebar-overlay${open ? ' active' : ''}`} onClick={() => setOpen(false)} aria-label="메뉴 닫기" />
      <aside className={`aihub-sidebar${open ? ' open' : ''}`} aria-label="사이드바">
        <Link href="/" className="rail-logo" aria-label="Ayleen Edit 홈"><span>[<em>e</em>]</span></Link>
        <nav className="rail-nav" aria-label="주요 메뉴">
          {navigation.map(({ href, label, icon: Icon }) => {
            const selected = active(href)
            return (
              <Link key={href} href={href} className={`rail-link${selected ? ' active' : ''}`} aria-label={label} aria-current={selected ? 'page' : undefined}>
                <Icon size={24} weight={selected ? 'fill' : 'thin'} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="rail-bottom">
          <Link href="/saved" className={`rail-link${active('/saved') ? ' active' : ''}`} aria-label="저장한 글">
            <Heart size={24} weight={active('/saved') ? 'fill' : 'thin'} aria-hidden="true" />
            <span>저장한 글</span>
          </Link>
          {session ? (
            <button className="rail-link" onClick={() => signOut({ callbackUrl: '/' })} aria-label="로그아웃">
              <User size={24} weight="fill" aria-hidden="true" /><span>로그아웃</span>
            </button>
          ) : (
            <Link href="/admin/login" className="rail-link" aria-label="로그인">
              <User size={24} weight="thin" aria-hidden="true" /><span>로그인</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
