
import React, { useState, useRef } from 'react';
import './DepositsBtn.css';

import DepositsScreen from '../DepositsScreen/DepositsScreen';
import depositBagBtn from '../../assets/deposit_bag_btn.png';

const DepositsBtn = ({
  onComplete,
  onScreenOpenChange,
}) => {
  const [isScreenOpen, setIsScreenOpen] = useState(false);

  const completedRef = useRef(false);

  const handleOpenScreen = () => {
    setIsScreenOpen(true);
    onScreenOpenChange?.(true);
  };

  // סיום שבע המשיכות
  // לא סוגרים את המסך!
  const handleComplete = () => {
    if (completedRef.current) return;

    completedRef.current = true;

    onComplete?.();
  };

  return (
    <div className="deposits-btn-container">

      {!isScreenOpen && (
        <button
          className="deposit-hand-btn"
          onClick={handleOpenScreen}
        >
          <img
            src={depositBagBtn}
            alt="פיקדונות"
            className="deposit-bag-img"
          />
        </button>
      )}

      {isScreenOpen && (
        <DepositsScreen
          onComplete={handleComplete}
        />
      )}

    </div>
  );
};

export default DepositsBtn;
