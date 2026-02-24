import React, { useState } from 'react';
import { GraduationCap, Mail, Github, ArrowLeft, Eye, EyeOff, Loader2, User, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const fontTitle = "'Syne', sans-serif";
const fontMono = "'DM Mono', monospace";

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
  const passwordBorderColor =
    mode === 'login'
      ? 'rgba(255,255,255,0.08)'
      : !passwordTouched
        ? 'rgba(255,255,255,0.08)'
        : passwordValid
          ? 'rgba(34,197,94,0.5)'
          : 'rgba(239,68,68,0.5)';

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
    padding: '11px 12px',
    paddingLeft: '38px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#111113',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '13px',
    fontFamily: fontMono,
    fontWeight: 400,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: fontTitle,
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(34,197,94,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

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
          color: '#52525b',
          fontSize: '11px',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: fontMono,
          letterSpacing: '0.02em',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        onMouseLeave={e => e.currentTarget.style.color = '#52525b'}
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
          width: 52,
          height: 52,
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(99,102,241,0.12))',
          border: '1px solid rgba(34,197,94,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 0 40px rgba(34,197,94,0.06)',
        }}>
          <GraduationCap size={24} style={{ color: 'rgba(34,197,94,0.8)' }} />
        </div>

        {/* Label */}
        <div style={{
          fontFamily: fontMono,
          fontSize: '10px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#22c55e',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ width: 14, height: 1, background: '#22c55e', display: 'inline-block' }} />
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          <span style={{ width: 14, height: 1, background: '#22c55e', display: 'inline-block' }} />
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: 'rgba(255,255,255,0.95)',
          margin: '0 0 6px',
          letterSpacing: '-0.02em',
        }}>
          {mode === 'login' ? 'Bienvenido de vuelta' : 'Unite a UniTraker'}
        </h2>
        <p style={{
          fontSize: '12px',
          color: '#52525b',
          margin: '0 0 28px',
          fontFamily: fontMono,
          fontWeight: 400,
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
            padding: '11px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: '#111113',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: fontTitle,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#18181b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#111113'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
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
          <span style={{ fontSize: '10px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 500, fontFamily: fontMono }}>
            o con email
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {mode === 'signup' && (
            <div style={{ position: 'relative' }}>
              <User
                size={14}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }}
              />
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail
              size={14}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }}
            />
            <input
              type="email"
              placeholder="tucorreo@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock
              size={14}
              style={{ position: 'absolute', left: '12px', top: mode === 'signup' ? '25%' : '50%', transform: 'translateY(-50%)', color: '#52525b' }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={PASSWORD_MIN_LENGTH}
              style={{
                ...inputStyle,
                paddingRight: '38px',
                borderColor: passwordBorderColor,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '10px', top: mode === 'signup' ? '25%' : '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#52525b', display: 'flex', padding: '2px',
              }}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            {mode === 'signup' && (
              <p style={{ margin: '5px 0 0', fontSize: '10px', color: '#52525b', fontFamily: fontMono }}>
                Mín. 8 caracteres y una mayúscula
              </p>
            )}
          </div>

          {error && (
            <div style={{
              padding: '9px 14px',
              borderRadius: '8px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)',
              fontSize: '11px',
              fontFamily: fontMono,
              color: 'rgba(239,68,68,0.8)',
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '9px 14px',
              borderRadius: '8px',
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.15)',
              fontSize: '11px',
              fontFamily: fontMono,
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
              padding: '11px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e, #4ade80)',
              color: '#0a0a0b',
              fontSize: '13px',
              fontWeight: 800,
              fontFamily: fontTitle,
              cursor: loading || (mode === 'signup' && !passwordValid) ? 'not-allowed' : 'pointer',
              opacity: loading || (mode === 'signup' && !passwordValid) ? 0.6 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px',
              boxShadow: '0 0 20px rgba(34,197,94,0.1)',
              letterSpacing: '-0.01em',
            }}
          >
            {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        {/* Toggle mode */}
        <p style={{
          marginTop: '22px',
          fontSize: '12px',
          color: '#52525b',
          fontFamily: fontMono,
        }}>
          {mode === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#22c55e',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: fontTitle,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
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
