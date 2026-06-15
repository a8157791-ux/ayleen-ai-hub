'use client'

import { useState } from 'react'

interface CopyButtonProps {
  text: string
  label?: string
}

export default function CopyButton({ text, label = '복사' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'transparent', border: '1px solid var(--color-border-2)',
        color: copied ? 'var(--color-green)' : 'var(--color-text-3)',
        borderRadius: 6, padding: '4px 10px', fontSize: 11,
        fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: 13 }} />
      {copied ? '복사됨' : label}
    </button>
  )
}
