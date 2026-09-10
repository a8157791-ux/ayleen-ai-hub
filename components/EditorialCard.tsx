import Link from 'next/link'
import type { MouseEventHandler } from 'react'
import EditorialImage from './EditorialImage'

type CardProps = {
  href: string
  title: string
  image?: string | null
  eyebrow?: string | null
  description?: string | null
  date?: Date | null
  external?: boolean
  priority?: boolean
  compact?: boolean
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export default function EditorialCard(props: CardProps) {
  const content = (
    <>
      <div className="editorial-card-image">
        <EditorialImage
          src={props.image}
          alt={props.title}
          priority={props.priority}
          sizes={props.compact
            ? '(max-width: 600px) 50vw, (max-width: 1100px) 50vw, 25vw'
            : '(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw'}
        />
        <span className="editorial-card-mark" aria-hidden="true">
          <i className="ti ti-book" />
        </span>
      </div>
      <div className="editorial-card-copy">
        {props.eyebrow && <span className="editorial-eyebrow">{props.eyebrow}</span>}
        <h3>{props.title}</h3>
        {props.description && <p>{props.description}</p>}
        <div className="editorial-card-meta">
          {props.date && <time>{props.date.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}</time>}
          <span>VIEW <i className="ti ti-arrow-up-right" /></span>
        </div>
      </div>
    </>
  )

  const className = `editorial-card${props.compact ? ' compact' : ''}`
  return props.external ? (
    <a className={className} href={props.href} target="_blank" rel="noopener noreferrer" onClick={props.onClick}>
      {content}
    </a>
  ) : (
    <Link className={className} href={props.href} onClick={props.onClick}>{content}</Link>
  )
}
