import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Clock, Heart, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useMenuMode } from '../context/MenuModeContext';
import api from '../api/axios';
import s from './ProductModal.module.css';

const PHONE_NUMBER = '0501234567';

const ProductModal = ({ productId, onClose }) => {
  const { lang, t } = useLanguage();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { menuMode } = useMenuMode();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState({});
  const [notes, setNotes] = useState('');
  const [errorLine, setErrorLine] = useState('');
  
  const [isPriceUpdating, setIsPriceUpdating] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    api.get('/api/products/' + productId)
      .then(res => {
        const resData = res.data;
        setProduct(resData.data);
        const initSel = {};
        (resData.data.option_groups || []).forEach(g => { initSel[g.id] = []; });
        setSelections(initSel);
      })
      .catch(err => {
        console.error(err);
        setErrorLine(lang === 'he' ? 'שגיאה בטעינת המוצר' : 'خطأ في تحميل المنتج');
      })
      .finally(() => setLoading(false));

    return () => { document.body.style.overflow = 'auto'; };
  }, [productId, lang]);

  const toggleOption = (groupId, item, groupMax) => {
    setSelections(prev => {
      const curr = prev[groupId] || [];
      const isSelected = curr.some(o => o.itemId === item.id);
      let next;
      if (isSelected) {
        next = curr.filter(o => o.itemId !== item.id);
      } else if (groupMax === 1) {
        next = [{ itemId: item.id, price_change: item.price_change, group_name_he: '', group_name_ar: '', option_name_he: item.name_he, option_name_ar: item.name_ar }];
      } else {
        if (curr.length >= groupMax) return prev;
        next = [...curr, { itemId: item.id, price_change: item.price_change, group_name_he: '', group_name_ar: '', option_name_he: item.name_he, option_name_ar: item.name_ar }];
      }
      return { ...prev, [groupId]: next };
    });
  };

  const calculateTotal = () => {
    if (!product) return 0;
    const totalExtras = Object.values(selections).flat().reduce((sum, item) => sum + Number(item.price_change || 0), 0);
    return (Number(product.base_price) + totalExtras) * quantity;
  };

  // Animate price when it changes
  const currentTotal = calculateTotal();
  useEffect(() => {
    setIsPriceUpdating(true);
    const t = setTimeout(() => setIsPriceUpdating(false), 250);
    return () => clearTimeout(t);
  }, [currentTotal]);

  const isSelectionValid = () => {
    if (!product) return false;
    for (const group of (product.option_groups || [])) {
      const count = (selections[group.id] || []).length;
      if (group.is_required && count < group.min_select) return false;
    }
    return true;
  };

  const handleAdd = () => {
    setErrorLine('');
    if (!isSelectionValid()) {
      setErrorLine(lang === 'he' ? 'יש לבחור את כל התוספות חובה' : 'يجب اختيار جميع الإضافات الإلزامية');
      return;
    }
    const flatOptions = Object.values(selections).flat();
    addToCart(product, flatOptions, quantity, notes);
    onClose();
  };

  const handleFavoriteToggle = () => {
    setHeartAnimating(true);
    toggleFavorite(productId);
    setTimeout(() => setHeartAnimating(false), 400);
  };

  const handlePhoneOrder = () => {
    window.location.href = `tel:${PHONE_NUMBER}`;
  };

  if (loading) return (
    <div className={s.loadingBackdrop}>
      <div className={s.spinner} />
    </div>
  );

  if (!product) return null;

  const imgSrc = product.image_url
    ? `${import.meta.env.VITE_API_URL}${product.image_url}?v=${product.updated_at || Date.now()}`
    : 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800';

  const favorited = isFavorite(productId);

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />

      <div className={s.sheet}>
        <div className={s.dragHandle} />
        {/* Hero Image */}
        <div className={s.heroWrap}>
          <img src={imgSrc} className={s.heroImg} alt={t(product, 'name')} />
          <div className={s.heroControls}>
            <button onClick={onClose} className={s.controlBtn}>
              <X size={20} strokeWidth={2.5} />
            </button>
            {/* Hide heart in menu mode */}
            {!menuMode && (
              <button
                className={`${s.controlBtn} ${favorited ? s.heartActive : ''} ${heartAnimating ? s.heartAnimating : ''}`}
                onClick={handleFavoriteToggle}
              >
                <Heart size={20} strokeWidth={2} fill={favorited ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
          <div className={s.priceTag}>₪{Number(product.base_price).toFixed(0)}</div>
        </div>

        {/* Content */}
        <div className={s.body}>
          <div className={s.titleSection}>
            <h2 className={s.title}>{t(product, 'name')}</h2>
            <div className={s.meta}>
              {product.prep_time_minutes && (
                <div className={s.metaTime}>
                  <Clock size={14} />
                  <span>{product.prep_time_minutes} {lang === 'he' ? 'דק׳' : 'دق'}</span>
                </div>
              )}
            </div>
            {t(product, 'description') && (
              <p className={s.description}>{t(product, 'description')}</p>
            )}
          </div>

          <div className={s.divider} />

          {/* Options — show in both modes (read-only view in menu mode) */}
          <div className={s.optionsWrap}>
            {(product.option_groups || []).map(group => (
              <div key={group.id}>
                <div className={s.groupHeader}>
                  <h3 className={s.groupTitle}>{t(group, 'name')}</h3>
                  <div className={s.groupMeta}>
                    {group.is_required && (
                      <span className={s.requiredBadge}>{lang === 'he' ? 'חובה' : 'إلزامي'}</span>
                    )}
                    <span className={s.maxText}>{lang === 'he' ? `עד ${group.max_select}` : `حتى ${group.max_select}`}</span>
                  </div>
                </div>

                <div className={s.optionsList}>
                  {(group.items || []).map(item => {
                    const isSelected = (selections[group.id] || []).some(o => o.itemId === item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => !menuMode && toggleOption(group.id, item, group.max_select)}
                        className={`${s.optionBtn} ${isSelected ? s.optionBtnActive : ''}`}
                        style={menuMode ? { cursor: 'default' } : {}}
                      >
                        <div className={s.optionLeft}>
                          {!menuMode && (
                            <div className={`${s.checkbox} ${isSelected ? s.checkboxActive : ''}`}>
                              {isSelected && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          )}

                          <span className={isSelected ? s.optionNameActive : s.optionName}>{t(item, 'name')}</span>
                        </div>
                        {Number(item.price_change) > 0 && (
                          <span className={isSelected ? s.optionPriceActive : s.optionPrice}>+₪{Number(item.price_change).toFixed(0)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Notes — only in ordering mode */}
            {!menuMode && (
              <div>
                <h3 className={s.notesTitle}>{lang === 'he' ? 'בקשות מיוחדות' : 'طلبات خاصة'}</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={s.notesInput}
                  rows="2"
                  placeholder={lang === 'he' ? 'ללא בצל, רטבים בצד...' : 'بدون بصل، صلصات على الجانب...'}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={s.footer}>
          {errorLine && <p className={s.error}>{errorLine}</p>}

          {menuMode ? (
            /* Menu mode: Phone order button */
            <div className={s.addBtnWrap}>
              <a href={`tel:${PHONE_NUMBER}`} className={s.addBtn} style={{ textDecoration: 'none' }}>
                <Phone size={18} />
                <span>{lang === 'he' ? 'התקשר להזמנה' : 'اتصل للطلب'}</span>
                <span className={s.addBtnPrice}>₪{Number(product.base_price).toFixed(0)}</span>
              </a>
            </div>
          ) : (
            /* Ordering mode: quantity + add to cart */
            <>
              <div className={s.qtyControlWrapper}>
                <div className={s.qtyControl}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={s.qtyBtn}>
                    <Minus size={18} strokeWidth={2.5} />
                  </button>
                  <span className={s.qtyValue}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className={s.qtyBtn}>
                    <Plus size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <div className={s.addBtnWrap}>
                <button onClick={handleAdd} disabled={!isSelectionValid()} className={s.addBtn}>
                  <span>{lang === 'he' ? 'הוסף לסל' : 'أضف للسلة'}</span>
                  <span className={`${s.addBtnPrice} ${isPriceUpdating ? s.priceUpdated : ''}`}>
                    ₪{calculateTotal().toFixed(0)}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductModal;
