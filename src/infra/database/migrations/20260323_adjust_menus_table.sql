-- Migration: Adjust app.menus table with module, order_index and parent_key
-- Author: Antigravity AI
-- Date: 2026-03-23

-- Add columns safely
ALTER TABLE app.menus ADD COLUMN IF NOT EXISTS module TEXT;
ALTER TABLE app.menus ADD COLUMN IF NOT EXISTS order_index INTEGER;
ALTER TABLE app.menus ADD COLUMN IF NOT EXISTS parent_key TEXT;

-- Reset and Populate data mapping from menus.json
-- Category mapping: 
-- 'PLUVYT' -> 'pluvyt'
-- 'Restaurante' -> 'restaurante'
-- 'Site' -> 'site'
-- 'Loja Virtual' -> 'loja-virtual'
-- 'WhatsApp' -> 'whatsapp'
-- 'Comunicações' -> 'comunicacoes'
-- 'Cadastros' -> NULL

DO $$ 
BEGIN
    -- Update order_index and module for each key
    -- Cadastros
    UPDATE app.menus SET order_index = 1, module = 'cadastros' WHERE key = 'erp:menus:cadastro:pessoas';
    UPDATE app.menus SET order_index = 2, module = 'cadastros' WHERE key = 'erp:menus:cadastro:categorias';
    UPDATE app.menus SET order_index = 3, module = 'cadastros' WHERE key = 'erp:pessoas:tipos-relacionamento:listar';
    UPDATE app.menus SET order_index = 4, module = 'cadastros' WHERE key = 'erp:menus:cadastro:produtos';
    UPDATE app.menus SET order_index = 5, module = 'cadastros' WHERE key = 'erp:produtos:lista:listar';

    -- PLUVYT
    UPDATE app.menus SET order_index = 6, module = 'pluvyt' WHERE key = 'erp:pluvyt-clients:listar';
    UPDATE app.menus SET order_index = 7, module = 'pluvyt' WHERE key = 'erp:recompensas:listar';
    UPDATE app.menus SET order_index = 8, module = 'pluvyt' WHERE key = 'erp:tenants:pluvyt:listar';
    UPDATE app.menus SET order_index = 9, module = 'pluvyt' WHERE key = 'erp:transacoes-pontos:listar';

    -- Restaurante
    UPDATE app.menus SET order_index = 10, module = 'restaurante' WHERE key = 'erp:restaurante:dashboard:visualizar';
    UPDATE app.menus SET order_index = 11, module = 'restaurante' WHERE key = 'erp:cardapio:itens:listar';
    UPDATE app.menus SET order_index = 12, module = 'restaurante' WHERE key = 'erp:mesas:listar';
    UPDATE app.menus SET order_index = 13, module = 'restaurante' WHERE key = 'erp:comandas:listar';
    UPDATE app.menus SET order_index = 14, module = 'restaurante' WHERE key = 'erp:restaurante:historico:listar';
    UPDATE app.menus SET order_index = 15, module = 'restaurante' WHERE key = 'erp:kds:operacional';

    -- Site
    UPDATE app.menus SET order_index = 16, module = 'site' WHERE key = 'erp:identidade-visual:listar';
    UPDATE app.menus SET order_index = 17, module = 'site' WHERE key = 'erp:landing-pages:listar';

    -- Loja Virtual
    UPDATE app.menus SET order_index = 18, module = 'loja-virtual' WHERE key = 'erp:pessoas:ecommercelojas';
    UPDATE app.menus SET order_index = 19, module = 'loja-virtual' WHERE key = 'erp:produtos:ecommerce-produtos';
    UPDATE app.menus SET order_index = 20, module = 'loja-virtual' WHERE key = 'erp:produtos:lista:listar' AND category = 'Loja Virtual';

    -- Comunicações
    UPDATE app.menus SET order_index = 21, module = 'comunicacoes' WHERE key = 'erp:remetentes-smtp:listar';
    UPDATE app.menus SET order_index = 22, module = 'comunicacoes' WHERE key = 'erp:campanhas-disparo:listar';

END $$;
