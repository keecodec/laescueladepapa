import { LogOut, Home, Calendar, FileText, CheckSquare, Users, Settings, BookOpen, Clock, Shield } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ user, onLogout }) {
  // Définition conditionnelle du menu selon le rôle RBAC autorisé
  const getNavItems = () => {
    switch(user.role) {
      case 'student':
        return [
          { name: 'Tableau de bord', icon: Home, path: '/' },
          { name: 'Cahier de textes', icon: FileText, path: '/homework' },
          { name: 'Relevé de Notes', icon: CheckSquare, path: '/grades' },
          { name: 'Emploi du temps', icon: Calendar, path: '/schedule' },
          { name: 'Vie Scolaire', icon: Clock, path: '/absences' }
        ];
      case 'professor':
        return [
          { name: 'Tableau de bord', icon: Home, path: '/' },
          { name: 'Cahier de textes', icon: FileText, path: '/homework' },
          { name: 'Saisie des notes', icon: CheckSquare, path: '/grades' },
          { name: 'Mes classes', icon: Users, path: '/classes' },
          { name: 'Emploi du temps', icon: Calendar, path: '/schedule' }
        ];
      case 'staff':
        return [
          { name: 'Tableau de bord', icon: Home, path: '/' },
          { name: 'Gestion Absences', icon: Clock, path: '/absences' },
          { name: 'Sanctions', icon: FileText, path: '/sanctions' },
          { name: 'Vue Globale', icon: Users, path: '/global' }
        ];
      case 'admin':
        return [
          { name: 'Tableau de bord', icon: Home, path: '/' },
          { name: 'Utlisateurs (CRUD)', icon: Users, path: '/users' },
          { name: 'Configuration', icon: Settings, path: '/config' },
          { name: 'Sécurité & Logs', icon: Shield, path: '/audit' }  
        ];
      default: return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="sidebar animate-fade-in" style={{
      width: '280px', background: 'rgba(15, 23, 42, 0.95)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100, backdropFilter: 'blur(10px)'
    }}>
      <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <BookOpen size={28} color="#34d399" />
        <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', color: 'white' }}>Escuela<span style={{color: '#34d399'}}>OS</span></span>
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: '3px solid #6366f1' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Session Active</div>
          <div style={{ color: 'white', fontWeight: '600', marginTop: '0.25rem', fontSize: '1.1rem' }}>{user.username}</div>
          <div style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: '0.25rem', display: 'inline-block', background: 'rgba(79, 70, 229, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>Rôle : {user.role.toUpperCase()}</div>
        </div>

        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.25rem', borderRadius: '8px', color: isActive ? 'white' : 'var(--text-secondary)', background: isActive ? 'linear-gradient(90deg, rgba(79, 70, 229, 0.2), transparent)' : 'transparent', textDecoration: 'none', transition: 'all 0.2s', borderLeft: isActive ? '3px solid #4F46E5' : '3px solid transparent'
            })}
          >
            <item.icon size={20} />
            <span style={{ fontWeight: '500' }}>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600' }}>
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </div>
  );
}
