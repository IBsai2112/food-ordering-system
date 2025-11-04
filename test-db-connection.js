const pool = require('./config/db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful!');
    
    // Test if tables exist
    console.log('\nChecking tables...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'user_tbl'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Table user_tbl does not exist!');
      console.log('   Please run: npm run setup-db');
    } else {
      console.log('✅ Table user_tbl exists');
    }
    
    // Check other tables
    const [courseTable] = await connection.execute(
      "SHOW TABLES LIKE 'course_tbl'"
    );
    const [cartTable] = await connection.execute(
      "SHOW TABLES LIKE 'cart_tbl'"
    );
    const [contactTable] = await connection.execute(
      "SHOW TABLES LIKE 'contact_tbl'"
    );
    
    console.log(courseTable.length > 0 ? '✅ Table course_tbl exists' : '❌ Table course_tbl missing');
    console.log(cartTable.length > 0 ? '✅ Table cart_tbl exists' : '❌ Table cart_tbl missing');
    console.log(contactTable.length > 0 ? '✅ Table contact_tbl exists' : '❌ Table contact_tbl missing');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Fix: Update the password in config/db.js');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Fix: Run: npm run setup-db');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Fix: Make sure MySQL server is running');
    }
    
    process.exit(1);
  }
}

testConnection();

