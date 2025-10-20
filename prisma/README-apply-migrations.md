Run these commands locally (PowerShell) to apply the new products migration and insert a sample product.

# 1. Ensure you're on the inventory-manager branch
git checkout inventory-manager

# 2. Install deps and generate Prisma client
npm install
npx prisma generate

# 3. Apply migrations (this will create the products table)
npx prisma migrate deploy
# or if you want to run in dev and create a proper migration history use:
# npx prisma migrate dev --name add-products

# 4. (Optional) Run the sample insert script
npx ts-node scripts/insert-sample-product.ts

# 5. Open Prisma Studio to view data (optional)
npx prisma studio

# Notes
- The migration file is placed at `prisma/migrations/20251018_add_products/migration.sql`.
- If you prefer to run the SQL direct with psql, run:
# psql -h <host> -p <port> -U <user> -d <db> -f prisma/migrations/20251018_add_products/migration.sql

# If you run into permission errors, ensure your DATABASE_URL in .env points to the local dev DB.
