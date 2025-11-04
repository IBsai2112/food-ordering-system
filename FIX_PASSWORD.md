# How to Fix MySQL Password Issue

## The Problem
Your MySQL password is not set correctly in `config/db.js`. You need to find or set your MySQL root password.

## Option 1: Find Your Existing Password

Try connecting to MySQL manually:
```bash
mysql -u root -p
```
When prompted, enter your password. If this works, use that same password in `config/db.js`.

## Option 2: Reset MySQL Root Password (if you forgot it)

### On macOS (Homebrew):
```bash
# Stop MySQL
brew services stop mysql

# Start MySQL in safe mode
mysqld_safe --skip-grant-tables &

# Connect without password
mysql -u root

# In MySQL prompt, run:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
EXIT;

# Restart MySQL normally
brew services restart mysql
```

### On macOS (System MySQL):
```bash
# Stop MySQL
sudo /usr/local/mysql/support-files/mysql.server stop

# Start in safe mode
sudo /usr/local/mysql/bin/mysqld_safe --skip-grant-tables &

# Then follow same steps as above
```

## Option 3: Use No Password (if MySQL allows it)

If your MySQL installation allows root login without password, edit `config/db.js` line 13:
```javascript
password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
```

Keep it as empty string `''`.

## Option 4: Create a New MySQL User

If you can't access root, create a new user:

```sql
-- Connect as root (if possible)
mysql -u root -p

-- Create new user
CREATE USER 'restaurant_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON restaurant_db.* TO 'restaurant_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update `config/db.js`:
```javascript
user: 'restaurant_user',
password: 'your_password_here',
```

## After Fixing Password

1. **Test the connection:**
   ```bash
   npm run test-db
   ```

2. **Set up the database:**
   ```bash
   npm run setup-db
   ```

3. **Restart your server:**
   ```bash
   npm start
   ```

4. **Try registration again** at http://localhost:4000/register

## Quick Check Commands

```bash
# Check if MySQL is running
brew services list | grep mysql
# or
ps aux | grep mysql

# Try to connect
mysql -u root -p

# Check MySQL version
mysql --version
```

