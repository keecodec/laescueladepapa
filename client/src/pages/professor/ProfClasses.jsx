import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton, { SkeletonCard } from '../../components/ui/Skeleton';
import { staggerContainer, staggerItem, fadeInUp } from '../../lib/animations';
import { cn, getInitials } from '../../lib/utils';
import {
  GraduationCap,
  Users,
  BookOpen,
  Layers,
  School,
  Hash,
  User,
} from 'lucide-react';

const ACCENT = '#34C759';

export default function ProfClasses() {
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await api.get('/professor/classes');
        setClasses(response.data);
        if (response.data.length > 0) {
          setActiveClass(response.data[0]);
        }
      } catch {
        toast.error('Impossible de charger vos classes.');
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
      setLoadingStudents(true);
      try {
        const response = await api.get(
          `/professor/students/${activeClass.id}`
        );
        setStudents(response.data);
      } catch {
        toast.error("Impossible de charger les eleves.");
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, [activeClass]);

  // ---------- Loading skeleton ----------
  if (loading) {
    return (
      <div className="max-w-[1300px] mx-auto">
        <Skeleton className="h-10 w-72 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  // ---------- Empty state ----------
  if (classes.length === 0) {
    return (
      <div className="max-w-[1300px] mx-auto">
        <PageHeader
          icon={GraduationCap}
          title="Mes Classes"
          subtitle="Vue professeur des groupes suivis"
          accentColor={ACCENT}
        />
        <EmptyState
          icon={School}
          title="Aucune classe"
          message="Aucune classe n'est encore rattachee a votre compte. Contactez l'administration."
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto">
      <PageHeader
        icon={GraduationCap}
        title="Mes Classes"
        subtitle="Vue professeur des groupes suivis et de leurs effectifs"
        accentColor={ACCENT}
      >
        <Badge color={ACCENT}>
          {classes.length} classe{classes.length > 1 ? 's' : ''}
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* ---------- Sidebar ---------- */}
        <GlassCard hover={false} className="h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} style={{ color: ACCENT }} />
            <h3 className="text-sm font-semibold text-text">
              Affectations
            </h3>
          </div>

          <motion.div
            className="flex flex-col gap-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {classes.map((classItem) => {
              const isActive =
                activeClass?.assignment_id === classItem.assignment_id;
              return (
                <motion.button
                  key={classItem.assignment_id}
                  variants={staggerItem}
                  type="button"
                  onClick={() => setActiveClass(classItem)}
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
                    {classItem.name}
                  </span>
                  <span className="block text-xs text-[#34C759] mt-1">
                    {classItem.subject}
                  </span>
                  {classItem.level && (
                    <span className="block text-xs text-text-muted mt-0.5">
                      {classItem.level}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </GlassCard>

        {/* ---------- Main content ---------- */}
        <div className="flex flex-col gap-6">
          {/* Info cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeClass?.assignment_id}
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              exit={fadeInUp.exit}
              transition={fadeInUp.transition}
            >
              <GlassCard hover={false}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[rgba(0,0,0,0.03)] rounded-2xl p-5">
                    <span className="text-xs font-semibold text-text-muted">
                      Classe
                    </span>
                    <p className="text-xl font-semibold text-text mt-1">
                      {activeClass?.name}
                    </p>
                  </div>
                  <div className="bg-[rgba(0,0,0,0.03)] rounded-2xl p-5">
                    <span className="text-xs font-semibold text-text-muted">
                      Matiere
                    </span>
                    <p
                      className="text-lg font-semibold mt-1"
                      style={{ color: ACCENT }}
                    >
                      {activeClass?.subject}
                    </p>
                  </div>
                  <div className="bg-[rgba(0,0,0,0.03)] rounded-2xl p-5">
                    <span className="text-xs font-semibold text-text-muted">
                      Effectif
                    </span>
                    <p className="text-xl font-semibold text-text mt-1">
                      {loadingStudents ? '...' : students.length}{' '}
                      <span className="text-sm font-normal text-text-muted">
                        eleve{students.length !== 1 ? 's' : ''}
                      </span>
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Student grid */}
          <GlassCard hover={false} padding="p-0">
            <div className="flex items-center gap-2 p-5 border-b border-border">
              <Users size={18} style={{ color: ACCENT }} />
              <h3 className="text-sm font-semibold text-text">
                Eleves rattaches
              </h3>
            </div>

            {loadingStudents ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <EmptyState
                icon={User}
                title="Aucun eleve"
                message="Aucun eleve visible pour cette classe."
              />
            ) : (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-5"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                key={activeClass?.assignment_id}
              >
                {students.map((student) => (
                  <motion.div key={student.id} variants={staggerItem}>
                    <GlassCard
                      hover
                      padding="p-4"
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                        style={{
                          background: `${ACCENT}20`,
                          color: ACCENT,
                          border: `1px solid ${ACCENT}30`,
                        }}
                      >
                        {getInitials(student.username)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text truncate">
                          {student.username}
                        </p>
                        <p className="text-xs text-text-muted flex items-center gap-1">
                          <Hash size={10} />
                          {student.id}
                        </p>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
