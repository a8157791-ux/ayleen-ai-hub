'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toggleSidebar } from './Sidebar'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function formatDate(d: Date): string {
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return '좋은 아침이에요'
  if (h >= 12 && h < 17) return '좋은 오후예요'
  if (h >= 17 && h < 21) return '좋은 저녁이에요'
  return '늦은 밤이네요'
}

function weatherIcon(code: number): string {
  if (code === 0) return 'ti-sun'
  if (code <= 2) return 'ti-cloud'
  if (code <= 3) return 'ti-cloud'
  if (code <= 49) return 'ti-cloud-fog'
  if (code <= 67) return 'ti-cloud-rain'
  if (code <= 77) return 'ti-snowflake'
  return 'ti-cloud-storm'
}

export default function Topbar() {
  const [dateStr, setDateStr] = useState('')
  const [greeting, setGreeting] = useState('')
  const [weather, setWeather] = useState<{ temp: number; icon: string } | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const now = new Date()
    setDateStr(formatDate(now))
    setGreeting(getGreeting())
  }, [])

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weathercode&timezone=Asia%2FSeoul')
      .then(r => r.json())
      .then(data => {
        const temp = Math.round(data.current?.temperature_2m ?? 0)
        const code = data.current?.weathercode ?? 0
        setWeather({ temp, icon: weatherIcon(code) })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setSearchVal('') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchVal.trim()
    if (!q) return
    router.push(`/news?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setSearchVal('')
  }

  return (
    <header className="aihub-topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={toggleSidebar} aria-label="메뉴 열기">
          <i className="ti ti-menu-2" />
        </button>
        <div className="topbar-dateline">
          <span className="topbar-date">{dateStr}</span>
          {greeting && <span className="topbar-greeting">— {greeting}</span>}
        </div>
      </div>

      <div className="topbar-right">
        {searchOpen ? (
          <form onSubmit={handleSearch} className="topbar-search-form">
            <i className="ti ti-search" style={{ color: 'var(--color-text-3)', fontSize: 13 }} />
            <input
              ref={searchRef}
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="뉴스 검색..."
              className="topbar-search-input"
            />
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setSearchVal('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', padding: 0 }}
              aria-label="닫기"
            >
              <i className="ti ti-x" style={{ fontSize: 13 }} />
            </button>
          </form>
        ) : (
          <>
            {weather && (
              <div className="topbar-pill">
                <i className={`ti ${weather.icon}`} style={{ color: 'var(--color-cyan)', fontSize: 13 }} />
                <span>{weather.temp}°C</span>
                <span style={{ color: 'var(--color-text-3)' }}>Seoul</span>
              </div>
            )}
            <button className="topbar-icon-btn" onClick={() => setSearchOpen(true)} aria-label="검색">
              <i className="ti ti-search" />
            </button>
          </>
        )}
      </div>
    </header>
  )
}