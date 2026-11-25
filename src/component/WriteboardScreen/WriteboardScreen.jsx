import React, { useEffect, useRef, useState } from 'react';
import './WriteboardScreen.css';

import blueMarker from '../../assets/blue_marker.png';
import whiteboardImg from '../../assets/whiteboard.png';

const REVEAL_THRESHOLD = 0.75;

/* =========================================
   REVEAL AREA
   אזור חשיפה באמצעות תנועת הטוש (עבור הקוביות)
========================================= */

const RevealArea = ({
  children,
  className = '',
  onComplete,
  resetKey,
  initialCompleted = false,
}) => {
  const canvasRef = useRef(null);
  const previousPointRef = useRef(null);
  const completedRef = useRef(Boolean(initialCompleted));

  const [maskUrl, setMaskUrl] = useState('');
  const [isComplete, setIsComplete] = useState(Boolean(initialCompleted));

  /* =========================================
     סנכרון מצב שמור מהמערכת
  ========================================= */

  useEffect(() => {
    if (initialCompleted) {
      completedRef.current = true;
      setIsComplete(true);
    }
  }, [initialCompleted]);

  /* =========================================
     איפוס בעת החלפת נתוני השלב
  ========================================= */

  useEffect(() => {
    const completed = Boolean(initialCompleted);
    completedRef.current = completed;
    previousPointRef.current = null;
    setIsComplete(completed);
    setMaskUrl('');
  }, [resetKey, initialCompleted]);

  /* =========================================
     יצירת מסכת החשיפה והתאמה לשינוי גודל מסך
  ========================================= */

  useEffect(() => {
    if (initialCompleted || isComplete) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const initializeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // שחור = מוסתר במסכת luminance
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setMaskUrl(canvas.toDataURL());
    };

    initializeCanvas();

    const observer = new ResizeObserver(initializeCanvas);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [resetKey, initialCompleted, isComplete]);

  /* =========================================
     חשיפה באמצעות תנועת הטוש
  ========================================= */

  const handlePointerMove = (event) => {
    if (completedRef.current || event.pointerType === 'touch') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const brushRadius = Math.min(50, Math.max(25, rect.height * 0.48));

    ctx.beginPath();
    ctx.moveTo(
      previousPointRef.current?.x ?? x,
      previousPointRef.current?.y ?? y
    );
    ctx.lineTo(x, y);
    ctx.lineWidth = brushRadius * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    previousPointRef.current = { x, y };

    /* =====================================
       בדיקת אחוז השטח שנחשף
    ===================================== */

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let revealedPixels = 0;
    let totalPixels = 0;

    // דגימה של כל 4 פיקסלים לביצועים מיטביים
    for (let i = 0; i < pixels.length; i += 16) {
      totalPixels++;
      if (pixels[i] > 0) {
        revealedPixels++;
      }
    }

    const revealPercentage = totalPixels > 0 ? revealedPixels / totalPixels : 0;

    if (revealPercentage >= REVEAL_THRESHOLD) {
      completedRef.current = true;
      setIsComplete(true);
      previousPointRef.current = null;
      onComplete?.();
      return;
    }

    setMaskUrl(canvas.toDataURL());
  };

  return (
    <div
      className={`reveal-area ${className} ${
        isComplete ? 'reveal-complete' : ''
      }`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        previousPointRef.current = null;
      }}
    >
      <div
        className={`reveal-content ${
          maskUrl || isComplete ? 'reveal-ready' : ''
        }`}
        style={{
          '--reveal-mask': maskUrl ? `url("${maskUrl}")` : 'none',
        }}
      >
        {children}
      </div>

      <canvas
        ref={canvasRef}
        className="reveal-canvas"
        aria-hidden="true"
      />
    </div>
  );
};

/* =========================================
   WRITEBOARD SCREEN
========================================= */

const WriteboardScreen = ({
  whiteboardData,
  onComplete,
  isCompleted = false,
  savedStepState,
  onSaveStepState,
}) => {
  const {
    title = '',
    subtitle = '',
    bulletPoints = [],
    footerNote = '',
  } = whiteboardData || {};

  const [completedAreas, setCompletedAreas] = useState(
    () => savedStepState?.completedAreas || {}
  );
  const completionSentRef = useRef(Boolean(isCompleted));

  /* =========================================
     סנכרון בעת מעבר בין שלבי לוח
  ========================================= */

  useEffect(() => {
    setCompletedAreas(savedStepState?.completedAreas || {});
    completionSentRef.current = Boolean(isCompleted);
  }, [whiteboardData, savedStepState, isCompleted]);

  /* =========================================
     סימון קובייה שהושלמה ושמירה במערכת
  ========================================= */

  const handleAreaComplete = (areaId) => {
    setCompletedAreas((prev) => {
      if (prev[areaId]) return prev;

      const next = {
        ...prev,
        [areaId]: true,
      };
      onSaveStepState?.({ completedAreas: next });
      return next;
    });
  };

  // רק הקוביות נדרשות לחשיפה; הערת הסיום גלויה מההתחלה
  const totalAreas = bulletPoints.length;
  const completedCount = bulletPoints.filter(
    (_, index) => Boolean(completedAreas[`bullet-${index}`])
  ).length;

  /* =========================================
     דיווח השלמת שלב
  ========================================= */

  useEffect(() => {
    if (
      totalAreas > 0 &&
      completedCount === totalAreas &&
      !completionSentRef.current
    ) {
      completionSentRef.current = true;
      onComplete?.();
    }
  }, [completedCount, totalAreas, onComplete]);

  return (
    <div
      className="whiteboard-container"
      dir="rtl"
      style={{
        '--marker-cursor': `url("${blueMarker}") 0 32, crosshair`,
      }}
    >
      {/* מסגרת פרופורציונלית השומרת שהלוח לעולם לא ייצא מגבולות המסך */}
      <div className="whiteboard-stage">
        <img
          src={whiteboardImg}
          alt=""
          className="whiteboard-bg-image"
          draggable={false}
          aria-hidden="true"
        />

        {/* אזור התוכן ממוקם בדיוק בתוך המשטח הלבן של הלוח */}
        <main className="whiteboard-content">
          {/* כותרת ותת כותרת */}
          <header className="whiteboard-heading">
            <h2>{title}</h2>

            {subtitle && (
              <div className="whiteboard-subtitle">
                <p>{subtitle}</p>
                <img src={blueMarker} alt="" aria-hidden="true" />
              </div>
            )}
          </header>

          {/* שלוש הקוביות לחשיפה */}
          <section className="bullets-section" aria-label="דגשים">
            {bulletPoints.map((point, index) => {
              const areaId = `bullet-${index}`;

              return (
                <div className="bullet-row" key={areaId}>
                  <span className="bullet-number">{index + 1}</span>

                  <RevealArea
                    className="bullet-box"
                    resetKey={whiteboardData}
                    initialCompleted={Boolean(
                      isCompleted || completedAreas[areaId]
                    )}
                    onComplete={() => handleAreaComplete(areaId)}
                  >
                    <p className="bullet-text">{point}</p>
                  </RevealArea>
                </div>
              );
            })}
          </section>

          {/* הערת סיום - חשופה מההתחלה ללא אפקט טוש וללא קו מקדים */}
          {footerNote.trim() && (
            <footer className="footer-section">
              <p className="footer-text">{footerNote}</p>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
};

export default WriteboardScreen;