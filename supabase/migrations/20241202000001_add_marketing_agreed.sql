-- user_profiles 테이블에 marketing_agreed 컬럼 추가
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS marketing_agreed BOOLEAN NOT NULL DEFAULT false;

-- 기존 사용자들의 marketing_agreed는 기본값 false로 설정됨
COMMENT ON COLUMN public.user_profiles.marketing_agreed IS '마케팅 정보 수신 동의 여부 (선택사항)';

