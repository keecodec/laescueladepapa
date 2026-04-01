import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Clock3,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Scale,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton, { SkeletonCard } from '../../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../../lib/animations';
import { cn } from '../../lib/utils';

export default function StudentDiscipline() {
  const [absences, setAbsences] = useState([]);
  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiscipline = async () => {
      try {
        const [absencesResponse, sanctionsResponse] = await Promise.all([
          api.get('/student/absences'),
          api.get('/student/sanctions'),
        ]);
        setAbsences(absencesResponse.data);
        setSanctions(sanctionsResponse.data);
      } catch {
        toast.error('Impossible de charger le dossier vie scolaire');
      } finally {
        setLoading(false);
      }
    };

    loadDiscipline();
  }, []);

  const justifiedCount = absences.filter((a) => a.justified).length;
  const unjustifiedCount = absences.filter((a) => !a.justified).length;
  const lateCount = absences.filter((a) => a.is_late).length;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={Scale}
          title="Vie Scolaire"
          subtitle="Chargement..."
          accentColor="#FF9500"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={Scale}
        title="Vie Scolaire"
        subtitle="Absences, retards et dossier disciplinaire"
        accentColor="#FF9500"
      />

      {/* Stats overview */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard
          icon={Clock3}
          label="Total Absences"
          value={absences.length}
          color="#FF9500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Justifiees"
          value={justifiedCount}
          color="#34C759"
        />
        <StatCard
          icon={XCircle}
          label="Non Justifiees"
          value={unjustifiedCount}
          color="#ef4444"
        />
        <StatCard
          icon={ShieldAlert}
          label="Sanctions"
          value={sanctions.length}
          color="#FF3B30"
        />
      </motion.div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Absences column */}
        <div>
          <GlassCard hover={false} padding="p-0">
            {/* Section header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[rgba(255,149,0,0.10)] border border-amber-500/20">
                <Clock3 size={16} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text">Absences et Retards</h2>
                <p className="text-xs text-text-muted">
                  {absences.length} enregistrement{absences.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {absences.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Dossier vierge"
                message="Aucun incident de presence dans votre dossier."
              />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="divide-y divide-[rgba(0,0,0,0.06)]"
              >
                {absences.map((absence, index) => (
                  <motion.article
                    key={`${absence.date}-${index}`}
                    variants={staggerItem}
                    className="px-6 py-4 hover:bg-[rgba(0,0,0,0.03)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Status indicator */}
                        <div
                          className={cn(
                            'mt-0.5 w-2 h-2 rounded-full shrink-0',
                            absence.justified ? 'bg-[#34C759]' : 'bg-[#FF3B30] animate-pulse'
                          )}
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-text">
                              {absence.is_late ? 'Retard' : 'Absence'}
                            </span>
                            <Badge
                              variant={absence.justified ? 'success' : 'error'}
                              size="xs"
                            >
                              {absence.justified ? 'Justifiee' : 'A regulariser'}
                            </Badge>
                          </div>
                          {absence.comments && (
                            <p className="text-xs text-text-muted leading-relaxed mt-1">
                              {absence.comments}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-text-muted whitespace-nowrap tabular-nums">
                        {absence.date}
                      </span>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </GlassCard>
        </div>

        {/* Sanctions column */}
        <div>
          <GlassCard hover={false} padding="p-0">
            {/* Section header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[rgba(255,59,48,0.10)] border border-rose-500/20">
                <ShieldAlert size={16} className="text-rose-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text">Sanctions</h2>
                <p className="text-xs text-text-muted">
                  {sanctions.length} enregistrement{sanctions.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {sanctions.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Aucune sanction"
                message="Aucune sanction enregistree dans votre dossier."
              />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="divide-y divide-[rgba(0,0,0,0.06)]"
              >
                {sanctions.map((sanction, index) => (
                  <motion.article
                    key={`${sanction.type}-${sanction.date}-${index}`}
                    variants={staggerItem}
                    className="px-6 py-4 hover:bg-[rgba(0,0,0,0.03)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge color="#FF3B30" size="xs">
                            {sanction.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-text leading-relaxed mt-1.5">
                          {sanction.reason}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-text-muted whitespace-nowrap tabular-nums">
                        {sanction.date}
                      </span>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </GlassCard>

          {/* Warning banner */}
          {sanctions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard
                hover={false}
                className="mt-4 border border-rose-500/20 bg-rose-500/[0.05]"
                padding="p-4"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} className="text-rose-400 shrink-0" />
                  <p className="text-sm text-text">
                    Votre dossier contient des sanctions. Un echange avec la vie scolaire
                    peut etre necessaire.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
