const pool = require('../config/db');
const fileStorage = require('./fileStorage');

// Try MySQL first, fallback to file storage
let useMySQL = false; // Start with false, will test immediately
let connectionTested = false;

// Test MySQL connection immediately
(async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Using MySQL database');
    connection.release();
    useMySQL = true;
    connectionTested = true;
  } catch (err) {
    console.log('⚠️  MySQL connection failed, using file-based storage');
    console.log('   Error:', err.message);
    console.log('   To use MySQL, set up database and configure password in config/db.js');
    useMySQL = false;
    connectionTested = true;
  }
})();

// MySQL models
const mysqlModels = {
  userModel: require('./userModel'),
  courseModel: require('./courseModel'),
  cartModel: require('./cartModel'),
  contactModel: require('./contactModel')
};

// File storage models
const fileModels = {
  userModel: fileStorage.userModel,
  courseModel: fileStorage.courseModel,
  cartModel: fileStorage.cartModel,
  contactModel: fileStorage.contactModel
};

// Export the appropriate models
function getModels() {
  return useMySQL ? mysqlModels : fileModels;
}

// Wrapper that tries MySQL, falls back to file storage
const adapter = {
  get userModel() {
    // Wait a bit if connection not tested yet
    if (!connectionTested) {
      return fileModels.userModel; // Safe fallback
    }
    const models = getModels();
    return models.userModel;
  },
  get courseModel() {
    if (!connectionTested) {
      return fileModels.courseModel;
    }
    const models = getModels();
    return models.courseModel;
  },
  get cartModel() {
    if (!connectionTested) {
      return fileModels.cartModel;
    }
    const models = getModels();
    return models.cartModel;
  },
  get contactModel() {
    if (!connectionTested) {
      return fileModels.contactModel;
    }
    const models = getModels();
    return models.contactModel;
  },
  // Method to check which storage is being used
  isUsingMySQL() {
    return connectionTested && useMySQL;
  },
  // Method to force refresh connection check
  async checkConnection() {
    try {
      const connection = await pool.getConnection();
      connection.release();
      useMySQL = true;
      connectionTested = true;
      return true;
    } catch {
      useMySQL = false;
      connectionTested = true;
      return false;
    }
  }
};

module.exports = adapter;

