import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff } from 'lucide-react';
import s from './AdminLogin.module.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const success = await login(username, password);
      if (success) navigate('/admin');
      else setError('שם משתמש או סיסמה שגויים');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאת התחברות');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={s.wrapper}>
      {/* Decorative blur orbs */}
      <div className={s.orbTop} />
      <div className={s.orbBottom} />

      <div className={s.loginCard}>
        {/* Lock icon */}
        <div className={s.iconWrap}>
          <Lock color="#c9a84c" size={28} />
        </div>

        <h1 className={s.title}>כניסת מנהלים</h1>
        <p className={s.subtitle}>
          מפגש התאומים · לוח ניהול
        </p>

        <form onSubmit={handleSubmit} className={s.form}>
          <div>
            <label className={s.inputLabel}>
              שם משתמש
            </label>
            <input
              dir="ltr"
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={s.inputField}
            />
          </div>

          <div>
            <label className={s.inputLabel}>
              סיסמה
            </label>
            <div className={s.passInputWrap}>
              <input
                dir="ltr"
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={s.inputFieldPass}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className={s.eyeBtn}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className={s.errorBox}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={s.submitBtn}
          >
            {isSubmitting ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
