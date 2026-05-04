import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { Loader2, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, Activity, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import shared from './AdminShared.module.css';
import s from './AdminProducts.module.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.getAdminProducts();
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await api.toggleProductAvailability(id, newStatus);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: newStatus } : p));
    } catch (error) {
      console.error(error);
      alert('שגיאה בעדכון זמינות');
    }
  };

  const handleRecommendToggle = async (id, currentRec) => {
    try {
      const newRec = currentRec === 1 ? 0 : 1;
      await api.toggleProductRecommendation(id, newRec);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_recommended: newRec } : p));
    } catch (error) {
      console.error(error);
      alert('שגיאה בעדכון המלצה');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) return;
    try {
      await api.softDeleteProduct(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: 0 } : p));
    } catch (error) {
       console.error(error);
       alert('שגיאה במחיקת מוצר');
    }
  };

  const filtered = products.filter(p => 
    p.name_he.toLowerCase().includes(search.toLowerCase()) || 
    (p.category_name_he || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{display: 'flex', justifyContent: 'center', padding: '2.5rem'}}><Loader2 className="animate-spin" color="#c9a84c" size={32} /></div>;

  return (
    <div className={shared.pageWrapper}>
      <div className={shared.pageHeader}>
        <h2 className={shared.pageTitle}>
          <Activity color="#c9a84c" size={32} /> מוצרים
        </h2>
        <button 
          onClick={() => navigate('/admin/products/new')}
          className={shared.primaryBtn}
        >
          <Plus size={20} /> הוסף מוצר חדש
        </button>
      </div>

      <div className={shared.card}>
        <div className={shared.searchBar}>
           <Search color="#94a3b8" size={20} />
           <input 
             type="text" 
             placeholder="חיפוש מוצר או קטגוריה..." 
             value={search}
             onChange={e => setSearch(e.target.value)}
             className={shared.searchInput}
           />
        </div>

        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead>
              <tr className={shared.tableHeadRow}>
                <th className={shared.tableHeadCell} style={{width: '64px'}}>תמונה</th>
                <th className={shared.tableHeadCell}>שם המוצר</th>
                <th className={shared.tableHeadCell}>קטגוריה</th>
                <th className={shared.tableHeadCell}>מחיר</th>
                <th className={shared.tableHeadCell} style={{textAlign: 'center'}}>מומלץ</th>
                <th className={shared.tableHeadCell} style={{textAlign: 'center'}}>זמין להזמנה</th>
                <th className={shared.tableHeadCell} style={{textAlign: 'center'}}>פעיל (נמחק)</th>
                <th className={shared.tableHeadCell} style={{textAlign: 'center'}}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan="8" className={shared.tableCell} style={{textAlign: 'center', color: '#64748b'}}>לא נמצאו מוצרים תואמים</td></tr>
              )}
              {filtered.map(product => {
                const isDeleted = product.is_active === 0;
                return (
                  <tr key={product.id} className={`${shared.tableBodyRow} ${isDeleted ? shared.deletedRow : ''}`}>
                    <td className={shared.tableCell}>
                      {product.image_url ? (
                        <img src={`http://${window.location.hostname}:5000${product.image_url}?v=${product.updated_at || Date.now()}`} alt={product.name_he} className={s.imgCell} />
                      ) : (
                        <div className={s.imgPlaceholder}>אין</div>
                      )}
                    </td>
                    <td className={shared.tableCell}>
                      <p className={s.nameHe}>{product.name_he}</p>
                      <p className={s.nameAr}>{product.name_ar}</p>
                    </td>
                    <td className={`${shared.tableCell} ${s.category}`}>{product.category_name_he || '-'}</td>
                    <td className={`${shared.tableCell} ${s.price}`}>₪{Number(product.base_price).toFixed(2)}</td>
                    
                    <td className={shared.tableCell} style={{textAlign: 'center'}}>
                      <button 
                        onClick={() => handleRecommendToggle(product.id, product.is_recommended)}
                        disabled={isDeleted}
                        className={`${s.toggleBtn} ${product.is_recommended ? s.recommendedOn : s.recommendedOff}`}
                        title={product.is_recommended ? 'מומלץ' : 'לא מומלץ'}
                      >
                        <Star size={24} fill={product.is_recommended ? 'currentColor' : 'none'} />
                      </button>
                    </td>

                    <td className={shared.tableCell} style={{textAlign: 'center'}}>
                      <button 
                        onClick={() => handleToggle(product.id, product.is_available)}
                        disabled={isDeleted}
                        className={`${s.toggleBtn} ${product.is_available ? s.availableOn : s.availableOff}`}
                        title={product.is_available ? 'זמין' : 'חסר במלאי'}
                      >
                        {product.is_available ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                      </button>
                    </td>
                    
                    <td className={shared.tableCell} style={{textAlign: 'center'}}>
                      <span className={product.is_active ? shared.badgeInfo : shared.badgeDanger}>
                        {product.is_active ? 'פעיל' : 'נמחק'}
                      </span>
                    </td>
                    
                    <td className={shared.tableCell}>
                      <div className={s.actionWrap}>
                        <button 
                          onClick={() => navigate(`/admin/products/edit/${product.id}`, { state: { product } })}
                          className={`${shared.iconBtn} ${shared.iconBtnInfo}`}
                          title="ערוך מוצר"
                        >
                          <Edit size={18} />
                        </button>
                        {!isDeleted && (
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className={`${shared.iconBtn} ${shared.iconBtnDanger}`}
                            title="מחק מוצר"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
