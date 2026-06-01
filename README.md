# Ayleen's AI Hub

AI 트렌드 큐레이션 + 개인 학습 아카이브  
**Next.js 14 + Vercel + Neon PostgreSQL**

---

## 버그 수정 내역 (v6 → v6.1)

- **사이드바 이중 렌더링 제거** — Topbar 안에서 Sidebar를 import해 2개가 렌더링되던 문제 수정. 커스텀 이벤트 방식으로 통신
- **searchParams / params async 처리** — Next.js 14 App Router에서 `searchParams`를 동기적으로 접근하면 빌드 오류 발생. `Promise.resolve()` 래핑으로 수정
- **saved/page.tsx 이벤트 핸들러 오류** — 서버 컴포넌트에 `onMouseEnter/Leave` 인라인 핸들러 사용 불가. CSS `.saved-link-item` 클래스로 대체
- **study API 단일 조회 누락** — `GET /api/study?id=` 파라미터 처리 로직 없어 편집 페이지 데이터 로드 실패하던 문제 수정
- **admin 페이지에서 미공개 항목 조회** — tools/prompts API에 `?admin=1` 파라미터 추가해 관리자는 unpublished 포함 전체 조회
- **뉴스 목록 limit 하드코딩** — 관리자 패널에서 50건만 보이던 문제. `/api/news?limit=200` 으로 수정
- **xml2js 미사용 의존성 제거** — package.json에서 제거
- **RSS fetch timeout 추가** — `AbortSignal.timeout(8000)` 으로 느린 피드 무한 대기 방지
- **편집 페이지 id 비교 버그** — `Number(id)` 비교를 `String(t.id) === String(id)` 로 변경해 타입 불일치 방지

---

## 배포 순서

### 1단계 — GitHub에 올리기

```bash
cd ayleen-ai-hub
git init
git add .
git commit -m "init: Ayleen AI Hub v6.1"
git remote add origin https://github.com/YOUR_ID/ayleen-ai-hub.git
git push -u origin main
```

### 2단계 — Neon DB 만들기 (무료)

1. https://neon.tech 접속 → 회원가입
2. New Project → `ayleen-ai-hub`
3. Connection string 복사 (postgresql://... 형식)

### 3단계 — Vercel 배포

1. https://vercel.com → New Project → GitHub repo 연결
2. Environment Variables 설정:

| Key | 값 |
|-----|---|
| `DATABASE_URL` | Neon에서 복사한 postgresql://... |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` |
| `NEXTAUTH_SECRET` | 터미널: `openssl rand -base64 32` |
| `CRON_SECRET` | 터미널: `openssl rand -hex 16` |
| `SETUP_SECRET` | 원하는 비밀 문자열 |
| `NEWS_API_KEY` | (선택) https://newsapi.org 무료 키 |

3. Deploy 클릭

### 4단계 — DB 테이블 생성

```bash
npm install
# .env.local 파일에 DATABASE_URL 입력 후:
npx prisma db push
```

### 5단계 — 관리자 계정 생성 (1회)

```bash
curl -X POST https://your-site.vercel.app/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ayleen@gmail.com",
    "password": "your-secure-password",
    "name": "Ayleen",
    "setupSecret": "SETUP_SECRET에_입력한_값"
  }'
```

### 6단계 — AI 뉴스 수집 시작

1. 사이트 접속 → 우측 상단 사람 아이콘 → 로그인
2. 사이드바 → 관리자 패널
3. "AI 뉴스 지금 수집" 버튼 클릭
4. 이후 매일 새벽 6시(KST) 자동 수집됨

---

## 로컬 개발

```bash
npm install
cp .env.example .env.local
# .env.local에 실제 값 입력

npx prisma db push
npm run dev  # http://localhost:3000
```
