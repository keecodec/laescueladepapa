import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { fetchCsrfToken } from '../api';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   macOS Sonoma–style animated gradient background
   Slow, smooth, organic — like the macOS wallpaper
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SonomaBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;  // retina
      canvas.height = canvas.offsetHeight * 2;
    };
    resize();
    window.addEventListener('resize', resize);

    // Soft, Apple-like palette — visible movement speeds
    const orbs = [
      { x: 0.25, y: 0.25, r: 0.55, h: 220, s: 80, l: 55, ox: 0.12, oy: 0.10, sp: 0.0020 }, // blue
      { x: 0.75, y: 0.20, r: 0.45, h: 260, s: 60, l: 50, ox: 0.10, oy: 0.14, sp: 0.0025 }, // purple
      { x: 0.80, y: 0.75, r: 0.50, h: 340, s: 65, l: 55, ox: 0.14, oy: 0.08, sp: 0.0018 }, // rose
      { x: 0.20, y: 0.70, r: 0.40, h: 165, s: 55, l: 45, ox: 0.08, oy: 0.12, sp: 0.0030 }, // teal
      { x: 0.50, y: 0.50, r: 0.60, h: 30,  s: 70, l: 60, ox: 0.15, oy: 0.15, sp: 0.0015 }, // warm orange glow
    ];

    const draw = () => {
      t++;
      const W = canvas.width, H = canvas.height;

      // Soft dark base
      ctx.fillStyle = '#0c0c1a';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';

      orbs.forEach(o => {
        const cx = (o.x + Math.sin(t * o.sp) * o.ox) * W;
        const cy = (o.y + Math.cos(t * o.sp * 0.83) * o.oy) * H;
        const R = o.r * Math.min(W, H);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        grad.addColorStop(0,   `hsla(${o.h}, ${o.s}%, ${o.l}%, 0.45)`);
        grad.addColorStop(0.4, `hsla(${o.h}, ${o.s}%, ${o.l}%, 0.15)`);
        grad.addColorStop(1,   `hsla(${o.h}, ${o.s}%, ${o.l}%, 0)`);

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

/* ━━━━━━━━━━━━ LOGIN PAGE ━━━━━━━━━━━━ */
export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchCsrfToken();
      const res = await api.post('/auth/login', { username, password });
      onLoginSuccess(res.data.user);
      toast.success(`Bienvenue, ${res.data.user.username}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    height: 48,
    boxSizing: 'border-box',
    padding: '0 16px',
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif',
    color: '#1d1d1f',
    background: focusedField === field ? '#ffffff' : '#f5f5f7',
    border: focusedField === field ? '2px solid #0071e3' : '2px solid #d2d2d7',
    borderRadius: 12,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(0,113,227,0.15)' : 'none',
  });

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif',
    }}>

      {/* ═══ LEFT PANEL — Apple-authentic white form ═══ */}
      <div style={{
        width: 480,
        flexShrink: 0,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 60px',
        position: 'relative',
        zIndex: 2,
      }}>
        <motion.div
          style={{ width: '100%', maxWidth: 320 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Logo — Apple-style colored dot ring */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <svg width="72" height="72" viewBox="0 0 72 72" style={{ margin: '0 auto 20px', display: 'block' }}>
                {/* Colored dot ring — inspired by Apple Account icon */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
                  const cx = 36 + Math.cos(angle) * 28;
                  const cy = 36 + Math.sin(angle) * 28;
                  const hue = (i / 24) * 360;
                  return (
                    <motion.circle
                      key={i}
                      cx={cx} cy={cy} r={3.2}
                      fill={`hsl(${hue}, 70%, 58%)`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.03, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    />
                  );
                })}
                {/* Central icon */}
                <g transform="translate(36,36)">
                  <rect x="-12" y="-12" width="24" height="24" rx="6" fill="#1d1d1f" />
                  <BookOpen x={-8} y={-8} width={16} height={16} color="white" strokeWidth={1.8} style={{ transform: 'translate(-8px, -8px)' }} />
                </g>
              </svg>
            </motion.div>

            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#1d1d1f',
              letterSpacing: '-0.04em',
              lineHeight: 1.15,
              margin: '0 0 8px',
            }}>
              EscuelaOS
            </h1>
            <p style={{
              fontSize: 16,
              color: '#86868b',
              fontWeight: 400,
              lineHeight: 1.4,
            }}>
              Connectez-vous à votre espace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Identifiant"
                required
                autoComplete="username"
                style={inputStyle('username')}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
                autoComplete="current-password"
                style={inputStyle('password')}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: '100%',
                height: 48,
                background: '#0071e3',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                fontFamily: 'inherit',
                letterSpacing: '-0.01em',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.65 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'opacity 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#0077ED')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#0071e3')}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5"/>
                    <path d="M8 2A6 6 0 0 1 14 8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  Connexion…
                </>
              ) : (
                <>Continuer <ArrowRight size={16} strokeWidth={2.2} /></>
              )}
            </motion.button>
          </form>

        </motion.div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 11, color: '#aeaeb2' }}>
            © 2025 EscuelaOS · Accès sécurisé
          </p>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — macOS Sonoma animated gradient + floating glass ═══ */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <SonomaBackground />

        {/* Subtle grain overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />

        {/* ── Floating glass bubbles ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
          {[
            { size: 90,  x: '12%', y: '8%',  dur: 7,  delay: 0,   rx: 26 },
            { size: 65,  x: '72%', y: '15%', dur: 9,  delay: 0.5, rx: 20 },
            { size: 110, x: '55%', y: '70%', dur: 8,  delay: 1.0, rx: 30 },
            { size: 50,  x: '20%', y: '75%', dur: 10, delay: 0.3, rx: 16 },
            { size: 75,  x: '80%', y: '50%', dur: 6,  delay: 0.7, rx: 22 },
            { size: 40,  x: '45%', y: '20%', dur: 11, delay: 1.5, rx: 40 },
            { size: 55,  x: '35%', y: '85%', dur: 8,  delay: 0.2, rx: 55 },
            { size: 70,  x: '88%', y: '80%', dur: 9,  delay: 1.2, rx: 21 },
          ].map((b, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: b.size, height: b.size,
                left: b.x, top: b.y,
                borderRadius: b.rx,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 32px rgba(0,0,0,0.15)',
              }}
              animate={{
                y: [0, -(15 + i * 3), 8 + i * 2, -(10 + i * 2), 0],
                x: [0, 6 + i * 2, -(4 + i), 8, 0],
                rotate: [0, 4, -3, 2, 0],
                scale: [1, 1.04, 0.97, 1.02, 1],
              }}
              transition={{
                duration: b.dur,
                delay: b.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* ── Center glass statement card ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 48px',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                maxWidth: 420,
                padding: '44px 40px',
                borderRadius: 28,
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(40px) saturate(160%)',
                WebkitBackdropFilter: 'blur(40px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 32px 80px rgba(0,0,0,0.4)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Animated shimmer sweep */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '50%', height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.60), transparent)',
                }}
              />

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  width: 64, height: 64,
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)',
                }}
              >
                <BookOpen size={28} color="rgba(255,255,255,0.85)" strokeWidth={1.5} />
              </motion.div>

              <h2 style={{
                fontSize: 26,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.92)',
                letterSpacing: '-0.035em',
                lineHeight: 1.25,
                marginBottom: 12,
              }}>
                L'éducation,
                <br />
                réinventée.
              </h2>

              <p style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.45)',
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: 300,
                margin: '0 auto',
              }}>
                Gestion des notes, emplois du temps, absences et plus — le tout en un seul portail.
              </p>

              {/* Indicator dots */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 28 }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 + i * 0.1 }}
                    style={{
                      width: i === 0 ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      background: i === 0 ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.15)',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{
            position: 'absolute',
            bottom: 28,
            left: 0, right: 0,
            textAlign: 'center',
            zIndex: 4,
          }}
        >
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.02em' }}>
            Élèves · Professeurs · Administration
          </p>
        </motion.div>
      </div>
    </div>
  );
}
