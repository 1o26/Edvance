# Quick Setup Guide

## Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install:all
```

Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE edvance;
```

2. Update the database URL in `server/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/edvance?schema=public"
```

3. Run Prisma migrations:
```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Environment Variables

Create `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://user:password@localhost:5432/edvance?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GEMINI_API_KEY=AIzaSyDEIGf1uBs5sjn-zt0e3pBjgmBt5NrGM2s
NODE_ENV=development
```

Create `client/.env` (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Docker Setup (Alternative)

1. Make sure Docker and Docker Compose are installed

2. Update environment variables in `docker-compose.yml` if needed

3. Start services:
```bash
docker-compose up -d
```

4. Run migrations:
```bash
docker-compose exec server npx prisma migrate deploy
```

5. Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Creating Your First User

1. Go to http://localhost:5173/register
2. Register with:
   - Name: Your Name
   - Email: your@email.com
   - Password: (at least 6 characters)
   - Role: Choose from Teacher, HOD, or Admin

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database credentials

### Port Already in Use
- Change PORT in `server/.env`
- Update CLIENT_URL accordingly

### Prisma Issues
- Run `npx prisma generate` again
- Check database connection
- Verify schema file

### CORS Issues
- Ensure CLIENT_URL in server `.env` matches frontend URL
- Check CORS configuration in `server/index.js`

## Production Deployment

### Backend (Render/Railway)
1. Set environment variables
2. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
3. Start command: `npm start`

### Frontend (Vercel)
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `cd client && vercel`
3. Set environment variable: `VITE_API_URL=https://your-api-url.com/api`

## Need Help?

- Check the main README.md for more details
- Review API documentation
- Check server logs for errors






