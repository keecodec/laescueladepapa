import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CalendarDays,
  BookOpenCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../../lib/animations';
import { cn } from '../../lib/utils';

export default function HomeworkView() {
  const [allHomework, setAllHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const res = await api.get('/student/homework');
        setAllHomework(
          res.data.map((h) => {
            const [dd, mm, yyyy] = h.date_due.split('/');
            const dateObj = new Date(yyyy, mm - 1, dd);
            return { ...h, dateObj };
          })
        );
      } catch {
        toast.error('Impossible de charger le cahier de textes');
      } finally {
        setLoading(false);
      }
    };
    fetchHomework();
  }, []);

  const getWeekBounds = (offset) => {
    const now = new Date();
    const currentDay = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay + 1 + offset * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    for (let i = 0; i < 6; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        name: dayNames[i],
        dateStr: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        dateLong: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
        dateObj: d,
        isToday: d.toDateString() === new Date().toDateString(),
      });
    }
    return { startOfWeek, days };
  };

  const { startOfWeek, days } = getWeekBounds(weekOffset);
  const weekEnd = new Date(startOfWeek);
  weekEnd.setDate(startOfWeek.getDate() + 5);
  const weekLabel = `${startOfWeek.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  })} - ${weekEnd.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  })}`;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={FileText}
        title="Cahier de Textes"
        subtitle="Devoirs et travaux a realiser"
        accentColor="#007AFF"
      >
        {/* Week navigation */}
        <div className="flex items-center gap-1 bg-[rgba(0,0,0,0.03)] p-1 rounded-xl border border-[rgba(0,0,0,0.06)]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Semaine precedente"
          >
            <ChevronLeft size={18} />
          </Button>
          <span className="text-sm font-semibold text-text px-3 w-52 text-center whitespace-nowrap">
            {weekLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Semaine suivante"
          >
            <ChevronRight size={18} />
          </Button>
          <div className="w-px h-5 bg-[rgba(0,0,0,0.08)] mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekOffset(0)}
            className="text-[#007AFF] hover:text-[#007AFF]"
          >
            <CalendarDays size={14} />
            Aujourd&apos;hui
          </Button>
        </div>
      </PageHeader>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {days.map((day) => {
            const tasks = allHomework.filter(
              (hw) => hw.dateObj.toDateString() === day.dateObj.toDateString()
            );

            return (
              <motion.div key={day.dateStr} variants={staggerItem}>
                <GlassCard
                  hover={false}
                  className={cn(
                    'transition-all duration-300',
                    day.isToday &&
                      'ring-1 ring-emerald-500/40 shadow-[0_0_20px_rgba(5,150,105,0.1)]'
                  )}
                >
                  {/* Day header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          day.isToday ? 'bg-[#34C759] animate-pulse' : 'bg-[rgba(0,0,0,0.08)]'
                        )}
                      />
                      <h2
                        className={cn(
                          'text-lg font-bold',
                          day.isToday ? 'text-text' : 'text-text-secondary'
                        )}
                      >
                        {day.name}{' '}
                        <span className="font-normal text-text-muted">{day.dateLong}</span>
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      {day.isToday && (
                        <Badge variant="primary" pulse size="xs">
                          Aujourd&apos;hui
                        </Badge>
                      )}
                      {tasks.length > 0 && (
                        <Badge variant="default" size="xs">
                          {tasks.length} tache{tasks.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Tasks */}
                  {tasks.length === 0 ? (
                    <p className="text-sm text-text-muted/40 italic pl-5">
                      Aucun travail pour ce jour.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {tasks.map((task, i) => (
                        <div
                          key={i}
                          className={cn(
                            'group relative flex gap-4 p-4 rounded-xl',
                            'bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.06)]',
                            'hover:bg-[rgba(0,0,0,0.06)] hover:border-gray-300',
                            'transition-all duration-200'
                          )}
                        >
                          {/* Left color accent */}
                          <div className="w-1 shrink-0 rounded-full bg-[rgba(52,199,89,0.60)]" />

                          <div className="flex-1 min-w-0">
                            {/* Badge */}
                            <Badge color="#FF9500" size="xs" className="mb-2">
                              <ClipboardList size={10} />
                              A rendre
                            </Badge>

                            {/* Subject */}
                            <h3 className="text-sm font-bold text-[#34C759] mb-1.5">
                              {task.subject}
                            </h3>

                            {/* Content */}
                            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                              {task.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}

          {/* Check if entire week is empty */}
          {days.every(
            (day) =>
              allHomework.filter(
                (hw) => hw.dateObj.toDateString() === day.dateObj.toDateString()
              ).length === 0
          ) && (
            <GlassCard hover={false}>
              <EmptyState
                icon={BookOpenCheck}
                title="Semaine sans devoirs"
                message="Aucun travail n'est prevu pour cette semaine. Profitez-en pour reviser !"
              />
            </GlassCard>
          )}
        </motion.div>
      )}
    </div>
  );
}
