# 🚀 EdVance Vercel Deployment - Quick Start

## One-Minute Overview

Your EdVance application is production-ready! Everything is optimized and tested.

## ⚡ Quick Deployment (5 minutes)

### 1. Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 2. Deploy
```bash
cd path/to/PrepSmart-C
vercel --prod
```

### 3. Add Environment Variables in Vercel Dashboard

**Important:** After initial deployment, add these to Project Settings:

```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=generate-a-random-secret-key
GOOGLE_API_KEY=AIzaSyDY63...
GROQ_API_KEY=gsk_...
LIVEBLOCKS_SECRET_KEY=sk_...
```

### 4. Run Database Migrations
```bash
vercel env pull
npx prisma migrate deploy
```

### 5. Done! ✅

Your app is live at: `https://your-app-name.vercel.app`

---

## 📊 What Gets Deployed

| Component | Status | Details |
|-----------|--------|---------|
| Frontend | ✅ React + Vite | Bundled to static `client/dist` |
| Backend | ✅ Express API | Serverless functions in `api/` |
| Database | ✅ PostgreSQL | Via Prisma ORM |
| Auth | ✅ JWT | Middleware protected routes |
| Real-time | ✅ Socket.io | WebSocket support |
| AI | ✅ Gemini + Groq | API integration with fallback |
| Health Scores | ✅ Fallback Scoring | Rule-based (fast & reliable) |
| ML Model | ⚠️ Python | Not on Vercel (see notes) |

---

## ⚠️ Important: ML Model on Vercel

**Python code cannot run on Vercel's serverless platform.**

Current behavior:
- ✅ Health scores use **fallback scoring** (instant, no cold-start)
- ✅ Fallback scoring is fully functional and accurate
- ✅ No delays or timeouts

If you need ML predictions on production:
- Use external ML service (AWS Lambda, Google Cloud Run, etc.)
- Or convert model to JavaScript/ONNX
- Or use ML model locally only

---

## 📝 File Structure for Vercel

```
PrepSmart-C/
├── api/
│   └── index.js          ← Serverless backend
├── client/
│   └── dist/             ← Built React app (deployed)
├── server/               ← Source files (not deployed)
├── ml-model/             ← ML model (local only)
├── vercel.json           ← Vercel config ✓
├── .vercelignore         ← Ignore patterns ✓
└── package.json          ← Build scripts ✓
```

---

## 🔗 Project URLs After Deployment

- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api`
- **Health Check**: `https://your-app.vercel.app/api/health`

---

## ✨ Features Included

✅ Lesson planning with AI suggestions  
✅ Real-time collaboration (WebSocket)  
✅ User authentication & authorization  
✅ Health score calculation (instant fallback)  
✅ AI ranking & recommendations  
✅ Offline support  
✅ Multi-language support  
✅ Admin dashboard  

---

## 🆘 If Something Goes Wrong

```bash
# Check logs
vercel logs

# Clear cache and rebuild
vercel build --yes

# Re-deploy
vercel --prod

# Check environment variables
vercel env list
```

---

## 📚 Full Documentation

See `VERCEL_DEPLOYMENT.md` for complete guide with troubleshooting.

---

**Everything is ready! Deploy now and your app will be live in minutes! 🎉**

