import React from 'react';
import { GraduationCap, ArrowRight, Map, BarChart3, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

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
      background: 'rgb(8, 8, 12)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)',
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
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15))',
            border: '1px solid rgba(59,130,246,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 0 40px rgba(59,130,246,0.08)',
          }}
        >
          <GraduationCap size={30} style={{ color: 'rgba(59,130,246,0.8)' }} />
        </motion.div>

        <h1 style={{
          fontSize: '36px',
          fontWeight: 800,
          color: 'rgba(255,255,255,0.95)',
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
        }}>
          UniTraker
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.35)',
          margin: '0 0 40px',
          lineHeight: 1.6,
        }}>
          Tu mapa curricular inteligente. Seguí tu progreso,<br />
          desbloqueá materias y llegá al título.
        </p>

        {/* Features grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          width: '100%',
          marginBottom: '40px',
        }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '10px',
                padding: '14px',
                textAlign: 'left',
              }}
            >
              <div style={{ color: 'rgba(59,130,246,0.7)', marginBottom: '8px' }}>{f.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '3px' }}>
                {f.title}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>
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
            padding: '12px 32px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(99,102,241,0.9))',
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 0 20px rgba(59,130,246,0.2)',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(59,130,246,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(59,130,246,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Comenzar
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>
    </div>
  );
};
