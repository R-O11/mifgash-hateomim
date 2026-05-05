import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import s from './CartDrawer.module.css';

const FREE_DELIVERY_THRESHOLD = 80;

const CartDrawer = () => {
  const { isCartOpen, toggleCart, cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState(null);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  const handleRemove = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingId(null);
    }, 300);
  };

  const deliveryProgress = Math.min((cartTotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_DELIVERY_THRESHOLD - cartTotal, 0);

  return (
    <>
      <div className={s.backdrop} onClick={toggleCart} />
      <div className={`${s.drawer} ${lang === 'he' ? s.drawerRtl : s.drawerLtr}`}>
        
        {/* ── HEADER ── */}
        <div className={s.header}>
          <button onClick={toggleCart} className={s.closeBtn}>
            <X size={18} strokeWidth={2.5} />
          </button>
          <div className={s.headerCenter}>
            <h2 className={s.headerTitle}>{lang === 'he' ? 'ההזמנה שלי' : 'طلبي'}</h2>
            <span className={s.headerCount}>
              {cartItems.length === 1
                ? (lang === 'he' ? 'פריט אחד' : 'عنصر واحد')
                : `${cartItems.length} ${lang === 'he' ? 'פריטים' : 'عناصر'}`}
            </span>
          </div>
          <div className={s.headerIcon}>
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* ── FREE DELIVERY PROGRESS ── */}
        {cartItems.length > 0 && (
          <div className={s.deliveryBar}>
            <div className={s.deliveryBarTop}>
              <div className={s.deliveryBarIcon}>
                <Truck size={13} />
              </div>
              <span className={s.deliveryBarText}>
                {remaining > 0
                  ? (lang === 'he' ? `עוד ₪${remaining.toFixed(0)} למשלוח חינם` : `أضف ₪${remaining.toFixed(0)} للشحن المجاني`)
                  : (lang === 'he' ? '🎉 זכית במשלוח חינם!' : '🎉 شحن مجاني!')}
              </span>
            </div>
            <div className={s.deliveryProgressTrack}>
              <div className={s.deliveryProgressFill} style={{ width: `${deliveryProgress}%` }} />
            </div>
          </div>
        )}

        {/* ── ITEMS ── */}
        <div className={s.items}>
          {cartItems.length === 0 ? (
            <div className={s.empty}>
              <ShoppingBag size={72} strokeWidth={1} className={s.emptyIcon} />
              <p className={s.emptyTitle}>{lang === 'he' ? 'העגלה ריקה' : 'السلة فارغة'}</p>
              <p className={s.emptySub}>{lang === 'he' ? 'הוסף מנות מהתפריט' : 'أضف أطباق من القائمة'}</p>
              <button onClick={toggleCart} className={s.emptyBtn}>{lang === 'he' ? 'לתפריט' : 'للقائمة'}</button>
            </div>
          ) : (
            <>
              {cartItems.map(item => {
                const imgSrc = item.product.image_url
                  ? `${import.meta.env.VITE_API_URL}${item.product.image_url}`
                  : 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=100';
                const isRemoving = removingId === item.cartItemId;
                return (
                  <div
                    key={item.cartItemId}
                    className={`${s.itemCard} ${isRemoving ? s.itemRemoving : ''}`}
                  >
                    <img src={imgSrc} alt={t(item.product, 'name')} className={s.itemImg} />
                    <div className={s.itemBody}>
                      <div className={s.itemTop}>
                        <div>
                          <h3 className={s.itemName}>{t(item.product, 'name')}</h3>
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <p className={s.itemOptions}>{item.selectedOptions.map(opt => t(opt, 'option_name')).join(' · ')}</p>
                          )}
                        </div>
                        <button onClick={() => handleRemove(item.cartItemId)} className={s.deleteBtn}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className={s.itemBottom}>
                        <div className={s.qtyStepper}>
                          <button onClick={() => updateQuantity(item.cartItemId, 1)} className={s.qtyBtn}>
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                          <span className={s.qtyValue}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, -1)} className={s.qtyBtn}>
                            <Minus size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                        <span className={s.itemPrice}>₪{(item.unitPrice * item.quantity).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ── SUMMARY ── */}
              <div className={s.summary}>
                <div className={s.gradientDivider} />
                <div className={s.sumRow}>
                  <span className={s.sumLabel}>{lang === 'he' ? 'סכום ביניים' : 'المجموع الفرعي'}</span>
                  <span className={s.sumVal}>₪{cartTotal.toFixed(0)}</span>
                </div>
                <div className={s.sumRow}>
                  <span className={s.sumLabel}>{lang === 'he' ? 'דמי משלוח' : 'رسوم التوصيل'}</span>
                  <span className={s.sumGold}>
                    {cartTotal >= FREE_DELIVERY_THRESHOLD
                      ? (lang === 'he' ? 'חינם!' : 'مجاني!')
                      : `₪${(15).toFixed(0)}`}
                  </span>
                </div>
                <div className={s.sumDivider} />
                <div className={`${s.sumRow} ${s.sumTotal}`}>
                  <span>{lang === 'he' ? 'סה״כ לתשלום' : 'الإجمالي'}</span>
                  <span className={s.sumTotalVal}>
                    ₪{(cartTotal >= FREE_DELIVERY_THRESHOLD ? cartTotal : cartTotal + 15).toFixed(0)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── CHECKOUT BUTTON ── */}
        {cartItems.length > 0 && (
          <button onClick={handleCheckout} className={s.bottomBar}>
            <span className={s.bottomBarPrice}>₪{(cartTotal >= FREE_DELIVERY_THRESHOLD ? cartTotal : cartTotal + 15).toFixed(0)}</span>
            <span className={s.bottomBarLabel}>{lang === 'he' ? 'לתשלום →' : 'للدفع →'}</span>
          </button>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
