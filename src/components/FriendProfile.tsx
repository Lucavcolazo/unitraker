import React, { useEffect, useState } from 'react';
import { useFriendsStore } from '../store/useFriendsStore';
import { useStudyStore } from '../store/useStudyStore';
import { usePlanStore } from '../store/usePlanStore';
import { useAuth } from '../contexts/AuthContext';
import { curriculum, type Subject, type SubjectStatus } from '../data/curriculum';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, FileText, BookOpen, Copy } from 'lucide-react';
import {
  Star, Heart, Zap, Shield, Flame, Sun, Moon, Cloud,
  Anchor, Coffee, Music, Camera, Gamepad2, Rocket, User, GraduationCap,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  User: <User size={20} />, Star: <Star size={20} />, Heart: <Heart size={20} />,
  Zap: <Zap size={20} />, Shield: <Shield size={20} />, Flame: <Flame size={20} />,
  Sun: <Sun size={20} />, Moon: <Moon size={20} />, Cloud: <Cloud size={20} />,
  Anchor: <Anchor size={20} />, Coffee: <Coffee size={20} />, Music: <Music size={20} />,
  Camera: <Camera size={20} />, Gamepad2: <Gamepad2 size={20} />, Rocket: <Rocket size={20} />,
  GraduationCap: <GraduationCap size={20} />,
};

const statusIcon: Record<SubjectStatus, React.ReactNode> = {
  approved: <CheckCircle2 size={10} />,
  final: <FileText size={10} />,
  pending: <BookOpen size={10} />,
};

const statusColor: Record<SubjectStatus, string> = {
  approved: '#4ADE80',
  final: '#FB923C',
  pending: 'rgba(255,255,255,0.35)',
};

interface Props {
  friendId: string;
  onBack: () => void;
  compareMode?: boolean;
}

export const FriendProfile: React.FC<Props> = ({ friendId, onBack, compareMode = false }) => {
  const { user } = useAuth();
  const { friendStates, friendProfile, friendPlan, friendPlanSubjects, loadFriendStates, clearFriendView } = useFriendsStore();
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
  const myApproved = compareMode ? baseSubjects.filter(s => subjectStates[s.id] === 'approved').length : 0;

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

  // Agrupar por año-cuatrimestre
  const groups: Record<string, Subject[]> = {};
  baseSubjects.forEach(s => {
    const key = `${s.year}-${s.semester}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });
  const rowKeys = Object.keys(groups).sort((a, b) => {
    const [ay, as_] = a.split('-').map(Number);
    const [by, bs] = b.split('-').map(Number);
    return ay * 10 + as_ - (by * 10 + bs);
  });

  // Vista preview (como Mi Perfil): solo tarjeta con stats y progreso, sin grilla de materias
  if (!compareMode) {
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '24px', fontFamily: "'Geist', sans-serif" }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={onBack} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
                color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
              }}>
                <ArrowLeft size={14} />
              </button>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                Perfil de {friendProfile.display_name}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '14px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '16px',
            }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: `${friendProfile.profile_color}18`,
              border: `2.5px solid ${friendProfile.profile_color}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: friendProfile.profile_color,
            }}>
              {ICON_MAP[friendProfile.profile_icon] || <User size={28} />}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                {friendProfile.display_name}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>
                {friendSubtitle}
              </div>
              {friendPlan && (
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>
                  Plan: {friendPlan.name}
                </div>
              )}
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Aprobadas', value: friendApproved, color: 'rgba(34,197,94,0.8)', icon: <CheckCircle2 size={13} /> },
              { label: 'Final pend.', value: friendFinals, color: 'rgba(249,115,22,0.8)', icon: <FileText size={13} /> },
              { label: 'Total', value: friendTotal, color: 'rgba(255,255,255,0.5)', icon: <GraduationCap size={13} /> },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: s.color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '10px',
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Progreso</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: friendProfile.profile_color }}>{friendPct}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${friendPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: '3px', background: friendProfile.profile_color }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista comparación: header + grilla de materias
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px', fontFamily: "'Geist', sans-serif" }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
            color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
          }}>
            <ArrowLeft size={14} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: `${friendProfile.profile_color}18`,
              border: `2px solid ${friendProfile.profile_color}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: friendProfile.profile_color,
            }}>
              {ICON_MAP[friendProfile.profile_icon] || <User size={20} />}
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                Comparación
              </h2>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                Vos: {myApproved} · {friendProfile.display_name}: {friendApproved}
              </p>
            </div>
          </div>
        </div>

        {/* Subject grid */}
        {rowKeys.map(key => {
          const [year, sem] = key.split('-').map(Number);
          const semLabel = sem === 0 ? `${year}° Año · Anual` : `${year}° Año · ${sem}° Cuat.`;

          return (
            <div key={key} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                {semLabel}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {groups[key].map((sub, i) => {
                  const fStatus: SubjectStatus = friendStates[sub.id] || 'pending';
                  const mStatus: SubjectStatus = subjectStates[sub.id] || 'pending';
                  const fColor = statusColor[fStatus];
                  const mColor = statusColor[mStatus];

                  return (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                      style={{
                        padding: compareMode ? '6px 8px' : '8px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${fColor.replace('0.8', '0.2').replace('0.15', '0.06')}`,
                        background: `${fColor.replace('0.8', '0.04').replace('0.15', '0.02')}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        minWidth: compareMode ? '140px' : '120px',
                        flex: '0 0 auto',
                      }}
                    >
                      {compareMode && (
                        <div style={{
                          width: 16, height: 16, borderRadius: '3px',
                          background: `${mColor.replace('0.8', '0.15').replace('0.15', '0.06')}`,
                          border: `1px solid ${mColor.replace('0.8', '0.3').replace('0.15', '0.1')}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: mColor,
                          flexShrink: 0,
                        }} title="Tu estado">
                          {statusIcon[mStatus]}
                        </div>
                      )}
                      <div style={{
                        width: 16, height: 16, borderRadius: '3px',
                        background: `${fColor.replace('0.8', '0.15').replace('0.15', '0.06')}`,
                        border: `1px solid ${fColor.replace('0.8', '0.3').replace('0.15', '0.1')}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: fColor,
                        flexShrink: 0,
                      }} title={compareMode ? `${friendProfile.display_name}` : 'Estado'}>
                        {statusIcon[fStatus]}
                      </div>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.2,
                      }}>
                        {sub.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Compare legend */}
        <div style={{
            marginTop: '16px', padding: '10px 14px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
            display: 'flex', gap: '16px', fontSize: '10px', color: 'rgba(255,255,255,0.35)',
          }}>
            <span>Izquierda = tu estado</span>
            <span>Derecha = {friendProfile.display_name}</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              {Object.entries(statusColor).map(([status, color]) => (
                <span key={status} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                  {status === 'approved' ? 'Aprob.' : status === 'final' ? 'Final' : 'Pend.'}
                </span>
              ))}
            </span>
          </div>
      </div>
    </div>
  );
};
