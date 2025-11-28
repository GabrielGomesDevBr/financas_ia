#!/usr/bin/env node

/**
 * Script to run migrations on the Supabase database
 * Runs both the family_members sync fix and RLS policies for invites
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env.local')
    process.exit(1)
}

// Extract Supabase URL and key from DATABASE_URL
// Format: postgresql://postgres:PASSWORD@HOST:5432/postgres
const match = databaseUrl.match(/postgresql:\/\/postgres:(.+)@(.+):5432\/postgres/)

if (!match) {
    console.error('❌ Invalid DATABASE_URL format')
    process.exit(1)
}

const [, password, host] = match
const supabaseUrl = `https://${host.replace('db.', '').replace('.supabase.co', '')}.supabase.co`
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment')
    console.log('ℹ️  Trying to run migrations via direct SQL...')
}

console.log('🔄 Running migrations...\n')

// Migration 1: Fix missing family_members (data migration)
console.log('📝 Migration 1: Backfill missing family_members records')
const migration1Path = path.join(__dirname, '../scripts/fix_missing_family_members.sql')
const migration1Sql = fs.readFileSync(migration1Path, 'utf8')

// Migration 2: Fix family_invites RLS policies
console.log('📝 Migration 2: Fix family_invites RLS policies')
const migration2Path = path.join(__dirname, '../supabase/migrations/20241128000002_fix_family_invites_rls.sql')
const migration2Sql = fs.readFileSync(migration2Path, 'utf8')

// For Supabase, we'll use the SQL Editor or run via psql
console.log('\n📋 Please run these migrations in your Supabase SQL Editor:\n')
console.log('='.repeat(80))
console.log('MIGRATION 1: Backfill family_members')
console.log('='.repeat(80))
console.log(migration1Sql)
console.log('\n' + '='.repeat(80))
console.log('MIGRATION 2: Fix RLS Policies')
console.log('='.repeat(80))
console.log(migration2Sql)
console.log('\n' + '='.repeat(80))

console.log('\n✅ Copy and paste these SQL statements into your Supabase SQL Editor')
console.log('🔗 https://supabase.com/dashboard/project/your-project/sql')
