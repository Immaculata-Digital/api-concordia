-- Migration to add image_url and parent_uuid to product categories
ALTER TABLE app.produtos_categoria_category_enum 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS parent_uuid UUID REFERENCES app.produtos_categoria_category_enum(uuid);
