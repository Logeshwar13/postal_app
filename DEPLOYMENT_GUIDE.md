# 🚀 DakShiksha Deployment Guide

Complete guide to deploy your GDS Training Platform to production.

---

## 📋 Prerequisites

- Supabase account (https://supabase.com)
- Vercel account (https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)

---

## Step 1: Set Up Supabase Backend

### 1.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Project name: `dakshiksha-prod`
   - Database password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project setup (~2 minutes)

### 1.2 Run Database Schema
1. Open SQL Editor in Supabase dashboard
2. Copy entire content from `supabase-schema.sql`
3. Paste and run in SQL Editor
4. Verify all 14 tables are created

### 1.3 Set Up Storage Buckets
1. Go to Storage in Supabase dashboard
2. Create these buckets:
   - `study-materials` (Public)
   - `videos` (Public)
   - `thumbnails` (Public)
   - `avatars` (Public)

### 1.4 Configure Row Level Security (RLS)
RLS policies are included in `supabase-schema.sql`. Verify they're active:
1. Go to Authentication → Policies
2. Check that each table has appropriate policies
3. Students should only access their own data
4. Admins should have full access

### 1.5 Get API Keys
1. Go to Settings → API
2. Copy these values:
   - `Project URL` (VITE_SUPABASE_URL)
   - `anon public` key (VITE_SUPABASE_ANON_KEY)

---

## Step 2: Configure Environment Variables

### 2.1 Create Production .env
Create `.env.production` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual Supabase project values.

### 2.2 Verify Local Build
```bash
# Test production build locally
npm run build
npm run preview
```

Open http://localhost:4173 and verify everything works.

---

## Step 3: Deploy to Vercel

### 3.1 Push to Git Repository
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 3.2 Import Project to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your Git repository
4. Vercel will auto-detect Vite configuration

### 3.3 Configure Build Settings
Vercel should auto-detect:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3.4 Add Environment Variables
In Vercel project settings → Environment Variables:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

### 3.5 Deploy
1. Click "Deploy"
2. Wait for deployment (~2 minutes)
3. Get your production URL: `https://your-project.vercel.app`

---

## Step 4: Create Admin Account

### 4.1 Register First User
1. Open your deployed site
2. Go to Register page
3. Create account with your admin email

### 4.2 Make User Admin
1. Go to Supabase dashboard → Table Editor
2. Open `profiles` table
3. Find your user record
4. Change `role` from `student` to `admin`
5. Save changes

### 4.3 Test Admin Access
1. Logout and login again
2. You should now see Admin Dashboard
3. Start adding content!

---

## Step 5: Post-Deployment Setup

### 5.1 Add Initial Content
As admin, add:
- 5-10 study materials (different categories)
- 3-5 video lectures
- 2-3 tests with questions
- Quiz questions in all 4 categories
- Welcome announcement

### 5.2 Test All Features
- ✅ Student registration/login
- ✅ Download study materials
- ✅ Watch videos
- ✅ Take tests
- ✅ Practice quizzes
- ✅ Bookmark content
- ✅ Edit profile
- ✅ Change theme
- ✅ Admin content management

### 5.3 Configure Custom Domain (Optional)
1. Purchase domain (e.g., dakshiksha.com)
2. In Vercel → Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate (~24 hours)

---

## Step 6: Production Monitoring

### 6.1 Enable Vercel Analytics
1. Go to Vercel project → Analytics
2. Enable Web Analytics
3. Monitor page views, performance

### 6.2 Monitor Supabase Usage
1. Go to Supabase → Settings → Usage
2. Check:
   - Database size
   - Storage usage
   - Bandwidth
   - Active users

### 6.3 Set Up Error Tracking (Optional)
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user behavior

---

## 🔒 Security Checklist

Before going live:

- ✅ RLS policies enabled on all tables
- ✅ Storage buckets have proper access rules
- ✅ Environment variables never committed to Git
- ✅ Strong admin passwords
- ✅ Email verification enabled (optional)
- ✅ Rate limiting configured
- ✅ CORS properly configured
- ✅ SQL injection prevention verified
- ✅ XSS protection in place

---

## 📱 Mobile Testing

Test on real devices:
- ✅ iPhone Safari
- ✅ Android Chrome
- ✅ Tablet (iPad/Android)
- ✅ Different screen sizes
- ✅ Landscape orientation
- ✅ Touch interactions

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Supabase Connection Error
- Verify environment variables
- Check Supabase project status
- Ensure RLS policies aren't blocking queries

### Images Not Loading
- Verify storage buckets are public
- Check file paths in database
- Ensure CORS is configured

### Authentication Issues
- Check Supabase authentication settings
- Verify email templates
- Check redirect URLs

---

## 📊 Performance Optimization

### After Deployment:
1. **Enable Caching**
   - Vercel automatically caches static assets
   - Configure cache headers if needed

2. **Image Optimization**
   - Use Vercel Image Optimization
   - Compress images before upload
   - Use appropriate formats (WebP)

3. **Bundle Size**
   - Current: 326 KB gzipped (excellent!)
   - Monitor with Vercel Analytics
   - Consider code splitting for large pages

4. **Database Performance**
   - Add indexes on frequently queried columns
   - Monitor slow queries in Supabase
   - Optimize complex queries

---

## 🔄 Update Workflow

### For Future Updates:
1. Make changes locally
2. Test with `npm run build && npm run preview`
3. Commit to Git
4. Push to main branch
5. Vercel auto-deploys

### For Database Schema Changes:
1. Test locally first
2. Backup production database
3. Run migration in Supabase SQL Editor
4. Verify data integrity
5. Test application

---

## 📈 Scaling Considerations

As your platform grows:

### Database:
- Supabase Free: 500 MB, 50 MB files
- Supabase Pro: 8 GB, 5 GB files ($25/mo)
- Supabase Team: Unlimited ($599/mo)

### Hosting:
- Vercel Hobby: 100 GB bandwidth (Free)
- Vercel Pro: 1 TB bandwidth ($20/mo)
- Vercel Enterprise: Custom ($Custom)

### When to Upgrade:
- 1,000+ active users → Pro tier
- 10,000+ users → Team/Enterprise
- Custom needs → Contact sales

---

## 🎉 Launch Checklist

Ready to launch? Complete this final checklist:

- ✅ All 14 database tables created
- ✅ Storage buckets configured
- ✅ RLS policies enabled
- ✅ Environment variables set
- ✅ Build successful
- ✅ Deployed to Vercel
- ✅ Admin account created
- ✅ Initial content added
- ✅ All features tested
- ✅ Mobile responsive verified
- ✅ Cross-browser tested
- ✅ Performance optimized
- ✅ Security verified
- ✅ Monitoring enabled
- ✅ Backup strategy planned
- ✅ Support email configured
- ✅ Terms of service added
- ✅ Privacy policy added
- ✅ Contact page created
- ✅ Social media links added

---

## 📞 Support Resources

### Documentation:
- Vite: https://vitejs.dev/
- React: https://react.dev/
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

### Community:
- Supabase Discord
- React Discord
- Stack Overflow

---

## 🚀 You're Ready to Launch!

Your DakShiksha platform is now live and ready to help GDS aspirants prepare for their exams!

**Production URL:** https://your-project.vercel.app

**Next Steps:**
1. Share with initial users
2. Gather feedback
3. Monitor analytics
4. Iterate and improve

Good luck with your launch! 🎊
