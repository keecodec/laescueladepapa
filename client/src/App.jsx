import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import PageTransition from './components/ui/PageTransition';
import api from './api';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/admin/Users'));
const AdminConfig = lazy(() => import('./pages/admin/AdminConfig'));
const AuditView = lazy(() => import('./pages/admin/AuditView'));
const HomeworkView = lazy(() => import('./pages/student/HomeworkView'));
const ScheduleView = lazy(() => import('./pages/student/ScheduleView'));
const GradesView = lazy(() => import('./pages/student/GradesView'));
const StudentDiscipline = lazy(() => import('./pages/student/StudentDiscipline'));
const ProfGrades = lazy(() => import('./pages/professor/ProfGrades'));
const ProfHomework = lazy(() => import('./pages/professor/ProfHomework'));
const ProfClasses = lazy(() => import('./pages/professor/ProfClasses'));
const StaffAbsences = lazy(() => import('./pages/staff/StaffAbsences'));
const StaffGlobal = lazy(() => import('./pages/staff/StaffGlobal'));
const StaffSanctions = lazy(() => import('./pages/staff/StaffSanctions'));

function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[200]"
      style={{
        background: 'radial-gradient(ellipse 60% 50% at 20% 20%, rgba(0, 122, 255, 0.10) 0%, transparent 65%), radial-gradient(ellipse 50% 45% at 80% 80%, rgba(88, 86, 214, 0.07) 0%, transparent 65%), #F2F2F7',
      }}
    >
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <Loader2 size={20} style={{ color: '#007AFF' }} className="animate-spin" />
        <p style={{ fontSize: 13, color: 'rgba(60,60,67,0.50)', fontWeight: 500 }}>Chargement…</p>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={24} className="text-primary animate-spin" />
    </div>
  );
}

function AnimatedRoutes({ user, setUser }) {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const { data } = await api.get('/csrf-token');
      api.defaults.headers.common['X-CSRFToken'] = data.csrf_token;
      await api.post('/auth/logout');
    } catch {
      // silent
    }
    setUser(null);
  };

  const ProtectedLayout = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          /* Vivid ambient background — this is what makes liquid glass work */
          background: 'radial-gradient(ellipse 65% 55% at 10% 15%, rgba(0,122,255,0.14) 0%, transparent 60%), radial-gradient(ellipse 55% 50% at 90% 85%, rgba(88,86,214,0.10) 0%, transparent 60%), radial-gradient(ellipse 40% 35% at 55% 50%, rgba(52,199,89,0.06) 0%, transparent 60%), #F0F0F5',
        }}
      >
        <Sidebar user={user} onLogout={handleLogout} />
        <main style={{ flex: 1, minHeight: '100vh' }}>
          <div style={{ padding: '24px 32px', maxWidth: 1600, margin: '0 auto' }}>
            <Suspense fallback={<PageLoader />}>
              <PageTransition key={location.pathname}>
                {children}
              </PageTransition>
            </Suspense>
          </div>
        </main>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          !user ? (
            <Suspense fallback={<LoadingScreen />}>
              <Login onLoginSuccess={setUser} />
            </Suspense>
          ) : <Navigate to="/" />
        } />

        {/* Dashboard */}
        <Route path="/" element={<ProtectedLayout><Dashboard user={user} /></ProtectedLayout>} />

        {/* Polymorphic routes */}
        <Route path="/homework" element={
          <ProtectedLayout>
            {user?.role === 'professor' ? <ProfHomework /> : <HomeworkView />}
          </ProtectedLayout>
        } />
        <Route path="/grades" element={
          <ProtectedLayout>
            {user?.role === 'professor' ? <ProfGrades /> : <GradesView />}
          </ProtectedLayout>
        } />
        <Route path="/schedule" element={
          <ProtectedLayout>
            {user?.role === 'student' || user?.role === 'professor' ? <ScheduleView user={user} /> : <Navigate to="/" />}
          </ProtectedLayout>
        } />
        <Route path="/classes" element={
          <ProtectedLayout>
            {user?.role === 'professor' ? <ProfClasses /> : <Navigate to="/" />}
          </ProtectedLayout>
        } />
        <Route path="/absences" element={
          <ProtectedLayout>
            {user?.role === 'staff' ? <StaffAbsences /> : user?.role === 'student' ? <StudentDiscipline /> : <Navigate to="/" />}
          </ProtectedLayout>
        } />
        <Route path="/sanctions" element={
          <ProtectedLayout>
            {user?.role === 'staff' ? <StaffSanctions /> : <Navigate to="/" />}
          </ProtectedLayout>
        } />
        <Route path="/global" element={
          <ProtectedLayout>
            {user?.role === 'staff' ? <StaffGlobal /> : <Navigate to="/" />}
          </ProtectedLayout>
        } />

        {/* Admin */}
        <Route path="/users" element={
          <ProtectedLayout>
            {user?.role === 'admin' ? <Users /> : <Navigate to="/" />}
          </ProtectedLayout>
        } />
        <Route path="/config" element={
          <ProtectedLayout>
            {user?.role === 'admin' ? <AdminConfig /> : <Navigate to="/" />}
          </ProtectedLayout>
        } />
        <Route path="/audit" element={
          <ProtectedLayout>
            {user?.role === 'admin' ? <AuditView /> : <Navigate to="/" />}
          </ProtectedLayout>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.90)',
            color: 'rgba(0,0,0,0.85)',
            border: '0.5px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
            letterSpacing: '-0.005em',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
            padding: '10px 14px',
          },
          success: { iconTheme: { primary: '#34C759', secondary: '#fff' } },
          error: { iconTheme: { primary: '#FF3B30', secondary: '#fff' } },
        }}
      />
      <AnimatedRoutes user={user} setUser={setUser} />
    </Router>
  );
}
