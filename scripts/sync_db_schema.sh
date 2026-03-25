#!/bin/bash
# api-concordia/scripts/sync_db_schema.sh
# Extract schema for Homolog and Production to facilitate diffing
# This script does NOT alter anything, merely reads schemas safely.

set -e

ENV_FILE=".env.sync"

# Check if .env.sync exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE does not exist. Please create it based on .env.sync.example"
    exit 1
fi

export $(grep -v '^#' $ENV_FILE | xargs)

echo "⏳ Generating Schema Dump for Homologation (Port $PG_PORT_HOMOLOG)..."
export PGPASSWORD=$PG_PASS
pg_dump -h $PG_HOST -p $PG_PORT_HOMOLOG -U $PG_USER -d $PG_DB -s -n app -f api-concordia/homolog_schema.sql
echo "✅ homolog_schema.sql generated successfully!"

echo "⏳ Generating Schema Dump for Production (Port $PG_PORT_PROD)..."
export PGPASSWORD=$PG_PASS_PROD
pg_dump -h $PG_HOST -p $PG_PORT_PROD -U $PG_USER -d $PG_DB -s -n app -f api-concordia/prod_schema.sql
echo "✅ prod_schema.sql generated successfully!"

echo "⏳ Generating Data Dump for Config Tables (Features, Menus & Modules)..."
export PGPASSWORD=$PG_PASS
pg_dump -h $PG_HOST -p $PG_PORT_HOMOLOG -U $PG_USER -d $PG_DB -a -t app.features -t app.menus -t app.modules --inserts -f api-concordia/homolog_data.sql
echo "✅ homolog_data.sql generated successfully!"

echo "================================================="
echo "Done! You can now use a diff tool (like VS Code or diff) "
echo "to compare homolog_schema.sql with prod_schema.sql."
echo ""
echo "For Data Sync:"
echo "Review homolog_data.sql and incorporate it into your migration."
echo "Use 'TRUNCATE app.menus, app.features;' before the INSERTs."
echo "================================================="
