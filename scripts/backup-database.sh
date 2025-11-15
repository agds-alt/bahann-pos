#!/bin/bash

# Database Backup Script
# Backs up Supabase database using pg_dump or Supabase CLI

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/database"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}Starting database backup...${NC}"
echo "Timestamp: $TIMESTAMP"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}Using Supabase CLI for backup...${NC}"

    # Backup using Supabase CLI
    supabase db dump -f "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup completed successfully${NC}"
        echo "Backup file: $BACKUP_FILE"

        # Show backup size
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        echo "Backup size: $BACKUP_SIZE"

        # Compress backup
        echo "Compressing backup..."
        gzip "$BACKUP_FILE"
        COMPRESSED_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
        echo "Compressed size: $COMPRESSED_SIZE"
        echo "Compressed file: $BACKUP_FILE.gz"
    else
        echo -e "${RED}❌ Backup failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Supabase CLI not found${NC}"
    echo ""
    echo "Install Supabase CLI:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or use pg_dump directly:"
    echo "  pg_dump -h db.xxx.supabase.co -U postgres -d postgres > $BACKUP_FILE"
    exit 1
fi

# Clean up old backups (keep last 7 days)
echo ""
echo "Cleaning up old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +7 -delete
echo "Cleanup complete"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     BACKUP COMPLETED SUCCESSFULLY      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
