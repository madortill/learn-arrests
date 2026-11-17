
import React, { useState, useRef } from 'react';
import './DepositsBtn.css';

import DepositsScreen from '../DepositsScreen/DepositsScreen';
import depositBagBtn from '../../assets/Deposits/deposit_bag_btn.png';

const DepositsBtn = ({
  onComplete,
  onScreenOpenChange,
  currentStep,
  isCompleted,
  content,
}) => {
  const totalSteps = content?.steps?.length || 7;

  // מזהה ייחודי לשלב הנוכחי
  const storageKey = `deposits-progress-${currentStep}`;

  // קריאת ההתקדמות השמורה
  const getSavedStep = () => {
    // אם השלב כבר הושלם, חוזרים תמיד לפריים האחרון
    if (isCompleted) return totalSteps;

    try {
      const savedStep = Number(
        sessionStorage.getItem(storageKey)
      );

      if (!Number.isFinite(savedStep)) return 0;

      return Math.max(
        0,
        Math.min(savedStep, totalSteps)
      );
    } catch {
      return 0;
    }
  };

  const [isScreenOpen, setIsScreenOpen] = useState(false);
  const [savedStep, setSavedStep] = useState(getSavedStep);

  const completedRef = useRef(false);

  // פתיחת מסך הפיקדונות
  const handleOpenScreen = () => {
    setIsScreenOpen(true);
    onScreenOpenChange?.(true);
  };

  // שמירת ההתקדמות בכל מעבר בין פריימים
  const handleProgressChange = (step) => {
    setSavedStep(step);

    try {
      sessionStorage.setItem(storageKey, String(step));
    } catch (error) {
      console.warn('Could not save deposits progress', error);
    }
  };

  // השלמת השלב
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
          aria-label="פתיחת מסך הפיקדונות"
        >
          <img
            src={depositBagBtn}
            alt="פיקדונות"
            className="deposit-bag-img"
            draggable="false"
          />
        </button>
      )}

      {isScreenOpen && (
        <DepositsScreen
          content={content}
          initialStep={isCompleted ? totalSteps : savedStep}
          onProgressChange={handleProgressChange}
          onComplete={handleComplete}
        />
      )}

    </div>
  );
};

export default DepositsBtn;
