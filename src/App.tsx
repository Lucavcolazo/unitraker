import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/DashboardLayout';
import { CurriculumMap } from './components/CurriculumMap';
import { StatsPage } from './components/StatsPage';
import { WelcomePage } from './components/WelcomePage';
import { LoginPage } from './components/LoginPage';
import { FriendsPage } from './components/FriendsPage';
import { FriendProfile } from './components/FriendProfile';
import { ProfileSettings } from './components/ProfileSettings';
import { useStudyStore } from './store/useStudyStore';

export type Section = 'map' | 'stats' | 'friends' | 'settings';

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { loadStates, loading: statesLoading } = useStudyStore();
  const [section, setSection] = useState<Section>('map');
  const [page, setPage] = useState<'welcome' | 'login' | 'app'>('welcome');
  const [viewFriendId, setViewFriendId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  // Auto-navigate based on auth state
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        setPage('app');
        loadStates(user.id);
      }
    }
  }, [user, authLoading, loadStates]);

  // Show loading
  if (authLoading) {
    return (
      <div style={{
        height: '100vh',
        background: 'rgb(8, 8, 12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{
          width: 32, height: 32,
          border: '2px solid rgba(59,130,246,0.15)',
          borderTopColor: 'rgba(59,130,246,0.7)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    if (page === 'login') {
      return <LoginPage onBack={() => setPage('welcome')} />;
    }
    return <WelcomePage onGetStarted={() => setPage('login')} />;
  }

  // Loading states
  if (statesLoading) {
    return (
      <div style={{
        height: '100vh',
        background: 'rgb(8, 8, 12)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', sans-serif", gap: '12px',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '2px solid rgba(59,130,246,0.15)',
          borderTopColor: 'rgba(59,130,246,0.7)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Cargando tus materias...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Friend profile / compare view
  if (viewFriendId) {
    return (
      <DashboardLayout section={section} onSectionChange={(s) => { setSection(s); setViewFriendId(null); setCompareMode(false); }}>
        <FriendProfile
          friendId={viewFriendId}
          compareMode={compareMode}
          onBack={() => { setViewFriendId(null); setCompareMode(false); }}
        />
      </DashboardLayout>
    );
  }

  const renderSection = () => {
    switch (section) {
      case 'map': return <CurriculumMap />;
      case 'stats': return <StatsPage />;
      case 'friends': return (
        <FriendsPage
          onViewFriend={(id) => { setViewFriendId(id); setCompareMode(false); }}
          onCompare={(id) => { setViewFriendId(id); setCompareMode(true); }}
        />
      );
      case 'settings': return <ProfileSettings onBack={() => setSection('map')} />;
      default: return <CurriculumMap />;
    }
  };

  return (
    <DashboardLayout section={section} onSectionChange={setSection}>
      {renderSection()}
    </DashboardLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
