'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { List, MagnifyingGlass, Moon, Sun, X } from '@phosphor-icons/react'
import { toggleSidebar } from './Sidebar'
import { useTheme } from './ThemeProvider'

export default function Topbar() {
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { theme, toggle } = useTheme()

  return (
    <header className="aihub-topbar">
      <button className="topbar-menu-btn" onClick={toggleSidebar} aria-label="메뉴 열기"><List size={23} weight="thin" /></button>
      <Link href="/" className="topbar-brand">
        <strong>Ayleen [<em>Edit</em>]</strong>
        <span>배우고, 발견하고, 기록합니다.</span>
      </Link>
      <form className="topbar-search" onSubmit={event => { event.preventDefault(); if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`) }}>
        <MagnifyingGlass size={21} weight="thin" aria-hidden="true" />
        <input ref={input} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the archive" aria-label="아카이브 검색" />
        {query ? <button type="button" onClick={() => { setQuery(''); input.current?.focus() }} aria-label="검색어 지우기"><X size={15} /></button> : <kbd>⌘ K</kbd>}
      </form>
      <span className="topbar-divider" />
      <button className="theme-toggle" onClick={toggle} aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}>
        {theme === 'dark' ? <Moon size={25} weight="thin" /> : <Sun size={25} weight="thin" />}
      </button>
    </header>
  )
}
