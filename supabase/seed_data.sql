-- AniVerse 가데이터 (Seed Data)
-- Supabase Dashboard의 SQL Editor에서 직접 실행하세요.
--
-- 사용 방법:
-- 1. Supabase Dashboard (https://supabase.com/dashboard) 접속
-- 2. 프로젝트 선택 (ANIVERSE)
-- 3. SQL Editor 메뉴로 이동
-- 4. 이 파일의 내용을 복사하여 실행
--
-- 주의: 먼저 앱에서 회원가입을 통해 사용자를 생성한 후,
-- 아래 SQL에서 사용자 ID를 실제 ID로 변경하여 실행하세요.

-- ============================================
-- 1. 사용자 프로필 생성/업데이트
-- ============================================
-- 기존 사용자의 프로필을 업데이트하거나 새로 생성합니다.
-- 아래 예시는 첫 번째 사용자의 프로필을 생성합니다.
-- 여러 사용자가 있다면 각각에 대해 실행하세요.

-- 사용자 프로필 예시 1
INSERT INTO public.user_profiles (id, username, display_name, bio, avatar_url)
SELECT 
  id,
  'anime_lover',
  '애니메이션 애호가',
  '애니메이션을 사랑하는 사람입니다. 다양한 작품을 감상하고 리뷰를 작성합니다.',
  NULL
FROM auth.users
ORDER BY created_at
LIMIT 1
ON CONFLICT (id) DO UPDATE
SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url;

-- 사용자 프로필 예시 2 (두 번째 사용자가 있는 경우)
INSERT INTO public.user_profiles (id, username, display_name, bio, avatar_url)
SELECT 
  id,
  'reviewer_pro',
  '리뷰 전문가',
  '애니메이션 리뷰를 전문적으로 작성합니다.',
  NULL
FROM auth.users
ORDER BY created_at
OFFSET 1
LIMIT 1
ON CONFLICT (id) DO UPDATE
SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url;

-- ============================================
-- 2. 리뷰 생성
-- ============================================
-- 인기 애니메이션 ID:
-- - Attack on Titan: 1396
-- - One Piece: 37854
-- - Demon Slayer: 85937
-- - Jujutsu Kaisen: 95479
-- - Spy x Family: 120089

-- 첫 번째 사용자의 리뷰
INSERT INTO public.reviews (user_id, anime_id, rating, title, content)
SELECT 
  id,
  1396, -- Attack on Titan
  9,
  '진정한 걸작',
  '공격거인은 단순한 액션 애니메이션이 아닙니다. 깊이 있는 스토리와 캐릭터 개발, 그리고 예상치 못한 전개가 매회를 기대하게 만듭니다. 특히 세계관 설정이 탁월하고, 인간의 본성에 대한 철학적 질문을 던집니다. 액션씬도 매우 역동적이고, 음악도 뛰어납니다. 애니메이션 팬이라면 반드시 봐야 할 작품입니다.'
FROM auth.users
ORDER BY created_at
LIMIT 1
ON CONFLICT (user_id, anime_id) DO NOTHING;

INSERT INTO public.reviews (user_id, anime_id, rating, title, content)
SELECT 
  id,
  37854, -- One Piece
  10,
  '최고의 모험',
  '원피스는 단순한 모험담이 아닙니다. 우정, 꿈, 자유에 대한 이야기입니다. 20년이 넘는 연재 기간 동안 쌓아온 스토리는 정말 압도적입니다. 각 캐릭터의 성장과 배경 스토리가 감동적이고, 세계관도 매우 방대합니다. 웃음과 눈물이 공존하는 진정한 걸작입니다.'
FROM auth.users
ORDER BY created_at
LIMIT 1
ON CONFLICT (user_id, anime_id) DO NOTHING;

-- 두 번째 사용자의 리뷰 (있는 경우)
INSERT INTO public.reviews (user_id, anime_id, rating, title, content)
SELECT 
  id,
  85937, -- Demon Slayer
  8,
  '시각적 쾌감',
  '귀멸의 칼날은 애니메이션 퀄리티가 정말 뛰어납니다. 특히 전투씬의 연출이 압도적이고, 색감과 작화가 매우 아름답습니다. 스토리도 탄탄하고, 캐릭터들의 매력이 뛰어납니다. 다만 후반부 전개가 다소 급하게 느껴질 수 있지만, 전체적으로는 매우 만족스러운 작품입니다.'
FROM auth.users
ORDER BY created_at
OFFSET 1
LIMIT 1
ON CONFLICT (user_id, anime_id) DO NOTHING;

INSERT INTO public.reviews (user_id, anime_id, rating, title, content)
SELECT 
  id,
  95479, -- Jujutsu Kaisen
  9,
  '현대 판타지의 정수',
  '주술회전은 현대 배경의 판타지 작품으로서 매우 잘 만들어진 작품입니다. 주술 시스템이 체계적이고, 캐릭터들의 개성이 뚜렷합니다. 특히 전투씬의 연출이 매우 역동적이고, 스토리 전개도 긴장감 넘칩니다. 애니메이션 퀄리티도 뛰어나서 시각적 즐거움을 제공합니다.'
FROM auth.users
ORDER BY created_at
OFFSET 1
LIMIT 1
ON CONFLICT (user_id, anime_id) DO NOTHING;

-- ============================================
-- 3. 찜하기 생성
-- ============================================

-- 첫 번째 사용자의 찜하기
INSERT INTO public.favorites (user_id, anime_id)
SELECT id, 1396 FROM auth.users ORDER BY created_at LIMIT 1
ON CONFLICT (user_id, anime_id) DO NOTHING;

INSERT INTO public.favorites (user_id, anime_id)
SELECT id, 37854 FROM auth.users ORDER BY created_at LIMIT 1
ON CONFLICT (user_id, anime_id) DO NOTHING;

INSERT INTO public.favorites (user_id, anime_id)
SELECT id, 85937 FROM auth.users ORDER BY created_at LIMIT 1
ON CONFLICT (user_id, anime_id) DO NOTHING;

INSERT INTO public.favorites (user_id, anime_id)
SELECT id, 95479 FROM auth.users ORDER BY created_at LIMIT 1
ON CONFLICT (user_id, anime_id) DO NOTHING;

-- 두 번째 사용자의 찜하기 (있는 경우)
INSERT INTO public.favorites (user_id, anime_id)
SELECT id, 85937 FROM auth.users ORDER BY created_at OFFSET 1 LIMIT 1
ON CONFLICT (user_id, anime_id) DO NOTHING;

INSERT INTO public.favorites (user_id, anime_id)
SELECT id, 95479 FROM auth.users ORDER BY created_at OFFSET 1 LIMIT 1
ON CONFLICT (user_id, anime_id) DO NOTHING;

INSERT INTO public.favorites (user_id, anime_id)
SELECT id, 120089 FROM auth.users ORDER BY created_at OFFSET 1 LIMIT 1
ON CONFLICT (user_id, anime_id) DO NOTHING;

