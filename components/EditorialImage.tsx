'use client'

import { useState } from 'react'

const FALLBACK = '/images/default-editorial.webp'

export default function EditorialImage({
  src,
  alt,
  priority = false,
}: {
  src?: string | null
  alt: string
  priority?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const imageSrc = !src || failed ? FALLBACK : src

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
    />
  )
}
