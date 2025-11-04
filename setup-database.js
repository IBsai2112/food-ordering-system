const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration (same as config/db.js)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

async function setupDatabase() {
  let connection;
  try {
    console.log('Connecting to MySQL...');
    // Connect without specifying database first
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    console.log('Connected to MySQL server');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log('Executing database setup...');
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✓ Executed:', statement.substring(0, 50) + '...');
        } catch (err) {
          // Ignore errors for statements that might already exist
          if (err.code !== 'ER_TABLE_EXISTS_ERROR' && err.code !== 'ER_DB_CREATE_EXISTS') {
            console.error('Error executing statement:', err.message);
            console.error('Statement:', statement.substring(0, 100));
          }
        }
      }
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log('You can now start the application with: npm start');

  } catch (error) {
    console.error('\n❌ Database setup failed:');
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure MySQL server is running.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Check your database credentials:');
      console.error('   - DB_HOST:', dbConfig.host);
      console.error('   - DB_USER:', dbConfig.user);
      console.error('   - DB_PASSWORD:', dbConfig.password ? '***' : '(empty)');
      console.error('\n   You can set these via environment variables or edit config/db.js');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();

