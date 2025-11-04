const mysql = require('mysql2/promise');

// Database configuration
// You can set these via environment variables:
// DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
// Or modify the defaults below

// IMPORTANT: Set your MySQL password here or use environment variable
// Try common options: '', 'root', 'password', or your actual MySQL password
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '', // Set your MySQL password here
  database: process.env.DB_NAME || 'restaurant_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// If password is still empty, try to get it from a .env file or prompt
if (!dbConfig.password && !process.env.DB_PASSWORD) {
  console.log('\n⚠️  WARNING: MySQL password not set!');
  console.log('Please set your MySQL password in one of these ways:');
  console.log('1. Edit config/db.js and set the password on line 11');
  console.log('2. Set environment variable: export DB_PASSWORD=your_password');
  console.log('3. Create a .env file with: DB_PASSWORD=your_password\n');
}

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection (non-blocking)
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    console.log('Please make sure MySQL is running and the database is created.');
    console.log('The application will continue but database operations will fail.');
  });

module.exports = pool;

