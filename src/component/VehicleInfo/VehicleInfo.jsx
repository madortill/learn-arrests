import React from 'react';
import './VehicleInfo.css';

import ChecklistScreen from '../ChecklistScreen/ChecklistScreen';
import SpeechBubble from '../SpeechBubble/SpeechBubble';
import continueIcon from '../../assets/parking/continue_icon.png';
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

// ==========================================
// 1. מיניבוס אזרחי - 20 מושבים (7 עמודות × 8 תתי-שורות)
// ==========================================
const MINIBUS_SEATS = [
  { id: 'mb_1', label: 'מלווה', col: 1, row: '1 / 3' },
  { id: 'mb_2', label: 'מלווה', col: 1, row: '3 / 5' },
  { id: 'mb_3', label: 'מלווה', col: 1, row: '5 / 7' },
  { id: 'mb_4', label: 'מלווה', col: 1, row: '7 / 9' },

  { id: 'mb_5', label: 'כלוא', col: 2, row: '1 / 3' },
  { id: 'mb_6', label: 'כלוא', col: 2, row: '3 / 5' },

  { id: 'mb_7', label: 'כלוא', col: 3, row: '1 / 3' },
  { id: 'mb_8', label: 'כלוא', col: 3, row: '3 / 5' },
  { id: 'mb_9', label: 'מלווה', col: 3, row: '7 / 9' },

  { id: 'mb_10', label: 'כלוא', col: 4, row: '1 / 3' },
  { id: 'mb_11', label: 'כלוא', col: 4, row: '3 / 5' },
  { id: 'mb_12', label: 'מלווה', col: 4, row: '7 / 9' },

  { id: 'mb_13', label: 'כלוא', col: 5, row: '1 / 3' },
  { id: 'mb_14', label: 'כלוא', col: 5, row: '3 / 5' },
  { id: 'mb_15', label: 'מלווה', col: 5, row: '7 / 9' },

  { id: 'mb_16', label: 'מלווה', col: 6, row: '1 / 3' },
  { id: 'mb_17', label: 'מלווה', col: 6, row: '3 / 5' },
  { id: 'mb_18', label: 'מלווה', col: 6, row: '7 / 9' },

  { id: 'mb_19', label: 'נהג', col: 7, row: '2 / 4' },
  { id: 'mb_20', label: 'מפקד\nמשימה', col: 7, row: '6 / 8' },
];

// ==========================================
// 2. רכב 9 מקומות - 8 מושבים (3×3)
// ==========================================
const NINE_SEATER_SEATS = [
  { id: 'ns_1', label: 'כלוא', col: 1, row: 1 },
  { id: 'ns_2', label: 'כלוא', col: 1, row: 2 },
  { id: 'ns_3', label: 'מלווה', col: 1, row: 3 },

  { id: 'ns_4', label: 'מלווה', col: 2, row: 1 },
  { id: 'ns_5', label: 'כלוא', col: 2, row: 2 },
  { id: 'ns_6', label: 'מלווה', col: 2, row: 3 },

  { id: 'ns_7', label: 'נהג', col: 3, row: 1 },
  { id: 'ns_8', label: 'מפקד\nמשימה', col: 3, row: 3 },
];

// ==========================================
// 3. קיה סורנטו - 4 מושבים (2×2 עם כלוב מקווקו)
// ==========================================
const SORENTO_CAGE_SEATS = [
  { id: 'sr_1', label: 'כלוא' },
  { id: 'sr_2', label: 'כלוא' },
];

const SORENTO_FRONT_SEATS = [
  { id: 'sr_3', label: 'נהג' },
  { id: 'sr_4', label: 'מפקד\nמשימה' },
];

function getSeatsForLayout(layoutType) {
  if (layoutType === 'minibus') return MINIBUS_SEATS;
  if (layoutType === 'nine-seater') return NINE_SEATER_SEATS;
  if (layoutType === 'sorento') {
    return [...SORENTO_CAGE_SEATS, ...SORENTO_FRONT_SEATS];
  }
  return [];
}

function SeatPill({ seat, isFlipped, onReveal, hasOutline = false }) {
  return (
    <div
      className={`seat-card ${isFlipped ? 'is-flipped' : ''} ${
        hasOutline ? 'seat-outlined' : ''
      }`}
      style={
        seat.col
          ? {
              gridColumn: seat.col,
              gridRow: seat.row,
            }
          : undefined
      }
      onMouseEnter={() => onReveal(seat.id)}
      onClick={() => onReveal(seat.id)}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? seat.label : 'מושב'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onReveal(seat.id);
        }
      }}
    >
      <div className="seat-inner">
        <div className="seat-front">
          <span className="seat-label-text">מושב</span>
        </div>
        <div className="seat-back">
          <span className="seat-label-text">{seat.label}</span>
        </div>
      </div>
    </div>
  );
}

export default function VehicleInfo({
  vehicle,
  vehicleProgress = {},
  onVehicleProgressChange,
  onCloseVehicle,
  onFinishVehicle,
}) {
  const slides = vehicle?.slides || [];
  const totalSlides = slides.length;

  const currentSlide = Math.min(
    vehicleProgress.slide ?? 0,
    Math.max(0, totalSlides - 1)
  );

  const activeSlide = slides[currentSlide] || {};
  const textSlide = slides.find((s) => s.type === 'text') || activeSlide;

  const checkedItems = vehicleProgress.checkedItems || {};
  const flippedSeats = vehicleProgress.flippedSeats || {};

  // בדיקת השלמת צ'קליסט
  const checklistItems =
    activeSlide.type === 'checklist' ? activeSlide.items || [] : [];

  const checklistCompleted =
    checklistItems.length === 0 ||
    checklistItems.every((item) => Boolean(checkedItems[item.id]));

  // בדיקת חשיפת כל המושבים
  const layoutType = activeSlide.layoutType;
  const activeSeats =
    activeSlide.type === 'seats' ? getSeatsForLayout(layoutType) : [];

  const allSeatsFlipped =
    activeSeats.length === 0 ||
    activeSeats.every((seat) => Boolean(flippedSeats[seat.id]));

  const isLastSlide = currentSlide === totalSlides - 1;

  const canGoPrev = currentSlide > 0;
  const canGoNext =
    currentSlide < totalSlides - 1 &&
    (activeSlide.type !== 'checklist' || checklistCompleted);

  const showBackToLotButton =
    isLastSlide &&
    (activeSlide.type !== 'seats' || allSeatsFlipped) &&
    (activeSlide.type !== 'checklist' || checklistCompleted);

  const handlePrevSlide = () => {
    if (!canGoPrev) return;
    onVehicleProgressChange?.((prev) => ({
      ...prev,
      slide: currentSlide - 1,
    }));
  };

  const handleNextSlide = () => {
    if (!canGoNext) return;
    onVehicleProgressChange?.((prev) => ({
      ...prev,
      slide: currentSlide + 1,
    }));
  };

  const handleCheckedItemsChange = (updatedChecked) => {
    onVehicleProgressChange?.((prev) => ({
      ...prev,
      checkedItems: updatedChecked,
    }));
  };

  const handleSeatReveal = (seatId) => {
    if (flippedSeats[seatId]) return;
    onVehicleProgressChange?.((prev) => ({
      ...prev,
      flippedSeats: {
        ...(prev.flippedSeats || {}),
        [seatId]: true,
      },
    }));
  };

  const activeVehicleImgSrc = getParkingImage(vehicle?.image);
  const vehiclePlacementClass =
    vehicle?.id === 'v1'
      ? 'car-pos-v1'
      : vehicle?.id === 'v2'
      ? 'car-pos-v2'
      : vehicle?.id === 'v3'
      ? 'car-pos-v3'
      : 'car-pos-v4';

  return (
    <div className="vehicle-info-overlay" dir="rtl">
      {/* תמונת הרכב הנבחר (z-index: 15 - מתחת למבנה הרכב ולצ'קליסט) */}
      {activeVehicleImgSrc && (
        <img
          src={activeVehicleImgSrc}
          alt={vehicle?.name || ''}
          className={`vehicle-active-car-img ${vehiclePlacementClass}`}
        />
      )}

      {/* חץ חזור (ימין) - מופיע רק כשניתן לחזור */}
      {canGoPrev && (
        <button
          type="button"
          className="carousel-nav-arrow right-arrow"
          onClick={handlePrevSlide}
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
          onClick={handleNextSlide}
          aria-label="שקופית הבאה"
        >
          <img src={carouselArrow} alt="" />
        </button>
      )}

      <div className="vehicle-info-stage">
        {/* הדיב הצהוב (1270px במסך 1440x1024) */}
        <div className="vehicle-info-modal">
          {/* רקע הדיב הצהוב (z-index: 1) */}
          <div className="vehicle-yellow-bg" aria-hidden="true" />

          {/* כפתור סגירה X בצד ימין */}
          <button
            type="button"
            className="vehicle-close-btn"
            onClick={onCloseVehicle}
            aria-label="סגירת כרטיסיית רכב"
          >
            &#10005;
          </button>

          {activeSlide.type === 'text' ? (
            /* במצב טקסט: גובה הדיב הצהוב נקבע לפי כמות הטקסט */
            <div className="vehicle-text-flow">
              <h2 className="vehicle-title">
                {activeSlide.title || vehicle?.name}
              </h2>

              {activeSlide.subtitle && (
                <h3 className="vehicle-subtitle">{activeSlide.subtitle}</h3>
              )}

              {activeSlide.text && (
                <p className="vehicle-body-text">{activeSlide.text}</p>
              )}
            </div>
          ) : (
            /* בשקופיות צ'קליסט ומבנה רכב: הדיב הצהוב שומר על גובה זהה לשקופית הטקסט */
            <>
              {/* עוגן גובה נסתר הזהה בגובהו לשקופית הטקסט */}
              <div
                className="vehicle-text-flow vehicle-height-anchor"
                aria-hidden="true"
              >
                <h2 className="vehicle-title">
                  {textSlide.title || vehicle?.name}
                </h2>

                {textSlide.subtitle && (
                  <h3 className="vehicle-subtitle">{textSlide.subtitle}</h3>
                )}

                {textSlide.text && (
                  <p className="vehicle-body-text">{textSlide.text}</p>
                )}
              </div>

              {/* זרימה אנכית של הכותרת/טקסט ומעליהם/מתחתם מבנה הרכב עם מרווח ברור */}
              <div className="vehicle-slide-overlay-flow">
                <div className="vehicle-header-block">
                  <h2 className="vehicle-title">
                    {activeSlide.title || vehicle?.name}
                  </h2>

                  {activeSlide.subtitle && (
                    <h3 className="vehicle-subtitle">{activeSlide.subtitle}</h3>
                  )}

                  {activeSlide.type === 'seats' && activeSlide.text && (
                    <p className="vehicle-seats-text">{activeSlide.text}</p>
                  )}
                </div>

                {activeSlide.type === 'seats' && (
                  <div className="vehicle-seats-layer">
                    {/* 1. תרשים מיניבוס אזרחי */}
                    {layoutType === 'minibus' && (
                      <div className="vehicle-diagram-shell diagram-minibus">
                        <div className="minibus-grid">
                          {MINIBUS_SEATS.map((seat) => (
                            <SeatPill
                              key={seat.id}
                              seat={seat}
                              isFlipped={Boolean(flippedSeats[seat.id])}
                              onReveal={handleSeatReveal}
                              hasOutline={true}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. תרשים רכב 9 מקומות */}
                    {layoutType === 'nine-seater' && (
                      <div className="vehicle-diagram-shell diagram-nine-seater">
                        <div className="car-door door-top door-nine-top" />

                        <div className="nine-seater-grid">
                          {NINE_SEATER_SEATS.map((seat) => (
                            <SeatPill
                              key={seat.id}
                              seat={seat}
                              isFlipped={Boolean(flippedSeats[seat.id])}
                              onReveal={handleSeatReveal}
                            />
                          ))}
                        </div>

                        <div className="car-door door-bottom door-nine-bottom-mid" />
                        <div className="car-door door-bottom door-nine-bottom-front" />
                      </div>
                    )}

                    {/* 3. תרשים רכב קיה סורנטו */}
                    {layoutType === 'sorento' && (
                      <div className="vehicle-diagram-shell diagram-sorento">
                        <div className="car-door door-top door-sorento-top" />

                        <div className="sorento-grid">
                          <div className="sorento-cage-box">
                            {SORENTO_CAGE_SEATS.map((seat) => (
                              <SeatPill
                                key={seat.id}
                                seat={seat}
                                isFlipped={Boolean(flippedSeats[seat.id])}
                                onReveal={handleSeatReveal}
                              />
                            ))}
                          </div>

                          <div className="sorento-front-col">
                            {SORENTO_FRONT_SEATS.map((seat) => (
                              <SeatPill
                                key={seat.id}
                                seat={seat}
                                isFlipped={Boolean(flippedSeats[seat.id])}
                                onReveal={handleSeatReveal}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="car-door door-bottom door-sorento-bottom-cage" />
                        <div className="car-door door-bottom door-sorento-bottom-front" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* צ'קליסט רגיל במרכז בגודלו הטבעי עם מנגנון הגלילה הקיים */}
      {activeSlide.type === 'checklist' && (
        <div className="vehicle-checklist-fullscreen-layer">
          <ChecklistScreen
            items={checklistItems}
            variant="default"
            side="center"
            checkedItems={checkedItems}
            onCheckedItemsChange={handleCheckedItemsChange}
          />
        </div>
      )}

      {/* 3 נקודות הקרוסלה - מחוץ לדיב הצהוב */}
      {totalSlides > 1 && (
        <div className="vehicle-carousel-dots">
          {slides.map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={currentSlide === dotIndex ? 'active' : ''}
            />
          ))}
        </div>
      )}

      {/* כפתור חזרה למגרש - מחוץ לדיב הצהוב */}
      {showBackToLotButton && (
        <button
          type="button"
          className="vehicle-continue-btn"
          onClick={onFinishVehicle}
        >
          <span className="vehicle-continue-btn-text">חזרה למגרש</span>
          <img
            src={continueIcon}
            alt=""
            className="vehicle-continue-btn-icon"
          />
        </button>
      )}

      {/* בועת דיבור ממורכזת מעל הכרטיסייה אם הוגדרה בשקופית */}
      {activeSlide.speechBubble && (
        <SpeechBubble
          {...activeSlide.speechBubble}
          centered={true}
          zIndex={40}
        />
      )}
    </div>
  );
}