'use client'

interface HeartButtonProps {
  isSaved: boolean
  isLoading?: boolean
  size?: number
  onClick: (e: React.MouseEvent) => void
}

export default function HeartButton({ isSaved, isLoading = false, size = 18, onClick }: HeartButtonProps) {
  return (
    <button
      onClick={onClick}
      title={isSaved ? '저장 취소' : '저장한 글에 추가'}
      style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: size + 14, height: size + 14, borderRadius: '50%',
        border: 'none', background: 'transparent',
        cursor: 'pointer',
        transition: 'transform 0.1s',
        transform: isLoading ? 'scale(0.85)' : 'scale(1)',
      }}
    >
      <svg
        width={size} height={size}
        viewBox="0 0 24 24"
        fill={isSaved ? 'var(--color-blue)' : 'none'}
        stroke={isSaved ? 'var(--color-blue)' : 'var(--color-text)'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: isSaved ? 1 : 0.35,
          transition: 'fill 0.15s, opacity 0.15s',
        }}
      >
        <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
      </svg>
    </button>
  )
}
