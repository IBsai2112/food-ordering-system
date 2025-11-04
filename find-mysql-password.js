const mysql = require('mysql2/promise');

// Common MySQL passwords to try
const passwordsToTry = ['', 'root', 'password', '123456', 'admin'];

async function findPassword() {
  console.log('🔍 Trying to find your MySQL password...\n');
  
  for (const password of passwordsToTry) {
    try {
      console.log(`Trying password: ${password || '(empty)'}...`);
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: password
      });
      
      console.log(`✅ SUCCESS! Password found: "${password || '(empty)'}"`);
      console.log('\n📝 Update config/db.js line 11:');
      console.log(`   password: process.env.DB_PASSWORD || '${password}',`);
      console.log('\nOr set environment variable:');
      console.log(`   export DB_PASSWORD="${password}"`);
      
      await connection.end();
      return password;
    } catch (error) {
      // Not the right password, continue
    }
  }
  
  console.log('❌ Could not find password automatically.');
  console.log('\n💡 Please find your MySQL password manually:');
  console.log('   1. Try: mysql -u root -p (and enter your password)');
  console.log('   2. Check if you have MySQL installed via Homebrew:');
  console.log('      - Check ~/.mysql_history or ~/.my.cnf');
  console.log('   3. If you use MySQL Workbench, check saved connections');
  console.log('   4. Reset MySQL root password if needed');
  
  return null;
}

findPassword();

