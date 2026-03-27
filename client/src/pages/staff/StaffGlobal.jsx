import { useEffect, useState } from 'react';
import { Clock3, ShieldAlert, Users } from 'lucide-react';
import api from '../../api';

export default function StaffGlobal() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const response = await api.get('/staff/dashboard');
        setData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const metrics = data?.metrics || {};

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1300px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <Users size={32} color="#38bdf8" />
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', letterSpacing: '-1px' }}>Vue globale</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Poste de supervision vie scolaire avec incidents, sanctions et eleves a suivre.</p>
        </div>
      </header>

      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement de la supervision globale...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              ['Absences', metrics.absences_total || 0, '#f59e0b'],
              ['Non justifiees', metrics.unjustified_total || 0, '#ef4444'],
              ['Sanctions', metrics.sanctions_total || 0, '#fb7185'],
              ['Incidents du jour', metrics.incidents_today || 0, '#38bdf8'],
            ].map(([label, value, color]) => (
              <div key={label} className="glass-card" style={{ padding: '1.4rem', border: `1px solid ${color}33` }}>
                <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.08em', fontWeight: '700' }}>{label}</div>
                <div style={{ color: 'white', fontWeight: '800', fontSize: '2rem', marginTop: '0.35rem' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.9fr', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock3 size={18} color="#f59e0b" />
                <strong style={{ color: 'white' }}>Journal des absences</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {data?.recent_absences?.map((absence, index) => (
                  <article key={`${absence.student_username}-${index}`} style={{ padding: '1rem 1.3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: 'white', fontWeight: '700' }}>{absence.student_username}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.9rem' }}>{absence.class_name || 'Sans classe'} · {absence.date}</div>
                    <div style={{ color: absence.justified ? '#6ee7b7' : '#fca5a5', marginTop: '0.35rem', fontSize: '0.88rem' }}>{absence.is_late ? 'Retard' : 'Absence'} · {absence.justified ? 'Justifiee' : 'A regulariser'}</div>
                  </article>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldAlert size={18} color="#fb7185" />
                <strong style={{ color: 'white' }}>Registre des sanctions</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {data?.recent_sanctions?.map((sanction, index) => (
                  <article key={`${sanction.student_username}-${index}`} style={{ padding: '1rem 1.3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#fb7185', fontWeight: '800' }}>{sanction.type}</div>
                    <div style={{ color: 'white', marginTop: '0.25rem', fontWeight: '700' }}>{sanction.student_username}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.9rem' }}>{sanction.class_name || 'Sans classe'} · {sanction.date}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.45rem', lineHeight: 1.5 }}>{sanction.reason}</div>
                  </article>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={18} color="#38bdf8" />
                <strong style={{ color: 'white' }}>Priorites de suivi</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {data?.top_students?.map((student, index) => (
                  <article key={`${student.username}-${index}`} style={{ padding: '1rem 1.3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: 'white', fontWeight: '700' }}>{student.username}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.9rem' }}>{student.class_name || 'Sans classe'}</div>
                    <div style={{ color: '#7dd3fc', marginTop: '0.45rem', fontWeight: '800' }}>{student.incidents_total} incidents</div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
