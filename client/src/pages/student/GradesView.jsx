import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Award,
  TrendingUp,
  BookOpen,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import ProgressRing from '../../components/ui/ProgressRing';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton, { SkeletonCard, SkeletonRing } from '../../components/ui/Skeleton';
import { staggerContainer, staggerItem, expandCollapse } from '../../lib/animations';
import { getGradeColor, getGradeLabel } from '../../lib/theme';
import { cn } from '../../lib/utils';

export default function GradesView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState({});

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get('/student/grades');
        setData(res.data);
      } catch {
        toast.error('Impossible de charger les notes');
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  const toggleSubject = (name) => {
    setExpandedSubjects((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <PageHeader
          icon={GraduationCap}
          title="Releve de Notes"
          subtitle="Chargement du dossier scolaire..."
          accentColor="#007AFF"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.subjects || data.subjects.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <PageHeader
          icon={GraduationCap}
          title="Releve de Notes"
          subtitle="Votre dossier scolaire complet"
          accentColor="#007AFF"
        />
        <GlassCard hover={false}>
          <EmptyState
            icon={BookOpen}
            title="Aucune note enregistree"
            message="Votre releve de notes apparaitra ici des que vos professeurs auront saisi des evaluations."
          />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        icon={GraduationCap}
        title="Releve de Notes"
        subtitle="Votre dossier scolaire complet"
        accentColor="#007AFF"
      />

      {/* Average rings */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <GlassCard
            hover={false}
            className="flex items-center gap-6 border border-emerald-500/20"
            glow
            glowColor="#007AFF"
          >
            <ProgressRing
              value={data.general_student_average}
              max={20}
              size={110}
              label="Moyenne Eleve"
              showLabel={false}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-text-muted mb-1">
                Moyenne Generale
              </p>
              <p className="text-3xl font-extrabold text-text tabular-nums">
                {data.general_student_average
                  ? data.general_student_average.toFixed(2)
                  : '-'}
                <span className="text-base text-text-muted ml-1">/20</span>
              </p>
              {data.general_student_average && (
                <Badge
                  color={getGradeColor(data.general_student_average)}
                  className="mt-2"
                  size="xs"
                >
                  {getGradeLabel(data.general_student_average)}
                </Badge>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={staggerItem}>
          <GlassCard hover={false} className="flex items-center gap-6">
            <ProgressRing
              value={data.general_class_average}
              max={20}
              size={110}
              label="Moyenne Classe"
              showLabel={false}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-text-muted mb-1">
                Moyenne de la Classe
              </p>
              <p className="text-3xl font-extrabold text-text tabular-nums">
                {data.general_class_average
                  ? data.general_class_average.toFixed(2)
                  : '-'}
                <span className="text-base text-text-muted ml-1">/20</span>
              </p>
              {data.general_class_average && (
                <Badge
                  color={getGradeColor(data.general_class_average)}
                  className="mt-2"
                  size="xs"
                >
                  {getGradeLabel(data.general_class_average)}
                </Badge>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Subject accordion */}
      <GlassCard hover={false} padding="p-0">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr] px-6 py-4 border-b border-[rgba(0,0,0,0.06)] bg-[rgba(0,0,0,0.03)]">
          <span className="text-xs font-bold text-text-muted">
            Matiere
          </span>
          <span className="text-xs font-bold text-text-muted text-center">
            Moy. Eleve
          </span>
          <span className="text-xs font-bold text-text-muted text-center">
            Moy. Classe
          </span>
        </div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          {data.subjects.map((sub, idx) => {
            const expanded = expandedSubjects[sub.name] || false;

            return (
              <motion.div
                key={idx}
                variants={staggerItem}
                className="border-b border-[rgba(0,0,0,0.06)] last:border-b-0"
              >
                {/* Subject row */}
                <button
                  type="button"
                  onClick={() => toggleSubject(sub.name)}
                  className={cn(
                    'w-full grid grid-cols-[2fr_1fr_1fr] px-6 py-4 cursor-pointer',
                    'transition-colors duration-200 hover:bg-[rgba(0,0,0,0.03)]',
                    expanded && 'bg-[rgba(0,0,0,0.03)]'
                  )}
                >
                  <div className="flex items-center gap-3 text-left">
                    <motion.div
                      animate={{ rotate: expanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight
                        size={18}
                        className={cn(
                          'transition-colors',
                          expanded ? 'text-[#007AFF]' : 'text-text-muted'
                        )}
                      />
                    </motion.div>
                    <span className="font-semibold text-text text-[15px]">
                      {sub.name}
                    </span>
                    <Badge variant="default" size="xs">
                      {sub.grades?.length || 0} note{(sub.grades?.length || 0) > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-center">
                    <span
                      className="text-lg font-extrabold tabular-nums"
                      style={{ color: getGradeColor(sub.student_average) }}
                    >
                      {sub.student_average ? sub.student_average.toFixed(2) : '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-center">
                    <span className="text-lg font-semibold tabular-nums text-text-muted">
                      {sub.class_average ? sub.class_average.toFixed(2) : '-'}
                    </span>
                  </div>
                </button>

                {/* Expanded grades detail */}
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      key={`grades-${sub.name}`}
                      initial={expandCollapse.initial}
                      animate={expandCollapse.animate}
                      exit={expandCollapse.exit}
                      className="overflow-hidden"
                    >
                      <div className="bg-[rgba(0,0,0,0.03)] px-6 py-3 border-t border-[rgba(0,0,0,0.06)]">
                        {sub.grades.map((g, i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex items-center gap-4 py-3',
                              i < sub.grades.length - 1 &&
                                'border-b border-dashed border-[rgba(0,0,0,0.06)]'
                            )}
                          >
                            {/* Color bar */}
                            <div
                              className="w-1 h-8 rounded-full shrink-0"
                              style={{ backgroundColor: getGradeColor(g.grade) }}
                            />

                            {/* Date */}
                            <div className="flex items-center gap-1.5 shrink-0 w-24">
                              <Calendar size={12} className="text-text-muted" />
                              <span className="text-sm text-text-muted">{g.date}</span>
                            </div>

                            {/* Comment */}
                            <p className="flex-1 text-sm text-text italic truncate">
                              {g.comments}
                            </p>

                            {/* Grade */}
                            <div className="flex items-baseline gap-0.5 shrink-0">
                              <span
                                className="text-xl font-bold tabular-nums"
                                style={{ color: getGradeColor(g.grade) }}
                              >
                                {g.grade.toFixed(2)}
                              </span>
                              <span className="text-xs text-text-muted font-medium">/20</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </GlassCard>
    </div>
  );
}
