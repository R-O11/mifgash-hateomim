import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, Package } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';
import s from './Orders.module.css';

const Orders = () => {
  const { lang } = useLanguage();

  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    try {
      const ro = JSON.parse(localStorage.getItem('recentOrders') || '[]');
      setRecentOrders(ro);
    } catch(e) {}
  }, []);

  const handleTrack = async (orderNum) => {
    if (!orderNum) return;
    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);
    try {
      const res = await api.get('/api/orders/track/' + orderNum);
      const resData = res.data;
      if (resData.success) {
        setTrackResult(resData.data);
      }
    } catch (err) {
      setTrackError(lang === 'he' ? 'הזמנה לא נמצאה או שגיאה בשרת' : 'الطلب غير موجود أو حدث خطأ');
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div dir="rtl" className={s.page}>
      
      {/* ── Page Header ── */}
      <div className={s.pageHeader}>
        <div className={s.iconRing}>
          <Package size={24} className={s.headerIcon} />
        </div>
        <h1 className={s.pageTitle}>{lang === 'he' ? 'הזמנות קודמות ומעקב' : 'الطلبات السابقة والتتبع'}</h1>
        <p className={s.pageSub}>{lang === 'he' ? 'צפה בסטטוס ההזמנה שלך בזמן אמת' : 'شاهد حالة طلبك في الوقت الحقيقي'}</p>
      </div>

      <section className={s.section}>
        <div className={s.card}>
          {recentOrders.length > 0 && (
            <>
              <h3 className={s.sectionSubtitle}>{lang === 'he' ? 'הזמנות אחרונות' : 'الطلبات الأخيرة'}</h3>
              <div className={s.recentOrdersList}>
                {recentOrders.map((ro, i) => (
                  <div key={i} className={s.recentOrderCard} onClick={() => handleTrack(ro.orderNumber)}>
                    <div>
                      <div className={s.roId}>{ro.orderNumber}</div>
                      <div className={s.roDate}>{new Date(ro.timestamp).toLocaleDateString(lang === 'he' ? 'he-IL' : 'ar-EG')}</div>
                    </div>
                    <ChevronLeft size={16} color="var(--gold)" />
                  </div>
                ))}
              </div>
              <div className={s.divider} />
            </>
          )}

          <h3 className={s.sectionSubtitle}>{lang === 'he' ? 'מעקב ידני' : 'تتبع يدوي'}</h3>
          <div className={s.trackerWrap}>
            <div className={s.trackerInputWrap}>
              <input
                type="text"
                placeholder={lang === 'he' ? 'הכנס מספר הזמנה...' : 'أدخل رقم الطلب...'}
                className={s.trackerInput}
                value={trackOrderNumber}
                onChange={e => setTrackOrderNumber(e.target.value)}
              />
              <button 
                className={s.trackerBtn} 
                onClick={() => handleTrack(trackOrderNumber)}
                disabled={trackLoading || !trackOrderNumber}
              >
                {lang === 'he' ? 'חפש' : 'بحث'}
              </button>
            </div>
            
            {trackError && <div className={s.trackerError}>{trackError}</div>}
            
            {trackResult && (
              <div className={s.trackerResult}>
                <div className={s.resultTitle}>
                  <span>{lang === 'he' ? 'הזמנה: ' : 'الطلب: '}{trackResult.order_number}</span>
                  <span className={s.resultDate}>₪{trackResult.total_amount}</span>
                </div>
                <div className={s.statusIndicator}>
                  <div className={s.statusDot} />
                  <span className={s.statusText}>
                    {trackResult.order_status === 'new' ? (lang === 'he' ? 'התקבלה, ממתין לאישור' : 'تم الاستلام، بانتظار التأكيد') :
                     trackResult.order_status === 'confirmed' ? (lang === 'he' ? 'אושר, ממתין להכנה' : 'مؤكد، بانتظار التحضير') :
                     trackResult.order_status === 'preparing' ? (lang === 'he' ? 'בהכנה...' : 'قيد التحضير...') :
                     trackResult.order_status === 'ready' ? (lang === 'he' ? 'מוכן ללקוח!' : 'جاهز!') :
                     trackResult.order_status === 'completed' ? (lang === 'he' ? 'הושלם' : 'اكتمل') :
                     trackResult.order_status === 'cancelled' ? (lang === 'he' ? 'בוטל' : 'ألغي') :
                     trackResult.order_status}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Orders;
