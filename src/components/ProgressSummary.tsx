import React from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { curriculum } from '../data/curriculum';

export const ProgressSummary: React.FC = () => {
  const { subjectStates, resetAll } = useStudyStore();

  const analystSubjects = curriculum.filter(s => s.isAnalyst);
  const allSubjects = curriculum;

  const countByStatus = (subjects: typeof curriculum) => {
    let approved = 0, regular = 0, finalState = 0, pending = 0;
    subjects.forEach(s => {
      const st = subjectStates[s.id] || 'pending';
      if (st === 'approved') approved++;
      else if (st === 'regular') regular++;
      else if (st === 'final') finalState++;
      else pending++;
    });
    return { approved, regular, final: finalState, pending, total: subjects.length };
  };

  const analystStats = countByStatus(analystSubjects);
  const engineeringStats = countByStatus(allSubjects);

  const analystPercent = Math.round((analystStats.approved / analystStats.total) * 100) || 0;
  const engineeringPercent = Math.round((engineeringStats.approved / engineeringStats.total) * 100) || 0;

  const ProgressBar = ({ label, percent, approved, total, color }: {
    label: string;
    percent: number;
    approved: number;
    total: number;
    color: string;
  }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '0 2px',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.01em' }}>
          {label}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
          {approved}/{total}
          <span style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>
            ({percent}%)
          </span>
        </span>
      </div>
      <div style={{
        width: '100%',
        height: '4px',
        borderRadius: '2px',
        background: 'rgba(255,255,255,0.04)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          borderRadius: '2px',
          background: color,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      padding: '10px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      background: 'rgba(255,255,255,0.01)',
      flexShrink: 0,
    }}>
      <ProgressBar
        label="Analista en Sistemas"
        percent={analystPercent}
        approved={analystStats.approved}
        total={analystStats.total}
        color="rgba(59, 130, 246, 0.7)"
      />
      <ProgressBar
        label="Ingeniería en Sistemas"
        percent={engineeringPercent}
        approved={engineeringStats.approved}
        total={engineeringStats.total}
        color="rgba(168, 85, 247, 0.7)"
      />
      <button
        onClick={resetAll}
        style={{
          fontSize: '9px',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.25)',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '5px',
          padding: '5px 10px',
          cursor: 'pointer',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.25)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }}
      >
        Reiniciar
      </button>
    </div>
  );
};
