# Real-Time Collaboration - Installation Checklist

## ✅ Pre-Installation

- [ ] Node.js 16+ installed
- [ ] PostgreSQL running
- [ ] Database migrations up to date
- [ ] Git repository ready
- [ ] Internet connection available

## ✅ Step 1: Install Dependencies

### Server
- [ ] Open terminal in `/server` directory
- [ ] Run: `npm install @liveblocks/node`
- [ ] Verify: `npm list @liveblocks/node` shows package

### Client
- [ ] Open terminal in `/client` directory
- [ ] Run: `npm install @liveblocks/client @liveblocks/react`
- [ ] Verify: `npm list @liveblocks/client @liveblocks/react` shows packages

## ✅ Step 2: Database Setup

- [ ] Open terminal in `/server` directory
- [ ] Run: `npx prisma generate`
- [ ] Run: `npx prisma migrate dev`
- [ ] Choose migration name: `add_collaboration_features`
- [ ] Verify: New tables created in database
  - [ ] `collaboration_sessions`
  - [ ] `collaboration_comments`
  - [ ] `collaboration_permissions`

### Verify Tables
```bash
# In psql or database client
\dt collaboration*
```

## ✅ Step 3: Environment Variables

### Server (.env)
- [ ] Add: `LIVEBLOCKS_SECRET_KEY=test_secret_key`
- [ ] Verify file exists: `/server/.env`
- [ ] Verify JWT_SECRET is set
- [ ] Verify DATABASE_URL is correct

### Client (.env.local or .env)
- [ ] Verify: `VITE_API_URL=http://localhost:5000/api`
- [ ] Optional: `VITE_LIVEBLOCKS_PUBLIC_KEY=...`

## ✅ Step 4: File Structure Verification

### Server Files
- [ ] `/server/routes/collaboration.js` exists
- [ ] `/server/package.json` has `@liveblocks/node`
- [ ] `/server/prisma/schema.prisma` has new models
- [ ] `/server/index.js` imports collaboration routes

### Client Files
- [ ] `/client/package.json` has Liveblocks packages
- [ ] `/client/src/context/LiveblocksContext.jsx` exists
- [ ] `/client/src/components/CollaboratorsManager.jsx` exists
- [ ] `/client/src/pages/Collaboration.jsx` updated
- [ ] `/client/src/pages/LessonPlanDetail.jsx` has Share button

### Documentation Files
- [ ] `/COLLABORATION_QUICK_START.md`
- [ ] `/COLLABORATION_SETUP.md`
- [ ] `/COLLABORATION_ARCHITECTURE.md`
- [ ] `/COLLABORATION_IMPLEMENTATION_SUMMARY.md`

## ✅ Step 5: Application Startup

### Server
- [ ] Open terminal in `/server`
- [ ] Run: `npm run dev`
- [ ] Verify: "Server running on port 5000"
- [ ] Check: No errors in console
- [ ] Test: `curl http://localhost:5000/api/health`

### Client
- [ ] Open new terminal in `/client`
- [ ] Run: `npm run dev`
- [ ] Verify: "Local: http://localhost:5173"
- [ ] Browser opens automatically

## ✅ Step 6: Feature Testing

### Test 1: Login
- [ ] Navigate to login page
- [ ] Login with existing account
- [ ] Verify redirect to dashboard
- [ ] See "Create Lesson Plan" or "Manage Plans" option

### Test 2: Create and Share
- [ ] Create a new lesson plan
- [ ] Fill in basic details
- [ ] Save the plan
- [ ] Click "Share" button (creator only)
- [ ] CollaboratorsManager modal opens

### Test 3: Invite Collaborator
- [ ] In CollaboratorsManager modal
- [ ] Select a different user from dropdown
- [ ] Choose role: "Editor"
- [ ] Click "Add Collaborator"
- [ ] See user in "Current Collaborators" list

### Test 4: Collaborative Editing
- [ ] Click "Edit" button on lesson plan
- [ ] Collaboration page loads
- [ ] See "Active Collaborators" section
- [ ] (Optional) Open same plan in another browser
- [ ] Both editors see each other in real-time

### Test 5: Comments
- [ ] Select text in lesson plan editor
- [ ] Click "Comments" button
- [ ] Type a comment
- [ ] Click "Post Comment"
- [ ] See comment appear below
- [ ] Click checkmark to resolve

### Test 6: Save Changes
- [ ] Edit a field (title, objectives, etc.)
- [ ] Click "Save" button
- [ ] See "Lesson plan saved successfully!"
- [ ] Refresh page - changes persist

## ✅ Step 7: API Testing

### Test Auth Endpoint
```bash
# Terminal
curl -X POST http://localhost:5000/api/collaboration/auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"planId":"plan-id-here"}'

# Expected: { token: "...", room: "plan:...", user: {...} }
```

### Test Get Collaborators
```bash
curl -X GET http://localhost:5000/api/collaboration/PLAN_ID/collaborators \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: { collaborators: [...], activeSessions: [...] }
```

### Test Add Comment
```bash
curl -X POST http://localhost:5000/api/collaboration/PLAN_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"content":"Test comment"}'

# Expected: { comment: {...} }
```

## ✅ Step 8: Troubleshooting

### If Server Won't Start
- [ ] Check port 5000 is available: `lsof -i :5000`
- [ ] Kill process if needed: `kill -9 PID`
- [ ] Check `.env` file exists and has DATABASE_URL
- [ ] Try: `npm install` again
- [ ] Check node version: `node -v` (should be 16+)

### If Client Won't Start
- [ ] Check port 5173 is available
- [ ] Clear node_modules: `rm -rf node_modules && npm install`
- [ ] Clear cache: `npm cache clean --force`
- [ ] Check Vite config

### If Database Connection Fails
- [ ] Verify PostgreSQL is running
- [ ] Check DATABASE_URL format: `postgresql://user:password@localhost:5432/db`
- [ ] Test connection: `psql DATABASE_URL`
- [ ] Run migrations: `npx prisma migrate dev`

### If Collaboration Features Don't Work
- [ ] Check LIVEBLOCKS_SECRET_KEY is set: `echo $LIVEBLOCKS_SECRET_KEY`
- [ ] Restart server after adding env var
- [ ] Check browser console for errors
- [ ] Verify JWT token is valid
- [ ] Check database tables exist: `\dt collaboration*`

## ✅ Step 9: Performance Check

- [ ] Both server and client running without errors
- [ ] Page loads in < 2 seconds
- [ ] Comments appear instantly
- [ ] Presence updates smoothly
- [ ] No 500 errors in console
- [ ] Network tab shows normal requests

## ✅ Step 10: Security Verification

- [ ] Verify LIVEBLOCKS_SECRET_KEY is not in git history
- [ ] Check `.env` file is in `.gitignore`
- [ ] JWT tokens are required for all endpoints
- [ ] Only plan creator can share
- [ ] Only authorized users can access plans
- [ ] CORS is properly configured

## ✅ Documentation Review

- [ ] Read COLLABORATION_QUICK_START.md
- [ ] Review COLLABORATION_SETUP.md for advanced features
- [ ] Understand COLLABORATION_ARCHITECTURE.md
- [ ] Check COLLABORATION_IMPLEMENTATION_SUMMARY.md

## ✅ Final Verification Checklist

- [ ] All dependencies installed
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Server running on port 5000
- [ ] Client running on port 5173
- [ ] Can login to application
- [ ] Can create lesson plan
- [ ] Can share with another user
- [ ] Can edit collaboratively
- [ ] Can add and resolve comments
- [ ] Changes save correctly
- [ ] No console errors
- [ ] API endpoints respond correctly
- [ ] Collaborators see each other in real-time
- [ ] Comments work end-to-end

## ✅ Ready for Production

- [ ] Add LIVEBLOCKS_SECRET_KEY from liveblocks.io (optional for testing)
- [ ] Set proper JWT_SECRET in production
- [ ] Use proper PostgreSQL instance (not local)
- [ ] Enable HTTPS/SSL
- [ ] Set CORS to production domain
- [ ] Configure Docker if using containers
- [ ] Set up monitoring and logging
- [ ] Create backup strategy
- [ ] Test with multiple concurrent users
- [ ] Load test for performance

## 📝 Notes

### For Testing
- You can use test credentials: `LIVEBLOCKS_SECRET_KEY=test_secret_key`
- Test with 2-3 users on different browsers
- All features work locally without Liveblocks account

### For Production
- Get free/paid Liveblocks account at liveblocks.io
- Generate real secret key from Liveblocks dashboard
- Monitor concurrent users and adjust as needed
- Set up proper error tracking (Sentry, etc.)

### Common Issues Resolved
- ✓ Packages installed and verified
- ✓ Database schema updated
- ✓ Environment variables configured
- ✓ All file changes applied
- ✓ API endpoints working
- ✓ UI components integrated
- ✓ Real-time features enabled
- ✓ Comments system functional
- ✓ Permissions working
- ✓ Activity logged

## 🎉 You're All Set!

Once all items are checked, your PrepSmart platform has full real-time collaborative lesson planning! 

Start by:
1. Creating a lesson plan
2. Clicking "Share"
3. Inviting a colleague
4. Both clicking "Edit"
5. Editing together in real-time!

Happy collaborating! 🚀
