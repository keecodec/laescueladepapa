import { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, ShieldAlert } from 'lucide-react';
import api from '../../api';

export default function StudentDiscipline() {
  const [absences, setAbsences] = useState([]);
  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiscipline = async () => {
      try {
        const [absencesResponse, sanctionsResponse] = await Promise.all([
          api.get('/student/absences'),
          api.get('/student/sanctions'),
        ]);
        setAbsences(absencesResponse.data);
        setSanctions(sanctionsResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDiscipline();
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <Clock3 size={32} color="#f59e0b" />
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', letterSpacing: '-1px' }}>Vie scolaire</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Absences, retards et dossier disciplinaire visibles sur une seule page.</p>
        </div>
      </header>

      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement du dossier vie scolaire...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.35rem 1.6rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Clock3 size={20} color="#f59e0b" />
              <strong style={{ color: 'white' }}>Absences et retards</strong>
            </div>

            {absences.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun incident de presence dans votre dossier.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {absences.map((absence, index) => (
                  <article key={`${absence.date}-${index}`} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <div style={{ color: 'white', fontWeight: '700' }}>{absence.is_late ? 'Retard' : 'Absence'}</div>
                        <div style={{ color: absence.justified ? '#6ee7b7' : '#fca5a5', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                          {absence.justified ? 'Justifie' : 'A regulariser'}
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontWeight: '700' }}>{absence.date}</div>
                    </div>
                    {absence.comments && <div style={{ color: 'var(--text-secondary)', marginTop: '0.6rem', lineHeight: 1.5 }}>{absence.comments}</div>}
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.35rem 1.6rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldAlert size={20} color="#fb7185" />
              <strong style={{ color: 'white' }}>Sanctions</strong>
            </div>

            {sanctions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Aucune sanction enregistree dans votre dossier.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {sanctions.map((sanction, index) => (
                  <article key={`${sanction.type}-${sanction.date}-${index}`} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <div style={{ color: '#fb7185', fontWeight: '800' }}>{sanction.type}</div>
                      <div style={{ color: 'var(--text-secondary)', fontWeight: '700' }}>{sanction.date}</div>
                    </div>
                    <div style={{ color: 'white', marginTop: '0.6rem', lineHeight: 1.5 }}>{sanction.reason}</div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && sanctions.length > 0 && (
        <div className="glass-card" style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', border: '1px solid rgba(251, 113, 133, 0.25)', background: 'rgba(251, 113, 133, 0.08)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <AlertTriangle size={20} color="#fb7185" />
          <div style={{ color: 'white' }}>Votre dossier contient des sanctions. Un echange avec la vie scolaire peut etre necessaire.</div>
        </div>
      )}
    </div>
  );
}
