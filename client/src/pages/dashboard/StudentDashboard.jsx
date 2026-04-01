import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Calendar, CheckCircle, TrendingUp } from 'lucide-react';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import GlassCard from '../../components/ui/GlassCard';
import ProgressRing from '../../components/ui/ProgressRing';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../../lib/animations';
import { getGradeColor } from '../../lib/theme';
import { formatTime } from '../../lib/utils';

export default function StudentDashboard() {
  const [schedule, setSchedule] = useState([]);
  const [homework, setHomework] = useState([]);
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/schedule'),
      api.get('/student/homework'),
      api.get('/student/grades'),
    ]).then(([s, h, g]) => {
      setSchedule(s.data);
      setHomework(h.data);
      setGrades(g.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader icon={Award} title="Tableau de Bord" subtitle="Chargement..." accentColor="#007AFF" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  let todayStr = days[new Date().getDay()];
  let todaySchedule = schedule.filter(i => i.day_of_week === todayStr);
  if (!todaySchedule.length) {
    todayStr = 'Lundi';
    todaySchedule = schedule.filter(i => i.day_of_week === 'Lundi');
  }

  const nextHomework = homework.slice(0, 4);

  let lastGrades = [];
  if (grades?.subjects) {
    grades.subjects.forEach(s => s.grades.forEach(g => lastGrades.push({ ...g, subject: s.name })));
    lastGrades.sort((a, b) => {
      const [ad, am, ay] = a.date.split('/');
      const [bd, bm, by] = b.date.split('/');
      return new Date(by, bm - 1, bd) - new Date(ay, am - 1, ad);
    });
    lastGrades = lastGrades.slice(0, 5);
  }

  return (
    <div>
      <PageHeader icon={Award} title="Tableau de Bord" subtitle="Vue d'ensemble de votre parcours" accentColor="#007AFF" />

      {/* Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <GlassCard className="flex flex-col items-center py-8" hover={false}>
            <ProgressRing value={grades?.general_student_average} label="Moyenne Generale" size={130} />
          </GlassCard>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <GlassCard className="flex flex-col items-center py-8" hover={false}>
            <ProgressRing value={grades?.general_class_average} label="Moyenne de Classe" size={130} />
          </GlassCard>
        </div>
        <StatCard icon={BookOpen} label="Devoirs" value={homework.length} color="#34C759" />
        <StatCard icon={Calendar} label={`Cours - ${todayStr}`} value={todaySchedule.length} color="#5856D6" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-3">
          <GlassCard hover={false} padding="p-0">
            <div className="flex items-center gap-3" style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <Calendar size={18} className="text-accent" />
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.80)', letterSpacing: '-0.01em' }}>Emploi du temps - {todayStr}</h3>
                <p style={{ fontSize: 12, color: 'rgba(60,60,67,0.45)', marginTop: 2 }}>Vos cours du jour</p>
              </div>
            </div>
            <motion.div className="p-4 space-y-2" variants={staggerContainer} initial="initial" animate="animate">
              {todaySchedule.length === 0 ? (
                <p className="text-text-muted text-center py-8">Aucun cours aujourd'hui</p>
              ) : todaySchedule.map((item, i) => (
                <motion.div
                  key={`${item.subject}-${item.start_time}-${i}`}
                  variants={staggerItem}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-[rgba(0,0,0,0.06)] transition-colors border-l-[3px]"
                  style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10, borderColor: '#007AFF' }}
                >
                  <div className="text-sm text-text-muted font-mono w-20 shrink-0">
                    <div className="font-semibold text-text">{formatTime(item.start_time)}</div>
                    <div>{formatTime(item.end_time)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text">{item.subject}</p>
                    <p className="text-xs text-text-muted mt-0.5">Salle {item.room} · {item.professor}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent grades */}
          <GlassCard hover={false} padding="p-0">
            <div className="flex items-center gap-3" style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <CheckCircle size={18} className="text-warning" />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.80)', letterSpacing: '-0.01em' }}>Dernieres Notes</h3>
            </div>
            <motion.div className="p-4 space-y-3" variants={staggerContainer} initial="initial" animate="animate">
              {lastGrades.length === 0 ? (
                <p className="text-text-muted text-center py-6">Aucune note</p>
              ) : lastGrades.map((g, i) => (
                <motion.div key={`${g.subject}-${g.date}-${i}`} variants={staggerItem} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-text truncate">{g.subject}</p>
                    <p className="text-xs text-text-muted">{g.date}</p>
                  </div>
                  <span className="text-lg font-bold tabular-nums" style={{ color: getGradeColor(g.grade) }}>
                    {g.grade.toFixed(1)}<span className="text-xs text-text-muted font-normal">/20</span>
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>

          {/* Homework */}
          <GlassCard hover={false} padding="p-0">
            <div className="flex items-center gap-3" style={{ padding: '14px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <BookOpen size={18} className="text-secondary" />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.80)', letterSpacing: '-0.01em' }}>Travail a Rendre</h3>
            </div>
            <motion.div className="p-4 space-y-3" variants={staggerContainer} initial="initial" animate="animate">
              {nextHomework.length === 0 ? (
                <p className="text-text-muted text-center py-6">Aucun devoir</p>
              ) : nextHomework.map((t, i) => (
                <motion.div key={`${t.subject}-${t.date_due}-${i}`} variants={staggerItem} className="p-3 border-l-[3px] border-secondary" style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10 }}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-bold text-secondary">{t.subject}</span>
                    <Badge variant="success" size="xs">{t.date_due}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">{t.content}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
