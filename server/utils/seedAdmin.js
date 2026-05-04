const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seedAdmin() {
  try {
    // 1. Create admins table if it doesn't exist (PostgreSQL syntax)
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(createTableQuery);

    // 2. Check if an admin already exists
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', ['admin']);
    const existingAdmins = result.rows;

    if (existingAdmins.length > 0) {
      console.log('Admin user already exists.');
    } else {
      // 3. Create regular admin user
      const defaultPassword = 'password123';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

      await pool.query('INSERT INTO admins (username, password) VALUES ($1, $2)', ['admin', hashedPassword]);
      console.log('Admin user seeded successfully! Username: admin, Password: password123');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } process.exit();
}

seedAdmin();
