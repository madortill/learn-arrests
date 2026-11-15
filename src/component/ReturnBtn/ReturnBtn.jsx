
import React from 'react';
import './ReturnBtn.css';
import returnArrowIcon from '../../assets/return-arrow.svg';

const ReturnBtn = ({
  onClick,
  text = 'לחץ לחזרה',
}) => {
  return (
    <button
      type="button"
      className="return-btn"
      onClick={onClick}
      aria-label={text}
    >
      <span
        className="return-icon"
        style={{
          '--return-icon': `url("${returnArrowIcon}")`,
        }}
        aria-hidden="true"
      />

      <span className="return-text">
        {text}
      </span>
    </button>
  );
};

export default ReturnBtn;
