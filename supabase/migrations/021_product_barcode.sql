-- Add barcode field to products table
-- Separate from SKU: SKU = internal code, barcode = physical barcode on product packaging

ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Index for fast barcode lookup during POS scanning
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products (barcode) WHERE barcode IS NOT NULL;
