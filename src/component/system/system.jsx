import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useLayoutEffect,
} from 'react';

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
import bg6 from '../../assets/backgrounds/bg-6.png';
import whiteboardFrames from '../../assets/backgrounds/whiteboard_frames.png';
// כאשר תשני את שם קובץ הדמות, עדכני כאן את השם החדש:
import characterImg from '../../assets/backgrounds/דמות.png';

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
  'bg-6': bg6,
  whiteboard_frames: whiteboardFrames,
};

const CHARACTER_OVERLAY_BACKGROUNDS = ['bg-3', 'bg-5'];

// נקודת הפה בתוך תמונת הדמות (באחוזים מרוחב וגובה תמונת הדמות)
const CHARACTER_MOUTH_ANCHOR = {
  x: 0.65,
  y: 0.115,
};

// יחס מסך הייחוס (1440x1024) לתיאום מיקום זנב בועת הדיבור
const REFERENCE_ASPECT_RATIO = 1440 / 1024;

// ==========================================
// חישוב מיקום רספונסיבי לדמות מול קצה בועת הדיבור
// ==========================================

function getCalibratedTailYPercent(basePercent, width, height) {
  if (!width || !height) return basePercent;

  const aspectRatio = width / height;
  const deltaRatio = aspectRatio - REFERENCE_ASPECT_RATIO;
  const offset = deltaRatio * 13.8;
  const calibrated = basePercent - offset;

  return Math.max(0, Math.min(100, calibrated));
}

function parseCoordinateX(value, totalWidth) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;

  const trimmed = value.trim();
  if (trimmed.endsWith('%')) {
    return (parseFloat(trimmed) / 100) * totalWidth;
  }
  return parseFloat(trimmed) || 0;
}

function resolveCalibratedTailY(rawY, width, height) {
  if (rawY === undefined || rawY === null || rawY === '') {
    return (getCalibratedTailYPercent(30, width, height) / 100) * height;
  }

  if (typeof rawY === 'string' && rawY.trim().endsWith('%')) {
    const basePercent = parseFloat(rawY);
    return (getCalibratedTailYPercent(basePercent, width, height) / 100) * height;
  }

  if (typeof rawY === 'number') {
    return (getCalibratedTailYPercent(rawY, width, height) / 100) * height;
  }

  return parseFloat(rawY) || 0;
}

function extractStageTailTarget(stepData) {
  if (!stepData) return null;

  if (stepData.secondaryComponent?.type === 'SpeechBubble') {
    const target = stepData.secondaryComponent.props?.tailTarget;
    if (target) return target;
  }

  if (stepData.primaryComponent?.type === 'SpeechBubble') {
    const target = stepData.primaryComponent.props?.tailTarget;
    if (target) return target;
  }

  return null;
}

// ==========================================
// הגדרות מסדרון הדלתות, מעברים ושמירת התקדמות
// ==========================================

const DOORS_ENTRY_STAGE = 23;
const DOORS_EXIT_STAGE = 28;
const DOOR_STAGES = [24, 25, 26, 27];
const TRANSITION_STAGES = [12, 21];
const LOADING_DURATION_MS = 3000;
const PROGRESS_STORAGE_KEY = 'lomda-progress';

const getStageNumber = (page, index) =>
  Number(page?.step ?? page?.id ?? index + 1);

const loadSavedProgress = (totalPages) => {
  try {
    const raw = sessionStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const safeCurrentStep =
      typeof parsed.currentStep === 'number' &&
      parsed.currentStep >= 0 &&
      parsed.currentStep <= totalPages
        ? parsed.currentStep
        : 0;

    return {
      currentStep: safeCurrentStep,
      visitedSteps: Array.isArray(parsed.visitedSteps)
        ? parsed.visitedSteps
        : [safeCurrentStep],
      completedSteps: Array.isArray(parsed.completedSteps)
        ? parsed.completedSteps
        : [],
      maxUnlockedStep:
        typeof parsed.maxUnlockedStep === 'number'
          ? parsed.maxUnlockedStep
          : safeCurrentStep,
      isDoorsScreenOpen: Boolean(parsed.isDoorsScreenOpen),
      activeDoorStage: parsed.activeDoorStage ?? null,
      checklistProgress:
        parsed.checklistProgress && typeof parsed.checklistProgress === 'object'
          ? parsed.checklistProgress
          : {},
      checklistStartedSteps: Array.isArray(parsed.checklistStartedSteps)
        ? parsed.checklistStartedSteps
        : [],
      parkingProgress:
        parsed.parkingProgress && typeof parsed.parkingProgress === 'object'
          ? parsed.parkingProgress
          : {},
      stepProgress:
        parsed.stepProgress && typeof parsed.stepProgress === 'object'
          ? parsed.stepProgress
          : {},
    };
  } catch {
    return null;
  }
};

// ==========================================
// קומפוננטת מערכת ראשית
// ==========================================

export default function System() {
  const pages = Array.isArray(stages.pages) ? stages.pages : [];
  const initialSaved = useMemo(
    () => loadSavedProgress(pages.length),
    [pages.length]
  );

  // גודל חלון נוכחי לחישוב רספונסיבי מדויק של הדמות מול בועת הדיבור
  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 1024,
  }));

  useLayoutEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ניווט והתקדמות
  const [currentStep, setCurrentStep] = useState(
    () => initialSaved?.currentStep ?? 0
  );
  const [visitedSteps, setVisitedSteps] = useState(
    () => initialSaved?.visitedSteps ?? [0]
  );
  const [completedSteps, setCompletedSteps] = useState(
    () => initialSaved?.completedSteps ?? []
  );
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(
    () => initialSaved?.maxUnlockedStep ?? 0
  );
  const [continueSignal, setContinueSignal] = useState(0);

  // חלוניות צפות (לא יכולות להיות פתוחות בו-זמנית)
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLevelsOpen, setIsLevelsOpen] = useState(false);

  // מסכי טעינה ומעבר (מדלג על טעינה ראשונית כשחוזרים מהתקדמות שמורה)
  const [loadingType, setLoadingType] = useState(() =>
    initialSaved ? null : 'initial'
  );
  const [pendingStep, setPendingStep] = useState(null);

  // מסדרון הדלתות (מופיע בין שלב 23 לשלב 24, וכולל את שלבים 24-27)
  const [isDoorsScreenOpen, setIsDoorsScreenOpen] = useState(
    () => initialSaved?.isDoorsScreenOpen ?? false
  );
  const [activeDoorStage, setActiveDoorStage] = useState(
    () => initialSaved?.activeDoorStage ?? null
  );

  // מצבים פנימיים של שלבים ספציפיים
  const [checklistProgress, setChecklistProgress] = useState(
    () => initialSaved?.checklistProgress ?? {}
  );
  const [checklistStartedSteps, setChecklistStartedSteps] = useState(
    () => initialSaved?.checklistStartedSteps ?? []
  );
  const [parkingProgress, setParkingProgress] = useState(
    () => initialSaved?.parkingProgress ?? {}
  );
  const [stepProgress, setStepProgress] = useState(
    () => initialSaved?.stepProgress ?? {}
  );
  const [isDepositsScreenOpen, setIsDepositsScreenOpen] = useState(false);

  // שמירת כל התקדמות המשתמש ב-sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify({
          currentStep,
          visitedSteps,
          completedSteps,
          maxUnlockedStep,
          isDoorsScreenOpen,
          activeDoorStage,
          checklistProgress,
          checklistStartedSteps,
          parkingProgress,
          stepProgress,
        })
      );
    } catch (error) {
      console.warn('Could not save lomda progress', error);
    }
  }, [
    currentStep,
    visitedSteps,
    completedSteps,
    maxUnlockedStep,
    isDoorsScreenOpen,
    activeDoorStage,
    checklistProgress,
    checklistStartedSteps,
    parkingProgress,
    stepProgress,
  ]);

  // איפוס מצב מסך הפיקדונות רק בעזיבה לשלב שאינו מסך פיקדונות
  useEffect(() => {
    if (pages[currentStep]?.primaryComponent?.type !== 'DepositsBtn') {
      setIsDepositsScreenOpen(false);
    }
  }, [currentStep, pages]);

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
  const currentBackgroundKey = !isEndScreen ? stepData?.background : null;
  const primaryData = stepData?.primaryComponent;
  const secondaryData = stepData?.secondaryComponent;
  const PrimaryComponent = componentMap[primaryData?.type];

  // זיהוי סוג השלב
  const isBookend = isEndScreen || primaryData?.type === 'BookendScreen';
  const isDoorRoomStep = activeDoorStage !== null;
  const isCompleted = completedSteps.includes(currentStep);

  const isDrivingStep =
    primaryData?.type === 'DrivingScreen' && activeStageNumber === 22;
  const isDrivingDestinationReached =
    isDrivingStep &&
    (isCompleted || Boolean(stepProgress[currentStep]?.isDestinationReached));

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
  const isParkingInteracted =
    Boolean(currentParkingState.hasInteracted) ||
    Boolean(currentParkingState.isLockModalOpen) ||
    Boolean(currentParkingState.isGateOpened);
  const isParkingModalOpen =
    isParkingStep &&
    (Boolean(currentParkingState.isLockModalOpen) || Boolean(currentParkingState.activeVehicleId));
  const isParkingScreenOpen =
    isParkingStep &&
    (Boolean(currentParkingState.isGateOpened) || isCompleted);

  // הצגת הדמות ברקעים 3 ו-5 (מוסתרת כאשר ParkingScreen פתוח או כשנפתח המנעול בחניה)
  const showCharacterOverlay =
    !isEndScreen &&
    !isDoorsScreenOpen &&
    CHARACTER_OVERLAY_BACKGROUNDS.includes(currentBackgroundKey) &&
    !(isParkingStep && (isParkingScreenOpen || isParkingModalOpen));

  // חישוב מיקום וגודל הדמות עבור רקעים 3 ו-5 (מוגדלת יותר ברקע 3 בלבד)
  const characterOverlayStyle = useMemo(() => {
    if (!showCharacterOverlay) return undefined;

    const { width: vw, height: vh } = viewportSize;
    const tailTarget = extractStageTailTarget(stepData);
    const isBg3 = currentBackgroundKey === 'bg-3';

    // ברקע 3 הדמות גדולה יותר (כ-86% מגובה המסך), וברקע 5 נשארת על 75%
    const heightRatio = isBg3 ? 0.86 : 0.75;
    const maxWidthRatio = isBg3 ? 0.5 : 0.44;
    const charHeight = Math.min(vh * heightRatio, vw * maxWidthRatio);
    const charWidth = charHeight * (341 / 850);

    // נקודת ברירת מחדל אם לא הוגדר tailTarget בשלב
    const targetX = tailTarget
      ? parseCoordinateX(tailTarget.x, vw)
      : vw * 0.25;
    const targetY = tailTarget
      ? resolveCalibratedTailY(tailTarget.y, vw, vh)
      : (getCalibratedTailYPercent(28, vw, vh) / 100) * vh;

    // מרווח של כמה פיקסלים ימינה מהפה כדי שקצה הבועה לא יגע ישירות בפה
    const mouthGapX = Math.max(12, Math.round(vw * 0.012));
    const mouthGapY = Math.round(vh * 0.004);

    const rawLeft = targetX - mouthGapX - charWidth * CHARACTER_MOUTH_ANCHOR.x;
    const rawTop = targetY - mouthGapY - charHeight * CHARACTER_MOUTH_ANCHOR.y;

    // הגבלה עדינה כדי שהדמות לא תיחתך מחוץ לגבולות המסך
    const minTop = isBg3 ? vh * 0.02 : vh * 0.04;
    const clampedLeft = Math.max(
      -charWidth * 0.12,
      Math.min(vw - charWidth * 0.88, rawLeft)
    );
    const clampedTop = Math.max(
      minTop,
      Math.min(vh - charHeight * 0.92, rawTop)
    );

    return {
      left: `${Math.round(clampedLeft)}px`,
      top: `${Math.round(clampedTop)}px`,
      height: `${Math.round(charHeight)}px`,
      width: `${Math.round(charWidth)}px`,
    };
  }, [showCharacterOverlay, viewportSize, stepData, currentBackgroundKey]);

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

  const handleSaveStepState = useCallback(
    (updater) => {
      setStepProgress((prev) => {
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

  const handleDrivingComplete = useCallback(() => {
    handleSaveStepState((prev) => ({
      ...prev,
      isDestinationReached: true,
    }));
    markStepCompleted(currentStep);
  }, [currentStep, handleSaveStepState, markStepCompleted]);

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

    if (activeDoorStage !== null) {
      handleReturnToDoors();
      return;
    }

    if (isDoorsScreenOpen) {
      handleLeaveDoors();
      return;
    }

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

  // בחירת שלב ממפת השלבים
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
    setStepProgress({});

    try {
      sessionStorage.removeItem(PROGRESS_STORAGE_KEY);
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('deposits-')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {
      // התעלמות משגיאת אחסון במידה ואינו זמין
    }

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
    !(isParkingStep && isParkingInteracted);

  const backgroundStyle =
    !isEndScreen && currentBackgroundKey && backgroundMap[currentBackgroundKey]
      ? { backgroundImage: `url(${backgroundMap[currentBackgroundKey]})` }
      : undefined;

  const containerClasses = [
    'system-container',
    currentBackgroundKey ? `is-${currentBackgroundKey}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ==========================================
  // רינדור המסך
  // ==========================================

  return (
    <div className={containerClasses} style={backgroundStyle}>
      {/* דמות על גבי הרקע בשלבים עם bg-3 או bg-5 */}
      {showCharacterOverlay && (
        <img
          src={characterImg}
          alt=""
          aria-hidden="true"
          className="system-stage-character"
          style={characterOverlayStyle}
        />
      )}

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

      {/* חלונית מפת השלבים */}
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

      {/* מסדרון הדלתות */}
      {!isEndScreen && isDoorsScreenOpen && (
        <DoorsScreen
          completedStages={completedDoorStages}
          onEnterStage={handleEnterDoorStage}
          onComplete={handleLeaveDoors}
        />
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
          savedStepState={stepProgress[currentStep]}
          onSaveStepState={handleSaveStepState}
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