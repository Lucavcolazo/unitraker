import React from 'react';
import { ProgressSummary } from './ProgressSummary';
import { Map, BarChart3, GraduationCap } from 'lucide-react';
import type { Section } from '../App';

interface Props {
  children: React.ReactNode;
  section: Section;
  onSectionChange: (section: Section) => void;
}

export const DashboardLayout: React.FC<Props> = ({ children, section, onSectionChange }) => {
  const tabs: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'map', label: 'Mapa', icon: <Map size={14} /> },
    { id: 'stats', label: 'Estadísticas', icon: <BarChart3 size={14} /> },
  ];

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgb(8, 8, 12)',
      color: 'rgba(255,255,255,0.85)',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(8, 8, 12, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0,
      }}>
        {/* Left: Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: '7px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15))',
            border: '1px solid rgba(59,130,246,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <GraduationCap size={15} style={{ color: 'rgba(59,130,246,0.7)' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}>
              UniTraker
            </h1>
            <p style={{
              fontSize: '9px',
              color: 'rgba(255,255,255,0.25)',
              margin: 0,
              letterSpacing: '0.03em',
            }}>
              Ingeniería en Sistemas
            </p>
          </div>
        </div>

        {/* Center: Section Tabs */}
        <div style={{
          display: 'flex',
          gap: '2px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          padding: '3px',
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.01em',
                transition: 'all 0.2s ease',
                background: section === tab.id
                  ? 'rgba(255,255,255,0.08)'
                  : 'transparent',
                color: section === tab.id
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.35)',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Legend (only on map) */}
        <div style={{
          display: 'flex',
          gap: '14px',
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.03em',
          opacity: section === 'map' ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: section === 'map' ? 'auto' : 'none',
        }}>
          {[
            { label: 'Pendiente', color: 'rgba(255,255,255,0.2)', bg: 'rgba(255,255,255,0.04)' },
            { label: 'Regular', color: 'rgba(251,191,36,0.8)', bg: 'rgba(251,191,36,0.1)' },
            { label: 'Final', color: 'rgba(249,115,22,0.8)', bg: 'rgba(249,115,22,0.1)' },
            { label: 'Aprobada', color: 'rgba(34,197,94,0.8)', bg: 'rgba(34,197,94,0.1)' },
          ].map(({ label, color, bg }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: bg,
                border: `1.5px solid ${color}`,
              }} />
              <span style={{ color }}>{label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Progress Summary */}
      <ProgressSummary />

      {/* Main Content */}
      <main style={{
        flex: 1,
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {children}
      </main>
    </div>
  );
};
