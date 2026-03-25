import { useState, useEffect } from 'react';
import { CheckSquare, ChevronDown, ChevronRight, Award, TrendingUp } from 'lucide-react';
import api from '../../api';

export default function GradesView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState({});

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get('/student/grades');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  const toggleSubject = (name) => {
    setExpandedSubjects(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const getGradeColor = (grade) => {
      if (grade === null || grade === undefined) return 'var(--text-secondary)';
      if (grade >= 15) return '#10B981'; // green
      if (grade >= 12) return '#3B82F6'; // blue
      if (grade >= 10) return '#F59E0B'; // yellow
      return '#EF4444'; // red
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <CheckSquare size={32} color="var(--primary)" />
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>Relevé de Notes</h1>
      </header>

      {loading ? (
          <div style={{textAlign:'center', color:'var(--text-secondary)', padding:'4rem', fontWeight: '500'}}>Chargement du dossier scolaire...</div>
      ) : !data || !data.subjects || data.subjects.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Aucune note n'a été répertoriée.</div>
      ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Moyennes Générales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(350px, 1fr)', gap: '1.5rem' }}>
                  <div className="glass-card animate-fade-in" style={{ padding: '2.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(145deg, rgba(79, 70, 229, 0.15), rgba(30, 41, 59, 0.9))', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
                      <div style={{ background: 'rgba(79, 70, 229, 0.2)', padding: '1.25rem', borderRadius: '50%' }}>
                         <Award size={36} color="#818CF8" />
                      </div>
                      <div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Moyenne Générale</div>
                          <div style={{ fontSize: '3rem', fontWeight: '800', color: getGradeColor(data.general_student_average), lineHeight: '1', marginTop: '0.2rem' }}>
                              {data.general_student_average ? data.general_student_average.toFixed(2) : '-'} <span style={{fontSize:'1.2rem', color:'var(--text-secondary)'}}>/20</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="glass-card animate-fade-in" style={{ padding: '2.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '50%' }}>
                         <TrendingUp size={36} color="var(--text-secondary)" />
                      </div>
                      <div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Moyenne de la Classe</div>
                          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', lineHeight: '1', marginTop: '0.2rem' }}>
                              {data.general_class_average ? data.general_class_average.toFixed(2) : '-'} <span style={{fontSize:'1.1rem', color:'var(--text-secondary)'}}>/20</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Détail par Matières interactives */}
              <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                      <div>Matière</div>
                      <div style={{textAlign: 'center'}}>Moy. Élève</div>
                      <div style={{textAlign: 'center'}}>Moy. Classe</div>
                  </div>
                  
                  {data.subjects.map((sub, idx) => {
                      const expanded = expandedSubjects[sub.name] || false;
                      
                      return (
                          <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              {/* Ligne Résumé Matière (Clicable) */}
                              <div className="animate-fade-in" onClick={() => toggleSubject(sub.name)} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '1.5rem 2rem', cursor: 'pointer', transition: 'background 0.2s', background: expanded ? 'rgba(255,255,255,0.03)' : 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background='rgba(255,255,255,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background= expanded ? 'rgba(255,255,255,0.03)' : 'transparent'}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '600', fontSize: '1.1rem' }}>
                                      {expanded ? <ChevronDown size={20} color="var(--primary)" /> : <ChevronRight size={20} color="var(--text-secondary)" />}
                                      {sub.name}
                                  </div>
                                  <div style={{ textAlign: 'center', fontWeight: '800', fontSize: '1.25rem', color: getGradeColor(sub.student_average) }}>
                                      {sub.student_average ? sub.student_average.toFixed(2) : '-'}
                                  </div>
                                  <div style={{ textAlign: 'center', fontWeight: '600', fontSize: '1.15rem', color: 'var(--text-secondary)' }}>
                                      {sub.class_average ? sub.class_average.toFixed(2) : '-'}
                                  </div>
                              </div>
                              
                              {/* Historique Détaillé des Notes */}
                              {expanded && (
                                  <div className="animate-fade-in" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.02)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)' }}>
                                      {sub.grades.map((g, i) => (
                                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: i < sub.grades.length - 1 ? '1px dashed rgba(255,255,255,0.08)' : 'none' }}>
                                              <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{g.date}</div>
                                              <div style={{ flex: 3, fontStyle: 'italic', color: 'var(--text-primary)' }}>"{g.comments}"</div>
                                              <div style={{ flex: 1, textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: getGradeColor(g.grade) }}>
                                                  {g.grade.toFixed(2)}
                                                  <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500'}}>/20</span>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>
      )}
    </div>
  );
}
