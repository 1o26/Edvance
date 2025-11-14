# Real-Time Collaboration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PREPSMITH COLLABORATION                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT SIDE (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ LessonPlanDetail (List Page)                            │  │
│  │  - Show lesson plans                                    │  │
│  │  - "Share" button (creator only)                        │  │
│  │  - "Edit" button (for collaboration)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Collaboration Page (Editor Page)                        │  │
│  │  - Edit fields (Title, Objectives, etc)                │  │
│  │  - Save button                                          │  │
│  │  - Comments panel                                       │  │
│  │  - Active collaborators list                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ CollaboratorsManager Component                          │  │
│  │  - List all collaborators                               │  │
│  │  - Add new collaborators                                │  │
│  │  - Set permission roles                                 │  │
│  │  - Remove collaborators                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ LiveblocksContext (Auth & Session Management)           │  │
│  │  - Initialize Liveblocks client                         │  │
│  │  - Auth endpoint for tokens                             │  │
│  │  - Presence tracking                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Axios API Calls                                         │  │
│  │  - POST /api/collaboration/auth                         │  │
│  │  - POST /api/collaboration/:id/grant-access            │  │
│  │  - GET /api/collaboration/:id/collaborators            │  │
│  │  - POST /api/collaboration/:id/comments                │  │
│  │  - PUT /api/collaboration/:id/comments/:id             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▼                                       │
│             HTTP/REST API (Port 5000)                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SERVER SIDE (Express.js)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Collaboration Routes (/routes/collaboration.js)          │  │
│  │                                                           │  │
│  │  ├─ POST /auth                                          │  │
│  │  │   └─ Generate Liveblocks token                       │  │
│  │  │       ├─ Verify user has access to plan             │  │
│  │  │       └─ Return token + user info                    │  │
│  │  │                                                       │  │
│  │  ├─ POST /grant-access                                 │  │
│  │  │   └─ Invite collaborator to plan                    │  │
│  │  │       ├─ Check creator permission                   │  │
│  │  │       ├─ Create permission record                   │  │
│  │  │       └─ Log activity                               │  │
│  │  │                                                       │  │
│  │  ├─ POST /revoke-access                                │  │
│  │  │   └─ Remove collaborator access                     │  │
│  │  │       ├─ Delete permission record                   │  │
│  │  │       ├─ End active sessions                        │  │
│  │  │       └─ Log activity                               │  │
│  │  │                                                       │  │
│  │  ├─ GET /collaborators                                 │  │
│  │  │   └─ Get collaborators + active sessions            │  │
│  │  │       ├─ Fetch from DB                              │  │
│  │  │       └─ Return collaborators list                  │  │
│  │  │                                                       │  │
│  │  ├─ POST /comments                                     │  │
│  │  │   └─ Add comment to lesson plan                     │  │
│  │  │       ├─ Verify user access                         │  │
│  │  │       ├─ Create comment record                      │  │
│  │  │       └─ Return with user info                      │  │
│  │  │                                                       │  │
│  │  ├─ GET /comments                                      │  │
│  │  │   └─ Get comments for plan                          │  │
│  │  │       ├─ Filter by resolved status                  │  │
│  │  │       └─ Include user info                          │  │
│  │  │                                                       │  │
│  │  └─ PUT /comments/:id                                  │  │
│  │      └─ Update comment (resolve)                       │  │
│  │          └─ Mark as resolved                           │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Liveblocks Node Library                                 │  │
│  │  - Create auth tokens                                   │  │
│  │  - Manage room access                                   │  │
│  │  - Handle presence                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Prisma ORM                                              │  │
│  │  - Data access layer                                    │  │
│  │  - Query builder                                        │  │
│  │  - Relationship management                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database                                     │  │
│  │  ├─ lesson_plans (existing)                             │  │
│  │  ├─ users (existing)                                    │  │
│  │  ├─ collaboration_sessions (new)                        │  │
│  │  ├─ collaboration_comments (new)                        │  │
│  │  ├─ collaboration_permissions (new)                     │  │
│  │  └─ activities (existing, used for logging)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Teacher Opens Lesson Plan
```
Client                          Server                    Database
  │                               │                           │
  ├─ GET /lesson-plans/:id ────► │                           │
  │                               ├─ Query LessonPlan ────► │
  │                               │ + Creator + Versions     │
  │                               │◄─ Return plan ────────── │
  │◄─ Return plan ──────────────── │                           │
  │ Display with "Share" button    │                           │
  │                                │                           │
```

### 2. Creator Shares Plan with Collaborator
```
Client                          Server                    Database
  │                               │                           │
  ├─ POST /grant-access ────────► │                           │
  │   { userId, role }            ├─ Create ─────────────►  │
  │                               │ CollaborationPermission  │
  │                               │ + Log Activity            │
  │                               │◄─ Success ──────────── │
  │◄─ Permission granted ────────── │                           │
  │ Show collaborator in list      │                           │
  │                                │                           │
```

### 3. Collaborators Open Plan for Editing
```
Client (A)                      Client (B)              Server              Database
   │                               │                        │                   │
   ├─ Click Edit ─────────────────┼───────────────────────► │                   │
   │                               │   Join Room             │                   │
   │                               ├─ Check Access ────────► │                   │
   │                               │                         ├─ Verify ───────► │
   │                               │◄─ Token ──────────────── │ Permission      │
   │                               │ Create Session ────────► │                   │
   │                               │                         │◄─ OK ──────────── │
   │◄───────────────────────────────────── Token ─────────────┤                   │
   │ Initialize                    │                         │                   │
   │                               │                         │                   │
   ├─────────────── Presence Update ──────────► │               │
   │ (User A is editing)           │                         │               │
   │                               ├─────────────── Broadcast Presence
   │                               │                      ◄──│ (Show on UI)
   │                               │                         │
   │◄────────────────────────────── Presence Update ──────────┤
   │ See User B is also editing    │                         │
   │                               │                         │
```

### 4. Collaborators Edit and Save
```
Client (A)                      Server                    Database
  │                               │                           │
  ├─ Edit Field ────────────────► │ Real-time sync via       │
  │                               │ Liveblocks (external)    │
  │ (Both collaborators see       │                           │
  │  changes in real-time)        │                           │
  │                               │                           │
  ├─ Click Save ─────────────────► │                           │
  │ PUT /lesson-plans/:id         ├─ Update ──────────────► │
  │ { content, ...}               │ LessonPlan               │
  │                               │ + Create Version         │
  │                               │ + Log Activity            │
  │                               │◄─ Success ──────────── │
  │◄─ Saved successfully ────────── │                           │
  │                                │                           │
```

### 5. Adding Comments
```
Client (A)                      Server                    Database
  │ Select text                    │                           │
  │ + Click Comments              │                           │
  │ ├─ Type comment               │                           │
  │ ├─ POST /comments ────────────► │                           │
  │   { content, position }        ├─ Create Comment ──────► │
  │                               │                           │
  │                               │◄─ Comment created ────── │
  │◄─ Comment added ────────────────│                           │
  │                                │                           │
  │                                │ Push to other clients via
  │                                │ Socket/Polling            │
  │                                │                           │
  ├──────────────────────────────────────────────────────────► │
  │ (Comment appears for all       │                           │
  │  collaborators)                │                           │
  │                                │                           │
```

## Permission Model

```
┌─────────────────────────────────────┐
│    COLLABORATION PERMISSION         │
├─────────────────────────────────────┤
│ id: UUID                            │
│ planId: String                      │
│ userId: String                      │
│ role: "editor" | "commenter"        │
│       | "viewer"                    │
│ grantedAt: DateTime                 │
│ grantedBy: String (who invited)    │
└─────────────────────────────────────┘

PERMISSION LEVELS:
────────────────

Editor:
  ✓ Read lesson plan
  ✓ Edit all fields
  ✓ Add comments
  ✓ Save changes
  ✓ See version history
  ✗ Share with others
  ✗ Delete plan
  ✗ Submit for approval

Commenter:
  ✓ Read lesson plan
  ✓ Add comments
  ✗ Edit fields
  ✗ Save changes
  ✗ Share with others

Viewer:
  ✓ Read lesson plan
  ✗ Edit fields
  ✗ Add comments
  ✗ Share with others

Creator (Owner):
  ✓ All permissions
  ✓ Share/invite others
  ✓ Delete plan
  ✓ Submit for approval
```

## Database Schema Relationships

```
┌─────────────────────┐
│ User                │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ email               │
│ role                │
└────────┬────────────┘
         │ 1:N (creator)
         ▼
┌─────────────────────┐
│ LessonPlan          │
├─────────────────────┤
│ id (PK)             │
│ title               │
│ content             │
│ creatorId (FK)      │◄────────┐
│ status              │         │
│ version             │         │
└────────┬────────────┘         │
         │ 1:N                  │
         ▼                      │
┌─────────────────────────────┐ │ grantedBy
│ CollaborationPermission     │ │
├─────────────────────────────┤ │
│ id (PK)                     │ │
│ planId (FK)                 │ │
│ userId (FK) ────────────────┼─┘
│ role                        │
│ grantedAt                   │
│ grantedBy (FK)              │
└─────────────────────────────┘

         ▼ (userId)
┌─────────────────────────────┐
│ CollaborationSession        │
├─────────────────────────────┤
│ id (PK)                     │
│ planId (FK)                 │
│ userId (FK)                 │
│ status                      │
│ joinedAt                    │
│ lastActivity                │
└─────────────────────────────┘

         ▼
┌─────────────────────────────┐
│ CollaborationComment        │
├─────────────────────────────┤
│ id (PK)                     │
│ planId (FK)                 │
│ userId (FK)                 │
│ content                     │
│ resolved                    │
│ createdAt                   │
└─────────────────────────────┘
```

## Real-Time Presence Flow

```
Teacher A                    Liveblocks                    Teacher B
   │                            │                             │
   ├─ Join Room ───────────────► │                             │
   │ (Create Presence)           │                             │
   │                             ├─ Broadcast Presence ──────► │
   │                             │ "User A is editing"         │
   │◄────────────────────────────┼─ Update Presence ─────────── │
   │ See B joined                │                             │
   │                             │                             │
   │ Make Edit ───────────────────────────────────────────────► │
   │                             │ (Real-time sync)            │
   │◄─────────────────────────────────────────────────────────── │
   │ See B's edit                │                             │
   │                             │                             │
   │ Add Comment ──────────────► │ (Stored in DB)              │
   │ (Persisted)                 ├─ Broadcast Comment ────────► │
   │                             │                             │
   │                             │ B sees comment in UI        │
   │                             │                             │
   │ B replies ◄──────────────────────────────────────────────── │
   │ See B's comment             │                             │
   │                             │                             │
   │ Click Save ──────────────────────────────────────────────► │
   │ Save to DB                  │ (Persist to DB)             │
   │                             │                             │
   │ Leave Room ──────────────────────────────────────────────┐ │
   │ (Update Presence)           │                            │ │
   │                             ├─ Broadcast "A left" ──────┤ │
   │                             │                            │ │
   │                             │                            ▼ │
   │                             │                      See "A left"
```

## Technology Stack

```
FRONTEND                    BACKEND                  INFRASTRUCTURE
─────────────────          ───────────────────      ──────────────
React 18                   Node.js + Express        PostgreSQL
Liveblocks React          Liveblocks Node          Prisma ORM
Axios                     JWT Auth                 Socket.io
TailwindCSS               Validation               Docker
Framer Motion             Logging
```

## Sequence Diagram: Full Collaboration Flow

```
┌──────────────┐         ┌──────────────┐        ┌──────────────┐
│  Teacher A   │         │    Server    │        │  Teacher B   │
└──────┬───────┘         └──────┬───────┘        └──────┬───────┘
       │                        │                        │
       │  1. Create Plan        │                        │
       ├───────────────────────►│                        │
       │                        │ Save to DB             │
       │◄───────────────────────┤                        │
       │                        │                        │
       │  2. Click Share        │                        │
       ├─────────────────────┐  │                        │
       │                     │  │                        │
       │  3. Grant Access    │  │                        │
       ├───────────────────────►│                        │
       │                        │ Create Permission      │
       │                        │ + Log Activity         │
       │                        │ (B is notified)        │
       │                        │                        │
       │  4. Click Edit         │  5. Receives invite    │
       ├───────────────────────►│◄──────────────────────┤
       │ Verify Access          │ Can now edit           │
       │ Create Token           │                        │
       │ Create Session         │                        │
       │◄───────────────────────┤                        │
       │                        │ 6. Joins Room          │
       │                        ├───────────────────────►│
       │                        │ Verify Access          │
       │                        │ Create Token           │
       │                        │ Create Session         │
       │                        │◄───────────────────────┤
       │                        │                        │
       │ 7. See B editing       │ Broadcast Presence     │
       │◄───────────────────────┼────────────────────────│
       │                        │                        │
       │ 8. Make Edit           │ 9. See A's Edit        │
       ├───────────────────────►├───────────────────────►│
       │ Real-time Sync         │                        │
       │ (via Liveblocks)       │                        │
       │                        │                        │
       │ 10. Add Comment        │                        │
       ├───────────────────────►│ 11. See Comment        │
       │ POST /comments         ├───────────────────────►│
       │ Store in DB            │                        │
       │                        │                        │
       │ 12. Reply to Comment   │ 13. See Reply          │
       │◄───────────────────────┼────────────────────────┤
       │                        │                        │
       │ 14. Save Plan          │                        │
       ├───────────────────────►│                        │
       │ PUT /lesson-plans/:id  │                        │
       │ Create Version         │                        │
       │ Log Activity           │                        │
       │◄───────────────────────┤                        │
       │                        │                        │
       │ 15. Leave (B continues)│                        │
       ├───────────────────────►│                        │
       │ Leave Room             │ Update Presence        │
       │ End Session            ├───────────────────────►│
       │                        │ See "A left"           │
       │                        │                        │
```

This architecture ensures real-time collaboration while maintaining security, data persistence, and proper permission management.
