import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { fetchCsrfToken } from '../../api';
import {
  BookOpen,
  Layers3,
  Library,
  Trash2,
  Calendar,
  Plus,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../../lib/animations';

const TABS = [
  { id: 'classes', label: 'Classes', icon: Library, color: '#007AFF' },
  { id: 'matieres', label: 'Matieres', icon: BookOpen, color: '#FF2D55' },
  { id: 'affectations', label: 'Affectations', icon: Layers3, color: '#5856D6' },
  { id: 'schedules', label: 'Emplois du temps', icon: Calendar, color: '#FF9500' },
];

export default function AdminConfig() {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const loadData = async () => {
    try {
      const [classesRes, subjectsRes, professorsRes, assignmentsRes, schedulesRes] =
        await Promise.all([
          api.get('/admin/classes'),
          api.get('/admin/subjects'),
          api.get('/admin/professors'),
          api.get('/admin/assignments'),
          api.get('/admin/schedules'),
        ]);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setProfessors(professorsRes.data);
      setAssignments(assignmentsRes.data);
      setSchedules(schedulesRes.data);

      setAssignmentForm((c) => ({
        ...c,
        class_id: c.class_id || String(classesRes.data[0]?.id || ''),
        professor_id: c.professor_id || String(professorsRes.data[0]?.id || ''),
        subject_id: c.subject_id || String(subjectsRes.data[0]?.id || ''),
      }));
      setScheduleForm((c) => ({
        ...c,
        class_id: c.class_id || String(classesRes.data[0]?.id || ''),
        professor_id: c.professor_id || String(professorsRes.data[0]?.id || ''),
        subject_id: c.subject_id || String(subjectsRes.data[0]?.id || ''),
      }));
    } catch {
      toast.error('Impossible de charger la configuration academique.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchCsrfToken();
      const res = await api.post('/admin/classes', classForm);
      toast.success(res.data.message || 'Classe creee.');
      setClassForm({ name: '', level: '' });
      loadData();
    } catch (err) {
      toast.error('Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchCsrfToken();
      const res = await api.post('/admin/subjects', subjectForm);
      toast.success(res.data.message || 'Matiere ajoutee.');
      setSubjectForm({ name: '' });
      loadData();
    } catch (err) {
      toast.error('Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchCsrfToken();
      const res = await api.post('/admin/assignments', assignmentForm);
      toast.success(res.data.message || 'Affectation creee.');
      loadData();
    } catch (err) {
      toast.error('Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchCsrfToken();
      const res = await api.post('/admin/schedules', scheduleForm);
      toast.success(res.data.message || 'Creneau ajoute.');
      setScheduleForm((c) => ({ ...c, room: '' }));
      loadData();
    } catch (err) {
      toast.error('Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await fetchCsrfToken();
      const res = await api.delete(`/admin/assignments/${assignmentId}`);
      toast.success(res.data.message || 'Affectation supprimee.');
      loadData();
    } catch (err) {
      toast.error('Une erreur est survenue.');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await fetchCsrfToken();
      const res = await api.delete(`/admin/schedules/${scheduleId}`);
      toast.success(res.data.message || 'Creneau supprime.');
      loadData();
    } catch (err) {
      toast.error('Une erreur est survenue.');
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      );
    }

    switch (activeTab) {
      case 'classes':
        return (
          <div className="flex flex-col gap-6">
            <GlassCard hover={false}>
              <h3 className="text-base font-bold text-text mb-4 flex items-center gap-2">
                <Plus size={16} style={{ color: '#007AFF' }} />
                Nouvelle classe
              </h3>
              <form onSubmit={handleClassSubmit} className="flex flex-col gap-3">
                <Input
                  label="Nom"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="Ex: 3eme B"
                  required
                />
                <Input
                  label="Niveau"
                  value={classForm.level}
                  onChange={(e) => setClassForm({ ...classForm, level: e.target.value })}
                  placeholder="Ex: College"
                />
                <Button
                  type="submit"
                  loading={submitting}
                  icon={Plus}
                  style={{ backgroundColor: '#007AFF' }}
                >
                  Creer la classe
                </Button>
              </form>
            </GlassCard>

            <GlassCard hover={false} padding="p-0">
              <div className="px-5 py-3 border-b border-gray-200 text-sm font-bold text-text">
                Classes ({classes.length})
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {classes.length === 0 ? (
                  <EmptyState icon={Library} title="Aucune classe" message="Creez votre premiere classe." />
                ) : (
                  <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col">
                    {classes.map((c) => (
                      <motion.article
                        key={c.id}
                        variants={staggerItem}
                        className="px-5 py-3 border-b border-gray-200 last:border-0"
                      >
                        <div className="font-bold text-text text-sm">{c.name}</div>
                        <div className="text-xs text-text-muted">{c.level || 'Niveau non precise'}</div>
                      </motion.article>
                    ))}
                  </motion.div>
                )}
              </div>
            </GlassCard>
          </div>
        );

      case 'matieres':
        return (
          <div className="flex flex-col gap-6">
            <GlassCard hover={false}>
              <h3 className="text-base font-bold text-text mb-4 flex items-center gap-2">
                <Plus size={16} style={{ color: '#FF2D55' }} />
                Nouvelle matiere
              </h3>
              <form onSubmit={handleSubjectSubmit} className="flex flex-col gap-3">
                <Input
                  label="Nom"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ name: e.target.value })}
                  placeholder="Ex: Sciences numeriques"
                  required
                />
                <Button
                  type="submit"
                  loading={submitting}
                  icon={Plus}
                  style={{ backgroundColor: '#FF2D55' }}
                >
                  Ajouter la matiere
                </Button>
              </form>
            </GlassCard>

            <GlassCard hover={false} padding="p-0">
              <div className="px-5 py-3 border-b border-gray-200 text-sm font-bold text-text">
                Matieres ({subjects.length})
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {subjects.length === 0 ? (
                  <EmptyState icon={BookOpen} title="Aucune matiere" message="Ajoutez votre premiere matiere." />
                ) : (
                  <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col">
                    {subjects.map((s) => (
                      <motion.article
                        key={s.id}
                        variants={staggerItem}
                        className="px-5 py-3 border-b border-gray-200 last:border-0"
                      >
                        <div className="font-bold text-text text-sm">{s.name}</div>
                      </motion.article>
                    ))}
                  </motion.div>
                )}
              </div>
            </GlassCard>
          </div>
        );

      case 'affectations':
        return (
          <div className="flex flex-col gap-6">
            <GlassCard hover={false}>
              <h3 className="text-base font-bold text-text mb-4 flex items-center gap-2">
                <Plus size={16} style={{ color: '#5856D6' }} />
                Affectation pedagogique
              </h3>
              <form onSubmit={handleAssignmentSubmit} className="flex flex-col gap-3">
                <Select
                  label="Classe"
                  value={assignmentForm.class_id}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, class_id: e.target.value })}
                  required
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                <Select
                  label="Matiere"
                  value={assignmentForm.subject_id}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, subject_id: e.target.value })}
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
                <Select
                  label="Professeur"
                  value={assignmentForm.professor_id}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, professor_id: e.target.value })}
                  required
                >
                  {professors.map((p) => (
                    <option key={p.id} value={p.id}>{p.username}</option>
                  ))}
                </Select>
                <Button
                  type="submit"
                  loading={submitting}
                  icon={Plus}
                  style={{ backgroundColor: '#5856D6' }}
                >
                  Affecter la matiere
                </Button>
              </form>
            </GlassCard>

            <GlassCard hover={false} padding="p-0">
              <div className="px-5 py-3 border-b border-gray-200 text-sm font-bold text-text">
                Affectations ({assignments.length})
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {assignments.length === 0 ? (
                  <EmptyState icon={Layers3} title="Aucune affectation" message="Creez votre premiere affectation." />
                ) : (
                  <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col">
                    {assignments.map((a) => (
                      <motion.article
                        key={a.id}
                        variants={staggerItem}
                        className="px-5 py-3 border-b border-gray-200 last:border-0 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-text text-sm">{a.class_name}</div>
                          <div className="text-sm font-semibold mt-0.5" style={{ color: '#5856D6' }}>{a.subject_name}</div>
                          <div className="text-xs text-text-muted mt-0.5">{a.professor_username}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="text-error/70 hover:text-error hover:bg-error/10 shrink-0"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </motion.article>
                    ))}
                  </motion.div>
                )}
              </div>
            </GlassCard>
          </div>
        );

      case 'schedules':
        return (
          <div className="flex flex-col gap-6">
            <GlassCard hover={false}>
              <h3 className="text-base font-bold text-text mb-4 flex items-center gap-2">
                <Plus size={16} style={{ color: '#FF9500' }} />
                Nouveau creneau
              </h3>
              <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-3">
                <Select
                  label="Classe"
                  value={scheduleForm.class_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, class_id: e.target.value })}
                  required
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                <Select
                  label="Professeur"
                  value={scheduleForm.professor_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, professor_id: e.target.value })}
                  required
                >
                  {professors.map((p) => (
                    <option key={p.id} value={p.id}>{p.username}</option>
                  ))}
                </Select>
                <Select
                  label="Matiere"
                  value={scheduleForm.subject_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, subject_id: e.target.value })}
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Jour"
                    value={scheduleForm.day_of_week}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: e.target.value })}
                  >
                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Select>
                  <Select
                    label="Semaine"
                    value={scheduleForm.week_type}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, week_type: e.target.value })}
                  >
                    {['Toutes', 'A', 'B'].map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Debut"
                    type="time"
                    value={scheduleForm.start_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                    required
                  />
                  <Input
                    label="Fin"
                    type="time"
                    value={scheduleForm.end_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                    required
                  />
                  <Input
                    label="Salle"
                    value={scheduleForm.room}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                    placeholder="B204"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  loading={submitting}
                  icon={Plus}
                  style={{ backgroundColor: '#FF9500' }}
                >
                  Ajouter au planning
                </Button>
              </form>
            </GlassCard>

            <GlassCard hover={false} padding="p-0">
              <div className="px-5 py-3 border-b border-gray-200 text-sm font-bold text-text">
                Emploi du temps ({schedules.length})
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {schedules.length === 0 ? (
                  <EmptyState icon={Calendar} title="Aucun creneau" message="Ajoutez votre premier creneau." />
                ) : (
                  <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col">
                    {schedules.map((s) => (
                      <motion.article
                        key={s.id}
                        variants={staggerItem}
                        className="px-5 py-3 border-b border-gray-200 last:border-0 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-text text-sm">
                            {s.class_name} -- {s.subject_name}
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">
                            {s.professor_username} -- Salle {s.room}
                          </div>
                          <div className="text-xs mt-1 font-semibold" style={{ color: '#FF9500' }}>
                            {s.day_of_week} -- {s.start_time} - {s.end_time} -- Sem. {s.week_type}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="text-error/70 hover:text-error hover:bg-error/10 shrink-0"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </motion.article>
                    ))}
                  </motion.div>
                )}
              </div>
            </GlassCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-[900px] mx-auto">
      <PageHeader
        icon={Layers3}
        title="Configuration academique"
        subtitle="Classes, matieres, affectations et emplois du temps"
        accentColor="#FF3B30"
      />

      {/* Tab buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-text-muted bg-[rgba(0,0,0,0.03)] hover:text-text hover:bg-[rgba(0,0,0,0.06)]'
              }`}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)`,
                      boxShadow: `0 4px 15px ${tab.color}40`,
                    }
                  : undefined
              }
            >
              <TabIcon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
