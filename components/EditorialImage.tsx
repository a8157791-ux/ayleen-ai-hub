'use client'

import { useState } from 'react'
import Image from 'next/image'

const FALLBACK = '/images/default-editorial.webp'

export default function EditorialImage({
  src,
  alt,
  priority = false,
  sizes = '(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw',
}: {
  src?: string | null
  alt: string
  priority?: boolean
  sizes?: string
}) {
  const [failed, setFailed] = useState(false)
  const imageSrc = !src || failed ? FALLBACK : src

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={76}
      onError={() => setFailed(true)}
    />
  )
}
