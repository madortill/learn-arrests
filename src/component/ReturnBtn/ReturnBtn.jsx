import React from 'react';
import './ReturnBtn.css';

const ReturnBtn = ({ onClick }) => {
  return (
    <button 
      className="return-btn" 
      onClick={onClick}
      aria-label="חזרה לשלב הקודם"
    >
      {/* איקון חץ חזרה מעוגל מעוצב כמו בתמונה */}
      <svg className="return-icon" viewBox="0 0 24 24" fill="none">
        <path 
          d="M9 15L4 10L9 5" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M4 10H14.5C17.5355 10 20 12.4645 20 15.5C20 18.5355 17.5355 21 14.5 21H11" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
      </svg>
      
      {/* טקסט שנחשף או מוצג ב-Hover */}
      <span className="return-text">לחץ לחזרה</span>
    </button>
  );
};

export default ReturnBtn;