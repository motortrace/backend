#!/bin/bash

echo "🗑️  Database Reset Script"
echo "=========================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  WARNING: This will completely reset your database!${NC}"
echo -e "${YELLOW}All data will be lost. Make sure you have backups if needed.${NC}"
echo ""

read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Reset cancelled${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Starting database reset...${NC}"

# Step 1: Reset database
echo "📋 Step 1: Resetting database..."
npx ts-node scripts/reset-database.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database reset completed${NC}"
else
    echo -e "${RED}❌ Database reset failed${NC}"
    exit 1
fi

# Step 2: Push new schema
echo "📋 Step 2: Pushing new schema..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema pushed successfully${NC}"
else
    echo -e "${RED}❌ Schema push failed${NC}"
    exit 1
fi

# Step 3: Generate Prisma client
echo "📋 Step 3: Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma client generated${NC}"
else
    echo -e "${RED}❌ Prisma client generation failed${NC}"
    exit 1
fi

# Step 4: Create role accounts
echo "📋 Step 4: Creating role accounts..."
npx ts-node scripts/create-role-accounts.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Role accounts created successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Role accounts creation failed or skipped${NC}"
    echo -e "${YELLOW}   Check the output above for manual setup instructions${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Database reset completed successfully!${NC}"
echo ""
echo "📋 Database is now ready with:"
echo "  • Clean schema (no duplicate identity data)"
echo "  • Support for app users and walk-ins"
echo "  • Single source of truth for roles (Supabase Auth)"
echo ""
echo "👥 Role accounts should be created automatically above"
echo "   If not, check the output for manual setup instructions" 