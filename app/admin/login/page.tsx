'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email, password: pw, redirect: false,
    })
    setLoading(false)
    if (res?.error) setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    else router.push('/admin')
  }

  return (
    <div style={{ maxWidth: 380, margin: '80px auto' }}>
      <div className="page-hero">
        <div className="hero-eyebrow">Admin</div>
        <h1 className="hero-title">관리자 <b>로그인</b></h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">이메일</label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="form-input" required
            placeholder="admin@example.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label">비밀번호</label>
          <input
            type="password" value={pw}
            onChange={e => setPw(e.target.value)}
            className="form-input" required
            placeholder="••••••••"
          />
        </div>
        {error && (
          <div style={{ color: '#ef4444', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{error}</div>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  )
}
