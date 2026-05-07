import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Image as ImageIcon, Loader2, Save } from 'lucide-react';
import s from './AdminHeroConfig.module.css';

const AdminHeroConfig = () => {
  const [formData, setFormData] = useState({
    hero_title_he: '',
    hero_title_ar: '',
    hero_desc_he: '',
    hero_desc_ar: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/admin/settings');
      const resData = res.data;
      if (resData.data) {
        const data = resData.data;
        setFormData({
          hero_title_he: data.hero_title_he || '',
          hero_title_ar: data.hero_title_ar || '',
          hero_desc_he: data.hero_desc_he || '',
          hero_desc_ar: data.hero_desc_ar || ''
        });
        if (data.hero_image_url) {
          setPreview(`${import.meta.env.VITE_API_URL}${data.hero_image_url}`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => fd.append(key, formData[key]));
      if (imageFile) {
        fd.append('hero_image', imageFile);
      }
      
      const res = await api.patch('/api/admin/settings/hero', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const resData = res.data;
      alert('הגדרות מתחב עודכנו בהצלחה!');
      if (resData.hero_image_url) {
        setPreview(`${import.meta.env.VITE_API_URL}${resData.hero_image_url}`);
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'שגיאה בשמירת שינויים';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{display:'flex',justifyContent:'center',padding:'2.5rem'}}><Loader2 className="animate-spin" color="#c9a84c" size={32} /></div>;
  }

  return (
    <div className={s.card}>
      <h3 className={s.title}>
        <ImageIcon color="#c9a84c" size={28} />
        עריכת אזור HERO (תמונה עליונה)
      </h3>

      <form onSubmit={handleSubmit} className={s.form}>
        <div className={s.columns}>
          
          <div className={s.col}>
            <h4 className={s.sectionTitle}>עברית (Hebrew)</h4>

            <div className={s.inputGroup}>
              <label className={s.label}>כותרת ראשית</label>
              <input type="text" name="hero_title_he" value={formData.hero_title_he} onChange={handleTextChange} className={s.inputField} />
            </div>
            <div className={s.inputGroupStretch}>
              <label className={s.label}>תיאור</label>
              <textarea name="hero_desc_he" value={formData.hero_desc_he} onChange={handleTextChange} className={s.textareaField} rows="2"></textarea>
            </div>
          </div>

          <div className={s.col}>
            <h4 className={s.sectionTitle}>ערבית (Arabic)</h4>

            <div dir="rtl" className={s.inputGroup}>
              <label className={s.label}>כותרת ראשית</label>
              <input type="text" name="hero_title_ar" value={formData.hero_title_ar} onChange={handleTextChange} className={s.inputField} />
            </div>
            <div dir="rtl" className={s.inputGroupStretch}>
              <label className={s.label}>תיאור</label>
              <textarea name="hero_desc_ar" value={formData.hero_desc_ar} onChange={handleTextChange} className={s.textareaField} rows="2"></textarea>
            </div>
          </div>

        </div>

        <div className={s.mediaSection}>
          <label className={s.label}>תמונת רקע HERO</label>
          <div className={s.mediaFlex}>
            <div className={s.previewBox}>
              {preview ? (
                <img src={preview} alt="Hero Preview" className={s.previewImg} />
              ) : (
                <ImageIcon color="#94a3b8" size={32} />
              )}
            </div>
            <div className={s.fileInputWrap}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={s.fileInput}
              />
            </div>
          </div>
        </div>

        <div className={s.footer}>
          <button 
            type="submit" 
            disabled={saving} 
            className={s.saveBtn}
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            שמור הגדרות HERO
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHeroConfig;
