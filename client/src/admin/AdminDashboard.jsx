import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Power, Clock, Loader2, TrendingUp, ShoppingBag, Utensils, Zap, Monitor, BookOpen } from 'lucide-react';
import AdminHeroConfig from './AdminHeroConfig';
import s from './AdminDashboard.module.css';

const StatCard = ({ icon, label, value, change, color }) => {
  const trendColor = change >= 0 ? '#10b981' : '#ef4444'; // emerald-500 for positive, red-500 for negative
  const borderAcc = change !== undefined ? `4px solid ${trendColor}` : '1px solid #e2e8f0';
  
  return (
    <div className={s.statCard} style={{ borderLeft: borderAcc }}>
      <div className={s.statHeader}>
        <div className={s.statIconWrap} style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          {React.cloneElement(icon, { color, size: 20 })}
        </div>
      </div>
      <div>
        <div className={s.statValue}>{value}</div>
        <div className={s.statLabel}>{label}</div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [mode, setMode] = useState('auto');
  const [menuMode, setMenuMode] = useState(true);
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    activeProducts: 0,
    avgOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [changingMenuMode, setChangingMenuMode] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const [settingsRes, statsRes] = await Promise.all([
        api.get('/api/admin/settings'),
        api.get('/api/admin/stats')
      ]);
      const settingsData = settingsRes.data?.data || settingsRes.data;
      setMode(settingsData.manual_override_mode);
      setMenuMode(!!settingsData.menu_mode);
      setStats(statsRes.data?.data || statsRes.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleModeChange = async (newMode) => {
    setChanging(true);
    try {
      await api.patch('/api/admin/settings/manual-override', { mode: newMode });
      setMode(newMode);
    } catch (error) {
      console.error('Failed to update mode', error);
      alert('שגיאה בעדכון ההגדרות');
    } finally { setChanging(false); }
  };

  const handleMenuModeChange = async (newMenuMode) => {
    setChangingMenuMode(true);
    try {
      await api.patch('/api/admin/settings/menu-mode', { menu_mode: newMenuMode });
      setMenuMode(newMenuMode);
    } catch (error) {
      console.error('Failed to update menu mode', error);
      alert('שגיאה בעדכון מצב האתר');
    } finally { setChangingMenuMode(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <Loader2 style={{ color: '#c9a84c', animation: 'spin 1s linear infinite' }} size={32} />
    </div>
  );

  return (
    <div className={s.wrapper}>
      
      {/* ── PAGE HEADER ── */}
      <div className={s.pageHeader}>
        <h2 className={s.pageTitle}>לוח בקרה</h2>
        <p className={s.pageSubtitle}>ניהול סטטוס ומידע כללי</p>
      </div>

      {/* ── STATS GRID ── */}
      <div className={s.statsGrid}>
        <StatCard icon={<ShoppingBag />} label="הזמנות היום" value={stats.ordersToday} color="#c9a84c" />
        <StatCard icon={<TrendingUp />} label="הכנסה יומית" value={`₪${Number(stats.revenueToday).toLocaleString()}`} color="#10b981" />
        <StatCard icon={<Utensils />} label="מוצרים פעילים" value={stats.activeProducts} color="#f59e0b" />
        <StatCard icon={<Zap />} label="ממוצע להזמנה" value={`₪${stats.avgOrderValue}`} color="#3b82f6" />
      </div>

      {/* ── SITE MODE (Menu Only / Ordering) ── */}
      <div className={s.modeCard}>
        <div className={s.modeHeader}>
          <h3 className={s.modeTitle}>מצב אתר</h3>
          <p className={s.modeSubtitle}>בחר בין תפריט דיגיטלי בלבד (ללא עגלה) לבין מצב הזמנות מלא</p>
        </div>

        <div className={s.segmentedControl}>
          {[
            { id: true, label: 'תפריט בלבד', icon: <BookOpen size={16} />, color: '#c9a84c' },
            { id: false, label: 'מצב הזמנות', icon: <Monitor size={16} />, color: '#10b981' }
          ].map(m => {
            const isSelected = menuMode === m.id;
            return (
              <button
                key={String(m.id)}
                disabled={changingMenuMode}
                onClick={() => handleMenuModeChange(m.id)}
                className={`${s.segmentBtn} ${isSelected ? s.segmentBtnActive : ''}`}
                style={isSelected ? { color: m.color } : {}}
              >
                {React.cloneElement(m.icon, { color: isSelected ? m.color : '#64748b' })}
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── RESTAURANT MODE ── */}
      <div className={s.modeCard}>
        <div className={s.modeHeader}>
          <h3 className={s.modeTitle}>מצב פעילות המסעדה</h3>
          <p className={s.modeSubtitle}>שלוט בסטטוס קבלת ההזמנות בזמן אמת</p>
        </div>

        <div className={s.segmentedControl}>
          {[
            { id: 'auto', label: 'אוטומטי', icon: <Clock size={16} />, color: '#c9a84c' },
            { id: 'force_open', label: 'פתוח תמיד', icon: <Power size={16} />, color: '#10b981' },
            { id: 'force_closed', label: 'סגור תמיד', icon: <Power size={16} />, color: '#ef4444' }
          ].map(m => {
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                disabled={changing}
                onClick={() => handleModeChange(m.id)}
                className={`${s.segmentBtn} ${isSelected ? s.segmentBtnActive : ''}`}
                style={isSelected ? { color: m.color } : {}}
              >
                {React.cloneElement(m.icon, { color: isSelected ? m.color : '#64748b' })}
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── HERO CONFIG ── */}
      <AdminHeroConfig />
    </div>
  );
};

export default AdminDashboard;
