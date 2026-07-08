import type { Metadata, Viewport } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: "Ayleen's AI",
  description: 'AI 트렌드 큐레이션 + 개인 학습 아카이브',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Ayleen's AI Hub",
    description: "AI 트렌드 큐레이션 & 학습 아카이브",
    url: "https://ayleen-ai.vercel.app",
    siteName: "Ayleen's AI Hub",
    images: [
      {
        url: "https://ayleen-ai.vercel.app/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayleen's AI Hub",
    description: "AI 트렌드 큐레이션 & 학습 아카이브",
    images: ["https://ayleen-ai.vercel.app/og-image.png"],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
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