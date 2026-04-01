import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, CheckCircle, BookOpen, Calendar, Award, Clock3 } from 'lucide-react';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../../lib/animations';

export default function ProfessorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/professor/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader icon={BookOpen} title="Tableau de Bord" subtitle="Chargement..." accentColor="#5856D6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const m = data?.metrics || {};

  return (
    <div>
      <PageHeader icon={BookOpen} title="Tableau de Bord" subtitle="Espace pedagogique" accentColor="#5856D6" />

      {/* Metrics */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" variants={staggerContainer} initial="initial" animate="animate">
        <StatCard icon={GraduationCap} label="Classes" value={m.classes_total || 0} color="#5856D6" />
        <StatCard icon={Users} label="Eleves" value={m.students_total || 0} color="#34C759" />
        <StatCard icon={CheckCircle} label="Notes saisies" value={m.grades_total || 0} color="#007AFF" />
        <StatCard icon={BookOpen} label="Devoirs" value={m.homework_total || 0} color="#FF3B30" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Next courses */}
        <div className="lg:col-span-3">
          <GlassCard hover={false} padding="p-0">
            <div className="flex items-center gap-3" style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <Calendar size={18} className="text-professor" />
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.80)', letterSpacing: '-0.01em' }}>Prochains Cours</h3>
                <p style={{ fontSize: 12, color: 'rgba(60,60,67,0.45)', marginTop: 2 }}>Sequences pedagogiques a venir</p>
              </div>
            </div>
            <motion.div className="p-4 space-y-2" variants={staggerContainer} initial="initial" animate="animate">
              {data?.next_courses?.length ? data.next_courses.map((c, i) => (
                <motion.div key={`${c.class_name}-${c.subject}-${i}`} variants={staggerItem}
                  className="flex items-center gap-4 p-4 hover:bg-[rgba(0,0,0,0.06)] transition-colors"
                  style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10 }}
                >
                  <div className="w-20 shrink-0">
                    <p className="font-bold text-professor text-sm">{c.day_of_week}</p>
                    <p className="text-xs text-text-muted font-mono">{c.start_time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text">{c.subject}</p>
                    <p className="text-xs text-text-muted mt-0.5">{c.class_name} · Salle {c.room}</p>
                  </div>
                  {c.week_type && c.week_type !== 'Toutes' && (
                    <Badge color="#5856D6" size="xs">Sem. {c.week_type}</Badge>
                  )}
                </motion.div>
              )) : <p className="text-text-muted text-center py-8">Aucun cours</p>}
            </motion.div>
          </GlassCard>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent grades */}
          <GlassCard hover={false} padding="p-0">
            <div className="flex items-center gap-3" style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <Award size={18} className="text-accent" />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.80)', letterSpacing: '-0.01em' }}>Notes Recentes</h3>
            </div>
            <motion.div className="p-4 space-y-3" variants={staggerContainer} initial="initial" animate="animate">
              {data?.recent_grades?.length ? data.recent_grades.map((g, i) => (
                <motion.div key={`${g.student_username}-${g.date}-${i}`} variants={staggerItem}
                  className="flex items-center justify-between pb-3 last:pb-0"
                  style={{ borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}
                >
                  <div>
                    <p className="font-semibold text-sm text-text">{g.student_username}</p>
                    <p className="text-xs text-text-muted">{g.subject} · {g.date}</p>
                  </div>
                  <span className="font-bold text-accent">{g.grade}/20</span>
                </motion.div>
              )) : <p className="text-text-muted text-center py-6">Aucune note</p>}
            </motion.div>
          </GlassCard>

          {/* Recent homework */}
          <GlassCard hover={false} padding="p-0">
            <div className="flex items-center gap-3" style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <Clock3 size={18} className="text-error" />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.80)', letterSpacing: '-0.01em' }}>Devoirs Publies</h3>
            </div>
            <motion.div className="p-4 space-y-3" variants={staggerContainer} initial="initial" animate="animate">
              {data?.recent_homework?.length ? data.recent_homework.map((t, i) => (
                <motion.div key={`${t.class_name}-${t.date_due}-${i}`} variants={staggerItem}
                  className="p-3"
                  style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10 }}
                >
                  <p className="font-bold text-sm text-error">{t.class_name} · {t.subject}</p>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{t.content}</p>
                  <p className="text-xs font-semibold text-text mt-1">Pour le {t.date_due}</p>
                </motion.div>
              )) : <p className="text-text-muted text-center py-6">Aucun devoir</p>}
            </motion.div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
