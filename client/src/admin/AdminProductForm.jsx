import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../api/axios';
import { ArrowRight, Image as ImageIcon, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import s from './AdminProductForm.module.css';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!id;

  const preloadedProduct = location.state?.product || null;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name_he: '',
    name_ar: '',
    description_he: '',
    description_ar: '',
    base_price: '',
    category_id: '',
    is_active: '1',
    is_available: '1',
    is_recommended: '0'
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Options State
  const [optionGroups, setOptionGroups] = useState([]);
  const [deletedGroups, setDeletedGroups] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.get('/api/categories');
        setCategories(catRes.data?.data || catRes.data);

        if (isEdit) {
          let p = preloadedProduct;
          if (!p) {
             const res = await api.get('/api/products/' + id);
             p = res.data?.data || res.data;
          }
          setFormData({
            name_he: p.name_he || '',
            name_ar: p.name_ar || '',
            description_he: p.description_he || '',
            description_ar: p.description_ar || '',
            base_price: p.base_price || '',
            category_id: p.category_id || (catRes.data.length > 0 ? catRes.data[0].id : ''),
            is_active: p.is_active?.toString() || '1',
            is_available: p.is_available?.toString() || '1',
            is_recommended: p.is_recommended?.toString() || '0'
          });
          if (p.image_url) {
            setImagePreview(`${import.meta.env.VITE_API_URL}${p.image_url}?v=${p.updated_at || Date.now()}`);
          }

          // Fetch options
          const [groupsRes, itemsRes] = await Promise.all([
             api.get('/api/admin/option-groups').catch(() => ({data:[]})),
             api.get('/api/admin/option-items').catch(() => ({data:[]}))
          ]);

          const gData = groupsRes.data?.data || groupsRes.data || [];
          const iData = itemsRes.data?.data || itemsRes.data || [];
          const productGroups = gData.filter(g => g.product_id === parseInt(id) && g.is_active === 1);
          const formattedGroups = productGroups.map(g => ({
             ...g,
             is_required: Boolean(g.is_required),
             items: iData.filter(i => i.group_id === g.id && i.is_active === 1).sort((a,b) => a.sort_order - b.sort_order)
          })).sort((a,b) => a.sort_order - b.sort_order);

          setOptionGroups(formattedGroups);

        } else {
           if (catRes.data.length > 0) {
             setFormData(prev => ({ ...prev, category_id: catRes.data[0].id }));
           }
        }
      } catch (err) {
        console.error(err);
        setError('שגיאה בטעינת נתונים');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit, preloadedProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Option Handlers
  const addGroup = () => {
    setOptionGroups(prev => [...prev, {
      id: null, name_he: '', name_ar: '', selection_type: 'single', is_required: false, min_select: 0, max_select: 1, 
      items: [{ id: null, name_he: '', name_ar: '', price_change: '' }]
    }]);
  };

  const removeGroup = (index) => {
    const group = optionGroups[index];
    if (group.id) setDeletedGroups(prev => [...prev, group.id]);
    setOptionGroups(prev => prev.filter((_, i) => i !== index));
  };

  const updateGroup = (gIndex, field, value) => {
    setOptionGroups(prev => {
      const next = [...prev];
      next[gIndex] = { ...next[gIndex], [field]: value };
      return next;
    });
  };

  const addItem = (groupIndex) => {
    setOptionGroups(prev => {
      const next = [...prev];
      next[groupIndex].items.push({ id: null, name_he: '', name_ar: '', price_change: '' });
      return next;
    });
  };

  const removeItem = (groupIndex, itemIndex) => {
    const item = optionGroups[groupIndex].items[itemIndex];
    if (item.id) setDeletedItems(prev => [...prev, item.id]);
    setOptionGroups(prev => {
      const next = [...prev];
      next[groupIndex].items = next[groupIndex].items.filter((_, i) => i !== itemIndex);
      return next;
    });
  };

  const updateItem = (gIndex, iIndex, field, value) => {
    setOptionGroups(prev => {
      const next = [...prev];
      next[gIndex].items[iIndex] = { ...next[gIndex].items[iIndex], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!formData.name_he || !formData.name_ar || !formData.base_price || !formData.category_id) {
       setError('יש למלא את כל שדות החובה (*)');
       setSaving(false);
       return;
    }

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        payload.append(key, val);
      });
      
      if (imageFile) {
        payload.append('image', imageFile);
      }

      let currentProductId = id;

      if (isEdit) {
        await api.put('/api/admin/products/' + currentProductId, payload);
      } else {
        const res = await api.post('/api/admin/products', payload);
        currentProductId = res.data?.id || res.data;
      }

      // Handle Option Deletions
      for (const dId of deletedGroups) await api.delete('/api/admin/option-groups/' + dId).catch(console.error);
      for (const dId of deletedItems) await api.delete('/api/admin/option-items/' + dId).catch(console.error);

      // Save Groups and Items
      for (let gIdx = 0; gIdx < optionGroups.length; gIdx++) {
        const group = optionGroups[gIdx];
        const groupPayload = {
          product_id: currentProductId,
          name_he: group.name_he,
          name_ar: group.name_ar,
          selection_type: group.selection_type,
          is_required: group.is_required,
          min_select: group.min_select,
          max_select: group.max_select,
          sort_order: gIdx,
          is_active: true
        };

        let savedGroupId = group.id;

        if (savedGroupId) {
          await api.put('/api/admin/option-groups/' + savedGroupId, groupPayload);
        } else {
          const res = await api.post('/api/admin/option-groups', groupPayload);
          savedGroupId = res.data?.id || res.data;
        }

        for (let iIdx = 0; iIdx < group.items.length; iIdx++) {
          const item = group.items[iIdx];
          const itemPayload = {
            group_id: savedGroupId,
            name_he: item.name_he,
            name_ar: item.name_ar,
            price_change: item.price_change || 0,
            sort_order: iIdx,
            is_active: true
          };

          if (item.id) {
            await api.put('/api/admin/option-items/' + item.id, itemPayload);
          } else {
            await api.post('/api/admin/option-items', itemPayload);
          }
        }
      }
      
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'שגיאה בשמירת המוצר');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{display: 'flex', justifyContent: 'center', padding: '2.5rem'}}><Loader2 className="animate-spin" color="#c9a84c" size={32} /></div>;

  return (
    <div className={s.wrapper}>
      <button onClick={() => navigate('/admin/products')} className={s.backBtn}>
        <ArrowRight size={20} /> חזור למוצרים
      </button>

      <h2 className={s.pageTitle}>
        {isEdit ? 'עריכת מוצר' : 'הוספת מוצר חדש'}
      </h2>

      <div className={s.formCard}>
        <form onSubmit={handleSubmit} className={s.form}>
          
          {/* Header Row (Image + Core) */}
          <div className={s.headerRow}>
             
             {/* Image Upload Box */}
             <div className={s.imgUploadGroup}>
                <label className={s.label}>תמונת מוצר</label>
                <div onClick={() => fileInputRef.current?.click()} className={s.imgUploadBox}>
                   {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className={s.imgPreview} />
                        <div className={s.imgOverlay}>החלף תמונה</div>
                      </>
                   ) : (
                      <div className={s.imgPlaceholder}>
                         <ImageIcon size={32} />
                         <span style={{fontSize: '0.875rem', fontWeight: 500}}>בחר תמונה</span>
                      </div>
                   )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" style={{display: 'none'}} />
             </div>

             {/* Core Fields */}
             <div className={s.coreFields}>
                <div className={s.fieldGrid}>
                   <div>
                      <label className={s.label}>שם מוצר (עברית) *</label>
                      <input required name="name_he" value={formData.name_he} onChange={handleChange} className={s.inputField} />
                   </div>
                   <div dir="rtl">
                      <label className={s.label}>שם מוצר (ערבית) *</label>
                      <input required name="name_ar" value={formData.name_ar} onChange={handleChange} dir="rtl" className={s.inputField} placeholder="اسم المنتج" />
                   </div>
                </div>

                <div className={s.fieldGrid}>
                   <div>
                      <label className={s.label}>מחיר אשף * (₪)</label>
                      <input type="number" step="0.01" min="0" required name="base_price" value={formData.base_price} onChange={handleChange} className={s.inputField} style={{direction: 'ltr', textAlign: 'right'}} />
                   </div>
                   <div>
                      <label className={s.label}>קטגוריה *</label>
                      <select required name="category_id" value={formData.category_id} onChange={handleChange} className={s.inputField} style={{backgroundColor: '#fff'}}>
                         {categories.map(c => <option key={c.id} value={c.id}>{c.name_he}</option>)}
                      </select>
                   </div>
                </div>
             </div>
          </div>

          <hr className={s.divider} />

          {/* Details */}
          <div className={s.fieldGrid}>
             <div>
                <label className={s.label}>תיאור קצר (עברית)</label>
                <textarea name="description_he" value={formData.description_he} onChange={handleChange} rows="3" className={s.inputField} style={{resize: 'none'}} />
             </div>
             <div>
                <label className={s.label}>תיאור קצר (ערבית)</label>
                <textarea name="description_ar" value={formData.description_ar} onChange={handleChange} rows="3" dir="rtl" className={s.inputField} style={{resize: 'none', textAlign: 'right'}} />
             </div>
          </div>

          <hr className={s.divider} />

          {/* Options & Add-ons */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
             <div className={s.groupHeader}>
                <h3 className={s.groupTitle}>אפשרויות ותוספות (Option Groups)</h3>
                <button type="button" onClick={addGroup} className={s.btnDarkSmall}>
                   <Plus size={16} /> קבוצה חדשה
                </button>
             </div>

             {optionGroups.length === 0 ? (
                <div className={s.emptyGroups}>
                   אין קבוצות אפשרויות. לחץ על הוסף כדי להוסיף תוספות למוצר.
                </div>
             ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                   {optionGroups.map((group, gIndex) => (
                      <div key={gIndex} className={s.groupCard}>
                         <div className={s.groupCardHeader}>
                            <div className={s.groupHeadingWrap}>
                               <h4 className={s.groupHeading}>
                                  <GripVertical size={18} color="#94a3b8" style={{cursor: 'move'}} /> 
                                  קבוצה #{gIndex + 1}
                               </h4>
                               <button type="button" onClick={() => removeGroup(gIndex)} className={s.iconBtnDanger}>
                                  <Trash2 size={18} />
                               </button>
                            </div>
                            <div className={s.groupInputsGrid}>
                               <input placeholder="שם קבוצה (עברית) *" value={group.name_he} onChange={(e) => updateGroup(gIndex, 'name_he', e.target.value)} required className={s.optionInput} />
                               <input placeholder="שם קבוצה (ערבית) *" value={group.name_ar} onChange={(e) => updateGroup(gIndex, 'name_ar', e.target.value)} required className={s.optionInput} dir="rtl" />
                               
                               <select value={group.selection_type} onChange={(e) => updateGroup(gIndex, 'selection_type', e.target.value)} className={s.optionInput}>
                                  <option value="single">בחירה יחידה</option>
                                  <option value="multiple">בחירה מרובה</option>
                               </select>

                               <div className={s.rangeWrap}>
                                  <span style={{fontSize:'0.875rem'}}>מ-</span>
                                  <input type="number" min="0" value={group.min_select} onChange={(e) => updateGroup(gIndex, 'min_select', e.target.value)} className={s.rangeInput} />
                                  <span style={{fontSize:'0.875rem'}}>עד</span>
                                  <input type="number" min="1" value={group.max_select} onChange={(e) => updateGroup(gIndex, 'max_select', e.target.value)} className={s.rangeInput} />
                               </div>
                            </div>
                            <div className={s.checkboxWrap}>
                               <input type="checkbox" checked={group.is_required} onChange={(e) => updateGroup(gIndex, 'is_required', e.target.checked)} id={`req-${gIndex}`} />
                               <label htmlFor={`req-${gIndex}`} className={s.checkboxLabel}>קבוצת חובה (הלקוח חייב לבחור כדי להוסיף לעגלה)</label>
                            </div>
                         </div>
                         
                         <div className={s.groupItems}>
                            {group.items.map((item, iIndex) => (
                               <div key={iIndex} className={s.itemRow}>
                                  <GripVertical size={16} color="#cbd5e1" />
                                  <input placeholder="שם פריט (עברית) *" value={item.name_he} onChange={(e) => updateItem(gIndex, iIndex, 'name_he', e.target.value)} required className={s.optionInput} style={{flex:1, minWidth: '120px'}} />
                                  <input placeholder="שם פריט (ערבית) *" value={item.name_ar} onChange={(e) => updateItem(gIndex, iIndex, 'name_ar', e.target.value)} required className={s.optionInput} style={{flex:1, minWidth: '120px'}} dir="rtl" />
                                  <div className={s.priceWrap}>
                                     <span style={{color: '#64748b', fontSize: '0.875rem'}}>₪ תוספת מחיר</span>
                                     <input type="number" step="0.01" min="0" placeholder="0" value={item.price_change} onChange={(e) => updateItem(gIndex, iIndex, 'price_change', e.target.value)} className={s.priceInput} dir="ltr" />
                                  </div>
                                  <button type="button" onClick={() => removeItem(gIndex, iIndex)} className={s.iconBtnDanger}>
                                     <Trash2 size={18} />
                                  </button>
                               </div>
                            ))}
                            <button type="button" onClick={() => addItem(gIndex)} className={s.addItemBtn}>
                               <Plus size={16} /> הוסף פריט
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>

          <hr className={s.divider} />

          {/* Toggles */}
          <div className={s.togglesBox}>
             <label className={s.toggleLabel}>
                <input 
                  type="checkbox" 
                  checked={formData.is_available === '1'} 
                  onChange={(e) => setFormData(p => ({ ...p, is_available: e.target.checked ? '1' : '0' }))}
                  className={s.checkboxLg} style={{accentColor: '#059669'}}
                />
                זמין כעת בקופה?
             </label>

             <label className={s.toggleLabel}>
                <input 
                  type="checkbox" 
                  checked={formData.is_recommended === '1'} 
                  onChange={(e) => setFormData(p => ({ ...p, is_recommended: e.target.checked ? '1' : '0' }))}
                  className={s.checkboxLg} style={{accentColor: '#d97706'}}
                />
                מומלץ (יופיע במסך הבית)
             </label>

             <label className={s.toggleLabel}>
                <input 
                  type="checkbox" 
                  checked={formData.is_active === '1'} 
                  onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked ? '1' : '0' }))}
                  className={s.checkboxLg} style={{accentColor: '#2563eb'}}
                />
                פעיל במערכת (הסרת סימון תמחק לוגית)
             </label>
          </div>

          {error && <p className={s.errorMsg}>{error}</p>}

          <button type="submit" disabled={saving} className={s.submitBtn}>
            {saving ? 'שומר נתונים...' : (isEdit ? 'שמור מוצר ותוספות' : 'צור מוצר חדש')}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
