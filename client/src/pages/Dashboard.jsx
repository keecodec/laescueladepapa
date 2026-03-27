import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock3,
  GraduationCap,
  Shield,
  ShieldAlert,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import api from '../api';

function MetricCard({ label, value, accent = 'var(--primary)', icon }) {
  const Icon = icon;
  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        border: `1px solid ${accent}33`,
        background: `linear-gradient(145deg, ${accent}22, rgba(15, 23, 42, 0.85))`,
      }}
    >
      <div style={{ background: `${accent}22`, padding: '0.9rem', borderRadius: '16px' }}>
        <Icon size={24} color={accent} />
      </div>
      <div>
        <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.78rem', fontWeight: '700' }}>{label}</div>
        <div style={{ color: 'white', fontWeight: '800', fontSize: '1.8rem', marginTop: '0.2rem' }}>{value}</div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, icon, accent = 'var(--primary)', children }) {
  const Icon = icon;
  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.35rem 1.6rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'rgba(255,255,255,0.02)' }}>
        <Icon size={20} color={accent} />
        <div>
          <div style={{ color: 'white', fontWeight: '700' }}>{title}</div>
          {subtitle && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  );
}

function EmptyState({ message }) {
  return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>{message}</div>;
}

export default function Dashboard({ user, title = 'Tableau de Bord' }) {
  const [schedule, setSchedule] = useState([]);
  const [homework, setHomework] = useState([]);
  const [grades, setGrades] = useState(null);
  const [roleData, setRoleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        if (user.role === 'student') {
          const [scheduleResponse, homeworkResponse, gradesResponse] = await Promise.all([
            api.get('/student/schedule'),
            api.get('/student/homework'),
            api.get('/student/grades'),
          ]);
          setSchedule(scheduleResponse.data);
          setHomework(homeworkResponse.data);
          setGrades(gradesResponse.data);
          setRoleData(null);
        } else {
          const endpointByRole = {
            admin: '/admin/dashboard',
            professor: '/professor/dashboard',
            staff: '/staff/dashboard',
          };
          const response = await api.get(endpointByRole[user.role]);
          setRoleData(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user.role]);

  const renderStudentDashboard = () => {
    if (loading) {
      return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Synchronisation avec l'etablissement...</div>;
    }

    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    let todayStr = days[new Date().getDay()];
    let todaySchedule = schedule.filter((item) => item.day_of_week === todayStr);

    if (todaySchedule.length === 0) {
      todayStr = 'Lundi';
      todaySchedule = schedule.filter((item) => item.day_of_week === 'Lundi');
    }

    const nextHomework = homework.slice(0, 3);
    let lastGrades = [];

    if (grades?.subjects) {
      grades.subjects.forEach((subject) => {
        subject.grades.forEach((grade) => {
          lastGrades.push({ ...grade, subject: subject.name });
        });
      });

      lastGrades.sort((left, right) => {
        const [leftDay, leftMonth, leftYear] = left.date.split('/');
        const [rightDay, rightMonth, rightYear] = right.date.split('/');
        return new Date(rightYear, rightMonth - 1, rightDay) - new Date(leftYear, leftMonth - 1, leftDay);
      });
      lastGrades = lastGrades.slice(0, 3);
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(520px, 7fr) 3fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Panel title={`Emploi du temps - ${todayStr}`} subtitle="Vos prochains cours visibles des la connexion." icon={Calendar}>
            {todaySchedule.length === 0 ? (
              <EmptyState message="Aucun cours visible aujourd'hui." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {todaySchedule.map((item, index) => (
                  <div key={`${item.subject}-${item.start_time}-${index}`} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem 1.25rem', borderRadius: '10px', borderLeft: '4px solid var(--primary)', alignItems: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{item.start_time}<br />{item.end_time}</div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.05rem', color: 'white' }}>{item.subject}</strong>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>Salle {item.room} · {item.professor}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Travail a rendre" subtitle="Les trois prochaines echeances du cahier de textes." icon={BookOpen} accent="#34d399">
            {nextHomework.length === 0 ? (
              <EmptyState message="Aucun devoir a rendre pour le moment." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {nextHomework.map((task, index) => (
                  <article key={`${task.subject}-${task.date_due}-${index}`} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem 1.2rem', borderLeft: '4px solid #34d399' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'start' }}>
                      <div>
                        <div style={{ color: '#6ee7b7', fontWeight: '800' }}>{task.subject}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>{task.content}</div>
                      </div>
                      <div style={{ color: 'white', fontWeight: '700', whiteSpace: 'nowrap' }}>{task.date_due}</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <MetricCard label="Moyenne generale" value={grades?.general_student_average?.toFixed(2) || '-'} icon={Award} accent="#818cf8" />
          <MetricCard label="Moyenne de classe" value={grades?.general_class_average?.toFixed(2) || '-'} icon={TrendingUp} accent="#f59e0b" />

          <Panel title="Dernieres notes" subtitle="Dernieres evaluations visibles dans votre dossier." icon={CheckCircle} accent="#f59e0b">
            {lastGrades.length === 0 ? (
              <EmptyState message="Aucune note enregistree." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {lastGrades.map((grade, index) => (
                  <div key={`${grade.subject}-${grade.date}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1rem', borderBottom: index < lastGrades.length - 1 ? '1px dashed rgba(255,255,255,0.08)' : 'none' }}>
                    <div>
                      <strong style={{ color: '#818cf8', display: 'block' }}>{grade.subject}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{grade.date}</span>
                    </div>
                    <div style={{ color: grade.grade >= 12 ? 'var(--success)' : grade.grade >= 10 ? '#f59e0b' : 'var(--error)', fontWeight: '800', fontSize: '1.2rem' }}>
                      {grade.grade.toFixed(2)}<span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '500' }}>/20</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    );
  };

  const renderProfessorDashboard = () => {
    const metrics = roleData?.metrics || {};

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
          <MetricCard label="Classes suivies" value={metrics.classes_total || 0} icon={GraduationCap} accent="#38bdf8" />
          <MetricCard label="Eleves visibles" value={metrics.students_total || 0} icon={Users} accent="#34d399" />
          <MetricCard label="Notes saisies" value={metrics.grades_total || 0} icon={CheckCircle} accent="#818cf8" />
          <MetricCard label="Devoirs publies" value={metrics.homework_total || 0} icon={BookOpen} accent="#f43f5e" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          <Panel title="Prochains cours" subtitle="Vue synthetique de vos sequences pedagogiques." icon={Calendar} accent="#38bdf8">
            {roleData?.next_courses?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {roleData.next_courses.map((course, index) => (
                  <div key={`${course.class_name}-${course.subject}-${index}`} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem 1.1rem', display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                    <div style={{ color: '#7dd3fc', fontWeight: '800' }}>{course.day_of_week}<br /><span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{course.start_time}</span></div>
                    <div>
                      <div style={{ color: 'white', fontWeight: '800' }}>{course.subject}</div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{course.class_name} · Salle {course.room}</div>
                      <div style={{ color: '#94a3b8', marginTop: '0.25rem', fontSize: '0.85rem' }}>Semaine {course.week_type || 'Toutes'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Aucun cours assigne pour le moment." />
            )}
          </Panel>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Panel title="Dernieres notes saisies" subtitle="Suivi rapide de vos derniers enregistrements." icon={Award} accent="#818cf8">
              {roleData?.recent_grades?.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {roleData.recent_grades.map((grade, index) => (
                    <div key={`${grade.student_username}-${grade.date}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderBottom: index < roleData.recent_grades.length - 1 ? '1px dashed rgba(255,255,255,0.08)' : 'none', paddingBottom: '0.9rem' }}>
                      <div>
                        <div style={{ color: 'white', fontWeight: '700' }}>{grade.student_username}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{grade.subject} · {grade.date}</div>
                      </div>
                      <div style={{ color: '#818cf8', fontWeight: '800' }}>{grade.grade}/20</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="Aucune note saisie pour le moment." />
              )}
            </Panel>

            <Panel title="Derniers devoirs publies" subtitle="Vos derniers contenus de cahier de textes." icon={Clock3} accent="#f43f5e">
              {roleData?.recent_homework?.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {roleData.recent_homework.map((task, index) => (
                    <article key={`${task.class_name}-${task.date_due}-${index}`} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                      <div style={{ color: '#fb7185', fontWeight: '800' }}>{task.class_name} · {task.subject}</div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>{task.content}</div>
                      <div style={{ color: 'white', marginTop: '0.5rem', fontWeight: '700' }}>Pour le {task.date_due}</div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState message="Aucun devoir publie pour le moment." />
              )}
            </Panel>
          </div>
        </div>
      </div>
    );
  };

  const renderStaffDashboard = () => {
    const metrics = roleData?.metrics || {};

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
          <MetricCard label="Absences" value={metrics.absences_total || 0} icon={Clock3} accent="#f59e0b" />
          <MetricCard label="Non justifiees" value={metrics.unjustified_total || 0} icon={AlertTriangle} accent="#ef4444" />
          <MetricCard label="Sanctions" value={metrics.sanctions_total || 0} icon={ShieldAlert} accent="#fb7185" />
          <MetricCard label="Incidents du jour" value={metrics.incidents_today || 0} icon={Shield} accent="#38bdf8" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.9fr', gap: '2rem' }}>
          <Panel title="Absences recentes" subtitle="Derniers signalements en vie scolaire." icon={Clock3} accent="#f59e0b">
            {roleData?.recent_absences?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {roleData.recent_absences.map((absence, index) => (
                  <div key={`${absence.student_username}-${absence.date}-${index}`} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ color: 'white', fontWeight: '800' }}>{absence.student_username}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{absence.class_name || 'Sans classe'} · {absence.date}</div>
                    <div style={{ color: absence.justified ? '#6ee7b7' : '#fca5a5', marginTop: '0.4rem', fontSize: '0.88rem' }}>
                      {absence.is_late ? 'Retard' : 'Absence'} · {absence.justified ? 'Justifiee' : 'A regulariser'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Aucun incident de presence enregistre." />
            )}
          </Panel>

          <Panel title="Sanctions recentes" subtitle="Registre disciplinaire actualise." icon={ShieldAlert} accent="#fb7185">
            {roleData?.recent_sanctions?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {roleData.recent_sanctions.map((sanction, index) => (
                  <div key={`${sanction.student_username}-${sanction.date}-${index}`} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ color: '#fb7185', fontWeight: '800' }}>{sanction.type}</div>
                    <div style={{ color: 'white', marginTop: '0.25rem', fontWeight: '700' }}>{sanction.student_username}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>{sanction.class_name || 'Sans classe'} · {sanction.date}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.45rem', lineHeight: 1.5 }}>{sanction.reason}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Aucune sanction enregistree." />
            )}
          </Panel>

          <Panel title="Eleves a suivre" subtitle="Ceux qui concentrent le plus d'incidents." icon={Users} accent="#38bdf8">
            {roleData?.top_students?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {roleData.top_students.map((student, index) => (
                  <div key={`${student.username}-${index}`} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <div style={{ color: 'white', fontWeight: '700' }}>{student.username}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.9rem' }}>{student.class_name || 'Sans classe'}</div>
                      </div>
                      <div style={{ color: '#7dd3fc', fontWeight: '800' }}>{student.incidents_total}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Aucun eleve critique a signaler." />
            )}
          </Panel>
        </div>
      </div>
    );
  };

  const renderAdminDashboard = () => {
    const metrics = roleData?.metrics || {};

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '1rem' }}>
          <MetricCard label="Utilisateurs" value={metrics.users_total || 0} icon={Users} accent="#ef4444" />
          <MetricCard label="Eleves" value={metrics.students_total || 0} icon={GraduationCap} accent="#34d399" />
          <MetricCard label="Professeurs" value={metrics.professors_total || 0} icon={BookOpen} accent="#818cf8" />
          <MetricCard label="Vie scolaire" value={metrics.staff_total || 0} icon={Shield} accent="#f59e0b" />
          <MetricCard label="Classes" value={metrics.classes_total || 0} icon={Calendar} accent="#38bdf8" />
          <MetricCard label="Matieres" value={metrics.subjects_total || 0} icon={Award} accent="#fb7185" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <Panel title="Derniers comptes crees" subtitle="Vue de controle des ouvertures recentes." icon={UserRound} accent="#ef4444">
            {roleData?.recent_users?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {roleData.recent_users.map((account, index) => (
                  <div key={`${account.username}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingBottom: '0.85rem', borderBottom: index < roleData.recent_users.length - 1 ? '1px dashed rgba(255,255,255,0.08)' : 'none' }}>
                    <div>
                      <div style={{ color: 'white', fontWeight: '700' }}>{account.username}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{account.created_at}</div>
                    </div>
                    <div style={{ color: '#fca5a5', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.8rem' }}>{account.role}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Aucun compte recent a afficher." />
            )}
          </Panel>

          <Panel title="Derniers evenements de securite" subtitle="Apercu rapide des traces d'audit." icon={ShieldAlert} accent="#f59e0b">
            {roleData?.recent_audits?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {roleData.recent_audits.map((audit, index) => (
                  <div key={`${audit.action}-${index}`} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ color: '#fcd34d', fontWeight: '800' }}>{audit.action}</div>
                    <div style={{ color: 'white', marginTop: '0.3rem' }}>{audit.username_attempt || 'Systeme'}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>{audit.created_at}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Aucune trace d'audit disponible." />
            )}
          </Panel>
        </div>
      </div>
    );
  };

  const renderByRole = () => {
    if (user.role === 'student') return renderStudentDashboard();
    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Preparation du tableau de pilotage...</div>;
    if (user.role === 'professor') return renderProfessorDashboard();
    if (user.role === 'staff') return renderStaffDashboard();
    if (user.role === 'admin') return renderAdminDashboard();

    return <EmptyState message="Aucun tableau de bord disponible pour ce role." />;
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>{title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} color="var(--success)" /> Poste {user.role.toUpperCase()} · navigation securisee de la plateforme
          </p>
        </div>
      </header>

      {renderByRole()}
    </div>
  );
}
