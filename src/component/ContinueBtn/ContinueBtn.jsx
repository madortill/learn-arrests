import React from 'react';
import './ContinueBtn.css';

// איקון ה-SVG של היהלום מעוצב בדיוק כפי שמופיע בתמונה
const DiamondIcon = () => (
  <svg viewBox="0 0 100 85" className="continue-diamond-svg">
    <polygon points="50,5 85,25 98,38 50,80 2,38 15,25" fill="#88a4be" stroke="#5d7893" strokeWidth="2" />
    <polygon points="50,5 85,25 50,38 15,25" fill="#cbe0f1" />
    <polygon points="15,25 50,38 2,38" fill="#a3b8cd" />
    <polygon points="85,25 50,38 98,38" fill="#6d87a3" />
    <polygon points="50,38 98,38 50,80" fill="#4c657f" />
    <polygon points="50,38 2,38 50,80" fill="#7590ab" />
  </svg>
);

export default function ContinueBtn({ onClick, positionStyle }) {
  return (
    <button 
      className="continue-btn" 
      onClick={onClick}
      style={positionStyle}
      aria-label="המשך לשלב הבא"
    >
      <div className="continue-btn-content">
        <DiamondIcon />
        <span className="continue-text">המשך</span>
      </div>
    </button>
  );
}