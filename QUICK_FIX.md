# Quick Fix for Registration Error

## The Issue
MySQL password is incorrect. Here's how to fix it:

## Solution: Set Your MySQL Password

### Step 1: Find Your MySQL Password

**Try this command** (if MySQL is in your PATH):
```bash
mysql -u root -p
```
Enter your password when prompted. If it works, remember that password!

**If mysql command not found**, try:
- Check MySQL Workbench (if installed) for saved connections
- Check if you set a password during MySQL installation
- Try common passwords: `root`, `password`, `123456`, or empty `""`

### Step 2: Set the Password in Your Code

**Option A: Edit config file** (Easiest)
1. Open `config/db.js`
2. Find line 13: `password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',`
3. Change it to: `password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'YOUR_PASSWORD_HERE',`
4. Replace `YOUR_PASSWORD_HERE` with your actual MySQL password

**Option B: Use environment variable** (Recommended)
```bash
export DB_PASSWORD=your_mysql_password
npm start
```

### Step 3: Test Database Connection
```bash
npm run test-db
```

If you see ✅ success messages, proceed to Step 4.

### Step 4: Set Up Database Tables
```bash
npm run setup-db
```

### Step 5: Restart Server
```bash
npm start
```

### Step 6: Try Registration Again
Go to http://localhost:4000/register

---

## If You Still Can't Find Password

### Option: Reset MySQL Password

1. **Stop MySQL:**
   ```bash
   brew services stop mysql
   # or
   sudo /usr/local/mysql/support-files/mysql.server stop
   ```

2. **Start in safe mode:**
   ```bash
   mysqld_safe --skip-grant-tables &
   ```

3. **Connect without password:**
   ```bash
   mysql -u root
   ```

4. **Reset password:**
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. **Restart MySQL:**
   ```bash
   brew services restart mysql
   ```

6. **Use 'newpassword' in config/db.js**

---

## Still Having Issues?

Check the server console when you try to register - it now shows detailed error messages that will help identify the exact problem.

