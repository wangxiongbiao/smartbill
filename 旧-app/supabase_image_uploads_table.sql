-- Create image_uploads table for storing user image upload history
CREATE TABLE IF NOT EXISTS image_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_type VARCHAR(20) NOT NULL CHECK (image_type IN ('logo', 'qrcode')),
  image_data TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_image_uploads_user_type ON image_uploads(user_id, image_type);
CREATE INDEX IF NOT EXISTS idx_image_uploads_created ON image_uploads(created_at DESC);

-- Enable Row Level Security
ALTER TABLE image_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own image uploads" ON image_uploads;
DROP POLICY IF EXISTS "Users can insert own image uploads" ON image_uploads;
DROP POLICY IF EXISTS "Users can delete own image uploads" ON image_uploads;

-- RLS Policies: Users can only access their own image uploads
CREATE POLICY "Users can view own image uploads"
  ON image_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own image uploads"
  ON image_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own image uploads"
  ON image_uploads FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE image_uploads IS 'Stores user image upload history for logos and QR codes';
COMMENT ON COLUMN image_uploads.image_type IS 'Type of image: logo or qrcode';
COMMENT ON COLUMN image_uploads.image_data IS 'Base64 encoded image data';
