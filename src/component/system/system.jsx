import React, { useState, useCallback, useEffect } from 'react';

import LoadingScreen from '../LoadingScreen/LoadingScreen';
import stages from '../../data/stages.json';
import './System.css';

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

import bg1 from '../../assets/backgrounds/bg-1.png';
import parkingGateBg from '../../assets/backgrounds/parking_gate_bg.png';

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

const backgroundMap = {
  'bg-1': bg1,
  'parking_gate_bg': parkingGateBg,
};

const DOOR_STAGES = [25, 26, 27, 28];
const DOORS_HUB_STAGE = 24;

const getStageNumber = (page, index) =>
  Number(page?.step ?? page?.id ?? index + 1);

export default function System() {
  const pages = Array.isArray(stages.pages) ? stages.pages : [];

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  const [isLevelsOpen, setIsLevelsOpen] = useState(false);
  const [continueSignal, setContinueSignal] = useState(0);

  // התקדמות צ'קליסטים
  const [checklistProgress, setChecklistProgress] = useState({});
  const [checklistStartedSteps, setChecklistStartedSteps] = useState([]);

  // התקדמות מלאה של שלב החניה והרכבים
  const [parkingProgress, setParkingProgress] = useState({});

  // מסך פיקדונות
  const [isDepositsScreenOpen, setIsDepositsScreenOpen] = useState(false);

  useEffect(() => {
    setIsDepositsScreenOpen(false);
  }, [currentStep]);

  // מסכי טעינה
  const [loadingType, setLoadingType] = useState('initial');
  const [pendingStep, setPendingStep] = useState(null);

  // ==========================================
  // ניווט מסדרון הדלתות
  // ==========================================

  const doorsHubIndex = pages.findIndex(
    (page, index) => getStageNumber(page, index) === DOORS_HUB_STAGE
  );

  const [activeDoorStage, setActiveDoorStage] = useState(null);

  const completedDoorStages = DOOR_STAGES.reduce((result, stageNumber) => {
    const stageIndex = pages.findIndex(
      (page, index) => getStageNumber(page, index) === stageNumber
    );

    result[stageNumber] =
      stageIndex !== -1 && completedSteps.includes(stageIndex);

    return result;
  }, {});

  const handleEnterDoorStage = useCallback(
    (stageNumber) => {
      const targetIndex = pages.findIndex(
        (page, index) => getStageNumber(page, index) === stageNumber
      );

      if (targetIndex === -1) {
        console.error(`Stage ${stageNumber} was not found in stages.json`);
        return;
      }

      if (stageNumber === 26 && !completedDoorStages[25]) {
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
    },
    [pages, completedDoorStages]
  );

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

  // זיהוי בועת דיבור ראשית
  const isPrimarySpeechBubble = primaryData?.type === 'SpeechBubble';
  const primarySpeechHasTyping = primaryData?.props?.typeAnimation !== false;

  // Checklist
  const isChecklistStep = primaryData?.type === 'ChecklistScreen';
  const checklistItems =
    primaryData?.props?.items || stepData?.items || [];
  const checklistCheckedItems = checklistProgress[currentStep] || {};
  const checklistHasInteracted =
    checklistStartedSteps.includes(currentStep);

  // WhatsApp
  const isWhatsAppStep =
    primaryData?.type === 'Tablet' &&
    (primaryData?.props?.type === 'WhatsAppChat' ||
      primaryData?.props?.tabletType === 'WhatsAppChat');

  const isPrisonerWhatsAppStep =
    isWhatsAppStep && Number(primaryData?.props?.part) === 2;

  // מפה
  const isLocationMapStep =
    primaryData?.type === 'Tablet' &&
    (primaryData?.props?.type === 'LocationMap' ||
      primaryData?.props?.tabletType === 'LocationMap');

  // חידון
  const isQuizStep =
    primaryData?.type === 'Tablet' &&
    (primaryData?.props?.type === 'QuizScreen' ||
      primaryData?.props?.tabletType === 'QuizScreen');

  // מגרש חניה
  const isParkingStep = primaryData?.type === 'ParkingButton';
  const currentParkingState = parkingProgress[currentStep] || {};

  // ==========================================
  // השלמת שלבים
  // ==========================================

  const markStepCompleted = useCallback((stepIndex) => {
    setCompletedSteps((prev) =>
      prev.includes(stepIndex) ? prev : [...prev, stepIndex]
    );
  }, []);

  const handleComplete = useCallback(() => {
    markStepCompleted(currentStep);
  }, [currentStep, markStepCompleted]);

  // Checklist
  const handleChecklistProgress = useCallback(
    (newState) => {
      setChecklistProgress((prev) => ({
        ...prev,
        [currentStep]: newState,
      }));
    },
    [currentStep]
  );

  const handleChecklistInteractionStart = useCallback(() => {
    setChecklistStartedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep]
    );
  }, [currentStep]);

  // Parking
  const handleParkingStateChange = useCallback(
    (updater) => {
      setParkingProgress((prev) => {
        const current = prev[currentStep] || {};
        const nextState =
          typeof updater === 'function' ? updater(current) : updater;

        return {
          ...prev,
          [currentStep]: nextState,
        };
      });
    },
    [currentStep]
  );

  // ==========================================
  // מעבר לשלב הבא
  // ==========================================

  const handleNextStep = useCallback(() => {
    markStepCompleted(currentStep);

    if (activeDoorStage !== null) {
      setActiveDoorStage(null);
      setCurrentStep(doorsHubIndex);
      setContinueSignal(0);
      setIsLevelsOpen(false);
      return;
    }

    let nextStep;

    if (isDoorsHubStep) {
      const doorIndexes = DOOR_STAGES.map((stageNumber) =>
        pages.findIndex(
          (page, index) => getStageNumber(page, index) === stageNumber
        )
      );

      const validIndexes = doorIndexes.filter((index) => index !== -1);
      nextStep = Math.max(...validIndexes) + 1;
    } else {
      nextStep = currentStep + 1;
    }

    if (nextStep >= pages.length) {
      setCurrentStep(nextStep);
      return;
    }

    const stageNumber = getStageNumber(stepData, currentStep);

    if (stageNumber === 12 || stageNumber === 21) {
      setPendingStep(nextStep);
      setLoadingType('transition');
      return;
    }

    setMaxUnlockedStep((prev) => Math.max(prev, nextStep));
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
  // טעינה ראשונית ומעבר
  // ==========================================

  useEffect(() => {
    if (loadingType !== 'initial') return;

    const timer = setTimeout(() => {
      setLoadingType(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [loadingType]);

  useEffect(() => {
    if (loadingType !== 'transition' || pendingStep === null) {
      return;
    }

    const timer = setTimeout(() => {
      setMaxUnlockedStep((prev) => Math.max(prev, pendingStep));
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

  const handleSelectStep = useCallback(
    (stepIndex) => {
      if (activeDoorStage !== null) return;

      if (stepIndex <= maxUnlockedStep) {
        setCurrentStep(stepIndex);
        setContinueSignal(0);
        setIsLevelsOpen(false);
      }
    },
    [maxUnlockedStep, activeDoorStage]
  );

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

  if (loadingType) {
    return <LoadingScreen type={loadingType} />;
  }

  if (!stepData) {
    return (
      <div className="system-container">
        <BookendScreen isStart={false} onRestart={handleRestart} />
      </div>
    );
  }

  const isParkingModalOpen =
    isParkingStep &&
    (Boolean(currentParkingState.isLockModalOpen) ||
      Boolean(currentParkingState.activeVehicleId));

  const showGlobalContinue =
    (isCompleted ||
      (isPrimarySpeechBubble && !primarySpeechHasTyping)) &&
    !isDoorsHubStep &&
    (!isWhatsAppStep || isPrisonerWhatsAppStep) &&
    !isQuizStep &&
    !isBookend &&
    !isParkingModalOpen;

  const showSecondarySpeechBubble =
    secondaryData?.type === 'SpeechBubble' &&
    !(isChecklistStep && checklistHasInteracted) &&
    (!isDepositsScreenOpen || primaryData?.type !== 'DepositsBtn') &&
    !(isParkingStep && Boolean(currentParkingState.isGateOpened));

  return (
    <div
      className="system-container"
      style={{
        backgroundImage: backgroundMap[stepData.background]
          ? `url(${backgroundMap[stepData.background]})`
          : 'none',
      }}
    >
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
          onComplete={isDoorsHubStep ? handleNextStep : handleComplete}
          onNext={handleNextStep}
          onRestart={handleRestart}
          continueSignal={continueSignal}
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
                parkingState: currentParkingState,
                onParkingStateChange: handleParkingStateChange,
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

      {/* בועת דיבור משנית */}
      {showSecondarySpeechBubble && (
        <SpeechBubble
          {...(secondaryData.props || {})}
          typeAnimation={false}
          isCompleted={isCompleted}
        />
      )}

      {/* כפתור המשך גלובלי */}
      {showGlobalContinue && (
        <ContinueBtn onClick={handleGlobalContinue} />
      )}
    </div>
  );
}