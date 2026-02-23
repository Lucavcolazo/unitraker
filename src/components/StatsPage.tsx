import React, { useMemo, useState, useEffect } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { curriculum, type SubjectStatus } from '../data/curriculum';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  FileText,
  BookOpen,
  Award,
  TrendingUp,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STATUS_CONFIG: Record<SubjectStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  approved: { label: 'Aprobadas', color: 'rgba(34,197,94,0.9)', bg: 'rgba(34,197,94,0.08)', icon: <CheckCircle2 size={14} /> },
  final: { label: 'Final pendiente', color: 'rgba(249,115,22,0.9)', bg: 'rgba(249,115,22,0.08)', icon: <FileText size={14} /> },
  regular: { label: 'Regulares', color: 'rgba(251,191,36,0.9)', bg: 'rgba(251,191,36,0.08)', icon: <Clock size={14} /> },
  pending: { label: 'Pendientes', color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.03)', icon: <BookOpen size={14} /> },
};

// Animated counter
const AnimatedNumber: React.FC<{ value: number; delay?: number }> = ({ value, delay = 0 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const duration = 800;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        start = Math.round(eased * value);
        setDisplay(start);
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return <span>{display}</span>;
};

// Donut chart component (SVG)
const DonutChart: React.FC<{
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}> = ({ segments, size = 160, strokeWidth = 14, centerLabel, centerValue }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((a, s) => a + s.value, 0);

  let accumulatedOffset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.03)"
        strokeWidth={strokeWidth}
      />
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.value / total : 0;
        const dashLength = circumference * pct;
        const dashOffset = circumference * (0.25 - accumulatedOffset);
        accumulatedOffset += pct;

        return (
          <motion.circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${dashLength} ${circumference - dashLength}` }}
            transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: 'easeOut' }}
          />
        );
      })}
      {/* Center text */}
      {centerValue && (
        <>
          <text
            x={size / 2}
            y={size / 2 - 6}
            textAnchor="middle"
            fill="rgba(255,255,255,0.85)"
            fontSize="24"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            {centerValue}
          </text>
          {centerLabel && (
            <text
              x={size / 2}
              y={size / 2 + 14}
              textAnchor="middle"
              fill="rgba(255,255,255,0.3)"
              fontSize="10"
              fontWeight="500"
              fontFamily="Inter, sans-serif"
            >
              {centerLabel}
            </text>
          )}
        </>
      )}
    </svg>
  );
};

// Bar chart
const HorizontalBar: React.FC<{
  label: string;
  value: number;
  total: number;
  color: string;
  delay?: number;
}> = ({ label, value, total, color, delay = 0 }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{label}</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
          {value}/{total}
        </span>
      </div>
      <div style={{
        height: '6px',
        borderRadius: '3px',
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: '3px',
            background: color,
          }}
        />
      </div>
    </div>
  );
};

// Subject list collapsible
const SubjectList: React.FC<{
  title: string;
  subjects: typeof curriculum;
  icon: React.ReactNode;
  color: string;
  defaultOpen?: boolean;
}> = ({ title, subjects, icon, color, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.7)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ color }}>{icon}</div>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>{title}</span>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            background: 'rgba(255,255,255,0.06)',
            padding: '2px 7px',
            borderRadius: '10px',
            color: 'rgba(255,255,255,0.4)',
          }}>
            {subjects.length}
          </span>
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}>
              {subjects.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {s.isAnalyst && (
                      <span style={{
                        fontSize: '8px',
                        fontWeight: 700,
                        color: 'rgba(59,130,246,0.7)',
                        background: 'rgba(59,130,246,0.1)',
                        padding: '1px 4px',
                        borderRadius: '3px',
                      }}>A</span>
                    )}
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                      {s.name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.25)',
                  }}>
                    {s.year}° Año · {s.semester}° Cuat
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const StatsPage: React.FC = () => {
  const { subjectStates } = useStudyStore();

  const stats = useMemo(() => {
    const byStatus: Record<SubjectStatus, typeof curriculum> = {
      approved: [],
      final: [],
      regular: [],
      pending: [],
    };

    curriculum.forEach(s => {
      const st = subjectStates[s.id] || 'pending';
      byStatus[st].push(s);
    });

    const analystAll = curriculum.filter(s => s.isAnalyst);
    const analystApproved = analystAll.filter(s => subjectStates[s.id] === 'approved');
    const analystRemaining = analystAll.filter(s => subjectStates[s.id] !== 'approved');

    const engAll = curriculum;
    const engApproved = engAll.filter(s => subjectStates[s.id] === 'approved');
    const engRemaining = engAll.filter(s => subjectStates[s.id] !== 'approved');

    // Credits
    const analystCreditsTotal = analystAll.reduce((a, s) => a + s.credits, 0);
    const analystCreditsEarned = analystApproved.reduce((a, s) => a + s.credits, 0);
    const engCreditsTotal = engAll.reduce((a, s) => a + s.credits, 0);
    const engCreditsEarned = engApproved.reduce((a, s) => a + s.credits, 0);

    // By category
    const categories = new Map<string, { total: number; done: number }>();
    curriculum.forEach(s => {
      const cat = s.category;
      if (!categories.has(cat)) categories.set(cat, { total: 0, done: 0 });
      const c = categories.get(cat)!;
      c.total++;
      if (subjectStates[s.id] === 'approved') c.done++;
    });

    return {
      byStatus,
      analystAll, analystApproved, analystRemaining,
      engAll, engApproved, engRemaining,
      analystCreditsTotal, analystCreditsEarned,
      engCreditsTotal, engCreditsEarned,
      categories,
      total: curriculum.length,
    };
  }, [subjectStates]);

  const donutSegments = [
    { value: stats.byStatus.approved.length, color: 'rgba(34,197,94,0.8)', label: 'Aprobadas' },
    { value: stats.byStatus.final.length, color: 'rgba(249,115,22,0.8)', label: 'Final' },
    { value: stats.byStatus.regular.length, color: 'rgba(251,191,36,0.8)', label: 'Regulares' },
    { value: stats.byStatus.pending.length, color: 'rgba(255,255,255,0.12)', label: 'Pendientes' },
  ];

  return (
    <div style={{
      flex: 1,
      overflow: 'auto',
      padding: '24px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {/* Top Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {([
            { status: 'approved' as SubjectStatus, delay: 0 },
            { status: 'final' as SubjectStatus, delay: 100 },
            { status: 'regular' as SubjectStatus, delay: 200 },
            { status: 'pending' as SubjectStatus, delay: 300 },
          ]).map(({ status, delay }) => {
            const config = STATUS_CONFIG[status];
            const count = stats.byStatus[status].length;
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: delay / 1000 }}
                style={{
                  background: config.bg,
                  border: `1px solid ${config.color.replace('0.9', '0.15')}`,
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: config.color }}>
                  {config.icon}
                  <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {config.label}
                  </span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: config.color }}>
                  <AnimatedNumber value={count} delay={delay} />
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>
                  de {stats.total} materias
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Donut Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Target size={14} />
              Estado General
            </div>

            <DonutChart
              segments={donutSegments}
              centerValue={`${Math.round((stats.byStatus.approved.length / stats.total) * 100)}%`}
              centerLabel="completado"
            />

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {donutSegments.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    {s.label} ({s.value})
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Degree Progress */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Award size={14} />
              Progreso por Título
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(59,130,246,0.9)' }}>
                    Analista en Sistemas
                  </span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                    {stats.analystApproved.length}/{stats.analystAll.length} materias
                  </span>
                </div>
                <HorizontalBar
                  label="Materias"
                  value={stats.analystApproved.length}
                  total={stats.analystAll.length}
                  color="rgba(59,130,246,0.7)"
                  delay={0.5}
                />
                <div style={{ marginTop: '8px' }}>
                  <HorizontalBar
                    label="Créditos"
                    value={stats.analystCreditsEarned}
                    total={stats.analystCreditsTotal}
                    color="rgba(59,130,246,0.5)"
                    delay={0.6}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(168,85,247,0.9)' }}>
                    Ingeniería en Sistemas
                  </span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                    {stats.engApproved.length}/{stats.engAll.length} materias
                  </span>
                </div>
                <HorizontalBar
                  label="Materias"
                  value={stats.engApproved.length}
                  total={stats.engAll.length}
                  color="rgba(168,85,247,0.7)"
                  delay={0.7}
                />
                <div style={{ marginTop: '8px' }}>
                  <HorizontalBar
                    label="Créditos"
                    value={stats.engCreditsEarned}
                    total={stats.engCreditsTotal}
                    color="rgba(168,85,247,0.5)"
                    delay={0.8}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <TrendingUp size={14} />
            Progreso por Categoría
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '10px',
          }}>
            {Array.from(stats.categories.entries())
              .sort(([, a], [, b]) => (b.done / b.total) - (a.done / a.total))
              .map(([cat, { total, done }], i) => (
                <HorizontalBar
                  key={cat}
                  label={cat}
                  value={done}
                  total={total}
                  color="rgba(34,197,94,0.6)"
                  delay={0.5 + i * 0.05}
                />
              ))}
          </div>
        </motion.div>

        {/* Subject Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SubjectList
            title="Materias Aprobadas"
            subjects={stats.byStatus.approved}
            icon={<CheckCircle2 size={14} />}
            color="rgba(34,197,94,0.9)"
            defaultOpen
          />
          <SubjectList
            title="Final Pendiente"
            subjects={stats.byStatus.final}
            icon={<FileText size={14} />}
            color="rgba(249,115,22,0.9)"
          />
          <SubjectList
            title="Regulares"
            subjects={stats.byStatus.regular}
            icon={<Clock size={14} />}
            color="rgba(251,191,36,0.9)"
          />
          <SubjectList
            title="Faltan para Analista"
            subjects={stats.analystRemaining}
            icon={<Award size={14} />}
            color="rgba(59,130,246,0.9)"
          />
          <SubjectList
            title="Faltan para Ingeniería"
            subjects={stats.engRemaining}
            icon={<Award size={14} />}
            color="rgba(168,85,247,0.9)"
          />
        </div>
      </div>
    </div>
  );
};
