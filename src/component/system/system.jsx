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
import bg2 from '../../assets/backgrounds/bg-2.png';
import bg3 from '../../assets/backgrounds/bg-3.png';
import bg4 from '../../assets/backgrounds/bg-4.png';
import bg5 from '../../assets/backgrounds/bg-5.png';
import whiteboardFrames from '../../assets/backgrounds/whiteboard_frames.png';

// ==========================================
// מיפוי קומפוננטות
// ==========================================

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
  WriteboardScreen,
};

// ==========================================
// מיפוי רקעים
// ==========================================

const backgroundMap = {
  'bg-1': bg1,
  'bg-2': bg2,
  'bg-3': bg3,
  'bg-4': bg4,
  'bg-5': bg5,
  whiteboard_frames: whiteboardFrames,
};

// ==========================================
// הגדרות מסדרון הדלתות
// ==========================================

const DOOR_STAGES = [25, 26, 27, 28];

const DOORS_HUB_CONFIG = {
  text: 'מעולה הגעתם כמעט לסוף נשארו לכם רק עוד 4 כיתות לעבור בהם',
  position: {
    top: '10%',
    right: '30%',
  },
  tailTarget: {
    x: '-5%',
    y: '5%',
  },
};

// מספר שלב לפי JSON
const getStageNumber = (page, index) =>
  Number(page?.step ?? page?.id ?? index + 1);

// ==========================================
// קומפוננטת מערכת
// ==========================================

export default function System() {
  const pages = Array.isArray(stages.pages) ? stages.pages : [];

  // ==========================================
  // ניווט כללי
  // ==========================================

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);

  const [isLevelsOpen, setIsLevelsOpen] = useState(false);
  const [continueSignal, setContinueSignal] = useState(0);

  // ==========================================
  // מסדרון הדלתות
  // ==========================================

  const [isDoorsScreenOpen, setIsDoorsScreenOpen] = useState(false);
  const [activeDoorStage, setActiveDoorStage] = useState(null);

  const stage23Index = pages.findIndex(
    (page, index) => getStageNumber(page, index) === 23
  );

  const stage29Index = pages.findIndex(
    (page, index) => getStageNumber(page, index) === 29
  );

  // ==========================================
  // סטטוס השלמת החדרים
  // ==========================================

  const completedDoorStages = DOOR_STAGES.reduce(
    (result, stageNumber) => {
      const stageIndex = pages.findIndex(
        (page, index) => getStageNumber(page, index) === stageNumber
      );

      result[stageNumber] =
        stageIndex !== -1 && completedSteps.includes(stageIndex);

      return result;
    },
    {}
  );

  const allDoorStagesCompleted = DOOR_STAGES.every(
    (stageNumber) => completedDoorStages[stageNumber]
  );

  // ==========================================
  // כניסה לחדר מתוך מסדרון הדלתות
  // ==========================================

  const handleEnterDoorStage = useCallback(
    (stageNumber) => {
      const targetIndex = pages.findIndex(
        (page, index) => getStageNumber(page, index) === stageNumber
      );

      if (targetIndex === -1) {
        console.error(
          `Stage ${stageNumber} was not found in stages.json`
        );
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

      setIsDoorsScreenOpen(false);
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
  const activeStageNumber = getStageNumber(stepData, currentStep);

  const primaryData = stepData?.primaryComponent;
  const secondaryData = stepData?.secondaryComponent;

  const PrimaryComponent = componentMap[primaryData?.type];

  const isBookend = primaryData?.type === 'BookendScreen';

  const isDrivingStep =
    primaryData?.type === 'DrivingScreen' &&
    activeStageNumber === 22;

  const isDoorRoomStep = activeDoorStage !== null;

  const isCompleted = completedSteps.includes(currentStep);

  // ==========================================
  // נהיגה
  // ==========================================

  const [
    isDrivingDestinationReached,
    setIsDrivingDestinationReached,
  ] = useState(false);

  useEffect(() => {
    setIsDrivingDestinationReached(false);
  }, [currentStep]);

  // ==========================================
  // בועות דיבור
  // ==========================================

  const isPrimarySpeechBubble = primaryData?.type === 'SpeechBubble';

  const primarySpeechHasTyping =
    primaryData?.props?.typeAnimation !== false;

  // ==========================================
  // Checklist
  // ==========================================

  const isChecklistStep =
    primaryData?.type === 'ChecklistScreen';

  const checklistItems =
    primaryData?.props?.items || stepData?.items || [];

  const [checklistProgress, setChecklistProgress] = useState({});
  const [checklistStartedSteps, setChecklistStartedSteps] = useState([]);

  const checklistCheckedItems = checklistProgress[currentStep] || {};

  const checklistHasInteracted =
    checklistStartedSteps.includes(currentStep);

  // ==========================================
  // WhatsApp
  // ==========================================

  const isWhatsAppStep =
    primaryData?.type === 'Tablet' &&
    (
      primaryData?.props?.type === 'WhatsAppChat' ||
      primaryData?.props?.tabletType === 'WhatsAppChat'
    );

  const isPrisonerWhatsAppStep =
    isWhatsAppStep && Number(primaryData?.props?.part) === 2;

  // ==========================================
  // מפה
  // ==========================================

  const isLocationMapStep =
    primaryData?.type === 'Tablet' &&
    (
      primaryData?.props?.type === 'LocationMap' ||
      primaryData?.props?.tabletType === 'LocationMap'
    );

  // ==========================================
  // חידון
  // ==========================================

  const isQuizStep =
    primaryData?.type === 'Tablet' &&
    (
      primaryData?.props?.type === 'QuizScreen' ||
      primaryData?.props?.tabletType === 'QuizScreen'
    );

  // ==========================================
  // מגרש חניה
  // ==========================================

  const isParkingStep = primaryData?.type === 'ParkingButton';

  const [parkingProgress, setParkingProgress] = useState({});

  const currentParkingState = parkingProgress[currentStep] || {};

  // ==========================================
  // מסך פיקדונות
  // ==========================================

  const [isDepositsScreenOpen, setIsDepositsScreenOpen] =
    useState(false);

  useEffect(() => {
    setIsDepositsScreenOpen(false);
  }, [currentStep]);

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

  const handleDrivingComplete = useCallback(() => {
    setIsDrivingDestinationReached(true);
    markStepCompleted(currentStep);
  }, [currentStep, markStepCompleted]);

  // ==========================================
  // התקדמות Checklist
  // ==========================================

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

  // ==========================================
  // התקדמות חניה
  // ==========================================

  const handleParkingStateChange = useCallback(
    (updater) => {
      setParkingProgress((prev) => {
        const current = prev[currentStep] || {};

        const nextState =
          typeof updater === 'function'
            ? updater(current)
            : updater;

        return {
          ...prev,
          [currentStep]: nextState,
        };
      });
    },
    [currentStep]
  );

  // ==========================================
  // חזרה למסדרון הדלתות
  // ==========================================

  const handleReturnToDoors = useCallback(() => {
    setActiveDoorStage(null);
    setIsDoorsScreenOpen(true);

    setCurrentStep(stage23Index);

    setContinueSignal(0);
    setIsLevelsOpen(false);
  }, [stage23Index]);

  // ==========================================
  // יציאה ממסדרון הדלתות לשלב 29
  // ==========================================

  const handleLeaveDoors = useCallback(() => {
    if (!allDoorStagesCompleted) return;

    if (stage29Index === -1) {
      console.error('Stage 29 was not found in stages.json');
      return;
    }

    setIsDoorsScreenOpen(false);
    setActiveDoorStage(null);

    setMaxUnlockedStep((prev) =>
      Math.max(prev, stage29Index)
    );

    setCurrentStep(stage29Index);
    setContinueSignal(0);
    setIsLevelsOpen(false);
  }, [allDoorStagesCompleted, stage29Index]);

  // ==========================================
  // מעבר לשלב הבא
  // ==========================================

  const handleNextStep = useCallback(() => {
    markStepCompleted(currentStep);

    if (activeDoorStage !== null) {
      handleReturnToDoors();
      return;
    }

    if (isDoorsScreenOpen) {
      handleLeaveDoors();
      return;
    }

    const stageNumber = getStageNumber(stepData, currentStep);

    if (stageNumber === 23) {
      setIsDoorsScreenOpen(true);

      setMaxUnlockedStep((prev) =>
        Math.max(prev, currentStep)
      );

      setContinueSignal(0);
      setIsLevelsOpen(false);
      return;
    }

    const nextStep = currentStep + 1;

    if (nextStep >= pages.length) {
      setCurrentStep(nextStep);
      return;
    }

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
    isDoorsScreenOpen,
    stepData,
    pages.length,
    markStepCompleted,
    handleReturnToDoors,
    handleLeaveDoors,
  ]);

  // ==========================================
  // טעינה ראשונית ומעבר
  // ==========================================

  const [loadingType, setLoadingType] = useState('initial');
  const [pendingStep, setPendingStep] = useState(null);

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
    if (activeDoorStage !== null) {
      handleReturnToDoors();
      return;
    }

    if (isDoorsScreenOpen) {
      setIsDoorsScreenOpen(false);
      setCurrentStep(stage23Index);
      setContinueSignal(0);
      return;
    }

    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setContinueSignal(0);
    }
  }, [
    currentStep,
    activeDoorStage,
    isDoorsScreenOpen,
    stage23Index,
    handleReturnToDoors,
  ]);

  // ==========================================
  // בחירת שלב מהמפה
  // ==========================================

  const handleSelectStep = useCallback(
    (stepIndex) => {
      if (activeDoorStage !== null || isDoorsScreenOpen) {
        return;
      }

      if (stepIndex <= maxUnlockedStep) {
        setCurrentStep(stepIndex);
        setContinueSignal(0);
        setIsLevelsOpen(false);
      }
    },
    [maxUnlockedStep, activeDoorStage, isDoorsScreenOpen]
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

    setIsDoorsScreenOpen(false);
    setActiveDoorStage(null);

    setPendingStep(null);
    setLoadingType('initial');
  }, []);

  // ==========================================
  // כפתור המשך גלובלי
  // ==========================================

  const handleGlobalContinue = () => {
    if (isDoorsScreenOpen) {
      handleLeaveDoors();
      return;
    }

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
  // מצבי תצוגה
  // ==========================================

  if (loadingType) {
    return <LoadingScreen type={loadingType} />;
  }

  // מסך סיום כאשר currentStep >= pages.length
  if (!stepData) {
    return (
      <div className="system-container">
        <div className="system-top-right-controls">
          <About
            currentStep={pages.length}
            totalSteps={pages.length}
          />
          <LevelsBtn
            isOpen={isLevelsOpen}
            onClick={() => setIsLevelsOpen((prev) => !prev)}
          />
        </div>

        <Levels
          steps={pages}
          currentStep={currentStep}
          maxUnlockedStep={maxUnlockedStep}
          onSelectStep={handleSelectStep}
          isOpen={isLevelsOpen}
          onClose={() => setIsLevelsOpen(false)}
        />

        <BookendScreen
          isStart={false}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  const isParkingModalOpen =
    isParkingStep &&
    (
      Boolean(currentParkingState.isLockModalOpen) ||
      Boolean(currentParkingState.activeVehicleId)
    );

  // כפתור המשך גלובלי
  const showGlobalContinue =
    isDoorsScreenOpen
      ? allDoorStagesCompleted
      : (
          (
            isCompleted ||
            (isPrimarySpeechBubble && !primarySpeechHasTyping)
          ) &&
          (!isWhatsAppStep || isPrisonerWhatsAppStep) &&
          !isQuizStep &&
          !isBookend &&
          !isParkingModalOpen
        );

  // בועת דיבור משנית
  const showSecondarySpeechBubble =
    !isDoorsScreenOpen &&
    !isDrivingStep &&
    secondaryData?.type === 'SpeechBubble' &&
    !(isChecklistStep && checklistHasInteracted) &&
    (!isDepositsScreenOpen || primaryData?.type !== 'DepositsBtn') &&
    !(isParkingStep && Boolean(currentParkingState.isGateOpened));

  // הצגת כפתור השלבים בכל העמודים חוץ מהעמוד הראשון (0)
  const showLevelsBtn = currentStep > 0;

  // ==========================================
  // תצוגה
  // ==========================================

  return (
    <div
      className="system-container"
      style={{
        backgroundImage: backgroundMap[stepData.background]
          ? `url(${backgroundMap[stepData.background]})`
          : 'none',
      }}
    >
      {/* סרגל כפתורים ימני עליון: About ראשון מימין ו-LevelsBtn משמאלו */}
      <div className="system-top-right-controls">
        <About
          currentStep={currentStep}
          totalSteps={pages.length}
        />

        {showLevelsBtn && (
          <LevelsBtn
            isOpen={isLevelsOpen}
            onClick={() => setIsLevelsOpen((prev) => !prev)}
          />
        )}
      </div>

      {/* כפתור חזור */}
      {!isBookend &&
        (currentStep > 0 || isDoorsScreenOpen) && (
          <ReturnBtn onClick={handlePreviousStep} />
        )}

      {/* רשימת השלבים */}
      {showLevelsBtn && (
        <Levels
          steps={pages}
          currentStep={currentStep}
          maxUnlockedStep={maxUnlockedStep}
          onSelectStep={handleSelectStep}
          isOpen={isLevelsOpen}
          onClose={() => setIsLevelsOpen(false)}
        />
      )}

      {/* ======================================
          מסדרון הדלתות
      ====================================== */}

      {isDoorsScreenOpen && (
        <>
          <DoorsScreen
            completedStages={completedDoorStages}
            onEnterStage={handleEnterDoorStage}
            onComplete={handleLeaveDoors}
          />

          <SpeechBubble
            step={24}
            text={DOORS_HUB_CONFIG.text}
            typeAnimation={false}
            position={DOORS_HUB_CONFIG.position}
            tailTarget={DOORS_HUB_CONFIG.tailTarget}
          />
        </>
      )}

      {/* ======================================
          קומפוננטה ראשית של שלב רגיל
      ====================================== */}

      {!isDoorsScreenOpen && PrimaryComponent && (
        <PrimaryComponent
          key={
            primaryData?.type === 'FlipCards' ||
            primaryData?.type === 'WriteboardScreen' ||
            isDoorRoomStep
              ? currentStep
              : undefined
          }
          {...(primaryData.props || {})}
          step={activeStageNumber}
          currentStep={currentStep}
          isCompleted={isCompleted}
          onComplete={
            isDrivingStep
              ? handleDrivingComplete
              : handleComplete
          }
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

          {...(isParkingStep
            ? {
                parkingState: currentParkingState,
                onParkingStateChange: handleParkingStateChange,
              }
            : {})}
        />
      )}

      {/* קומפוננטה חסרה */}
      {!isDoorsScreenOpen && !PrimaryComponent && (
        <div className="system-missing-component">
          <h2>הקומפוננטה עדיין לא מחוברת</h2>
          <p>{primaryData?.type || 'לא הוגדרה קומפוננטה'}</p>
          <p>שלב מספר: {currentStep}</p>
        </div>
      )}

      {/* ======================================
          בועת דיבור משנית
      ====================================== */}

      {!isDoorsScreenOpen &&
        showSecondarySpeechBubble && (
          <SpeechBubble
            {...(secondaryData.props || {})}
            step={activeStageNumber}
            zIndex={secondaryData.props?.zIndex ?? 600}
            text={
              isDrivingStep
                ? isDrivingDestinationReached
                  ? 'בשביל לחזור על מה שעברנו משוך את ההגה שמאלה'
                  : 'משוך את ההגה ימינה בשביל להמשיך'
                : secondaryData.props?.text
            }
            typeAnimation={false}
            isCompleted={isCompleted}
          />
        )}

      {/* ======================================
          כפתור המשך גלובלי
      ====================================== */}

      {showGlobalContinue && (
        <ContinueBtn onClick={handleGlobalContinue} />
      )}
    </div>
  );
}