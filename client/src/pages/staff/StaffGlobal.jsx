import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api';
import {
  Clock3,
  ShieldAlert,
  Users,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../../lib/animations';
import { getInitials } from '../../lib/utils';

export default function StaffGlobal() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const response = await api.get('/staff/dashboard');
        setData(response.data);
      } catch {
        toast.error('Impossible de charger la vue globale.');
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  const metrics = data?.metrics || {};

  if (loading) {
    return (
      <div className="max-w-[1300px] mx-auto">
        <PageHeader
          icon={Users}
          title="Vue globale"
          subtitle="Chargement de la supervision..."
          accentColor="#FF9500"
        />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto">
      <PageHeader
        icon={Users}
        title="Vue globale"
        subtitle="Supervision vie scolaire -- incidents, sanctions et eleves prioritaires"
        accentColor="#FF9500"
      />

      {/* Stat cards row */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard
          icon={Clock3}
          label="Absences"
          value={metrics.absences_total || 0}
          color="#FF9500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Non justifiees"
          value={metrics.unjustified_total || 0}
          color="#FF3B30"
        />
        <StatCard
          icon={ShieldAlert}
          label="Sanctions"
          value={metrics.sanctions_total || 0}
          color="#fb7185"
        />
        <StatCard
          icon={TrendingUp}
          label="Incidents du jour"
          value={metrics.incidents_today || 0}
          color="#38bdf8"
        />
      </motion.div>

      {/* 3 panels */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Absences panel */}
        <motion.div variants={staggerItem}>
          <GlassCard hover={false} padding="p-0">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(0,0,0,0.06)]">
              <Clock3 size={18} className="text-amber-500" />
              <span className="font-bold text-text">Journal des absences</span>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {data?.recent_absences?.length === 0 ? (
                <EmptyState
                  icon={Clock3}
                  title="Aucune absence"
                  message="Rien a signaler."
                />
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="flex flex-col"
                >
                  {data?.recent_absences?.map((absence, index) => (
                    <motion.article
                      key={`${absence.student_username}-${index}`}
                      variants={staggerItem}
                      className="px-5 py-3 border-b border-[rgba(0,0,0,0.06)] last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text text-sm">
                          {absence.student_username}
                        </span>
                        <Badge
                          color={absence.justified ? '#34C759' : '#FF3B30'}
                          size="xs"
                        >
                          {absence.justified ? 'Justifiee' : 'A regulariser'}
                        </Badge>
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        {absence.class_name || 'Sans classe'} -- {absence.date}
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        {absence.is_late ? 'Retard' : 'Absence'}
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Sanctions panel */}
        <motion.div variants={staggerItem}>
          <GlassCard hover={false} padding="p-0">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(0,0,0,0.06)]">
              <ShieldAlert size={18} className="text-pink-500" />
              <span className="font-bold text-text">
                Registre des sanctions
              </span>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {data?.recent_sanctions?.length === 0 ? (
                <EmptyState
                  icon={ShieldAlert}
                  title="Aucune sanction"
                  message="Rien a signaler."
                />
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="flex flex-col"
                >
                  {data?.recent_sanctions?.map((sanction, index) => (
                    <motion.article
                      key={`${sanction.student_username}-${index}`}
                      variants={staggerItem}
                      className="px-5 py-3 border-b border-[rgba(0,0,0,0.06)] last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge color="#fb7185" size="xs">
                          {sanction.type}
                        </Badge>
                        <span className="font-bold text-text text-sm">
                          {sanction.student_username}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {sanction.reason}
                      </p>
                      <div className="text-xs text-text-muted mt-1.5">
                        {sanction.class_name || 'Sans classe'} --{' '}
                        {sanction.date}
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Priority students panel */}
        <motion.div variants={staggerItem}>
          <GlassCard hover={false} padding="p-0">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(0,0,0,0.06)]">
              <Users size={18} className="text-sky-500" />
              <span className="font-bold text-text">Priorites de suivi</span>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {data?.top_students?.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Aucun eleve prioritaire"
                  message="Rien a signaler."
                />
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="flex flex-col"
                >
                  {data?.top_students?.map((student, index) => (
                    <motion.article
                      key={`${student.username}-${index}`}
                      variants={staggerItem}
                      className="px-5 py-3 border-b border-[rgba(0,0,0,0.06)] last:border-0 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[rgba(0,122,255,0.06)] border border-[rgba(0,122,255,0.15)] flex items-center justify-center text-xs font-bold text-sky-600 shrink-0">
                        {getInitials(student.username)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-text text-sm">
                          {student.username}
                        </div>
                        <div className="text-xs text-text-muted">
                          {student.class_name || 'Sans classe'}
                        </div>
                      </div>
                      <Badge color="#38bdf8" size="xs">
                        {student.incidents_total} incidents
                      </Badge>
                    </motion.article>
                  ))}
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
