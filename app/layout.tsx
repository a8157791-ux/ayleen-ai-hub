import type { Metadata, Viewport } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  metadataBase: new URL('https://ayleen-ai.vercel.app'),
  title: { default: 'Ayleen Edit', template: '%s — Ayleen Edit' },
  description: '배우고, 발견하고, 기록하는 개인 인사이트 아카이브',
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
  openGraph: {
    title: 'Ayleen Edit', description: '배우고, 발견하고, 기록하는 개인 인사이트 아카이브',
    url: 'https://ayleen-ai.vercel.app', siteName: 'Ayleen Edit', images: ['/og-image.png'],
    locale: 'ko_KR', type: 'website',
  },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
        <script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.getItem('aihub-theme')||'light'}catch(e){}" }} />
      </head>
      <body>
        <Providers><div className="aihub-shell"><Sidebar /><div className="aihub-main"><Topbar /><main className="aihub-content"><div className="aihub-inner">{children}</div></main><footer className="site-footer"><div><strong>Ayleen [<em>Edit</em>]</strong><p>좋은 것을 발견하고, 나의 언어로 남깁니다.</p></div><span>© 2026 AYLEEN EDIT</span></footer></div></div></Providers>
      </body>
    </html>
  )
}
