-- ============================================
-- Smartbill 分享功能数据库补充脚本 - 修复匿名访问权限
-- ============================================

-- 1. 删除旧的函数 (如果存在)
DROP FUNCTION IF EXISTS public.get_invoice_by_share_token(TEXT);

-- 2. 创建增强版 RPC 函数
-- 同时返回分享信息和发票数据，解决 RLS 阻止匿名用户查询 invoice_shares 的问题
CREATE OR REPLACE FUNCTION public.get_share_date_by_token(token_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- 关键：使用定义者权限绕过 RLS
AS $$
DECLARE
  share_record RECORD;
  invoice_record public.invoices;
  result JSONB;
BEGIN
  -- 1. 查找分享记录
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
  
  IF invoice_record IS NULL THEN
    RETURN NULL;
  END IF;

  -- 3. 构造返回数据
  -- 我们需要返回符合前端结构的数据： { share: ..., invoice: ... }
  result := jsonb_build_object(
    'share', jsonb_build_object(
      'id', share_record.id,
      'invoice_id', share_record.invoice_id,
      'user_id', share_record.user_id,
      'share_token', share_record.share_token,
      'allow_download', share_record.allow_download,
      'expires_at', share_record.expires_at,
      'created_at', share_record.created_at,
      'last_accessed_at', share_record.last_accessed_at,
      'access_count', share_record.access_count
    ),
    'invoice', invoice_record.invoice_data
  );
  
  RETURN result;
END;
$$;

-- 3. 验证
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_share_date_by_token';
