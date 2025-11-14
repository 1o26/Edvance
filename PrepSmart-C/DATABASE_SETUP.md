# Database Setup Guide - Multiple Methods

## Method 1: Using pgAdmin (GUI - Easiest)

If you have PostgreSQL installed with pgAdmin:

1. **Open pgAdmin** (Search for "pgAdmin" in Windows Start Menu)

2. **Connect to PostgreSQL Server:**
   - Enter your PostgreSQL password when prompted
   - If you don't remember, you may need to reset it or check your PostgreSQL installation

3. **Create Database:**
   - Right-click on "Databases" in the left sidebar
   - Select "Create" → "Database..."
   - Enter database name: `edvance`
   - Click "Save"

4. **Done!** You can now proceed with the Prisma migrations.

## Method 2: Find and Use psql from Full Path

### Step 1: Find PostgreSQL Installation

Check common installation paths:

**Option A - Check Program Files:**
```powershell
Get-ChildItem "C:\Program Files" -Filter "*postgres*" -Directory -ErrorAction SilentlyContinue
Get-ChildItem "C:\Program Files (x86)" -Filter "*postgres*" -Directory -ErrorAction SilentlyContinue
```

**Option B - Search for psql.exe:**
```powershell
Get-ChildItem -Path C:\ -Filter psql.exe -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
```

**Option C - Check if installed via installer:**
Look for PostgreSQL in:
- `C:\Program Files\PostgreSQL\[version]\bin\`
- `C:\PostgreSQL\[version]\bin\`

### Step 2: Use Full Path to psql

Once you find the path, use it directly:

```powershell
# Example (replace with your actual path and version)
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE edvance;"
```

### Step 3: Add to PATH (Optional - for future use)

1. Copy the PostgreSQL bin folder path (e.g., `C:\Program Files\PostgreSQL\15\bin`)
2. Open System Properties → Environment Variables
3. Add the path to System PATH variable
4. Restart PowerShell

## Method 3: Install PostgreSQL (If Not Installed)

### Download and Install:

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download the installer
   - Or use: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **Install:**
   - Run the installer
   - Remember the password you set for the `postgres` user
   - Default port: 5432
   - Make sure to install pgAdmin (it comes with the installer)

3. **After Installation:**
   - Use Method 1 (pgAdmin) to create the database
   - Or psql will be available in PATH

## Method 4: Use Docker (Alternative)

If you prefer Docker:

```powershell
# Pull PostgreSQL image
docker pull postgres:15

# Run PostgreSQL container
docker run --name edvance-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=edvance -p 5432:5432 -d postgres:15

# Create database (database is already created with POSTGRES_DB env var)
# Or connect and verify:
docker exec -it edvance-db psql -U postgres -c "\l"
```

Update your `.env` file:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edvance?schema=public
```

## Method 5: Use SQL Script via pgAdmin

1. Open pgAdmin
2. Connect to PostgreSQL
3. Right-click on your server → "Query Tool"
4. Run this SQL:
```sql
CREATE DATABASE edvance;
```
5. Click Execute (F5)

## Quick Check: Is PostgreSQL Running?

```powershell
# Check if PostgreSQL service is running
Get-Service -Name "*postgres*"

# Or check if port 5432 is in use
netstat -ano | findstr :5432
```

## Recommended Next Steps

1. **If PostgreSQL is installed but psql not in PATH:**
   - Use pgAdmin (Method 1) - Easiest
   - Or find psql.exe and use full path (Method 2)

2. **If PostgreSQL is NOT installed:**
   - Install PostgreSQL (Method 3)
   - Or use Docker (Method 4)

3. **After database is created:**
   - Verify it exists
   - Continue with Prisma setup:
     ```bash
     cd server
     npx prisma generate
     npx prisma migrate dev --name init
     ```

## Troubleshooting

### "Password authentication failed"
- Check your PostgreSQL password
- Default user is `postgres`
- You may need to reset the password

### "Connection refused"
- Make sure PostgreSQL service is running
- Check if it's running on port 5432
- Verify firewall settings

### "Database already exists"
- That's okay! The database is ready to use
- Proceed with Prisma migrations

## After Database is Created

Once you have the database created, update your `server/.env` file:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/edvance?schema=public
```

Then continue with:
```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```






