# Quick Start: Real-Time Lesson Plan Collaboration

## 30-Second Setup

1. **Install Packages**
   ```bash
   cd server && npm install @liveblocks/node
   cd ../client && npm install @liveblocks/client @liveblocks/react
   ```

2. **Update Database**
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Add Environment Variable (Server)**
   ```env
   LIVEBLOCKS_SECRET_KEY=test_secret_key
   ```

4. **Start Application**
   - Server: `npm run dev` (in server folder)
   - Client: `npm run dev` (in client folder)

## Using Real-Time Collaboration

### Share a Lesson Plan
1. Go to a lesson plan you created
2. Click **Share** button
3. Select a teacher and set their role (Editor/Commenter/Viewer)
4. They can now collaborate!

### Edit Together
1. Both teachers open the lesson plan
2. Click **Edit**
3. See active collaborators on the right
4. Make changes - they save automatically
5. Add comments by selecting text

### Track Changes
- Comments show who said what and when
- Active collaborators list updates in real-time
- All changes are versioned automatically

## What's Included

✅ Real-time presence (see who's editing)  
✅ Permission levels (Editor/Commenter/Viewer)  
✅ Comment threads (discuss changes)  
✅ Activity tracking (log all actions)  
✅ Version history (keep all versions)  
✅ Database persistence (all data saved)  

## Key Files Changed

**New Files:**
- `/server/routes/collaboration.js` - API endpoints
- `/client/src/context/LiveblocksContext.jsx` - Liveblocks setup
- `/client/src/components/CollaboratorsManager.jsx` - UI for sharing
- `/client/src/pages/LessonPlanCollaborativeEditor.jsx` - Editor page

**Modified Files:**
- `/server/prisma/schema.prisma` - New collaboration tables
- `/server/index.js` - Added collaboration routes
- `/client/src/pages/Collaboration.jsx` - Updated to use new system
- `/client/src/pages/LessonPlanDetail.jsx` - Added share button
- `/server/package.json` - Added @liveblocks/node
- `/client/package.json` - Added @liveblocks/client

## API Endpoints

### Grant Access
```
POST /api/collaboration/:planId/grant-access
Body: { userId, role: "editor|commenter|viewer" }
```

### Get Collaborators
```
GET /api/collaboration/:planId/collaborators
```

### Add Comment
```
POST /api/collaboration/:planId/comments
Body: { content, position (optional) }
```

### Get Comments
```
GET /api/collaboration/:planId/comments?resolved=false
```

## Common Tasks

### To share a lesson plan:
1. Open the lesson plan
2. Click "Share" button
3. Select user and role
4. Click "Add Collaborator"

### To collaborate:
1. Click "Edit" button
2. See real-time presence on the right
3. Make changes
4. Click "Save" to persist

### To comment:
1. Select text in the editor
2. Click "Comments" button
3. Type your comment
4. Click "Post Comment"

### To remove a collaborator:
1. Open Collaborators Manager
2. Find the collaborator
3. Click the × button
4. Confirm removal

## Permissions

- **Owner**: Can share, edit, comment (all permissions)
- **Editor**: Can edit all fields and add comments
- **Commenter**: Can only add comments, cannot edit
- **Viewer**: Can only read, cannot comment or edit

## Features

| Feature | Owner | Editor | Commenter | Viewer |
|---------|-------|--------|-----------|--------|
| Edit Plan | ✓ | ✓ | ✗ | ✗ |
| Add Comments | ✓ | ✓ | ✓ | ✗ |
| View Plan | ✓ | ✓ | ✓ | ✓ |
| Share/Invite | ✓ | ✗ | ✗ | ✗ |
| Delete Plan | ✓ | ✗ | ✗ | ✗ |

## Example Workflow

1. **Teacher A** creates a lesson plan
2. **Teacher A** clicks "Share" and invites **Teacher B** as "Editor"
3. **Teacher B** gets notified and opens the plan
4. Both click "Edit" to start collaborating
5. They see each other in the "Active Collaborators" panel
6. **Teacher A** selects text and comments on it
7. **Teacher B** replies with a comment
8. **Teacher A** marks comment as resolved
9. Both make final edits
10. Click "Save" to finalize
11. The plan now has version history showing collaboration

## Troubleshooting

### Comments not showing?
- Refresh the page
- Make sure database migrations ran: `npx prisma migrate dev`
- Check browser console for errors

### Can't share?
- Only plan creators can share (you created it)
- Make sure the other user exists in the system
- Check that LIVEBLOCKS_SECRET_KEY is set

### Edits not syncing?
- Try clicking Save manually
- Refresh and make small changes
- Check server logs for connection issues

## Next Steps

1. ✅ Install packages
2. ✅ Run migrations
3. ✅ Set environment variable
4. ✅ Start the app
5. ✅ Create a lesson plan
6. ✅ Click Share and invite a colleague
7. ✅ Start collaborating!

## Need Help?

Check the full documentation at `COLLABORATION_SETUP.md` for:
- Detailed API reference
- Database schema
- Advanced features
- Future enhancements
