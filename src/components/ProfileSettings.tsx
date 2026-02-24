import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStudyStore } from '../store/useStudyStore';
import { usePlanStore } from '../store/usePlanStore';
import { useFriendsStore } from '../store/useFriendsStore';
import { curriculum } from '../data/curriculum';
import { supabase } from '../lib/supabase';
import {
  Settings, Save, LogOut, User, Palette, GraduationCap, Users,
  Star, Heart, Zap, Shield, Flame, Sun, Moon, Cloud,
  Anchor, Coffee, Music, Camera, Gamepad2, Rocket,
  CheckCircle2, FileText, ChevronLeft, Plus, Trash2, BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';

const ICONS: { name: string; icon: React.ReactNode }[] = [
  { name: 'User', icon: <User size={18} /> },
  { name: 'Star', icon: <Star size={18} /> },
  { name: 'Heart', icon: <Heart size={18} /> },
  { name: 'Zap', icon: <Zap size={18} /> },
  { name: 'Shield', icon: <Shield size={18} /> },
  { name: 'Flame', icon: <Flame size={18} /> },
  { name: 'Sun', icon: <Sun size={18} /> },
  { name: 'Moon', icon: <Moon size={18} /> },
  { name: 'Cloud', icon: <Cloud size={18} /> },
  { name: 'Anchor', icon: <Anchor size={18} /> },
  { name: 'Coffee', icon: <Coffee size={18} /> },
  { name: 'Music', icon: <Music size={18} /> },
  { name: 'Camera', icon: <Camera size={18} /> },
  { name: 'Gamepad2', icon: <Gamepad2 size={18} /> },
  { name: 'Rocket', icon: <Rocket size={18} /> },
  { name: 'GraduationCap', icon: <GraduationCap size={18} /> },
];

const ICON_SMALL: Record<string, React.ReactNode> = {
  User: <User size={28} />, Star: <Star size={28} />, Heart: <Heart size={28} />,
  Zap: <Zap size={28} />, Shield: <Shield size={28} />, Flame: <Flame size={28} />,
  Sun: <Sun size={28} />, Moon: <Moon size={28} />, Cloud: <Cloud size={28} />,
  Anchor: <Anchor size={28} />, Coffee: <Coffee size={28} />, Music: <Music size={28} />,
  Camera: <Camera size={28} />, Gamepad2: <Gamepad2 size={28} />, Rocket: <Rocket size={28} />,
  GraduationCap: <GraduationCap size={28} />,
};

const COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#ef4444', '#f97316', '#f59e0b',
  '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
];

interface Props {
  onBack: () => void;
  onOpenPlanEditor?: () => void;
}

export const ProfileSettings: React.FC<Props> = ({ onBack, onOpenPlanEditor }) => {
  const navigate = useNavigate();
  const { profile, user, signOut, refreshProfile } = useAuth();
  const { subjectStates, getAverages } = useStudyStore();
  const { activePlanSubjects, plans, activePlanId, setActivePlan, deletePlan } = usePlanStore();
  const { friends } = useFriendsStore();
  const base = activePlanSubjects.length > 0 ? activePlanSubjects : curriculum;
  const [showSettings, setShowSettings] = useState(false);

  const [degreeTrack, setDegreeTrack] = useState(profile?.degree_track || 'ingeniero');
  const [profileColor, setProfileColor] = useState(profile?.profile_color || '#3b82f6');
  const [profileIcon, setProfileIcon] = useState(profile?.profile_icon || 'User');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [profileSubtitle, setProfileSubtitle] = useState(profile?.profile_subtitle ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.profile_subtitle !== undefined) setProfileSubtitle(profile.profile_subtitle ?? '');
  }, [profile?.profile_subtitle]);

  // Stats
  const filtered = degreeTrack === 'analista'
    ? base.filter(s => s.isAnalyst)
    : base;
  const profileAverages = getAverages(filtered.map(s => s.id));
  const approved = filtered.filter(s => subjectStates[s.id] === 'approved').length;
  const finals = filtered.filter(s => subjectStates[s.id] === 'final').length;
  const total = filtered.length;
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: displayName,
      degree_track: degreeTrack,
      profile_color: profileColor,
      profile_icon: profileIcon,
      profile_subtitle: profileSubtitle.trim() || null,
    }).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentColor = showSettings ? profileColor : (profile?.profile_color || '#3b82f6');
  const currentIcon = showSettings ? profileIcon : (profile?.profile_icon || 'User');
  const currentName = showSettings ? displayName : (profile?.display_name || 'Usuario');
  const currentTrack = showSettings ? degreeTrack : (profile?.degree_track || 'ingeniero');
  const currentSubtitle = showSettings ? profileSubtitle : (profile?.profile_subtitle ?? '');

  // Profile view (how others see you)
  if (!showSettings) {
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '24px', fontFamily: "'Syne', sans-serif" }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* Header with gear */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={onBack} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
                color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
              }}>
                <ChevronLeft size={14} />
              </button>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                Mi Perfil
              </h2>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
                color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                fontSize: '11px', fontWeight: 600, fontFamily: "'Syne', sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              <Settings size={13} /> Configuración
            </button>
          </div>

          {/* Profile card */}
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
              background: `${currentColor}18`,
              border: `2.5px solid ${currentColor}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: currentColor,
            }}>
              {ICON_SMALL[currentIcon] || <User size={28} />}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                {currentName}
              </div>
              {currentSubtitle ? (
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>
                  {currentSubtitle}
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
                  {currentTrack === 'analista' ? 'Analista en Sistemas' : 'Ingeniería en Sistemas'}
                </div>
              )}
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>
                {user?.email}
              </div>
              {activePlanId && (
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>
                  Plan: {plans.find(p => p.id === activePlanId)?.name ?? 'Sin plan'}
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Aprobadas', value: approved, color: '#4ADE80', icon: <CheckCircle2 size={13} /> },
              { label: finals === 1 ? 'Final pend.' : 'Finales pend.', value: finals, color: '#FB923C', icon: <FileText size={13} /> },
              { label: 'Total', value: total, color: 'rgba(255,255,255,0.5)', icon: <GraduationCap size={13} /> },
              { label: 'Amigos', value: friends.length, color: '#60A5FA', icon: <Users size={13} /> },
            ].map(s => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--bg-border)',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: s.color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Promedios (si tiene notas cargadas) */}
          {profileAverages.materiasConNota > 0 && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--bg-border)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Promedio general</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#4ADE80' }}>
                {profileAverages.average?.toFixed(2) ?? '–'}
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--bg-border)',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Progreso</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: currentColor }}>{pct}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: '3px', background: currentColor }}
              />
            </div>
          </div>

          {/* Últimas aprobadas (3) */}
          {(() => {
            const approvedList = filtered
              .filter(s => subjectStates[s.id] === 'approved')
              .sort((a, b) => (b.year * 10 + b.semester) - (a.year * 10 + a.semester))
              .slice(0, 3);
            if (approvedList.length === 0) return null;
            return (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--bg-border)',
                borderRadius: '10px',
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Últimas aprobadas
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {approvedList.map(s => (
                    <li key={s.id} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={12} style={{ color: '#4ADE80', flexShrink: 0 }} />
                      <span>{s.name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>· {s.year}° año</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // Settings view
  const selectedIconNode = ICONS.find(i => i.name === profileIcon)?.icon || <User size={18} />;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px', fontFamily: "'Syne', sans-serif" }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button onClick={() => setShowSettings(false)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
            color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
          }}>
            <ChevronLeft size={14} />
          </button>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Configuración
          </h2>
        </div>

        {/* Avatar preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px', gap: '10px' }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: `${profileColor}18`,
            border: `2px solid ${profileColor}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: profileColor,
          }}>
            {selectedIconNode}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
            {displayName || 'Sin nombre'}
          </span>
        </motion.div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
              Nombre
            </label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontFamily: "'Syne', sans-serif",
                outline: 'none',
              }}
              onFocus={e => e.currentTarget.style.borderColor = `${profileColor}60`}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Subtítulo (ej. Ingeniero en sistemas, Médico) */}
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
              Subtítulo
            </label>
            <input
              value={profileSubtitle}
              onChange={e => setProfileSubtitle(e.target.value)}
              placeholder="Ej: Ingeniero en sistemas, Médico..."
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontFamily: "'Syne', sans-serif",
                outline: 'none',
              }}
              onFocus={e => e.currentTarget.style.borderColor = `${profileColor}60`}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Planes de estudios */}
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
              <BookOpen size={12} /> Plan de estudios
            </label>
            {user && (() => {
              const myPlans = plans.filter(p => p.creator_id === user.id);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {myPlans.map(p => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{p.name}</span>
                        {activePlanId === p.id && (
                          <span style={{
                            fontSize: '9px', fontWeight: 700, color: 'rgba(59,130,246,0.8)',
                            background: 'rgba(59,130,246,0.12)', padding: '2px 6px', borderRadius: '4px',
                          }}>
                            En uso
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {activePlanId !== p.id && (
                          <button
                            onClick={() => setActivePlan(p.id, user.id)}
                            style={{
                              padding: '5px 10px', borderRadius: '6px', border: 'none',
                              background: 'rgba(59,130,246,0.12)', color: 'rgba(59,130,246,0.8)',
                              fontSize: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Syne', sans-serif",
                            }}
                          >
                            Usar
                          </button>
                        )}
                        {deleteConfirmId === p.id ? (
                          <>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>¿Eliminar?</span>
                            <button
                              onClick={() => { deletePlan(p.id, user.id); setDeleteConfirmId(null); }}
                              style={{
                                padding: '4px 8px', borderRadius: '4px', border: 'none',
                                background: 'rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.9)',
                                fontSize: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Syne', sans-serif",
                              }}
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              style={{
                                padding: '4px 8px', borderRadius: '4px', border: 'none',
                                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
                                fontSize: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Syne', sans-serif",
                              }}
                            >
                              No
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(myPlans.length > 1 ? p.id : null)}
                            style={{
                              width: 28, height: 28, borderRadius: '6px', border: 'none',
                              background: 'rgba(239,68,68,0.06)', color: 'rgba(239,68,68,0.5)',
                              cursor: myPlans.length > 1 ? 'pointer' : 'not-allowed',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            title={myPlans.length > 1 ? 'Eliminar plan' : 'Necesitás al menos un plan'}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {onOpenPlanEditor && (
                    <button
                      onClick={onOpenPlanEditor}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '8px',
                        border: '1px dashed rgba(255,255,255,0.08)', background: 'transparent',
                        color: 'rgba(59,130,246,0.8)', fontSize: '11px', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        fontFamily: "'Syne', sans-serif",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.background = 'rgba(59,130,246,0.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Plus size={14} /> Crear nuevo plan
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Degree Track */}
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
              <GraduationCap size={12} /> Título
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'analista', label: 'Analista en Sistemas' },
                { id: 'ingeniero', label: 'Ingeniería en Sistemas' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setDegreeTrack(opt.id)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '11px', fontWeight: 600, fontFamily: "'Syne', sans-serif",
                    border: degreeTrack === opt.id ? `1px solid ${profileColor}50` : '1px solid rgba(255,255,255,0.06)',
                    background: degreeTrack === opt.id ? `${profileColor}10` : 'rgba(255,255,255,0.02)',
                    color: degreeTrack === opt.id ? profileColor : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
              <Palette size={12} /> Icono
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ICONS.map(({ name, icon }) => (
                <button
                  key={name}
                  onClick={() => setProfileIcon(name)}
                  style={{
                    width: 38, height: 38, borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: profileIcon === name ? `1.5px solid ${profileColor}60` : '1px solid rgba(255,255,255,0.06)',
                    background: profileIcon === name ? `${profileColor}12` : 'rgba(255,255,255,0.02)',
                    color: profileIcon === name ? profileColor : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
              Color
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setProfileColor(color)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                    background: `${color}30`,
                    border: profileColor === color ? `2px solid ${color}` : '2px solid transparent',
                    transition: 'all 0.15s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: saved ? 'rgba(34,197,94,0.15)' : `linear-gradient(135deg, ${profileColor}e0, ${profileColor}b0)`,
                color: saved ? 'rgba(34,197,94,0.9)' : 'white',
                fontSize: '12px', fontWeight: 700, fontFamily: "'Syne', sans-serif",
                cursor: saving ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <Save size={13} />
              {saved ? 'Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              onClick={async () => {
                await signOut();
                navigate('/', { replace: true });
              }}
              style={{
                padding: '10px 16px', borderRadius: '8px',
                border: '1px solid rgba(239,68,68,0.15)',
                background: 'rgba(239,68,68,0.05)',
                color: 'rgba(239,68,68,0.7)',
                fontSize: '12px', fontWeight: 600, fontFamily: "'Syne', sans-serif",
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
            >
              <LogOut size={13} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
