import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: "Ayleen's AI — Trend Archive",
  description: 'AI 트렌드 큐레이션 + 개인 학습 아카이브',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
      </head>
      <body>
        <Providers>
          <div className="aihub-shell">
            <Sidebar />
            <div className="aihub-main">
              <Topbar />
              <main className="aihub-content">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
