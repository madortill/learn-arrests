
import React, { useState } from 'react';
import './VehicleInfo.css';

import ChecklistScreen from '../ChecklistScreen/ChecklistScreen';

const vehicleChecklistItems = [
  {
    id: 'vehicleCheck1',
    text: 'בדיקת תקינות הרכב'
  },
  {
    id: 'vehicleCheck2',
    text: 'בדיקת ציוד הליווי'
  },
  {
    id: 'vehicleCheck3',
    text: 'בדיקת מסמכים נדרשים'
  }
];

// המושבים של שאר הרכבים – ללא שינוי
const seatsData = [
  { id: 1, label: 'נהג' },
  { id: 2, label: 'מפקד משימה' },
  { id: 3, label: 'מושב' },
  { id: 4, label: 'מושב' },
  { id: 5, label: 'מושב' },
  { id: 6, label: 'מושב' },
  { id: 7, label: 'מושב' },
  { id: 8, label: 'מושב' },
  { id: 9, label: 'מושב' },
  { id: 10, label: 'מושב' },
  { id: 11, label: 'מושב' },
  { id: 12, label: 'מושב' },
  { id: 13, label: 'מושב' },
  { id: 14, label: 'מושב' },
  { id: 15, label: 'מושב' }
];

// 18 מקומות למלווים ברכב הראשון
// row = שורה, col = עמודה
const firstVehicleSeats = [
  // שורה ראשונה
  { id: 1, row: 1, col: 1 },
  { id: 2, row: 1, col: 2 },
  { id: 3, row: 1, col: 3 },
  { id: 4, row: 1, col: 4 },
  { id: 5, row: 1, col: 5 },
  { id: 6, row: 1, col: 6 },

  // שורה שנייה
  { id: 7, row: 2, col: 1 },
  { id: 8, row: 2, col: 2 },
  { id: 9, row: 2, col: 3 },
  { id: 10, row: 2, col: 4 },
  { id: 11, row: 2, col: 5 },
  { id: 12, row: 2, col: 6 },

  // שורה שלישית
  { id: 13, row: 3, col: 1 },

  // שורה רביעית
  { id: 14, row: 4, col: 1 },
  { id: 15, row: 4, col: 3 },
  { id: 16, row: 4, col: 4 },
  { id: 17, row: 4, col: 5 },
  { id: 18, row: 4, col: 6 }
];

export default function VehicleInfo({
  vehicleName,
  onFinishVehicle
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [flippedSeats, setFlippedSeats] = useState({});

  // זיהוי הרכב הראשון בלבד
  const isFirstVehicle = vehicleName === 'סיטרואן מ"צ';

  const checklistCompleted = vehicleChecklistItems.every(
    item => Boolean(checkedItems[item.id])
  );

  const handleNextSlide = () => {
    if (currentSlide === 1 && !checklistCompleted) return;

    setCurrentSlide(prev => Math.min(prev + 1, 2));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const handleSeatReveal = (seatId) => {
    setFlippedSeats(prev => {
      if (prev[seatId]) return prev;

      return {
        ...prev,
        [seatId]: true
      };
    });
  };

  // בחירת מערך המושבים לפי סוג הרכב
  const activeSeats = isFirstVehicle
    ? firstVehicleSeats
    : seatsData;

  const allSeatsFlipped = activeSeats.every(
    seat => Boolean(flippedSeats[seat.id])
  );

  const revealedCount = activeSeats.filter(
    seat => Boolean(flippedSeats[seat.id])
  ).length;

  return (
    <div className="vehicle-info-overlay">

      <div className="vehicle-info-modal" dir="rtl">

        <h2 className="vehicle-title">
          {vehicleName}
        </h2>

        {/* חזרה */}
        {currentSlide > 0 && (
          <button
            className="vehicle-arrow right-arrow"
            onClick={prevSlide}
            aria-label="שקופית קודמת"
          >
            &#10095;
          </button>
        )}

        <div className="vehicle-slide-body">

          {/* שקופית 1 - מידע */}
          {currentSlide === 0 && (
            <div className="vehicle-slide slide-text">

              <h3>היכרות עם הרכב</h3>

              <p>
                כאן יוצג המידע על הרכב הנבחר,
                מאפייניו והשימושים שלו במסגרת הליווי.
              </p>

            </div>
          )}

          {/* שקופית 2 - צ'קליסט */}
          {currentSlide === 1 && (
            <div className="vehicle-slide slide-checklist">

              <h3>בדיקות לפני יציאה</h3>

              <div className="vehicle-checklist-wrapper">
                <ChecklistScreen
                  items={vehicleChecklistItems}
                  variant="default"
                  checkedItems={checkedItems}
                  onCheckedItemsChange={setCheckedItems}
                />
              </div>

              {!checklistCompleted && (
                <p className="vehicle-checklist-hint">
                  יש לסמן את כל הבדיקות כדי להמשיך
                </p>
              )}

            </div>
          )}

          {/* שקופית 3 - מושבים */}
          {currentSlide === 2 && (
            <div className={`vehicle-slide slide-seats ${
              isFirstVehicle ? 'first-vehicle-seats-slide' : ''
            }`}>

              <p className="seats-instruction">
                עברו על מקומות הישיבה כדי לחשוף
                מי צריך לשבת בכל מקום.
              </p>

              <div className={`seats-beige-box ${
                isFirstVehicle ? 'first-vehicle-layout' : ''
              }`}>

                {isFirstVehicle ? (

                  /* סידור מיוחד לרכב הראשון */
                  <div className="first-vehicle-grid">

                    {firstVehicleSeats.map(seat => {
                      const isFlipped = Boolean(
                        flippedSeats[seat.id]
                      );

                      return (
                        <div
                          key={seat.id}
                          className={`seat-card first-vehicle-seat ${
                            isFlipped ? 'is-flipped' : ''
                          }`}
                          style={{
                            gridRow: seat.row,
                            gridColumn: seat.col
                          }}
                          onMouseEnter={() =>
                            handleSeatReveal(seat.id)
                          }
                          onClick={() =>
                            handleSeatReveal(seat.id)
                          }
                        >
                          <div className="seat-inner">

                            <div className="seat-front">
                              מושב
                            </div>

                            <div className="seat-back">
                              מלווה
                            </div>

                          </div>
                        </div>
                      );
                    })}

                    {/* נהג - מיקום קבוע */}
                    <div className="first-vehicle-role driver-seat">
                      נהג
                    </div>

                    {/* מפקד משימה - מיקום קבוע */}
                    <div className="first-vehicle-role commander-seat">
                      מפקד<br />משימה
                    </div>

                  </div>

                ) : (

                  /* סידור המושבים המקורי של שאר הרכבים */
                  <div className="seats-grid">

                    {seatsData.map(seat => {
                      const isFlipped = Boolean(
                        flippedSeats[seat.id]
                      );

                      return (
                        <div
                          key={seat.id}
                          className={`seat-card ${
                            isFlipped ? 'is-flipped' : ''
                          }`}
                          onMouseEnter={() =>
                            handleSeatReveal(seat.id)
                          }
                          onClick={() =>
                            handleSeatReveal(seat.id)
                          }
                        >
                          <div className="seat-inner">

                            <div className="seat-front">
                              מושב
                            </div>

                            <div className="seat-back">
                              {seat.label}
                            </div>

                          </div>
                        </div>
                      );
                    })}

                  </div>

                )}

              </div>

              <div className="seats-progress">
                {revealedCount} / {activeSeats.length}
                {' '}מקומות נחשפו
              </div>

              {allSeatsFlipped && (
                <button
                  className="vehicle-finish-btn"
                  onClick={onFinishVehicle}
                >
                  סיום ולרכב הבא
                </button>
              )}

            </div>
          )}

        </div>

        {/* הבא */}
        {currentSlide < 2 && (
          <button
            className={`vehicle-arrow left-arrow ${
              currentSlide === 1 && !checklistCompleted
                ? 'disabled'
                : ''
            }`}
            onClick={handleNextSlide}
            disabled={
              currentSlide === 1 && !checklistCompleted
            }
            aria-label="שקופית הבאה"
          >
            &#10094;
          </button>
        )}

        {/* נקודות ניווט */}
        <div className="vehicle-carousel-dots">
          {[0, 1, 2].map(dot => (
            <span
              key={dot}
              className={currentSlide === dot ? 'active' : ''}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
