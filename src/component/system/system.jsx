
import React, { useState, useCallback } from 'react';

import stages from '../../data/stages.json';

import Tablet from '../Tablet/Tablet';
import BookendScreen from '../BookendScreen/BookendScreen';
import EmptyState from '../EmptyState/EmptyState';
import SpeechBubble from '../SpeechBubble/SpeechBubble';

import ContinueBtn from '../ContinueBtn/ContinueBtn';

import About from '../About/About';
import Levels, { LevelsBtn } from '../Levels/Levels';
import ReturnBtn from '../ReturnBtn/ReturnBtn';

// מיפוי הקומפוננטות
const componentMap = {
  Tablet,
  BookendScreen,
  EmptyState,
  SpeechBubble,
};

export default function System() {
  const pages = Array.isArray(stages.pages)
    ? stages.pages
    : [];

  const [currentStep, setCurrentStep] = useState(0);
  const [isStepCompleted, setIsStepCompleted] = useState(false);

  const [isLevelsOpen, setIsLevelsOpen] = useState(false);

  // שומר את השלב הגבוה ביותר שאליו המשתמש הגיע
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);

  const stepData = pages[currentStep];

  // מעבר לשלב הבא
  const handleNextStep = useCallback(() => {
    const nextStep = currentStep + 1;

    setMaxUnlockedStep((prev) =>
      Math.max(prev, nextStep)
    );

    setCurrentStep(nextStep);
    setIsStepCompleted(false);
  }, [currentStep]);

  // חזרה לשלב הקודם
  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setIsStepCompleted(false);
    }
  }, [currentStep]);

  // בחירת שלב ממפת השלבים
  const handleSelectStep = useCallback((stepIndex) => {
    if (stepIndex <= maxUnlockedStep) {
      setCurrentStep(stepIndex);
      setIsStepCompleted(false);
    }
  }, [maxUnlockedStep]);

  // איפוס הלומדה
  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setIsStepCompleted(false);
    setIsLevelsOpen(false);
  }, []);

  // קבלת הודעה שהמשימה הסתיימה
  const handleComplete = useCallback(() => {
    setIsStepCompleted(true);
  }, []);

  // אין שלב מתאים - מסך סיום
  if (!stepData) {
    return (
      <div className="system-container">
        <BookendScreen
          isStart={false}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  const primaryData = stepData.primaryComponent;
  const secondaryData = stepData.secondaryComponent;

  const PrimaryComponent = componentMap[primaryData?.type];

  const isBookend = primaryData?.type === 'BookendScreen';

  return (
    <div className={`system-container ${stepData.background || ''}`}>

      {/* ================================= */}
      {/* כפתורים גלובליים */}
      {/* ================================= */}

      <About />

      {!isBookend && (
        <>
          <LevelsBtn
            isOpen={isLevelsOpen}
            onClick={() => setIsLevelsOpen((prev) => !prev)}
          />

          {currentStep > 0 && (
            <ReturnBtn
              onClick={handlePreviousStep}
            />
          )}
        </>
      )}

      {/* ================================= */}
      {/* מפת השלבים */}
      {/* ================================= */}

      <Levels
        steps={pages}
        currentStep={currentStep}
        maxUnlockedStep={maxUnlockedStep}
        onSelectStep={handleSelectStep}
        isOpen={isLevelsOpen}
        onClose={() => setIsLevelsOpen(false)}
      />

      {/* ================================= */}
      {/* קומפוננטה ראשית */}
      {/* ================================= */}

      {PrimaryComponent ? (
        <PrimaryComponent
          {...(primaryData.props || {})}
          onComplete={handleComplete}
          onNext={handleNextStep}
          onRestart={handleRestart}
        />
      ) : (
        <div className="system-missing-component">
          <h2>הקומפוננטה עדיין לא מחוברת</h2>
          <p>
            {primaryData?.type || 'לא הוגדרה קומפוננטה'}
          </p>
          <p>שלב מספר: {currentStep}</p>
        </div>
      )}

      {/* ================================= */}
      {/* קומפוננטה משנית */}
      {/* ================================= */}

      {secondaryData?.type === 'SpeechBubble' && (
        <SpeechBubble
          {...(secondaryData.props || {})}
        />
      )}

      {/* ================================= */}
      {/* כפתור המשך גלובלי */}
      {/* ================================= */}

      {isStepCompleted && (
        <ContinueBtn
          onClick={handleNextStep}
        />
      )}

    </div>
  );
}
