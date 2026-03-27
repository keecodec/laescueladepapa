import { useState, useEffect } from 'react';
import api from '../../api';
import { ShieldAlert, Activity, AlertTriangle, ShieldCheck, UserCheck, Shield } from 'lucide-react';

export default function AuditView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit');
        setLogs(res.data);
      } catch {
        console.error("Problème d'accès à l'API d'audit");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getLogBadge = (action) => {
    if (action === 'LOGIN_SUCCESS') return <span style={{background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}><ShieldCheck size={12} style={{marginRight: '4px', verticalAlign: 'middle'}}/>LOGIN_SUCCESS</span>;
    if (action === 'LOGIN_FAILED') return <span style={{background: 'rgba(248, 113, 113, 0.2)', color: '#f87171', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}><ShieldAlert size={12} style={{marginRight: '4px', verticalAlign: 'middle'}}/>LOGIN_FAILED</span>;
    if (action === 'LOGOUT') return <span style={{background: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>LOGOUT</span>;
    if (action.includes('USER_CREATED')) return <span style={{background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}><UserCheck size={12} style={{marginRight: '4px', verticalAlign: 'middle'}}/>{action}</span>;
    if (action === 'USER_DELETED') return <span style={{background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}><AlertTriangle size={12} style={{marginRight: '4px', verticalAlign: 'middle'}}/>{action}</span>;
    
    // RBAC ou invalides
    return <span style={{background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}><AlertTriangle size={12} style={{marginRight: '4px', verticalAlign: 'middle'}}/>{action}</span>;
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <Activity size={32} color="#818cf8" />
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>Sécurité & Traces d'Audit</h1>
          <p style={{ color: 'var(--text-secondary)' }}><Shield size={14}/> Traçabilité réseau et monitoring des événements d'authentification</p>
        </div>
      </header>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Journal des 100 dernières actions critiques</h2>
        </div>
        
        <div style={{ overflowX: 'auto', maxHeight: '75vh' }}>
          {loading ? (
             <div style={{padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)'}}>Extraction des logs sécurisés...</div>
          ) : (
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>ID Tâche</th>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Date & Heure</th>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Initiateur (User ID)</th>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Cible (Username)</th>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Événement</th>
                    <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem' }}>Adresse IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={idx} className="animate-fade-in" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'default', transition: 'background 0.2s', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'} onMouseLeave={e=>e.currentTarget.style.background=idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>#{log.id}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'white' }}>{log.date}</td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: '500', color: log.user_id === 'N/A' ? 'var(--text-secondary)' : '#e2e8f0' }}>{log.user_id !== 'N/A' ? `u_${log.user_id}` : 'Système / Anonyme'}</td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 'bold', color: log.action === 'LOGIN_FAILED' ? '#fca5a5' : '#818cf8' }}>{log.username_attempt}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>{getLogBadge(log.action)}</td>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{log.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          )}
        </div>
      </div>
    </div>
  );
}
