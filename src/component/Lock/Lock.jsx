
import React, { useState } from 'react';
import './Lock.css';

import ChecklistScreen from '../ChecklistScreen/ChecklistScreen';
import ParkingScreen from '../ParkingScreen/ParkingScreen';

import padlock from '../../assets/padlock.png';
import tableBg from '../../assets/table_bg.png';

const miniChecklistItems = [
  { id: 'lock1', text: 'בדיקת תקינות הרכב' },
  { id: 'lock2', text: 'בדיקת ציוד הליווי' },
  { id: 'lock3', text: 'בדיקת מסמכים נדרשים' },
  { id: 'lock4', text: 'וידוא מוכנות ליציאה' }
];

export default function Lock({
  onComplete,
  onClose,
  isCompleted = false,
  completedVehicles = {},
  onCompletedVehiclesChange
}) {
  const [currentSlide, setCurrentSlide] = useState(
    isCompleted ? 2 : 0
  );

  const [showParkingScreen, setShowParkingScreen] = useState(
    isCompleted
  );

  const [checkedItems, setCheckedItems] = useState(
    isCompleted
      ? Object.fromEntries(
          miniChecklistItems.map(item => [item.id, true])
        )
      : {}
  );

  const checklistCompleted = miniChecklistItems.every(
    item => Boolean(checkedItems[item.id])
  );

  const nextSlide = () => {
    if (currentSlide === 0 && !checklistCompleted) return;

    setCurrentSlide(prev => Math.min(prev + 1, 2));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  return (
    <>
      {!showParkingScreen && (
        <div className="lock-carousel-overlay">
          <div className="lock-carousel-container">

            <div className="lock-top-img">
              <img src={padlock} alt="מנעול" />
            </div>

            <div className="lock-content-box">

              {currentSlide > 0 && (
                <button
                  className="lock-arrow right-arrow"
                  onClick={prevSlide}
                  aria-label="שקופית קודמת"
                >
                  &#10095;
                </button>
              )}

              <div className="lock-slide-content">

                {currentSlide === 0 && (
                  <div className="lock-slide lock-slide-checklist">
                    <h2>הרכב יציאה לליווי</h2>

                    <p>
                      לפני הכניסה למגרש, עברו על הציוד הנדרש.
                    </p>

                    <div className="lock-checklist-wrapper">
                      <ChecklistScreen
                        items={miniChecklistItems}
                        variant="mini"
                        checkedItems={checkedItems}
                        onCheckedItemsChange={setCheckedItems}
                      />
                    </div>

                    {!checklistCompleted && (
                      <p className="checklist-hint">
                        יש לסמן את כל הפריטים כדי להמשיך
                      </p>
                    )}
                  </div>
                )}

                {currentSlide === 1 && (
                  <div className="lock-slide lock-slide-table">
                    <h2>טבלת תקן הליווי ברכב</h2>

                    <div className="lock-table-container">
                      <img
                        src={tableBg}
                        alt="טבלת תקן הליווי"
                      />
                    </div>
                  </div>
                )}

                {currentSlide === 2 && (
                  <div className="lock-slide lock-slide-opening">
                    <h2>רכב ליווי לא מדוגם</h2>

                    <p>
                      לפני תחילת הליווי חשוב להכיר את סוגי
                      הרכבים, הציוד הנדרש ואת חלוקת מקומות
                      הישיבה בכל אחד מהם.
                    </p>

                    <button
                      className="open-gate-btn"
                      onClick={() => setShowParkingScreen(true)}
                    >
                      <img src={padlock} alt="" />
                      פתחו את השער
                    </button>
                  </div>
                )}

              </div>

              {currentSlide < 2 && (
                <button
                  className={`lock-arrow left-arrow ${
                    currentSlide === 0 && !checklistCompleted
                      ? 'disabled'
                      : ''
                  }`}
                  onClick={nextSlide}
                  disabled={
                    currentSlide === 0 && !checklistCompleted
                  }
                  aria-label="שקופית הבאה"
                >
                  &#10094;
                </button>
              )}

            </div>

            <div className="lock-dots">
              {[0, 1, 2].map(dot => (
                <span
                  key={dot}
                  className={currentSlide === dot ? 'active' : ''}
                />
              ))}
            </div>

          </div>
        </div>
      )}

      {showParkingScreen && (
        <div className="lock-parking-screen">
          <ParkingScreen
            onComplete={onComplete}
            onBackToLock={() => setShowParkingScreen(false)}
            completedVehicles={completedVehicles}
            onCompletedVehiclesChange={onCompletedVehiclesChange}
          />
        </div>
      )}
    </>
  );
}
