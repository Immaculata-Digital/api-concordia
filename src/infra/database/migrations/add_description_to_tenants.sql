-- Migration to add description field to tenants table
ALTER TABLE app.tenants 
ADD COLUMN IF NOT EXISTS description TEXT;
