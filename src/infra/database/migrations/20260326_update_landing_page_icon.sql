-- Update Landing Page Icon
UPDATE app.menus 
SET icon = 'Web', updated_at = CURRENT_TIMESTAMP
WHERE key = 'erp:landing-pages:listar';
