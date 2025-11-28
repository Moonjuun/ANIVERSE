# 가데이터 (Seed Data) 삽입 가이드

## 방법 1: Supabase Dashboard에서 직접 실행 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 (ANIVERSE)
3. **SQL Editor** 메뉴로 이동
4. `supabase/seed_data.sql` 파일의 내용을 복사하여 실행

## 방법 2: Supabase CLI 사용

```bash
# Supabase 프로젝트가 링크되어 있는지 확인
supabase link --project-ref cmlagvdidconwojdgnpv

# 마이그레이션 실행
supabase db push
```

## 주의사항

- **사용자 생성**: 이 스크립트는 기존에 생성된 사용자(`auth.users`)가 있다고 가정합니다.
- 먼저 앱에서 회원가입을 통해 사용자를 생성하거나, Supabase Dashboard의 Authentication에서 사용자를 생성하세요.
- 스크립트는 생성된 사용자 순서대로 프로필, 리뷰, 찜하기를 생성합니다.

## 생성되는 데이터

- **사용자 프로필**: 2개 (첫 번째, 두 번째 사용자)
- **리뷰**: 4개 (Attack on Titan, One Piece, Demon Slayer, Jujutsu Kaisen)
- **찜하기**: 7개 (다양한 애니메이션)

## 사용되는 애니메이션 ID

- Attack on Titan: 1396
- One Piece: 37854
- Demon Slayer: 85937
- Jujutsu Kaisen: 95479
- Spy x Family: 120089

