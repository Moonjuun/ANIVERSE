# AniVerse

애니메이션 리뷰와 추천을 한 곳에서 만나보세요. TMDB API를 활용한 애니메이션 정보 제공 및 사용자 리뷰 플랫폼입니다.

## 🚀 주요 기능

- **애니메이션 탐색**: TMDB API를 통한 다양한 애니메이션 정보 조회
- **리뷰 시스템**: 애니메이션에 대한 리뷰 작성, 수정, 삭제
- **찜하기**: 관심 있는 애니메이션을 찜 목록에 추가
- **검색 기능**: 애니메이션 검색 및 필터링 (장르, 연도, 정렬)
- **다국어 지원**: 한국어, 영어, 일본어 지원
- **사용자 프로필**: 프로필 관리 및 내 리뷰/찜 목록 조회

## 🛠️ 기술 스택

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5.x (Strict Mode)
- **Styling**: Tailwind CSS 4.x
- **State Management**:
  - TanStack Query v5 (Server State)
  - Zustand v5 (Client UI State)
- **Backend**: Supabase (Auth, Database)
- **i18n**: next-intl
- **Form**: React Hook Form + Zod
- **API**: TMDB API

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# TMDB API
TMDB_ACCESS_TOKEN=your_tmdb_access_token
```

### 3. 데이터베이스 설정

Supabase 프로젝트를 생성하고 마이그레이션을 실행하세요:

```bash
# Supabase Dashboard에서 SQL Editor로 이동
# supabase/migrations/20241129000001_initial_schema.sql 파일 내용 실행
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── [locale]/          # 다국어 라우팅
│   │   ├── anime/         # 애니메이션 목록/상세
│   │   ├── reviews/       # 리뷰 목록/상세
│   │   ├── profile/       # 프로필 페이지
│   │   └── favorites/    # 찜 목록
│   └── api/               # API Routes
├── components/             # React 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── features/         # 기능별 컴포넌트
│   └── layouts/          # 레이아웃 컴포넌트
├── actions/              # Server Actions
├── stores/               # Zustand 스토어
├── lib/                  # 유틸리티 및 클라이언트
└── types/                # TypeScript 타입 정의
```

## 🎨 주요 기능 상세

### 애니메이션 탐색
- 인기 애니메이션 목록
- 평점 높은 애니메이션
- 필터링 (장르, 연도, 정렬)
- 무한 스크롤

### 리뷰 시스템
- 애니메이션별 리뷰 작성/수정/삭제
- 평점 시스템 (1-10점)
- 리뷰 목록 조회
- 리뷰 상세 페이지

### 사용자 기능
- 회원가입/로그인 (Supabase Auth)
- 프로필 관리
- 찜하기 목록
- 내 리뷰 조회

## 🗄️ 데이터베이스 스키마

- `reviews`: 리뷰 테이블
- `favorites`: 찜하기 테이블
- `user_profiles`: 사용자 프로필 테이블

자세한 내용은 [supabase/README.md](./supabase/README.md)를 참고하세요.

## 🌱 가데이터 삽입

테스트용 가데이터를 삽입하려면:

```bash
npm run seed
```

또는 Supabase Dashboard의 SQL Editor에서 `supabase/seed_data.sql` 파일을 실행하세요.

## 📝 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run lint`: ESLint 실행
- `npm run seed`: 가데이터 삽입

## 🚢 배포

Vercel을 통한 배포를 권장합니다:

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정
4. 배포 완료

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.
