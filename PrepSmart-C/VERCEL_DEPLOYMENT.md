# 🚀 Vercel Deployment Checklist for EdVance

## Pre-Deployment Requirements

### 1. **Prerequisites**
- [ ] Vercel account created (https://vercel.com)
- [ ] GitHub repository connected to Vercel
- [ ] All code committed and pushed to GitHub

### 2. **Environment Variables Setup**

Add these to Vercel Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key-here
GOOGLE_API_KEY=your-google-api-key
GROQ_API_KEY=your-groq-api-key
LIVEBLOCKS_SECRET_KEY=your-liveblocks-key
NODE_ENV=production
```

### 3. **Database Setup**

- [ ] PostgreSQL database provisioned (Vercel Postgres or external)
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Prisma client generated: `npx prisma generate`

### 4. **Client Configuration**

Update `client/src/services/api.js` or equivalent to use production API:

```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'https://your-app.vercel.app/api';
```

### 5. **Python ML Model Deployment**

**Important Note**: Python-based ML models cannot run on Vercel's serverless functions directly. Options:

**Option A (Recommended): Pre-compute scores**
- Keep fallback scoring enabled
- Use ML model predictions in local development
- Deploy without Python dependencies

**Option B: External ML Service**
- Host ML model on AWS Lambda, Google Cloud Run, or similar
- Call from Vercel backend
- Add ML_SERVICE_URL to environment variables

**Option C: Use ML.js (JavaScript ML)**
- Convert scikit-learn model to ONNX or TensorFlow.js format
- Run predictions in Node.js backend
- No Python required

### 6. **Deployment Steps**

1. **Initial Setup**
   ```bash
   npm install -g vercel
   vercel login
   cd path/to/PrepSmart-C
   vercel
   ```

2. **Select Options**
   - Connect to Git? **Yes**
   - Which Git scope? **Your GitHub account**
   - Found existing project? **No** (first deployment)
   - Project name: `edvance`
   - Root directory: `./` (keep default)

3. **Configure Environment Variables**
   - Add all variables from step 2

4. **Verify Build**
   ```bash
   vercel build
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### 7. **Post-Deployment Verification**

- [ ] Frontend loads at `https://your-app.vercel.app`
- [ ] API health check: `https://your-app.vercel.app/api/health` returns `{"status":"OK"}`
- [ ] Authentication works (login/signup)
- [ ] Lesson plans can be created
- [ ] Health scores calculate (will use fallback scoring)
- [ ] Collaboration features work with WebSockets
- [ ] AI suggestions generate

### 8. **Monitoring**

- Monitor in Vercel Dashboard: https://vercel.com/dashboard
- Check logs: `vercel logs`
- View errors: Vercel Dashboard → Analytics

### 9. **Custom Domain (Optional)**

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### 10. **SSL/HTTPS**

- Automatically provided by Vercel ✅

---

## Troubleshooting

### Build Failures
```bash
# Clear cache and rebuild
vercel build --yes
```

### Database Connection Issues
- Verify DATABASE_URL in Environment Variables
- Ensure database is accessible from Vercel IP (whitelist 0.0.0.0/0 for testing)
- Run migrations: `prisma migrate deploy`

### Python ML Model Not Working
- This is expected on Vercel (Python not supported)
- Fallback scoring will be used automatically
- Consider Option B or C from section 5

### WebSocket Issues
- Ensure Socket.io is properly configured
- Update CORS origins for production URL

---

## Files for Deployment

✅ **Already prepared:**
- `vercel.json` - Vercel configuration
- `api/index.js` - Serverless entry point
- `.vercelignore` - Files to ignore
- Root `package.json` - Build scripts
- `client/` - React frontend (built to static)
- `server/` - Express backend (Express on Vercel)
- `prisma/` - Database schema

---

## Quick Deployment Command

```bash
# From project root
npm install
npm run build:all
vercel --prod --env-file .env.local
```

---

## Support

- Vercel Docs: https://vercel.com/docs
- Prisma on Vercel: https://www.prisma.io/docs/guides/other/troubleshooting-orm/vercel
- Express on Vercel: https://vercel.com/docs/functions/serverless-functions

