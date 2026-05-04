/**
 * Migration: Add menu_mode column to business_settings
 * Run via: node add_menu_mode.js
 * 
 * This adds a menu_mode column (default 1 = menu only) to the business_settings table.
 */
const pool = require('./config/db');

async function migrate() {
  try {
    console.log('Adding menu_mode column to business_settings...');
    await pool.query(
      `ALTER TABLE business_settings ADD COLUMN menu_mode TINYINT(1) NOT NULL DEFAULT 1`
    );
    console.log('✅ menu_mode column added successfully');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  menu_mode column already exists, skipping.');
    } else {
      console.error('❌ Migration failed:', err.message);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
