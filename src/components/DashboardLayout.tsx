import React, { useEffect, useState } from 'react';
import { ProgressSummary } from './ProgressSummary';
import { Map, BarChart3, Users, Settings, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFriendsStore } from '../store/useFriendsStore';
import type { Section } from '../App';
import {
  Star, Heart, Zap, Shield, Flame, Sun, Moon, Cloud,
  Anchor, Coffee, Music, Camera, Gamepad2, Rocket, GraduationCap,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  User: <User size={12} />, Star: <Star size={12} />, Heart: <Heart size={12} />,
  Zap: <Zap size={12} />, Shield: <Shield size={12} />, Flame: <Flame size={12} />,
  Sun: <Sun size={12} />, Moon: <Moon size={12} />, Cloud: <Cloud size={12} />,
  Anchor: <Anchor size={12} />, Coffee: <Coffee size={12} />, Music: <Music size={12} />,
  Camera: <Camera size={12} />, Gamepad2: <Gamepad2 size={12} />, Rocket: <Rocket size={12} />,
  GraduationCap: <GraduationCap size={12} />,
};

interface Props {
  children: React.ReactNode;
  section: Section;
  onSectionChange: (section: Section) => void;
}

export const DashboardLayout: React.FC<Props> = ({ children, section, onSectionChange }) => {
  const { profile, user } = useAuth();
  const { pendingRequests, loadPendingRequests } = useFriendsStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadPendingRequests(user.id);
    }
  }, [user, loadPendingRequests]);

  useEffect(() => {
    setPendingCount(pendingRequests.length);
  }, [pendingRequests]);

  const tabs: { id: Section; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'map', label: 'Mapa', icon: <Map size={14} /> },
    { id: 'stats', label: 'Estadísticas', icon: <BarChart3 size={14} /> },
    { id: 'friends', label: 'Amigos', icon: <Users size={14} />, badge: pendingCount },
  ];

  const profileColor = profile?.profile_color || '#3b82f6';
  const profileIcon = profile?.profile_icon || 'User';

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgb(8, 8, 12)',
      color: 'rgba(255,255,255,0.85)',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(8, 8, 12, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0,
      }}>
        {/* Left: Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: '7px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15))',
            border: '1px solid rgba(59,130,246,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <GraduationCap size={15} style={{ color: 'rgba(59,130,246,0.7)' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '14px', fontWeight: 700,
              color: 'rgba(255,255,255,0.9)', margin: 0, letterSpacing: '-0.01em',
            }}>
              UniTraker
            </h1>
            <p style={{
              fontSize: '9px', color: 'rgba(255,255,255,0.25)',
              margin: 0, letterSpacing: '0.03em',
            }}>
              {profile?.degree_track === 'analista' ? 'Analista en Sistemas' : 'Ingeniería en Sistemas'}
            </p>
          </div>
        </div>

        {/* Center: Section Tabs */}
        <div style={{
          display: 'flex',
          gap: '2px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          padding: '3px',
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.01em',
                transition: 'all 0.2s ease',
                background: section === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: section === tab.id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                position: 'relative',
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 14, height: 14, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.9)',
                  color: 'white',
                  fontSize: '8px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right: Legend + User avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Legend (only on map) */}
          <div style={{
            display: 'flex', gap: '12px',
            fontSize: '10px', fontWeight: 500, letterSpacing: '0.03em',
            opacity: section === 'map' ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: section === 'map' ? 'auto' : 'none',
          }}>
            {[
              { label: 'Pendiente', color: 'rgba(255,255,255,0.2)', bg: 'rgba(255,255,255,0.04)' },
              { label: 'Regular', color: 'rgba(251,191,36,0.8)', bg: 'rgba(251,191,36,0.1)' },
              { label: 'Final', color: 'rgba(249,115,22,0.8)', bg: 'rgba(249,115,22,0.1)' },
              { label: 'Aprobada', color: 'rgba(34,197,94,0.8)', bg: 'rgba(34,197,94,0.1)' },
            ].map(({ label, color, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: bg, border: `1.5px solid ${color}` }} />
                <span style={{ color }}>{label}</span>
              </div>
            ))}
          </div>

          {/* User avatar → settings */}
          <button
            onClick={() => onSectionChange('settings')}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '4px 10px 4px 5px', borderRadius: '20px',
              border: section === 'settings' ? `1.5px solid ${profileColor}40` : '1.5px solid rgba(255,255,255,0.06)',
              background: section === 'settings' ? `${profileColor}08` : 'rgba(255,255,255,0.02)',
              cursor: 'pointer', transition: 'all 0.2s ease',
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => { if (section !== 'settings') e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { if (section !== 'settings') e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: `${profileColor}18`,
              border: `1.5px solid ${profileColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: profileColor,
            }}>
              {ICON_MAP[profileIcon] || <User size={12} />}
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {profile?.display_name || 'Usuario'}
            </span>
            <Settings size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
          </button>
        </div>
      </header>

      {/* Progress Summary — only on map */}
      {section === 'map' && <ProgressSummary />}

      {/* Main Content */}
      <main style={{
        flex: 1,
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {children}
      </main>
    </div>
  );
};
