-- Create invoice_templates table
CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  thumbnail TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 确保名称不为空
  CONSTRAINT name_not_empty CHECK (char_length(name) > 0)
);

-- 创建索引以优化查询性能
CREATE INDEX idx_templates_user_id ON invoice_templates(user_id);
CREATE INDEX idx_templates_created_at ON invoice_templates(created_at DESC);

-- 启用行级安全策略 (RLS)
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户只能查看自己的模板
CREATE POLICY "Users can view own templates"
  ON invoice_templates FOR SELECT
  USING (auth.uid() = user_id);

-- RLS策略：用户只能创建自己的模板
CREATE POLICY "Users can create own templates"
  ON invoice_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS策略：用户只能更新自己的模板
CREATE POLICY "Users can update own templates"
  ON invoice_templates FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS策略：用户只能删除自己的模板
CREATE POLICY "Users can delete own templates"
  ON invoice_templates FOR DELETE
  USING (auth.uid() = user_id);

-- 创建更新时间自动更新的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoice_templates_updated_at
  BEFORE UPDATE ON invoice_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
