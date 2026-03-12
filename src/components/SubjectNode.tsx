import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { SubjectStatus } from '../data/curriculum';
import { useStudyStore } from '../store/useStudyStore';
import { Lock } from 'lucide-react';

export type SubjectNodeData = {
  id: string;
  name: string;
  credits: number;
  isAnalyst: boolean;
  status: SubjectStatus;
  isLocked?: boolean;
  category: string;
};

export type SubjectNodeType = Node<SubjectNodeData, 'subject'>;

const statusStyles: Record<SubjectStatus, { bg: string; border: string; text: string; glow: string }> = {
  pending: {
    bg: 'var(--bg-surface)',
    border: '1px solid var(--bg-border)',
    text: 'rgba(255,255,255,0.4)',
    glow: 'none',
  },
  cursando: {
    bg: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.5)',
    text: 'rgba(255,255,255,0.9)',
    glow: '0 0 14px rgba(255,255,255,0.10)',
  },
  final: {
    bg: 'var(--status-final-bg)',
    border: '1px solid var(--status-final-border)',
    text: 'var(--status-final)',
    glow: '0 0 16px rgba(251, 146, 60, 0.08)',
  },
  approved: {
    bg: 'var(--status-aprobada-bg)',
    border: '1px solid var(--status-aprobada-border)',
    text: 'var(--status-aprobada)',
    glow: '0 0 16px rgba(74, 222, 128, 0.06)',
  },
};

const statusLabel: Record<SubjectStatus, string> = {
  pending: '',
  cursando: 'Cursando',
  final: 'Final',
  approved: 'Aprobada',
};

export const SubjectNode: React.FC<NodeProps<SubjectNodeType>> = ({ data, id }) => {
  const toggleSubjectState = useStudyStore((state) => state.toggleSubjectState);

  const status = data.status;
  const isLocked = data.isLocked;
  const style = statusStyles[status];

  const handleClick = () => {
    if (isLocked) return;
    toggleSubjectState(id);
  };

  // Locked: higher opacity than before (0.5 vs 0.3) and visible border
  const lockedBg = 'rgba(255,255,255,0.015)';
  const lockedBorder = '1px dashed rgba(255,255,255,0.1)';
  const lockedText = 'rgba(255,255,255,0.3)';

  return (
    <div
      onClick={handleClick}
      style={{
        background: isLocked ? lockedBg : style.bg,
        border: isLocked ? lockedBorder : style.border,
        boxShadow: isLocked ? 'none' : style.glow,
        opacity: isLocked ? 0.55 : 1,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        borderRadius: '8px',
        padding: '8px 12px',
        width: '160px',
        minHeight: '52px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        transition: 'all 0.2s ease',
        fontFamily: "'Syne', sans-serif",
      }}
      onMouseEnter={(e) => {
        if (!isLocked) {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.boxShadow = isLocked ? 'none' : style.glow.replace('0.06', '0.15').replace('0.08', '0.2');
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = isLocked ? 'none' : style.glow;
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 6, height: 6 }} />

      {/* Lock icon for locked subjects */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          top: -5,
          left: -5,
          width: 15,
          height: 15,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Lock size={8} style={{ color: 'rgba(255,255,255,0.35)' }} />
        </div>
      )}

      {/* Analyst badge */}
      {data.isAnalyst && (
        <div style={{
          position: 'absolute',
          top: -6,
          right: -6,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: isLocked
            ? 'rgba(255,255,255,0.04)'
            : status === 'approved'
              ? 'rgba(74, 222, 128, 0.15)'
              : status === 'cursando'
                ? 'rgba(255,255,255,0.08)'
              : status === 'pending'
                ? 'var(--status-regular-bg)'
                : 'rgba(251, 146, 60, 0.15)',
          border: isLocked
            ? '1.5px solid rgba(255,255,255,0.1)'
            : status === 'approved'
              ? '1.5px solid var(--status-aprobada-border)'
              : status === 'cursando'
                ? '1.5px solid rgba(255,255,255,0.35)'
              : status === 'pending'
                ? '1.5px solid rgba(96, 165, 250, 0.35)'
                : '1.5px solid var(--status-final-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          fontWeight: 700,
          color: isLocked
            ? 'rgba(255,255,255,0.25)'
            : status === 'approved'
              ? 'var(--status-aprobada)'
              : status === 'cursando'
                ? 'rgba(255,255,255,0.88)'
              : status === 'pending'
                ? 'var(--status-regular)'
                : 'var(--status-final)',
          letterSpacing: '0.5px',
        }}>
          A
        </div>
      )}

      {/* Subject name */}
      <div style={{
        fontSize: '10px',
        fontWeight: 600,
        lineHeight: '1.3',
        color: isLocked ? lockedText : (status === 'pending' ? 'rgba(255,255,255,0.55)' : style.text),
        letterSpacing: '0.01em',
      }}>
        {data.name}
      </div>

      {/* Status label + credits */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '3px',
        fontSize: '8px',
        fontWeight: 500,
        color: isLocked ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        fontFamily: "'DM Mono', monospace",
      }}>
        {statusLabel[status] && !isLocked && (
          <span style={{ color: style.text }}>
            {statusLabel[status]}
          </span>
        )}
        {isLocked && (
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>Bloqueada</span>
        )}
        <span>{data.credits} cred.</span>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 6, height: 6 }} />
    </div>
  );
};
