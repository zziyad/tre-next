#!/bin/bash

# Script to switch to main database (current schema without RBAC)
echo "Switching to MAIN database (current schema without RBAC)..."

# Copy main environment to .env
cp env.main .env

# Run database migrations for main schema
echo "Running migrations for main database..."
npx prisma migrate deploy

echo "✅ Switched to MAIN database!"
echo "Database URL: postgresql://zi:zi@localhost:5432/trs_db_main?schema=public"
echo ""
echo "To start the application:"
echo "npm run dev" 