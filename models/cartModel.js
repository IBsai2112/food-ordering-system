const pool = require('../config/db');

// Add item to cart (INSERT)
const addToCart = async (userId, courseId, quantity = 1) => {
  try {
    // Check if item already exists in cart
    const [existing] = await pool.execute(
      'SELECT * FROM cart_tbl WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (existing.length > 0) {
      // Update quantity if item exists
      await pool.execute(
        'UPDATE cart_tbl SET quantity = quantity + ? WHERE user_id = ? AND course_id = ?',
        [quantity, userId, courseId]
      );
    } else {
      // Insert new item
      await pool.execute(
        'INSERT INTO cart_tbl (user_id, course_id, quantity) VALUES (?, ?, ?)',
        [userId, courseId, quantity]
      );
    }
    return true;
  } catch (error) {
    throw error;
  }
};

// Get cart items for user (RETRIEVE)
const getCartByUserId = async (userId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.user_id, c.course_id, c.quantity, 
       co.name, co.price, co.image 
       FROM cart_tbl c 
       INNER JOIN course_tbl co ON c.course_id = co.id 
       WHERE c.user_id = ?
       ORDER BY c.id`,
      [userId]
    );
    return rows.map(row => ({
      ...row,
      course_id: row.course_id
    }));
  } catch (error) {
    throw error;
  }
};

// Update cart item quantity (UPDATE)
const updateCartItem = async (userId, courseId, quantity) => {
  try {
    await pool.execute(
      'UPDATE cart_tbl SET quantity = ? WHERE user_id = ? AND course_id = ?',
      [quantity, userId, courseId]
    );
    return true;
  } catch (error) {
    throw error;
  }
};

// Remove item from cart (DELETE)
const removeFromCart = async (userId, courseId) => {
  try {
    await pool.execute(
      'DELETE FROM cart_tbl WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );
    return true;
  } catch (error) {
    throw error;
  }
};

// Clear entire cart for user (DELETE)
const clearCart = async (userId) => {
  try {
    await pool.execute('DELETE FROM cart_tbl WHERE user_id = ?', [userId]);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addToCart,
  getCartByUserId,
  updateCartItem,
  removeFromCart,
  clearCart
};

