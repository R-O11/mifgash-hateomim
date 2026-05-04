import React from 'react';
import { User, Settings, LogOut, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import s from './Profile.module.css';

const Profile = () => {
  const { lang, changeLang } = useLanguage();

  return (
    <div dir="rtl" className={s.page}>

      {/* ── User Info Section ── */}
      <div className={s.userSection}>
        <div className={s.avatarRing}>
          <div className={s.avatar}>
            <User size={32} strokeWidth={1.5} />
          </div>
        </div>
        <h1 className={s.userName}>{lang === 'he' ? 'שלום, אורח' : 'مرحباً، ضيف'}</h1>
        <p className={s.userSub}>{lang === 'he' ? 'ברוך הבא למפגש התאומים' : 'مرحباً بك في ملتقى التوأم'}</p>
      </div>



      {/* ── Settings Section ── */}
      <section className={s.section}>
        <div className={s.sectionHeader}>
          <div className={s.sectionTitleWrap}>
            <Settings size={16} className={s.sectionIcon} />
            <h2 className={s.sectionTitle}>{lang === 'he' ? 'הגדרות' : 'الإعدادات'}</h2>
          </div>
        </div>

        <div className={s.settingsCard}>
          <div className={s.settingRow}>
            <div className={s.settingLeft}>
              <Globe size={18} className={s.settingIcon} />
              <span className={s.settingLabel}>{lang === 'he' ? 'שפה' : 'اللغة'}</span>
            </div>
            <div className={s.langToggle}>
              <button
                className={`${s.langBtn} ${lang === 'he' ? s.langBtnActive : ''}`}
                onClick={() => changeLang('he')}
              >
                עברית
              </button>
              <button
                className={`${s.langBtn} ${lang === 'ar' ? s.langBtnActive : ''}`}
                onClick={() => changeLang('ar')}
              >
                عربي
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Logout ── */}
      <div className={s.logoutWrap}>
        <button className={s.logoutBtn}>
          <LogOut size={15} />
          <span>{lang === 'he' ? 'התנתק' : 'تسجيل خروج'}</span>
        </button>
      </div>


    </div>
  );
};

export default Profile;
