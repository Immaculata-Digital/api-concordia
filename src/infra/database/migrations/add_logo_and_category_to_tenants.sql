-- Migration to add logo and category fields to tenants table
ALTER TABLE app.tenants 
ADD COLUMN IF NOT EXISTS logo VARCHAR,
ADD COLUMN IF NOT EXISTS category VARCHAR DEFAULT 'Sem Categoria';
