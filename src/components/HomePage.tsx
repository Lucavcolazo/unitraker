import React, { useMemo, useEffect, useState } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { useAuth } from '../contexts/AuthContext';
import { usePlanStore } from '../store/usePlanStore';
import { curriculum } from '../data/curriculum';
import { Map, BarChart3, Users, ArrowRight } from 'lucide-react';
import type { Section } from '../App';

interface Props {
  onNavigate: (section: Section) => void;
}

/* ── Animated counter ── */
const AnimatedNumber: React.FC<{ value: number; decimals?: number; delay?: number }> = ({ value, decimals = 0, delay = 0 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 900;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(parseFloat((eased * value).toFixed(decimals)));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }, delay);
    return () => clearTimeout(timer);
  }, [value, decimals, delay]);
  return <span>{decimals > 0 ? display.toFixed(decimals) : display}</span>;
};

/* ── CSS Variables (matching mockup) ── */
const V = {
  bg: '#0a0a0b',
  surface: '#111113',
  surface2: '#18181b',
  border: 'rgba(255,255,255,0.07)',
  text: '#e4e4e7',
  muted: '#52525b',
  green: '#22c55e',
  greenDim: 'rgba(34,197,94,0.12)',
  orange: '#f97316',
  orangeDim: 'rgba(249,115,22,0.12)',
  blue: '#6366f1',
  blueDim: 'rgba(99,102,241,0.12)',
  purple: '#a855f7',
  purpleDim: 'rgba(168,85,247,0.12)',
};

const fontTitle = "'Syne', sans-serif";
const fontMono = "'DM Mono', monospace";

/* ── Inline keyframes (injected once) ── */
const keyframesCSS = `
@keyframes homeFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

export const HomePage: React.FC<Props> = ({ onNavigate }) => {
  const { subjectStates, getAverages, subjectGrades } = useStudyStore();
  const { profile } = useAuth();
  const { activePlanSubjects } = usePlanStore();

  const baseCurriculum = activePlanSubjects.length > 0 ? activePlanSubjects : curriculum;

  const filteredCurriculum = useMemo(() => {
    if (profile?.degree_track === 'analista') {
      return baseCurriculum.filter(s => s.isAnalyst);
    }
    return baseCurriculum;
  }, [profile?.degree_track, baseCurriculum]);

  const stats = useMemo(() => {
    let approved = 0, final = 0, pending = 0;
    filteredCurriculum.forEach(s => {
      const st = subjectStates[s.id] || 'pending';
      if (st === 'approved') approved++;
      else if (st === 'final') final++;
      else pending++;
    });

    const analystAll = baseCurriculum.filter(s => s.isAnalyst);
    const analystApproved = analystAll.filter(s => subjectStates[s.id] === 'approved');
    const engAll = baseCurriculum;
    const engApproved = engAll.filter(s => subjectStates[s.id] === 'approved');

    const finalSubjects = baseCurriculum.filter(s => subjectStates[s.id] === 'final');

    return {
      approved, final, pending,
      total: filteredCurriculum.length,
      analystAll, analystApproved,
      engAll, engApproved,
      finalSubjects,
    };
  }, [subjectStates, filteredCurriculum, baseCurriculum]);

  const averages = useMemo(
    () => getAverages(filteredCurriculum.map(s => s.id)),
    [getAverages, filteredCurriculum, subjectGrades]
  );

  const analystPercent = stats.analystAll.length > 0 ? Math.round((stats.analystApproved.length / stats.analystAll.length) * 100) : 0;
  const engPercent = stats.engAll.length > 0 ? Math.round((stats.engApproved.length / stats.engAll.length) * 100) : 0;

  const displayName = profile?.display_name || 'Usuario';

  const [heroVisible, setHeroVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      flex: 1,
      overflow: 'auto',
      background: V.bg,
      color: V.text,
      fontFamily: fontTitle,
    }}>
      <style>{keyframesCSS}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* ═══ HERO ═══ */}
        <div style={{
          marginBottom: 56,
          animation: 'homeFadeUp 0.5s ease forwards',
        }}>
          <div style={{
            fontFamily: fontMono,
            fontSize: 12,
            color: V.green,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: heroVisible ? 1 : 0,
            maxHeight: heroVisible ? 30 : 0,
            overflow: 'hidden',
            transition: 'opacity 0.8s ease, max-height 0.8s ease, margin-bottom 0.8s ease',
          }}>
            <span style={{ width: 20, height: 1, background: V.green, display: 'inline-block' }} />
            Bienvenido de vuelta
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -1.5,
            marginBottom: 14,
            margin: 0,
            marginBlockEnd: 14,
          }}>
            Hola,{' '}
            <span style={{
              background: 'linear-gradient(90deg, #22c55e, #86efac)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {displayName}
            </span>
          </h1>
          <div style={{
            fontSize: 15,
            color: V.muted,
            fontFamily: fontMono,
            fontWeight: 400,
          }}>
          </div>
        </div>

        {/* ═══ QUICK STATS BAR ═══ */}
        <div className="grid-stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          background: V.border,
          border: `1px solid ${V.border}`,
          borderRadius: 14,
          overflow: 'hidden',
          marginBottom: 36,
          animation: 'homeFadeUp 0.5s ease 0.1s both',
        }}>
          {/* Aprobadas */}
          <div style={{ background: V.surface, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: V.muted }}>
              Aprobadas
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1, color: V.green }}>
              <AnimatedNumber value={stats.approved} delay={100} />
            </div>
            <div style={{ fontSize: 11, color: V.muted, fontFamily: fontMono }}>
              de {stats.total} materias
            </div>
          </div>

          {/* Final Pendiente */}
          <div style={{ background: V.surface, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: V.muted }}>
              {stats.final === 1 ? 'Final Pendiente' : 'Finales Pendientes'}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1, color: V.orange }}>
              <AnimatedNumber value={stats.final} delay={200} />
            </div>
            <div style={{ fontSize: 11, color: V.muted, fontFamily: fontMono }}>
              por rendir
            </div>
          </div>

          {/* Pendientes */}
          <div style={{ background: V.surface, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: V.muted }}>
              Pendientes
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1, color: '#71717a' }}>
              <AnimatedNumber value={stats.pending} delay={300} />
            </div>
            <div style={{ fontSize: 11, color: V.muted, fontFamily: fontMono }}>
              por cursar
            </div>
          </div>

          {/* Promedio */}
          <div style={{ background: V.surface, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: V.muted }}>
              Promedio
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1, color: V.text }}>
              {averages.materiasConNota > 0 ? <AnimatedNumber value={averages.average ?? 0} decimals={2} delay={400} /> : '–'}
            </div>
            <div style={{ fontSize: 11, color: V.muted, fontFamily: fontMono }}>
              {averages.materiasConNota > 0 ? `${averages.materiasConNota} con nota` : 'sin notas aún'}
            </div>
          </div>
        </div>

        {/* ═══ SECTION CARDS ═══ */}
        <SectionHeader title="Secciones" />

        <div className="grid-sections" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 36,
          animation: 'homeFadeUp 0.5s ease 0.2s both',
        }}>
          <NavCard
            color="green"
            icon={<Map size={22} />}
            title="Mapa Curricular"
            desc="Visualizá el árbol completo de materias y dependencias de tu carrera."
            cta="Ir al Mapa"
            onClick={() => onNavigate('map')}
          />
          <NavCard
            color="orange"
            icon={<BarChart3 size={22} />}
            title="Estadísticas"
            desc="Analizá tu progreso, promedio y estado por categoría y título."
            cta="Ver Stats"
            onClick={() => onNavigate('stats')}
          />
          <NavCard
            color="blue"
            icon={<Users size={22} />}
            title="Amigos"
            desc="Compará tu progreso con el de tus compañeros y encontrá nuevos."
            cta="Ver Amigos"
            onClick={() => onNavigate('friends')}
          />
        </div>

        {/* ═══ CAREER PROGRESS ═══ */}
        <SectionHeader title="Progreso por Título" />

        <div className="grid-career" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 36,
          animation: 'homeFadeUp 0.5s ease 0.3s both',
        }}>
          <CareerCard
            name="Analista en Sistemas"
            total={stats.analystAll.length}
            approved={stats.analystApproved.length}
            percent={analystPercent}
            color={V.blue}
            gradient="linear-gradient(90deg, #6366f1, #818cf8)"
          />
          <CareerCard
            name="Ingeniería en Sistemas"
            total={stats.engAll.length}
            approved={stats.engApproved.length}
            percent={engPercent}
            color={V.purple}
            gradient="linear-gradient(90deg, #a855f7, #c084fc)"
          />
        </div>

        {/* ═══ PENDING FINALS ═══ */}
        {stats.finalSubjects.length > 0 && (
          <div style={{ animation: 'homeFadeUp 0.5s ease 0.4s both' }}>
            <SectionHeader title={stats.finalSubjects.length === 1 ? 'Final Pendiente' : 'Finales Pendientes'} />
            {stats.finalSubjects.map(s => (
              <div key={s.id} style={{
                background: V.surface,
                border: `1px solid ${V.border}`,
                borderRadius: 16,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
                transition: 'all 0.15s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = V.surface2;
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = V.surface;
                e.currentTarget.style.borderColor = V.border;
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: V.orange, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: V.muted, fontFamily: fontMono, marginTop: 2 }}>
                      {s.year}° Año · {s.semester === 0 ? 'Anual' : `${s.semester}° Cuatrimestre`}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: 10,
                  fontFamily: fontMono,
                  padding: '3px 8px',
                  borderRadius: 99,
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  background: 'rgba(249,115,22,0.15)',
                  color: V.orange,
                }}>
                  FINAL
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

/* ── Sub-components ── */

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
    <div style={{
      fontSize: 11,
      fontFamily: fontMono,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: V.muted,
    }}>
      {title}
    </div>
    <div style={{ flex: 1, height: 1, background: V.border }} />
  </div>
);

const NavCard: React.FC<{
  color: 'green' | 'orange' | 'blue';
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
}> = ({ color, icon, title, desc, cta, onClick }) => {
  const colors = {
    green: { accent: V.green, dim: V.greenDim },
    orange: { accent: V.orange, dim: V.orangeDim },
    blue: { accent: V.blue, dim: V.blueDim },
  };
  const c = colors[color];

  return (
    <div
      onClick={onClick}
      style={{
        background: V.surface,
        border: `1px solid ${V.border}`,
        borderRadius: 16,
        padding: 28,
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column' as const,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        (e.currentTarget.querySelector('.card-overlay') as HTMLElement)?.style && ((e.currentTarget.firstElementChild as HTMLElement).style.opacity = '1');
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = V.border;
        e.currentTarget.style.transform = 'translateY(0)';
        (e.currentTarget.querySelector('.card-overlay') as HTMLElement)?.style && ((e.currentTarget.firstElementChild as HTMLElement).style.opacity = '0');
      }}
    >
      {/* Hover overlay */}
      <div className="card-overlay" style={{
        position: 'absolute',
        inset: 0,
        background: c.dim,
        opacity: 0,
        transition: 'opacity 0.2s',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        background: c.dim,
        color: c.accent,
        position: 'relative',
      }}>
        {icon}
      </div>

      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, marginBottom: 6, position: 'relative' }}>
        {title}
      </div>
      <div style={{
        fontSize: 13,
        color: V.muted,
        lineHeight: 1.5,
        fontFamily: fontMono,
        fontWeight: 400,
        marginBottom: 24,
        position: 'relative',
        flex: 1,
      }}>
        {desc}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: c.accent,
        position: 'relative',
      }}>
        {cta}
        <ArrowRight size={14} style={{ transition: 'transform 0.15s' }} />
      </div>
    </div>
  );
};

const CareerCard: React.FC<{
  name: string;
  total: number;
  approved: number;
  percent: number;
  color: string;
  gradient: string;
}> = ({ name, total, approved, percent, color, gradient }) => (
  <div style={{
    background: V.surface,
    border: `1px solid ${V.border}`,
    borderRadius: 16,
    padding: 24,
  }}>
    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, letterSpacing: -0.3 }}>
      {name}
    </div>
    <div style={{ fontSize: 11, fontFamily: fontMono, color: V.muted, marginBottom: 18 }}>
      {total} materias totales
    </div>
    <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -2, lineHeight: 1, marginBottom: 4 }}>
      <AnimatedNumber value={approved} delay={300} />
      <span style={{ fontSize: 20, fontWeight: 500, color: V.muted, letterSpacing: -0.5 }}> / {total}</span>
    </div>
    <div style={{ fontSize: 11, fontFamily: fontMono, color, marginTop: 4 }}>
      {percent}% completado
    </div>
    <div style={{
      marginTop: 16,
      height: 4,
      background: 'rgba(255,255,255,0.06)',
      borderRadius: 99,
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        borderRadius: 99,
        width: `${percent}%`,
        background: gradient,
        transition: 'width 1s ease',
      }} />
    </div>
  </div>
);
