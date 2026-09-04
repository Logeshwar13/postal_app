import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  HelpCircle,
  Video,
  Users,
  Megaphone,
  BarChart3,
  Settings,
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { Loading } from '@/components/common/Loading';
import { SEO } from '@/components/common/SEO';

// Lazy-loaded admin pages for code splitting
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const AdminStudyMaterials = lazy(() => import('@/pages/admin/StudyMaterials').then(m => ({ default: m.AdminStudyMaterials })));
const AdminTests = lazy(() => import('@/pages/admin/Tests').then(m => ({ default: m.AdminTests })));
const AdminQuiz = lazy(() => import('@/pages/admin/Quiz').then(m => ({ default: m.AdminQuiz })));
const AdminVideos = lazy(() => import('@/pages/admin/Videos').then(m => ({ default: m.AdminVideos })));
const AdminUsers = lazy(() => import('@/pages/admin/Users').then(m => ({ default: m.AdminUsers })));
const AdminAnnouncements = lazy(() => import('@/pages/admin/Announcements').then(m => ({ default: m.AdminAnnouncements })));
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics').then(m => ({ default: m.AdminAnalytics })));
const AdminSettings = lazy(() => import('@/pages/admin/Settings').then(m => ({ default: m.AdminSettings })));

const adminSidebarItems = [
  { icon: <LayoutDashboard />, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: <FileText />, label: 'Study Materials', path: '/admin/materials' },
  { icon: <ClipboardList />, label: 'Tests', path: '/admin/tests' },
  { icon: <HelpCircle />, label: 'Quiz', path: '/admin/quiz' },
  { icon: <Video />, label: 'Videos', path: '/admin/videos' },
  { icon: <Users />, label: 'Users', path: '/admin/users' },
  { icon: <Megaphone />, label: 'Announcements', path: '/admin/announcements' },
  { icon: <BarChart3 />, label: 'Analytics', path: '/admin/analytics' },
  { icon: <Settings />, label: 'Settings', path: '/admin/settings' },
];

const PageFallback = () => <Loading />;

export const AdminLayout = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          <DashboardLayout sidebarItems={adminSidebarItems} title="Admin Dashboard">
            <SEO title="Admin Dashboard | DakShiksha" description="Manage students, content, and analytics for the DakShiksha GDS Training Platform." />
            <Suspense fallback={<PageFallback />}>
              <AdminDashboard />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="materials"
        element={
          <DashboardLayout sidebarItems={adminSidebarItems} title="Study Materials">
            <SEO title="Study Materials | DakShiksha Admin" description="Upload and manage study materials for GDS exam preparation." />
            <Suspense fallback={<PageFallback />}>
              <AdminStudyMaterials />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="tests"
        element={
          <DashboardLayout sidebarItems={adminSidebarItems} title="Tests Management">
            <SEO title="Tests Management | DakShiksha Admin" description="Create and manage mock tests for GDS exam candidates." />
            <Suspense fallback={<PageFallback />}>
              <AdminTests />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="quiz"
        element={
          <DashboardLayout sidebarItems={adminSidebarItems} title="Quiz Management">
            <SEO title="Quiz Management | DakShiksha Admin" description="Manage quizzes and practice questions for GDS exam preparation." />
            <Suspense fallback={<PageFallback />}>
              <AdminQuiz />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="videos"
        element={
          <DashboardLayout sidebarItems={adminSidebarItems} title="Videos Management">
            <SEO title="Videos Management | DakShiksha Admin" description="Upload and manage video lectures for GDS exam preparation." />
            <Suspense fallback={<PageFallback />}>
              <AdminVideos />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="users"
        element={
          <DashboardLayout sidebarItems={adminSidebarItems} title="Users Management">
            <SEO title="Users Management | DakShiksha Admin" description="Manage student accounts and subscriptions." />
            <Suspense fallback={<PageFallback />}>
              <AdminUsers />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="announcements"
        element={
          <DashboardLayout sidebarItems={adminSidebarItems} title="Announcements">
            <SEO title="Announcements | DakShiksha Admin" description="Post and manage announcements for GDS exam students." />
            <Suspense fallback={<PageFallback />}>
              <AdminAnnouncements />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="analytics"
        element={
          <DashboardLayout sidebarItems={adminSidebarItems} title="Analytics">
            <SEO title="Analytics | DakShiksha Admin" description="View platform usage analytics and student performance data." />
            <Suspense fallback={<PageFallback />}>
              <AdminAnalytics />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="settings"
        element={
          <DashboardLayout sidebarItems={adminSidebarItems} title="Admin Settings">
            <SEO title="Admin Settings | DakShiksha Admin" description="Configure platform preferences, theme, and admin account security." />
            <Suspense fallback={<PageFallback />}>
              <AdminSettings />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="*"
        element={
          <DashboardLayout sidebarItems={adminSidebarItems} title="Admin Dashboard">
            <SEO title="Admin Dashboard | DakShiksha" description="Manage students, content, and analytics for the DakShiksha GDS Training Platform." />
            <Suspense fallback={<PageFallback />}>
              <AdminDashboard />
            </Suspense>
          </DashboardLayout>
        }
      />
    </Routes>
  );
};
