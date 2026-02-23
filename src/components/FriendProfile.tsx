import React, { useEffect } from 'react';
import { useFriendsStore } from '../store/useFriendsStore';
import { useStudyStore } from '../store/useStudyStore';
import { curriculum, type SubjectStatus } from '../data/curriculum';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, FileText, BookOpen } from 'lucide-react';
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
  regular: <Clock size={10} />,
  pending: <BookOpen size={10} />,
};

const statusColor: Record<SubjectStatus, string> = {
  approved: 'rgba(34,197,94,0.8)',
  final: 'rgba(249,115,22,0.8)',
  regular: 'rgba(251,191,36,0.8)',
  pending: 'rgba(255,255,255,0.15)',
};

interface Props {
  friendId: string;
  onBack: () => void;
  compareMode?: boolean;
}

export const FriendProfile: React.FC<Props> = ({ friendId, onBack, compareMode = false }) => {
  const { friendStates, friendProfile, loadFriendStates, clearFriendView } = useFriendsStore();
  const { subjectStates } = useStudyStore();

  useEffect(() => {
    loadFriendStates(friendId);
    return () => clearFriendView();
  }, [friendId, loadFriendStates, clearFriendView]);

  if (!friendProfile) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(59,130,246,0.15)', borderTopColor: 'rgba(59,130,246,0.7)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const friendApproved = curriculum.filter(s => friendStates[s.id] === 'approved').length;
  const myApproved = compareMode ? curriculum.filter(s => subjectStates[s.id] === 'approved').length : 0;

  // Group by year-semester
  const groups: Record<string, typeof curriculum> = {};
  curriculum.forEach(s => {
    const key = `${s.year}-${s.semester}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });
  const rowKeys = Object.keys(groups).sort((a, b) => {
    const [ay, as_] = a.split('-').map(Number);
    const [by, bs] = b.split('-').map(Number);
    return ay * 10 + as_ - (by * 10 + bs);
  });

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
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
                {compareMode ? `Comparación` : friendProfile.display_name}
              </h2>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                {friendProfile.degree_track === 'analista' ? 'Analista en Sistemas' : 'Ingeniería en Sistemas'}
                {' · '}
                {friendApproved}/{curriculum.length} aprobadas
              </p>
            </div>
          </div>

          {compareMode && (
            <div style={{
              padding: '6px 12px', borderRadius: '8px',
              background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)',
              fontSize: '11px', fontWeight: 600, color: 'rgba(168,85,247,0.7)',
            }}>
              Vos: {myApproved} · {friendProfile.display_name}: {friendApproved}
            </div>
          )}
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
        {compareMode && (
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
                  {status === 'approved' ? 'Aprob.' : status === 'final' ? 'Final' : status === 'regular' ? 'Reg.' : 'Pend.'}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
