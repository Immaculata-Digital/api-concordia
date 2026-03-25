-- Migration: Create site_identidade_visual table and update menus
-- Created at: 2026-03-25

CREATE TABLE IF NOT EXISTS app.site_identidade_visual (
    seq_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL UNIQUE REFERENCES app.tenants(uuid) ON DELETE CASCADE,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Add comment for clarity
COMMENT ON TABLE app.site_identidade_visual IS 'Armazena a identidade visual (logotipos, cores, tipografia) do site de cada tenant.';

-- Update Menus to match user request: "Personalização Site" and "Landing Page"
UPDATE app.menus SET name = 'Personalização Site' WHERE key = 'erp:identidade-visual:listar';
UPDATE app.menus SET name = 'Landing Page' WHERE key = 'erp:landing-pages:listar';
