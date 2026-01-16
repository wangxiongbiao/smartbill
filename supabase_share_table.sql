-- ============================================
-- Smartbill 分享功能数据库迁移脚本
-- ============================================

-- 1. 创建 invoice_shares 表
CREATE TABLE IF NOT EXISTS public.invoice_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  allow_download BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  
  -- 外键约束
  CONSTRAINT invoice_shares_invoice_id_fkey 
    FOREIGN KEY (invoice_id) 
    REFERENCES public.invoices(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT invoice_shares_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_invoice_shares_share_token 
  ON public.invoice_shares(share_token);

CREATE INDEX IF NOT EXISTS idx_invoice_shares_invoice_id 
  ON public.invoice_shares(invoice_id);

CREATE INDEX IF NOT EXISTS idx_invoice_shares_user_id 
  ON public.invoice_shares(user_id);

-- 3. 启用 RLS
ALTER TABLE public.invoice_shares ENABLE ROW LEVEL SECURITY;

-- 4. RLS 策略

-- 用户可以查看自己的分享
CREATE POLICY "Users can view own shares"
  ON public.invoice_shares
  FOR SELECT
  USING (auth.uid() = user_id);

-- 所有人可以通过 token 查看分享 (用于分享页面)
-- 注意：这里使用 security definer 函数或者特殊的查询方式可能更安全，
-- 但对于简单的token查询，我们可以允许基于 token 的 SELECT，或者由后端 API 使用 service role key 绕过 RLS。
-- 由于我们主要通过 Next.js API 路由访问，后端可以使用 server-side client。
-- 但为了安全起见，我们暂不开放公开读权限，完全依赖后端 API 鉴权。

-- 用户可以创建分享
CREATE POLICY "Users can create shares"
  ON public.invoice_shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的分享
CREATE POLICY "Users can delete own shares"
  ON public.invoice_shares
  FOR DELETE
  USING (auth.uid() = user_id);

-- 用户可以更新自己的分享
CREATE POLICY "Users can update own shares"
  ON public.invoice_shares
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. RPC 函数：安全获取分享的发票
-- 这个函数绕过 RLS，允许通过有效的 share_token 获取发票数据
CREATE OR REPLACE FUNCTION public.get_invoice_by_share_token(token_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- 使用定义者的权限运行 (绕过 RLS)
AS $$
DECLARE
  share_record public.invoice_shares;
  invoice_record public.invoices;
BEGIN
  -- 1. 查找分享记录 (检查 token 和过期时间)
  SELECT * INTO share_record
  FROM public.invoice_shares
  WHERE share_token = token_input
    AND (expires_at IS NULL OR expires_at > NOW());

  IF share_record IS NULL THEN
    RETURN NULL;
  END IF;

  -- 2. 获取发票数据
  SELECT * INTO invoice_record
  FROM public.invoices
  WHERE id = share_record.invoice_id;
  
  -- 3. 返回发票的 invoice_data JSON
  RETURN invoice_record.invoice_data;
END;
$$;

-- 6. RPC 函数：增加访问计数
CREATE OR REPLACE FUNCTION public.increment_share_access(share_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.invoice_shares
  SET access_count = access_count + 1,
      last_accessed_at = NOW()
  WHERE id = share_id;
END;
$$;

-- 7. 验证查询
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION';

