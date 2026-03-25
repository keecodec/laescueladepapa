import { useState, useEffect } from 'react';
import api, { fetchCsrfToken } from '../../api';
import { BookOpen, Check, AlertCircle, Users } from 'lucide-react';

export default function ProfGrades() {
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ grade: '', comments: '' });
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get('/professor/classes').then(res => setClasses(res.data)).catch(e => console.error(e));
  }, []);

  const selectClass = async (cid) => {
    setActiveClass(cid);
    setMsg(null); setErr(null);
    try {
        const res = await api.get(`/professor/students/${cid}`);
        setStudents(res.data);
    } catch(e) {
        setErr("Erreur réseau. Impossible d'afficher la liste d'appel.");
    }
  };

  const handleGrade = async (e, sid) => {
      e.preventDefault();
      setMsg(null); setErr(null);
      try {
          await fetchCsrfToken();
          const p = { student_id: sid, class_id: activeClass, grade: form[`g_${sid}`], comments: form[`c_${sid}`] };
          const res = await api.post('/professor/grades', p);
          setMsg(res.data.message);
          
          setForm(f => ({...f, [`g_${sid}`]: '', [`c_${sid}`]: ''})); // RAZ Ligne
      } catch(e) {
          setErr(e.response?.data?.error || "Erreur lors de la sauvegarde.");
      }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
            <BookOpen size={32} color="#818cf8"/>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>Saisie des Évaluations</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Espace Pédagogique : Grille matricielle de notation par classe</p>
            </div>
        </header>

        {err && <div className="animate-fade-in" style={{ color: '#fca5a5', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={20}/> {err}</div>}
        {msg && <div className="animate-fade-in" style={{ color: '#6ee7b7', padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}><Check size={20}/> {msg}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                <h3 style={{fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Users size={18}/> Vos Classes affectées</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    {classes.map(c => (
                        <button key={c.id} onClick={() => selectClass(c.id)} style={{ padding: '1rem', background: activeClass === c.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.02)', border: activeClass === c.id ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', fontWeight: activeClass === c.id ? 'bold' : 'normal' }}>
                            {c.name} <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block'}}>{c.subject}</span>
                        </button>
                    ))}
                    {classes.length === 0 && <div style={{fontSize:'0.85rem', color: 'var(--text-secondary)'}}>Aucune classe assignée.</div>}
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <h3 style={{fontSize: '1.25rem'}}>Grille de saisie interactive {activeClass ? `(${students.length} Élèves concernés)` : ''}</h3>
                </div>
                {!activeClass ? (
                    <div style={{padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)'}}>Veuillez sélectionner une classe dans le pannel de gauche afin de générer la liste de vos élèves.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <tr>
                                <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Élève</th>
                                <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', width: '150px' }}>Notes Critériées (/20)</th>
                                <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Appréciations & Compétences</th>
                                <th style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', width: '120px', textAlign: 'center' }}>Validation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id} className="animate-fade-in" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                    <td style={{ padding: '1rem 1.25rem', fontWeight: 'bold', fontSize: '1.05rem', color: 'white' }}>{s.username}</td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <input type="number" min="0" max="20" step="0.5" className="input-field" placeholder="Ex: 14.5" value={form[`g_${s.id}`] || ''} onChange={e => setForm({...form, [`g_${s.id}`]: e.target.value})} style={{width: '100%', borderColor: form[`g_${s.id}`] ? '#6366f1' : 'rgba(255,255,255,0.1)'}}/>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <input type="text" className="input-field" placeholder="Travail sérieux et régulier..." value={form[`c_${s.id}`] || ''} onChange={e => setForm({...form, [`c_${s.id}`]: e.target.value})} style={{width: '100%'}}/>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                                        <button onClick={(e) => handleGrade(e, s.id)} disabled={!form[`g_${s.id}`]} style={{background: form[`g_${s.id}`] ? '#10b981' : 'transparent', border: form[`g_${s.id}`] ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)', color: form[`g_${s.id}`] ? 'white' : 'var(--text-secondary)', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: form[`g_${s.id}`] ? 'pointer' : 'not-allowed', fontWeight: 'bold', transition: 'all 0.2s', width: '100%'}}>
                                            OK
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
  );
}
