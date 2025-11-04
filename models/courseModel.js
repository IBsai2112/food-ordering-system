const pool = require('../config/db');

// Create course (INSERT)
const createCourse = async (name, price, image) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO course_tbl (name, price, image) VALUES (?, ?, ?)',
      [name, price, image]
    );
    return { id: result.insertId, name, price, image };
  } catch (error) {
    throw error;
  }
};

// Get all courses (RETRIEVE)
const getAllCourses = async () => {
  try {
    const [rows] = await pool.execute('SELECT * FROM course_tbl ORDER BY id');
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get course by id (RETRIEVE)
const getCourseById = async (id) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM course_tbl WHERE id = ?',
      [id]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Update course (UPDATE)
const updateCourse = async (id, name, price, image) => {
  try {
    await pool.execute(
      'UPDATE course_tbl SET name = ?, price = ?, image = ? WHERE id = ?',
      [name, price, image, id]
    );
    return { id, name, price, image };
  } catch (error) {
    throw error;
  }
};

// Delete course (DELETE)
const deleteCourse = async (id) => {
  try {
    await pool.execute('DELETE FROM course_tbl WHERE id = ?', [id]);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};

