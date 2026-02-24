import React from 'react';
import { GraduationCap, ArrowRight, Map, BarChart3, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const fontTitle = "'Syne', sans-serif";
const fontMono = "'DM Mono', monospace";

interface Props {
  onGetStarted: () => void;
}

export const WelcomePage: React.FC<Props> = ({ onGetStarted }) => {
  const features = [
    { icon: <Map size={18} />, title: 'Mapa Curricular', desc: 'Visualizá tu progreso con un mapa interactivo de materias y correlativas' },
    { icon: <BarChart3 size={18} />, title: 'Estadísticas', desc: 'Gráficos y métricas detalladas de tu avance académico' },
    { icon: <Users size={18} />, title: 'Compará', desc: 'Compartí progreso con tus compañeros de cursada' },
    { icon: <Zap size={18} />, title: 'Sincronizado', desc: 'Tu progreso se guarda en la nube automáticamente' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: fontTitle,
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '700px',
        height: '500px',
        background: 'radial-gradient(ellipse, rgba(34,197,94,0.04) 0%, rgba(59,130,246,0.03) 40%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '520px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(99,102,241,0.12))',
            border: '1px solid rgba(34,197,94,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
            boxShadow: '0 0 50px rgba(34,197,94,0.06)',
          }}
        >
          <GraduationCap size={30} style={{ color: 'rgba(34,197,94,0.8)' }} />
        </motion.div>

        {/* Subtitle label */}
        <div style={{
          fontFamily: fontMono,
          fontSize: '11px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#22c55e',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ width: 18, height: 1, background: '#22c55e', display: 'inline-block' }} />
          Tu mapa curricular inteligente
          <span style={{ width: 18, height: 1, background: '#22c55e', display: 'inline-block' }} />
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 42px)',
          fontWeight: 800,
          color: 'rgba(255,255,255,0.95)',
          margin: '0 0 12px',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>
          Bienvenido a{' '}
          <span style={{
            background: 'linear-gradient(90deg, #22c55e, #86efac)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            UniTraker
          </span>
        </h1>

        <p style={{
          fontSize: '13px',
          color: '#52525b',
          margin: '0 0 40px',
          lineHeight: 1.7,
          fontFamily: fontMono,
          fontWeight: 400,
        }}>
          Seguí tu progreso, desbloqueá materias y llegá al título.
          <br />
          Creá una cuenta o iniciá sesión para empezar.
        </p>

        {/* Features grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          width: '100%',
          marginBottom: '44px',
        }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              style={{
                background: '#111113',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '18px 16px',
                textAlign: 'left',
              }}
            >
              <div style={{ color: '#22c55e', marginBottom: '10px', opacity: 0.7 }}>{f.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                {f.title}
              </div>
              <div style={{ fontSize: '11px', color: '#52525b', lineHeight: 1.5, fontFamily: fontMono, fontWeight: 400 }}>
                {f.desc}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={onGetStarted}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '13px 36px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #4ade80)',
            color: '#0a0a0b',
            fontSize: '14px',
            fontWeight: 800,
            fontFamily: fontTitle,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 0 24px rgba(34,197,94,0.15)',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 36px rgba(34,197,94,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(34,197,94,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Comenzar
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>
    </div>
  );
};
