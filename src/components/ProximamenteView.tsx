import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

/** Vista "Próximamente" con imagen de construcción en el centro. */
export const ProximamenteView: React.FC<Props> = ({ onBack }) => {
  return (
    <div style={{
      height: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Geist', sans-serif",
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.03)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: "'Geist', sans-serif",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }}
      >
        <ChevronLeft size={18} /> Volver
      </button>

      <h1 style={{
        fontSize: '20px',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.9)',
        margin: '0 0 24px',
      }}>
        Próximamente
      </h1>

      <div style={{
        maxWidth: '280px',
        width: '100%',
        flexShrink: 0,
      }}>
        <img
          src="/construccion.jpg"
          alt="En construcción"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '12px',
            display: 'block',
          }}
        />
      </div>

      <p style={{
        fontSize: '13px',
        color: 'rgba(255,255,255,0.4)',
        margin: '20px 0 0',
        textAlign: 'center',
      }}>
        Crear plan de estudios estará disponible pronto
      </p>
    </div>
  );
};
