-- user_profiles 테이블에 is_fake 컬럼 추가
-- 가데이터 유저와 실제 유저를 구분하기 위한 컬럼

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_fake BOOLEAN DEFAULT FALSE;

-- 기존 데이터는 모두 실제 유저로 설정
UPDATE public.user_profiles
SET is_fake = FALSE
WHERE is_fake IS NULL;

-- 인덱스 추가 (가데이터 필터링 성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_fake ON public.user_profiles(is_fake);

