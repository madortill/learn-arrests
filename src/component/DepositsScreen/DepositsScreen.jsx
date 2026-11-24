import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from 'react';

import './DepositsScreen.css';

// תמונות קבועות של העיצוב
import filmRollTop from '../../assets/Deposits/film_roll_top.png';
import filmHand from '../../assets/Deposits/film_hand.png';
import textFrameBg from '../../assets/Deposits/text_frame_bg.png';

// טעינת כל התמונות מתיקיית הפיקדונות
const assets = import.meta.glob(
  '../../assets/Deposits/*',
  {
    eager: true,
    query: '?url',
    import: 'default',
  }
);

// יצירת מפת תמונות לפי שם הקובץ
const imageMap = Object.fromEntries(
  Object.entries(assets).map(([path, url]) => [
    path.split('/').pop(),
    url,
  ])
);

const getImage = (fileName) => {
  if (!fileName) return '';

  const image = imageMap[fileName];

  if (!image) {
    console.warn(`Deposits image not found: ${fileName}`);
    return '';
  }

  return image;
};

const DRAG_THRESHOLD = 45;

const DepositsScreen = ({
  content,
  initialStep = 0,
  onProgressChange,
  onComplete,
}) => {
  const steps = content?.steps || [];
  const finalFrame = content?.finalFrame || {};
  const TOTAL_STEPS = steps.length;

  // חוזרים תמיד בדיוק לנקודה שבה עצרנו
  const safeInitialStep = Math.max(
    0,
    Math.min(initialStep, TOTAL_STEPS)
  );

  // 0 = פריים ראשון, TOTAL_STEPS = פריים אחרון
  const [activeStep, setActiveStep] = useState(safeInitialStep);

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [filmPosition, setFilmPosition] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const filmAreaRef = useRef(null);
  const filmAssemblyRef = useRef(null);

  const dragStartY = useRef(0);
  const dragOffsetRef = useRef(0);
  const pointerIdRef = useRef(null);

  const activeStepRef = useRef(safeInitialStep);

  // מונע שליחת השלמה חוזרת כאשר חוזרים לפריים האחרון
  const completionNotifiedRef = useRef(
    safeInitialStep >= TOTAL_STEPS
  );

  // =========================================
  // מיקום הסרט לפי מרכז הפריים הפעיל
  // =========================================

  const updateFilmPosition = useCallback((animate = false) => {
    const area = filmAreaRef.current;
    const assembly = filmAssemblyRef.current;

    if (!area || !assembly) return;

    const activeFrame = assembly.querySelector(
      `[data-step-index="${activeStepRef.current}"]`
    );

    if (!activeFrame) return;

    const frameTop =
      activeFrame.getBoundingClientRect().top -
      assembly.getBoundingClientRect().top;

    const frameCenter =
      frameTop + activeFrame.offsetHeight / 2;

    const areaCenter = area.clientHeight * 0.43;

    setShouldAnimate(animate);
    setFilmPosition(areaCenter - frameCenter);
  }, []);

  // מיקום מיידי לפני הציור הראשון כדי שייפתח ישר על הפריים השמור
  useLayoutEffect(() => {
    updateFilmPosition(false);
  }, [updateFilmPosition]);

  // עדכון מיקום ללא אנימציה בשינוי גודל מסך או טעינת תמונות
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      updateFilmPosition(false);
    });

    if (filmAreaRef.current) {
      observer.observe(filmAreaRef.current);
    }

    if (filmAssemblyRef.current) {
      observer.observe(filmAssemblyRef.current);
    }

    return () => observer.disconnect();
  }, [updateFilmPosition]);

  // =========================================
  // עדכון שלב ושמירת התקדמות
  // =========================================

  const changeStep = (nextStep) => {
    activeStepRef.current = nextStep;
    setActiveStep(nextStep);
    updateFilmPosition(true);

    onProgressChange?.(nextStep);
  };

  // =========================================
  // מעבר לשלב הבא
  // =========================================

  const advanceStep = () => {
    const currentStep = activeStepRef.current;

    if (currentStep >= TOTAL_STEPS) return;

    const nextStep = currentStep + 1;

    changeStep(nextStep);

    // בסיום המשיכה האחרונה מפעילים את כפתור ההמשך הגלובלי
    if (
      nextStep === TOTAL_STEPS &&
      !completionNotifiedRef.current
    ) {
      completionNotifiedRef.current = true;
      onComplete?.();
    }
  };

  // =========================================
  // חזרה לשלב הקודם
  // =========================================

  const returnStep = () => {
    const currentStep = activeStepRef.current;

    if (currentStep <= 0) return;

    changeStep(currentStep - 1);
  };

  // =========================================
  // התחלת גרירה
  // =========================================

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    e.preventDefault();

    pointerIdRef.current = e.pointerId;
    dragStartY.current = e.clientY;
    dragOffsetRef.current = 0;

    setDragOffset(0);
    setIsDragging(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (error) {
      console.warn('Pointer capture unavailable', error);
    }
  };

  // =========================================
  // תנועת הגרירה
  // =========================================

  const handlePointerMove = (e) => {
    if (
      pointerIdRef.current === null ||
      pointerIdRef.current !== e.pointerId
    ) {
      return;
    }

    e.preventDefault();

    const distance = e.clientY - dragStartY.current;

    const maxDistance = Math.max(
      100,
      (filmAreaRef.current?.clientHeight || 600) * 0.3
    );

    const limitedDistance = Math.max(
      -maxDistance,
      Math.min(maxDistance, distance)
    );

    dragOffsetRef.current = limitedDistance;
    setDragOffset(limitedDistance);
  };

  // =========================================
  // סיום גרירה
  // =========================================

  const handlePointerUp = (e) => {
    if (
      pointerIdRef.current === null ||
      pointerIdRef.current !== e.pointerId
    ) {
      return;
    }

    const distance = dragOffsetRef.current;

    pointerIdRef.current = null;
    dragOffsetRef.current = 0;

    setIsDragging(false);
    setDragOffset(0);

    if (Math.abs(distance) < DRAG_THRESHOLD) return;

    if (distance > 0) {
      advanceStep();
    } else {
      returnStep();
    }
  };

  // =========================================
  // ביטול גרירה
  // =========================================

  const handlePointerCancel = () => {
    pointerIdRef.current = null;
    dragOffsetRef.current = 0;

    setIsDragging(false);
    setDragOffset(0);
  };

  // =========================================
  // תמונות הסרט לפי הסדר הפיזי
  // =========================================

  const orderedFrames = [
    {
      ...finalFrame,
      step: TOTAL_STEPS,
      isLast: true,
    },
    ...steps
      .map((frame, index) => ({
        ...frame,
        step: index,
        isLast: false,
      }))
      .reverse(),
  ];

  const isFinished = activeStep >= TOTAL_STEPS;

  const currentText = isFinished
    ? finalFrame.text
    : steps[activeStep]?.text;

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="deposits-screen-overlay" dir="ltr">

      {/* צד שמאל – סרט הצילום */}

      <div
        ref={filmAreaRef}
        className={`film-area ${isDragging ? 'is-dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className="film-track-position"
          style={{
            transform: `translate3d(0, ${filmPosition + dragOffset}px, 0)`,
            transition:
              isDragging || !shouldAnimate
                ? 'none'
                : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div ref={filmAssemblyRef} className="film-assembly">

            {/* גליל עליון – תמונה קבועה */}

            <div className="film-roll-top">
              <img
                src={filmRollTop}
                alt=""
                draggable="false"
              />
            </div>

            {/* כל פריימי הסרט */}

            <div className="film-frames">
              {orderedFrames.map((frame) => {
                const isActive = activeStep === frame.step;

                return (
                  <div
                    key={frame.step}
                    data-step-index={frame.step}
                    className={`film-frame-wrapper ${
                      isActive ? 'active-frame' : ''
                    } ${frame.isLast ? 'last-film-frame' : ''}`}
                  >
                    <img
                      src={getImage(frame.image)}
                      alt={frame.alt || ''}
                      draggable="false"
                      className={`film-frame-img ${
                        isActive ? 'clear' : 'blurred'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* אזור ההנחיה בתחתית הסרט */}

            <div className="film-end-panel">
              {!isFinished && (
                <>
                  <span>משוך למטה כדי להמשיך</span>

                  <img
                    src={filmHand}
                    alt=""
                    className="film-hand-icon"
                    draggable="false"
                  />
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* צד ימין – תיבת הטקסט */}

      <div className="text-area" dir="rtl">
        <div className="text-frame-container">

          {/* מסגרת קבועה */}

          <img
            src={textFrameBg}
            alt=""
            className="text-frame-bg"
            draggable="false"
          />

          <div className="text-content">
            <p key={activeStep} className="deposits-text">
              {currentText}
            </p>

            <span className="step-indicator">
              {activeStep} / {TOTAL_STEPS}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default DepositsScreen;