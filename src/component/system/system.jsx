import React, { useState, useCallback, useEffect, useMemo } from 'react';

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
// מיפוי קומפוננטות ורקעים
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

const backgroundMap = {
  'bg-1': bg1,
  'bg-2': bg2,
  'bg-3': bg3,
  'bg-4': bg4,
  'bg-5': bg5,
  whiteboard_frames: whiteboardFrames,
};

// ==========================================
// הגדרות מסדרון הדלתות ומסכי מעבר
// ==========================================

const DOORS_ENTRY_STAGE = 23;
const DOORS_EXIT_STAGE = 28;
const DOOR_STAGES = [24, 25, 26, 27];
const TRANSITION_STAGES = [12, 21];
const LOADING_DURATION_MS = 3000;

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

const getStageNumber = (page, index) =>
  Number(page?.step ?? page?.id ?? index + 1);

// ==========================================
// קומפוננטת מערכת ראשית
// ==========================================

export default function System() {
  const pages = Array.isArray(stages.pages) ? stages.pages : [];

  // ניווט והתקדמות
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState([0]);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  const [continueSignal, setContinueSignal] = useState(0);

  // חלוניות צפות (לא יכולות להיות פתוחות בו-זמנית)
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLevelsOpen, setIsLevelsOpen] = useState(false);

  // מסכי טעינה ומעבר
  const [loadingType, setLoadingType] = useState('initial');
  const [pendingStep, setPendingStep] = useState(null);

  // מסדרון הדלתות (מופיע בין שלב 23 לשלב 24, וכולל את שלבים 24-27)
  const [isDoorsScreenOpen, setIsDoorsScreenOpen] = useState(false);
  const [activeDoorStage, setActiveDoorStage] = useState(null);

  // מצבים פנימיים של שלבים ספציפיים
  const [isDrivingDestinationReached, setIsDrivingDestinationReached] = useState(false);
  const [checklistProgress, setChecklistProgress] = useState({});
  const [checklistStartedSteps, setChecklistStartedSteps] = useState([]);
  const [parkingProgress, setParkingProgress] = useState({});
  const [isDepositsScreenOpen, setIsDepositsScreenOpen] = useState(false);

  // רישום אוטומטי של כל שלב שהמשתמש נכנס אליו
  useEffect(() => {
    if (isDoorsScreenOpen) return;
    setVisitedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep]
    );
  }, [currentStep, isDoorsScreenOpen]);

  // ניהול פתיחה/סגירה בלעדית של About ו-Levels
  const handleToggleAbout = useCallback(() => {
    setIsAboutOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        setIsLevelsOpen(false);
      }
      return nextState;
    });
  }, []);

  const handleCloseAbout = useCallback(() => {
    setIsAboutOpen(false);
  }, []);

  const handleToggleLevels = useCallback(() => {
    setIsLevelsOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        setIsAboutOpen(false);
      }
      return nextState;
    });
  }, []);

  const handleCloseLevels = useCallback(() => {
    setIsLevelsOpen(false);
  }, []);

  const closeFloatingPanels = useCallback(() => {
    setIsAboutOpen(false);
    setIsLevelsOpen(false);
  }, []);

  // אינדקסים של מסדרון הדלתות
  const doorsEntryIndex = useMemo(
    () => pages.findIndex((page, idx) => getStageNumber(page, idx) === DOORS_ENTRY_STAGE),
    [pages]
  );

  const doorsExitIndex = useMemo(
    () => pages.findIndex((page, idx) => getStageNumber(page, idx) === DOORS_EXIT_STAGE),
    [pages]
  );

  // סטטוס השלמת כל דלת (שלבים 24-27)
  const completedDoorStages = useMemo(() => {
    return DOOR_STAGES.reduce((acc, stageNum) => {
      const stageIdx = pages.findIndex((page, idx) => getStageNumber(page, idx) === stageNum);
      acc[stageNum] = stageIdx !== -1 && completedSteps.includes(stageIdx);
      return acc;
    }, {});
  }, [pages, completedSteps]);

  const allDoorStagesCompleted = DOOR_STAGES.every(
    (stageNum) => completedDoorStages[stageNum]
  );

  // נתוני השלב הנוכחי
  const stepData = pages[currentStep];
  const isEndScreen = !stepData;
  const activeStageNumber = getStageNumber(stepData, currentStep);
  const primaryData = stepData?.primaryComponent;
  const secondaryData = stepData?.secondaryComponent;
  const PrimaryComponent = componentMap[primaryData?.type];

  // זיהוי סוג השלב
  const isBookend = isEndScreen || primaryData?.type === 'BookendScreen';
  const isDoorRoomStep = activeDoorStage !== null;
  const isCompleted = completedSteps.includes(currentStep);

  const isDrivingStep =
    primaryData?.type === 'DrivingScreen' && activeStageNumber === 22;

  const isPrimarySpeechBubble = primaryData?.type === 'SpeechBubble';
  const primarySpeechHasTyping = primaryData?.props?.typeAnimation !== false;

  const isChecklistStep = primaryData?.type === 'ChecklistScreen';
  const checklistItems = primaryData?.props?.items || stepData?.items || [];
  const checklistCheckedItems = checklistProgress[currentStep] || {};
  const checklistHasInteracted = checklistStartedSteps.includes(currentStep);

  const tabletSubType = primaryData?.props?.type || primaryData?.props?.tabletType;
  const isTabletStep = primaryData?.type === 'Tablet';
  const isWhatsAppStep = isTabletStep && tabletSubType === 'WhatsAppChat';
  const isPrisonerWhatsAppStep = isWhatsAppStep && Number(primaryData?.props?.part) === 2;
  const isLocationMapStep = isTabletStep && tabletSubType === 'LocationMap';
  const isQuizStep = isTabletStep && tabletSubType === 'QuizScreen';

  const isParkingStep = primaryData?.type === 'ParkingButton';
  const currentParkingState = parkingProgress[currentStep] || {};
  const isParkingModalOpen =
    isParkingStep &&
    (Boolean(currentParkingState.isLockModalOpen) || Boolean(currentParkingState.activeVehicleId));

  // איפוס מצבים מקומיים במעבר שלב
  useEffect(() => {
    setIsDrivingDestinationReached(false);
    setIsDepositsScreenOpen(false);
  }, [currentStep]);

  // טיימר טעינה ראשונית
  useEffect(() => {
    if (loadingType !== 'initial') return;
    const timer = setTimeout(() => setLoadingType(null), LOADING_DURATION_MS);
    return () => clearTimeout(timer);
  }, [loadingType]);

  // טיימר מסך מעבר בין פרקים
  useEffect(() => {
    if (loadingType !== 'transition' || pendingStep === null) return;

    const timer = setTimeout(() => {
      setMaxUnlockedStep((prev) => Math.max(prev, pendingStep));
      setCurrentStep(pendingStep);
      setContinueSignal(0);
      setPendingStep(null);
      setLoadingType(null);
    }, LOADING_DURATION_MS);

    return () => clearTimeout(timer);
  }, [loadingType, pendingStep]);

  // ==========================================
  // פעולות השלמה וניווט
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

  const handleParkingStateChange = useCallback(
    (updater) => {
      setParkingProgress((prev) => {
        const current = prev[currentStep] || {};
        const nextState = typeof updater === 'function' ? updater(current) : updater;
        return {
          ...prev,
          [currentStep]: nextState,
        };
      });
    },
    [currentStep]
  );

  // כניסה לחדר (24-27) מתוך מסדרון הדלתות
  const handleEnterDoorStage = useCallback(
    (stageNumber) => {
      const targetIndex = pages.findIndex(
        (page, idx) => getStageNumber(page, idx) === stageNumber
      );

      if (targetIndex === -1) {
        console.error(`Stage ${stageNumber} was not found in stages.json`);
        return;
      }

      if (stageNumber === 25 && !completedDoorStages[24]) return;
      if (
        stageNumber === 27 &&
        !(completedDoorStages[24] && completedDoorStages[25] && completedDoorStages[26])
      ) {
        return;
      }

      setIsDoorsScreenOpen(false);
      setActiveDoorStage(stageNumber);
      setCurrentStep(targetIndex);
      setContinueSignal(0);
      closeFloatingPanels();
    },
    [pages, completedDoorStages, closeFloatingPanels]
  );

  // חזרה למסדרון הדלתות
  const handleReturnToDoors = useCallback(() => {
    setActiveDoorStage(null);
    setIsDoorsScreenOpen(true);
    if (doorsEntryIndex !== -1) {
      setCurrentStep(doorsEntryIndex);
    }
    setContinueSignal(0);
    closeFloatingPanels();
  }, [doorsEntryIndex, closeFloatingPanels]);

  // יציאה ממסדרון הדלתות לאחר השלמת כל החדרים אל שלב הסיום (28)
  const handleLeaveDoors = useCallback(() => {
    if (!allDoorStagesCompleted) return;

    const targetIndex =
      doorsExitIndex !== -1 ? doorsExitIndex : pages.length - 1;

    setIsDoorsScreenOpen(false);
    setActiveDoorStage(null);
    setMaxUnlockedStep((prev) => Math.max(prev, targetIndex));
    setCurrentStep(targetIndex);
    setContinueSignal(0);
    closeFloatingPanels();
  }, [allDoorStagesCompleted, doorsExitIndex, pages.length, closeFloatingPanels]);

  // מעבר לשלב הבא
  const handleNextStep = useCallback(() => {
    markStepCompleted(currentStep);

    // מתוך אחד מחדרי הדלתות (24-27) חוזרים תמיד למסדרון הדלתות
    if (activeDoorStage !== null) {
      handleReturnToDoors();
      return;
    }

    // יציאה ממסדרון הדלתות לאחר סיום כל 4 הדלתות
    if (isDoorsScreenOpen) {
      handleLeaveDoors();
      return;
    }

    // בסיום שלב 23 עוברים למצב הדלתות (בין 23 ל-24)
    if (activeStageNumber === DOORS_ENTRY_STAGE) {
      setIsDoorsScreenOpen(true);
      setMaxUnlockedStep((prev) => Math.max(prev, currentStep));
      setContinueSignal(0);
      closeFloatingPanels();
      return;
    }

    const nextStep = currentStep + 1;

    if (nextStep >= pages.length) {
      setCurrentStep(nextStep);
      return;
    }

    if (TRANSITION_STAGES.includes(activeStageNumber)) {
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
    isDoorsScreenOpen,
    activeStageNumber,
    pages.length,
    markStepCompleted,
    handleReturnToDoors,
    handleLeaveDoors,
    closeFloatingPanels,
  ]);

  // חזרה לשלב הקודם
  const handlePreviousStep = useCallback(() => {
    if (activeDoorStage !== null) {
      handleReturnToDoors();
      return;
    }

    if (isDoorsScreenOpen) {
      setIsDoorsScreenOpen(false);
      if (doorsEntryIndex !== -1) {
        setCurrentStep(doorsEntryIndex);
      }
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
    doorsEntryIndex,
    handleReturnToDoors,
  ]);

  // בחירת שלב ממפת השלבים (פתוח לכל שלב שהמשתמש כבר ביקר בו)
  const handleSelectStep = useCallback(
    (stepIndex) => {
      if (!visitedSteps.includes(stepIndex)) return;

      const targetStageNum = getStageNumber(pages[stepIndex], stepIndex);
      if (DOOR_STAGES.includes(targetStageNum)) {
        setIsDoorsScreenOpen(false);
        setActiveDoorStage(targetStageNum);
      } else {
        setIsDoorsScreenOpen(false);
        setActiveDoorStage(null);
      }

      setCurrentStep(stepIndex);
      setContinueSignal(0);
      closeFloatingPanels();
    },
    [visitedSteps, pages, closeFloatingPanels]
  );

  // איפוס מלא של הלומדה
  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setVisitedSteps([0]);
    setCompletedSteps([]);
    setMaxUnlockedStep(0);
    setContinueSignal(0);

    setChecklistProgress({});
    setChecklistStartedSteps([]);
    setParkingProgress({});

    setIsDepositsScreenOpen(false);
    closeFloatingPanels();
    setIsDoorsScreenOpen(false);
    setActiveDoorStage(null);

    setPendingStep(null);
    setLoadingType('initial');
  }, [closeFloatingPanels]);

  // לחיצה על כפתור ההמשך הגלובלי
  const handleGlobalContinue = () => {
    if (isDoorsScreenOpen) {
      handleLeaveDoors();
      return;
    }

    if (isLocationMapStep && primaryData?.props?.generalImportantPoint) {
      setContinueSignal((prev) => prev + 1);
      return;
    }

    handleNextStep();
  };

  // ==========================================
  // תצוגת מסך טעינה
  // ==========================================

  if (loadingType) {
    return <LoadingScreen type={loadingType} />;
  }

  // ==========================================
  // תנאי תצוגה לפקדים גלובליים
  // ==========================================

  const showLevelsBtn = currentStep > 0;
  const showReturnBtn = !isBookend && (currentStep > 0 || isDoorsScreenOpen);

  const showGlobalContinue = isDoorsScreenOpen
    ? allDoorStagesCompleted
    : (isCompleted || (isPrimarySpeechBubble && !primarySpeechHasTyping)) &&
      (!isWhatsAppStep || isPrisonerWhatsAppStep) &&
      !isQuizStep &&
      !isBookend &&
      !isParkingModalOpen;

  const showSecondarySpeechBubble =
    !isDoorsScreenOpen &&
    !isDrivingStep &&
    secondaryData?.type === 'SpeechBubble' &&
    !(isChecklistStep && checklistHasInteracted) &&
    (!isDepositsScreenOpen || primaryData?.type !== 'DepositsBtn') &&
    !(isParkingStep && Boolean(currentParkingState.isGateOpened));

  const backgroundStyle =
    !isEndScreen && backgroundMap[stepData?.background]
      ? { backgroundImage: `url(${backgroundMap[stepData.background]})` }
      : undefined;

  // ==========================================
  // רינדור המסך
  // ==========================================

  return (
    <div className="system-container" style={backgroundStyle}>
      {/* סרגל עליון ימני: About ראשון מימין ו-LevelsBtn משמאלו */}
      <div className="system-top-right-controls">
        <About
          currentStep={isEndScreen ? pages.length : currentStep}
          totalSteps={pages.length}
          isOpen={isAboutOpen}
          onToggle={handleToggleAbout}
          onClose={handleCloseAbout}
        />

        {showLevelsBtn && (
          <LevelsBtn
            isOpen={isLevelsOpen}
            onClick={handleToggleLevels}
          />
        )}
      </div>

      {/* כפתור חזור */}
      {showReturnBtn && <ReturnBtn onClick={handlePreviousStep} />}

      {/* חלונית מפת השלבים (במצב דלתות currentStep הוא null כך שאין שלב מסומן כנוכחי) */}
      {showLevelsBtn && (
        <Levels
          steps={pages}
          currentStep={isDoorsScreenOpen ? null : currentStep}
          visitedSteps={visitedSteps}
          onSelectStep={handleSelectStep}
          isOpen={isLevelsOpen}
          onClose={handleCloseLevels}
        />
      )}

      {/* מסך סיום במקרה של חריגה מאורך המערך */}
      {isEndScreen && (
        <BookendScreen isStart={false} onRestart={handleRestart} />
      )}

      {/* מסדרון הדלתות (מופיע בין שלב 23 לשלב 24) */}
      {!isEndScreen && isDoorsScreenOpen && (
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

      {/* קומפוננטה ראשית של שלב רגיל */}
      {!isEndScreen && !isDoorsScreenOpen && PrimaryComponent && (
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
          onComplete={isDrivingStep ? handleDrivingComplete : handleComplete}
          onNext={handleNextStep}
          onRestart={handleRestart}
          continueSignal={continueSignal}
          {...(primaryData?.type === 'DepositsBtn'
            ? { onScreenOpenChange: setIsDepositsScreenOpen }
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

      {/* הודעת חיווי במידה וקומפוננטה חסרה */}
      {!isEndScreen && !isDoorsScreenOpen && !PrimaryComponent && (
        <div className="system-missing-component">
          <h2>הקומפוננטה עדיין לא מחוברת</h2>
          <p>{primaryData?.type || 'לא הוגדרה קומפוננטה'}</p>
          <p>שלב מספר: {currentStep}</p>
        </div>
      )}

      {/* בועת דיבור משנית */}
      {!isEndScreen && !isDoorsScreenOpen && showSecondarySpeechBubble && (
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

      {/* כפתור המשך גלובלי */}
      {!isEndScreen && showGlobalContinue && (
        <ContinueBtn onClick={handleGlobalContinue} />
      )}
    </div>
  );
}