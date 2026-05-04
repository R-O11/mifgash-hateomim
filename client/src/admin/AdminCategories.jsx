import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { Loader2, Plus, Edit, Trash2, Tags, Save, X } from 'lucide-react';
import shared from './AdminShared.module.css';
import s from './AdminCategories.module.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isEditing, setIsEditing] = useState(null); // id of editing cat, or 'new'
  const [formData, setFormData] = useState({ name_he: '', name_ar: '', sort_order: 0, is_active: '1' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.getAdminCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setFormData({ 
      name_he: cat.name_he, 
      name_ar: cat.name_ar, 
      sort_order: cat.sort_order, 
      is_active: cat.is_active?.toString() || '1' 
    });
    setIsEditing(cat.id);
  };

  const handleAdd = () => {
    setFormData({ name_he: '', name_ar: '', sort_order: categories.length + 1, is_active: '1' });
    setIsEditing('new');
  };

  const cancelEdit = () => {
    setIsEditing(null);
  };

  const saveCategory = async () => {
    if (!formData.name_he || !formData.name_ar) return alert("יש למלא שמות");
    setSaving(true);
    try {
      const payload = { ...formData };
      if (isEditing === 'new') {
        await api.createCategory(payload);
      } else {
        await api.updateCategory(isEditing, payload);
      }
      setIsEditing(null);
      fetchCategories();
    } catch (err) {
      alert("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("למחוק קטגוריה זו? זה יסתיר אותה מהתפריט.")) return;
    try {
      await api.softDeleteCategory(id);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: 0 } : c));
    } catch (err) {
      alert("שגיאה במחיקה");
    }
  };

  const activeCategories = categories.filter(c => c.is_active === 1);
  const deletedCategories = categories.filter(c => c.is_active === 0);

  if (loading) return <div style={{display: 'flex', justifyContent: 'center', padding: '2.5rem'}}><Loader2 className="animate-spin" color="#c9a84c" size={32} /></div>;

  return (
    <div className={shared.pageWrapper}>
      <div className={shared.pageHeader}>
        <h2 className={shared.pageTitle}>
          <Tags color="#c9a84c" size={32} /> ניהול קטגוריות
        </h2>
        {!isEditing && (
          <button onClick={handleAdd} className={shared.primaryBtn}>
            <Plus size={20} /> קטגוריה חדשה
          </button>
        )}
      </div>

      <div className={shared.card}>
        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead>
              <tr className={shared.tableHeadRow}>
                <th className={shared.tableHeadCell}>שם (עברית)</th>
                <th className={shared.tableHeadCell}>שם (ערבית)</th>
                <th className={shared.tableHeadCell} style={{textAlign: 'center'}}>סדר הצגה</th>
                <th className={shared.tableHeadCell} style={{textAlign: 'center'}}>סטטוס</th>
                <th className={shared.tableHeadCell} style={{textAlign: 'center'}}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {isEditing === 'new' && (
                <tr className={s.editRow}>
                   <td className={shared.tableCell}><input className={s.inputField} value={formData.name_he} onChange={e => setFormData({...formData, name_he: e.target.value})} placeholder="עברית" /></td>
                   <td className={shared.tableCell} dir="rtl"><input className={s.inputField} value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} placeholder="ערבית" /></td>
                   <td className={shared.tableCell}><input className={`${s.inputField} ${s.inputNumber}`} type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: e.target.value})} /></td>
                   <td className={shared.tableCell} style={{textAlign: 'center'}}><span className={s.newLabel}>חדש</span></td>
                   <td className={shared.tableCell}>
                     <div className={s.actionWrap}>
                       <button onClick={saveCategory} disabled={saving} className={s.iconBtnSuccess}><Save size={18} /></button>
                       <button onClick={cancelEdit} className={s.iconBtnDanger}><X size={18} /></button>
                     </div>
                   </td>
                </tr>
              )}
              
              {activeCategories.map(cat => (
                isEditing === cat.id ? (
                  <tr key={cat.id} className={s.editRow}>
                   <td className={shared.tableCell}><input className={s.inputField} value={formData.name_he} onChange={e => setFormData({...formData, name_he: e.target.value})} /></td>
                   <td className={shared.tableCell} dir="rtl"><input className={s.inputField} value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} /></td>
                   <td className={shared.tableCell}><input className={`${s.inputField} ${s.inputNumber}`} type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: e.target.value})} /></td>
                   <td className={shared.tableCell} style={{textAlign: 'center'}}>
                     <select className={s.inputField} value={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.value})}>
                       <option value="1">פעיל</option>
                       <option value="0">נמחק (מוסתר)</option>
                     </select>
                   </td>
                   <td className={shared.tableCell}>
                     <div className={s.actionWrap}>
                       <button onClick={saveCategory} disabled={saving} className={s.iconBtnSuccess}><Save size={18} /></button>
                       <button onClick={cancelEdit} className={s.iconBtnDanger}><X size={18} /></button>
                     </div>
                   </td>
                  </tr>
                ) : (
                  <tr key={cat.id} className={shared.tableBodyRow}>
                    <td className={`${shared.tableCell} ${s.boldDark}`}>{cat.name_he}</td>
                    <td className={`${shared.tableCell} ${s.subText}`}>{cat.name_ar}</td>
                    <td className={shared.tableCell} style={{textAlign: 'center'}}>{cat.sort_order}</td>
                    <td className={shared.tableCell} style={{textAlign: 'center'}}><span className={shared.badgeInfo}>פעיל</span></td>
                    <td className={shared.tableCell}>
                       <div className={s.actionWrap}>
                         <button onClick={() => handleEdit(cat)} className={`${shared.iconBtn} ${s.iconBtnNeutral}`}><Edit size={18} /></button>
                         <button onClick={() => handleDelete(cat.id)} className={`${shared.iconBtn} ${shared.iconBtnDanger}`}><Trash2 size={18} /></button>
                       </div>
                    </td>
                  </tr>
                )
              ))}

              {deletedCategories.length > 0 && <tr><td colSpan="5" className={s.deletedSeparator}>קטגוריות שנמחקו (לא מוצגות בקופה)</td></tr>}
              
              {deletedCategories.map(cat => (
                <tr key={cat.id} className={`${shared.tableBodyRow} ${shared.deletedRow}`}>
                  <td className={`${shared.tableCell} ${s.boldDark} ${s.lineThrough}`}>{cat.name_he}</td>
                  <td className={`${shared.tableCell} ${s.subText} ${s.lineThrough}`}>{cat.name_ar}</td>
                  <td className={shared.tableCell} style={{textAlign: 'center'}}>{cat.sort_order}</td>
                  <td className={shared.tableCell} style={{textAlign: 'center'}}><span className={shared.badgeDanger}>נמחק</span></td>
                  <td className={shared.tableCell} style={{textAlign: 'center'}}>
                       <button onClick={() => handleEdit(cat)} className={`${shared.iconBtn} ${s.iconBtnNeutral}`} title="שחזר"><Edit size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
