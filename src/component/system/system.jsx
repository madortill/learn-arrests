
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
import ParkingButton from '../ParkingButton/ParkingButton';
import DrivingScreen from '../DrivingScreen/DrivingScreen';
import DoorsScreen from '../DoorsScreen/DoorsScreen';
import WriteboardScreen from '../WriteboardScreen/WriteboardScreen';

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
  ParkingButton,
  DrivingScreen,
  DoorsScreen,
  WriteboardScreen,
};

const DOOR_STAGES = [25, 26, 27, 28];
const DOORS_HUB_STAGE = 24;

const getStageNumber = (page, index) =>
  Number(page?.step ?? page?.id ?? index + 1);

export default function System() {
  const pages = Array.isArray(stages.pages)
    ? stages.pages
    : [];

  const [currentStep, setCurrentStep] = useState(0);

  const [completedSteps, setCompletedSteps] = useState([]);

  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);

  const [isLevelsOpen, setIsLevelsOpen] = useState(false);

  const [continueSignal, setContinueSignal] = useState(0);

  // התקדמות צ'קליסטים
  const [checklistProgress, setChecklistProgress] = useState({});
  const [checklistStartedSteps, setChecklistStartedSteps] = useState([]);

  // התקדמות רכבים
  const [parkingProgress, setParkingProgress] = useState({});

  // מסך פיקדונות
  const [isDepositsScreenOpen, setIsDepositsScreenOpen] = useState(false);

  // מסכי טעינה
  const [loadingType, setLoadingType] = useState('initial');
  const [pendingStep, setPendingStep] = useState(null);

  // ==========================================
  // ניווט מסדרון הדלתות
  // ==========================================

  // השלב שאליו צריך לחזור אחרי יציאה מחדר
  const doorsHubIndex = pages.findIndex(
    (page, index) =>
      getStageNumber(page, index) === DOORS_HUB_STAGE
  );

  // האם אנחנו כרגע בתוך אחד מארבעת החדרים
  const [activeDoorStage, setActiveDoorStage] = useState(null);

  // זיהוי השלבים שבוצעו לפי האינדקסים האמיתיים במערך
  const completedDoorStages = DOOR_STAGES.reduce(
    (result, stageNumber) => {
      const stageIndex = pages.findIndex(
        (page, index) =>
          getStageNumber(page, index) === stageNumber
      );

      result[stageNumber] =
        stageIndex !== -1 && completedSteps.includes(stageIndex);

      return result;
    },
    {}
  );

  const allDoorsCompleted = DOOR_STAGES.every(
    (id) => completedDoorStages[id]
  );

  // כניסה לחדר מתוך המסדרון
  const handleEnterDoorStage = useCallback((stageNumber) => {
    const targetIndex = pages.findIndex(
      (page, index) =>
        getStageNumber(page, index) === stageNumber
    );

    if (targetIndex === -1) {
      console.error(`Stage ${stageNumber} was not found in stages.json`);
      return;
    }

    // הגנה נוספת על תנאי הנעילה
    if (
      stageNumber === 26 &&
      !completedDoorStages[25]
    ) {
      return;
    }

    if (
      stageNumber === 28 &&
      !(
        completedDoorStages[25] &&
        completedDoorStages[26] &&
        completedDoorStages[27]
      )
    ) {
      return;
    }

    setActiveDoorStage(stageNumber);
    setCurrentStep(targetIndex);
    setContinueSignal(0);
    setIsLevelsOpen(false);
  }, [pages, completedDoorStages]);

  // ==========================================
  // נתוני השלב הנוכחי
  // ==========================================

  const stepData = pages[currentStep];

  const primaryData = stepData?.primaryComponent;
  const secondaryData = stepData?.secondaryComponent;

  const PrimaryComponent = componentMap[primaryData?.type];

  const isBookend = primaryData?.type === 'BookendScreen';

  const isDoorsHubStep =
    primaryData?.type === 'DoorsScreen' &&
    getStageNumber(stepData, currentStep) === DOORS_HUB_STAGE;

  const isDoorRoomStep = activeDoorStage !== null;

  const isCompleted = completedSteps.includes(currentStep);

  // Checklist
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

  // WhatsApp
  const isWhatsAppStep =
    primaryData?.type === 'Tablet' &&
    (
      primaryData?.props?.type === 'WhatsAppChat' ||
      primaryData?.props?.tabletType === 'WhatsAppChat'
    );

  const isPrisonerWhatsAppStep =
    isWhatsAppStep &&
    Number(primaryData?.props?.part) === 2;

  // מפה
  const isLocationMapStep =
    primaryData?.type === 'Tablet' &&
    (
      primaryData?.props?.type === 'LocationMap' ||
      primaryData?.props?.tabletType === 'LocationMap'
    );

  // חידון
  const isQuizStep =
    primaryData?.type === 'Tablet' &&
    (
      primaryData?.props?.type === 'QuizScreen' ||
      primaryData?.props?.tabletType === 'QuizScreen'
    );

  // מגרש חניה
  const isParkingStep =
    primaryData?.type === 'ParkingButton';

  const currentParkingProgress =
    parkingProgress[currentStep] || {};

  // ==========================================
  // השלמת שלבים
  // ==========================================

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

  // Checklist
  const handleChecklistProgress = useCallback((newState) => {
    setChecklistProgress((prev) => ({
      ...prev,
      [currentStep]: newState,
    }));
  }, [currentStep]);

  const handleChecklistInteractionStart = useCallback(() => {
    setChecklistStartedSteps((prev) =>
      prev.includes(currentStep)
        ? prev
        : [...prev, currentStep]
    );
  }, [currentStep]);

  // Parking
  const handleParkingProgress = useCallback((newState) => {
    setParkingProgress((prev) => ({
      ...prev,
      [currentStep]: newState,
    }));
  }, [currentStep]);

  // ==========================================
  // מעבר לשלב הבא
  // ==========================================

  const handleNextStep = useCallback(() => {
    markStepCompleted(currentStep);

    // יציאה מחדר 25, 26, 27 או 28:
    // חוזרים למסדרון במקום לעבור לשלב הבא במערך.
    if (activeDoorStage !== null) {
      setActiveDoorStage(null);
      setCurrentStep(doorsHubIndex);
      setContinueSignal(0);
      setIsLevelsOpen(false);
      return;
    }

    // יציאה ממסדרון הדלתות:
    // מדלגים על ארבעת החדרים ועוברים לשלב שאחריהם.
    let nextStep;

    if (isDoorsHubStep) {
      const doorIndexes = DOOR_STAGES.map((stageNumber) =>
        pages.findIndex(
          (page, index) =>
            getStageNumber(page, index) === stageNumber
        )
      );

      const validIndexes = doorIndexes.filter(
        (index) => index !== -1
      );

      nextStep = Math.max(...validIndexes) + 1;

    } else {
      nextStep = currentStep + 1;
    }

    if (nextStep >= pages.length) {
      setCurrentStep(nextStep);
      return;
    }

    const stageNumber = getStageNumber(
      stepData,
      currentStep
    );

    // מסכי טעינה אחרי שלבים 12 ו-21
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
    activeDoorStage,
    doorsHubIndex,
    isDoorsHubStep,
    pages,
    stepData,
    markStepCompleted,
  ]);

  // ==========================================
  // טעינה ראשונית
  // ==========================================

  useEffect(() => {
    if (loadingType !== 'initial') return;

    const timer = setTimeout(() => {
      setLoadingType(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [loadingType]);

  // ==========================================
  // טעינת מעבר
  // ==========================================

  useEffect(() => {
    if (
      loadingType !== 'transition' ||
      pendingStep === null
    ) {
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

  // ==========================================
  // חזרה לשלב הקודם
  // ==========================================

  const handlePreviousStep = useCallback(() => {

    // מתוך חדר חוזרים תמיד למסדרון
    if (activeDoorStage !== null) {
      setActiveDoorStage(null);
      setCurrentStep(doorsHubIndex);
      setContinueSignal(0);
      return;
    }

    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setContinueSignal(0);
    }

  }, [currentStep, activeDoorStage, doorsHubIndex]);

  // ==========================================
  // בחירת שלב מהמפה
  // ==========================================

  const handleSelectStep = useCallback((stepIndex) => {
    if (activeDoorStage !== null) return;

    if (stepIndex <= maxUnlockedStep) {
      setCurrentStep(stepIndex);
      setContinueSignal(0);
      setIsLevelsOpen(false);
    }
  }, [maxUnlockedStep, activeDoorStage]);

  // ==========================================
  // איפוס הלומדה
  // ==========================================

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setMaxUnlockedStep(0);
    setContinueSignal(0);

    setChecklistProgress({});
    setChecklistStartedSteps([]);

    setParkingProgress({});

    setIsDepositsScreenOpen(false);
    setIsLevelsOpen(false);

    setActiveDoorStage(null);

    setPendingStep(null);
    setLoadingType('initial');
  }, []);

  // ==========================================
  // כפתור המשך גלובלי
  // ==========================================

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

  // ==========================================
  // מסך טעינה
  // ==========================================

  if (loadingType) {
    return <LoadingScreen type={loadingType} />;
  }

  // ==========================================
  // מסך סיום
  // ==========================================

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

  // ==========================================
  // כפתור המשך גלובלי
  // ==========================================

  const showGlobalContinue =
    isCompleted &&
    !isDoorsHubStep &&
    (!isWhatsAppStep || isPrisonerWhatsAppStep) &&
    !isQuizStep &&
    !isBookend;

  return (
    <div className={`system-container ${stepData.background || ''}`}>

      <About />

      {!isBookend && !isDoorRoomStep && (
        <LevelsBtn
          isOpen={isLevelsOpen}
          onClick={() => setIsLevelsOpen((prev) => !prev)}
        />
      )}

      {!isBookend && currentStep > 0 && (
        <ReturnBtn onClick={handlePreviousStep} />
      )}

      {!isDoorRoomStep && (
        <Levels
          steps={pages}
          currentStep={currentStep}
          maxUnlockedStep={maxUnlockedStep}
          onSelectStep={handleSelectStep}
          isOpen={isLevelsOpen}
          onClose={() => setIsLevelsOpen(false)}
        />
      )}

      {/* קומפוננטה ראשית */}
      {PrimaryComponent ? (
        <PrimaryComponent
          key={
            primaryData?.type === 'FlipCards' ||
            primaryData?.type === 'WriteboardScreen' ||
            isDoorRoomStep
              ? currentStep
              : undefined
          }

          {...(primaryData.props || {})}

          currentStep={currentStep}
          isCompleted={isCompleted}

          // במסדרון המעבר מתבצע רק אחרי שכל הדלתות הושלמו
          onComplete={
            isDoorsHubStep
              ? handleNextStep
              : handleComplete
          }

          onNext={handleNextStep}
          onRestart={handleRestart}

          continueSignal={continueSignal}

          // חיבור ארבע הדלתות
          {...(isDoorsHubStep
            ? {
                completedStages: completedDoorStages,
                onEnterStage: handleEnterDoorStage,
              }
            : {})}

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

          {...(isParkingStep
            ? {
                completedVehicles: currentParkingProgress,
                onCompletedVehiclesChange: handleParkingProgress,
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

      {/* בועת דיבור */}
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
