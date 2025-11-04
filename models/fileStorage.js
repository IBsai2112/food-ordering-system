const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const dataDir = path.join(__dirname, '../data/storage');
const usersFile = path.join(dataDir, 'users.json');
const coursesFile = path.join(dataDir, 'courses.json');
const cartFile = path.join(dataDir, 'cart.json');
const contactFile = path.join(dataDir, 'contact.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

// Initialize files with empty arrays
async function initFiles() {
  await ensureDataDir();
  const files = [
    { file: usersFile, default: [] },
    { file: coursesFile, default: [
      { id: 1, name: 'Margherita Pizza', price: 299, image: '/images/pizza.jpg' },
      { id: 2, name: 'Pasta Alfredo', price: 249, image: '/images/pasta.jpg' },
      { id: 3, name: 'Garlic Bread', price: 149, image: '/images/garlic.jpg' }
    ]},
    { file: cartFile, default: [] },
    { file: contactFile, default: [] }
  ];

  for (const { file, default: defaultValue } of files) {
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, JSON.stringify(defaultValue, null, 2));
    }
  }
}

// User operations
const userModel = {
  async createUser(name, email, password) {
    await initFiles();
    const users = JSON.parse(await fs.readFile(usersFile, 'utf8'));
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name,
      email,
      password: hashedPassword,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
    return { id: newUser.id, name, email };
  },

  async getUserByEmail(email) {
    await initFiles();
    const users = JSON.parse(await fs.readFile(usersFile, 'utf8'));
    return users.find(u => u.email === email);
  },

  async getUserById(id) {
    await initFiles();
    const users = JSON.parse(await fs.readFile(usersFile, 'utf8'));
    const user = users.find(u => u.id === parseInt(id));
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};

// Course operations
const courseModel = {
  async getAllCourses() {
    await initFiles();
    return JSON.parse(await fs.readFile(coursesFile, 'utf8'));
  },

  async getCourseById(id) {
    await initFiles();
    const courses = JSON.parse(await fs.readFile(coursesFile, 'utf8'));
    return courses.find(c => c.id === parseInt(id));
  }
};

// Cart operations
const cartModel = {
  async getCartByUserId(userId) {
    await initFiles();
    const carts = JSON.parse(await fs.readFile(cartFile, 'utf8'));
    const userCart = carts.filter(c => c.user_id === parseInt(userId));
    
    // Join with courses
    const courses = await courseModel.getAllCourses();
    return userCart.map(cartItem => {
      const course = courses.find(co => co.id === cartItem.course_id);
      return {
        ...cartItem,
        course_id: cartItem.course_id,
        name: course ? course.name : 'Unknown',
        price: course ? course.price : 0,
        image: course ? course.image : ''
      };
    });
  },

  async addToCart(userId, courseId, quantity = 1) {
    await initFiles();
    const carts = JSON.parse(await fs.readFile(cartFile, 'utf8'));
    const existing = carts.find(c => c.user_id === parseInt(userId) && c.course_id === parseInt(courseId));
    
    if (existing) {
      existing.quantity = (existing.quantity || 1) + quantity;
    } else {
      carts.push({
        id: carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1,
        user_id: parseInt(userId),
        course_id: parseInt(courseId),
        quantity,
        created_at: new Date().toISOString()
      });
    }
    
    await fs.writeFile(cartFile, JSON.stringify(carts, null, 2));
    return true;
  },

  async removeFromCart(userId, courseId) {
    await initFiles();
    const carts = JSON.parse(await fs.readFile(cartFile, 'utf8'));
    const filtered = carts.filter(c => !(c.user_id === parseInt(userId) && c.course_id === parseInt(courseId)));
    await fs.writeFile(cartFile, JSON.stringify(filtered, null, 2));
    return true;
  }
};

// Contact operations
const contactModel = {
  async createContact(name, email, message) {
    await initFiles();
    const contacts = JSON.parse(await fs.readFile(contactFile, 'utf8'));
    const newContact = {
      id: contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1,
      name,
      email,
      message,
      created_at: new Date().toISOString()
    };
    contacts.push(newContact);
    await fs.writeFile(contactFile, JSON.stringify(contacts, null, 2));
    return newContact;
  }
};

module.exports = {
  userModel,
  courseModel,
  cartModel,
  contactModel
};

