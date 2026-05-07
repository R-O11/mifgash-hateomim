import React from 'react';
import s from './GlobalFooter.module.css';

const GlobalFooter = ({ className = '' }) => {
  return (
    <footer className={`${s.footer} ${className}`}>
      <div className={s.divider} />
      <div className={s.content}>
        <span className={s.copyright}>© {new Date().getFullYear()} Mifgash HaTeomim</span>
        <span className={s.separator}>|</span>
        <span className={s.poweredBy}>
          Powered by <a href="#" className={s.rkLink}>RK Digital</a>
        </span>
      </div>
    </footer>
  );
};

export default GlobalFooter;
