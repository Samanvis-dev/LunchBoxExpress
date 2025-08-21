const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lunchbox_express',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Read and execute schema
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSQL);
    
    console.log('Database schema created successfully!');
    
    // Read and execute seed data
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await pool.query(seedSQL);
    
    console.log('Sample data inserted successfully!');
    console.log('\nDemo login credentials:');
    console.log('- Admin: admin_user / password123');
    console.log('- Parent: rajesh_sharma / password123');
    console.log('- Delivery: speedrider / password123');
    console.log('- School: dps_koramangala / password123');
    console.log('- Caterer: healthy_kitchen / password123');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await pool.end();
  }
}

migrate();