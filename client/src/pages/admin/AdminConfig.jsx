import { useEffect, useState } from 'react';
import { AlertCircle, BookOpen, Check, Layers3, Library, Trash2 } from 'lucide-react';
import api, { fetchCsrfToken } from '../../api';

export default function AdminConfig() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [classForm, setClassForm] = useState({ name: '', level: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '' });
  const [assignmentForm, setAssignmentForm] = useState({
    class_id: '',
    professor_id: '',
    subject_id: '',
  });
  const [scheduleForm, setScheduleForm] = useState({
    class_id: '',
    professor_id: '',
    subject_id: '',
    room: '',
    day_of_week: 'Lundi',
    start_time: '08:00',
    end_time: '09:00',
    week_type: 'Toutes',
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [classesResponse, subjectsResponse, professorsResponse, assignmentsResponse, schedulesResponse] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/subjects'),
        api.get('/admin/professors'),
        api.get('/admin/assignments'),
        api.get('/admin/schedules'),
      ]);
      setClasses(classesResponse.data);
      setSubjects(subjectsResponse.data);
      setProfessors(professorsResponse.data);
      setAssignments(assignmentsResponse.data);
      setSchedules(schedulesResponse.data);
      setAssignmentForm((current) => ({
        ...current,
        class_id: current.class_id || String(classesResponse.data[0]?.id || ''),
        professor_id: current.professor_id || String(professorsResponse.data[0]?.id || ''),
        subject_id: current.subject_id || String(subjectsResponse.data[0]?.id || ''),
      }));
      setScheduleForm((current) => ({
        ...current,
        class_id: current.class_id || String(classesResponse.data[0]?.id || ''),
        professor_id: current.professor_id || String(professorsResponse.data[0]?.id || ''),
        subject_id: current.subject_id || String(subjectsResponse.data[0]?.id || ''),
      }));
    } catch (requestError) {
      console.error(requestError);
      setError("Impossible de charger la configuration academique.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClassSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await fetchCsrfToken();
      const response = await api.post('/admin/classes', classForm);
      setMessage(response.data.message);
      setClassForm({ name: '', level: '' });
      loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Erreur lors de la creation de la classe.");
    }
  };

  const handleSubjectSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await fetchCsrfToken();
      const response = await api.post('/admin/subjects', subjectForm);
      setMessage(response.data.message);
      setSubjectForm({ name: '' });
      loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Erreur lors de l'ajout de la matiere.");
    }
  };

  const handleAssignmentSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await fetchCsrfToken();
      const response = await api.post('/admin/assignments', assignmentForm);
      setMessage(response.data.message);
      loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Erreur lors de la creation de l'affectation.");
    }
  };

  const handleScheduleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await fetchCsrfToken();
      const response = await api.post('/admin/schedules', scheduleForm);
      setMessage(response.data.message);
      setScheduleForm((current) => ({ ...current, room: '' }));
      loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Erreur lors de la creation du creneau.");
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    setError(null);
    setMessage(null);

    try {
      await fetchCsrfToken();
      const response = await api.delete(`/admin/assignments/${assignmentId}`);
      setMessage(response.data.message);
      loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Erreur lors de la suppression de l'affectation.");
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    setError(null);
    setMessage(null);

    try {
      await fetchCsrfToken();
      const response = await api.delete(`/admin/schedules/${scheduleId}`);
      setMessage(response.data.message);
      loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Erreur lors de la suppression du creneau.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <Layers3 size={32} color="#38bdf8" />
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', letterSpacing: '-1px' }}>Configuration academique</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Creation rapide des classes et des matieres pour faire vivre la plateforme comme un vrai portail scolaire.</p>
        </div>
      </header>

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.4rem' }}>
            <Library size={22} color="#38bdf8" />
            <span>Nouvelle classe</span>
          </h2>

          <form onSubmit={handleClassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Nom</label>
              <input className="input-field" value={classForm.name} onChange={(event) => setClassForm({ ...classForm, name: event.target.value })} placeholder="Ex: 3eme B" required />
            </div>
            <div className="input-group">
              <label className="input-label">Niveau</label>
              <input className="input-field" value={classForm.level} onChange={(event) => setClassForm({ ...classForm, level: event.target.value })} placeholder="Ex: College" />
            </div>
            <button type="submit" className="btn" style={{ background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: 'white', border: 'none' }}>Creer la classe</button>
          </form>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.4rem' }}>
            <BookOpen size={22} color="#fb7185" />
            <span>Nouvelle matiere</span>
          </h2>

          <form onSubmit={handleSubjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Nom</label>
              <input className="input-field" value={subjectForm.name} onChange={(event) => setSubjectForm({ name: event.target.value })} placeholder="Ex: Sciences numeriques" required />
            </div>
            <button type="submit" className="btn" style={{ background: 'linear-gradient(135deg, #fb7185, #e11d48)', color: 'white', border: 'none' }}>Ajouter la matiere</button>
          </form>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.4rem' }}>
            <Layers3 size={22} color="#8b5cf6" />
            <span>Affectation pedagogique</span>
          </h2>

          <form onSubmit={handleAssignmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Classe</label>
              <select className="input-field" value={assignmentForm.class_id} onChange={(event) => setAssignmentForm({ ...assignmentForm, class_id: event.target.value })} required>
                {classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Matiere</label>
              <select className="input-field" value={assignmentForm.subject_id} onChange={(event) => setAssignmentForm({ ...assignmentForm, subject_id: event.target.value })} required>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Professeur</label>
              <select className="input-field" value={assignmentForm.professor_id} onChange={(event) => setAssignmentForm({ ...assignmentForm, professor_id: event.target.value })} required>
                {professors.map((professor) => <option key={professor.id} value={professor.id}>{professor.username}</option>)}
              </select>
            </div>
            <button type="submit" className="btn" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', border: 'none' }}>Affecter la matiere</button>
          </form>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.4rem' }}>
            <Layers3 size={22} color="#f59e0b" />
            <span>Nouveau creneau</span>
          </h2>

          <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Classe</label>
              <select className="input-field" value={scheduleForm.class_id} onChange={(event) => setScheduleForm({ ...scheduleForm, class_id: event.target.value })} required>
                {classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Professeur</label>
              <select className="input-field" value={scheduleForm.professor_id} onChange={(event) => setScheduleForm({ ...scheduleForm, professor_id: event.target.value })} required>
                {professors.map((professor) => <option key={professor.id} value={professor.id}>{professor.username}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Matiere</label>
              <select className="input-field" value={scheduleForm.subject_id} onChange={(event) => setScheduleForm({ ...scheduleForm, subject_id: event.target.value })} required>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">Jour</label>
                <select className="input-field" value={scheduleForm.day_of_week} onChange={(event) => setScheduleForm({ ...scheduleForm, day_of_week: event.target.value })}>
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((day) => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Semaine</label>
                <select className="input-field" value={scheduleForm.week_type} onChange={(event) => setScheduleForm({ ...scheduleForm, week_type: event.target.value })}>
                  {['Toutes', 'A', 'B'].map((weekType) => <option key={weekType} value={weekType}>{weekType}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">Debut</label>
                <input type="time" className="input-field" value={scheduleForm.start_time} onChange={(event) => setScheduleForm({ ...scheduleForm, start_time: event.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Fin</label>
                <input type="time" className="input-field" value={scheduleForm.end_time} onChange={(event) => setScheduleForm({ ...scheduleForm, end_time: event.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Salle</label>
                <input className="input-field" value={scheduleForm.room} onChange={(event) => setScheduleForm({ ...scheduleForm, room: event.target.value })} placeholder="B204" required />
              </div>
            </div>
            <button type="submit" className="btn" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none' }}>Ajouter au planning</button>
          </form>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 320px 1fr 1.2fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: '700', color: 'white' }}>Classes ({classes.length})</div>
          {loading ? (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Chargement...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {classes.map((classItem) => (
                <article key={classItem.id} style={{ padding: '1rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: 'white', fontWeight: '700' }}>{classItem.name}</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{classItem.level || 'Niveau non precise'}</div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: '700', color: 'white' }}>Matieres ({subjects.length})</div>
          {loading ? (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Chargement...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {subjects.map((subject) => (
                <article key={subject.id} style={{ padding: '1rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: 'white', fontWeight: '700' }}>{subject.name}</div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: '700', color: 'white' }}>Affectations ({assignments.length})</div>
          {loading ? (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Chargement...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '720px', overflowY: 'auto' }}>
              {assignments.map((assignment) => (
                <article key={assignment.id} style={{ padding: '1rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                  <div>
                    <div style={{ color: 'white', fontWeight: '800' }}>{assignment.class_name}</div>
                    <div style={{ color: '#c4b5fd', marginTop: '0.25rem', fontWeight: '700' }}>{assignment.subject_name}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{assignment.professor_username}</div>
                  </div>
                  <button type="button" onClick={() => handleDeleteAssignment(assignment.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}>
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: '700', color: 'white' }}>Emploi du temps ({schedules.length})</div>
          {loading ? (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Chargement...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '720px', overflowY: 'auto' }}>
              {schedules.map((schedule) => (
                <article key={schedule.id} style={{ padding: '1rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                  <div>
                    <div style={{ color: 'white', fontWeight: '800' }}>{schedule.class_name} · {schedule.subject_name}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{schedule.professor_username} · Salle {schedule.room}</div>
                    <div style={{ color: '#fcd34d', marginTop: '0.35rem', fontSize: '0.88rem' }}>{schedule.day_of_week} · {schedule.start_time} - {schedule.end_time} · Semaine {schedule.week_type}</div>
                  </div>
                  <button type="button" onClick={() => handleDeleteSchedule(schedule.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}>
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
