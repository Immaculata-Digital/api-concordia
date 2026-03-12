-- Migration to change logo column to TEXT for base64 support
ALTER TABLE app.tenants 
ALTER COLUMN logo TYPE TEXT;
