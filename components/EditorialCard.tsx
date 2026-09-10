import Link from 'next/link'
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
}

export default function EditorialCard(props: CardProps) {
  const content = (
    <>
      <div className="editorial-card-image">
        <EditorialImage src={props.image} alt={props.title} priority={props.priority} />
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
    <a className={className} href={props.href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <Link className={className} href={props.href}>{content}</Link>
  )
}
