# 🎯 EdVance Vercel Deployment - Final Checklist

## Pre-Deployment (Before Running `vercel`)

- [ ] All code changes committed to Git
- [ ] No uncommitted changes (`git status` is clean)
- [ ] GitHub repository created and connected to Vercel
- [ ] `.env` file NOT committed (only `.env.example`)
- [ ] `node_modules` NOT committed
- [ ] ML model files in `.vercelignore`

---

## Deployment Command

```bash
# Navigate to project root
cd path/to/PrepSmart-C

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**Expected output:**
```
> Deployed to vercel (..vercel.com)
> Visit https://your-app.vercel.app to inspect your project
```

---

## Post-Deployment (Immediately After)

### In Vercel Dashboard

1. Go to Project Settings
2. Click "Environment Variables"
3. Add these variables:

```
DATABASE_URL        = postgresql://...
JWT_SECRET         = [generate random string]
GOOGLE_API_KEY     = AIzaSyDY63...
GROQ_API_KEY       = gsk_...
LIVEBLOCKS_SECRET_KEY = sk_...
NODE_ENV           = production
```

4. Wait 1-2 minutes for redeployment with env vars

### Run Database Migrations

```bash
# Pull environment variables locally
vercel env pull

# Run Prisma migrations
npx prisma migrate deploy
```

---

## Verification Tests

### Test 1: Frontend Loads
```
https://your-app.vercel.app
→ Should see login page
```

### Test 2: API Health Check
```
https://your-app.vercel.app/api/health
→ Should return: {"status":"OK","message":"Edvance API is running"}
```

### Test 3: Authentication
- [ ] Sign up with test account
- [ ] Receive verification email
- [ ] Login successfully
- [ ] See dashboard

### Test 4: Core Features
- [ ] Create new lesson plan
- [ ] AI suggestions generate
- [ ] Health score calculates
- [ ] Export to PDF works
- [ ] Export to PPT works

### Test 5: Collaboration
- [ ] Create lesson plan
- [ ] Share with another user
- [ ] See real-time updates
- [ ] Comments appear instantly

---

## Configuration Summary

| Setting | Value | Status |
|---------|-------|--------|
| Framework | React + Express | ✅ |
| Database | PostgreSQL | ✅ |
| Auth | JWT | ✅ |
| Real-time | Socket.io | ✅ |
| Hosting | Vercel Serverless | ✅ |
| Domain | your-app.vercel.app | ✅ |
| SSL/HTTPS | Automatic | ✅ |

---

## Performance Benchmarks

| Metric | Target | Expected |
|--------|--------|----------|
| Frontend Load | <3s | ~1-2s ✅ |
| API Response | <500ms | ~100-200ms ✅ |
| Cold Start | <2s | ~1.5s ✅ |
| Health Score | <200ms | ~50ms ✅ |
| DB Query | <500ms | ~50-100ms ✅ |

---

## Monitoring After Deployment

### Vercel Dashboard
- Go to https://vercel.com/dashboard
- Select your project
- Monitor: Deployments, Analytics, Functions

### Logs
```bash
# View real-time logs
vercel logs --follow

# View specific function logs
vercel logs api
```

### Error Tracking
- Check Vercel Dashboard → Functions for errors
- Monitor API response times
- Track database connection issues

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Deployment fails | Run `vercel build --yes` |
| DB connection error | Verify DATABASE_URL in env vars |
| API returns 500 | Check `vercel logs` for errors |
| Frontend not loading | Check build output in Vercel Dashboard |
| WebSocket fails | Verify Socket.io CORS settings |

---

## Important Reminders

⚠️ **Do NOT commit:**
- .env files
- node_modules/
- dist/ folders
- .vercel/ folder

✅ **DO commit:**
- vercel.json
- .vercelignore
- All source code
- package.json (with build scripts)

📌 **Keep safe:**
- DATABASE_URL (contains password)
- JWT_SECRET (unique for each environment)
- API keys (never share publicly)

---

## Security Checklist

- [ ] All secrets in Vercel Environment Variables (NOT in code)
- [ ] DATABASE_URL not in source code
- [ ] JWT_SECRET is strong and unique
- [ ] API keys are valid and active
- [ ] CORS configured for production domain
- [ ] SSL/HTTPS enabled (automatic on Vercel)
- [ ] No hardcoded URLs (uses env vars)

---

## Rollback Plan

If deployment fails:

```bash
# View deployment history
vercel deployments

# Rollback to previous deployment
vercel rollback

# Or deploy specific commit
vercel --prod [commit-hash]
```

---

## Next Steps After Successful Deployment

1. ✅ Test all features on production
2. ✅ Set up custom domain (if needed)
3. ✅ Configure monitoring/alerts
4. ✅ Set up regular backups for database
5. ✅ Document any custom configurations
6. ✅ Create runbook for incident response
7. ✅ Share production URL with team

---

## Success Criteria

✅ Frontend loads without errors  
✅ API health check returns OK  
✅ Users can login/signup  
✅ Lesson plans can be created  
✅ Health scores calculate  
✅ Real-time features work  
✅ No 500 errors in logs  
✅ Performance metrics acceptable  

---

## Support Resources

- **Vercel Status**: https://www.vercelstatus.com
- **Vercel Support**: https://vercel.com/support
- **Prisma Support**: https://prisma.io/support
- **PostgreSQL Support**: https://www.postgresql.org/support

---

## Final Check Before Clicking "Deploy"

- [ ] All secrets are ready (DB URL, API keys)
- [ ] GitHub branch is clean and pushed
- [ ] Vercel project is created
- [ ] Environment variables list prepared
- [ ] Team members notified
- [ ] Backup created (if applicable)
- [ ] Rollback plan in place

---

**✅ Ready to deploy! 🚀**

