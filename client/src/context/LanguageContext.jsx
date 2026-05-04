import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('he');

  // Change lang and update document direction
  const changeLang = (newLang) => {
    setLang(newLang);
    document.documentElement.lang = newLang;
    // Both Arabic and Hebrew are RTL. If we add English, set dir='ltr'.
    document.documentElement.dir = 'rtl';
  };

  // Helper function to extract correct property
  // usage: t(product, 'name') -> returns product.name_he or product.name_ar
  const t = (obj, fieldBase) => {
    if (!obj) return '';
    return obj[`${fieldBase}_${lang}`] || '';
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
