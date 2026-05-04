import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Search } from 'lucide-react';
import heroImg from '../assets/hero.png';
import s from './HeroBanner.module.css';

const HeroBanner = ({ searchQuery, onSearchChange }) => {
  const { lang } = useLanguage();

  return (
    <div className={s.wrapper}>
      {/* Featured Banner - Now On Top */}
      <div className={s.hero}>
        <img 
          src={heroImg} 
          alt="Hero Background" 
          className={s.heroImgBg} 
        />
        <div className={s.heroOverlay} />
        <div className={s.heroContent}>
          <div className={s.heroBadge}>
            {lang === 'he' ? 'המלצת היום' : 'توصية اليوم'}
          </div>
          <h2 className={s.heroTitle}>
            {lang === 'he' ? 'פיצה פפרוני לוהטת' : 'بيتزا بيبروني ساخنة'}
          </h2>
          <p className={s.heroSub}>
            {lang === 'he' ? 'עם תוספת גבינה חינם' : 'مع جبنة إضافية مجاناً'}
          </p>
          <button className={s.ctaButton}>
            {lang === 'he' ? 'הזמן עכשיו' : 'اطلب الان'}
          </button>
        </div>
      </div>

      {/* Search Bar - Moved Below Hero */}
      <div className={s.searchWrap}>
        <Search size={16} className={s.searchIcon} strokeWidth={1.5} />
        <input
          type="text"
          value={searchQuery || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={lang === 'he' ? 'מה תרצו לאכול היום?' : 'ماذا تود أن تأكل اليوم؟'}
          className={s.searchInput}
        />
      </div>
    </div>
  );
};

export default HeroBanner;
