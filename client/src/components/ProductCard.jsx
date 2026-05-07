import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Plus } from 'lucide-react';
import s from './ProductCard.module.css';

const FALLBACK = 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=600';

const getImgSrc = (product) =>
  product.image_url
    ? `${import.meta.env.VITE_API_URL}${product.image_url}?v=${product.updated_at || Date.now()}`
    : FALLBACK;

const ProductCard = ({ product, onOpenModal, isCompact = false, isFeatured = false }) => {
  const { lang, t } = useLanguage();
  const imgSrc = getImgSrc(product);
  const price = `₪${Number(product.base_price).toFixed(0)}`;

  // ── FEATURED ──
  if (isFeatured) {
    return (
      <div onClick={() => onOpenModal(product)} className={s.featured}>
        <div className={s.featuredImgWrap}>
          <img src={imgSrc} alt={t(product, 'name')} className={s.featuredImg} loading="lazy" />
          <div className={s.badgePopular}>{lang === 'he' ? 'פופולרי' : 'شائع'}</div>
        </div>
        <div className={s.featuredContent}>
          <h3 className={s.featuredTitle}>{t(product, 'name')}</h3>
          <p className={s.featuredDesc}>{t(product, 'description')}</p>
          <div className={s.featuredFooter}>
            <span className={s.featuredPrice}>{price}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onOpenModal(product); }} className={s.featuredPlusBtn}>
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  // ── COMPACT (We unify this into Standard per instruction, but keep if used elsewhere) ──
  // User: "Both cards in grid: identical structure, no variation" - Standard handles it.

  // ── STANDARD ──
  return (
    <div onClick={() => onOpenModal(product)} className={s.standard}>
      <div className={s.standardImgWrap}>
        <img src={imgSrc} alt={t(product, 'name')} className={s.standardImg} loading="lazy" />
      </div>
      <div className={s.standardBody}>
        <h3 className={s.standardTitle}>{t(product, 'name')}</h3>
        <p className={s.standardDesc}>{t(product, 'description')}</p>
        <div className={s.standardFooter}>
          <div className={s.standardMeta}>
            ⏱ {product.prep_time_minutes || 15} {lang === 'he' ? 'דק׳' : 'د'}
          </div>
          <span className={s.standardPrice}>{price}</span>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onOpenModal(product); }} className={s.standardPlusBtn}>
        <Plus size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default ProductCard;
