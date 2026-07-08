'use client'
import { useState, useEffect } from 'react'
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

  useEffect(() => {
    const now = new Date()
    setDateStr(formatDate(now))
    setGreeting(getGreeting())
  }, [])

  useEffect(() => {
    fetch('/api/weather')
      .then(r => r.json())
      .then(data => {
        const temp = Math.round(data.current?.temperature_2m ?? 0)
        const code = data.current?.weathercode ?? 0
        setWeather({ temp, icon: weatherIcon(code) })
      })
      .catch(() => {})
  }, [])

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
        {weather && (
          <div className="topbar-pill">
            <i className={`ti ${weather.icon}`} style={{ color: 'var(--color-cyan)', fontSize: 13 }} />
            <span>{weather.temp}°C</span>
            <span style={{ color: 'var(--color-text-3)' }}>Seoul</span>
          </div>
        )}
      </div>
    </header>
  )
}
