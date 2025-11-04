# Quick Setup Instructions

## The Error You're Seeing

If you're getting "Registration failed. Please try again.", it's because the database isn't set up yet or MySQL credentials are incorrect.

## Step 1: Configure MySQL Password

Edit `config/db.js` and change the password on line 8:

```javascript
password: process.env.DB_PASSWORD || 'root', // Change 'root' to your MySQL password
```

Or set it as an environment variable:
```bash
export DB_PASSWORD=your_mysql_password
```

## Step 2: Set Up the Database

Run the setup script:
```bash
npm run setup-db
```

Or manually run the SQL file:
```bash
mysql -u root -p < database/schema.sql
```

## Step 3: Restart the Server

After setting up the database, restart your server:
```bash
# Stop the current server (Ctrl+C)
npm start
```

## Step 4: Try Registration Again

Go to http://localhost:4000/register and try registering again.

## Troubleshooting

### If MySQL is not running:
- **macOS**: `brew services start mysql` or start MySQL from System Preferences
- **Windows**: Start MySQL from Services or MySQL Workbench
- **Linux**: `sudo systemctl start mysql`

### If you don't know your MySQL password:
1. Try common passwords: `root`, `password`, or empty password
2. Reset MySQL root password if needed
3. Or create a new MySQL user with privileges

### Check MySQL Connection:
```bash
mysql -u root -p
# Enter your password when prompted
```

If this works, use the same password in `config/db.js`.

