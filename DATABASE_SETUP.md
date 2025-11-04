# Database Setup Instructions

## Prerequisites
- MySQL server installed and running
- Node.js and npm installed

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Create Database
1. Open MySQL command line or MySQL Workbench
2. Run the SQL script to create the database and tables:
```bash
mysql -u root -p < database/schema.sql
```
Or manually execute the SQL file: `database/schema.sql`

## Step 3: Configure Database Connection
Edit `config/db.js` or set environment variables:
- `DB_HOST` (default: localhost)
- `DB_USER` (default: root)
- `DB_PASSWORD` (default: empty)
- `DB_NAME` (default: restaurant_db)

## Step 4: Run the Application
```bash
npm start
```

The server will start on port 4000 (or the port specified in PORT environment variable).

## Database Tables

### user_tbl
- Stores user registration and login information
- Fields: id, name, email, password (hashed), created_at, updated_at

### course_tbl
- Stores menu items/courses
- Fields: id, name, price, image, created_at, updated_at

### cart_tbl
- Stores user cart items
- Fields: id, user_id, course_id, quantity, created_at, updated_at
- Foreign keys: user_id → user_tbl, course_id → course_tbl

### contact_tbl
- Stores contact form submissions
- Fields: id, name, email, message, created_at

## API Endpoints for CRUD Operations

### Courses
- GET `/api/courses` - Get all courses
- GET `/api/courses/:id` - Get course by id
- POST `/api/courses` - Create course
- PUT `/api/courses/:id` - Update course
- DELETE `/api/courses/:id` - Delete course

### Users
- GET `/api/users/:id` - Get user by id
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Contacts
- GET `/api/contacts` - Get all contacts
- GET `/api/contacts/:id` - Get contact by id
- PUT `/api/contacts/:id` - Update contact
- DELETE `/api/contacts/:id` - Delete contact

### Cart
- PUT `/api/cart/:courseId` - Update cart item quantity (requires auth)
- DELETE `/api/cart` - Clear entire cart (requires auth)

## Features
- User registration and login with password hashing
- Session management
- Shopping cart per user
- Contact form submissions
- Full CRUD operations via API endpoints

