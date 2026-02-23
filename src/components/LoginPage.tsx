import React, { useState } from 'react';
import { GraduationCap, Mail, Github, ArrowLeft, Eye, EyeOff, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_NEEDS_UPPERCASE = /[A-Z]/;

/** La contraseña debe tener al menos 8 caracteres y una mayúscula. */
function meetsPasswordRequirements(p: string): boolean {
  return p.length >= PASSWORD_MIN_LENGTH && PASSWORD_NEEDS_UPPERCASE.test(p);
}

interface Props {
  onBack: () => void;
}

export const LoginPage: React.FC<Props> = ({ onBack }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGitHub } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordValid = meetsPasswordRequirements(password);
  const passwordTouched = password.length > 0;
  const passwordBorderColor = !passwordTouched
    ? 'rgba(255,255,255,0.08)'
    : passwordValid
      ? 'rgba(74, 222, 128, 0.5)'
      : 'rgba(239, 68, 68, 0.5)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: err } = await signInWithEmail(email, password);
        if (err) setError(err.message);
      } else {
        if (!name.trim()) {
          setError('Ingresá tu nombre');
          setLoading(false);
          return;
        }
        if (!meetsPasswordRequirements(password)) {
          setError('La contraseña debe tener al menos 8 caracteres y una mayúscula');
          setLoading(false);
          return;
        }
        const { error: err } = await signUpWithEmail(email, password, name);
        if (err) setError(err.message);
        else setSuccess('Cuenta creada. Ya podés iniciar sesión con tu email y contraseña.');
      }
    } catch {
      setError('Ocurrió un error inesperado');
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    paddingLeft: '36px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '13px',
    fontFamily: "'Geist', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Geist', sans-serif",
      padding: '24px',
      position: 'relative',
    }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.35)',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: "'Geist', sans-serif",
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
      >
        <ArrowLeft size={14} />
        Volver
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15))',
          border: '1px solid rgba(59,130,246,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <GraduationCap size={22} style={{ color: 'rgba(59,130,246,0.8)' }} />
        </div>

        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          margin: '0 0 6px',
        }}>
          ¿Cómo querés iniciar sesión?
        </h2>
        <p style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.3)',
          margin: '0 0 28px',
        }}>
          {mode === 'login' ? 'Accedé a tu mapa curricular' : 'Creá tu cuenta para empezar'}
        </p>

        {/* GitHub button */}
        <button
          onClick={signInWithGitHub}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: "'Geist', sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <Github size={16} />
          Continuar con GitHub
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          margin: '20px 0',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            o con email
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {mode === 'signup' && (
            <div style={{ position: 'relative' }}>
              <User
                size={14}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }}
              />
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail
              size={14}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }}
            />
            <input
              type="email"
              placeholder="tucorreo@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', display: 'flex' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={PASSWORD_MIN_LENGTH}
              style={{
                ...inputStyle,
                paddingRight: '36px',
                borderColor: passwordBorderColor,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.2)', display: 'flex', padding: '2px',
              }}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            {mode === 'signup' && (
              <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
                Mín. 8 caracteres y una mayúscula
              </p>
            )}
          </div>

          {error && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              fontSize: '11px',
              color: 'rgba(239,68,68,0.8)',
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              fontSize: '11px',
              color: 'rgba(34,197,94,0.8)',
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'signup' && !meetsPasswordRequirements(password))}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(99,102,241,0.9))',
              color: 'white',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: "'Geist', sans-serif",
              cursor: loading || (mode === 'signup' && !passwordValid) ? 'not-allowed' : 'pointer',
              opacity: loading || (mode === 'signup' && !passwordValid) ? 0.7 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        {/* Toggle mode */}
        <p style={{
          marginTop: '20px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.3)',
        }}>
          {mode === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(59,130,246,0.8)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Geist', sans-serif",
            }}
          >
            {mode === 'login' ? 'Creá una' : 'Iniciá sesión'}
          </button>
        </p>
      </motion.div>

      {/* Spinner animation */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
