-- Migration: Create app.modules table
-- Author: Antigravity AI
-- Date: 2026-03-23

CREATE TABLE IF NOT EXISTS app.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    menu_parent TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data from modules.json + 'cadastros'
INSERT INTO app.modules (key, name, menu_parent, order_index) VALUES 
('cadastros', 'Cadastros', 'Cadastros', 0),
('pluvyt', 'PLUVYT', 'PLUVYT', 1),
('restaurante', 'Restaurante', 'Restaurante', 2),
('site', 'Site', 'Site', 3),
('vitrine', 'Vitrine', 'Vitrine', 4),
('whatsapp', 'WhatsApp', 'WhatsApp', 5),
('comunicacoes', 'Comunicações', 'Comunicações', 6)
ON CONFLICT (key) DO UPDATE SET 
    name = EXCLUDED.name, 
    menu_parent = EXCLUDED.menu_parent, 
    order_index = EXCLUDED.order_index;
