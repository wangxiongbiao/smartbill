-- ============================================
-- Smartbill 院校海报表创建脚本
-- ============================================

CREATE TABLE IF NOT EXISTS public.school_posters (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  layout_id TEXT NOT NULL,
  school_name_cn TEXT,
  school_name_en TEXT,
  student_name TEXT,
  poster_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT school_posters_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_school_posters_user_id
  ON public.school_posters(user_id);

CREATE INDEX IF NOT EXISTS idx_school_posters_updated_at
  ON public.school_posters(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_school_posters_school_name_cn
  ON public.school_posters(school_name_cn);

CREATE INDEX IF NOT EXISTS idx_school_posters_school_name_en
  ON public.school_posters(school_name_en);

ALTER TABLE public.school_posters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own school posters"
  ON public.school_posters
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own school posters"
  ON public.school_posters
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own school posters"
  ON public.school_posters
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own school posters"
  ON public.school_posters
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_school_posters_updated_at
  BEFORE UPDATE ON public.school_posters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
