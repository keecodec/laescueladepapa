import { useState, useEffect } from 'react';
import api, { fetchCsrfToken } from '../../api';
import { FileText, Check, AlertCircle, Calendar } from 'lucide-react';

export default function ProfHomework() {
    const [classes, setClasses] = useState([]);
    const [form, setForm] = useState({ class_id: '', date_due: '', content: '' });
    const [msg, setMsg] = useState(null);
    const [err, setErr] = useState(null);

    useEffect(() => {
        api.get('/professor/classes').then(res => {
            setClasses(res.data);
            if(res.data.length > 0) setForm(f => ({...f, class_id: res.data[0].id}));
        }).catch(e => console.error(e));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg(null); setErr(null);
        try {
            await fetchCsrfToken();
            const res = await api.post('/professor/homework', form);
            setMsg(res.data.message);
            setForm({ ...form, content: '' }); 
        } catch(err) {
            setErr(err.response?.data?.error || "Erreur de connexion avec le serveur.");
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                <FileText size={32} color="#f43f5e"/>
                <div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>Cahier de Textes</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Espace Pédagogique : Programmation du travail à faire</p>
                </div>
            </header>

            <div className="glass-card" style={{ padding: '2.5rem' }}>
                {err && <div className="animate-fade-in" style={{ color: '#fca5a5', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={20}/> {err}</div>}
                {msg && <div className="animate-fade-in" style={{ color: '#6ee7b7', padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}><Check size={20}/> {msg}</div>}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div className="input-group">
                        <label className="input-label">Classe Ciblée / Groupe d'élèves</label>
                        <select className="input-field" value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})} required style={{background: 'rgba(0,0,0,0.2)'}}>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.subject})</option>)}
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f43f5e'}}><Calendar size={16}/> Pour le : (Date d'échéance)</label>
                        <input type="date" className="input-field" value={form.date_due} onChange={e => setForm({...form, date_due: e.target.value})} required style={{background: 'rgba(0,0,0,0.2)'}}/>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Contenu de la séance et travail à accomplir</label>
                        <textarea className="input-field" rows="8" placeholder="Ex: Faire les exercices 1 à 4 page 122. Réviser le chapitre 3 sur l'Histoire Géographie en vue d'une évaluation continue..." value={form.content} onChange={e => setForm({...form, content: e.target.value})} required style={{resize: 'vertical', background: 'rgba(0,0,0,0.2)'}}></textarea>
                    </div>

                    <button type="submit" className="btn" style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', color: 'white', border: 'none', padding: '1.25rem', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '1rem' }}>Publier de manière permanente sur le Cahier</button>
                </form>
            </div>
        </div>
    );
}
