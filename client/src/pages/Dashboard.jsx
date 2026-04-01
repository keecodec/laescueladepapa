import StudentDashboard from './dashboard/StudentDashboard';
import ProfessorDashboard from './dashboard/ProfessorDashboard';
import StaffDashboard from './dashboard/StaffDashboard';
import AdminDashboard from './dashboard/AdminDashboard';

export default function Dashboard({ user }) {
  switch (user.role) {
    case 'student': return <StudentDashboard />;
    case 'professor': return <ProfessorDashboard />;
    case 'staff': return <StaffDashboard />;
    case 'admin': return <AdminDashboard />;
    default: return <p className="text-text-muted text-center py-16">Role inconnu</p>;
  }
}
