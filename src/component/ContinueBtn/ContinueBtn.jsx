import React from 'react';
import './ContinueBtn.css';
import diamondIcon from '../../assets/diamond.png'; // יש לעדכן את הנתיב למיקום התמונה בפרויקט

export default function ContinueBtn({
  onClick,
  text = 'המשך',
}) {
  return (
    <div className="global-continue-wrapper">
      <button
        type="button"
        className="global-continue-btn"
        onClick={onClick}
      >
        <img
          src={diamondIcon}
          alt=""
          className="continue-btn-diamond"
        />
        <span className="continue-btn-text">{text}</span>
      </button>
    </div>
  );
}