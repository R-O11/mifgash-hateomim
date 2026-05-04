import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { Loader2, ChevronDown, ChevronUp, PackageOpen } from 'lucide-react';
import shared from './AdminShared.module.css';
import s from './AdminOrders.module.css';

const STATUS_MAP = {
  new: 'חדש',
  confirmed: 'אושר',
  preparing: 'בהכנה',
  ready: 'מוכן',
  completed: 'נמסר',
  cancelled: 'בוטל'
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.getAdminOrders();
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
    } catch (error) {
       console.error(error);
       alert('שגיאה בעדכון סטטוס');
    }
  };

  if (loading) return <div style={{display: 'flex', justifyContent: 'center', padding: '2.5rem'}}><Loader2 className="animate-spin" color="#c9a84c" size={32} /></div>;

  return (
    <div className={shared.pageWrapper}>
      <h2 className={shared.pageTitle}>
        <PackageOpen color="#c9a84c" size={32} /> הזמנות
      </h2>

      <div className={shared.card}>
        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead>
              <tr className={shared.tableHeadRow}>
                <th className={shared.tableHeadCell}>מספר הזמנה</th>
                <th className={shared.tableHeadCell}>לקוח</th>
                <th className={shared.tableHeadCell}>סוג</th>
                <th className={shared.tableHeadCell}>סה״כ</th>
                <th className={shared.tableHeadCell}>זמן</th>
                <th className={shared.tableHeadCell} style={{textAlign: 'center'}}>סטטוס</th>
                <th className={shared.tableHeadCell} style={{textAlign: 'center'}}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan="7" className={shared.tableCell} style={{textAlign: 'center', color: '#64748b'}}>אין הזמנות כרגע</td></tr>
              )}
              {orders.map(order => {
                const isExpanded = expandedId === order.id;
                return (
                  <React.Fragment key={order.id}>
                    <tr className={`${shared.tableBodyRow} ${isExpanded ? s.expandedRow : ''}`}>
                      <td className={`${shared.tableCell} ${s.monoFont} ${s.boldDark}`}>{order.order_number}</td>
                      <td className={shared.tableCell}>
                        <p className={s.boldDark}>{order.customer_name}</p>
                        <p className={s.subText}>{order.customer_phone}</p>
                      </td>
                      <td className={shared.tableCell}>
                        <span className={order.order_type === 'delivery' ? s.badgeDelivery : s.badgePickup}>
                          {order.order_type === 'delivery' ? 'משלוח' : 'איסוף'}
                        </span>
                      </td>
                      <td className={`${shared.tableCell} ${s.price}`}>₪{Number(order.total_amount).toFixed(2)}</td>
                      <td className={`${shared.tableCell} ${s.subText}`} style={{textAlign: 'left', direction: 'ltr'}}>
                        {new Date(order.created_at).toLocaleString('he-IL')}
                      </td>
                      <td className={shared.tableCell}>
                        <select 
                          value={order.order_status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`${s.statusSelect} ${s[`status_${order.order_status}`]}`}
                        >
                          {Object.entries(STATUS_MAP).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className={shared.tableCell} style={{textAlign: 'center'}}>
                        <button 
                          onClick={() => setExpandedId(isExpanded ? null : order.id)}
                          className={`${shared.iconBtn} ${shared.iconBtnInfo}`}
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {isExpanded && (
                      <tr className={s.expandedRow}>
                        <td colSpan="7" className={s.expandedRowContent}>
                          <div className={s.expandedGrid}>
                            
                            {/* Items List */}
                            <div>
                               <h4 className={s.expandedTitle}>פירוט הפריטים</h4>
                               <div className={s.itemsList}>
                                  {order.items.map(item => (
                                    <div key={item.id} className={s.itemCard}>
                                      <div className={s.itemHeader}>
                                         <span>{item.quantity}x {item.product_name_he}</span>
                                         <span>₪{Number(item.item_total).toFixed(2)}</span>
                                      </div>
                                      {item.options && item.options.length > 0 && (
                                         <ul className={s.optionsList}>
                                            {item.options.map(opt => (
                                              <li key={opt.id}>{opt.option_name_he} {Number(opt.price_change) > 0 ? `(+₪${Number(opt.price_change)})` : ''}</li>
                                            ))}
                                         </ul>
                                      )}
                                      {item.notes && <p className={s.itemNote}>📝 {item.notes}</p>}
                                    </div>
                                  ))}
                               </div>
                            </div>
                            
                            {/* Order Details */}
                            <div>
                               <h4 className={s.expandedTitle}>פרטי הזמנה</h4>
                               <div className={s.detailsCard}>
                                  <div className={s.detailRow}><span className={s.detailLabel}>כתובת/הערות למשלוח:</span> <span className={s.detailVal}>{order.notes || '-'}</span></div>
                                  <div className={s.detailRow}><span className={s.detailLabel}>אמצעי תשלום:</span> <span className={s.detailVal}>{order.payment_method === 'cash' ? 'מזומן' : order.payment_method}</span></div>
                                  <div className={s.detailRow}><span className={s.detailLabel}>סטטוס תשלום:</span> <span className={s.detailVal}>{order.payment_status}</span></div>
                                  <div className={s.detailRow}><span className={s.detailLabel}>דמי משלוח:</span> <span className={s.detailVal}>₪{Number(order.delivery_fee).toFixed(2)}</span></div>
                                  <div className={s.detailTotalRow}><span className={s.totalLabel}>סה״כ לתשלום:</span> <span className={s.price}>₪{Number(order.total_amount).toFixed(2)}</span></div>
                               </div>
                            </div>
                            
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
