import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, LayoutPanelLeft, Users } from 'lucide-react';
import api from '../../api';

export default function ProfClasses() {
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await api.get('/professor/classes');
        setClasses(response.data);
        if (response.data.length > 0) {
          setActiveClass(response.data[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      if (!activeClass) {
        setStudents([]);
        return;
      }

      try {
        const response = await api.get(`/professor/students/${activeClass.id}`);
        setStudents(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadStudents();
  }, [activeClass]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1300px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <GraduationCap size={32} color="#38bdf8" />
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', letterSpacing: '-1px' }}>Mes classes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Vue professeur des groupes suivis et de leurs effectifs.</p>
        </div>
      </header>

      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement des classes affectees...</div>
      ) : classes.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Aucune classe n'est encore rattachee a votre compte.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem' }}>
          <aside className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem 1rem' }}>
              <LayoutPanelLeft size={20} color="#38bdf8" />
              <strong style={{ color: 'white' }}>Affectations</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {classes.map((classItem) => {
                const isActive = activeClass?.assignment_id === classItem.assignment_id;
                return (
                  <button
                    key={classItem.assignment_id}
                    type="button"
                    onClick={() => setActiveClass(classItem)}
                    style={{
                      textAlign: 'left',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: isActive ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255,255,255,0.05)',
                      background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.02)',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: '800', fontSize: '1rem' }}>{classItem.name}</div>
                    <div style={{ color: '#7dd3fc', marginTop: '0.35rem', fontSize: '0.95rem' }}>{classItem.subject}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.85rem' }}>{classItem.level}</div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.08em' }}>Classe</div>
                  <div style={{ color: 'white', fontSize: '1.6rem', fontWeight: '800', marginTop: '0.35rem' }}>{activeClass?.name}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.08em' }}>Matiere</div>
                  <div style={{ color: '#7dd3fc', fontSize: '1.4rem', fontWeight: '800', marginTop: '0.35rem' }}>{activeClass?.subject}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.08em' }}>Effectif</div>
                  <div style={{ color: 'white', fontSize: '1.6rem', fontWeight: '800', marginTop: '0.35rem' }}>{students.length} eleves</div>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.4rem 1.6rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={20} color="#38bdf8" />
                <strong style={{ color: 'white' }}>Eleves rattaches</strong>
              </div>

              {students.length === 0 ? (
                <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Aucun eleve visible pour cette classe.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', padding: '1.5rem' }}>
                  {students.map((student) => (
                    <article key={student.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'grid', placeItems: 'center' }}>
                          <BookOpen size={18} color="#7dd3fc" />
                        </div>
                        <div>
                      <div style={{ color: 'white', fontWeight: '700' }}>{student.username}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ID interne #{student.id}</div>
                    </div>
                  </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
