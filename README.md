# Ayleen's AI Hub

AI 트렌드 큐레이션 + 개인 학습 아카이브 사이트  
**Next.js 14 + Vercel + Neon PostgreSQL**

---

## 배포 순서 (처음부터 끝까지)

### 1단계 — GitHub에 올리기

```bash
cd ayleen-ai-hub
git init
git add .
git commit -m "init: Ayleen AI Hub"
# GitHub에서 새 repo 만들고:
git remote add origin https://github.com/YOUR_ID/ayleen-ai-hub.git
git push -u origin main
```

---

### 2단계 — Neon DB 만들기 (무료)

1. https://neon.tech 접속 → 회원가입
2. New Project → `ayleen-ai-hub`
3. **Connection string** 복사 (postgresql://... 형식)

---

### 3단계 — Vercel 배포

1. https://vercel.com → New Project → GitHub repo 연결
2. **Environment Variables** 설정:

| Key | 값 |
|-----|---|
| `DATABASE_URL` | Neon에서 복사한 postgresql://... |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` |
| `NEXTAUTH_SECRET` | 터미널: `openssl rand -base64 32` |
| `CRON_SECRET` | 터미널: `openssl rand -hex 16` |
| `SETUP_SECRET` | 원하는 비밀 문자열 |
| `NEWS_API_KEY` | (선택) https://newsapi.org 무료 키 |

3. Deploy 클릭

---

### 4단계 — DB 테이블 생성

배포 후 로컬에서:

```bash
npm install
# .env.local 파일에 DATABASE_URL 입력 후:
npx prisma db push
```

또는 Vercel 대시보드 → Functions → Run Command:
```
npx prisma db push
```

---

### 5단계 — 관리자 계정 생성 (1회)

배포된 사이트에서 POST 요청:

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

또는 Postman/Insomnia로 동일하게 호출.

---

### 6단계 — AI 뉴스 수집 시작

1. 사이트 접속 → 우측 상단 사람 아이콘 → 로그인
2. 사이드바 → 관리자 패널
3. **"AI 뉴스 지금 수집"** 버튼 클릭
4. 이후 매일 새벽 6시(KST) 자동 수집됨

---

## 무료 뉴스 수집 방식

### RSS 피드 (완전 무료, 제한 없음)
자동으로 아래 소스에서 수집:
- VentureBeat AI
- OpenAI Blog
- HuggingFace Blog  
- Stability AI
- Towards Data Science
- ML Mastery
- AI Art Weekly
- Runway ML Blog
- MarkTechPost
- Artificial Intelligence News

### NewsAPI (선택, 무료 플랜)
- https://newsapi.org 가입 → Developer 플랜 (무료)
- 월 100회 요청 제한 (하루 1회 수집이면 충분)
- `NEWS_API_KEY` 환경변수에 입력

---

## 로컬 개발

```bash
npm install
cp .env.example .env.local
# .env.local에 실제 값 입력

npx prisma db push  # DB 테이블 생성
npm run dev         # http://localhost:3000
```

---

## 파일 구조

```
app/
├── page.tsx              # 홈 대시보드
├── news/page.tsx         # 트렌드 보드
├── study/page.tsx        # 스터디룸
├── study/[id]/page.tsx   # 스터디 상세
├── tools/page.tsx        # 툴 라이브러리
├── prompts/page.tsx      # 프롬프트 보관함
├── saved/page.tsx        # 저장한 글
├── reference/page.tsx    # 레퍼런스
├── admin/
│   ├── page.tsx          # 관리자 패널
│   ├── login/page.tsx    # 로그인
│   └── new/              # 콘텐츠 추가 폼
└── api/
    ├── news/             # 뉴스 CRUD + 수집
    ├── study/            # 스터디 CRUD
    ├── tools/            # 툴 CRUD
    ├── prompts/          # 프롬프트 CRUD
    ├── saved/            # 저장한 글 CRUD
    ├── reference/        # 레퍼런스 CRUD
    ├── auth/             # NextAuth
    ├── setup/            # 최초 관리자 생성
    └── cron/             # 자동 뉴스 수집

components/
├── Sidebar.tsx
├── Topbar.tsx
└── Providers.tsx

lib/
├── db.ts                 # Prisma client
├── auth.ts               # NextAuth config
└── rss.ts                # RSS + NewsAPI 수집

prisma/
└── schema.prisma         # DB 스키마

vercel.json               # Cron 설정 (매일 06:00 KST)
```
