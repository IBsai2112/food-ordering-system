const pool = require('../config/db');

// Create contact message (INSERT)
const createContact = async (name, email, message) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO contact_tbl (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );
    return { id: result.insertId, name, email, message };
  } catch (error) {
    throw error;
  }
};

// Get all contact messages (RETRIEVE)
const getAllContacts = async () => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM contact_tbl ORDER BY created_at DESC'
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get contact by id (RETRIEVE)
const getContactById = async (id) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM contact_tbl WHERE id = ?',
      [id]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Update contact message (UPDATE)
const updateContact = async (id, name, email, message) => {
  try {
    await pool.execute(
      'UPDATE contact_tbl SET name = ?, email = ?, message = ? WHERE id = ?',
      [name, email, message, id]
    );
    return { id, name, email, message };
  } catch (error) {
    throw error;
  }
};

// Delete contact message (DELETE)
const deleteContact = async (id) => {
  try {
    await pool.execute('DELETE FROM contact_tbl WHERE id = ?', [id]);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact
};

