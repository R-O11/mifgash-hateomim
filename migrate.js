const pool = require('./server/config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');

    // Add hero config to business_settings
    await client.query('ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_image_url VARCHAR(255) DEFAULT \'/uploads/default_hero.jpg\'');
    await client.query('ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_badge_he VARCHAR(100) DEFAULT \'חדש בתפריט\'');
    await client.query('ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_badge_ar VARCHAR(100) DEFAULT \'جديد في القائمة\'');
    await client.query('ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_title_he VARCHAR(200) DEFAULT \'טראפלס בורגר כפול\'');
    await client.query('ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_title_ar VARCHAR(200) DEFAULT \'ترافل برجر مزدوج\'');
    await client.query('ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_desc_he VARCHAR(300) DEFAULT \'לחמניית בריוש, בקר וואגיו, איולי כמהין שחור.\'');
    await client.query('ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_desc_ar VARCHAR(300) DEFAULT \'خبز بريوش، لحم واغيو، أيولي كمأة سوداء.\'');

    // Add is_recommended to products
    await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN NOT NULL DEFAULT false');

    // Mark the last 2 products as recommended for initial data
    await client.query('UPDATE products SET is_recommended = true WHERE id IN (SELECT id FROM products ORDER BY id DESC LIMIT 2)');

    client.release();
    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    client.release();
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
migrate();
