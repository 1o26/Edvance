# Troubleshooting Guide - Sign Up/Login Issues

## Common Issues and Solutions

### Issue: "Internal Server Error" when signing up or logging in

This is usually caused by one of the following:

### 1. Database Connection Issues

**Symptoms:**
- Internal server error
- Error message: "Database connection failed" or "Can't reach database server"

**Solutions:**

#### Check if PostgreSQL is running:
```bash
# Windows (PowerShell)
Get-Service postgresql*

# Or check if port 5432 is in use
netstat -an | findstr 5432
```

#### Verify DATABASE_URL in `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/edvance?schema=public"
```

**Common mistakes:**
- Wrong username/password
- Wrong database name
- Wrong port (default is 5432)
- Missing quotes around the URL

#### Test database connection:
```bash
cd server
npx prisma db pull
```

### 2. Prisma Client Not Generated

**Symptoms:**
- Error: "Cannot find module '@prisma/client'"
- Error: "PrismaClient is not defined"

**Solution:**
```bash
cd server
npx prisma generate
```

### 3. Database Migrations Not Run

**Symptoms:**
- Error: "Table 'users' does not exist"
- Error: "Relation does not exist"

**Solution:**
```bash
cd server
npx prisma migrate dev
```

Or if you want to reset:
```bash
cd server
npx prisma migrate reset
npx prisma migrate dev
```

### 4. Missing Environment Variables

**Symptoms:**
- Error: "DATABASE_URL is not set"
- JWT errors

**Solution:**

Create `server/.env` file:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://username:password@localhost:5432/edvance?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=development
```

**Important:** Replace:
- `username` with your PostgreSQL username
- `password` with your PostgreSQL password
- `edvance` with your database name (or create it first)

### 5. Database Doesn't Exist

**Solution:**

Create the database:
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE edvance;

-- Exit
\q
```

Or using command line:
```bash
createdb -U postgres edvance
```

### 6. Port Already in Use

**Symptoms:**
- Error: "Port 5000 is already in use"
- Server won't start

**Solution:**

Change PORT in `.env`:
```env
PORT=5001
```

Or kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill
```

## Step-by-Step Fix

### Complete Setup from Scratch:

1. **Install PostgreSQL** (if not installed)
   - Download from: https://www.postgresql.org/download/
   - Remember the password you set during installation

2. **Create Database:**
   ```sql
   CREATE DATABASE edvance;
   ```

3. **Create `.env` file in `server` directory:**
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/edvance?schema=public"
   JWT_SECRET=your-super-secret-jwt-key
   GEMINI_API_KEY=your-api-key
   NODE_ENV=development
   ```

4. **Generate Prisma Client:**
   ```bash
   cd server
   npx prisma generate
   ```

5. **Run Migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Start Server:**
   ```bash
   npm run dev
   ```

7. **Check Server Logs:**
   - Should see: "✅ Database connected successfully"
   - Should see: "🚀 Server running on port 5000"

## Testing the Fix

1. **Test Database Connection:**
   ```bash
   cd server
   npx prisma studio
   ```
   - Should open Prisma Studio in browser
   - If it opens, database is connected

2. **Test API Endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   - Should return: `{"status":"OK","message":"Edvance API is running"}`

3. **Test Registration:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

## Check Server Logs

When you try to sign up or login, check the server console for detailed error messages. The improved error handling will now show:

- Database connection errors
- Prisma errors with codes
- Specific error messages

## Common Error Codes

- **P1001**: Database connection failed
- **P2002**: Unique constraint violation (email already exists)
- **P2025**: Record not found
- **P2003**: Foreign key constraint failed

## Still Having Issues?

1. **Check server logs** - Look for detailed error messages
2. **Check browser console** - Look for network errors
3. **Verify all steps** - Make sure database exists, migrations are run, Prisma client is generated
4. **Test database directly:**
   ```bash
   psql -U postgres -d edvance
   SELECT * FROM users;
   ```

## Quick Diagnostic Script

Run this to check your setup:

```bash
cd server

# Check if .env exists
if [ -f .env ]; then
  echo "✅ .env file exists"
else
  echo "❌ .env file missing"
fi

# Check if Prisma client is generated
if [ -d node_modules/.prisma ]; then
  echo "✅ Prisma client generated"
else
  echo "❌ Prisma client not generated - run: npx prisma generate"
fi

# Test database connection
npx prisma db pull
```

## Need More Help?

1. Check the server console for detailed error messages
2. Check browser DevTools (F12) → Network tab for API errors
3. Verify your PostgreSQL installation
4. Make sure all dependencies are installed: `npm install`



