import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, Save, LogOut, User, Palette, GraduationCap,
  Star, Heart, Zap, Shield, Flame, Sun, Moon, Cloud,
  Anchor, Coffee, Music, Camera, Gamepad2, Rocket,
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

const COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#ef4444', '#f97316', '#f59e0b',
  '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
];

interface Props {
  onBack: () => void;
}

export const ProfileSettings: React.FC<Props> = ({ onBack }) => {
  const { profile, user, signOut } = useAuth();

  const [degreeTrack, setDegreeTrack] = useState(profile?.degree_track || 'ingeniero');
  const [profileColor, setProfileColor] = useState(profile?.profile_color || '#3b82f6');
  const [profileIcon, setProfileIcon] = useState(profile?.profile_icon || 'User');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: displayName,
      degree_track: degreeTrack,
      profile_color: profileColor,
      profile_icon: profileIcon,
    }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Reload page to update profile everywhere
    window.location.reload();
  };

  const selectedIconNode = ICONS.find(i => i.name === profileIcon)?.icon || <User size={18} />;

  return (
    <div style={{
      flex: 1,
      overflow: 'auto',
      padding: '24px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
          </button>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Configuración
          </h2>
        </div>

        {/* Avatar preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '28px',
            gap: '10px',
          }}
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
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>
            {user?.email}
          </span>
        </motion.div>

        {/* Form sections */}
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
                color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontFamily: "'Inter', sans-serif",
                outline: 'none',
              }}
              onFocus={e => e.currentTarget.style.borderColor = `${profileColor}60`}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
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
                    fontSize: '11px', fontWeight: 600, fontFamily: "'Inter', sans-serif",
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
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: color,
                  }} />
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
                fontSize: '12px', fontWeight: 700, fontFamily: "'Inter', sans-serif",
                cursor: saving ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <Save size={13} />
              {saved ? 'Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
            </button>

            <button
              onClick={signOut}
              style={{
                padding: '10px 16px', borderRadius: '8px',
                border: '1px solid rgba(239,68,68,0.15)',
                background: 'rgba(239,68,68,0.05)',
                color: 'rgba(239,68,68,0.7)',
                fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif",
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
            >
              <LogOut size={13} />
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
