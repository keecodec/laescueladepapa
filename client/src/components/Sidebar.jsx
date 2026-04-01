import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Home, Calendar, FileText, CheckSquare,
  Users, Settings, BookOpen, Clock, Shield,
  ChevronLeft, ChevronRight, BarChart3,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { roleConfig } from '../lib/theme';
import { cn, getInitials } from '../lib/utils';

const navByRole = {
  student: [
    { name: 'Tableau de bord', icon: Home, path: '/' },
    { name: 'Cahier de textes', icon: FileText, path: '/homework' },
    { name: 'Notes', icon: CheckSquare, path: '/grades' },
    { name: 'Emploi du temps', icon: Calendar, path: '/schedule' },
    { name: 'Vie Scolaire', icon: Clock, path: '/absences' },
  ],
  professor: [
    { name: 'Tableau de bord', icon: Home, path: '/' },
    { name: 'Cahier de textes', icon: FileText, path: '/homework' },
    { name: 'Saisie des notes', icon: CheckSquare, path: '/grades' },
    { name: 'Mes classes', icon: Users, path: '/classes' },
    { name: 'Emploi du temps', icon: Calendar, path: '/schedule' },
  ],
  staff: [
    { name: 'Tableau de bord', icon: Home, path: '/' },
    { name: 'Absences', icon: Clock, path: '/absences' },
    { name: 'Sanctions', icon: FileText, path: '/sanctions' },
    { name: 'Vue Globale', icon: BarChart3, path: '/global' },
  ],
  admin: [
    { name: 'Tableau de bord', icon: Home, path: '/' },
    { name: 'Utilisateurs', icon: Users, path: '/users' },
    { name: 'Configuration', icon: Settings, path: '/config' },
    { name: 'Audit & Sécurité', icon: Shield, path: '/audit' },
  ],
};

const W_EXPANDED = 260;
const W_COLLAPSED = 64;

export default function Sidebar({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const navItems = navByRole[user.role] || [];
  const role = roleConfig[user.role] || roleConfig.student;
  const w = collapsed ? W_COLLAPSED : W_EXPANDED;

  return (
    <>
      {/* Spacer so main content doesn't go under sidebar */}
      <div style={{ width: w, flexShrink: 0, transition: 'width 0.28s cubic-bezier(0.16,1,0.3,1)' }} />

      <motion.aside
        ref={sidebarRef}
        className="fixed top-0 left-0 h-screen z-50 flex flex-col"
        animate={{ width: w }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{
          /* True macOS sidebar: very high saturation blur, almost see-through */
          background: 'rgba(250, 250, 252, 0.72)',
          backdropFilter: 'saturate(300%) blur(40px)',
          WebkitBackdropFilter: 'saturate(300%) blur(40px)',
          borderRight: '0.5px solid rgba(0,0,0,0.08)',
        }}
      >
        {/* ── Logo ── */}
        <div
          className="flex items-center shrink-0 overflow-hidden"
          style={{
            height: 56,
            borderBottom: '0.5px solid rgba(0,0,0,0.06)',
            padding: collapsed ? '0 0 0 18px' : '0 18px',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 30, height: 30,
              borderRadius: 8,
              background: '#007AFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BookOpen size={16} color="white" strokeWidth={2.2} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.16 }}
                style={{
                  fontSize: 16, fontWeight: 600,
                  color: 'rgba(0,0,0,0.85)',
                  whiteSpace: 'nowrap', overflow: 'hidden',
                  letterSpacing: '-0.02em',
                }}
              >
                Escuela<span style={{ color: '#007AFF' }}>OS</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── User ── */}
        <div
          style={{
            padding: '10px 10px',
            borderBottom: '0.5px solid rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex', alignItems: 'center',
              gap: 10,
              padding: collapsed ? '8px 6px' : '8px 8px',
              borderRadius: 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <div
              style={{
                width: 34, height: 34,
                borderRadius: '50%',
                background: role.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'white',
                flexShrink: 0,
              }}
            >
              {getInitials(user.username)}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ overflow: 'hidden', minWidth: 0 }}
                >
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                    {user.username}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(60,60,67,0.45)', marginTop: 1 }}>
                    {role.label}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
          {!collapsed && (
            <p style={{
              fontSize: 11, fontWeight: 600, color: 'rgba(60,60,67,0.35)',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              padding: '6px 10px 8px',
            }}>
              Navigation
            </p>
          )}

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={{ display: 'block', marginBottom: 2 }}
            >
              {({ isActive }) => (
                <div
                  title={collapsed ? item.name : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: collapsed ? '10px 0' : '9px 12px',
                    borderRadius: 9,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: isActive ? 'rgba(0,122,255,0.10)' : 'transparent',
                    transition: 'background 0.12s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <item.icon
                    size={18}
                    strokeWidth={isActive ? 2.0 : 1.7}
                    style={{ color: isActive ? '#007AFF' : 'rgba(60,60,67,0.50)', flexShrink: 0 }}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.14 }}
                        style={{
                          fontSize: 14,
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#007AFF' : 'rgba(0,0,0,0.75)',
                          whiteSpace: 'nowrap',
                          letterSpacing: '-0.01em',
                          overflow: 'hidden',
                        }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom ── */}
        <div style={{ padding: '6px 10px 10px', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
          {/* Collapse */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '9px 0' : '9px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 9, border: 'none', background: 'transparent',
              cursor: 'pointer', transition: 'background 0.12s ease',
              marginBottom: 2,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {collapsed
              ? <ChevronRight size={16} style={{ color: 'rgba(60,60,67,0.40)' }} />
              : <ChevronLeft size={16} style={{ color: 'rgba(60,60,67,0.40)' }} />
            }
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 13, color: 'rgba(60,60,67,0.45)', fontWeight: 400 }}
                >
                  Réduire
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '9px 0' : '9px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 9, border: 'none', background: 'transparent',
              cursor: 'pointer', transition: 'background 0.12s ease, color 0.12s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,59,48,0.07)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={16} style={{ color: 'rgba(60,60,67,0.45)', flexShrink: 0 }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 13, color: 'rgba(60,60,67,0.50)', fontWeight: 400 }}
                >
                  Déconnexion
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
