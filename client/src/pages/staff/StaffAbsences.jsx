import { useState, useEffect } from 'react';
import api, { fetchCsrfToken } from '../../api';
import { ShieldAlert, Check, AlertCircle, Clock } from 'lucide-react';

export default function StaffAbsences() {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({ student_id: '', date: '', is_late: false, justified: false, comments: '' });
    const [msg, setMsg] = useState(null);
    const [err, setErr] = useState(null);

    useEffect(() => {
        api.get('/staff/students').then(res => {
            setStudents(res.data);
            if(res.data.length > 0) setForm(f => ({...f, student_id: res.data[0].id}));
        }).catch(e => console.error(e));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg(null); setErr(null);
        try {
            await fetchCsrfToken();
            const res = await api.post('/staff/absences', form);
            setMsg(res.data.message);
            setForm({ ...form, is_late: false, justified: false, comments: '' });
        } catch(e) {
            setErr(e.response?.data?.error || "Erreur lors de la déclaration.");
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                <Clock size={32} color="#fbbf24"/>
                <div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>Gestion des Incidents</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Espace Vie Scolaire (CPE) : Bilan disciplinaire et retards</p>
                </div>
            </header>

            <div className="glass-card" style={{ padding: '2.5rem' }}>
                {err && <div className="animate-fade-in" style={{ color: '#fca5a5', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={20}/> {err}</div>}
                {msg && <div className="animate-fade-in" style={{ color: '#6ee7b7', padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}><Check size={20}/> {msg}</div>}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div className="input-group">
                        <label className="input-label" style={{color: '#fbbf24'}}>Recherche Élève (Annuaire de l'établissement)</label>
                        <select className="input-field" value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} required style={{background: 'rgba(0,0,0,0.2)'}}>
                            {students.map(s => <option key={s.id} value={s.id}>{s.username} - ({s.class_name || 'Sans Classe'})</option>)}
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Date effective de l'incident</label>
                        <input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required style={{background: 'rgba(0,0,0,0.2)'}}/>
                    </div>

                    <div style={{display: 'flex', gap: '3rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', cursor: 'pointer', fontWeight: 'bold'}}>
                            <input type="checkbox" checked={form.is_late} onChange={e => setForm({...form, is_late: e.target.checked})} style={{width: '20px', height: '20px', accentColor: '#fbbf24'}} />
                            S'agit-il spécifiquement d'un Retard ?
                        </label>
                        <label style={{display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', cursor: 'pointer', fontWeight: 'bold'}}>
                            <input type="checkbox" checked={form.justified} onChange={e => setForm({...form, justified: e.target.checked})} style={{width: '20px', height: '20px', accentColor: '#34d399'}}/>
                            L'incident a-t-il été formellement Justifié ? (Mot)
                        </label>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Rapport du surveillant / CPE</label>
                        <textarea className="input-field" rows="5" placeholder="Retard de 15 minutes, l'élève a affirmé que son bus est tombé en panne. Passage par l'infirmerie nécessaire..." value={form.comments} onChange={e => setForm({...form, comments: e.target.value})} style={{resize: 'vertical', background: 'rgba(0,0,0,0.2)'}}></textarea>
                    </div>

                    <button type="submit" className="btn" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', padding: '1.25rem', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '1rem' }}>Inscrire au dossier disciplinaire de l'élève</button>
                </form>
            </div>
        </div>
    );
}
