import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlanStore } from '../store/usePlanStore';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, Loader2, BookOpen, Sparkles } from 'lucide-react';

interface Props {
  onComplete: () => void;
  onCreateCustom: () => void;
}

export const OnboardingPage: React.FC<Props> = ({ onComplete, onCreateCustom }) => {
  const { user } = useAuth();
  const { createPlanFromDefault } = usePlanStore();
  const [loading, setLoading] = useState(false);

  const handleDefault = async () => {
    if (!user) return;
    setLoading(true);
    const planId = await createPlanFromDefault(user.id);
    setLoading(false);
    // Solo salir del onboarding si el plan se creó bien (el store ya tiene activePlanId)
    if (planId) onComplete();
  };

  return (
    <div style={{
      height: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Geist', sans-serif",
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            width: 48, height: 48, borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15))',
            border: '1px solid rgba(59,130,246,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <GraduationCap size={22} style={{ color: 'rgba(59,130,246,0.8)' }} />
        </motion.div>

        <h1 style={{
          fontSize: '22px', fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          margin: '0 0 6px',
        }}>
          ¡Bienvenido a UniTraker!
        </h1>
        <p style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.35)',
          margin: '0 0 32px', lineHeight: 1.5,
        }}>
          Elegí un plan de estudios para empezar a trackear tu progreso
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Default plan */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleDefault}
            disabled={loading}
            style={{
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(59,130,246,0.2)',
              background: 'rgba(59,130,246,0.05)',
              cursor: loading ? 'wait' : 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.2s ease',
              fontFamily: "'Geist', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; e.currentTarget.style.background = 'rgba(59,130,246,0.05)'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '10px',
              background: 'rgba(59,130,246,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {loading ? (
                <Loader2 size={18} style={{ color: 'rgba(59,130,246,0.7)', animation: 'spin 1s linear infinite' }} />
              ) : (
                <BookOpen size={18} style={{ color: 'rgba(59,130,246,0.7)' }} />
              )}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '3px' }}>
                Ing. en Sistemas 2024
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                Plan predefinido con todas las materias ya cargadas
              </div>
            </div>
          </motion.button>

          {/* Custom plan */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onCreateCustom}
            style={{
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(168,85,247,0.15)',
              background: 'rgba(168,85,247,0.03)',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.2s ease',
              fontFamily: "'Geist', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)'; e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.15)'; e.currentTarget.style.background = 'rgba(168,85,247,0.03)'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '10px',
              background: 'rgba(168,85,247,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Plus size={18} style={{ color: 'rgba(168,85,247,0.7)' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Crear mi plan <Sparkles size={12} style={{ color: 'rgba(168,85,247,0.6)' }} />
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                Armá tu propio plan con las materias de tu carrera
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
