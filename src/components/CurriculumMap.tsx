import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { useAuth } from '../contexts/AuthContext';
import { usePlanStore } from '../store/usePlanStore';
import { curriculum, type SubjectStatus } from '../data/curriculum';
import { Lock, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

// ── Status styles (paleta desaturada) ───────────────────────
const statusStyles: Record<SubjectStatus, { bg: string; border: string; text: string; glow: string }> = {
  pending: {
    bg: 'var(--bg-surface)',
    border: '1px solid var(--bg-border)',
    text: 'rgba(255,255,255,0.4)',
    glow: 'none',
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
  final: 'Final',
  approved: 'Aprobada',
};

// ── Subject Card ──────────────────────────────────────────
const SubjectCard: React.FC<{
  id: string;
  name: string;
  isAnalyst: boolean;
  status: SubjectStatus;
  isLocked: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
}> = ({ id, name, isAnalyst, status, isLocked, cardRef }) => {
  const toggleSubjectState = useStudyStore((state) => state.toggleSubjectState);
  const style = statusStyles[status];

  return (
    <motion.div
      ref={cardRef}
      data-subject-id={id}
      whileHover={isLocked ? {} : { scale: 1.03 }}
      whileTap={isLocked ? {} : { scale: 0.97 }}
      onClick={() => !isLocked && toggleSubjectState(id)}
      style={{
        background: isLocked ? 'rgba(255,255,255,0.015)' : style.bg,
        border: isLocked ? '1px dashed rgba(255,255,255,0.1)' : style.border,
        boxShadow: isLocked ? 'none' : style.glow,
        opacity: isLocked ? 0.55 : 1,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        borderRadius: '8px',
        padding: '8px 10px',
        minWidth: '130px',
        maxWidth: '160px',
        flex: '1 1 130px',
        minHeight: '50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        transition: 'all 0.2s ease',
        fontFamily: "'Geist', sans-serif",
      }}
    >
      {/* Lock icon */}
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
      {isAnalyst && (
        <div style={{
          position: 'absolute',
          top: -5,
          right: -5,
          width: 15,
          height: 15,
          borderRadius: '50%',
          background: isLocked
            ? 'rgba(255,255,255,0.04)'
            : status === 'approved'
              ? 'rgba(34,197,94,0.2)'
              : status === 'pending'
                ? 'rgba(59,130,246,0.1)'
                : 'rgba(251,191,36,0.15)',
          border: isLocked
            ? '1.5px solid rgba(255,255,255,0.1)'
            : status === 'approved'
              ? '1.5px solid rgba(34,197,94,0.5)'
              : status === 'pending'
                ? '1.5px solid rgba(59,130,246,0.3)'
                : '1.5px solid rgba(251,191,36,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          fontWeight: 700,
          color: isLocked
            ? 'rgba(255,255,255,0.25)'
            : status === 'approved'
              ? 'rgba(34,197,94,0.9)'
              : status === 'pending'
                ? 'rgba(59,130,246,0.6)'
                : 'rgba(251,191,36,0.9)',
        }}>
          A
        </div>
      )}

      {/* Name */}
      <div style={{
        fontSize: '10px',
        fontWeight: 600,
        lineHeight: '1.3',
        color: isLocked ? 'rgba(255,255,255,0.3)' : (status === 'pending' ? 'rgba(255,255,255,0.55)' : style.text),
      }}>
        {name}
      </div>

      {/* Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginTop: '3px',
        fontSize: '8px',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.2)',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      }}>
        {isLocked ? (
          <span>Bloqueada</span>
        ) : statusLabel[status] ? (
          <span style={{ color: style.text }}>{statusLabel[status]}</span>
        ) : null}
      </div>
    </motion.div>
  );
};

// ── Row Component ──────────────────────────────────────────
const SemesterRow: React.FC<{
  label: string;
  subjects: typeof curriculum;
  subjectStates: Record<string, SubjectStatus>;
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}> = ({ label, subjects, subjectStates, cardRefs }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      padding: '20px 0',
    }}>
      {/* Subject cards */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        {subjects.map((sub) => {
          const isLocked = sub.correlatives.length > 0 &&
            !sub.correlatives.every((corrId) => subjectStates[corrId] === 'approved');

          return (
            <SubjectCard
              key={sub.id}
              id={sub.id}
              name={sub.name}

              isAnalyst={sub.isAnalyst}
              status={subjectStates[sub.id] || 'pending'}
              isLocked={isLocked}
              cardRef={(el) => {
                if (el) cardRefs.current.set(sub.id, el);
                else cardRefs.current.delete(sub.id);
              }}
            />
          );
        })}
      </div>

      {/* Right label */}
      <div style={{
        width: '100px',
        flexShrink: 0,
        textAlign: 'right',
        fontSize: '11px',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        lineHeight: '1.4',
      }}>
        {label}
      </div>
    </div>
  );
};

// ── Arrow/Edge type ──────────────────────────────────────────
interface ArrowData {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  animated: boolean;
}

// ── Main Map ──────────────────────────────────────────
export const CurriculumMap: React.FC = () => {
  const { subjectStates } = useStudyStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [arrows, setArrows] = useState<ArrowData[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  const { profile } = useAuth();
  const { activePlanSubjects } = usePlanStore();

  // Use dynamic plan subjects if available, otherwise static curriculum
  const baseCurriculum = activePlanSubjects.length > 0 ? activePlanSubjects : curriculum;

  // Filter subjects by degree track
  const filteredCurriculum = useMemo(() => {
    if (profile?.degree_track === 'analista') {
      return baseCurriculum.filter(s => s.isAnalyst);
    }
    return baseCurriculum;
  }, [profile?.degree_track, baseCurriculum]);

  // Group subjects by year-semester
  const groups: Record<string, typeof curriculum> = {};
  filteredCurriculum.forEach((sub) => {
    const key = `${sub.year}-${sub.semester}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(sub);
  });

  const rowKeys = Object.keys(groups).sort((a, b) => {
    const [ay, as_] = a.split('-').map(Number);
    const [by, bs] = b.split('-').map(Number);
    return ay * 10 + as_ - (by * 10 + bs);
  });

  const semesterLabel = (key: string) => {
    const [year, sem] = key.split('-').map(Number);
    if (sem === 0) return `${year}° Año\nAnual`;
    return `${year}° Año\n${sem}° Cuat.`;
  };

  const [zoom, setZoom] = useState(100);
  const zoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 40));
  const zoomReset = () => setZoom(100);

  // Calculate arrows after layout
  const computeArrows = useCallback(() => {
    const content = contentRef.current;
    if (!content) return;

    const contentRect = content.getBoundingClientRect();
    const newArrows: ArrowData[] = [];

    filteredCurriculum.forEach(sub => {
      if (sub.correlatives.length === 0) return;
      const targetEl = cardRefs.current.get(sub.id);
      if (!targetEl) return;

      sub.correlatives.forEach(corrId => {
        const sourceEl = cardRefs.current.get(corrId);
        if (!sourceEl) return;

        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        // Positions relative to content div (before scale)
        const scale = zoom / 100;
        const x1 = (sourceRect.left + sourceRect.width / 2 - contentRect.left) / scale;
        const y1 = (sourceRect.bottom - contentRect.top) / scale;
        const x2 = (targetRect.left + targetRect.width / 2 - contentRect.left) / scale;
        const y2 = (targetRect.top - contentRect.top) / scale;

        const corrStatus = subjectStates[corrId] || 'pending';
        const targetStatus = subjectStates[sub.id] || 'pending';
        const isSourceApproved = corrStatus === 'approved';
        const isTargetDone = targetStatus === 'approved';

        let color = 'rgba(255,255,255,0.06)';
        let animated = false;
        if (isSourceApproved && isTargetDone) {
          color = 'rgba(34,197,94,0.25)';
        } else if (isSourceApproved) {
          color = 'rgba(34,197,94,0.18)';
          animated = true;
        }

        newArrows.push({
          id: `${corrId}-${sub.id}`,
          x1, y1, x2, y2,
          color,
          animated,
        });
      });
    });

    // SVG size = content size (unscaled)
    const scale = zoom / 100;
    setSvgSize({
      width: contentRect.width / scale,
      height: contentRect.height / scale,
    });
    setArrows(newArrows);
  }, [subjectStates, zoom, filteredCurriculum]);

  useEffect(() => {
    // Compute on mount and when states/zoom change, with a small delay for layout
    const timer = setTimeout(computeArrows, 100);
    return () => clearTimeout(timer);
  }, [computeArrows]);

  // Also recompute on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Recompute is not needed on scroll since SVG is inside the content
    // But we need resize observer
    const ro = new ResizeObserver(() => computeArrows());
    ro.observe(container);
    return () => ro.disconnect();
  }, [computeArrows]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflow: 'auto',
        background: 'var(--bg-base)',
        fontFamily: "'Geist', sans-serif",
        position: 'relative',
      }}
    >
      <div
        ref={contentRef}
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px 24px 40px',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease',
          position: 'relative',
        }}
      >
        {/* SVG Arrows Overlay */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: svgSize.width || '100%',
            height: svgSize.height || '100%',
            pointerEvents: 'none',
            zIndex: 0,
            overflow: 'visible',
          }}
        >
          <defs>
            <marker
              id="arrowhead-dim"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.06)" />
            </marker>
            <marker
              id="arrowhead-green"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="rgba(34,197,94,0.3)" />
            </marker>
          </defs>

          {arrows.map(arrow => {
            const dy = arrow.y2 - arrow.y1;
            const cp = Math.max(Math.abs(dy) * 0.35, 20);

            const path = `M ${arrow.x1} ${arrow.y1} C ${arrow.x1} ${arrow.y1 + cp}, ${arrow.x2} ${arrow.y2 - cp}, ${arrow.x2} ${arrow.y2}`;
            const isGreen = arrow.color.includes('34,197,94');

            return (
              <g key={arrow.id}>
                <path
                  d={path}
                  fill="none"
                  stroke={arrow.color}
                  strokeWidth={1.5}
                  markerEnd={isGreen ? 'url(#arrowhead-green)' : 'url(#arrowhead-dim)'}
                />
                {arrow.animated && (
                  <circle r="2.5" fill="rgba(34,197,94,0.5)">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path={path} />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* All Semesters */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
          {rowKeys.map((key, i) => {
            const [year] = key.split('-').map(Number);
            const prevYear = i > 0 ? Number(rowKeys[i - 1].split('-')[0]) : year;
            const showYearDivider = i > 0 && year !== prevYear;

            return (
              <React.Fragment key={key}>
                {showYearDivider && (
                  <div style={{
                    height: '1px',
                    background: 'rgba(255,255,255,0.06)',
                    margin: '8px 0',
                  }} />
                )}
                <SemesterRow
                  label={semesterLabel(key)}
                  subjects={groups[key]}
                  subjectStates={subjectStates}
                  cardRefs={cardRefs}
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Zoom Controls */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        zIndex: 50,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '4px',
        backdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={zoomIn}
          style={{
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', borderRadius: '7px',
            cursor: 'pointer', color: 'rgba(255,255,255,0.4)', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          title="Zoom In"
        >
          <ZoomIn size={15} />
        </button>

        <div style={{
          textAlign: 'center', fontSize: '9px', fontWeight: 600,
          color: 'rgba(255,255,255,0.3)', padding: '2px 0',
          letterSpacing: '0.02em', fontFamily: "'Geist', sans-serif",
        }}>
          {zoom}%
        </div>

        <button
          onClick={zoomOut}
          style={{
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', borderRadius: '7px',
            cursor: 'pointer', color: 'rgba(255,255,255,0.4)', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          title="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '2px 4px' }} />

        <button
          onClick={zoomReset}
          style={{
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', borderRadius: '7px',
            cursor: 'pointer', color: 'rgba(255,255,255,0.4)', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          title="Reset Zoom"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
};
