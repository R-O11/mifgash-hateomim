import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, Loader2, Mail } from 'lucide-react';
import logo from '../assets/logo-tawam-transparent.png';
import GlobalFooter from '../components/GlobalFooter';
import s from './AdminLogin.module.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      // Mapping email UI field to username backend field
      const success = await login(email, password);
      if (success) navigate('/admin');
      else setError('אימייל או סיסמה שגויים');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאת התחברות');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${s.wrapper} ${isMounted ? s.mounted : ''}`}>
      {/* Decorative premium elements */}
      <div className={s.bgGlow} />
      <div className={s.orbLarge} />
      <div className={s.orbSmall} />

      <div className={s.loginCard}>
        {/* Branding Section */}
        <div className={s.branding}>
          <div className={s.logoContainer}>
            <img src={logo} alt="Mifgash HaTeomim" className={s.logo} />
          </div>
          <h1 className={s.title}>כניסת מנהלים</h1>
          <p className={s.subtitle}>מערכת ניהול מסעדה · פרימיום</p>
        </div>

        <form onSubmit={handleSubmit} className={s.form}>
          {/* Username Input */}
          <div className={s.inputGroup}>
            <label className={s.label}>שם משתמש</label>
            <div className={s.inputWrapper}>
              <Mail className={s.inputIcon} size={18} />
              <input
                dir="ltr"
                type="text"
                required
                placeholder="admin"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={s.inputField}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className={s.inputGroup}>
            <label className={s.label}>סיסמה</label>
            <div className={s.inputWrapper}>
              <Lock className={s.inputIcon} size={18} />
              <input
                dir="ltr"
                type={showPass ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={s.inputField}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className={s.togglePass}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className={s.errorMsg}>
              <div className={s.errorDot} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={s.submitBtn}
          >
            {isSubmitting ? (
              <div className={s.loaderWrap}>
                <Loader2 className={s.spinner} size={20} />
                <span>מתחבר...</span>
              </div>
            ) : (
              'התחבר למערכת'
            )}
          </button>
        </form>
        
        <GlobalFooter />
      </div>
    </div>
  );
};

export default AdminLogin;
