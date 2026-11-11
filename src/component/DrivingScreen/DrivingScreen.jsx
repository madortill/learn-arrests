
import React, { useState, useRef } from 'react';
import './DrivingScreen.css';

import roadBg from '../../assets/road_bg.png';
import drivingVideo from '../../assets/DrivingScreenVid.mp4';
import dashboardFrame from '../../assets/dashboard_frame.png';
import steeringWheel from '../../assets/steering_wheel.png';

const drivingSequence = [
  // חלק 1 – דגשים בעת הליווי
  {
    id: 'h1_intro',
    type: 'blue',
    text: 'שלט פניה\nלדגשים בעת\nהליווי',
  },
  { id: 'h1_1', type: 'green', text: 'Lorem ipsum dolor sit amet consectetur. Praesent nulla.' },
  { id: 'h1_2', type: 'green', text: 'Lorem ipsum dolor sit amet consectetur. Praesent nulla. (2)' },
  { id: 'h1_3', type: 'green', text: 'Lorem ipsum dolor sit amet consectetur. Praesent nulla. (3)' },
  { id: 'h1_4', type: 'green', text: 'Lorem ipsum dolor sit amet consectetur. Praesent nulla. (4)' },
  { id: 'h1_5', type: 'green', text: 'Lorem ipsum dolor sit amet consectetur. Praesent nulla. (5)' },

  // חלק 2 – נקודות תורפה ברכב
  {
    id: 'h2_intro',
    type: 'blue',
    text: 'שלט פניה\nלנקודות\nתורפה ברכב',
  },
  { id: 'h2_1', type: 'green', text: 'Lorem ipsum dolor sit amet consectetur. Commodo elit orci...' },
  { id: 'h2_2', type: 'green', text: 'Lorem ipsum dolor sit amet consectetur. Commodo elit orci... (2)' },
  { id: 'h2_3', type: 'green', text: 'Lorem ipsum dolor sit amet consectetur. Commodo elit orci... (3)' },

  // חלק 3 – הגעה ליעד
  {
    id: 'h3_intro',
    type: 'blue',
    text: 'שלט הגעה\nליעד',
  },
];

export default function DrivingScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const rotationRef = useRef(0);
  const completedRef = useRef(false);

  const currentSign = drivingSequence[currentIndex];

  const dashboardText = currentSign.id.startsWith('h1')
    ? 'דגשים\nבעת ליווי'
    : currentSign.id.startsWith('h2')
      ? 'נקודות\nתורפה'
      : 'הגעה\nליעד';

  // מעבר לשלט הבא
  const handleNext = () => {
    if (currentIndex < drivingSequence.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (!completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  };

  // חזרה לשלט הקודם
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // תחילת סיבוב ההגה
  const handlePointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    rotationRef.current = 0;

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // תנועת ההגה
  const handlePointerMove = (e) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - startX.current;

    const rotation = Math.max(
      -45,
      Math.min(45, deltaX * 0.55)
    );

    rotationRef.current = rotation;
    setWheelRotation(rotation);
  };

  // סיום סיבוב ההגה
  const handlePointerUp = (e) => {
    if (!isDragging.current) return;

    isDragging.current = false;

    const finalRotation = rotationRef.current;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (finalRotation > 20) {
      handleNext();
    } else if (finalRotation < -20) {
      handlePrev();
    }

    rotationRef.current = 0;
    setWheelRotation(0);
  };

  return (
    <div className="driving-container">

      {/* =================================
          שכבה 1 – סרטון הכביש
      ================================= */}

      <video
        className="driving-road-video"
        src={drivingVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* =================================
          שכבה 2 – תמונת הרקע השקופה
          הכביש בסרטון נראה דרך האזור השקוף
      ================================= */}

      <img
        src={roadBg}
        alt=""
        className="road-background"
        draggable="false"
      />

      {/* =================================
          שכבה 3 – שלטים
      ================================= */}

      <div
        key={currentSign.id}
        className={`sign-container ${currentSign.type}-sign`}
      >

        {currentSign.type === 'blue' && (
          <div className="blue-sign-content">

            <div className="sign-arrow">
              &#10140;
            </div>

            <div className="sign-text">
              {currentSign.text}
            </div>

          </div>
        )}

        {currentSign.type === 'green' && (
          <div className="green-sign-content">

            <div className="sign-text">
              {currentSign.text}
            </div>

          </div>
        )}

      </div>

      {/* =================================
          שכבה 4 – מסגרת הדשבורד
      ================================= */}

      <img
        src={dashboardFrame}
        alt="פנים הרכב"
        className="dashboard-frame"
        draggable="false"
      />

      {/* =================================
          שכבה 5 – צג הדשבורד
      ================================= */}

      <div className="dashboard-display">
        <span className="display-text">
          {dashboardText}
        </span>
      </div>

      {/* =================================
          שכבה 6 – הגה
      ================================= */}

      <div className="steering-wheel-wrapper">

        <img
          src={steeringWheel}
          alt="הגה"
          className="steering-wheel"
          style={{
            transform: `rotate(${wheelRotation}deg)`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          draggable="false"
        />

      </div>

    </div>
  );
}
