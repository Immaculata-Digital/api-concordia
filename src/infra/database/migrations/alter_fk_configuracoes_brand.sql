ALTER TABLE configuracoes_brand DROP CONSTRAINT IF EXISTS fk_configuracoes_brand_tenant;
ALTER TABLE configuracoes_brand ADD CONSTRAINT fk_configuracoes_brand_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
