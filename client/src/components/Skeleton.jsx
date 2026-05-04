import React from 'react';
import s from './Skeleton.module.css';

export const ShimmerLine = ({ width = '100%', height = '12px', radius = '4px', className = '' }) => (
  <div className={`${s.shimmer} ${className}`} style={{ width, height, borderRadius: radius }} />
);

export const SkeletonCard = () => (
  <div className={s.card}>
    <div className={`${s.imgWrap} ${s.shimmer}`} />
    <div className={s.btnPlaceholder} />
    <div className={s.body}>
      <ShimmerLine width="70%" height="16px" />
      <ShimmerLine width="45%" height="12px" />
      <div className={s.footer}>
        <ShimmerLine width="30px" height="18px" />
      </div>
    </div>
  </div>
);

export const SkeletonFeatured = () => (
  <div className={s.featured}>
    <div className={`${s.featImgWrap} ${s.shimmer}`} />
    <div className={s.featBody}>
      <ShimmerLine width="80%" height="20px" className={s.mb2} />
      <ShimmerLine width="50%" height="14px" className={s.flex1} />
      <div className={s.featFooter}>
        <ShimmerLine width="50px" height="22px" />
        <div className={s.featBtnPlaceholder} />
      </div>
    </div>
  </div>
);

export const SkeletonCategory = () => (
  <div className={s.category}>
    <div className={`${s.catIcon} ${s.shimmer}`} />
    <ShimmerLine width="80%" height="10px" />
  </div>
);

export const SkeletonHero = () => (
  <div className={s.hero}>
    <div className={s.heroContent}>
      <ShimmerLine width="80px" height="24px" radius="99px" className={s.mb3} />
      <ShimmerLine width="60%" height="32px" className={s.mb2} />
      <ShimmerLine width="40%" height="16px" />
    </div>
  </div>
);
