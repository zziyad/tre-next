#!/bin/bash

# Script to switch to RBAC database (with RBAC schema)
echo "Switching to RBAC database (with RBAC schema)..."

# Copy RBAC environment to .env
cp env.rbac .env

# Run database migrations for RBAC schema
echo "Running migrations for RBAC database..."
npx prisma migrate deploy

echo "✅ Switched to RBAC database!"
echo "Database URL: postgresql://zi:zi@localhost:5432/trs_db?schema=public"
echo ""
echo "To start the application:"
echo "npm run dev" 