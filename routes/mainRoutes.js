const express = require('express');
const router = express.Router();
// Use adapter that automatically falls back to file storage if MySQL fails
const dbAdapter = require('../models/dbAdapter');
const courseModel = dbAdapter.courseModel;
const userModel = dbAdapter.userModel;
const cartModel = dbAdapter.cartModel;
const contactModel = dbAdapter.contactModel;

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login?error=Please login first');
  }
};

// Middleware to pass user info to all views
const passUserToViews = (req, res, next) => {
  if (req.session.userId) {
    res.locals.user = {
      id: req.session.userId,
      name: req.session.userName
    };
  }
  next();
};
router.use(passUserToViews);

// Home page
router.get('/', async (req, res) => {
  try {
    const loginSuccess = req.query.login === 'success';
    const courses = await courseModel.getAllCourses();
    const storageType = dbAdapter.isUsingMySQL() ? 'MySQL' : 'File Storage';
    res.render('home', { 
      courses, 
      login: loginSuccess ? 'success' : undefined,
      storageInfo: storageType
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send('Error loading courses: ' + error.message);
  }
});

// About page
router.get('/about', (req, res) => {
  res.render('about');
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', { success: false });
});

// Handle contact form submission (INSERT)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await contactModel.createContact(name, email, message);
    res.render('contact', { success: true });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.render('contact', { success: false, error: 'Failed to send message' });
  }
});

// Register page
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Handle registration (INSERT)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (password !== confirmPassword) {
      return res.render('register', { error: 'Passwords do not match' });
    }

    if (!name || !email || !password) {
      return res.render('register', { error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.render('register', { error: 'Email already registered' });
    }

    // Create user
    const user = await userModel.createUser(name, email, password);
    
    // Auto login after registration
    req.session.userId = user.id;
    req.session.userName = user.name;
    
    res.redirect('/?login=success');
  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================');
    
    // Show user-friendly error messages
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.message && error.message.includes('email')) {
      errorMessage = 'Email already registered. Please use a different email.';
    } else if (error.message) {
      errorMessage = `Registration failed: ${error.message}`;
    }
    
    res.render('register', { error: errorMessage });
  }
});

// Login page
router.get('/login', (req, res) => {
  const error = req.query.error || null;
  res.render('login', { error });
});

// Handle login form submission
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('login', { error: 'Email and password are required' });
    }

    // Get user from database
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    // Verify password
    const isValid = await userModel.verifyPassword(password, user.password);
    if (!isValid) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.userName = user.name;
    
    res.redirect('/?login=success');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'Login failed. Please try again.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Cart page (RETRIEVE)
router.get('/cart', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const cartItems = await cartModel.getCartByUserId(userId);
    res.render('cart', { cart: cartItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).send('Error loading cart');
  }
});

// Add item to cart (INSERT)
router.post('/cart/add/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const courseId = parseInt(req.params.id);
    
    // Verify course exists
    const course = await courseModel.getCourseById(courseId);
    if (!course) {
      return res.redirect('/');
    }

    await cartModel.addToCart(userId, courseId);
    res.redirect('/');
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.redirect('/');
  }
});

// Remove item from cart (DELETE)
router.post('/cart/remove/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const courseId = parseInt(req.params.id);
    await cartModel.removeFromCart(userId, courseId);
    res.redirect('/cart');
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.redirect('/cart');
  }
});

// ========== ADMIN/API ROUTES FOR CRUD OPERATIONS ==========

// COURSE CRUD ROUTES
// Get all courses (API)
router.get('/api/courses', async (req, res) => {
  try {
    const courses = await courseModel.getAllCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get course by id (API)
router.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await courseModel.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create course (INSERT)
router.post('/api/courses', async (req, res) => {
  try {
    const { name, price, image } = req.body;
    const course = await courseModel.createCourse(name, price, image);
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course (UPDATE)
router.put('/api/courses/:id', async (req, res) => {
  try {
    const { name, price, image } = req.body;
    const course = await courseModel.updateCourse(req.params.id, name, price, image);
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course (DELETE)
router.delete('/api/courses/:id', async (req, res) => {
  try {
    await courseModel.deleteCourse(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// USER CRUD ROUTES
// Get all users (API)
router.get('/api/users', async (req, res) => {
  try {
    // This would need a getAllUsers method - adding for completeness
    res.status(501).json({ error: 'Not implemented - add getAllUsers method' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by id (API)
router.get('/api/users/:id', async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (UPDATE)
router.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await userModel.updateUser(req.params.id, name, email);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (DELETE)
router.delete('/api/users/:id', async (req, res) => {
  try {
    await userModel.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CONTACT CRUD ROUTES
// Get all contacts (API)
router.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await contactModel.getAllContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contact by id (API)
router.get('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await contactModel.getContactById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contact (UPDATE)
router.put('/api/contacts/:id', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = await contactModel.updateContact(req.params.id, name, email, message);
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contact (DELETE)
router.delete('/api/contacts/:id', async (req, res) => {
  try {
    await contactModel.deleteContact(req.params.id);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CART CRUD ROUTES
// Update cart item quantity (UPDATE)
router.put('/api/cart/:courseId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const courseId = req.params.courseId;
    const { quantity } = req.body;
    await cartModel.updateCartItem(userId, courseId, quantity);
    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart (DELETE)
router.delete('/api/cart', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    await cartModel.clearCart(userId);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
