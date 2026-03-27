import { useState, useEffect } from 'react';
import api, { fetchCsrfToken } from '../../api';
import { Users as UsersIcon, Plus, AlertCircle, ShieldCheck, Trash2, Library } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', role: 'student', class_id: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
         api.get('/admin/users'),
         api.get('/admin/classes')
      ]);
      setUsers(uRes.data);
      setClassesList(cRes.data);
      if (cRes.data.length > 0) {
          setForm(f => ({...f, class_id: cRes.data[0].id}));
      }
    } catch {
      setError("Accès refusé ou instabilité réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await fetchCsrfToken(); // Récupère le CSRF pour parer aux attaques web
      
      const payload = { ...form };
      // Le class_id n'a de sens que pour l'étudiant ou le professeur
      if (payload.role !== 'student' && payload.role !== 'professor') {
          payload.class_id = null;
      }
      
      const res = await api.post('/admin/users', payload);
      setMessage(res.data.message);
      setForm({ username: '', password: '', role: 'student', class_id: classesList.length > 0 ? classesList[0].id : '' });
      fetchData(); // Actualise l'annuaire visuellement
    } catch (err) {
      setError(err.response?.data?.error || "Erreur technique lors de la création");
    }
  };

  const handleDelete = async (id, username) => {
      if (!window.confirm(`Action critique : Voulez-vous vraiment écraser définitivement le compte [${username}] ? Toutes ses données seront effacées (CASCADE).`)) return;
      try {
          await fetchCsrfToken();
          const res = await api.delete(`/admin/users/${id}`);
          setMessage(res.data.message);
          fetchData();
      } catch(err) {
          setError(err.response?.data?.error || "Vous n'avez pas l'autorisation de supprimer ce compte.");
      }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <UsersIcon size={32} color="var(--error)" />
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>Gestion des Utilisateurs</h1>
          <p style={{ color: 'var(--text-secondary)' }}><ShieldCheck size={14}/> Droits Administrateurs (CRUD Avancé)</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem' }}>
        
        {/* Colonne d'Insertion d'utilisateurs */}
        <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '700' }}>
            <Plus size={24} color="var(--success)" /> Ouvrir un compte
          </h2>
          
          {error && <div className="animate-fade-in" style={{ color: '#fca5a5', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={20}/> {error}</div>}
          {message && <div className="animate-fade-in" style={{ color: '#6ee7b7', padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}><ShieldCheck size={20}/> {message}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Identifiant unique (login)</label>
              <input type="text" className="input-field" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required placeholder="Ex: jean.dupont" />
            </div>
            
            <div className="input-group">
              <label className="input-label">Mot de passe fort (chiffré DB)</label>
              <input type="password" className="input-field" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="••••••••"/>
            </div>
            
            <div className="input-group">
              <label className="input-label">Rôle d'Environnement (RBAC)</label>
              <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="student">🎓 Élève</option>
                <option value="professor">👨‍🏫 Professeur</option>
                <option value="staff">📋 Vie Scolaire / CPE</option>
                <option value="admin">🛡️ Administrateur Système</option>
              </select>
            </div>
            
            {/* Attribution académique conditionnelle (SEULEMENT PROFS ET ÉLÈVES) */}
            {(form.role === 'student' || form.role === 'professor') && (
                <div className="input-group animate-fade-in" style={{marginTop: '1rem', padding: '1.25rem', background: 'rgba(52, 211, 153, 0.05)', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.2)'}}>
                  <label className="input-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6ee7b7', fontWeight: 'bold'}}><Library size={16}/> Affectation Académique initiale</label>
                  <select className="input-field" value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})} required>
                    {classesList.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                  </select>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem'}}>L'utilisateur sera directement inclus aux emplois du temps de cette classe.</div>
                </div>
            )}
            
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '1.5rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', fontWeight: 'bold' }}>Déployer l'utilisateur</button>
          </form>
        </div>

        {/* Colonne Visualisation / Datagrid */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Annuaire Opérationnel</h2>
          </div>
          
          <div style={{ overflowX: 'auto', maxHeight: '750px' }}>
            {loading ? (
                <div style={{padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)'}}>Extraction de la base de données RBAC...</div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.80rem', textTransform: 'uppercase', letterSpacing: '1px' }}>ID</th>
                      <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.80rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Identifiant</th>
                      <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.80rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Attribution (Classes)</th>
                      <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.80rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Grade / Rôle RBAC</th>
                      <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.80rem', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Zone de Danger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="animate-fade-in" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>#{u.id}</td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: 'white', fontSize: '1.1rem' }}>{u.username}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.classes || <span style={{opacity:0.5}}>Aucune assignation</span>}</td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ 
                            background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : (u.role === 'professor' ? 'rgba(79, 70, 229, 0.2)' : (u.role === 'staff' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)')),
                            color: u.role === 'admin' ? '#fca5a5' : (u.role === 'professor' ? '#818cf8' : (u.role === 'staff' ? '#fcd34d' : '#6ee7b7')),
                            padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.1)'
                          }}>{u.role}</span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                           <button onClick={() => handleDelete(u.id, u.username)} title="Révoquer le compte" style={{ background:'transparent', border:'none', color:'var(--error)', cursor:'pointer', padding:'0.5rem', display:'inline-flex', alignItems:'center', justifyContent:'center', borderRadius:'8px', transition:'all 0.2s', opacity: 0.7 }} onMouseEnter={e => {e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.opacity=1}} onMouseLeave={e => {e.currentTarget.style.background='transparent'; e.currentTarget.style.opacity=0.7}}>
                               <Trash2 size={20} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
