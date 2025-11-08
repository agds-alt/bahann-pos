#!/bin/bash

# Setup Refresh Tokens Migration
# Run this script to check and setup refresh tokens table

echo "🔍 Checking refresh tokens setup..."
echo ""

# Check if migration file exists
if [ ! -f "supabase/migrations/006_refresh_tokens.sql" ]; then
  echo "❌ Migration file not found: supabase/migrations/006_refresh_tokens.sql"
  exit 1
fi

echo "✅ Migration file found: supabase/migrations/006_refresh_tokens.sql"
echo ""
echo "📋 To setup refresh tokens table, you have 2 options:"
echo ""
echo "Option 1: Via Supabase Dashboard (Recommended)"
echo "  1. Open Supabase Dashboard → SQL Editor"
echo "  2. Copy the content of: supabase/migrations/006_refresh_tokens.sql"
echo "  3. Paste and click 'Run'"
echo ""
echo "Option 2: Via Supabase CLI (if installed)"
echo "  1. Run: npx supabase db push"
echo "  or"
echo "  2. Run: psql -h YOUR_DB_HOST -U postgres -d postgres -f supabase/migrations/006_refresh_tokens.sql"
echo ""
echo "📄 Migration file content preview:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
head -20 supabase/migrations/006_refresh_tokens.sql
echo "..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  After running migration, restart your dev server:"
echo "   npm run dev"
