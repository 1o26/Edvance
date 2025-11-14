# Step-by-Step Setup Instructions

## Prerequisites Check
Make sure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ PostgreSQL installed and running
- ✅ npm or yarn installed

## Step 1: Create PostgreSQL Database

### Option A: Using psql (Command Line)
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE edvance;

# Exit psql
\q
```

### Option B: Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name it: `edvance`
5. Click "Save"

### Option C: Using Command Line (without entering psql)
```bash
# Windows
psql -U postgres -c "CREATE DATABASE edvance;"

# Or if PostgreSQL bin is in PATH
createdb -U postgres edvance
```

## Step 2: Create server/.env File

1. Navigate to the server directory:
```bash
cd server
```

2. Create a file named `.env` in the `server` directory

3. Add the following content (UPDATE THE DATABASE_URL WITH YOUR POSTGRESQL CREDENTIALS):
```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/edvance?schema=public
JWT_SECRET=edvance-super-secret-jwt-key-change-this-in-production-2024
GEMINI_API_KEY=AIzaSyDEIGf1uBs5sjn-zt0e3pBjgmBt5NrGM2s
NODE_ENV=development
```

**Important:** Replace `yourpassword` with your actual PostgreSQL password, and `postgres` with your PostgreSQL username if different.

### Quick Commands to Create .env File:

**Windows (PowerShell):**
```powershell
cd server
@"
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/edvance?schema=public
JWT_SECRET=edvance-super-secret-jwt-key-change-this-in-production-2024
GEMINI_API_KEY=AIzaSyDEIGf1uBs5sjn-zt0e3pBjgmBt5NrGM2s
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
```

**Windows (Command Prompt):**
```cmd
cd server
echo PORT=5000 > .env
echo CLIENT_URL=http://localhost:5173 >> .env
echo DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/edvance?schema=public >> .env
echo JWT_SECRET=edvance-super-secret-jwt-key-change-this-in-production-2024 >> .env
echo GEMINI_API_KEY=AIzaSyDEIGf1uBs5sjn-zt0e3pBjgmBt5NrGM2s >> .env
echo NODE_ENV=development >> .env
```

**Mac/Linux:**
```bash
cd server
cat > .env << EOF
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/edvance?schema=public
JWT_SECRET=edvance-super-secret-jwt-key-change-this-in-production-2024
GEMINI_API_KEY=AIzaSyDEIGf1uBs5sjn-zt0e3pBjgmBt5NrGM2s
NODE_ENV=development
EOF
```

## Step 3: Install Server Dependencies

```bash
# Make sure you're in the server directory
cd server

# Install dependencies
npm install
```

Wait for installation to complete. You should see "added X packages" message.

## Step 4: Generate Prisma Client

```bash
# Still in the server directory
npx prisma generate
```

This will create the Prisma Client based on your schema.

## Step 5: Run Database Migrations

```bash
# Still in the server directory
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Set up relationships
- Create migration files

You should see a success message with "Applied migration: init"

## Step 6: Install Client Dependencies

```bash
# Navigate to client directory (from server directory)
cd ../client

# Install dependencies
npm install
```

Wait for installation to complete.

## Step 7: (Optional) Create client/.env File

If you want to customize the API URL:

```bash
# In the client directory
# Create .env file with:
VITE_API_URL=http://localhost:5000/api
```

This is optional as it defaults to http://localhost:5000/api in the code.

## Step 8: Verify Setup

### Test Database Connection:
```bash
# From server directory
cd server
npx prisma studio
```

This will open Prisma Studio in your browser where you can view your database tables.

### Test Server:
```bash
# From server directory
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📍 Health check: http://localhost:5000/api/health
```

Visit http://localhost:5000/api/health in your browser - you should see:
```json
{"status":"OK","message":"Edvance API is running"}
```

## Step 9: Start the Application

### Terminal 1 - Backend Server:
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend Client:
```bash
cd client
npm run dev
```

## Step 10: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Prisma Studio** (optional): Run `npx prisma studio` from server directory

## Step 11: Create Your First User

1. Open http://localhost:5173 in your browser
2. Click "Sign Up" or go to http://localhost:5173/register
3. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: (at least 6 characters)
   - Role: Choose Teacher, HOD, or Admin
4. Click "Sign Up"
5. You'll be automatically logged in and redirected to the dashboard

## Troubleshooting

### Database Connection Error
- **Error**: "Can't reach database server"
- **Solution**: 
  - Make sure PostgreSQL is running
  - Check your DATABASE_URL in `.env` file
  - Verify username and password are correct
  - Check if PostgreSQL is listening on port 5432

### Port Already in Use
- **Error**: "Port 5000 is already in use"
- **Solution**: 
  - Change PORT in server/.env to a different port (e.g., 5001)
  - Update CLIENT_URL accordingly
  - Or stop the process using port 5000

### Prisma Migration Error
- **Error**: "Migration failed"
- **Solution**:
  - Make sure database exists
  - Check DATABASE_URL in .env
  - Try: `npx prisma migrate reset` (WARNING: This will delete all data)
  - Then: `npx prisma migrate dev`

### Module Not Found
- **Error**: "Cannot find module"
- **Solution**:
  - Make sure you ran `npm install` in both server and client directories
  - Delete `node_modules` and `package-lock.json`
  - Run `npm install` again

## Quick Command Summary

```bash
# 1. Create database (in PostgreSQL)
psql -U postgres -c "CREATE DATABASE edvance;"

# 2. Create .env file in server directory (update password!)
cd server
# (Create .env file manually or use the commands above)

# 3. Install server dependencies
npm install

# 4. Generate Prisma Client
npx prisma generate

# 5. Run migrations
npx prisma migrate dev --name init

# 6. Install client dependencies
cd ../client
npm install

# 7. Start backend (Terminal 1)
cd ../server
npm run dev

# 8. Start frontend (Terminal 2)
cd ../client
npm run dev
```

## Next Steps

Once everything is running:
1. ✅ Register a new user
2. ✅ Create a lesson plan using AI generator
3. ✅ Test collaboration features
4. ✅ Test approval workflow (if you created an HOD account)

Enjoy using Edvance! 🎉






