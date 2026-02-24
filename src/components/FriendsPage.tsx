import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFriendsStore } from '../store/useFriendsStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, UserPlus, Check, X, Users, ChevronRight,
  ArrowLeftRight, Loader2, Bell,
  Star, Heart, Zap, Shield, Flame, Sun, Moon, Cloud,
  Anchor, Coffee, Music, Camera, Gamepad2, Rocket, User, GraduationCap,
} from 'lucide-react';

// Icon lookup
const ICON_MAP: Record<string, React.ReactNode> = {
  User: <User size={14} />, Star: <Star size={14} />, Heart: <Heart size={14} />,
  Zap: <Zap size={14} />, Shield: <Shield size={14} />, Flame: <Flame size={14} />,
  Sun: <Sun size={14} />, Moon: <Moon size={14} />, Cloud: <Cloud size={14} />,
  Anchor: <Anchor size={14} />, Coffee: <Coffee size={14} />, Music: <Music size={14} />,
  Camera: <Camera size={14} />, Gamepad2: <Gamepad2 size={14} />, Rocket: <Rocket size={14} />,
  GraduationCap: <GraduationCap size={14} />,
};

interface Props {
  onViewFriend: (friendId: string) => void;
  onCompare: (friendId: string) => void;
}

export const FriendsPage: React.FC<Props> = ({ onViewFriend, onCompare }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const {
    friends, pendingRequests, searchResults, searching, loading,
    loadFriends, loadPendingRequests, searchUsers,
    sendRequest, acceptRequest, rejectRequest, removeFriend, clearSearch,
    loadFriendStats,
  } = useFriendsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadFriends(user.id);
      loadPendingRequests(user.id);
    }
  }, [user, loadFriends, loadPendingRequests]);

  useEffect(() => {
    if (!user || friends.length === 0) return;
    friends.forEach(f => {
      const friend = f.sender_id === user.id ? f.receiver : f.sender;
      if (friend?.id) loadFriendStats(friend.id);
    });
  }, [user, friends, loadFriendStats]);

  const handleSearch = useCallback(() => {
    if (user && searchQuery.trim()) {
      searchUsers(searchQuery, user.id);
    }
  }, [user, searchQuery, searchUsers]);

  const handleSend = async (receiverId: string) => {
    if (!user) return;
    setSendingTo(receiverId);
    const { error } = await sendRequest(user.id, receiverId);
    setSendingTo(null);
    if (error) {
      setSentMessage(error);
    } else {
      setSentMessage('Solicitud enviada');
    }
    setTimeout(() => setSentMessage(''), 3000);
    clearSearch();
    setSearchQuery('');
  };

  const getFriendFromFriendship = (f: typeof friends[0]) => {
    if (!user) return null;
    return f.sender_id === user.id ? f.receiver : f.sender;
  };

  return (
    <div style={{
      flex: 1,
      overflow: 'auto',
      padding: '24px',
      fontFamily: "'Syne', sans-serif",
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={13} /> Buscar Compañeros
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Nombre o email..."
              ref={searchInputRef}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontFamily: "'Syne', sans-serif",
                outline: 'none',
              }}
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              style={{
                padding: '9px 16px', borderRadius: '8px', border: 'none',
                background: 'rgba(59,130,246,0.15)', color: 'rgba(59,130,246,0.8)',
                fontSize: '12px', fontWeight: 600, fontFamily: "'Syne', sans-serif",
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              {searching ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={13} />}
              Buscar
            </button>
          </div>

          {sentMessage && (
            <div style={{
              marginTop: '8px', padding: '6px 10px', borderRadius: '6px',
              background: sentMessage.includes('error') || sentMessage.includes('Ya') ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
              fontSize: '11px',
              color: sentMessage.includes('error') || sentMessage.includes('Ya') ? 'rgba(239,68,68,0.8)' : 'rgba(34,197,94,0.8)',
            }}>
              {sentMessage}
            </div>
          )}

          {/* Search Results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                {searchResults.map(u => (
                  <div
                    key={u.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.01)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: `${u.profile_color}18`,
                        border: `1.5px solid ${u.profile_color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: u.profile_color,
                      }}>
                        {ICON_MAP[u.profile_icon] || <User size={14} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{u.display_name}</div>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>
                          {u.degree_track === 'analista' ? 'Analista' : 'Ingeniería'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSend(u.id)}
                      disabled={sendingTo === u.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '5px 10px', borderRadius: '6px', border: 'none',
                        background: 'rgba(59,130,246,0.12)', color: 'rgba(59,130,246,0.8)',
                        fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                        fontFamily: "'Syne', sans-serif",
                      }}
                    >
                      <UserPlus size={11} /> Agregar
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'rgba(251,191,36,0.03)',
              border: '1px solid rgba(251,191,36,0.1)',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(251,191,36,0.7)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={13} /> Solicitudes Pendientes
              <span style={{
                fontSize: '9px', fontWeight: 700, background: 'rgba(251,191,36,0.15)',
                padding: '2px 6px', borderRadius: '10px', color: 'rgba(251,191,36,0.8)',
              }}>{pendingRequests.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pendingRequests.map(req => (
                <div
                  key={req.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `${req.sender?.profile_color || '#3b82f6'}18`,
                      border: `1.5px solid ${req.sender?.profile_color || '#3b82f6'}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: req.sender?.profile_color || '#3b82f6',
                    }}>
                      {ICON_MAP[req.sender?.profile_icon || 'User'] || <User size={14} />}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                      {req.sender?.display_name || 'Usuario'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => acceptRequest(req.id)}
                      style={{
                        width: 28, height: 28, borderRadius: '6px', border: 'none',
                        background: 'rgba(34,197,94,0.12)', color: 'rgba(34,197,94,0.8)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => rejectRequest(req.id)}
                      style={{
                        width: 28, height: 28, borderRadius: '6px', border: 'none',
                        background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.6)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Friends List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={13} /> Mis Amigos
            <span style={{
              fontSize: '9px', fontWeight: 700, background: 'rgba(255,255,255,0.06)',
              padding: '2px 6px', borderRadius: '10px', color: 'rgba(255,255,255,0.3)',
            }}>{friends.length}</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.2)' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : friends.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 24px',
              background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
              borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} style={{ color: 'rgba(255,255,255,0.25)' }} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Aún no tenés amigos</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', maxWidth: '280px' }}>
                Agregá compañeros para comparar progreso y ver quién va adelante.
              </div>
              <button
                type="button"
                onClick={() => searchInputRef.current?.focus()}
                style={{
                  marginTop: '4px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--bg-border)',
                  background: 'var(--bg-elevated)', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'Syne', sans-serif",
                }}
              >
                Buscar compañeros
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {friends.map(f => {
                const friend = getFriendFromFriendship(f);
                if (!friend) return null;

                return (
                  <div
                    key={f.id}
                    style={{
                      padding: '12px', borderRadius: '10px', background: 'var(--bg-surface)',
                      border: '1px solid var(--bg-border)',
                      display: 'flex', flexDirection: 'column', gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}
                        onClick={() => onViewFriend(friend.id)}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: `${friend.profile_color}18`,
                          border: `1.5px solid ${friend.profile_color}40`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: friend.profile_color,
                        }}>
                          {ICON_MAP[friend.profile_icon] || <User size={14} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                            {friend.display_name}
                          </div>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>
                            {friend.degree_track === 'analista' ? 'Analista' : 'Ingeniería'}
                          </div>
                        </div>
                        <ChevronRight size={13} style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); onCompare(friend.id); }}
                          title="Comparar"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '3px',
                            padding: '5px 8px', borderRadius: '6px', border: 'none',
                            background: 'rgba(168,85,247,0.1)', color: 'rgba(168,85,247,0.7)',
                            fontSize: '9px', fontWeight: 600, cursor: 'pointer',
                            fontFamily: "'Syne', sans-serif",
                          }}
                        >
                          <ArrowLeftRight size={10} /> Comparar
                        </button>
                        <button
                          onClick={() => removeFriend(f.id)}
                          title="Eliminar"
                          style={{
                            width: 26, height: 26, borderRadius: '6px', border: 'none',
                            background: 'rgba(239,68,68,0.06)', color: 'rgba(239,68,68,0.4)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
