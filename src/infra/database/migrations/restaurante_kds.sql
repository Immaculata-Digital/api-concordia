-- Migração para melhorias no KDS e metas de restaurante

-- 1. Criar tabela de metas do restaurante
CREATE TABLE IF NOT EXISTS app.restaurante_metas (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES app.tenants(uuid) ON DELETE CASCADE,
    recebido_min INTERVAL NOT NULL DEFAULT '5 minutes',
    pronto_min INTERVAL NOT NULL DEFAULT '10 minutes',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id)
);

-- 2. Adicionar flag de exibição de tempo de preparo no cardápio
ALTER TABLE app.produtos_cardapio 
ADD COLUMN IF NOT EXISTS exibir_tempo_preparo BOOLEAN NOT NULL DEFAULT TRUE;

-- 3. Garantir que o status de pedidos suporte novos valores (se for string, não faz nada; se for enum, precisa de ALTER TYPE)
-- Nota: A maioria das tabelas aqui usa string para status por flexibilidade, mas vou validar.
