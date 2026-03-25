import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api';

export default function ScheduleView({ user }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const endpoint = user?.role === 'professor' ? '/professor/schedule' : '/student/schedule';
        const res = await api.get(endpoint);
        setSchedule(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  // Génération dynamique des dates
  const getWeekBounds = (offset) => {
      const now = new Date();
      const currentDay = now.getDay() || 7; 
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - currentDay + 1 + (offset * 7));
      startOfWeek.setHours(0,0,0,0);
      
      const days = [];
      const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      for (let i=0; i<6; i++) {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          days.push({
              name: dayNames[i],
              dateStr: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
              isToday: d.toDateString() === new Date().toDateString()
          });
      }
      return { startOfWeek, days };
  };

  const getWeekNumber = (d) => {
      const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
      return Math.ceil((((date - yearStart) / 86400000) + 1)/7);
  };

  const { startOfWeek, days } = getWeekBounds(weekOffset);
  const weekEnd = new Date(startOfWeek);
  weekEnd.setDate(startOfWeek.getDate() + 5);
  
  // Algorithme éducatif Pronote : Identification SEMAINE A (Paire) / SEMAINE B (Impaire)
  const weekNo = getWeekNumber(startOfWeek);
  const currentWeekType = weekNo % 2 === 0 ? 'A' : 'B';
  const weekLabel = `Du ${startOfWeek.toLocaleDateString('fr-FR', {day:'numeric', month:'long'})} au ${weekEnd.toLocaleDateString('fr-FR', {day:'numeric', month:'long'})}`;

  // Filtrage du calendrier complet reçu par l'API selon le type de la semaine en cours
  const activeSchedules = schedule.filter(s => !s.week_type || s.week_type === 'Toutes' || s.week_type === currentWeekType);

  const hours = Array.from({ length: 11 }, (_, i) => i + 8);

  const hashCode = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
  };

  const getItemStyle = (item) => {
      const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'];
      const bgColors = ['rgba(79, 70, 229, 0.2)', 'rgba(16, 185, 129, 0.2)', 'rgba(245, 158, 11, 0.2)', 'rgba(239, 68, 68, 0.2)', 'rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)'];
      
      const cIdx = hashCode(item.subject) % colors.length;
      const dayIndex = days.findIndex(d => d.name === item.day_of_week);
      
      if (dayIndex === -1) return {display: 'none'};

      const [startH, startM] = item.start_time.split(':').map(Number);
      const [endH, endM] = item.end_time.split(':').map(Number);
      
      const rowStart = (startH - 8) * 2 + (startM >= 30 ? 1 : 0) + 2;
      const rowEnd = (endH - 8) * 2 + (endM > 0 ? (endM >= 30 ? 2 : 1) : 0) + 2;
      
      return {
          gridColumn: dayIndex + 2,
          gridRow: `${rowStart} / ${rowEnd}`,
          backgroundColor: bgColors[cIdx],
          borderLeft: `4px solid ${colors[cIdx]}`,
          borderRadius: '6px',
          padding: '0.6rem',
          margin: '2px',
          fontSize: '0.85rem'
      };
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <CalendarIcon size={32} color="var(--primary)" />
          <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>Emploi du Temps</h1>
              {/* Badge dynamique Semaine A/B */}
              <div style={{ display: 'inline-block', background: currentWeekType === 'A' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(129, 140, 248, 0.2)', color: currentWeekType === 'A' ? '#6ee7b7' : '#818cf8', padding: '0.2rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginTop: '0.5rem', letterSpacing: '1px', border: currentWeekType === 'A' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(129, 140, 248, 0.4)' }}>
                  SEMAINE {currentWeekType}
              </div>
          </div>
        </div>
        
        {/* Slider de semaines interactif */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <button className="btn btn-outline" style={{padding: '0.5rem', border: 'none'}} onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft size={20}/></button>
             <span style={{ fontWeight: '600', width: '250px', textAlign: 'center', color: 'white' }}>{weekLabel}</span>
             <button className="btn btn-outline" style={{padding: '0.5rem', border: 'none'}} onClick={() => setWeekOffset(w => w + 1)}><ChevronRight size={20}/></button>
             <div style={{width: '2px', height: '20px', background: 'rgba(255,255,255,0.1)'}}></div>
             <button className="btn btn-outline" style={{padding: '0.5rem 1rem', border: 'none', color: 'var(--primary)'}} onClick={() => setWeekOffset(0)}>Aujourd'hui</button>
        </div>
      </header>

      <div className="glass-card" style={{ padding: '2rem', overflowX: 'auto' }}>
        {loading ? (
             <div style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Synchronisation avec l'architecture A/B...</div>
        ) : (
            <div style={{ minWidth: '950px', display: 'grid', gridTemplateColumns: '70px repeat(6, 1fr)', gridTemplateRows: '70px repeat(22, 35px)', gap: '0' }}>
               {/* Headers Jours */}
               <div></div>
               {days.map((day, i) => (
                   <div key={day.name} style={{ gridColumn: i+2, gridRow: 1, textAlign: 'center', color: day.isToday ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'center', paddingBottom: '0.5rem' }}>
                       <span style={{fontWeight: day.isToday ? '800' : '600'}}>{day.name}</span>
                       <span style={{fontSize: '0.85rem', fontWeight: day.isToday ? '800' : '500', color: day.isToday ? 'white' : 'inherit'}}>{day.dateStr}</span>
                   </div>
               ))}
               
               {/* Grille Heures (Lignes de repère) */}
               {hours.map((h, i) => (
                   <div key={h} style={{ gridColumn: '1 / -1', gridRow: i*2 + 2, borderTop: '1px solid rgba(255,255,255,0.03)', zIndex: 0, position: 'relative' }}>
                       <span style={{ position: 'absolute', top: '-10px', left: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                           {h.toString().padStart(2, '0')}:00
                       </span>
                   </div>
               ))}

               {/* Cartes de Cours périodiques filtrées A/B */}
               {activeSchedules.map((item, idx) => (
                   <div key={idx} className="animate-fade-in" style={{...getItemStyle(item), zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden', cursor: 'pointer', transition: 'filter 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.filter='brightness(1.2)'} onMouseLeave={(e) => e.currentTarget.style.filter='brightness(1)'}>
                       <strong style={{color: 'white', fontSize: '0.9rem', lineHeight: '1.1'}}>{item.subject}</strong>
                       <span style={{color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem'}}><Clock size={10}/> {item.start_time} - {item.end_time}</span>
                       <span style={{color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem'}}><MapPin size={10}/> Salle {item.room}</span>
                       <span style={{color: 'white', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', marginTop: 'auto', fontWeight: '800'}}><User size={12}/> {item.professor || item.class_name}</span>
                   </div>
               ))}
            </div>
        )}
      </div>
    </div>
  );
}
