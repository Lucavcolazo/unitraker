import React, { useEffect, useState } from 'react';
import { useFriendsStore } from '../store/useFriendsStore';
import { useStudyStore } from '../store/useStudyStore';
import { usePlanStore } from '../store/usePlanStore';
import { useAuth } from '../contexts/AuthContext';
import { curriculum, type Subject, type SubjectStatus } from '../data/curriculum';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, FileText, BookOpen, Copy, GraduationCap, BarChart3 } from 'lucide-react';
import {
  Star, Heart, Zap, Shield, Flame, Sun, Moon, Cloud,
  Anchor, Coffee, Music, Camera, Gamepad2, Rocket, User,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  User: <User size={20} />, Star: <Star size={20} />, Heart: <Heart size={20} />,
  Zap: <Zap size={20} />, Shield: <Shield size={20} />, Flame: <Flame size={20} />,
  Sun: <Sun size={20} />, Moon: <Moon size={20} />, Cloud: <Cloud size={20} />,
  Anchor: <Anchor size={20} />, Coffee: <Coffee size={20} />, Music: <Music size={20} />,
  Camera: <Camera size={20} />, Gamepad2: <Gamepad2 size={20} />, Rocket: <Rocket size={20} />,
  GraduationCap: <GraduationCap size={20} />,
};

const statusColor: Record<SubjectStatus, string> = {
  approved: '#4ADE80',
  final: '#FB923C',
  pending: 'rgba(255,255,255,0.35)',
};

/** Donut mínimo para comparación */
const MiniDonut: React.FC<{
  segments: { value: number; color: string }[];
  size?: number;
  centerValue: string;
  centerLabel?: string;
}> = ({ segments, size = 140, centerValue, centerLabel }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((a, s) => a + s.value, 0);
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.value / total : 0;
        const dashLen = circumference * pct;
        const offset = circumference * (0.25 - acc);
        acc += pct;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        );
      })}
      <text x={size / 2} y={size / 2 - 6} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="22" fontWeight="700" fontFamily="Geist, sans-serif">
        {centerValue}
      </text>
      {centerLabel && (
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Geist, sans-serif">
          {centerLabel}
        </text>
      )}
    </svg>
  );
};

interface Props {
  friendId: string;
  onBack: () => void;
  compareMode?: boolean;
}

export const FriendProfile: React.FC<Props> = ({ friendId, onBack, compareMode = false }) => {
  const { user } = useAuth();
  const { friendStates, friendGrades, friendProfile, friendPlan, friendPlanSubjects, loadFriendStates, clearFriendView } = useFriendsStore();
  const { subjectStates } = useStudyStore();
  const { copyPlan, setActivePlan, loadUserPlans } = usePlanStore();
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadFriendStates(friendId);
    return () => clearFriendView();
  }, [friendId, loadFriendStates, clearFriendView]);

  if (!friendProfile) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist', sans-serif" }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(59,130,246,0.15)', borderTopColor: 'rgba(59,130,246,0.7)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const baseSubjects: Subject[] = friendPlanSubjects.length > 0 ? friendPlanSubjects : curriculum;
  const friendApproved = baseSubjects.filter(s => friendStates[s.id] === 'approved').length;
  const friendFinals = baseSubjects.filter(s => friendStates[s.id] === 'final').length;
  const friendTotal = baseSubjects.length;
  const friendPct = friendTotal > 0 ? Math.round((friendApproved / friendTotal) * 100) : 0;

  const friendGradeIds = baseSubjects.map(s => s.id);
  const friendGradesList = friendGradeIds.filter(id => friendGrades[id] != null).map(id => friendGrades[id]!);
  const friendAverage = friendGradesList.length > 0
    ? Math.round((friendGradesList.reduce((a, b) => a + b, 0) / friendGradesList.length) * 100) / 100
    : null;

  const friendSubtitle = friendProfile.profile_subtitle?.trim() || (friendProfile.degree_track === 'analista' ? 'Analista en Sistemas' : 'Ingeniería en Sistemas');

  const handleCopyPlan = async () => {
    if (!friendPlan?.is_public || !user) return;
    setCopying(true);
    const newPlanId = await copyPlan(friendPlan.id, user.id);
    if (newPlanId) {
      await setActivePlan(newPlanId, user.id);
      loadUserPlans(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    setCopying(false);
  };

  // ─── Vista perfil (uniforme: nombre, icono, subtítulo, total, aprobadas, finales, plan, promedio)
  if (!compareMode) {
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '24px', fontFamily: "'Geist', sans-serif" }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={onBack} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
              }}>
                <ArrowLeft size={18} />
              </button>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                Perfil
              </h2>
            </div>
            {friendPlan?.is_public && (
              <button
                onClick={handleCopyPlan}
                disabled={copying}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px', border: 'none',
                  background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.15)',
                  color: copied ? 'rgba(34,197,94,0.9)' : 'rgba(59,130,246,0.9)',
                  fontSize: '11px', fontWeight: 600, cursor: copying ? 'wait' : 'pointer',
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                <Copy size={12} />
                {copied ? 'Copiado' : 'Copiar plan'}
              </button>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `${friendProfile.profile_color}18`,
              border: `3px solid ${friendProfile.profile_color}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: friendProfile.profile_color,
            }}>
              {ICON_MAP[friendProfile.profile_icon] || <User size={36} />}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
                {friendProfile.display_name}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                {friendSubtitle}
              </div>
              {friendPlan && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>
                  Plan: {friendPlan.name}
                </div>
              )}
            </div>

            <div style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
            }}>
              {[
                { label: 'Total', value: friendTotal, color: 'rgba(255,255,255,0.5)', icon: <GraduationCap size={14} /> },
                { label: 'Aprobadas', value: friendApproved, color: '#4ADE80', icon: <CheckCircle2 size={14} /> },
                { label: 'Final pend.', value: friendFinals, color: '#FB923C', icon: <FileText size={14} /> },
                { label: 'Pendientes', value: friendTotal - friendApproved - friendFinals, color: 'rgba(255,255,255,0.35)', icon: <BookOpen size={14} /> },
              ].map(s => (
                <div
                  key={s.label}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: s.color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {friendAverage != null && (
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'rgba(74,222,128,0.06)',
                border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: '12px',
              }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BarChart3 size={14} />
                  Promedio general
                </span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#4ADE80' }}>{friendAverage.toFixed(2)}</span>
              </div>
            )}

            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Progreso</span>
                <span style={{ fontWeight: 700, color: friendProfile.profile_color }}>{friendPct}%</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${friendPct}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: '4px', background: friendProfile.profile_color }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Vista comparación: dos gráficos (uno por lado) con nombres arriba
  const myApproved = baseSubjects.filter(s => subjectStates[s.id] === 'approved').length;
  const myFinals = baseSubjects.filter(s => subjectStates[s.id] === 'final').length;
  const myPending = baseSubjects.length - myApproved - myFinals;
  const myPct = baseSubjects.length > 0 ? Math.round((myApproved / baseSubjects.length) * 100) : 0;

  const mySegments = [
    { value: myApproved, color: '#4ADE80' },
    { value: myFinals, color: '#FB923C' },
    { value: myPending, color: 'rgba(255,255,255,0.2)' },
  ];
  const friendSegments = [
    { value: friendApproved, color: '#4ADE80' },
    { value: friendFinals, color: '#FB923C' },
    { value: friendTotal - friendApproved - friendFinals, color: 'rgba(255,255,255,0.2)' },
  ];

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px', fontFamily: "'Geist', sans-serif" }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
          }}>
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Comparación
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
              {user ? 'Vos' : 'Yo'}
            </div>
            <MiniDonut
              segments={mySegments}
              centerValue={`${myPct}%`}
              centerLabel="completado"
            />
            <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} /> Aprob. ({myApproved})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FB923C' }} /> Final ({myFinals})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} /> Pend. ({myPending})
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${friendProfile.profile_color}30`,
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: friendProfile.profile_color }}>
              {friendProfile.display_name}
            </div>
            <MiniDonut
              segments={friendSegments}
              centerValue={`${friendPct}%`}
              centerLabel="completado"
            />
            <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} /> Aprob. ({friendApproved})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FB923C' }} /> Final ({friendFinals})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} /> Pend. ({friendTotal - friendApproved - friendFinals})
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
