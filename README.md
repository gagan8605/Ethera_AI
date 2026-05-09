# Team Task Manager - Full Stack Application

A complete, production-ready team task management application built with React, Node.js, Express, and PostgreSQL.

## Features

✅ **User Authentication**
- JWT-based authentication with refresh tokens
- Secure password hashing with bcryptjs
- Auto token refresh on expiration
- Remember me functionality

✅ **Project Management**
- Create, read, update, delete projects
- Add team members with role-based access
- Project activity logs
- Color-coded projects

✅ **Task Management**
- Create tasks with detailed information
- Kanban board with drag-and-drop
- Task filtering by status, priority, assignee
- Task comments and activity tracking
- Due date management

✅ **Dashboard & Analytics**
- Real-time statistics (tasks, overdue, completed)
- Activity feed
- Charts and analytics (task distribution, completion rate)
- My tasks overview

✅ **Notifications**
- Real-time notification system
- Task assignments, comments, member additions
- Mark as read / read all
- Notification management

✅ **Admin Panel**
- User management
- System statistics
- Role-based access control

✅ **Responsive Design**
- Modern dark theme
- Mobile-friendly UI
- Smooth animations and transitions
- TailwindCSS + shadcn/ui components

## Tech Stack

### Backend
- **Node.js + Express.js** - Server framework
- **PostgreSQL** - Database
- **Prisma ORM** - Database client and migrations
- **JWT** - Authentication (access + refresh tokens)
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors, helmet, compression** - Security & optimization

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Routing
- **Zustand** - Global state management
- **React Query** - Server state & caching
- **TailwindCSS** - Styling
- **Recharts** - Analytics charts
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.js              # Seed data
│   ├── src/
│   │   ├── controllers/         # Route handlers
│   │   ├── middleware/          # Auth, validation, error handling
│   │   ├── routes/              # API routes
│   │   ├── utils/               # Utilities (JWT, DB, helpers)
│   │   └── index.js             # Server entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client & endpoints
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── store/               # Zustand stores
│   │   ├── hooks/               # Custom hooks
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.local
│
├── railway.toml                 # Railway deployment config
└── README.md
```

## Setup & Development

### Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL (v12+)
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Random 64-character string
   - `JWT_REFRESH_SECRET` - Random 64-character string

4. **Setup database**
   ```bash
   # Create database
   npx prisma migrate dev --name init
   
   # Seed with demo data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `VITE_API_URL` if your backend is on a different URL.

4. **Start development server**
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:5173`

### Demo Credentials

After seeding, use these credentials:

**Admin Account**
- Email: `admin@demo.com`
- Password: `Admin123!`

**Member Accounts**
- Email: `sagar@demo.com` / Password: `Member123!`
- Email: `ram@demo.com` / Password: `Member123!`
- Email: `priya@demo.com` / Password: `Member123!`

## API Endpoints

### Authentication `/api/auth`
```
POST   /register              Register new user
POST   /login                 Login user
POST   /refresh               Refresh access token
POST   /logout                Logout user
GET    /me                    Get current user
PUT    /me                    Update profile
PUT    /me/password           Change password
```

### Users `/api/users`
```
GET    /                      List all users (admin only)
GET    /:id                   Get user profile
```

### Projects `/api/projects`
```
GET    /                      List my projects
POST   /                      Create project
GET    /:id                   Get project details
PUT    /:id                   Update project (admin/owner)
DELETE /:id                   Delete project (owner only)
GET    /:id/members           Get project members
POST   /:id/members           Add member (admin only)
PUT    /:id/members/:userId   Update member role (admin only)
DELETE /:id/members/:userId   Remove member (admin only)
GET    /:id/activity          Get project activity log
```

### Tasks `/api/projects/:projectId/tasks`
```
GET    /                      List tasks with filters
POST   /                      Create task
GET    /:id                   Get task details
PUT    /:id                   Update task
DELETE /:id                   Delete task
PUT    /:id/status            Quick status update
POST   /reorder                Reorder tasks
GET    /:id/comments          Get task comments
POST   /:id/comments          Add comment
DELETE /:id/comments/:commentId Delete comment
```

### Dashboard `/api/dashboard`
```
GET    /stats                 Dashboard statistics
GET    /my-tasks              My tasks across projects
GET    /activity              Recent activity feed
GET    /overdue               All overdue tasks
GET    /completion-stats      Project completion stats
GET    /status-chart          Tasks by status
GET    /completed-daily       Completed tasks last 7 days
```

### Notifications `/api/notifications`
```
GET    /                      Get notifications
GET    /unread-count          Get unread count
PUT    /:id/read              Mark as read
PUT    /read-all              Mark all as read
DELETE /:id                   Delete notification
```

## Database Schema

### Key Models
- **User** - System users with roles (ADMIN, MEMBER)
- **Project** - Team projects with status
- **ProjectMember** - Project membership with roles
- **Task** - Project tasks with status and priority
- **Comment** - Task comments
- **Notification** - User notifications
- **ActivityLog** - Project/task activity tracking

### Enums
- **Role**: ADMIN, MEMBER
- **ProjectRole**: ADMIN, MEMBER, VIEWER
- **ProjectStatus**: ACTIVE, ARCHIVED, COMPLETED
- **TaskStatus**: TODO, IN_PROGRESS, IN_REVIEW, DONE
- **Priority**: LOW, MEDIUM, HIGH, URGENT

## Role-Based Access Control

| Feature | Admin | Project Admin/Owner | Member | Viewer |
|---------|-------|-------------------|--------|--------|
| Create project | ✅ | ✅ | ✅ | ❌ |
| Delete project | ✅ | Owner only | ❌ | ❌ |
| Invite members | ✅ | ✅ | ❌ | ❌ |
| Change member roles | ✅ | ✅ | ❌ | ❌ |
| Create tasks | ✅ | ✅ | ✅ | ❌ |
| Edit any task | ✅ | ✅ | Own tasks | ❌ |
| Delete task | ✅ | ✅ | Own tasks | ❌ |
| Comment | ✅ | ✅ | ✅ | ✅ |
| View admin panel | ✅ | ❌ | ❌ | ❌ |

## Deployment on Railway

### Prerequisites
- Railway account (railway.app)
- GitHub repository

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <github-url>
   git push -u origin main
   ```

2. **Create Railway Project**
   - Go to railway.app
   - Click "Create Project"
   - Connect GitHub repository

3. **Add Services**
   - Add PostgreSQL plugin
   - Add application service from GitHub

4. **Configure Environment Variables**
   
   Backend:
   - `DATABASE_URL` - Copy from PostgreSQL service
   - `JWT_SECRET` - Generate random string
   - `JWT_REFRESH_SECRET` - Generate random string
   - `FRONTEND_URL` - Your Railway frontend URL
   - `NODE_ENV` - Set to `production`

   Frontend:
   - `VITE_API_URL` - `https://YOUR_BACKEND_DOMAIN/api`

5. **Deploy**
   - Railway auto-deploys on push
   - Monitor deployment logs

### Troubleshooting

**Database connection fails:**
- Ensure DATABASE_URL is correct
- Run `npx prisma migrate deploy`

**API 401 Unauthorized:**
- Check JWT tokens in localStorage
- Verify AUTH tokens are being sent

**CORS errors:**
- Update FRONTEND_URL in backend env vars
- Ensure frontend URL matches in CORS config

## Available Scripts

### Backend
```bash
npm run dev              # Start development server
npm start               # Start production server
npm run db:migrate      # Run migrations
npm run db:seed         # Seed demo data
npm run db:studio       # Open Prisma Studio
```

### Frontend
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
```

## Performance Optimization

- ✅ Code splitting with Vite
- ✅ React Query caching and polling
- ✅ Request compression with gzip
- ✅ Database query optimization
- ✅ Rate limiting on auth endpoints
- ✅ Helmet for security headers

## Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcryptjs
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation with express-validator
- ✅ Rate limiting on auth routes
- ✅ Secure cookie handling
- ✅ SQL injection prevention (Prisma)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Keyboard Shortcuts

- `Escape` - Close modals/drawers
- `N` - Create new task (in context)
- `Cmd+K` - Global search (coming soon)

## Contributing

This is a complete demo application. Feel free to extend it with:
- User profile customization
- Team invitations via email
- File attachments
- Real-time WebSocket updates
- Dark/Light theme toggle
- Advanced filtering and search
- Recurring tasks
- Time tracking

## License

MIT

## Support

For issues or questions, refer to the API documentation or check the component prop documentation in the code.

---

**Built with ❤️ using React, Node.js, and PostgreSQL**
