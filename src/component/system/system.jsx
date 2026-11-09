
import React, { useState, useCallback, useEffect } from 'react';

import LoadingScreen from '../LoadingScreen/LoadingScreen';
import stages from '../../data/stages.json';

import Tablet from '../Tablet/Tablet';
import BookendScreen from '../BookendScreen/BookendScreen';
import EmptyState from '../EmptyState/EmptyState';
import SpeechBubble from '../SpeechBubble/SpeechBubble';
import FlipCards from '../FlipCards/FlipCards';
import ChecklistScreen from '../ChecklistScreen/ChecklistScreen';
import DepositsBtn from '../DepositsBtn/DepositsBtn';

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
  DepositsBtn,
};

export default function System() {
  const pages = Array.isArray(stages.pages)
    ? stages.pages
    : [];

  const [currentStep, setCurrentStep] = useState(0);

  const [completedSteps, setCompletedSteps] = useState([]);

  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);

  const [isLevelsOpen, setIsLevelsOpen] = useState(false);

  const [continueSignal, setContinueSignal] = useState(0);

  // שמירת התקדמות הצ'קליסטים
  const [checklistProgress, setChecklistProgress] = useState({});

  const [checklistStartedSteps, setChecklistStartedSteps] = useState([]);

  // מצב מסך הפיקדונות
  const [isDepositsScreenOpen, setIsDepositsScreenOpen] = useState(false);

  // מסכי טעינה
  const [loadingType, setLoadingType] = useState('initial');
  const [pendingStep, setPendingStep] = useState(null);

  const stepData = pages[currentStep];

  const primaryData = stepData?.primaryComponent;
  const secondaryData = stepData?.secondaryComponent;

  const PrimaryComponent = componentMap[primaryData?.type];

  const isBookend = primaryData?.type === 'BookendScreen';

  const isCompleted = completedSteps.includes(currentStep);

  // זיהוי ChecklistScreen
  const isChecklistStep =
    primaryData?.type === 'ChecklistScreen';

  const checklistItems =
    primaryData?.props?.items ||
    stepData?.items ||
    [];

  const checklistCheckedItems =
    checklistProgress[currentStep] || {};

  const checklistHasInteracted =
    checklistStartedSteps.includes(currentStep);

  // זיהוי WhatsApp
  const isWhatsAppStep =
    primaryData?.type === 'Tablet' &&
    (
      primaryData?.props?.type === 'WhatsAppChat' ||
      primaryData?.props?.tabletType === 'WhatsAppChat'
    );

  const isPrisonerWhatsAppStep =
    isWhatsAppStep &&
    Number(primaryData?.props?.part) === 2;

  // זיהוי מסך מפה
  const isLocationMapStep =
    primaryData?.type === 'Tablet' &&
    (
      primaryData?.props?.type === 'LocationMap' ||
      primaryData?.props?.tabletType === 'LocationMap'
    );

  // זיהוי חידון
  const isQuizStep =
    primaryData?.type === 'Tablet' &&
    (
      primaryData?.props?.type === 'QuizScreen' ||
      primaryData?.props?.tabletType === 'QuizScreen'
    );

  // השלמת שלב
  const markStepCompleted = useCallback((stepIndex) => {
    setCompletedSteps((prev) =>
      prev.includes(stepIndex)
        ? prev
        : [...prev, stepIndex]
    );
  }, []);

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

  // שמירת התחלת אינטראקציה
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

    const stageNumber = Number(
      stepData?.step ??
      stepData?.id ??
      currentStep + 1
    );

    // מסך טעינה אחרי שלבים 12 ו-21
    if (stageNumber === 12 || stageNumber === 21) {
      setPendingStep(nextStep);
      setLoadingType('transition');
      return;
    }

    setMaxUnlockedStep((prev) =>
      Math.max(prev, nextStep)
    );

    setCurrentStep(nextStep);
    setContinueSignal(0);

  }, [
    currentStep,
    pages.length,
    stepData,
    markStepCompleted,
  ]);

  // טעינה ראשונית
  useEffect(() => {
    if (loadingType !== 'initial') return;

    const timer = setTimeout(() => {
      setLoadingType(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [loadingType]);

  // טעינת מעבר
  useEffect(() => {
    if (loadingType !== 'transition' || pendingStep === null) {
      return;
    }

    const timer = setTimeout(() => {
      setMaxUnlockedStep((prev) =>
        Math.max(prev, pendingStep)
      );

      setCurrentStep(pendingStep);
      setContinueSignal(0);

      setPendingStep(null);
      setLoadingType(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [loadingType, pendingStep]);

  // חזרה לשלב הקודם
  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setContinueSignal(0);
    }
  }, [currentStep]);

  // בחירת שלב מהמפה
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

    setIsDepositsScreenOpen(false);

    setIsLevelsOpen(false);

    setPendingStep(null);
    setLoadingType('initial');
  }, []);

  // כפתור המשך גלובלי
  const handleGlobalContinue = () => {
    if (
      isLocationMapStep &&
      primaryData?.props?.generalImportantPoint
    ) {
      setContinueSignal((prev) => prev + 1);
      return;
    }

    handleNextStep();
  };

  // מסך טעינה
  if (loadingType) {
    return <LoadingScreen type={loadingType} />;
  }

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

  // הצגת כפתור המשך
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

          {...(primaryData?.type === 'DepositsBtn'
            ? {
                onScreenOpenChange: setIsDepositsScreenOpen,
              }
            : {})}

          {...(isChecklistStep
            ? {
                items: checklistItems,
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
          <p>{primaryData?.type || 'לא הוגדרה קומפוננטה'}</p>
          <p>שלב מספר: {currentStep}</p>
        </div>
      )}

      {/* בועת דיבור – מוסתרת בזמן שמסך הפיקדונות פתוח */}
      {secondaryData?.type === 'SpeechBubble' &&
        !isDepositsScreenOpen && (
          <SpeechBubble
            {...(secondaryData.props || {})}
            isCompleted={isCompleted}
          />
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
