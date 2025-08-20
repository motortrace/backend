# Setup Inspection Templates - Fix Prisma Issues

## The Problem
The TypeScript errors you're seeing are because the Prisma client hasn't been regenerated after adding the new inspection template models to the schema.

## Solution Steps

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. Create and Run Migration
```bash
npx prisma migrate dev --name add-inspection-templates
```

### 3. Seed the Database (Optional)
If you want to add the predefined templates:
```bash
# Run the SQL file we created
psql -d your_database_name -f prisma/seed-inspection-templates.sql
```

## What This Fixes

✅ **Prisma Client Recognition**: The client will now recognize `InspectionTemplate`, `InspectionTemplateItem`, and the updated `WorkOrderInspection` models

✅ **Type Safety**: All the TypeScript errors will be resolved

✅ **Database Schema**: The new tables will be created in your database

✅ **API Endpoints**: All inspection template endpoints will work correctly

## After Running These Commands

1. **Restart your development server** to pick up the new Prisma client
2. **Test the endpoints** using the curl commands provided
3. **All TypeScript errors should be resolved**

## Verification

After setup, you can verify everything is working:

```bash
# Test the health endpoint
curl http://localhost:3000/health

# Test getting available templates
curl http://localhost:3000/inspection-templates/templates/available
```

## Common Issues

### If you get database connection errors:
- Make sure your `DATABASE_URL` in `.env` is correct
- Ensure your database is running

### If you get permission errors:
- Make sure you have the right permissions to create tables
- Check your database user permissions

### If Prisma generate fails:
- Make sure all syntax in `schema.prisma` is correct
- Check for any missing semicolons or brackets
