-- 월드컵 우승자 테이블 생성
CREATE TABLE IF NOT EXISTS public.worldcup_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worldcup_id TEXT NOT NULL, -- 예: 'all', 'chainsaw', 'onepiece'
  character_id INTEGER NOT NULL, -- AniList Character ID
  character_name TEXT NOT NULL,
  character_image TEXT NOT NULL,
  ani_title TEXT NOT NULL, -- 애니메이션 제목
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_worldcup_winners_user_id ON public.worldcup_winners(user_id);
CREATE INDEX IF NOT EXISTS idx_worldcup_winners_worldcup_id ON public.worldcup_winners(worldcup_id);
CREATE INDEX IF NOT EXISTS idx_worldcup_winners_created_at ON public.worldcup_winners(created_at DESC);

-- RLS (Row Level Security) 설정
ALTER TABLE public.worldcup_winners ENABLE ROW LEVEL SECURITY;

-- Select: 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view worldcup winners"
  ON public.worldcup_winners
  FOR SELECT
  USING (true);

-- Insert: 본인만 가능
CREATE POLICY "Users can insert their own worldcup winners"
  ON public.worldcup_winners
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Delete: 본인만 가능
CREATE POLICY "Users can delete their own worldcup winners"
  ON public.worldcup_winners
  FOR DELETE
  USING (auth.uid() = user_id);

