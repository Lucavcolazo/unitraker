import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/DashboardLayout';
import { CurriculumMap } from './components/CurriculumMap';
import { StatsPage } from './components/StatsPage';
import { WelcomePage } from './components/WelcomePage';
import { LoginPage } from './components/LoginPage';
import { FriendsPage } from './components/FriendsPage';
import { FriendProfile } from './components/FriendProfile';
import { ProfileSettings } from './components/ProfileSettings';
import { ProximamenteView } from './components/ProximamenteView';
import { useStudyStore } from './store/useStudyStore';
import { usePlanStore } from './store/usePlanStore';

export type Section = 'map' | 'stats' | 'friends' | 'settings';

const SPINNER = (
  <div style={{
    height: '100vh', background: 'var(--bg-base)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Geist', sans-serif",
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

const SPINNER_WITH_TEXT = (
  <div style={{
    height: '100vh', background: 'var(--bg-base)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Geist', sans-serif", gap: '12px',
  }}>
    <div style={{
      width: 32, height: 32,
      border: '2px solid rgba(59,130,246,0.15)',
      borderTopColor: 'rgba(59,130,246,0.7)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Cargando...</span>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

/** Carga planes y estados al tener usuario. */
function AuthLoader() {
  const { user } = useAuth();
  const { loadUserPlans } = usePlanStore();
  const { loadStates } = useStudyStore();
  useEffect(() => {
    if (user) {
      loadUserPlans(user.id);
      loadStates(user.id);
    }
  }, [user, loadUserPlans, loadStates]);
  return null;
}

/** Ruta "/": bienvenida solo si no está logueado; si está logueado redirige a /app. */
function WelcomeRoute() {
  const { user, loading: authLoading } = useAuth();
  const { loading: plansLoading } = usePlanStore();
  const navigate = useNavigate();

  if (authLoading) return SPINNER;
  if (user && !plansLoading) return <Navigate to="/app" replace />;
  return <WelcomePage onGetStarted={() => navigate('/login')} />;
}

/** Ruta "/login": solo si no está logueado; si está logueado redirige a /app. */
function LoginRoute() {
  const { user, loading: authLoading } = useAuth();
  const { loading: plansLoading } = usePlanStore();
  const navigate = useNavigate();

  if (authLoading) return SPINNER;
  if (user && !plansLoading) return <Navigate to="/app" replace />;
  return <LoginPage onBack={() => navigate('/')} />;
}

const SPINNER_PREPARING = (
  <div style={{
    height: '100vh', background: 'var(--bg-base)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Geist', sans-serif", gap: '12px',
  }}>
    <div style={{
      width: 32, height: 32,
      border: '2px solid rgba(59,130,246,0.15)',
      borderTopColor: 'rgba(59,130,246,0.7)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Preparando tu plan...</span>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

/** Rutas "/app/*": requieren usuario; si no tiene plan se crea el plan por defecto (Ing. Sistemas 2024) y se entra. */
function AppRoute() {
  const { user, loading: authLoading } = useAuth();
  const { activePlanId, loading: plansLoading, createPlanFromDefault } = usePlanStore();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const creatingPlan = useRef(false);

  if (authLoading) return SPINNER;
  if (!user) return <Navigate to="/" replace />;

  // Usuario sin plan: crear plan por defecto automáticamente (sin onboarding)
  useEffect(() => {
    if (!user || plansLoading || activePlanId || creatingPlan.current) return;
    creatingPlan.current = true;
    createPlanFromDefault(user.id).finally(() => {
      creatingPlan.current = false;
    });
  }, [user?.id, plansLoading, activePlanId, createPlanFromDefault]);

  if (plansLoading && !activePlanId) return SPINNER_WITH_TEXT;
  if (!activePlanId) return SPINNER_PREPARING;

  // /app o /app/ algo no reconocido → redirigir a /app/map
  if (path === '/app' || path === '/app/') {
    return <Navigate to="/app/map" replace />;
  }

  // /app/crear-plan → vista Próximamente (desde configuración)
  if (path === '/app/crear-plan') {
    return <ProximamenteView onBack={() => navigate('/app/settings')} />;
  }

  // /app/amigo/:friendId → perfil de amigo
  const friendMatch = path.match(/^\/app\/amigo\/([^/]+)$/);
  if (friendMatch) {
    const friendId = friendMatch[1];
    const compare = new URLSearchParams(location.search).get('compare') === '1';
    return (
      <DashboardLayout section="map" onSectionChange={() => {}}>
        <FriendProfile
          friendId={friendId}
          compareMode={compare}
          onBack={() => navigate(-1)}
        />
      </DashboardLayout>
    );
  }

  return <AppContentWithSection />;
}

function AppContentWithSection() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const sectionFromPath = (path.replace(/^\/app\/?/, '') || 'map') as Section;
  const section: Section = ['map', 'stats', 'friends', 'settings'].includes(sectionFromPath)
    ? sectionFromPath
    : 'map';

  const setSection = (s: Section) => navigate(`/app/${s}`);

  const renderSection = () => {
    switch (section) {
      case 'map': return <CurriculumMap />;
      case 'stats': return <StatsPage />;
      case 'friends': return (
        <FriendsPage
          onViewFriend={(id) => navigate(`/app/amigo/${id}`)}
          onCompare={(id) => navigate(`/app/amigo/${id}?compare=1`)}
        />
      );
      case 'settings': return (
        <ProfileSettings
          onBack={() => setSection('map')}
          onOpenPlanEditor={() => navigate('/app/crear-plan')}
        />
      );
      default: return <CurriculumMap />;
    }
  };

  return (
    <DashboardLayout section={section} onSectionChange={setSection}>
      {renderSection()}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthLoader />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomeRoute />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/app/*" element={<AppRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
