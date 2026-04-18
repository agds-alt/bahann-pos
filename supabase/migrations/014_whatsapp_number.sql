-- Migration: Add WhatsApp number to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);
