import { useEffect, useState } from 'react';
import { AlertCircle, Check, FileWarning, ShieldBan } from 'lucide-react';
import api, { fetchCsrfToken } from '../../api';

const SANCTION_TYPES = ['Observation', 'Avertissement', 'Retenue', 'Exclusion'];

export default function StaffSanctions() {
  const [students, setStudents] = useState([]);
  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    student_id: '',
    type: SANCTION_TYPES[0],
    date: '',
    reason: '',
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsResponse, sanctionsResponse] = await Promise.all([
          api.get('/staff/students'),
          api.get('/staff/sanctions'),
        ]);
        setStudents(studentsResponse.data);
        setSanctions(sanctionsResponse.data);
        if (studentsResponse.data.length > 0) {
          setForm((current) => ({ ...current, student_id: String(studentsResponse.data[0].id) }));
        }
      } catch (requestError) {
        console.error(requestError);
        setError("Impossible de charger le registre disciplinaire.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await fetchCsrfToken();
      const response = await api.post('/staff/sanctions', form);
      setMessage(response.data.message);
      const sanctionsResponse = await api.get('/staff/sanctions');
      setSanctions(sanctionsResponse.data);
      setForm((current) => ({ ...current, reason: '', date: '' }));
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Erreur lors de l'enregistrement de la sanction.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(360px, 420px) 1fr', gap: '2rem' }}>
      <section>
        <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
          <ShieldBan size={32} color="#f97316" />
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-1px' }}>Sanctions</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Registre disciplinaire de la vie scolaire.</p>
          </div>
        </header>

        <div className="glass-card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ color: '#fca5a5', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <AlertCircle size={20} /> {error}
            </div>
          )}
          {message && (
            <div style={{ color: '#6ee7b7', padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <Check size={20} /> {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="input-group">
              <label className="input-label">Eleve concerne</label>
              <select
                className="input-field"
                value={form.student_id}
                onChange={(event) => setForm({ ...form, student_id: event.target.value })}
                required
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.username} ({student.class_name || 'Sans classe'})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Type de sanction</label>
              <select
                className="input-field"
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value })}
                required
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                {SANCTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Date</label>
              <input
                type="date"
                className="input-field"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                required
                style={{ background: 'rgba(0,0,0,0.2)' }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Motif</label>
              <textarea
                className="input-field"
                rows="6"
                value={form.reason}
                onChange={(event) => setForm({ ...form, reason: event.target.value })}
                placeholder="Ex: comportement perturbateur repete en classe, retenue decidee avec information du responsable legal."
                required
                style={{ resize: 'vertical', background: 'rgba(0,0,0,0.2)' }}
              />
            </div>

            <button type="submit" className="btn" style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)', color: 'white', border: 'none', padding: '1rem', fontSize: '1rem', fontWeight: '700' }}>
              Ajouter au dossier disciplinaire
            </button>
          </form>
        </div>
      </section>

      <section>
        <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
          <FileWarning size={28} color="#fb7185" />
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Historique recent</h2>
            <p style={{ color: 'var(--text-secondary)' }}>50 dernieres sanctions enregistrees.</p>
          </div>
        </header>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement du registre disciplinaire...</div>
          ) : sanctions.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Aucune sanction enregistree pour le moment.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sanctions.map((sanction) => (
                <article key={sanction.id} style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '170px 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ color: '#fb7185', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.85rem' }}>{sanction.type}</div>
                    <div style={{ color: 'white', fontWeight: '700', marginTop: '0.25rem' }}>{sanction.student_username}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.9rem' }}>{sanction.class_name || 'Sans classe'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'white', lineHeight: 1.5 }}>{sanction.reason}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                      {sanction.date} · saisi par {sanction.staff_username}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
