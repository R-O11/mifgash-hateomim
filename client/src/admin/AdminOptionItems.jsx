import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { Loader2, Plus, Edit, Trash2, CheckSquare, Save, X } from 'lucide-react';
import shared from './AdminShared.module.css';
import s from './AdminOptionItems.module.css';

const AdminOptionItems = () => {
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ 
    group_id: '', name_he: '', name_ar: '', price_change: '0', sort_order: 0, is_active: '1' 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemRes, grpRes] = await Promise.all([
        api.getAdminOptionItems(),
        api.getAdminOptionGroups()
      ]);
      setItems(itemRes.data);
      setGroups(grpRes.data.filter(g => g.is_active === 1)); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (it) => {
    setFormData({ 
      group_id: it.group_id, 
      name_he: it.name_he, 
      name_ar: it.name_ar, 
      price_change: it.price_change,
      sort_order: it.sort_order, 
      is_active: it.is_active?.toString() || '1' 
    });
    setIsEditing(it.id);
  };

  const handleAdd = () => {
    setFormData({ 
      group_id: groups.length > 0 ? groups[0].id : '', 
      name_he: '', name_ar: '', price_change: '0', sort_order: 0, is_active: '1' 
    });
    setIsEditing('new');
  };

  const saveItem = async () => {
    if (!formData.name_he || !formData.name_ar || !formData.group_id) return alert("יש למלא שדות חובה");
    setSaving(true);
    try {
      const payload = { ...formData };
      if (isEditing === 'new') {
        await api.createOptionItem(payload);
      } else {
        await api.updateOptionItem(isEditing, payload);
      }
      setIsEditing(null);
      fetchData();
    } catch (err) {
      alert("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("למחוק אפשרות זו?")) return;
    try {
      await api.softDeleteOptionItem(id);
      setItems(prev => prev.map(c => c.id === id ? { ...c, is_active: 0 } : c));
    } catch (err) {
      alert("שגיאה במחיקה");
    }
  };

  const activeItems = items.filter(c => c.is_active === 1);

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'2.5rem'}}><Loader2 className="animate-spin" color="#c9a84c" size={32} /></div>;

  return (
    <div className={shared.pageWrapper}>
      <div className={shared.pageHeader}>
        <h2 className={shared.pageTitle}>
          <CheckSquare color="#c9a84c" size={32} /> ניהול תוספות ובחירות
        </h2>
        {!isEditing && (
          <button onClick={handleAdd} className={shared.primaryBtn}>
            <Plus size={20} /> תוספת חדשה
          </button>
        )}
      </div>

      <div className={shared.card}>
        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead>
              <tr className={shared.tableHeadRow}>
                <th className={shared.tableHeadCell} style={{fontSize:'0.875rem'}}>שיוך לקבוצה</th>
                <th className={shared.tableHeadCell} style={{fontSize:'0.875rem'}}>שם אפשרות (he/ar)</th>
                <th className={shared.tableHeadCell} style={{textAlign:'center', fontSize:'0.875rem'}}>תוספת מחיר (₪)</th>
                <th className={shared.tableHeadCell} style={{textAlign:'center', fontSize:'0.875rem'}}>סדר</th>
                <th className={shared.tableHeadCell} style={{textAlign:'center', fontSize:'0.875rem'}}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {isEditing && (
                <tr className={s.editRow}>
                   <td className={s.editCell}>
                      <select className={s.inputField} value={formData.group_id} onChange={e => setFormData({...formData, group_id: e.target.value})}>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name_he} ({g.product_name_he})</option>)}
                      </select>
                   </td>
                   <td className={s.editCell}>
                      <div className={s.inputStack}>
                        <input className={s.inputField} placeholder="עברית" value={formData.name_he} onChange={e => setFormData({...formData, name_he: e.target.value})} />
                        <input className={s.inputField} dir="rtl" placeholder="ערבית" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} style={{textAlign:'right'}} />
                      </div>
                   </td>
                   <td className={s.editCell}>
                      <input className={s.inputFieldCenter} type="number" step="0.01" value={formData.price_change} onChange={e => setFormData({...formData, price_change: e.target.value})} dir="ltr" />
                   </td>
                   <td className={s.editCell}>
                      <input className={s.inputFieldSmall} type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: e.target.value})} />
                   </td>
                   <td className={s.editCell} style={{textAlign:'center'}}>
                     <div className={s.actionWrap}>
                       <button onClick={saveItem} disabled={saving} className={s.iconBtnSuccess}><Save size={18} /></button>
                       <button onClick={() => setIsEditing(null)} className={s.iconBtnDanger}><X size={18} /></button>
                     </div>
                   </td>
                </tr>
              )}
              
              {activeItems.map(it => (
                isEditing === it.id ? null : (
                  <tr key={it.id} className={shared.tableBodyRow}>
                    <td className={shared.tableCell} style={{fontSize:'0.875rem'}}>
                      <span className={s.groupBadge}>{it.group_name_he}</span>
                    </td>
                    <td className={shared.tableCell} style={{fontSize:'0.875rem'}}>
                      <div className={s.titleMain}>{it.name_he}</div>
                      <div className={s.titleSub}>{it.name_ar}</div>
                    </td>
                    <td className={shared.tableCell} style={{textAlign:'center'}}>
                      <span className={s.priceDisplay}>
                        {Number(it.price_change) > 0 ? '+' : ''}{Number(it.price_change).toFixed(2)}
                      </span>
                    </td>
                    <td className={shared.tableCell} style={{textAlign:'center'}}>
                      <span className={s.sortOrder}>{it.sort_order}</span>
                    </td>
                    <td className={shared.tableCell} style={{textAlign:'center'}}>
                       <div className={s.actionWrap}>
                         <button onClick={() => handleEdit(it)} className={s.iconBtnNeutral}><Edit size={18} /></button>
                         <button onClick={() => handleDelete(it.id)} className={s.iconBtnDanger}><Trash2 size={18} /></button>
                       </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOptionItems;
