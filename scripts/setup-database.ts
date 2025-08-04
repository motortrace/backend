#!/usr/bin/env ts-node

/**
 * Database Setup Script
 * This script sets up the database with the new schema
 */

import { execSync } from 'child_process';
import path from 'path';

async function setupDatabase() {
  console.log('🗄️ Setting up database...');

  try {
    // 1. Generate Prisma client with new schema
    console.log('1️⃣ Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated');

    // 2. Push schema to database
    console.log('2️⃣ Pushing schema to database...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Schema pushed to database');

    // 3. Seed database with initial data (optional)
    console.log('3️⃣ Seeding database...');
    try {
      execSync('npx prisma db seed', { stdio: 'inherit' });
      console.log('✅ Database seeded');
    } catch (error) {
      console.log('⚠️ No seed script found, skipping...');
    }

    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase().catch(console.error); 