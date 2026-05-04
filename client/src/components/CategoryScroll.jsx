import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Beef, Sandwich, Package, Pizza, Box } from 'lucide-react';
import s from './CategoryScroll.module.css';

const getLucideIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name.includes('המבורגר') || name.includes('burger')) return <Beef size={28} strokeWidth={1.5} />;
  if (name.includes('עראייס')) return <Sandwich size={28} strokeWidth={1.5} />;
  if (name.includes('בגט') || name.includes('baguette') || name.includes('טורטיה')) return <Package size={28} strokeWidth={1.5} />;
  if (name.includes('פיצה') || name.includes('pizza')) return <Pizza size={28} strokeWidth={1.5} />;
  return <Box size={28} strokeWidth={1.5} />;
};

const CategoryScroll = ({ categories, activeId, onSelect }) => {
  const { t } = useLanguage();

  const handleSelect = (idStr) => {
    const el = document.getElementById(`category-${idStr}`);
    if (el) {
      const topOff = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOff, behavior: 'smooth' });
    }
  };

  return (
    <div className={s.catScrollWrapper}>
      {categories.map((cat) => {
        const isActive = activeId === cat.id;
        return (
          <div 
            key={cat.id} 
            className={`${s.catItem} ${isActive ? s.active : s.inactive}`}
            onClick={() => handleSelect(cat.id)}
          >
            <div className={s.iconWrapper}>
              {getLucideIcon(t(cat, 'name'))}
            </div>
            <span className={s.catLabel}>{t(cat, 'name')}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryScroll;
