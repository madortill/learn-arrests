
import React, { useState, useCallback } from 'react';

import stages from '../../data/stages.json';

import Tablet from '../Tablet/Tablet';
import BookendScreen from '../BookendScreen/BookendScreen';
import EmptyState from '../EmptyState/EmptyState';
import SpeechBubble from '../SpeechBubble/SpeechBubble';
import FlipCards from '../FlipCards/FlipCards';
import ChecklistScreen from '../ChecklistScreen/ChecklistScreen';

import ContinueBtn from '../ContinueBtn/ContinueBtn';

import About from '../About/About';
import Levels, { LevelsBtn } from '../Levels/Levels';
import ReturnBtn from '../ReturnBtn/ReturnBtn';

const componentMap = {
  Tablet,
  BookendScreen,
  EmptyState,
  SpeechBubble,
  FlipCards,
  ChecklistScreen,
};

export default function System() {
  const pages = Array.isArray(stages.pages)
    ? stages.pages
    : [];

  const [currentStep, setCurrentStep] = useState(0);

  // שלבים שהמשתמש השלים
  const [completedSteps, setCompletedSteps] = useState([]);

  // השלב הגבוה ביותר שאליו המשתמש הגיע
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);

  const [isLevelsOpen, setIsLevelsOpen] = useState(false);

  // אות להפעלת ההערה הכללית בשלב המפה
  const [continueSignal, setContinueSignal] = useState(0);

  // שמירת הסימונים של הצ'קליסט לפי מספר שלב
  const [checklistProgress, setChecklistProgress] = useState({});

  // שמירת העובדה שהמשתמש התחיל אינטראקציה עם הצ'קליסט
  const [checklistStartedSteps, setChecklistStartedSteps] = useState([]);

  const stepData = pages[currentStep];

  const primaryData = stepData?.primaryComponent;
  const secondaryData = stepData?.secondaryComponent;

  const PrimaryComponent = componentMap[primaryData?.type];

  const isBookend = primaryData?.type === 'BookendScreen';

  // האם השלב הנוכחי כבר הושלם?
  const isCompleted = completedSteps.includes(currentStep);

  // זיהוי קומפוננטת ChecklistScreen
  const isChecklistStep =
    primaryData?.type === 'ChecklistScreen';

  // נתוני הצ'קליסט
  // תומך בפריטים שמוגדרים בתוך props או ישירות בתוך נתוני השלב
  const checklistItems =
    primaryData?.props?.items ||
    stepData?.items ||
    [];

  const checklistCheckedItems =
    checklistProgress[currentStep] || {};

  const checklistHasInteracted =
    checklistStartedSteps.includes(currentStep);

  // זיהוי שלבי WhatsApp
  const isWhatsAppStep =
    primaryData?.type === 'Tablet' &&
    (
      primaryData?.props?.type === 'WhatsAppChat' ||
      primaryData?.props?.tabletType === 'WhatsAppChat'
    );

  // זיהוי שלב 8 - דיווח עצור
  const isPrisonerWhatsAppStep =
    isWhatsAppStep &&
    Number(primaryData?.props?.part) === 2;

  // זיהוי שלב המפה
  const isLocationMapStep =
    primaryData?.type === 'Tablet' &&
    (
      primaryData?.props?.type === 'LocationMap' ||
      primaryData?.props?.tabletType === 'LocationMap'
    );

  // זיהוי שלב החידון
  const isQuizStep =
    primaryData?.type === 'Tablet' &&
    (
      primaryData?.props?.type === 'QuizScreen' ||
      primaryData?.props?.tabletType === 'QuizScreen'
    );

  // שמירת השלמת שלב
  const markStepCompleted = useCallback((stepIndex) => {
    setCompletedSteps((prev) =>
      prev.includes(stepIndex)
        ? prev
        : [...prev, stepIndex]
    );
  }, []);

  // קומפוננטה מודיעה שהשלב הושלם
  const handleComplete = useCallback(() => {
    markStepCompleted(currentStep);
  }, [currentStep, markStepCompleted]);

  // שמירת התקדמות הצ'קליסט
  const handleChecklistProgress = useCallback((newState) => {
    setChecklistProgress((prev) => ({
      ...prev,
      [currentStep]: newState,
    }));
  }, [currentStep]);

  // זיהוי האינטראקציה הראשונה עם הצ'קליסט
  const handleChecklistInteractionStart = useCallback(() => {
    setChecklistStartedSteps((prev) =>
      prev.includes(currentStep)
        ? prev
        : [...prev, currentStep]
    );
  }, [currentStep]);

  // מעבר לשלב הבא
  const handleNextStep = useCallback(() => {
    markStepCompleted(currentStep);

    const nextStep = currentStep + 1;

    if (nextStep >= pages.length) {
      setCurrentStep(nextStep);
      return;
    }

    setMaxUnlockedStep((prev) =>
      Math.max(prev, nextStep)
    );

    setCurrentStep(nextStep);
    setContinueSignal(0);
  }, [currentStep, pages.length, markStepCompleted]);

  // חזרה לשלב הקודם
  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setContinueSignal(0);
    }
  }, [currentStep]);

  // בחירת שלב ממפת השלבים
  const handleSelectStep = useCallback((stepIndex) => {
    if (stepIndex <= maxUnlockedStep) {
      setCurrentStep(stepIndex);
      setContinueSignal(0);
      setIsLevelsOpen(false);
    }
  }, [maxUnlockedStep]);

  // איפוס הלומדה
  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setMaxUnlockedStep(0);
    setContinueSignal(0);
    setChecklistProgress({});
    setChecklistStartedSteps([]);
    setIsLevelsOpen(false);
  }, []);

  // לחיצה על כפתור ההמשך הגלובלי
  const handleGlobalContinue = () => {

    // שלב מיקום עם הערה כללית
    if (
      isLocationMapStep &&
      primaryData?.props?.generalImportantPoint
    ) {
      setContinueSignal((prev) => prev + 1);
      return;
    }

    // בכל שאר השלבים עוברים לשלב הבא
    handleNextStep();
  };

  // מסך סיום
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

  // הצגת כפתור המשך גלובלי רק בשלבים המתאימים
  const showGlobalContinue =
    isCompleted &&
    (!isWhatsAppStep || isPrisonerWhatsAppStep) &&
    !isQuizStep &&
    !isBookend;

  return (
    <div className={`system-container ${stepData.background || ''}`}>

      <About />

      {!isBookend && (
        <>
          <LevelsBtn
            isOpen={isLevelsOpen}
            onClick={() => setIsLevelsOpen((prev) => !prev)}
          />

          {currentStep > 0 && (
            <ReturnBtn onClick={handlePreviousStep} />
          )}
        </>
      )}

      <Levels
        steps={pages}
        currentStep={currentStep}
        maxUnlockedStep={maxUnlockedStep}
        onSelectStep={handleSelectStep}
        isOpen={isLevelsOpen}
        onClose={() => setIsLevelsOpen(false)}
      />

      {/* קומפוננטה ראשית */}
      {PrimaryComponent ? (
        <PrimaryComponent
          key={
            primaryData?.type === 'FlipCards'
              ? currentStep
              : undefined
          }
          {...(primaryData.props || {})}

          currentStep={currentStep}
          isCompleted={isCompleted}

          onComplete={handleComplete}
          onNext={handleNextStep}
          onRestart={handleRestart}

          continueSignal={continueSignal}

          
          {...(isChecklistStep
            ? {
                items: checklistItems,
                stepData: { items: checklistItems },

                checkedItems: checklistCheckedItems,
                onCheckedItemsChange: handleChecklistProgress,

                hasInteracted: checklistHasInteracted,
                onInteractionStart: handleChecklistInteractionStart,
              }
            : {})}
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

      {/* קומפוננטה משנית - בועת דיבור */}
      {secondaryData?.type === 'SpeechBubble' && (
        !(
          isChecklistStep &&
          checklistHasInteracted
        ) && (
          <SpeechBubble
            {...(secondaryData.props || {})}
            isCompleted={isCompleted}
          />
        )
      )}

      {/* כפתור המשך גלובלי */}
      {showGlobalContinue && (
        <ContinueBtn
          onClick={handleGlobalContinue}
        />
      )}

    </div>
  );
}
