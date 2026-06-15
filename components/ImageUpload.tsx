'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
}

export default function ImageUpload({ value, onChange, folder = 'misc' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '업로드 실패')
        return
      }

      onChange(data.url)
    } catch {
      setError('업로드 중 오류가 발생했습니다')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div style={{display:'flex', flexDirection:'column', gap:8}}>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <button type="button" className="btn btn-ghost" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? '업로드 중...' : '이미지 업로드'}
        </button>
        {value && (
          <button type="button" className="btn btn-ghost" onClick={() => onChange('')}>
            제거
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFile}
          style={{display:'none'}}
        />
      </div>
      {error && <div style={{fontSize:12, color:'#f87171'}}>{error}</div>}
      {value && /\.(jpg|jpeg|png|webp|gif)$/i.test(value) && (
        <img src={value} alt="미리보기" style={{maxWidth:200, borderRadius:8, border:'1px solid var(--color-border)'}} />
      )}
    </div>
  )
}
