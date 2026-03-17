-- Add social_media column to tenants table
ALTER TABLE app.tenants ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;
