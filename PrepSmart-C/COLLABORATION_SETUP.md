# Real-Time Lesson Plan Collaboration Setup Guide

## Overview
This guide will help you set up real-time collaborative lesson plan editing using Liveblocks. Multiple teachers can now edit the same lesson plan simultaneously with live presence, comments, and version control.

## Features Implemented

### 1. Real-Time Collaboration
- Multiple teachers can edit lesson plans simultaneously
- Live presence indicators showing who's currently editing
- Cursor position tracking (ready for future enhancements)

### 2. Collaboration Permissions
- Teachers can invite other teachers to collaborate
- Granular permission levels:
  - **Editor**: Full edit access
  - **Commenter**: Can only add comments
  - **Viewer**: Read-only access

### 3. Comments & Discussion
- Leave comments on specific parts of the lesson plan
- Comment threads with timestamps
- Mark comments as resolved
- Comments are stored persistently in the database

### 4. Activity Tracking
- All collaboration actions are logged (access granted/revoked)
- Automatic session tracking for active collaborators
- Last activity timestamps

### 5. Integration with Existing Features
- Maintains all existing lesson plan functionality
- Version history integration
- Works with approvals and publishing workflow

## Installation Steps

### Step 1: Install Dependencies

#### Server Side
```bash
cd server
npm install @liveblocks/node
```

#### Client Side
```bash
cd client
npm install @liveblocks/client @liveblocks/react
```

### Step 2: Update Environment Variables

#### Server (.env)
```env
LIVEBLOCKS_SECRET_KEY=your_secret_key_here
# If you don't have a Liveblocks account yet, use a placeholder like:
# LIVEBLOCKS_SECRET_KEY=test_secret_key
```

#### Client (.env or .env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_LIVEBLOCKS_PUBLIC_KEY=your_public_key_here  # Optional if using auth endpoint
```

### Step 3: Run Database Migrations

```bash
cd server
npx prisma generate
npx prisma migrate dev --name add_collaboration_features
```

This will create three new tables:
- `collaboration_sessions` - Track active editor sessions
- `collaboration_comments` - Store lesson plan comments
- `collaboration_permissions` - Manage collaborator access

### Step 4: Start the Application

#### Terminal 1 - Server
```bash
cd server
npm run dev
```

#### Terminal 2 - Client
```bash
cd client
npm run dev
```

## Usage Guide

### For Teachers

#### 1. Creating a Collaborative Editing Session
1. Go to your lesson plan detail page
2. Click the **"Share"** button (only visible if you're the creator)
3. This opens the Collaborators Manager modal

#### 2. Inviting Collaborators
1. In the Collaborators Manager:
   - Select a user from the dropdown
   - Choose their permission level:
     - **Viewer**: Can read but not edit
     - **Commenter**: Can add comments without editing
     - **Editor**: Full editing capabilities
   - Click "Add Collaborator"

#### 3. Editing a Shared Lesson Plan
1. Click the **"Edit"** button on the lesson plan detail page
2. You'll see:
   - **Active Collaborators panel** (right sidebar) showing who's editing
   - **Comments panel** with discussion threads
   - Real-time awareness of other editors

#### 4. Adding Comments
1. Select text in the lesson plan (optional)
2. Click the **"Comments"** button in the header
3. Type your comment
4. If text was selected, it will be highlighted in the comment
5. Click "Post Comment"

#### 5. Resolving Comments
1. In the Comments panel, click the ✓ (checkmark) button on a comment
2. The comment will be marked as resolved and removed from the active list
3. Resolved comments can be viewed in history (future enhancement)

#### 6. Collaborator Management
1. Go to Collaborators Manager
2. You can see:
   - Current collaborators and their roles
   - Active editing sessions
   - Remove collaborators if needed

### Backend API Endpoints

#### Authentication
- **POST** `/api/collaboration/auth`
  - Generates Liveblocks authentication token
  - Used internally by the client

#### Permissions
- **POST** `/api/collaboration/:planId/grant-access`
  - Grant collaboration access to a user
  - Body: `{ userId, role: "editor|commenter|viewer" }`

- **POST** `/api/collaboration/:planId/revoke-access`
  - Revoke access from a collaborator
  - Body: `{ userId }`

#### Collaborators
- **GET** `/api/collaboration/:planId/collaborators`
  - Get all collaborators and active sessions
  - Returns: collaborators list and active sessions

#### Comments
- **POST** `/api/collaboration/:planId/comments`
  - Create a new comment
  - Body: `{ content, position (optional) }`

- **GET** `/api/collaboration/:planId/comments`
  - Get comments for a lesson plan
  - Query: `?resolved=false` (filter by resolution status)

- **PUT** `/api/collaboration/:planId/comments/:commentId`
  - Update comment (mark as resolved)
  - Body: `{ resolved: boolean }`

## Advanced Features

### 1. Permission-Based Access Control
```javascript
// Only creators can grant access
// Collaborators with "viewer" role cannot edit
// System automatically enforces permissions
```

### 2. Session Management
- Sessions are created when a user joins a plan
- Sessions are marked as "active", "idle", or "offline"
- Automatic cleanup of inactive sessions

### 3. Activity Logging
All collaboration actions are logged:
- `collaboration_granted` - When access is granted
- `collaboration_revoked` - When access is revoked
- Can be viewed in activity history

### 4. Real-Time Presence
Active collaborators are shown with:
- Avatar (first letter of name)
- User name
- Status indicator (Active/Idle)

## Troubleshooting

### Issue: "Failed to get auth token for collaboration"
**Solution**: 
- Check that `LIVEBLOCKS_SECRET_KEY` is set in server .env
- Verify the user has access to the lesson plan
- Check server logs for detailed error messages

### Issue: Comments not appearing
**Solution**:
- Refresh the page
- Check browser console for errors
- Verify database migrations were run successfully

### Issue: Can't invite collaborators
**Solution**:
- Only plan creators can invite collaborators
- Check that the user exists in the system
- Ensure the user role allows collaboration

### Issue: Active collaborators list is empty
**Solution**:
- It takes a few seconds for sessions to be registered
- Other collaborators need to actually be editing the plan
- Try refreshing the collaborators list

## Database Schema

### collaboration_sessions
```sql
id: UUID
planId: String (foreign key)
userId: String (foreign key)
userName: String
status: String (active | idle | offline)
cursorPosition: JSON (optional)
joinedAt: DateTime
lastActivity: DateTime
```

### collaboration_comments
```sql
id: UUID
planId: String (foreign key)
userId: String (foreign key)
userName: String
content: String
resolved: Boolean
position: JSON (optional)
createdAt: DateTime
updatedAt: DateTime
```

### collaboration_permissions
```sql
id: UUID
planId: String (foreign key)
userId: String (foreign key)
role: String (editor | commenter | viewer)
grantedAt: DateTime
grantedBy: String (user ID who granted access)
```

## Future Enhancements

1. **Real-Time Cursor Tracking**
   - See exactly where each collaborator is editing
   - Color-coded cursor indicators

2. **Change Suggestions**
   - AI-powered suggestions on collaborative edits
   - Track who made what changes

3. **Conflict Resolution**
   - Handle simultaneous edits to the same field
   - Merge strategies for collaborative changes

4. **Comment Mentions**
   - @mention collaborators in comments
   - Notification system for mentions

5. **Collaborative Approvals**
   - HODs can review and approve while collaborators edit
   - Real-time feedback during collaboration

6. **Export with Contributors**
   - Include list of collaborators in PDF/PPT exports
   - Show who contributed what

## Testing the Feature

### Test Case 1: Basic Collaboration
1. Create a lesson plan
2. Share it with another teacher (editor role)
3. Both teachers edit different sections
4. Save and verify both edits are preserved

### Test Case 2: Comments
1. One teacher selects text and adds a comment
2. Other teacher sees the comment in real-time
3. Comment author resolves the comment
4. Verify it's marked as resolved

### Test Case 3: Permissions
1. Try inviting same user twice (should update role)
2. Try revoking access and editing (should be denied)
3. Test viewer-only mode (read-only access)

## Support & Documentation

For more information:
- Liveblocks Documentation: https://liveblocks.io/docs
- API Reference: Check `/api/collaboration` endpoints
- Database Schema: Check `/server/prisma/schema.prisma`

## Conclusion

Your PrepSmart platform now supports real-time collaborative lesson planning! Teachers can work together seamlessly while maintaining version history, comments, and approval workflows.
