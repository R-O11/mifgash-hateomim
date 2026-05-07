const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seedAdmin() {
  try {
    // 1. Create admin_users table if it doesn't exist (MySQL syntax)
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await pool.query(createTableQuery);

    // 2. Check if an admin already exists
    const [existingAdmins] = await pool.query('SELECT * FROM admin_users WHERE username = ?', ['admin']);

    if (existingAdmins.length > 0) {
      console.log('Admin user already exists.');
    } else {
      // 3. Create regular admin user
      const defaultPassword = 'password123';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

      await pool.query('INSERT INTO admin_users (username, password_hash, full_name) VALUES (?, ?, ?)', ['admin', hashedPassword, 'Main Admin']);
      console.log('Admin user seeded successfully! Username: admin, Password: password123');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } process.exit();
}

seedAdmin();
