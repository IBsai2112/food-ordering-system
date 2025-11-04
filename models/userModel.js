const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Create user (INSERT)
const createUser = async (name, email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO user_tbl (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return { id: result.insertId, name, email };
  } catch (error) {
    throw error;
  }
};

// Get user by email (RETRIEVE)
const getUserByEmail = async (email) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM user_tbl WHERE email = ?',
      [email]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Get user by id (RETRIEVE)
const getUserById = async (id) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, created_at FROM user_tbl WHERE id = ?',
      [id]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Update user (UPDATE)
const updateUser = async (id, name, email) => {
  try {
    await pool.execute(
      'UPDATE user_tbl SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    return { id, name, email };
  } catch (error) {
    throw error;
  }
};

// Delete user (DELETE)
const deleteUser = async (id) => {
  try {
    await pool.execute('DELETE FROM user_tbl WHERE id = ?', [id]);
    return true;
  } catch (error) {
    throw error;
  }
};

// Verify password
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
  verifyPassword
};

