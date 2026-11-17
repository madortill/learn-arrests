import React from 'react';
import './Lock.css';

import ChecklistScreen from '../ChecklistScreen/ChecklistScreen';

import lockPadlockBehind from '../../assets/parking/lock_padlock_behind.png';
import openGateIcon from '../../assets/parking/open_gate_icon.png';
import carouselArrow from '../../assets/parking/carousel_arrow.png';

const parkingAssets = import.meta.glob('../../assets/parking/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

const parkingImageMap = Object.fromEntries(
  Object.entries(parkingAssets).map(([path, url]) => [
    path.split('/').pop().toLowerCase(),
    url,
  ])
);

const getParkingImage = (name) => {
  if (!name) return null;
  return parkingImageMap[name.split('/').pop().toLowerCase()] || null;
};

export default function Lock({
  slides = [],
  isCompleted = false,
  canClose = false,
  parkingState = {},
  onParkingStateChange,
  onOpenGate,
  onClose,
}) {
  const totalSlides = slides.length;
  const currentSlide = Math.min(
    parkingState.lockSlide ?? 0,
    Math.max(0, totalSlides - 1)
  );

  const activeSlide = slides[currentSlide] || {};
  const checklistSlide = slides.find((s) => s.type === 'checklist');
  const miniItems = checklistSlide?.items || [];

  const checkedItems = isCompleted
    ? Object.fromEntries(miniItems.map((item) => [item.id, true]))
    : parkingState.lockCheckedItems || {};

  const checklistCompleted =
    miniItems.length === 0 ||
    miniItems.every((item) => Boolean(checkedItems[item.id]));

  const canGoNext =
    currentSlide < totalSlides - 1 &&
    (activeSlide.type !== 'checklist' || checklistCompleted);

  const canGoPrev = currentSlide > 0;

  const setSlide = (nextIndex) => {
    onParkingStateChange?.((prev) => ({
      ...prev,
      lockSlide: nextIndex,
    }));
  };

  const handleCheckedItemsChange = (updatedChecked) => {
    onParkingStateChange?.((prev) => ({
      ...prev,
      lockCheckedItems: updatedChecked,
    }));
  };

  const slideImageUrl = getParkingImage(activeSlide.image);

  return (
    <div className="lock-carousel-overlay" dir="rtl">
      {/* חץ חזור (ימין) - מופיע רק כשניתן לחזור */}
      {canGoPrev && (
        <button
          type="button"
          className="carousel-nav-arrow right-arrow"
          onClick={() => setSlide(currentSlide - 1)}
          aria-label="שקופית קודמת"
        >
          <img src={carouselArrow} alt="" />
        </button>
      )}

      {/* חץ קדימה (שמאל) - מופיע רק כשניתן להתקדם */}
      {canGoNext && (
        <button
          type="button"
          className="carousel-nav-arrow left-arrow"
          onClick={() => setSlide(currentSlide + 1)}
          aria-label="שקופית הבאה"
        >
          <img src={carouselArrow} alt="" />
        </button>
      )}

      <div className="lock-carousel-container">
        {/* תמונת המנעול מאחורי הדיב הצהוב */}
        <div className="lock-behind-img">
          <img src={lockPadlockBehind} alt="מנעול" />
        </div>

        <div className="lock-content-box">
          {canClose && (
            <button
              type="button"
              className="lock-close-btn"
              onClick={onClose}
              aria-label="סגירה"
            >
              &#10005;
            </button>
          )}

          <div className="lock-slide-content">
            {activeSlide.type === 'checklist' && (
              <div className="lock-slide lock-slide-checklist">
                <h2 className="lock-title">{activeSlide.title}</h2>

                <div className="lock-checklist-wrapper">
                  <ChecklistScreen
                    items={miniItems}
                    variant="mini"
                    side="center"
                    checkedItems={checkedItems}
                    onCheckedItemsChange={handleCheckedItemsChange}
                    isCompleted={isCompleted}
                  />
                </div>
              </div>
            )}

            {activeSlide.type === 'table' && (
              <div className="lock-slide lock-slide-table">
                <h2 className="lock-title">{activeSlide.title}</h2>

                {slideImageUrl && (
                  <div className="lock-table-container">
                    <img
                      src={slideImageUrl}
                      alt={activeSlide.title || 'טבלת תקן הליווי'}
                    />
                  </div>
                )}
              </div>
            )}

            {activeSlide.type === 'text' && (
              <div className="lock-slide lock-slide-opening">
                <h2 className="lock-title">{activeSlide.title}</h2>

                {activeSlide.text && (
                  <p className="lock-body-text">{activeSlide.text}</p>
                )}

                <button
                  type="button"
                  className="open-gate-btn"
                  onClick={onOpenGate}
                >
                  <span className="open-gate-btn-text">
                    {activeSlide.buttonText || 'פתח את השער'}
                  </span>
                  <img
                    src={openGateIcon}
                    alt=""
                    className="open-gate-btn-img"
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lock-dots">
          {slides.map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={currentSlide === dotIndex ? 'active' : ''}
            />
          ))}
        </div>
      </div>
    </div>
  );
}