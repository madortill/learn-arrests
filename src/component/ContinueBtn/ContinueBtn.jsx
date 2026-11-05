
import React from 'react';
import './ContinueBtn.css';

export default function ContinueBtn({
  onClick,
  text = 'המשך',
}) {
  return (
    <div className="global-continue-wrapper">
      <button
        className="global-continue-btn"
        onClick={onClick}
      >
        {text}
      </button>
    </div>
  );
}
