import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { Loader2, Plus, Edit, Trash2, ListTree, Save, X } from 'lucide-react';
import shared from './AdminShared.module.css';
import s from './AdminOptionGroups.module.css';

const AdminOptionGroups = () => {
  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ 
    product_id: '', name_he: '', name_ar: '', selection_type: 'single', 
    is_required: false, min_select: 0, max_select: 1, sort_order: 0, is_active: '1' 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [grpRes, prodRes] = await Promise.all([
        api.getAdminOptionGroups(),
        api.getAdminProducts()
      ]);
      setGroups(grpRes.data);
      setProducts(prodRes.data.filter(p => p.is_active === 1)); // Only show active products in dropdown
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (grp) => {
    setFormData({ 
      product_id: grp.product_id, 
      name_he: grp.name_he, 
      name_ar: grp.name_ar, 
      selection_type: grp.selection_type,
      is_required: grp.is_required === 1,
      min_select: grp.min_select,
      max_select: grp.max_select,
      sort_order: grp.sort_order, 
      is_active: grp.is_active?.toString() || '1' 
    });
    setIsEditing(grp.id);
  };

  const handleAdd = () => {
    setFormData({ 
      product_id: products.length > 0 ? products[0].id : '', 
      name_he: '', name_ar: '', selection_type: 'single', 
      is_required: false, min_select: 0, max_select: 1, sort_order: 0, is_active: '1' 
    });
    setIsEditing('new');
  };

  const saveGroup = async () => {
    if (!formData.name_he || !formData.name_ar || !formData.product_id) return alert("יש למלא שדות חובה");
    setSaving(true);
    try {
      const payload = { ...formData };
      if (isEditing === 'new') {
        await api.createOptionGroup(payload);
      } else {
        await api.updateOptionGroup(isEditing, payload);
      }
      setIsEditing(null);
      fetchData();
    } catch (err) {
      alert("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("למחוק קבוצת אפשרויות זו?")) return;
    try {
      await api.softDeleteOptionGroup(id);
      setGroups(prev => prev.map(c => c.id === id ? { ...c, is_active: 0 } : c));
    } catch (err) {
      alert("שגיאה במחיקה");
    }
  };

  const activeGroups = groups.filter(c => c.is_active === 1);

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'2.5rem'}}><Loader2 className="animate-spin" color="#c9a84c" size={32} /></div>;

  return (
    <div className={shared.pageWrapper}>
      <div className={shared.pageHeader}>
        <h2 className={shared.pageTitle}>
          <ListTree color="#c9a84c" size={32} /> ניהול קבוצות אפשרויות
        </h2>
        {!isEditing && (
          <button onClick={handleAdd} className={shared.primaryBtn}>
            <Plus size={20} /> קבוצה חדשה
          </button>
        )}
      </div>

      <div className={shared.card}>
        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead>
              <tr className={shared.tableHeadRow}>
                <th className={shared.tableHeadCell} style={{fontSize:'0.875rem'}}>שיוך למוצר</th>
                <th className={shared.tableHeadCell} style={{fontSize:'0.875rem'}}>שם קבוצה (he/ar)</th>
                <th className={shared.tableHeadCell} style={{fontSize:'0.875rem'}}>סוג בחירה</th>
                <th className={shared.tableHeadCell} style={{fontSize:'0.875rem'}}>חובה? / מינ' / מקס'</th>
                <th className={shared.tableHeadCell} style={{textAlign:'center', fontSize:'0.875rem'}}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {isEditing && (
                <tr className={s.editRow}>
                   <td className={s.editCell}>
                      <select className={s.inputField} value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})}>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name_he}</option>)}
                      </select>
                   </td>
                   <td className={s.editCell}>
                      <div className={s.inputStack}>
                        <input className={s.inputField} placeholder="עברית" value={formData.name_he} onChange={e => setFormData({...formData, name_he: e.target.value})} />
                        <input className={s.inputField} dir="rtl" placeholder="ערבית" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} style={{textAlign:'right'}} />
                      </div>
                   </td>
                   <td className={s.editCell}>
                      <select className={s.inputField} value={formData.selection_type} onChange={e => setFormData({...formData, selection_type: e.target.value})}>
                        <option value="single">Single (רדיו)</option>
                        <option value="multiple">Multiple (צ'קבוקס)</option>
                      </select>
                   </td>
                   <td className={s.editCell}>
                      <label className={s.checkboxWrap}><input type="checkbox" checked={formData.is_required} onChange={e => setFormData({...formData, is_required: e.target.checked})}/> חובה?</label>
                      <div className={s.minMaxWrap}>
                         <input className={s.smallNumInput} type="number" placeholder="min" value={formData.min_select} onChange={e => setFormData({...formData, min_select: e.target.value})} /> min
                         <input className={s.smallNumInput} type="number" placeholder="max" value={formData.max_select} onChange={e => setFormData({...formData, max_select: e.target.value})} /> max
                      </div>
                   </td>
                   <td className={s.editCell} style={{textAlign:'center'}}>
                     <div className={s.actionWrap}>
                       <button onClick={saveGroup} disabled={saving} className={s.iconBtnSuccess}><Save size={18} /></button>
                       <button onClick={cancelEdit} className={s.iconBtnDanger}><X size={18} /></button>
                     </div>
                   </td>
                </tr>
              )}
              
              {activeGroups.map(grp => (
                isEditing === grp.id ? null : (
                  <tr key={grp.id} className={shared.tableBodyRow}>
                    <td className={shared.tableCell} style={{fontSize:'0.875rem'}}>
                      <span className={s.prodBadge}>{grp.product_name_he}</span>
                    </td>
                    <td className={shared.tableCell} style={{fontSize:'0.875rem'}}>
                      <div className={s.titleMain}>{grp.name_he}</div>
                      <div className={s.titleSub}>{grp.name_ar}</div>
                    </td>
                    <td className={shared.tableCell} style={{fontSize:'0.875rem', color:'#475569'}}>{grp.selection_type}</td>
                    <td className={shared.tableCell} style={{fontSize:'0.875rem'}}>
                       {grp.is_required === 1 ? <span className={s.reqBadge}>חובה</span> : <span className={s.optBadge}>רשות</span>}
                       <span className={s.minMaxText}>min:{grp.min_select} max:{grp.max_select}</span>
                    </td>
                    <td className={shared.tableCell} style={{textAlign:'center'}}>
                       <div className={s.actionWrap}>
                         <button onClick={() => handleEdit(grp)} className={s.iconBtnNeutral}><Edit size={18} /></button>
                         <button onClick={() => handleDelete(grp.id)} className={s.iconBtnDanger}><Trash2 size={18} /></button>
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

export default AdminOptionGroups;
