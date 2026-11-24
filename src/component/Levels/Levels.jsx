import React, { useMemo } from 'react';
import './Levels.css';

import btnClosedIcon from '../../assets/Levels/levels_btn_closed.png';
import btnOpenIcon from '../../assets/Levels/levels_btn_open.png';
import diamondUnlockedImg from '../../assets/Levels/diamond_unlocked.png';
import diamondCurrentImg from '../../assets/Levels/diamond_current.png';
import diamondLockedImg from '../../assets/Levels/diamond_locked.png';

// ==========================================
// כפתור הפתיחה/סגירה העגול (LevelsBtn)
// ==========================================
export const LevelsBtn = ({ isOpen, onClick }) => {
  return (
    <button
      type="button"
      className={`levels-toggle-btn ${isOpen ? 'open' : ''}`}
      onClick={onClick}
      aria-label={isOpen ? 'סגירת מפת שלבים' : 'פתיחת מפת שלבים'}
      aria-expanded={isOpen}
    >
      <img
        src={isOpen ? btnOpenIcon : btnClosedIcon}
        alt=""
        className="levels-toggle-icon"
        draggable={false}
      />
    </button>
  );
};

// ==========================================
// קומפוננטת מפת השלבים (Levels)
// ==========================================
export default function Levels({
  steps = [],
  currentStep = 0,
  visitedSteps = [],
  onSelectStep,
  isOpen,
  onClose,
}) {
  // בניית רשימת השלבים להצגה (ללא עמוד פתיחה 0, ללא עמוד סיום אחרון, וללא שלבים עם levelName: null)
  const mappedLevels = useMemo(() => {
    const middleSteps = steps.slice(1, -1);
    let diamondCounter = 0;

    return middleSteps.reduce((acc, stepItem, idx) => {
      const originalIndex = idx + 1;

      // שלב שהוגדר במפורש כ-null (כמו שלב 12) לא נספר ולא מוצג
      if (stepItem?.levelName === null) {
        return acc;
      }

      const rawName =
        typeof stepItem?.levelName === 'string'
          ? stepItem.levelName.trim()
          : '';

      const isPractice = rawName.length === 0;

      if (!isPractice) {
        diamondCounter += 1;
      }

      acc.push({
        originalIndex,
        isPractice,
        displayNumber: isPractice ? null : diamondCounter,
        title: isPractice ? 'תרגול עד לפה' : rawName,
      });

      return acc;
    }, []);
  }, [steps]);

  if (!isOpen) return null;

  return (
    <div className="levels-overlay" onClick={onClose}>
      <div
        className="levels-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="מפת שלבים"
      >
        <div className="levels-rows-container">
          {mappedLevels.map((item) => {
            const isCurrent =
              currentStep !== null && item.originalIndex === currentStep;
            const isVisited = visitedSteps.includes(item.originalIndex);
            const isClickable = isCurrent || isVisited;

            let statusClass = 'locked';
            let diamondImg = diamondLockedImg;

            if (isCurrent) {
              statusClass = 'current';
              diamondImg = diamondCurrentImg;
            } else if (isVisited) {
              statusClass = 'unlocked';
              diamondImg = diamondUnlockedImg;
            }

            return (
              <button
                key={item.originalIndex}
                type="button"
                disabled={!isClickable}
                className={`level-item ${statusClass} ${
                  item.isPractice ? 'is-practice' : 'has-diamond'
                }`}
                onClick={() => {
                  if (isClickable && onSelectStep) {
                    onSelectStep(item.originalIndex);
                    onClose();
                  }
                }}
              >
                {/* היהלום בפינה הימנית של המלבן (מופיע רק בשלבים שאינם תרגול) */}
                {!item.isPractice && (
                  <div className="level-diamond-wrapper">
                    <img
                      src={diamondImg}
                      alt=""
                      className="level-diamond-img"
                      draggable={false}
                    />
                    <span className="level-diamond-number">
                      {item.displayNumber}
                    </span>
                  </div>
                )}

                {/* מלבן הטקסט הלבן */}
                <div className="level-pill">
                  <span className="level-title">{item.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}