
import React, { useState, useRef, useEffect } from 'react';
import './DepositsScreen.css';

import filmRollTop from '../../assets/film_roll_top.png';
import textFrameBg from '../../assets/text_frame_bg.png';

import filmFrame1 from '../../assets/film_frame_1.png';
import filmFrame2 from '../../assets/film_frame_2.png';
import filmFrame3 from '../../assets/film_frame_3.png';
import filmFrame4 from '../../assets/film_frame_4.png';
import filmFrame5 from '../../assets/film_frame_5.png';
import filmFrame6 from '../../assets/film_frame_6.png';
import filmFrame7 from '../../assets/film_frame_7.png';

const filmFrames = [
  filmFrame7,
  filmFrame6,
  filmFrame5,
  filmFrame4,
  filmFrame3,
  filmFrame2,
  filmFrame1,
];

const stepTexts = [
  'סיום תהליך והעברת אחריות.',
  'נעילת כספת...',
  'חתימה על טפסים...',
  'אחסון מאובטח...',
  'בדיקת תקינות...',
  'רישום מדויק...',
  'קבלת פיקדונות...',
];

const TOTAL_STEPS = 7;
const DRAG_THRESHOLD = 45;

const DepositsScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(6);

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const dragStartY = useRef(0);
  const dragOffsetRef = useRef(0);
  const pointerIdRef = useRef(null);

  const currentStepRef = useRef(6);
  const finishedRef = useRef(false);

  const progress = TOTAL_STEPS - 1 - currentStep;

  // התחלת משיכה מכל נקודה באזור סרט הצילום
  const handlePointerDown = (e) => {
    if (finishedRef.current) return;

    if (e.pointerType === 'mouse' && e.button !== 0) {
      return;
    }

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

  // מעקב אחרי תנועת העכבר או האצבע
  const handlePointerMove = (e) => {
    if (
      pointerIdRef.current === null ||
      pointerIdRef.current !== e.pointerId ||
      finishedRef.current
    ) {
      return;
    }

    e.preventDefault();

    const distance = e.clientY - dragStartY.current;

    // רק משיכה כלפי מעלה
    const upwardDistance = Math.min(0, distance);

    dragOffsetRef.current = upwardDistance;

    setDragOffset(upwardDistance);
  };

  // סיום משיכה
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

    // משיכה קצרה מדי
    if (Math.abs(distance) < DRAG_THRESHOLD) {
      return;
    }

    advanceStep();
  };

  // ביטול משיכה
  const handlePointerCancel = () => {
    pointerIdRef.current = null;
    dragOffsetRef.current = 0;

    setIsDragging(false);
    setDragOffset(0);
  };

  // התקדמות לשלב הבא
  const advanceStep = () => {
    if (finishedRef.current) return;

    const step = currentStepRef.current;

    if (step > 0) {
      const nextStep = step - 1;

      currentStepRef.current = nextStep;

      setCurrentStep(nextStep);

      return;
    }

    // כל שבע המשיכות הושלמו
    finishedRef.current = true;

    setIsFinished(true);

    // מודיעים ל-System שהשלב הושלם
    // המסך נשאר פתוח!
    onComplete?.();
  };

  // תנועת הסרט כולו, כולל ראש הגליל
  const filmTransform = `translate3d(
    0,
    calc(-${progress * 22}vh + ${dragOffset}px),
    0
  )`;

  return (
    <div className="deposits-screen-overlay" dir="ltr">

      {/* סרט הצילום */}
      <div
        className={`film-area ${isDragging ? 'is-dragging' : ''} ${
          isFinished ? 'is-finished' : ''
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >

        {/* כל הסרט זז יחד */}
        <div
          className="film-track-position"
          style={{
            transform: filmTransform,
            transition: isDragging
              ? 'none'
              : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >

          <div className="film-assembly">

            {/* ראש הגליל */}
            <div className="film-roll-top">
              <img
                src={filmRollTop}
                alt="ראש גליל סרט הצילום"
                draggable="false"
              />
            </div>

            {/* שבעת הפריימים */}
            <div className="film-frames">

              {filmFrames.map((frame, index) => {
                const isCurrentFrame = index === progress;

                return (
                  <div
                    key={index}
                    className={`film-frame-wrapper ${
                      isCurrentFrame ? 'active-frame' : ''
                    }`}
                  >
                    <img
                      src={frame}
                      alt={`פריים ${index + 1}`}
                      draggable="false"
                      className={`film-frame-img ${
                        isCurrentFrame ? 'clear' : 'blurred'
                      }`}
                    />
                  </div>
                );
              })}

            </div>
          </div>
        </div>

        {/* הנחיית משיכה */}
        {!isFinished && (
          <div className="pull-hint">
            <span>משכו את סרט הצילום כלפי מעלה</span>
            <span className="pull-arrow">↑</span>
          </div>
        )}

        {/* הודעה לאחר השלמת המשיכות */}
        {isFinished && (
          <div className="pull-hint finished-hint">
            <span>השלמתם את תהליך הפיקדונות!</span>
          </div>
        )}

      </div>

      {/* אזור הטקסט */}
      <div className="text-area" dir="rtl">

        <div className="text-frame-container">

          <img
            src={textFrameBg}
            alt=""
            className="text-frame-bg"
            draggable="false"
          />

          <div className="text-content">

            <p
              key={currentStep}
              className="deposits-text"
            >
              {stepTexts[currentStep]}
            </p>

            <span className="step-indicator">
              {7 - currentStep} / 7
            </span>

          </div>
        </div>
      </div>

    </div>
  );
};

export default DepositsScreen;
