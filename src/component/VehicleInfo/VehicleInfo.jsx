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

// ברירות מחדל לסידור המושבים במידה ולא הוגדרו ב-JSON
const DEFAULT_MINIBUS_SEATS = [
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

const DEFAULT_NINE_SEATER_SEATS = [
  { id: 'ns_1', label: 'כלוא', col: 1, row: 1 },
  { id: 'ns_2', label: 'כלוא', col: 1, row: 2 },
  { id: 'ns_3', label: 'מלווה', col: 1, row: 3 },
  { id: 'ns_4', label: 'מלווה', col: 2, row: 1 },
  { id: 'ns_5', label: 'כלוא', col: 2, row: 2 },
  { id: 'ns_6', label: 'מלווה', col: 2, row: 3 },
  { id: 'ns_7', label: 'נהג', col: 3, row: 1 },
  { id: 'ns_8', label: 'מפקד\nמשימה', col: 3, row: 3 },
];

const DEFAULT_SORENTO_CAGE_SEATS = [
  { id: 'sr_1', label: 'כלוא' },
  { id: 'sr_2', label: 'כלוא' },
];

const DEFAULT_SORENTO_FRONT_SEATS = [
  { id: 'sr_3', label: 'נהג' },
  { id: 'sr_4', label: 'מפקד\nמשימה' },
];

function getSlideSeatsData(slide) {
  if (!slide || slide.type !== 'seats') {
    return {
      allSeats: [],
      gridSeats: [],
      cageSeats: [],
      frontSeats: [],
      grid: null,
      doors: [],
    };
  }

  const layoutType = slide.layoutType;

  if (layoutType === 'sorento') {
    const cageSeats = slide.cageSeats || DEFAULT_SORENTO_CAGE_SEATS;
    const frontSeats = slide.frontSeats || DEFAULT_SORENTO_FRONT_SEATS;
    const doors = slide.doors || [
      { position: 'top', left: '73%' },
      { position: 'bottom', left: '38%' },
      { position: 'bottom', left: '73%' },
    ];

    return {
      allSeats: [...cageSeats, ...frontSeats],
      gridSeats: [],
      cageSeats,
      frontSeats,
      grid: null,
      doors,
    };
  }

  const defaultSeats =
    layoutType === 'minibus'
      ? DEFAULT_MINIBUS_SEATS
      : layoutType === 'nine-seater'
      ? DEFAULT_NINE_SEATER_SEATS
      : [];

  const gridSeats = slide.seats || defaultSeats;

  const defaultGrid =
    layoutType === 'minibus'
      ? { cols: 7, rows: 8 }
      : { cols: 3, rows: 3 };

  const defaultDoors =
    layoutType === 'minibus'
      ? [
          { position: 'top', left: '82%' },
          { position: 'bottom', left: '82%' },
        ]
      : [
          { position: 'top', left: '81%' },
          { position: 'bottom', left: '50%' },
          { position: 'bottom', left: '81%' },
        ];

  return {
    allSeats: gridSeats,
    gridSeats,
    cageSeats: [],
    frontSeats: [],
    grid: slide.grid || defaultGrid,
    doors: slide.doors || defaultDoors,
  };
}

function SeatPill({ seat, isFlipped, onReveal }) {
  return (
    <div
      className={`seat-card ${isFlipped ? 'is-flipped' : ''}`}
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
  vehicleMetrics = null,
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

  // נתוני סדר ישיבה
  const seatsData = getSlideSeatsData(activeSlide);
  const allSeatsFlipped =
    seatsData.allSeats.length === 0 ||
    seatsData.allSeats.every((seat) => Boolean(flippedSeats[seat.id]));

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

  // העברת המידות והמיקומים המדויקים מ-ParkingScreen
  const carDynamicVars = vehicleMetrics
    ? {
        '--measured-car-width': `${vehicleMetrics.width}px`,
        '--measured-car-left': `${vehicleMetrics.left}px`,
        '--measured-car-right': `${vehicleMetrics.right}px`,
        '--measured-car-bottom': `${vehicleMetrics.bottom}px`,
      }
    : undefined;

  const isSorentoLayout = activeSlide.layoutType === 'sorento';

  return (
    <div
      className="vehicle-info-overlay"
      style={carDynamicVars}
      dir="rtl"
    >
      {/* תמונת הרכב הנבחר: רכבים 1 ו-4 מעל הדיב הצהוב (z-index: 10), רכבים 2 ו-3 מתחתיו (z-index: 1) */}
      {activeVehicleImgSrc && (
        <img
          src={activeVehicleImgSrc}
          alt={vehicle?.name || ''}
          className={`vehicle-active-car-img ${vehiclePlacementClass}`}
        />
      )}

      {/* חץ חזור (ימין) */}
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

      {/* חץ קדימה (שמאל) */}
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
          {/* רקע הדיב הצהוב (z-index: 2 - מעל רכבים 2 ו-3 ומתחת לרכבים 1 ו-4) */}
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

              {/* זרימה אנכית של הכותרת/טקסט ומתחתיהם תרשים הישיבה */}
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
                    <div
                      className={`vehicle-diagram-shell ${
                        isSorentoLayout ? 'is-sorento-layout' : 'is-grid-layout'
                      }`}
                    >
                      {seatsData.doors.map((door, idx) => (
                        <div
                          key={idx}
                          className={`car-door ${
                            door.position === 'top' ? 'door-top' : 'door-bottom'
                          }`}
                          style={{
                            left: door.left,
                            transform: 'translateX(-50%)',
                          }}
                        />
                      ))}

                      {isSorentoLayout ? (
                        <div className="sorento-grid">
                          <div className="sorento-cage-box">
                            {seatsData.cageSeats.map((seat) => (
                              <SeatPill
                                key={seat.id}
                                seat={seat}
                                isFlipped={Boolean(flippedSeats[seat.id])}
                                onReveal={handleSeatReveal}
                              />
                            ))}
                          </div>

                          <div className="sorento-front-col">
                            {seatsData.frontSeats.map((seat) => (
                              <SeatPill
                                key={seat.id}
                                seat={seat}
                                isFlipped={Boolean(flippedSeats[seat.id])}
                                onReveal={handleSeatReveal}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="seats-dynamic-grid"
                          style={{
                            gridTemplateColumns: `repeat(${
                              seatsData.grid?.cols || 3
                            }, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${
                              seatsData.grid?.rows || 3
                            }, minmax(0, 1fr))`,
                          }}
                        >
                          {seatsData.gridSeats.map((seat) => (
                            <SeatPill
                              key={seat.id}
                              seat={seat}
                              isFlipped={Boolean(flippedSeats[seat.id])}
                              onReveal={handleSeatReveal}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* צ'קליסט מעל הכל בכל מצב */}
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

      {/* נקודות הקרוסלה מוגדלות */}
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

      {/* כפתור חזרה למגרש */}
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
          zIndex={95}
        />
      )}
    </div>
  );
}