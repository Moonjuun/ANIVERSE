# Supabase Database Schema

## 마이그레이션 실행 방법

### 방법 1: Supabase Dashboard (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 (ANIVERSE)
3. SQL Editor로 이동
4. `supabase/migrations/20241129000001_initial_schema.sql` 파일의 내용을 복사하여 실행

### 방법 2: Supabase CLI

```bash
# Supabase CLI로 마이그레이션 실행
supabase db push
```

## 생성되는 테이블

### 1. `reviews` - 리뷰 테이블
- 사용자가 애니메이션에 작성한 리뷰
- 한 사용자는 한 애니메이션에 하나의 리뷰만 작성 가능
- 필드: id, user_id, anime_id (TMDB ID), rating (1-10), title, content, created_at, updated_at

### 2. `favorites` - 찜하기 테이블
- 사용자가 찜한 애니메이션 목록
- 한 사용자는 한 애니메이션을 한 번만 찜할 수 있음
- 필드: id, user_id, anime_id (TMDB ID), created_at

### 3. `user_profiles` - 사용자 프로필 테이블
- 사용자 프로필 확장 정보
- 필드: id (auth.users 참조), username, display_name, avatar_url, bio, created_at, updated_at

## RLS (Row Level Security) 정책

- **Reviews**: 모든 사용자 조회 가능, 본인 리뷰만 작성/수정/삭제 가능
- **Favorites**: 모든 사용자 조회 가능, 본인 찜하기만 추가/삭제 가능
- **User Profiles**: 모든 사용자 조회 가능, 본인 프로필만 생성/수정 가능

## 타입 동기화

마이그레이션 실행 후 타입을 동기화하세요:

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/supabase.ts
```




