import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowRight, ArrowLeft, CheckCircle, CreditCard, Banknote, Smartphone } from 'lucide-react';
import s from './Checkout.module.css';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', notes: '' });
  const [touched, setTouched] = useState({ name: false, phone: false, address: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorLine, setErrorLine] = useState('');
  const [isOpenCheck, setIsOpenCheck] = useState(true);

  useEffect(() => {
    if (cartItems.length === 0) navigate('/');
    api.get('/api/business-status').then(res => setIsOpenCheck(res.data.isOpen));
  }, [cartItems.length, navigate]);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const isFieldValid = (field) => {
    if (field === 'name') return formData.name.trim().length > 1;
    if (field === 'phone') return formData.phone.trim().length >= 9;
    if (field === 'address') return orderType === 'delivery' ? formData.address.trim().length > 4 : true;
    return true;
  };

  const getFieldClass = (field) => {
    if (!touched[field]) return s.input;
    return isFieldValid(field) ? `${s.input} ${s.inputValid}` : `${s.input} ${s.inputError}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOpenCheck) {
      setErrorLine(lang === 'he' ? 'סליחה, המסעדה סגורה כרגע.' : 'عذراً، المطعم مغلق حالياً.');
      return;
    }
    
    setTouched({ name: true, phone: true, address: true });
    if (!isFieldValid('name') || !isFieldValid('phone') || !isFieldValid('address')) {
      setErrorLine(lang === 'he' ? 'יש למלא ולתקן שדות באדום' : 'يرجى تعبئة الحقول باللون الأحمر');
      return;
    }

    setIsSubmitting(true);
    setErrorLine('');

    const payload = {
      customer_name: formData.name,
      customer_phone: formData.phone,
      notes: `${formData.address} | ${formData.notes}`,
      order_type: orderType,
      theme_lang: lang,
      payment_method: paymentMethod,
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        notes: item.notes,
        options: item.selectedOptions.map(opt => ({ itemId: opt.itemId }))
      }))
    };

    try {
      const res = await api.post('/api/orders', payload);
      const resData = res.data;
      if (resData.success) {
        clearCart();
        setIsSuccess(true);
        
        // Save to recent orders for tracking
        try {
          const recent = JSON.parse(localStorage.getItem('recentOrders') || '[]');
          if (!recent.some(o => o.orderNumber === resData.data.orderNumber)) {
             recent.unshift({ orderNumber: resData.data.orderNumber, timestamp: new Date().toISOString() });
             // Keep only last 5
             localStorage.setItem('recentOrders', JSON.stringify(recent.slice(0, 5)));
          }
        } catch(e) {}

        setTimeout(() => {
          navigate('/orders/' + resData.data.orderNumber);
        }, 1200);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server Error / שגיאת שרת';
      setErrorLine(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={s.page}>
      
      {/* Header */}
      <div className={s.header}>
        <button onClick={() => navigate('/')} className={s.backBtn}>
          {lang === 'he' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          {lang === 'he' ? 'חזרה לתפריט' : 'عودة للقائمة'}
        </button>
        <span className={s.headerTitle}>{lang === 'he' ? 'מפגש התאומים' : 'مطعم التوأم'}</span>
      </div>

      {/* Progress Indicator */}
      <div className={s.progressWrap}>
        <div className={s.progressLine} />
        <div className={`${s.progressStep} ${s.stepCompleted}`}>
          <div className={s.stepCircle}><CheckCircle size={14} /></div>
          <span className={s.stepLabel}>{lang === 'he' ? 'עגלה' : 'عربة'}</span>
        </div>
        <div className={`${s.progressStep} ${s.stepActive}`}>
          <div className={s.stepCircle}>2</div>
          <span className={s.stepLabel}>{lang === 'he' ? 'פרטים' : 'تفاصيل'}</span>
        </div>
        <div className={`${s.progressStep} ${s.stepInactive}`}>
          <div className={s.stepCircle}>3</div>
          <span className={s.stepLabel}>{lang === 'he' ? 'תשלום' : 'دفع'}</span>
        </div>
      </div>

      <div className={s.card}>
        
        {!isOpenCheck && (
          <div className={s.closedOverlay}>
            <CheckCircle className={s.closedIcon} size={48} />
            <h2 className={s.closedTitle}>{lang === 'he' ? 'המסעדה סגורה' : 'المطعم مغلق'}</h2>
            <p className={s.closedSub}>
              {lang === 'he' ? 'לא ניתן לבצע הזמנות בשלב זה, מתנצלים!' : 'لا يمكن إجراء طلبات في الوقت الحالي، نعتذر!'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={s.form}>
          
          {/* Order Type Tabs */}
          <div className={s.tabsWrap}>
            <button type="button" onClick={() => setOrderType('delivery')} className={`${s.tab} ${orderType === 'delivery' ? s.tabActive : s.tabInactive}`}>
              <span className={s.tabIcon}>🛵</span> {lang === 'he' ? 'משלוח' : 'توصيل'}
            </button>
            <button type="button" onClick={() => setOrderType('pickup')} className={`${s.tab} ${orderType === 'pickup' ? s.tabActive : s.tabInactive}`}>
              <span className={s.tabIcon}>🙋</span> {lang === 'he' ? 'איסוף עצמי' : 'استلام'}
            </button>
          </div>

          <div className={s.formGrid}>
            <div className={s.inputBox}>
              <label className={s.label}>{lang === 'he' ? 'שם מלא' : 'الاسم الكامل'} <span className={s.requiredStar}>*</span></label>
              <input 
                type="text" className={getFieldClass('name')}
                placeholder={lang === 'he' ? 'לדוגמה: ישראל ישראלי' : 'مثال: إسرائيل إسرائيلي'}
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                onBlur={() => handleBlur('name')}
              />
              {touched.name && !isFieldValid('name') && <span className={s.errorText}>{lang === 'he' ? 'שם אינו חוקי' : 'اسم غير صالح'}</span>}
            </div>
            
            <div className={s.inputBox}>
              <label className={s.label}>{lang === 'he' ? 'טלפון נייד' : 'رقم الهاتف'} <span className={s.requiredStar}>*</span></label>
              <input 
                type="tel" className={getFieldClass('phone')}
                placeholder="05X-XXXXXXX"
                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                onBlur={() => handleBlur('phone')}
              />
              {touched.phone && !isFieldValid('phone') && <span className={s.errorText}>{lang === 'he' ? 'טלפון אינו חוקי' : 'رقم غير صالح'}</span>}
            </div>

            {orderType === 'delivery' && (
              <div className={s.inputBox}>
                <label className={s.label}>{lang === 'he' ? 'כתובת למשלוח' : 'عنوان التوصيل'} <span className={s.requiredStar}>*</span></label>
                <textarea 
                  className={`${getFieldClass('address')} ${s.textarea}`} rows="2"
                  placeholder={lang === 'he' ? 'עיר, רחוב, מספר בית, קומה, קוד כניסה...' : 'المدينة، الشارع، رقم المنزل...'}
                  value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                  onBlur={() => handleBlur('address')}
                />
                {touched.address && !isFieldValid('address') && <span className={s.errorText}>{lang === 'he' ? 'כתובת אינה חוקית' : 'عنوان غير صالح'}</span>}
              </div>
            )}

            <div className={s.inputBox}>
              <label className={s.label}>{lang === 'he' ? 'הערות להזמנה' : 'ملاحظات للطلب'}</label>
              <textarea 
                className={`${s.input} ${s.textarea}`} rows="3"
                placeholder={lang === 'he' ? 'אלרגיות, בקשות מיוחדות...' : 'حساسية، طلبات خاصة...'}
                value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className={s.paymentSection}>
            <h3 className={s.sectionTitle}>{lang === 'he' ? 'אמצעי תשלום' : 'طريقة الدفع'}</h3>
            <div className={s.paymentGrid}>
              
              <div onClick={() => setPaymentMethod('cash')} className={`${s.paymentCard} ${paymentMethod === 'cash' ? s.paymentCardActive : ''}`}>
                <div className={s.paymentIcon}><Banknote size={20} /></div>
                <span className={s.paymentLabel}>{lang === 'he' ? 'מזומן בלבד' : 'نقدا فقط'}</span>
                <div className={s.radioHole}>{paymentMethod === 'cash' && <div className={s.radioDot} />}</div>
              </div>

              <div onClick={() => setPaymentMethod('cc')} className={`${s.paymentCard} ${paymentMethod === 'cc' ? s.paymentCardActive : ''}`}>
                <div className={s.paymentIcon}><CreditCard size={20} /></div>
                <span className={s.paymentLabel}>{lang === 'he' ? 'כרטיס אשראי' : 'بطاقة ائتمان'}</span>
                <div className={s.radioHole}>{paymentMethod === 'cc' && <div className={s.radioDot} />}</div>
              </div>

              <div onClick={() => setPaymentMethod('apple')} className={`${s.paymentCard} ${paymentMethod === 'apple' ? s.paymentCardActive : ''}`}>
                <div className={s.paymentIcon}><Smartphone size={20} /></div>
                <span className={s.paymentLabel}>Apple Pay</span>
                <div className={s.radioHole}>{paymentMethod === 'apple' && <div className={s.radioDot} />}</div>
              </div>

            </div>
          </div>

          <div className={s.totalBox}>
            <span className={s.totalLabel}>{lang === 'he' ? 'לתשלום סופי:' : 'للدفع النهائي:'}</span>
            <span className={s.totalValue}>₪{cartTotal.toFixed(0)}</span>
          </div>

          {errorLine && <p className={s.submitError}>{errorLine}</p>}

          <button type="submit" disabled={isSubmitting || isSuccess} className={s.submitBtn}>
            {isSubmitting ? (
              <><div className={s.loadingSpin} /> {lang === 'he' ? 'שולח...' : 'إرسال...'}</>
            ) : isSuccess ? (
              <><CheckCircle size={20} /> {lang === 'he' ? 'ההזמנה נשלחה! ✓' : 'تم إرسال الطلب! ✓'}</>
            ) : (
              lang === 'he' ? 'שלח הזמנה' : 'إرسال الطلب'
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Checkout;
