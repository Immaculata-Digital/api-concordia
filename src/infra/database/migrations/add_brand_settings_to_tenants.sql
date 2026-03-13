-- Add brand_settings column to tenants
ALTER TABLE app.tenants ADD COLUMN IF NOT EXISTS brand_settings JSONB;

-- Migrate existing data
UPDATE app.tenants t
SET brand_settings = cb.content
FROM configuracoes_brand cb
WHERE cb.tenant_id = t.uuid;

-- Note: We are keeping the configuracoes_brand table for now to avoid data loss in case of rollbacks.
