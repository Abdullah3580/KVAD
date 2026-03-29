-- KVAD v2 MIGRATION — Supabase SQL Editor এ পেস্ট করুন

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_name   text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_line1  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city   text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_zip    text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal        decimal(12,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount        decimal(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost   decimal(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax             decimal(12,2) DEFAULT 0;

ALTER TABLE products ADD COLUMN IF NOT EXISTS description   text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors        text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes         text[];

CREATE TABLE IF NOT EXISTS order_items (
  id             uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id       uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id     integer,
  product_name   text,
  product_image  text,
  selected_size  text,
  selected_color text,
  unit_price     decimal(12,2),
  quantity       integer DEFAULT 1,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('multi_store_enabled', 'false'),
  ('max_sellers', '10'),
  ('shop_name', 'KVAD'),
  ('currency', 'BDT')
ON CONFLICT (key) DO NOTHING;
