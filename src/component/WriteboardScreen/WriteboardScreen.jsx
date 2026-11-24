import React, { useEffect, useRef, useState } from 'react';
import './WriteboardScreen.css';

import blueMarker from '../../assets/blue_marker.png';

/* =========================================
   REVEAL AREA
   אזור חשיפה באמצעות תנועת הטוש
========================================= */

const RevealArea = ({
  children,
  className = '',
  onComplete,
  resetKey,
  showGuideLine = false,
  initialCompleted = false,
}) => {
  const areaRef = useRef(null);
  const canvasRef = useRef(null);
  const previousPoint = useRef(null);
  const completedRef = useRef(Boolean(initialCompleted));

  const [maskUrl, setMaskUrl] = useState('');
  const [isComplete, setIsComplete] = useState(Boolean(initialCompleted));
  const [hasStarted, setHasStarted] = useState(Boolean(initialCompleted));
  const [guideStyle, setGuideStyle] = useState({});

  /* =========================================
     סנכרון מצב שמור מהמערכת
  ========================================= */

  useEffect(() => {
    if (initialCompleted) {
      completedRef.current = true;
      setIsComplete(true);
      setHasStarted(true);
    }
  }, [initialCompleted]);

  /* =========================================
     מדידת הטקסט ומיקום הקו המקדים
  ========================================= */

  useEffect(() => {
    if (!showGuideLine) return;

    const area = areaRef.current;
    if (!area) return;

    const textElement = area.querySelector('.footer-text-content');
    if (!textElement) return;

    const updateGuideLine = () => {
      const areaRect = area.getBoundingClientRect();
      const textRect = textElement.getBoundingClientRect();

      if (!areaRect.width || !textRect.width) return;

      const fontSize = parseFloat(
        window.getComputedStyle(textElement).fontSize
      );

      // רווח קטן בין הטקסט לבין הקו
      const lineGap = fontSize * 0.18;

      setGuideStyle({
        width: `${textRect.width}px`,
        left: `${textRect.left - areaRect.left}px`,
        top: `${textRect.bottom - areaRect.top + lineGap}px`,
      });
    };

    updateGuideLine();

    const observer = new ResizeObserver(updateGuideLine);

    observer.observe(area);
    observer.observe(textElement);

    return () => observer.disconnect();
  }, [showGuideLine, resetKey]);

  /* =========================================
     יצירת מסכת החשיפה
  ========================================= */

  useEffect(() => {
    if (initialCompleted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const initializeCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);

      const ctx = canvas.getContext('2d');

      // שחור = מוסתר
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setMaskUrl(canvas.toDataURL());
    };

    initializeCanvas();

    const observer = new ResizeObserver(initializeCanvas);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [resetKey, initialCompleted]);

  /* =========================================
     איפוס בעת החלפת נתוני השלב
  ========================================= */

  useEffect(() => {
    completedRef.current = Boolean(initialCompleted);
    previousPoint.current = null;

    setIsComplete(Boolean(initialCompleted));
    setHasStarted(Boolean(initialCompleted));
    setMaskUrl('');
  }, [resetKey, initialCompleted]);

  /* =========================================
     חשיפה באמצעות הטוש
  ========================================= */

  const handlePointerMove = (event) => {
    if (completedRef.current || event.pointerType === 'touch') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // ברגע שמתחילים לחשוף, הקו המקדים נעלם
    if (showGuideLine) {
      setHasStarted(true);
    }

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const brushRadius = Math.min(
      50,
      Math.max(25, rect.height * 0.48)
    );

    ctx.beginPath();

    ctx.moveTo(
      previousPoint.current?.x ?? x,
      previousPoint.current?.y ?? y
    );

    ctx.lineTo(x, y);

    ctx.lineWidth = brushRadius * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#fff';

    ctx.stroke();

    previousPoint.current = { x, y };

    /* =====================================
       בדיקת אחוז השטח שנחשף
    ===================================== */

    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const pixels = imageData.data;

    let revealedPixels = 0;
    let totalPixels = 0;

    // דגימה של כל 4 פיקסלים
    for (let i = 0; i < pixels.length; i += 16) {
      totalPixels++;

      if (pixels[i] > 0) {
        revealedPixels++;
      }
    }

    const revealPercentage = revealedPixels / totalPixels;

    // מעל 75% חשיפה - השלמת האזור
    if (revealPercentage >= 0.75) {
      completedRef.current = true;

      setIsComplete(true);

      previousPoint.current = null;

      onComplete?.();

      return;
    }

    // עדכון מסכת החשיפה
    setMaskUrl(canvas.toDataURL());
  };

  return (
    <div
      ref={areaRef}
      className={`reveal-area ${className} ${
        isComplete ? 'reveal-complete' : ''
      }`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        previousPoint.current = null;
      }}
    >
      {/* תוכן החשיפה */}

      <div
        className={`reveal-content ${
          maskUrl || isComplete ? 'reveal-ready' : ''
        }`}
        style={{
          '--reveal-mask': maskUrl
            ? `url("${maskUrl}")`
            : 'none',
        }}
      >
        {children}
      </div>

      {/* הקו המקדים של הערת הסיום */}

      {showGuideLine && (
        <span
          className={`footer-guide-line ${
            hasStarted || isComplete ? 'guide-hidden' : ''
          }`}
          style={guideStyle}
          aria-hidden="true"
        />
      )}

      {/* שכבת הציור */}

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
  const completionSent = useRef(Boolean(isCompleted));

  /* =========================================
     סימון אזור שהושלם ושמירה ב-System
  ========================================= */

  const handleAreaComplete = (areaId) => {
    setCompletedAreas((prev) => {
      const next = {
        ...prev,
        [areaId]: true,
      };
      onSaveStepState?.({ completedAreas: next });
      return next;
    });
  };

  const totalAreas =
    bulletPoints.length + (footerNote.trim() ? 1 : 0);

  const completedCount = Object.values(completedAreas).filter(
    Boolean
  ).length;

  /* =========================================
     השלמת השלב
  ========================================= */

  useEffect(() => {
    if (
      totalAreas > 0 &&
      completedCount === totalAreas &&
      !completionSent.current
    ) {
      completionSent.current = true;
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
      <main className="whiteboard-content">

        {/* =================================
            כותרת ותת כותרת
        ================================= */}

        <header className="whiteboard-heading">
          <h2>{title}</h2>

          <div className="whiteboard-subtitle">
            <p>{subtitle}</p>
            <img src={blueMarker} alt="" />
          </div>
        </header>

        {/* =================================
            שלוש הקוביות
        ================================= */}

        <section className="bullets-section">
          {bulletPoints.map((point, index) => {
            const areaId = `bullet-${index}`;

            return (
              <div className="bullet-row" key={areaId}>
                <RevealArea
                  className="bullet-box"
                  resetKey={whiteboardData}
                  initialCompleted={Boolean(
                    isCompleted || completedAreas[areaId]
                  )}
                  onComplete={() => handleAreaComplete(areaId)}
                >
                  <p className="bullet-text">
                    {point}
                  </p>
                </RevealArea>

                <span className="bullet-number">
                  {index + 1}
                </span>
              </div>
            );
          })}
        </section>

        {/* =================================
            הערת סיום
        ================================= */}

        {footerNote.trim() && (
          <RevealArea
            className="footer-section"
            resetKey={whiteboardData}
            showGuideLine
            initialCompleted={Boolean(
              isCompleted || completedAreas.footer
            )}
            onComplete={() => handleAreaComplete('footer')}
          >
            <p className="footer-text">
              <span className="footer-text-content">
                {footerNote}
              </span>
            </p>
          </RevealArea>
        )}

      </main>
    </div>
  );
};

export default WriteboardScreen;