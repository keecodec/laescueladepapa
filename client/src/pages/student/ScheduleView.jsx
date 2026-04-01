import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { fadeInUp } from '../../lib/animations';
import { getSubjectColor, dayOrder } from '../../lib/theme';
import { cn } from '../../lib/utils';

export default function ScheduleView({ user }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const endpoint =
          user?.role === 'professor' ? '/professor/schedule' : '/student/schedule';
        const res = await api.get(endpoint);
        setSchedule(res.data);
      } catch {
        toast.error("Impossible de charger l'emploi du temps");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user?.role]);

  // Week calculation
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
        dayNum: d.getDate(),
        isToday: d.toDateString() === new Date().toDateString(),
      });
    }
    return { startOfWeek, days };
  };

  const getWeekNumber = (d) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  };

  const { startOfWeek, days } = getWeekBounds(weekOffset);
  const weekEnd = new Date(startOfWeek);
  weekEnd.setDate(startOfWeek.getDate() + 5);

  const weekNo = getWeekNumber(startOfWeek);
  const currentWeekType = weekNo % 2 === 0 ? 'A' : 'B';
  const weekLabel = `${startOfWeek.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  })} - ${weekEnd.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  })}`;

  // Filter schedules for current week type
  const activeSchedules = schedule.filter(
    (s) => !s.week_type || s.week_type === 'Toutes' || s.week_type === currentWeekType
  );

  // Build subject color map for consistent coloring
  const subjectColorMap = useMemo(() => {
    const map = {};
    const subjects = [...new Set(schedule.map((s) => s.subject))];
    subjects.forEach((subj, i) => {
      map[subj] = getSubjectColor(i);
    });
    return map;
  }, [schedule]);

  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8-18

  // Current time indicator
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isCurrentWeek = weekOffset === 0;
  const todayIndex = days.findIndex((d) => d.isToday);
  const showTimeIndicator =
    isCurrentWeek && todayIndex >= 0 && currentMinutes >= 480 && currentMinutes <= 1080;

  // Calculate grid position for a schedule item
  const getGridPosition = (item) => {
    const dayIndex = days.findIndex((d) => d.name === item.day_of_week);
    if (dayIndex === -1) return null;

    const [startH, startM] = item.start_time.split(':').map(Number);
    const [endH, endM] = item.end_time.split(':').map(Number);

    const rowStart = (startH - 8) * 2 + (startM >= 30 ? 1 : 0) + 2;
    const rowEnd = (endH - 8) * 2 + (endM > 0 ? (endM >= 30 ? 2 : 1) : 0) + 2;

    return { dayIndex, rowStart, rowEnd };
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        icon={CalendarIcon}
        title="Emploi du temps"
        subtitle="Planning hebdomadaire des cours"
        accentColor="#007AFF"
      >
        {/* Week type badge */}
        <Badge
          color={currentWeekType === 'A' ? '#34C759' : '#AF52DE'}
          size="sm"
          className="font-semibold"
        >
          Semaine {currentWeekType}
        </Badge>

        {/* Week navigation */}
        <div className="flex items-center gap-1 bg-[#F2F2F7] p-1 rounded-[10px] border-[0.5px] border-[rgba(60,60,67,0.08)]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Semaine precedente"
          >
            <ChevronLeft size={18} />
          </Button>
          <span className="text-[15px] font-semibold text-text px-3 w-52 text-center whitespace-nowrap">
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
          <div className="w-px h-5 bg-[rgba(60,60,67,0.12)] mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekOffset(0)}
            className="text-[#007AFF] hover:text-[#0062CC]"
          >
            <CalendarDays size={14} />
            Aujourd&apos;hui
          </Button>
        </div>
      </PageHeader>

      <GlassCard hover={false} padding="p-4" className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-4">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-[500px] w-full" />
          </div>
        ) : activeSchedules.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="Aucun cours programme"
            message="Votre emploi du temps pour cette semaine est vide."
          />
        ) : (
          <motion.div
            className="min-w-[900px] relative"
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={fadeInUp.transition}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: '64px repeat(6, 1fr)',
                gridTemplateRows: '56px repeat(22, 32px)',
              }}
            >
              {/* Today column highlight */}
              {days.map((day, i) =>
                day.isToday ? (
                  <div
                    key={`today-bg-${i}`}
                    className="pointer-events-none"
                    style={{
                      gridColumn: i + 2,
                      gridRow: '1 / -1',
                      background: 'rgba(0, 122, 255, 0.04)',
                      borderRadius: '8px',
                    }}
                  />
                ) : null
              )}

              {/* Day headers */}
              <div className="border-b border-[rgba(60,60,67,0.12)]" />
              {days.map((day, i) => (
                <div
                  key={day.name}
                  className="flex flex-col items-center justify-center pb-2 border-b border-[rgba(60,60,67,0.12)]"
                  style={{ gridColumn: i + 2, gridRow: 1 }}
                >
                  <span
                    className={cn(
                      'text-[13px] font-medium',
                      day.isToday ? 'text-[#007AFF]' : 'text-text-secondary'
                    )}
                  >
                    {day.name}
                  </span>
                  {day.isToday ? (
                    <span className="mt-0.5 w-7 h-7 rounded-full bg-[#007AFF] text-white text-[13px] font-bold flex items-center justify-center">
                      {day.dayNum}
                    </span>
                  ) : (
                    <span className="text-[13px] mt-0.5 text-text-secondary">
                      {day.dateStr}
                    </span>
                  )}
                </div>
              ))}

              {/* Hour lines */}
              {hours.map((h, i) => (
                <div
                  key={h}
                  className="relative"
                  style={{
                    gridColumn: '1 / -1',
                    gridRow: i * 2 + 2,
                    borderTop: '0.5px solid rgba(60, 60, 67, 0.12)',
                  }}
                >
                  <span className="absolute -top-2.5 left-1 text-[11px] font-medium text-text-muted tabular-nums">
                    {h.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}

              {/* Current time indicator — clean Apple red line */}
              {showTimeIndicator && (
                <div
                  className="absolute left-16 right-0 z-20 pointer-events-none"
                  style={{
                    top: `calc(56px + ${(currentMinutes - 480) * (32 / 30)}px)`,
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#FF3B30] -ml-1" />
                    <div className="flex-1 h-[1px] bg-[#FF3B30]" />
                  </div>
                </div>
              )}

              {/* Schedule items */}
              {activeSchedules.map((item, idx) => {
                const pos = getGridPosition(item);
                if (!pos) return null;

                const color = subjectColorMap[item.subject] || '#007AFF';

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: idx * 0.02, ease: [0.2, 0.8, 0.2, 1] }}
                    className={cn(
                      'relative flex flex-col gap-0.5 rounded-xl m-0.5 p-2 overflow-hidden z-10',
                      'border-l-[3px] cursor-pointer',
                      'hover:opacity-80 transition-opacity duration-200'
                    )}
                    style={{
                      gridColumn: pos.dayIndex + 2,
                      gridRow: `${pos.rowStart} / ${pos.rowEnd}`,
                      backgroundColor: `${color}18`,
                      borderLeftColor: color,
                    }}
                  >
                    <span
                      className="text-[13px] font-semibold leading-tight truncate"
                      style={{ color }}
                    >
                      {item.subject}
                    </span>
                    <span className="text-[11px] text-text-secondary flex items-center gap-1">
                      <Clock size={9} />
                      {item.start_time} - {item.end_time}
                    </span>
                    <span className="text-[11px] text-text-secondary flex items-center gap-1">
                      <MapPin size={9} />
                      {item.room}
                    </span>
                    {(item.professor || item.class_name) && (
                      <span className="text-[11px] font-medium text-text flex items-center gap-1 mt-auto">
                        <User size={9} />
                        {item.professor || item.class_name}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}
