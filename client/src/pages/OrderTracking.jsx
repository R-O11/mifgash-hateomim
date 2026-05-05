import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';
import { ChevronRight, ChevronLeft, Check, ChefHat, Bike, Receipt, Home } from 'lucide-react';
import s from './OrderTracking.module.css';

const STEPS = [
  { id: 'received', icon: Receipt, labelHe: 'התקבלה', labelAr: 'تم الاستلام' },
  { id: 'preparing', icon: ChefHat, labelHe: 'בהכנה', labelAr: 'قيد التحضير' },
  { id: 'ready', icon: Bike, labelHe: 'מוכנה / בדרך', labelAr: 'جاهز / في الطريق' }
];

const getNormalizedStatus = (backendStatus) => {
  if (['new', 'confirmed'].includes(backendStatus)) return 'received';
  if (backendStatus === 'preparing') return 'preparing';
  if (['ready', 'completed'].includes(backendStatus)) return 'ready';
  return 'received';
};

const OrderTracking = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const prevStatusRef = useRef(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
      Notification.requestPermission();
    }
  }, []);

  const fetchOrder = async (isPolling = false) => {
    try {
      if (isPolling) setIsUpdating(true);
      const res = await api.get('/api/orders/track/' + orderNumber);
      const resData = res.data;
      if (resData.success && resData.data) {
        const currentData = resData.data;
        setOrderData(currentData);
        
        const currentStatus = getNormalizedStatus(currentData.order_status);
        
        if (
          prevStatusRef.current && 
          prevStatusRef.current !== currentStatus && 
          currentStatus === 'ready'
        ) {
          showNotification(currentData.order_number);
        }
        
        prevStatusRef.current = currentStatus;
      } else {
        if (!isPolling) setError('Order not found');
      }
    } catch (err) {
      if (!isPolling) setError('Error fetching order');
    } finally {
      setLoading(false);
      if (isPolling) {
        setTimeout(() => setIsUpdating(false), 2000);
      }
    }
  };

  const showNotification = (orderNum) => {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(
          lang === 'he' ? 'ההזמנה שלך מוכנה! 🎉' : 'طلبك جاهز! 🎉',
          {
            body: lang === 'he' ? `בוא לאסוף את ההזמנה #${orderNum}` : `تعال واستلم طلبك #${orderNum}`,
            icon: '/vite.svg',
            vibrate: [200, 100, 200]
          }
        );
      });
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [orderNumber]);

  if (loading) {
    return <div className={s.loadingWrap}>{lang === 'he' ? 'טוען נתונים...' : 'جاري التحميل...'}</div>;
  }

  if (error || !orderData) {
    return (
      <div className={s.errorWrap}>
        <h2>{lang === 'he' ? 'הזמנה לא נמצאה' : 'الطلب غير موجود'}</h2>
        <button onClick={() => navigate('/')} className={s.homeBtn}>
          <Home size={20} /> {lang === 'he' ? 'חזרה לתפריט' : 'عودة'}
        </button>
      </div>
    );
  }

  const activeStepId = getNormalizedStatus(orderData.order_status);
  const activeStepIndex = STEPS.findIndex(st => st.id === activeStepId);

  return (
    <div className={s.page} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <div className={s.header}>
        <button onClick={() => navigate('/orders')} className={s.backBtn}>
          {lang === 'he' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
        <span className={s.headerTitle}>{lang === 'he' ? 'מעקב הזמנה' : 'تتبع الطلب'}</span>
        <div style={{ width: 40 }} />
      </div>

      <div className={s.content}>
        <div className={s.orderMetaInfo}>
          <span className={s.orderNumberLabel}>{lang === 'he' ? 'הזמנה מס׳' : 'رقم الطلب'}</span>
          <h1 className={s.orderNumberVal}>#{orderData.order_number}</h1>
          <p className={s.totalAmt}>₪{orderData.total_amount}</p>
        </div>

        <div className={s.stepperWrap}>
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= activeStepIndex;
            const isLast = idx === STEPS.length - 1;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className={`${s.stepItem} ${isCompleted ? s.stepCompleted : ''}`}>
                  <div className={s.stepCircle}>
                    {idx < activeStepIndex || orderData.order_status === 'completed' ? (
                      <Check size={20} strokeWidth={3} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  <span className={s.stepLabel}>{lang === 'he' ? step.labelHe : step.labelAr}</span>
                </div>
                {!isLast && (
                  <div className={`${s.stepLine} ${idx < activeStepIndex ? s.lineCompleted : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {isUpdating && (
          <div className={s.updatingToast}>
            <span className={s.pulseDot} />
            {lang === 'he' ? 'מתעדכן...' : 'جار التحديث...'}
          </div>
        )}
      </div>

      <div className={s.bottomBtnWrap}>
         <button onClick={() => navigate('/')} className={s.homeBtnBig}>
            <Home size={20} /> 
            {lang === 'he' ? 'חזרה לתפריט הראשי' : 'العودة للقائمة الرئيسية'}
         </button>
      </div>
    </div>
  );
};

export default OrderTracking;
