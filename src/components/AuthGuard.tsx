import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

/**
 * Middleware en el cliente: si el usuario no está logueado y entra a una ruta
 * protegida (/app/*), redirige a la bienvenida (/) sin renderizar el contenido.
 * Así se evita que ningún componente que espere usuario se monte y dispare errores
 * (en local y en producción).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isProtectedPath = location.pathname.startsWith('/app');

  if (loading && isProtectedPath) {
    return SPINNER;
  }

  if (!loading && !user && isProtectedPath) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
