-- Rename access keys for Vitrine module
-- 2026-03-24

-- Update app.menus
UPDATE app.menus SET key = 'erp:produtos:vitrine' WHERE key = 'erp:produtos:ecommerce-produtos';
UPDATE app.menus SET key = 'erp:pessoas:vitrine' WHERE key = 'erp:pessoas:ecommercelojas';
UPDATE app.menus SET key = 'erp:produtos:lista-produtos:vitrine' WHERE key = 'erp:produtos:lista:listar';

-- Update app.features
UPDATE app.features SET key = 'erp:produtos:vitrine' WHERE key = 'erp:produtos:ecommerce-produtos';
UPDATE app.features SET key = 'erp:pessoas:vitrine' WHERE key = 'erp:pessoas:ecommercelojas';
UPDATE app.features SET key = 'erp:produtos:lista-produtos:vitrine' WHERE key = 'erp:produtos:lista:listar';

-- Update app.access_groups_features
UPDATE app.access_groups_features SET feature_key = 'erp:produtos:vitrine' WHERE feature_key = 'erp:produtos:ecommerce-produtos';
UPDATE app.access_groups_features SET feature_key = 'erp:pessoas:vitrine' WHERE feature_key = 'erp:pessoas:ecommercelojas';
UPDATE app.access_groups_features SET feature_key = 'erp:produtos:lista-produtos:vitrine' WHERE feature_key = 'erp:produtos:lista:listar';
