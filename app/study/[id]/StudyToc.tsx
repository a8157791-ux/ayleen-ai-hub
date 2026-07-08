'use client'
import { useEffect, useState } from 'react'

type Section = { id: string; label: string }

export default function StudyToc({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '')

  useEffect(() => {
    const els = sections
      .map(s => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el)
    if (!els.length) return

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const scroller = el.closest('.aihub-content') as HTMLElement | null
    if (scroller) {
      const top =
        el.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop -
        16
      scroller.scrollTo({ top, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: 'smooth' })
    }
    setActive(id)
  }

  if (sections.length < 2) return null

  return (
    <nav aria-label="목차">
      <p className="sd-toc-label">On this page</p>
      <ul className="sd-toc-list">
        {sections.map(s => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={s.id === active ? 'active' : ''}
              onClick={e => go(e, s.id)}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
