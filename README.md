# DakShiksha - GDS Training Platform

A premium, full-stack EdTech platform for Gramin Dak Sevak (GDS) / India Post Exam preparation built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### For Students
- ✅ **Study Materials**: Access PDFs, documents, and study notes categorized by topics
- ✅ **Video Lectures**: Watch recorded classes with progress tracking and resume functionality
- ✅ **Tests**: Attempt timed tests with instant evaluation and leaderboards
- ✅ **Quiz System**: Practice Mathematics, Reasoning, GK, and Current Affairs
- ✅ **Bookmarks**: Save important materials, videos, and quizzes
- ✅ **Progress Tracking**: Monitor your learning journey with detailed analytics
- ✅ **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### For Administrators
- ✅ **Dashboard**: Comprehensive analytics and statistics
- ✅ **Content Management**: Upload and manage study materials, videos, tests
- ✅ **User Management**: Monitor student activities and registrations
- ✅ **Announcements**: Post important updates for all students
- ✅ **Analytics**: Track downloads, views, and engagement metrics

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Recharts** - Data visualization

### Backend
- **Supabase**
  - Authentication with email/password
  - PostgreSQL database
  - Storage for files and videos
  - Row Level Security (RLS)
  - Real-time subscriptions ready

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))

### Step 1: Clone and Install
```bash
cd dakshiksha
npm install
```

### Step 2: Setup Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key

### Step 3: Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire content from `supabase-schema.sql`
4. Paste and run it in the SQL Editor

This will create:
- All database tables with proper relationships
- Indexes for performance optimization
- Row Level Security policies
- Storage buckets
- Database functions and triggers
- Seed data for quiz categories

### Step 5: Storage Setup

The schema automatically creates storage buckets, but verify they exist:
1. Go to **Storage** in Supabase dashboard
2. Ensure these buckets exist:
   - `study-materials`
   - `videos`
   - `thumbnails`
   - `avatars`

### Step 6: Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📱 Usage

### First Time Setup

1. **Register an Account**: Go to `/register` and create a new account
2. **Login**: Use your credentials to login at `/login`
3. **Default Role**: New users are assigned the 'student' role by default

### Creating an Admin Account

To create an admin account, you need to manually update the database:

1. Register a new account normally
2. Go to Supabase Dashboard → Table Editor → `profiles`
3. Find your user record
4. Change the `role` column from `'student'` to `'admin'`
5. Logout and login again

### Student Features

- **Dashboard**: View your progress, recent activities, and statistics
- **Study Materials**: Browse, search, download, and bookmark materials
- **Videos**: Watch lectures with progress tracking
- **Tests**: Take tests, view results, and compare with leaderboards
- **Quiz**: Practice topic-wise questions
- **Profile**: Manage your account information

### Admin Features

- **Dashboard**: View analytics, user statistics, and platform metrics
- **Upload Content**: Add study materials, videos, tests, and quizzes
- **Manage Users**: Monitor student activities
- **Announcements**: Post updates for all students
- **Analytics**: Track engagement and usage metrics

## 🏗️ Project Structure

```
dakshiksha/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Button, Input, Card, Modal, etc.
│   │   ├── layouts/         # Page layouts (Auth, Dashboard)
│   │   ├── admin/           # Admin-specific components
│   │   └── student/         # Student-specific components
│   ├── pages/               # Page components
│   │   ├── auth/            # Login, Register, ForgotPassword
│   │   ├── admin/           # Admin pages
│   │   └── student/         # Student pages
│   ├── services/            # API service layers
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── constants/           # App constants
│   └── supabase/            # Supabase client configuration
├── public/                  # Static assets
├── supabase-schema.sql      # Complete database schema
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: #C8102E (India Post Red)
- **Secondary**: #FFD700 (Golden)
- **Dark Mode**: Fully supported with automatic theme switching

### Components
All components are built with:
- Responsive design (mobile-first)
- Dark mode support
- Smooth animations
- Accessibility features
- Loading states
- Error handling

## 🔐 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Secure authentication with Supabase Auth
- ✅ Protected routes based on user roles
- ✅ File upload validation
- ✅ XSS protection
- ✅ SQL injection prevention via Supabase client

## 📊 Database Schema

The platform uses a comprehensive PostgreSQL database with:
- **11 main tables** for users, content, and activities
- **Proper relationships** with foreign keys
- **Indexes** for optimal query performance
- **RLS policies** for data security
- **Automatic timestamps** with triggers
- **Storage buckets** for file management

## 🚀 Deployment

### Recommended Platform: Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder.

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code with ESLint
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## 🤝 Contributing

This is a production-ready application. For customization:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is built as a commercial SaaS platform. All rights reserved.

## 🆘 Support

For issues or questions:
1. Check the Supabase documentation
2. Review the code comments
3. Inspect browser console for errors
4. Verify environment variables are set correctly

## 🎯 Roadmap

Future enhancements:
- [ ] Live classes with video conferencing
- [ ] Payment gateway integration
- [ ] Mobile apps (React Native)
- [ ] Push notifications
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Batch management
- [ ] Certificate generation
- [ ] Forum/Discussion board

## ✨ Key Highlights

- **Production-Ready**: Clean code, proper error handling, and security
- **Scalable**: Built with best practices and modern architecture
- **Performant**: Optimized queries, lazy loading, code splitting
- **Responsive**: Mobile-first design that works everywhere
- **Accessible**: WCAG compliant UI components
- **Maintainable**: TypeScript, organized structure, reusable components

---

Built with ❤️ for India Post GDS aspirants
