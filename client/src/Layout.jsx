import React from 'react';
import { Outlet } from 'react-router-dom';
import CartDrawer from './components/CartDrawer';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { MenuModeProvider, useMenuMode } from './context/MenuModeContext';
import BottomNavbar from './components/BottomNavbar';
import GlobalFooter from './components/GlobalFooter';
import s from './Layout.module.css';

const LayoutContent = () => {
  const { lang } = useLanguage();
  const { menuMode } = useMenuMode();
  return (
    <div className={`${s.root} ${lang === 'he' ? 'dir-rtl' : 'dir-rtl'}`}>
      {/* Only render CartDrawer when NOT in menu mode */}
      {!menuMode && <CartDrawer />}
      <main className={s.main}>
        <Outlet />
        <GlobalFooter />
      </main>
      <BottomNavbar />
    </div>
  );
};

const Layout = () => {
  return (
    <LanguageProvider>
      <CartProvider>
        <FavoritesProvider>
          <MenuModeProvider>
            <LayoutContent />
          </MenuModeProvider>
        </FavoritesProvider>
      </CartProvider>
    </LanguageProvider>
  );
};

export default Layout;
