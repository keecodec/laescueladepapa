import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookOpen, CheckSquare, Calendar, Clock, Users as UsersIcon } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import DataListView from './components/DataListView';
import Users from './pages/admin/Users';
import HomeworkView from './pages/student/HomeworkView';
import ScheduleView from './pages/student/ScheduleView';
import GradesView from './pages/student/GradesView';
import AuditView from './pages/admin/AuditView';
import ProfGrades from './pages/professor/ProfGrades';
import ProfHomework from './pages/professor/ProfHomework';
import StaffAbsences from './pages/staff/StaffAbsences';
import api from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', color: 'var(--text-secondary)' }}>
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p>Initialisation sécurisée du portail...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const ProtectedLayout = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar user={user} onLogout={async () => {
          try {
             const { data } = await api.get('/csrf-token');
             api.defaults.headers.common['X-CSRFToken'] = data.csrf_token;
             await api.post('/auth/logout');
          } catch(e) {}
          setUser(null);
        }} />
        <main style={{ marginLeft: '280px', flex: 1, padding: '2.5rem', overflowY: 'auto', background: 'var(--background)' }}>
          {children}
        </main>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLoginSuccess={setUser} /> : <Navigate to="/" />} />
        
        {/* =====================
            VUES COMMUNES 
        ====================== */}
        <Route path="/" element={<ProtectedLayout><Dashboard user={user} title="Accueil" /></ProtectedLayout>} />
        
        {/* =====================
            VUES POLYMORPHES (CPE / PROF / ELEVE)
        ====================== */}
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
             <ScheduleView user={user} />
          </ProtectedLayout>
        } />

        <Route path="/absences" element={
          <ProtectedLayout>
             {user?.role === 'staff' ? <StaffAbsences /> : (
                 <DataListView title="Vie Scolaire : Bilan Disciplinaire" endpoint="/student/absences" icon={Clock} columns={[
                  {key: 'date', label: 'Date'},
                  {key: 'is_late', label: 'Retard ?'},
                  {key: 'justified', label: 'Billet de justification ?'},
                  {key: 'comments', label: 'Commentaires de la Vie Scolaire'}
                ]} />
             )}
          </ProtectedLayout>
        } />

        {/* =====================
            VUES ADMINSYS 
        ====================== */}
        <Route path="/users" element={<ProtectedLayout><Users /></ProtectedLayout>} />
        <Route path="/audit" element={<ProtectedLayout><AuditView /></ProtectedLayout>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
