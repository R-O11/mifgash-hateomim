const pool = require('./server/config/db');

async function migrate() {
  try {
    const connection = await pool.getConnection();
    console.log('Running migrations...');

    // Add hero config to business_settings
    await connection.query('ALTER TABLE business_settings ADD COLUMN hero_image_url VARCHAR(255) DEFAULT "/uploads/default_hero.jpg"').catch(e => console.log('Already exists or err:', e.message));
    
    await connection.query('ALTER TABLE business_settings ADD COLUMN hero_badge_he VARCHAR(100) DEFAULT "חדש בתפריט"').catch(e => console.log('Already exists or err: hero_badge_he'));
    await connection.query('ALTER TABLE business_settings ADD COLUMN hero_badge_ar VARCHAR(100) DEFAULT "جديد في القائمة"').catch(e => console.log('Already exists or err: hero_badge_ar'));
    
    await connection.query('ALTER TABLE business_settings ADD COLUMN hero_title_he VARCHAR(200) DEFAULT "טראפלס בורגר כפול"').catch(e => console.log('Already exists or err: hero_title_he'));
    await connection.query('ALTER TABLE business_settings ADD COLUMN hero_title_ar VARCHAR(200) DEFAULT "ترافل برجر مزدوج"').catch(e => console.log('Already exists or err: hero_title_ar'));
    
    await connection.query('ALTER TABLE business_settings ADD COLUMN hero_desc_he VARCHAR(300) DEFAULT "לחמניית בריוש, בקר וואגיו, איולי כמהין שחור."').catch(e => console.log('Already exists or err: hero_desc_he'));
    await connection.query('ALTER TABLE business_settings ADD COLUMN hero_desc_ar VARCHAR(300) DEFAULT "خبز بريوش، لحم واغيو، أيولي كمأة سوداء."').catch(e => console.log('Already exists or err: hero_desc_ar'));

    // Add is_recommended to products
    await connection.query('ALTER TABLE products ADD COLUMN is_recommended TINYINT(1) NOT NULL DEFAULT 0').catch(e => console.log('Already exists or err: is_recommended'));
    
    // Also, since the admin should have easy recommendations, I will mark products 5 and 6 as recommended for initial data
    await connection.query('UPDATE products SET is_recommended = 1 ORDER BY id DESC LIMIT 2');

    connection.release();
    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
migrate();
