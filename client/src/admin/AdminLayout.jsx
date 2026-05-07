import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Utensils, ShoppingBag, Tags, Crown } from 'lucide-react';
import GlobalFooter from '../components/GlobalFooter';
import s from './AdminLayout.module.css';

const AdminLayout = () => {
  const { isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />;

  const navLinks = [
    { to: '/admin', label: 'הגדרות', icon: <LayoutDashboard size={16} />, exact: true },
    { to: '/admin/orders', label: 'הזמנות', icon: <ShoppingBag size={16} /> },
    { to: '/admin/products', label: 'מוצרים', icon: <Utensils size={16} /> },
    { to: '/admin/categories', label: 'קטגוריות', icon: <Tags size={16} /> },
  ];

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className={s.layout}>
      
      {/* ── ADMIN NAVBAR ── */}
      <nav className={s.navbar}>
        <div className={s.navContainer}>
          {/* Logo + Title */}
          <div className={s.logoWrap}>
            <div className={s.logoIconWrap}>
              <Crown size={18} color="#c9a84c" />
            </div>
            <span className={s.logoTitle}>לוח ניהול</span>
          </div>

          {/* Nav Links — Desktop */}
          <div className={s.navLinksDesktop}>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`${s.navLink} ${isActive(link.to, link.exact) ? s.navLinkActive : ''}`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <button onClick={logout} className={s.logoutBtn}>
            התנתק <LogOut size={14} />
          </button>
        </div>

        {/* ── MOBILE NAV TABS ── */}
        <div className={s.navLinksMobile}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`${s.navLinkMobile} ${isActive(link.to, link.exact) ? s.navLinkMobileActive : ''}`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className={s.mainContent}>
        <Outlet />
        <GlobalFooter />
      </main>
    </div>
  );
};

export default AdminLayout;
