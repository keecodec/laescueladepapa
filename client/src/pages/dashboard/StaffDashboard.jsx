import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, AlertTriangle, ShieldAlert, Shield, Users } from 'lucide-react';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../../lib/animations';

export default function StaffDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/staff/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader icon={Shield} title="Tableau de Bord" subtitle="Chargement..." accentColor="#FF9500" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const m = data?.metrics || {};

  return (
    <div>
      <PageHeader icon={Shield} title="Tableau de Bord" subtitle="Supervision Vie Scolaire" accentColor="#FF9500" />

      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" variants={staggerContainer} initial="initial" animate="animate">
        <StatCard icon={Clock3} label="Absences" value={m.absences_total || 0} color="#FF9500" />
        <StatCard icon={AlertTriangle} label="Non justifiees" value={m.unjustified_total || 0} color="#FF3B30" />
        <StatCard icon={ShieldAlert} label="Sanctions" value={m.sanctions_total || 0} color="#FF3B30" />
        <StatCard icon={Shield} label="Incidents du jour" value={m.incidents_today || 0} color="#007AFF" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent absences */}
        <GlassCard hover={false} padding="p-0">
          <div className="flex items-center gap-3" style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <Clock3 size={18} className="text-warning" />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.80)', letterSpacing: '-0.01em' }}>Absences Recentes</h3>
          </div>
          <motion.div className="p-4 space-y-2 max-h-[400px] overflow-y-auto" variants={staggerContainer} initial="initial" animate="animate">
            {data?.recent_absences?.length ? data.recent_absences.map((a, i) => (
              <motion.div key={`${a.student_username}-${a.date}-${i}`} variants={staggerItem}
                className="p-3"
                style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-sm text-text">{a.student_username}</p>
                  <Badge variant={a.justified ? 'success' : 'error'} size="xs">
                    {a.justified ? 'Justifiee' : 'A regulariser'}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">
                  {a.class_name || 'Sans classe'} · {a.date} · {a.is_late ? 'Retard' : 'Absence'}
                </p>
              </motion.div>
            )) : <p className="text-text-muted text-center py-8">Aucun incident</p>}
          </motion.div>
        </GlassCard>

        {/* Recent sanctions */}
        <GlassCard hover={false} padding="p-0">
          <div className="flex items-center gap-3" style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <ShieldAlert size={18} className="text-error" />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.80)', letterSpacing: '-0.01em' }}>Sanctions Recentes</h3>
          </div>
          <motion.div className="p-4 space-y-2 max-h-[400px] overflow-y-auto" variants={staggerContainer} initial="initial" animate="animate">
            {data?.recent_sanctions?.length ? data.recent_sanctions.map((s, i) => (
              <motion.div key={`${s.student_username}-${s.date}-${i}`} variants={staggerItem}
                className="p-3"
                style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10 }}
              >
                <Badge color="#FF3B30" size="xs">{s.type}</Badge>
                <p className="font-semibold text-sm text-text mt-1">{s.student_username}</p>
                <p className="text-xs text-text-muted">{s.class_name || 'Sans classe'} · {s.date}</p>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{s.reason}</p>
              </motion.div>
            )) : <p className="text-text-muted text-center py-8">Aucune sanction</p>}
          </motion.div>
        </GlassCard>

        {/* Top students */}
        <GlassCard hover={false} padding="p-0">
          <div className="flex items-center gap-3" style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <Users size={18} className="text-info" />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.80)', letterSpacing: '-0.01em' }}>Eleves a Suivre</h3>
          </div>
          <motion.div className="p-4 space-y-2 max-h-[400px] overflow-y-auto" variants={staggerContainer} initial="initial" animate="animate">
            {data?.top_students?.length ? data.top_students.map((s, i) => (
              <motion.div key={`${s.username}-${i}`} variants={staggerItem}
                className="flex items-center justify-between p-3"
                style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10 }}
              >
                <div>
                  <p className="font-semibold text-sm text-text">{s.username}</p>
                  <p className="text-xs text-text-muted">{s.class_name || 'Sans classe'}</p>
                </div>
                <span className="text-lg font-bold text-info tabular-nums">{s.incidents_total}</span>
              </motion.div>
            )) : <p className="text-text-muted text-center py-8">Aucun eleve critique</p>}
          </motion.div>
        </GlassCard>
      </div>
    </div>
  );
}
