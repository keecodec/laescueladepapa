import { useState, useEffect } from 'react';
import { Shield, BookOpen, Clock, Calendar, CheckCircle, Award } from 'lucide-react';
import api from '../api';

export default function Dashboard({ user, title = "Tableau de Bord" }) {
  const [schedule, setSchedule] = useState([]);
  const [homework, setHomework] = useState([]);
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(user.role === 'student');

  useEffect(() => {
    if (user.role === 'student') {
      const fetchDashboardData = async () => {
        try {
          // Appel en parallèle de l'ensemble des Data Sources (Optimisation réseau)
          const [sRes, hRes, gRes] = await Promise.all([
            api.get('/student/schedule'),
            api.get('/student/homework'),
            api.get('/student/grades')
          ]);
          setSchedule(sRes.data);
          setHomework(hRes.data);
          setGrades(gRes.data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchDashboardData();
    }
  }, [user.role]);

  const renderStudentDashboard = () => {
    if (loading) return <div style={{padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)'}}>Synchronisation avec l'établissement...</div>;
    
    // Filtre agenda du jour (Lundi simulé si aucun cours aujourd'hui pour garder l'interface vivante)
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    let todayStr = days[new Date().getDay()];
    let todaySchedule = schedule.filter(s => s.day_of_week === todayStr);
    
    // Démo : si on est le week-end, afficher les cours de lundi par défaut pour la démo visuelle
    if (todaySchedule.length === 0) {
        todayStr = "Lundi";
        todaySchedule = schedule.filter(s => s.day_of_week === "Lundi");
    }

    // Récupération des 3 prochains devoirs
    const nextHomework = homework.slice(0, 3);
    
    // Construction des 3 dernières notes du carnet
    let lastGrades = [];
    if (grades && grades.subjects) {
       grades.subjects.forEach(sub => {
           sub.grades.forEach(g => {
               lastGrades.push({ ...g, subject: sub.name });
           });
       });
       // Tri décroissant basé sur 'DD/MM/YYYY'
       lastGrades.sort((a,b) => {
           const [ad,am,ay] = a.date.split('/');
           const [bd,bm,by] = b.date.split('/');
           return new Date(by,bm-1,bd) - new Date(ay,am-1,ad);
       });
       lastGrades = lastGrades.slice(0, 3);
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(500px, 7fr) 3fr', gap: '2rem' }}>
        
        {/* Colonne Principale Interactive */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(79, 70, 229, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Calendar size={24} color="var(--primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Emploi du temps - {todayStr}</h2>
              </div>
            </div>
            
            <div style={{ padding: '2rem' }}>
              {todaySchedule.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun cours aujourd'hui.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {todaySchedule.map((s, i) => (
                    <div className="animate-fade-in" key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem 1.25rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)', alignItems: 'center' }}>
                      <div style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '1rem', letterSpacing: '0.5px' }}>{s.start_time}<br/>{s.end_time}</div>
                      <div>
                        <strong style={{ display: 'block', fontSize: '1.1rem', color: 'white', marginBottom: '0.25rem' }}>{s.subject}</strong>
                        <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><BookOpen size={14}/> Salle {s.room}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>M. {s.professor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.05), transparent)' }}>
              <CheckCircle size={24} color="var(--success)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Travail à faire récemment</h2>
            </div>
            
            <div style={{ padding: '2rem' }}>
              {nextHomework.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun devoir à venir.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr)', gap: '1rem' }}>
                  {nextHomework.map((h, i) => (
                    <div className="animate-fade-in" key={i} style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid var(--success)' }}>
                      <div style={{ width: '85px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 0.5rem', borderRadius: '8px', height: 'fit-content' }}>
                         <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Pour le</div>
                         <strong style={{ display: 'block', color: 'white', marginTop: '0.2rem', fontSize: '1.1rem' }}>{h.date_due.substring(0,5)}</strong>
                      </div>
                      <div style={{flex: 1}}>
                        <strong style={{ display: 'block', color: '#6ee7b7', marginBottom: '0.4rem', fontSize: '1.1rem' }}>{h.subject}</strong>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{h.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne Secondaire (Analytique) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'linear-gradient(145deg, rgba(30, 41, 59, 1), rgba(15, 23, 42, 1))' }}>
              <Award size={22} color="#F59E0B" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Dernières Notes</h2>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               {lastGrades.map((g, i) => (
                   <div className="animate-fade-in" key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: i < lastGrades.length-1 ? '1px dashed rgba(255,255,255,0.1)' : 'none' }}>
                       <div>
                           <strong style={{ display: 'block', fontSize: '1rem', color: '#818CF8' }}>{g.subject}</strong>
                           <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{g.date}</span>
                       </div>
                       <div style={{ fontSize: '1.3rem', fontWeight: '800', color: g.grade >= 12 ? 'var(--success)' : (g.grade >= 10 ? '#F59E0B' : 'var(--error)') }}>
                           {g.grade.toFixed(2)}<span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500'}}>/20</span>
                       </div>
                   </div>
               ))}
               
               <div style={{ marginTop: '0.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                   <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Moyenne Générale</div>
                   <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginTop: '0.25rem' }}>{grades?.general_student_average?.toFixed(2) || '-'}</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDefaultDashboard = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)' }}>
              <BookOpen size={24} color="var(--secondary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Écran de Synthèse ({user.role})</h2>
            </div>
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                 <p>Cet espace est en cours d'aménagement pour les équipes pédagogiques.</p>
                 <p style={{marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.8}}>Utilisez le panneau latéral pour naviguer dans l'application.</p>
            </div>
          </div>
        </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Central */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>{title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} color="var(--success)"/> Identification RBAC forte • Session active
          </p>
        </div>
      </header>

      {user.role === 'student' ? renderStudentDashboard() : renderDefaultDashboard()}

    </div>
  );
}
