import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../../lib/animations';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Tableau de Bord" subtitle="Administration Système" />
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const m = data?.metrics || {};

  return (
    <div>
      <PageHeader title="Tableau de Bord" subtitle="Administration Système" />

      {/* Stats grid — all same color (#007AFF or neutral) */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6"
        variants={staggerContainer} initial="initial" animate="animate"
      >
        <StatCard label="Utilisateurs"  value={m.users_total || 0} />
        <StatCard label="Élèves"        value={m.students_total || 0} />
        <StatCard label="Professeurs"   value={m.professors_total || 0} />
        <StatCard label="Vie Scolaire"  value={m.staff_total || 0} />
        <StatCard label="Classes"       value={m.classes_total || 0} />
        <StatCard label="Matières"      value={m.subjects_total || 0} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent users */}
        <GlassCard hover={false} padding="p-0">
          <div style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.80)', letterSpacing: '-0.01em' }}>
              Derniers Comptes
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(60,60,67,0.45)', marginTop: 2 }}>
              Ouvertures récentes
            </p>
          </div>
          <motion.div style={{ padding: '8px 0' }} variants={staggerContainer} initial="initial" animate="animate">
            {data?.recent_users?.length ? data.recent_users.map((u, i) => (
              <motion.div
                key={`${u.username}-${i}`} variants={staggerItem}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 18px',
                  borderBottom: i < data.recent_users.length - 1 ? '0.5px solid rgba(0,0,0,0.04)' : 'none',
                }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.80)' }}>{u.username}</p>
                  <p style={{ fontSize: 11, color: 'rgba(60,60,67,0.40)', marginTop: 1 }}>{u.created_at}</p>
                </div>
                <Badge variant={u.role}>{u.role}</Badge>
              </motion.div>
            )) : (
              <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: 'rgba(60,60,67,0.35)' }}>
                Aucun compte récent
              </p>
            )}
          </motion.div>
        </GlassCard>

        {/* Security events */}
        <GlassCard hover={false} padding="p-0">
          <div style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.80)', letterSpacing: '-0.01em' }}>
              Sécurité
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(60,60,67,0.45)', marginTop: 2 }}>
              Événements récents
            </p>
          </div>
          <motion.div style={{ padding: '8px 10px' }} variants={staggerContainer} initial="initial" animate="animate">
            {data?.recent_audits?.length ? data.recent_audits.map((a, i) => (
              <motion.div
                key={`${a.action}-${i}`} variants={staggerItem}
                style={{
                  padding: '10px 10px',
                  borderRadius: 10,
                  marginBottom: 2,
                  background: 'rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Badge
                    variant={a.action?.includes('SUCCESS') ? 'success' : a.action?.includes('FAILED') || a.action?.includes('VIOLATION') ? 'error' : 'warning'}
                    size="xs"
                  >
                    {a.action}
                  </Badge>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.75)' }}>{a.username_attempt || 'Système'}</p>
                <p style={{ fontSize: 11, color: 'rgba(60,60,67,0.40)', marginTop: 1 }}>{a.created_at}</p>
              </motion.div>
            )) : (
              <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: 'rgba(60,60,67,0.35)' }}>
                Aucun événement
              </p>
            )}
          </motion.div>
        </GlassCard>
      </div>
    </div>
  );
}
