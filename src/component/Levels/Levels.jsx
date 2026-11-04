import React, { useState } from 'react';
import './Levels.css';

// ==========================================
// רכיבי אומנות SVG (איקוני יהלום לפי המצבים)
// ==========================================

// יהלום כחול (שלב פתוח)
const BlueDiamond = ({ number }) => (
  <div className="diamond-container">
    <svg viewBox="0 0 100 85" className="diamond-svg">
      <polygon points="50,2 85,25 98,40 50,83 2,40 15,25" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3" />
      <polygon points="50,2 85,25 50,40 15,25" fill="#60a5fa" />
      <polygon points="15,25 50,40 2,40" fill="#2563eb" />
      <polygon points="85,25 50,40 98,40" fill="#1d4ed8" />
      <polygon points="50,40 98,40 50,83" fill="#1e40af" />
      <polygon points="50,40 2,40 50,83" fill="#3b82f6" />
    </svg>
    {number !== undefined && <span className="diamond-number">{number}</span>}
  </div>
);

// יהלום זהב מנצנץ (שלב פעיל נוכחי)
const GoldSparkleDiamond = ({ number }) => (
  <div className="diamond-container active-sparkle">
    {/* ניצוצות זהב סביב היהלום */}
    <span className="sparkle sparkle-top">✦</span>
    <span className="sparkle sparkle-bottom">✦</span>
    <svg viewBox="0 0 100 85" className="diamond-svg">
      <polygon points="50,2 85,25 98,40 50,83 2,40 15,25" fill="#00bfff" stroke="#0077b6" strokeWidth="3" />
      <polygon points="50,2 85,25 50,40 15,25" fill="#70e000" />
      <polygon points="50,2 85,25 50,40 15,25" fill="#38bdf8" />
      <polygon points="15,25 50,40 2,40" fill="#0284c7" />
      <polygon points="85,25 50,40 98,40" fill="#0369a1" />
      <polygon points="50,40 98,40 50,83" fill="#0c4a6e" />
      <polygon points="50,40 2,40 50,83" fill="#0284c7" />
    </svg>
    {number !== undefined && <span className="diamond-number gold">{number}</span>}
  </div>
);

// יהלום אפור (שלב נעול)
const GreyDiamond = ({ number }) => (
  <div className="diamond-container locked">
    <svg viewBox="0 0 100 85" className="diamond-svg">
      <polygon points="50,2 85,25 98,40 50,83 2,40 15,25" fill="#9ca3af" stroke="#4b5563" strokeWidth="3" />
      <polygon points="50,2 85,25 50,40 15,25" fill="#d1d5db" />
      <polygon points="15,25 50,40 2,40" fill="#6b7280" />
      <polygon points="85,25 50,40 98,40" fill="#4b5563" />
      <polygon points="50,40 98,40 50,83" fill="#374151" />
      <polygon points="50,40 2,40 50,83" fill="#6b7280" />
    </svg>
    {number !== undefined && <span className="diamond-number grey">{number}</span>}
  </div>
);

// ==========================================
// קומפוננטת כפתור הפתיחה/סגירה (LevelsBtn)
// ==========================================
export const LevelsBtn = ({ isOpen, onClick }) => {
  return (
    <button 
      className={`levels-toggle-btn ${isOpen ? 'open' : ''}`} 
      onClick={onClick}
      aria-label="מפת שלבים"
    >
      {isOpen ? (
        // איקון תיבת יהלום פתוחה
        <div className="chest-icon">
          <div className="chest-lid"></div>
          <div className="chest-diamond">❖</div>
          <div className="chest-base"></div>
        </div>
      ) : (
        // איקון 3 פסים (המיבורגר מעוגל)
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </button>
  );
};

// ==========================================
// קומפוננטת המודאל הראשי (Levels)
// ==========================================
export default function Levels({ 
    steps = [], 
    currentStep = 0, 
    maxUnlockedStep = 0, 
    onSelectStep,
    isOpen,
    onClose
  }) {
    if (!isOpen) return null;
  
    // חותכים את המערך כדי להסיר את השלב הראשון (0) ואת השלב האחרון (-1)
    const visibleSteps = steps.slice(1, -1);
  
    return (
      <div className="levels-overlay" onClick={onClose}>
        <div className="levels-card" onClick={(e) => e.stopPropagation()}>
          
          {/* כפתור סגירה בחלק העליון */}
          <div className="levels-header">
            <LevelsBtn isOpen={true} onClick={onClose} />
          </div>
  
          {/* גריד השלבים הדינמי */}
          <div className="levels-grid">
            {visibleSteps.map((stepItem, index) => {
              // בגלל שהורדנו את השלב הראשון (אינדקס 0), האינדקס המקורי במערך המלא הוא תמיד +1
              const originalIndex = index + 1;
              
              const isCurrent = originalIndex === currentStep;
              const isUnlocked = originalIndex <= maxUnlockedStep;
              const isLocked = !isUnlocked;
  
              // מספור השלבים לתצוגה מתחיל מ-1 (ולא מ-0)
              const displayIndex = index + 1;
              const stepTitle = stepItem.title || stepItem.name || `שלב ${displayIndex}`;
  
              let statusClass = 'unlocked';
              if (isCurrent) statusClass = 'active';
              if (isLocked) statusClass = 'locked';
  
              return (
                <div 
                  key={originalIndex}
                  className={`level-item ${statusClass}`}
                  onClick={() => {
                    if (isUnlocked && onSelectStep) {
                      onSelectStep(originalIndex); // שולחים למערכת את האינדקס המקורי
                      onClose();
                    }
                  }}
                >
                  <div className="level-pill">
                    <span className="level-title">{stepTitle}</span>
                  </div>
                  
                  <div className="level-diamond-wrapper">
                    {isCurrent && <GoldSparkleDiamond number={displayIndex} />}
                    {!isCurrent && isUnlocked && <BlueDiamond number={displayIndex} />}
                    {isLocked && <GreyDiamond number={displayIndex} />}
                  </div>
                </div>
              );
            })}
          </div>
  
        </div>
      </div>
    );
  }