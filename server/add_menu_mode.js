/**
 * Migration: Add menu_mode column to business_settings
 * Run via: node add_menu_mode.js
 * 
 * This adds a menu_mode column (default true = menu only) to the business_settings table.
 */
const pool = require('./config/db');

async function migrate() {
  try {
    console.log('Adding menu_mode column to business_settings...');
    await pool.query(
      `ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS menu_mode BOOLEAN NOT NULL DEFAULT true`
    );
    console.log('✅ menu_mode column added successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
