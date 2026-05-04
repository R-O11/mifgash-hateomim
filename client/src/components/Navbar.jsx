import React, { useState, useEffect } from 'react';
import { ShoppingBag, Globe, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo-tawam-transparent.png';
import s from './Navbar.module.css';

const Navbar = () => {
  const { lang, changeLang } = useLanguage();
  const { cartItems, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${s.header} ${scrolled ? s.scrolled : s.transparent}`}>
      <div className={s.container}>
        <div className={s.spacer} />
        
        <div className={s.spacer} />
        {/* Logo removed as requested */}
        <div className={s.spacer} />

        <div className={s.actions}>
          <button onClick={() => changeLang(lang === 'he' ? 'ar' : 'he')} className={s.langBtn}>
            <Globe size={15} strokeWidth={2} />
            <span>{lang === 'he' ? 'عربي' : 'עבר'}</span>
          </button>

          <button onClick={toggleCart} className={s.cartBtn}>
            <ShoppingBag size={19} className={s.cartIcon} strokeWidth={2} />
            {totalItems > 0 && (
              <span className={s.cartBadge}>{totalItems}</span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
