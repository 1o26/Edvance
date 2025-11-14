# Edvance - AI-Powered Lesson Planning Platform

Edvance is a modern, full-stack web application that helps teachers create, edit, and manage structured lesson plans with AI assistance, real-time collaboration, version control, and approval workflows.

## Features

- 🤖 **AI-Powered Generation**: Generate lesson plans instantly using Google Gemini AI
- 👥 **Real-time Collaboration**: Collaborate with colleagues in real-time on lesson plans
- 📚 **Version Control**: Track changes and revert to previous versions
- ✅ **Approval Workflow**: Streamlined approval process for HOD review
- 📊 **Analytics Dashboard**: View activity trends and statistics
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 🔐 **Role-Based Access**: Secure authentication with teacher, HOD, and admin roles
- 📄 **PDF Export**: Export lesson plans as professional PDF documents
- 📊 **PPT Generation**: Generate PowerPoint presentations from lesson plans
- ❓ **Quiz Generation**: AI-powered quiz generation based on lesson plan content
- 📝 **Question Paper Generation**: Generate comprehensive question papers with answer keys

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- React Router DOM v6
- Framer Motion
- Recharts
- Socket.io Client
- Axios

### Backend
- Node.js + Express
- PostgreSQL with Prisma ORM
- Socket.io for real-time collaboration
- Google Gemini AI Integration
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Edvance-C
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Set up environment variables**

Create a `.env` file in the `server` directory:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://user:password@localhost:5432/edvance?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GEMINI_API_KEY=AIzaSyDEIGf1uBs5sjn-zt0e3pBjgmBt5NrGM2s
NODE_ENV=development
```

Create a `.env` file in the `client` directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

5. **Set up the database**
```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

6. **Start the development server**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Project Structure

```
Edvance-C/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React contexts
│   │   └── App.jsx        # Main app component
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── socket/            # Socket.io handlers
│   ├── prisma/            # Prisma schema
│   ├── index.js           # Server entry point
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Lesson Plans
- `GET /api/lesson-plans` - Get all lesson plans
- `GET /api/lesson-plans/:id` - Get single lesson plan
- `POST /api/lesson-plans` - Create lesson plan
- `PUT /api/lesson-plans/:id` - Update lesson plan
- `DELETE /api/lesson-plans/:id` - Delete lesson plan
- `POST /api/lesson-plans/:id/submit` - Submit for approval
- `POST /api/lesson-plans/:id/revert/:version` - Revert to version
- `GET /api/lesson-plans/:id/export/pdf` - Export lesson plan as PDF
- `GET /api/lesson-plans/:id/export/ppt` - Export lesson plan as PowerPoint
- `POST /api/lesson-plans/:id/generate/quiz` - Generate quiz based on lesson plan
- `POST /api/lesson-plans/:id/generate/question-paper` - Generate question paper

### AI
- `POST /api/ai/generatePlan` - Generate lesson plan using AI

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get single template
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Approvals
- `GET /api/approvals` - Get all approvals (HOD/Admin only)
- `GET /api/approvals/pending` - Get pending approvals
- `POST /api/approvals/:planId` - Create/update approval

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/analytics` - Get analytics data

## User Roles

- **Teacher**: Can create, edit, and submit lesson plans
- **HOD (Head of Department)**: Can review and approve/reject lesson plans
- **Admin**: Full access to all features

## Deployment

### Frontend (Vercel)
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `cd client && vercel`

### Backend (Render/Railway)
1. Connect your repository
2. Set environment variables
3. Run build command: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Start command: `npm start`

### Docker
```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@edvance.com or open an issue in the repository.



