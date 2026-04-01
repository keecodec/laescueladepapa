import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { fetchCsrfToken } from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../../lib/animations';
import { cn } from '../../lib/utils';
import {
  BookOpen,
  Users,
  CheckCircle2,
  Send,
  GraduationCap,
  Hash,
  MessageSquare,
  Layers,
} from 'lucide-react';

const ACCENT = '#34C759';

export default function ProfGrades() {
  const [classes, setClasses] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({});
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    api
      .get('/professor/classes')
      .then((res) => setClasses(res.data))
      .catch(() => toast.error('Impossible de charger vos classes.'))
      .finally(() => setLoadingClasses(false));
  }, []);

  const selectClass = async (assignment) => {
    setActiveAssignment(assignment);
    setLoadingStudents(true);
    try {
      const res = await api.get(`/professor/students/${assignment.id}`);
      setStudents(res.data);
    } catch {
      toast.error("Erreur reseau. Impossible d'afficher la liste.");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleGrade = async (e, sid) => {
    e.preventDefault();
    const grade = form[`g_${sid}`];
    if (!grade) return;

    setSubmitting((prev) => ({ ...prev, [sid]: true }));
    try {
      await fetchCsrfToken();
      const payload = {
        student_id: sid,
        assignment_id: activeAssignment?.assignment_id,
        grade: form[`g_${sid}`],
        comments: form[`c_${sid}`],
      };
      const res = await api.post('/professor/grades', payload);
      toast.success(res.data.message || 'Note enregistree avec succes.');
      setForm((f) => ({ ...f, [`g_${sid}`]: '', [`c_${sid}`]: '' }));
    } catch (err) {
      toast.error('Une erreur est survenue.');
    } finally {
      setSubmitting((prev) => ({ ...prev, [sid]: false }));
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <PageHeader
        icon={BookOpen}
        title="Saisie des Evaluations"
        subtitle="Grille matricielle de notation par classe"
        accentColor={ACCENT}
      >
        {activeAssignment && (
          <Badge color={ACCENT} pulse>
            {students.length} eleve{students.length > 1 ? 's' : ''}
          </Badge>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* ---------- Sidebar: class list ---------- */}
        <GlassCard hover={false} className="h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} style={{ color: ACCENT }} />
            <h3 className="text-sm font-semibold text-text">
              Vos classes
            </h3>
          </div>

          {loadingClasses ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <p className="text-sm text-text-muted">Aucune classe assignee.</p>
          ) : (
            <motion.div
              className="flex flex-col gap-2"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {classes.map((c) => {
                const isActive =
                  activeAssignment?.assignment_id === c.assignment_id;
                return (
                  <motion.button
                    key={c.assignment_id}
                    variants={staggerItem}
                    onClick={() => selectClass(c)}
                    className={cn(
                      'text-left p-4 rounded-xl border transition-all duration-200',
                      isActive
                        ? 'bg-[rgba(52,199,89,0.08)] border-[rgba(52,199,89,0.30)]'
                        : 'bg-[rgba(0,0,0,0.03)] border-gray-200 hover:bg-[rgba(0,0,0,0.06)] hover:border-gray-300'
                    )}
                  >
                    <span
                      className={cn(
                        'block font-bold text-sm',
                        isActive ? 'text-[#34C759]' : 'text-text'
                      )}
                    >
                      {c.name}
                    </span>
                    <span className="block text-xs text-text-muted mt-0.5">
                      {c.subject}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </GlassCard>

        {/* ---------- Main: grade entry table ---------- */}
        <GlassCard hover={false} padding="p-0">
          <div className="flex items-center gap-3 p-5 border-b border-gray-200 bg-[rgba(0,0,0,0.03)]">
            <Layers size={18} style={{ color: ACCENT }} />
            <h3 className="text-base font-semibold text-text">
              Grille de saisie
            </h3>
          </div>

          {!activeAssignment ? (
            <EmptyState
              icon={GraduationCap}
              title="Selectionnez une classe"
              message="Choisissez une classe dans le panneau de gauche pour afficher la liste des eleves."
            />
          ) : loadingStudents ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucun eleve"
              message="Aucun eleve n'est inscrit dans cette classe."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-[rgba(0,0,0,0.03)]">
                    <th className="px-5 py-3.5 text-xs font-semibold text-text-muted">
                      Eleve
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-text-muted w-[150px]">
                      <span className="inline-flex items-center gap-1.5">
                        <Hash size={12} />
                        Note /20
                      </span>
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquare size={12} />
                        Appreciation
                      </span>
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-text-muted w-[120px] text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {students.map((s, idx) => (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.3 }}
                        className="border-b border-[rgba(0,0,0,0.06)] hover:bg-[rgba(0,0,0,0.03)] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <span className="font-semibold text-text text-sm">
                            {s.username}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            placeholder="14.5"
                            value={form[`g_${s.id}`] || ''}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                [`g_${s.id}`]: e.target.value,
                              }))
                            }
                            className={cn(
                              'w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-text',
                              'placeholder:text-text-muted',
                              'focus:outline-none focus:ring-2 transition-all duration-200',
                              form[`g_${s.id}`]
                                ? 'border-[rgba(52,199,89,0.50)] focus:border-[#34C759] focus:ring-[rgba(52,199,89,0.20)]'
                                : 'border-border focus:border-[#34C759] focus:ring-[rgba(52,199,89,0.20)]'
                            )}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <input
                            type="text"
                            placeholder="Travail serieux et regulier..."
                            value={form[`c_${s.id}`] || ''}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                [`c_${s.id}`]: e.target.value,
                              }))
                            }
                            className={cn(
                              'w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-text',
                              'placeholder:text-text-muted',
                              'focus:outline-none focus:border-[#34C759] focus:ring-2 focus:ring-[rgba(52,199,89,0.20)]',
                              'transition-all duration-200'
                            )}
                          />
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Button
                            variant={form[`g_${s.id}`] ? 'success' : 'outline'}
                            size="sm"
                            icon={form[`g_${s.id}`] ? Send : CheckCircle2}
                            disabled={!form[`g_${s.id}`]}
                            loading={submitting[s.id]}
                            onClick={(e) => handleGrade(e, s.id)}
                            className="w-full"
                          >
                            OK
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
