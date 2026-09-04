import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, Users, CheckCircle } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

const features = [
  { icon: BookOpen, text: 'Complete GDS Study Materials' },
  { icon: Trophy, text: 'Mock Tests & Practice Quizzes' },
  { icon: Users, text: 'Live Leaderboard Rankings' },
  { icon: CheckCircle, text: 'Verified Certificates' },
];

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f9fafb' }}>

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden items-center justify-center p-12"
        style={{ background: 'linear-gradient(135deg, #C8102E 0%, #a00d25 60%, #7d0a1c 100%)' }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -96, left: -96, width: 384, height: 384, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -128, right: -96, width: 500, height: 500, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          style={{ position: 'relative', zIndex: 10, color: 'white', maxWidth: 400 }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <div style={{ width: 64, height: 64, background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#C8102E' }}>DS</span>
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: 'white' }}>DakShiksha</h1>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>GDS Training Platform</p>
            </div>
          </div>

          {/* Headline */}
          <h2 style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.2, marginBottom: 16, color: 'white' }}>
            Crack India Post<br />
            <span style={{ color: '#FFD700' }}>GDS Exam</span> with<br />
            Confidence
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 40, fontSize: 15 }}>
            Join thousands of aspirants preparing smarter with expert-curated materials, real exam-pattern tests, and live leaderboards.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {features.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="#FFD700" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'white' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div style={{ width: 40, height: 40, background: '#C8102E', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>DS</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>DakShiksha</span>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
};
