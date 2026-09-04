import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Home,
  FileText,
  ClipboardList,
  HelpCircle,
  Video,
  Bookmark,
  User,
  Settings,
  Bell,
  Trophy,
  Award,
  FileCheck,
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { Loading } from '@/components/common/Loading';
import { SEO } from '@/components/common/SEO';

// Lazy-loaded student pages for code splitting
const StudentDashboard = lazy(() => import('@/pages/student/Dashboard').then(m => ({ default: m.StudentDashboard })));
const StudentStudyMaterials = lazy(() => import('@/pages/student/StudyMaterials').then(m => ({ default: m.StudentStudyMaterials })));
const StudentTests = lazy(() => import('@/pages/student/Tests').then(m => ({ default: m.StudentTests })));
const StudentQuiz = lazy(() => import('@/pages/student/Quiz').then(m => ({ default: m.StudentQuiz })));
const StudentVideos = lazy(() => import('@/pages/student/Videos').then(m => ({ default: m.StudentVideos })));
const StudentBookmarks = lazy(() => import('@/pages/student/Bookmarks').then(m => ({ default: m.StudentBookmarks })));
const StudentProfile = lazy(() => import('@/pages/student/Profile').then(m => ({ default: m.StudentProfile })));
const StudentSettings = lazy(() => import('@/pages/student/Settings').then(m => ({ default: m.StudentSettings })));
const StudentNotifications = lazy(() => import('@/pages/student/Notifications').then(m => ({ default: m.StudentNotifications })));
const StudentLeaderboard = lazy(() => import('@/pages/student/Leaderboard').then(m => ({ default: m.StudentLeaderboard })));
const StudentAchievements = lazy(() => import('@/pages/student/Achievements').then(m => ({ default: m.StudentAchievements })));
const StudentCertificates = lazy(() => import('@/pages/student/Certificates').then(m => ({ default: m.StudentCertificates })));

const studentSidebarItems = [
  { icon: <Home />, label: 'Dashboard', path: '/student/dashboard' },
  { icon: <FileText />, label: 'Study Materials', path: '/student/materials' },
  { icon: <ClipboardList />, label: 'Tests', path: '/student/tests' },
  { icon: <HelpCircle />, label: 'Quiz', path: '/student/quiz' },
  { icon: <Video />, label: 'Videos', path: '/student/videos' },
  { icon: <Trophy />, label: 'Leaderboard', path: '/student/leaderboard' },
  { icon: <Award />, label: 'Achievements', path: '/student/achievements' },
  { icon: <FileCheck />, label: 'Certificates', path: '/student/certificates' },
  { icon: <Bell />, label: 'Notifications', path: '/student/notifications' },
  { icon: <Bookmark />, label: 'Bookmarks', path: '/student/bookmarks' },
  { icon: <User />, label: 'Profile', path: '/student/profile' },
  { icon: <Settings />, label: 'Settings', path: '/student/settings' },
];

const PageFallback = () => <Loading />;

export const StudentLayout = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="Student Dashboard">
            <SEO title="My Dashboard | DakShiksha" description="Track your GDS exam preparation progress, upcoming tests, and study materials." />
            <Suspense fallback={<PageFallback />}>
              <StudentDashboard />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="materials"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="Study Materials">
            <SEO title="Study Materials | DakShiksha" description="Access comprehensive study materials for India Post GDS exam preparation." keywords="GDS study materials, India Post exam, postal exam preparation" />
            <Suspense fallback={<PageFallback />}>
              <StudentStudyMaterials />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="tests"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="Tests">
            <SEO title="Mock Tests | DakShiksha" description="Practice with full-length GDS mock tests and track your performance." keywords="GDS mock test, India Post exam test, postal exam practice" />
            <Suspense fallback={<PageFallback />}>
              <StudentTests />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="quiz"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="Quiz Practice">
            <SEO title="Quiz Practice | DakShiksha" description="Sharpen your knowledge with topic-wise quiz practice for GDS exam." />
            <Suspense fallback={<PageFallback />}>
              <StudentQuiz />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="videos"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="Video Lectures">
            <SEO title="Video Lectures | DakShiksha" description="Watch expert video lectures covering all GDS exam topics." />
            <Suspense fallback={<PageFallback />}>
              <StudentVideos />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="leaderboard"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="Leaderboard">
            <SEO title="Leaderboard | DakShiksha" description="See how you rank against other GDS exam aspirants on DakShiksha." />
            <Suspense fallback={<PageFallback />}>
              <StudentLeaderboard />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="achievements"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="Achievements">
            <SEO title="My Achievements | DakShiksha" description="View your learning milestones and badges earned on DakShiksha." />
            <Suspense fallback={<PageFallback />}>
              <StudentAchievements />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="certificates"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="Certificates">
            <SEO title="My Certificates | DakShiksha" description="Download your course completion certificates from DakShiksha." />
            <Suspense fallback={<PageFallback />}>
              <StudentCertificates />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="notifications"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="Notifications">
            <SEO title="Notifications | DakShiksha" description="Stay updated with the latest announcements and alerts from DakShiksha." />
            <Suspense fallback={<PageFallback />}>
              <StudentNotifications />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="bookmarks"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="My Bookmarks">
            <SEO title="My Bookmarks | DakShiksha" description="Access your saved study materials and questions." />
            <Suspense fallback={<PageFallback />}>
              <StudentBookmarks />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="profile"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="My Profile">
            <SEO title="My Profile | DakShiksha" description="Manage your DakShiksha student profile and personal information." />
            <Suspense fallback={<PageFallback />}>
              <StudentProfile />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="settings"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="Settings">
            <SEO title="Settings | DakShiksha" description="Customize your DakShiksha learning experience and account settings." />
            <Suspense fallback={<PageFallback />}>
              <StudentSettings />
            </Suspense>
          </DashboardLayout>
        }
      />
      <Route
        path="*"
        element={
          <DashboardLayout sidebarItems={studentSidebarItems} title="Student Dashboard">
            <SEO title="My Dashboard | DakShiksha" description="Track your GDS exam preparation progress, upcoming tests, and study materials." />
            <Suspense fallback={<PageFallback />}>
              <StudentDashboard />
            </Suspense>
          </DashboardLayout>
        }
      />
    </Routes>
  );
};
