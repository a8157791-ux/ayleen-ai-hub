'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toggleSidebar } from './Sidebar'

// 시간대별 인사말
function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return '좋은 아침이에요'
  if (h >= 12 && h < 17) return '좋은 오후예요'
  if (h >= 17 && h < 21) return '좋은 저녁이에요'
  return '늦은 밤이네요'
}

// 요일 영문
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function formatDate(d: Date): string {
  // "Tuesday, June 2026"
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export default function Topbar() {
  const [dateStr, setDateStr] = useState('')
  const [greeting, setGreeting] = useState('')
  const [weather, setWeather] = useState<{ temp: number; desc: string } | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const { data: session } = useSession()
  const router = useRouter()

  // 날짜 + 인사말
  useEffect(() => {
    const now = new Date()
    setDateStr(formatDate(now))
    setGreeting(getGreeting())
  }, [])

  // 날씨 (Open-Meteo — 완전 무료, API 키 불필요)
  useEffect(() => {
    // 서울 좌표 고정 (사이트 운영자 위치)
    fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weathercode&timezone=Asia%2FSeoul')
      .then(r => r.json())
      .then(data => {
        const temp = Math.round(data.current?.temperature_2m ?? 0)
        const code = data.current?.weathercode ?? 0
        // WMO weather code → 간단 설명
        const desc = weatherDesc(code)
        setWeather({ temp, desc })
      })
      .catch(() => {
        // 날씨 API 실패 시 숨김 처리 (에러 표시 안 함)
      })
  }, [])

  // 검색창 열릴 때 자동 포커스
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // 검색 실행
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchVal.trim()
    if (!q) return
    router.push(`/news?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setSearchVal('')
  }

  // ESC로 검색창 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="aihub-topbar">
      <div className="topbar-left">
        {/* 햄버거 (모바일) */}
        <button className="topbar-menu-btn" onClick={toggleSidebar} aria-label="메뉴 열기">
          <i className="ti ti-menu-2" />
        </button>

        {/* 날짜 + 인사말 */}
        <div className="topbar-dateline">
          <span className="topbar-date">{dateStr}</span>
          {greeting && <span className="topbar-greeting">— {greeting}</span>}
        </div>

        {/* 날씨 (768px 이상에서만 표시) */}
        {weather && (
          <div className="topbar-weather">
            <i className="ti ti-temperature" />
            <span>{weather.temp}°C</span>
            <span className="topbar-weather-city">Seoul</span>
          </div>
        )}
      </div>

      <div className="topbar-right">
        {/* 검색 */}
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
              onClick={() => setSearchOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', padding: 0 }}
              aria-label="닫기"
            >
              <i className="ti ti-x" style={{ fontSize: 13 }} />
            </button>
          </form>
        ) : (
          <button
            className="topbar-icon-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="검색"
            title="검색"
          >
            <i className="ti ti-search" />
          </button>
        )}

        {/* AI Hub 뱃지 */}
        <span className="topbar-pill">
          <i className="ti ti-robot" />
          AI Hub
        </span>

        {/* 관리자 / 로그인 */}
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
  )
}

// WMO weather code → 한줄 설명
function weatherDesc(code: number): string {
  if (code === 0) return '맑음'
  if (code <= 3) return '구름'
  if (code <= 49) return '안개'
  if (code <= 59) return '이슬비'
  if (code <= 69) return '비'
  if (code <= 79) return '눈'
  if (code <= 82) return '소나기'
  if (code <= 99) return '뇌우'
  return ''
}