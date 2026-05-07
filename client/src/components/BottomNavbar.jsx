import React from 'react';
import { Home, Search, ShoppingCart, ClipboardList, Settings, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useMenuMode } from '../context/MenuModeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import s from './BottomNavbar.module.css';

const BottomNavbar = () => {
  const { lang } = useLanguage();
  const { cartItems, toggleCart } = useCart();
  const { menuMode } = useMenuMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [statusData, setStatusData] = React.useState({});

  React.useEffect(() => {
    api.get('/api/business-status').then(res => {
      setStatusData(res.data?.data || res.data || {});
    }).catch(console.error);
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isActive = (path) => location.pathname === path;

  const NavItem = ({ icon: Icon, label, active, onClick, fillOnActive = false }) => (
    <button onClick={onClick} className={`${s.navItem} ${active ? s.navItemActive : ''}`}>
      {active && <div className={s.indicator} />}
      <div className={s.iconWrap}>
        <Icon
          size={21}
          className={active ? s.iconActive : s.iconInactive}
          strokeWidth={active ? 2.4 : 1.7}
          fill={active && fillOnActive ? 'currentColor' : 'none'}
        />
      </div>
      <span className={active ? s.labelActive : s.labelInactive}>{label}</span>
    </button>
  );

  /* ── MENU MODE: 3-tab layout (Home, Call, Menu) ── */
  if (menuMode) {
    return (
      <div className={s.wrapper}>
        <div className={s.fade} />
        <nav className={s.bar}>
          <div className={s.inner}>
            {/* 1. Home */}
            <NavItem
              icon={Home}
              label={lang === 'he' ? 'בית' : 'الرئيسية'}
              active={isActive('/')}
              fillOnActive={true}
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 2. Phone Call — elevated center */}
            <div className={s.cartWrapper}>
              <a
                href={`tel:${statusData.phone_number || '0501234567'}`}
                className={`${s.cartButton} ${s.phoneCenter}`}
              >
                <Phone size={22} strokeWidth={2.2} />
              </a>
              <span className={s.cartLabel}>{lang === 'he' ? 'התקשר' : 'اتصل'}</span>
            </div>

            {/* 3. Navigation */}
            <NavItem
              icon={MapPin}
              label={lang === 'he' ? 'ניווט' : 'تنقل'}
              active={false}
              onClick={() => {
                const lat = statusData.lat || 32.0853;
                const lng = statusData.lng || 34.7818;
                window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank', 'noopener,noreferrer');
              }}
            />
          </div>
        </nav>
      </div>
    );
  }

  /* ── ORDERING MODE: Original 5-tab layout ── */
  return (
    <div className={s.wrapper}>
      <div className={s.fade} />
      <nav className={s.bar}>
        <div className={s.inner}>
          {/* 1. Home */}
          <NavItem
            icon={Home}
            label={lang === 'he' ? 'בית' : 'الرئيسية'}
            active={isActive('/')}
            fillOnActive={true}
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* 2. Search */}
          <NavItem
            icon={Search}
            label={lang === 'he' ? 'חיפוש' : 'بحث'}
            active={false}
            onClick={() => {
              if (location.pathname !== '/') navigate('/');
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('toggle-search'));
              }, 100);
            }}
          />

          {/* 3. Cart — elevated center */}
          <div className={s.cartWrapper}>
            <button
              onClick={() => {
                if (location.pathname !== '/') navigate('/');
                setTimeout(() => toggleCart(), 50);
              }}
              className={`${s.cartButton} ${totalItems > 0 ? s.cartButtonHasItems : ''}`}
            >
              <ShoppingCart size={22} strokeWidth={2.2} />
              {totalItems > 0 && (
                <span className={s.cartBadge}>{totalItems}</span>
              )}
            </button>
            <span className={s.cartLabel}>{lang === 'he' ? 'עגלה' : 'السلة'}</span>
          </div>

          {/* 4. Orders */}
          <NavItem
            icon={ClipboardList}
            label={lang === 'he' ? 'הזמנות' : 'الطلبات'}
            active={isActive('/orders')}
            onClick={() => navigate('/orders')}
          />

          {/* 5. Settings */}
          <NavItem
            icon={Settings}
            label={lang === 'he' ? 'הגדרות' : 'الإعدادات'}
            active={isActive('/profile')}
            onClick={() => navigate('/profile')}
          />
        </div>
      </nav>
    </div>
  );
};

export default BottomNavbar;
