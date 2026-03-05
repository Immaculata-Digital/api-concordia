-- Migration to create the product_lists table
CREATE TABLE IF NOT EXISTS app.product_lists (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES app.tenants(uuid),
    name VARCHAR NOT NULL,
    product_uuids UUID[] DEFAULT '{}',
    
    -- Standard tracking fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);
