import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ChevronLeft, Loader2, Search, X,
  MapPin, Clock, Phone, MessageCircle, Plus, Heart, Navigation
} from 'lucide-react';
import s from './Home.module.css';
import api from '../api/axios';
import logoImg from '../assets/logo-tawam-transparent.png';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';
import { useMenuMode } from '../context/MenuModeContext';
import ProductModal from '../components/ProductModal';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
const WHATSAPP_MSG = encodeURIComponent('שלום, ראיתי את התפריט באתר ואני רוצה להזמין');

const Home = () => {
  const { lang, t } = useLanguage();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { menuMode } = useMenuMode();
  const navigate = useNavigate();

  const [data, setData] = useState({
    categories: [], products: [], recommended: [],
    status: { isOpen: true }, heroConfig: null
  });
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('featured');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);

  // Auto-slide hero images
  useEffect(() => {
    if (!data.recommended || data.recommended.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % Math.min(data.recommended.length, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, [data.recommended]);

  // Listen for search toggle from BottomNavbar
  useEffect(() => {
    const handler = () => {
      setSearchOpen(prev => {
        const next = !prev;
        if (next) {
          setTimeout(() => searchInputRef.current?.focus(), 200);
        } else {
          setSearchQuery('');
        }
        return next;
      });
    };
    window.addEventListener('toggle-search', handler);
    return () => window.removeEventListener('toggle-search', handler);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, catRes, prodRes] = await Promise.all([
          api.get('/api/business-status').catch(() => ({ data: { isOpen: true } })),
          api.get('/api/categories').catch(() => ({ data: [] })),
          api.get(`/api/products?t=${Date.now()}`).catch(() => ({ data: [] }))
        ]);
        const productsData = prodRes.data?.data || prodRes.data;
        const categoriesData = catRes.data?.data || catRes.data;
        const businessData = statusRes.data?.data || statusRes.data;

        const products = Array.isArray(productsData) ? productsData : [];
        const categories = Array.isArray(categoriesData) ? categoriesData : [];
        const statusData = (businessData && typeof businessData === 'object' && !Array.isArray(businessData)) ? businessData : {};
        const recommendedProducts = products.filter(p => !!p.is_recommended);
        setData({
          categories: categories.sort((a, b) => a.sort_order - b.sort_order),
          products,
          recommended: recommendedProducts,
          status: statusData,
          heroConfig: {
            image_url: statusData.hero_image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
            badge_he: statusData.hero_badge_he || '',
            badge_ar: statusData.hero_badge_ar || '',
            title_he: statusData.hero_title_he || 'טעמים שמרגישים בבית',
            title_ar: statusData.hero_title_ar || 'نكهات تشعرك بالبيت',
            desc_he: statusData.hero_desc_he || 'תפריט עשיר, טרי ומוכן להזמנה טלפונית',
            desc_ar: statusData.hero_desc_ar || 'قائمة غنية، طازجة وجاهزة للطلب الهاتفي'
          }
        });
      } catch (err) {
        console.error('Error fetching home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('blob')) return url;
    return `${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}${url}`;
  };

  const getFilteredProducts = useCallback(() => {
    let filtered = data.products;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(p =>
        (p.name_he || '').toLowerCase().includes(q) ||
        (p.name_ar || '').toLowerCase().includes(q) ||
        (p.description_he || '').toLowerCase().includes(q)
      );
      return filtered;
    }

    if (activeCategory === 'featured') {
      return data.recommended.slice(0, 10); // 8-10 items
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => String(p.category_id) === String(activeCategory));
    }
    return filtered;
  }, [data.products, data.recommended, activeCategory, searchQuery]);

  const filteredProducts = getFilteredProducts();

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isOpen = data.status.isOpen;

  if (loading) {
    return (
      <div className={s.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ color: '#C89B3C', animation: 'spin 1s linear infinite' }} size={40} />
      </div>
    );
  }

  const hero = data.heroConfig;

  /* ── Render product card ── */
  const renderProductCard = (product, idx, isRec = false) => (
    <div
      key={product.id}
      className={s.menuCard}
      style={{ animationDelay: `${idx * 70}ms` }}
      onClick={() => setSelectedProductId(product.id)}
    >
      <div className={s.menuCardImgWrap}>
        {product.image_url ? (
          <img src={getImageUrl(product.image_url)} alt={t(product, 'name')} className={s.menuCardImg} />
        ) : (
          <div className={s.cardImgPlaceholder}><span>🍽️</span></div>
        )}
        <div className={s.menuCardImgGradient} />
        {/* Gold recommended badge for featured tab */}
        {product.is_recommended && activeCategory === 'featured' && (
          <div className={s.recBadge}>⭐ {lang === 'he' ? 'מומלץ' : 'مميز'}</div>
        )}
      </div>
      <div className={s.menuCardBody}>
        <h4 className={s.menuCardTitle}>{t(product, 'name')}</h4>
        <p className={s.menuCardDesc}>
          {t(product, 'description') || (lang === 'he' ? 'טעים ומיוחד' : 'لذيذ ومميز')}
        </p>
        <div className={s.menuCardFooter}>
          <span className={s.menuCardPrice}>₪{product.base_price}</span>
          {menuMode ? (
            <button
              className={s.cardDetailsBtn}
              onClick={e => { e.stopPropagation(); setSelectedProductId(product.id); }}
            >
              {lang === 'he' ? 'פרטים' : 'تفاصيل'}
            </button>
          ) : (
            <button
              className={s.cardAddBtn}
              onClick={e => { e.stopPropagation(); setSelectedProductId(product.id); }}
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className={s.page}>
      {/* ── HEADER ── */}
      <header className={s.header}>
        <div className={s.headerTop}>
          {/* Right: Logo */}
          <div className={s.headerRight}>
            <div className={s.crownBadge}>
              <img src={logoImg} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
          {/* Center: Brand Name + Subtitle */}
          <div className={s.headerCenter}>
            <h1 className={s.brandName}>מפגש התאומים</h1>
            <span className={s.brandSubtitle}>
              {menuMode
                ? (lang === 'he' ? 'תפריט דיגיטלי' : 'قائمة رقمية')
                : (lang === 'he' ? '— הזמנות אונליין —' : '— طلبات أونلاين —')
              }
            </span>
          </div>
          {/* Left: spacer to keep center balanced */}
          <div className={s.headerLeft} />
        </div>
      </header>

      <main className={s.mainContent}>
        {/* ── HERO BANNER ── */}
        {hero && !searchOpen && (
          <section className={s.heroSection}>
            <div className={s.heroBanner}>
              {data.recommended && data.recommended.length > 0 ? (
                data.recommended.slice(0, 5).map((rec, idx) => (
                  <img 
                    key={rec.id}
                    src={getImageUrl(rec.image_url)} 
                    alt="Hero" 
                    className={`${s.heroImg} ${idx === currentHeroIndex ? s.heroImgActive : ''}`} 
                  />
                ))
              ) : (
                <img src={getImageUrl(hero.image_url)} alt="Hero" className={`${s.heroImg} ${s.heroImgActive}`} />
              )}
              
              <div className={s.heroVignette} />
              <div className={s.heroGradient} />

              {/* New Status Badge */}
              <div className={s.heroStatusTopBadge}>
                <div className={`${s.statusDotLive} ${isOpen ? s.statusDotOpen : s.statusDotClosed}`} />
                <span>{isOpen ? (lang === 'he' ? 'פתוח עכשיו' : 'مفتوح الآن') : (lang === 'he' ? 'סגור עכשיו' : 'مغلق الآن')}</span>
              </div>

              <div className={s.heroContent}>
                <h2 className={s.heroTitle}>
                  {data.recommended && data.recommended.length > 0 ? 
                    t(data.recommended[currentHeroIndex], 'name') : 
                    (lang === 'he' ? hero.title_he : hero.title_ar)}
                </h2>
                <p className={s.heroSubtitle}>
                  {data.recommended && data.recommended.length > 0 ? 
                    t(data.recommended[currentHeroIndex], 'description') : 
                    (lang === 'he' ? hero.desc_he : hero.desc_ar)}
                </p>
                <div className={s.heroButtons}>
                  <a href={`tel:${data.status.phone_number || '0501234567'}`} className={s.heroCta}>
                    <Phone size={16} />
                    {lang === 'he' ? 'התקשר להזמנה' : 'اتصل للطلب'}
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}



        {/* ── LOCATION MODAL ── */}
        {locationModalOpen && (
          <>
            <div className={s.modalBackdrop} onClick={() => setLocationModalOpen(false)} />
            <div className={s.locationSheet}>
              <div className={s.locationSheetHandle} />
              <h3 className={s.locationSheetTitle}>
                {lang === 'he' ? 'נווט למסעדה' : 'انتقل إلى المطعم'}
              </h3>
              <div className={s.locationOptions}>
                <a
                  href={`https://www.google.com/maps?q=${data.status.lat || 32.0853},${data.status.lng || 34.7818}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.locationOption}
                  onClick={() => setLocationModalOpen(false)}
                >
                  <div className={s.locationOptionIcon}>
                    <MapPin size={20} />
                  </div>
                  <span>{lang === 'he' ? 'פתח ב־Google Maps' : 'افتح في خرائط Google'}</span>
                </a>
                <a
                  href={`https://waze.com/ul?ll=${data.status.lat || 32.0853},${data.status.lng || 34.7818}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.locationOption}
                  onClick={() => setLocationModalOpen(false)}
                >
                  <div className={s.locationOptionIcon}>
                    <Navigation size={20} />
                  </div>
                  <span>{lang === 'he' ? 'פתח ב־Waze' : 'افتح في Waze'}</span>
                </a>
              </div>
              <button className={s.locationSheetClose} onClick={() => setLocationModalOpen(false)}>
                {lang === 'he' ? 'סגור' : 'إغلاق'}
              </button>
            </div>
          </>
        )}

        {/* ── SEARCH BAR (inline, toggled) ── */}
        <div className={`${s.searchBarWrap} ${searchOpen ? s.searchBarOpen : ''}`} style={{ padding: '0 16px' }}>
          <div className={s.searchBarInner}>
            <Search size={16} className={s.searchIcon} />
            <input
              ref={searchInputRef}
              type="text"
              className={s.searchInput}
              placeholder={lang === 'he' ? 'חפש מנה, קטגוריה...' : 'ابحث عن طبق، فئة...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className={s.searchClear} onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── CATEGORY CHIPS ── */}
        <section className={s.categorySection} ref={menuRef}>
          <div className={s.categoryScroll}>
            <button
              className={`${s.categoryChip} ${activeCategory === 'featured' ? s.activeCategoryChip : ''}`}
              onClick={() => setActiveCategory('featured')}
            >
              ⭐ {lang === 'he' ? 'מומלצים' : 'المميزة'}
            </button>
            {data.categories.map(cat => (
              <button
                key={cat.id}
                className={`${s.categoryChip} ${activeCategory === cat.id ? s.activeCategoryChip : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {t(cat, 'name')}
              </button>
            ))}
          </div>
        </section>

        {/* ── FULL MENU GRID ── */}
        <section className={s.menuSection}>
          <div className={s.sectionHeader}>
            <div className={s.recHeader}>
              <h3 className={s.recTitle}>
                {searchQuery
                  ? (lang === 'he' ? 'תוצאות חיפוש' : 'نتائج البحث')
                  : activeCategory === 'featured'
                    ? (lang === 'he' ? 'המומלצים שלנו' : 'أطباقنا المميزة')
                    : (data.categories.find(c => c.id === activeCategory)?.[`name_${lang}`] || '')
                }
              </h3>
            </div>
          </div>

            {filteredProducts.length === 0 ? (
              <div className={s.emptyState}>
                <Search size={40} strokeWidth={1} className={s.emptyIcon} />
                <p className={s.emptyText}>{lang === 'he' ? 'לא נמצאו תוצאות' : 'لم يتم العثور على نتائج'}</p>
              </div>
            ) : (
              <div className={s.menuGrid}>
                {filteredProducts.map((product, idx) => renderProductCard(product, idx, false))}
              </div>
            )}
          </section>
      </main>


      {/* Product Modal */}
      {selectedProductId && (
        <ProductModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
};

export default Home;