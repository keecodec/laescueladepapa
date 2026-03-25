import { useState, useEffect } from 'react';
import { FileText, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import api from '../../api';

export default function HomeworkView() {
  const [allHomework, setAllHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const res = await api.get('/student/homework');
        // Formatage de la date renvoyée par le backend DD/MM/YYYY vers un objet Date natif JavaScript
        setAllHomework(res.data.map(h => {
             const [dd, mm, yyyy] = h.date_due.split('/');
             const dateObj = new Date(yyyy, mm - 1, dd);
             return { ...h, dateObj };
        }));
      } catch (err) {
        console.error("Erreur de chargement du cahier de textes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomework();
  }, []);

  // Logique du slider "Semaine précédente / Suivante"
  const getWeekBounds = (offset) => {
      const now = new Date();
      // On compense le fait que getDay() => Dimanche=0. On veut que Lundi soit le 1er jour.
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
              dateObj: d,
              isToday: d.toDateString() === new Date().toDateString()
          });
      }
      return { startOfWeek, days };
  };

  const { startOfWeek, days } = getWeekBounds(weekOffset);
  const weekEnd = new Date(startOfWeek);
  weekEnd.setDate(startOfWeek.getDate() + 5); // Samedi
  const weekLabel = `Du ${startOfWeek.toLocaleDateString('fr-FR', {day:'numeric', month:'long'})} au ${weekEnd.toLocaleDateString('fr-FR', {day:'numeric', month:'long'})}`;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Top Bar Slider Pronote */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <FileText size={32} color="var(--primary)" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>Cahier de Textes</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <button className="btn btn-outline" style={{padding: '0.5rem', border: 'none'}} onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft size={20}/></button>
             <span style={{ fontWeight: '600', width: '250px', textAlign: 'center', color: 'white' }}>{weekLabel}</span>
             <button className="btn btn-outline" style={{padding: '0.5rem', border: 'none'}} onClick={() => setWeekOffset(w => w + 1)}><ChevronRight size={20}/></button>
             <div style={{width: '2px', height: '20px', background: 'rgba(255,255,255,0.1)'}}></div>
             <button className="btn btn-outline" style={{padding: '0.5rem 1rem', border: 'none', color: 'var(--primary)'}} onClick={() => setWeekOffset(0)}>Aujourd'hui</button>
        </div>
      </header>

      {loading ? (
          <div style={{textAlign:'center', color:'var(--text-secondary)', padding:'3rem', fontWeight: '500'}}>Synchronisation du cahier de texte...</div>
      ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {days.map(day => {
                  const tasks = allHomework.filter(hw => hw.dateObj.toDateString() === day.dateObj.toDateString());
                  
                  return (
                      <div key={day.dateStr} className="glass-card" style={{ padding: '1.5rem 2rem', borderLeft: day.isToday ? '4px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', background: day.isToday ? 'rgba(79, 70, 229, 0.05)' : undefined }}>
                          
                          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: day.isToday ? 'white' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '700' }}>
                              <span>{day.name} {day.dateStr}</span>
                              {day.isToday && <span style={{background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: '12px', textTransform:'uppercase', letterSpacing: '1px'}}>Aujourd'hui</span>}
                          </h2>
                          
                          {tasks.length === 0 ? (
                              <p style={{ color: 'rgba(255,255,255,0.15)', fontStyle: 'italic', fontSize: '0.95rem' }}>Aucun travail à réaliser pour ce jour.</p>
                          ) : (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '1.5rem' }}>
                                  {tasks.map((task, i) => (
                                      <div key={i} className="animate-fade-in" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid var(--secondary)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background='rgba(255,255,255,0.02)'}>
                                          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                                              <CheckCircle size={20} color="var(--success)" />
                                          </div>
                                          <div>
                                              <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Travail à Rendre</span>
                                              <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '0.5rem', color: '#6ee7b7' }}>{task.subject}</strong>
                                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{task.content}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
}
