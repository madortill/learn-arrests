import React, { useState, useRef, useEffect, useCallback } from 'react';
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

  // מזהים ייחודיים לשלב הנוכחי
  const progressStorageKey = `deposits-progress-${currentStep}`;
  const openedStorageKey = `deposits-opened-${currentStep}`;

  // בדיקה האם המשתמש כבר נכנס למסך הפיקדונות בשלב הזה
  const getWasScreenOpened = useCallback(() => {
    if (isCompleted) return true;

    try {
      return (
        sessionStorage.getItem(openedStorageKey) === 'true' ||
        sessionStorage.getItem(progressStorageKey) !== null
      );
    } catch {
      return false;
    }
  }, [isCompleted, openedStorageKey, progressStorageKey]);

  // קריאת ההתקדמות השמורה
  const getSavedStep = useCallback(() => {
    // אם השלב כבר הושלם, חוזרים תמיד לפריים האחרון
    if (isCompleted) return totalSteps;

    try {
      const rawStep = sessionStorage.getItem(progressStorageKey);
      if (rawStep === null) return 0;

      const savedStep = Number(rawStep);
      if (!Number.isFinite(savedStep)) return 0;

      return Math.max(
        0,
        Math.min(savedStep, totalSteps)
      );
    } catch {
      return 0;
    }
  }, [isCompleted, progressStorageKey, totalSteps]);

  const [isScreenOpen, setIsScreenOpen] = useState(getWasScreenOpened);
  const [savedStep, setSavedStep] = useState(getSavedStep);

  const completedRef = useRef(Boolean(isCompleted));

  // סנכרון מצב הפתיחה וההתקדמות בכל כניסה או חזרה לשלב
  useEffect(() => {
    setIsScreenOpen(getWasScreenOpened());
    setSavedStep(getSavedStep());
    completedRef.current = Boolean(isCompleted);
  }, [getWasScreenOpened, getSavedStep, isCompleted]);

  // עדכון System האם מסך הפיקדונות פתוח כרגע (להסתרת בועת הדיבור המשנית)
  useEffect(() => {
    onScreenOpenChange?.(isScreenOpen);
  }, [isScreenOpen, onScreenOpenChange]);

  // פתיחת מסך הפיקדונות בלחיצה הראשונה על השקית
  const handleOpenScreen = () => {
    setIsScreenOpen(true);

    try {
      sessionStorage.setItem(openedStorageKey, 'true');
    } catch (error) {
      console.warn('Could not save deposits opened state', error);
    }
  };

  // שמירת ההתקדמות בכל מעבר בין פריימים
  const handleProgressChange = (step) => {
    setSavedStep(step);

    try {
      sessionStorage.setItem(progressStorageKey, String(step));
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