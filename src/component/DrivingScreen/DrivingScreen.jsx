
import React, { useState, useRef, useEffect } from 'react';
import './DrivingScreen.css';

import roadBg from '../../assets/road_bg.png';
import drivingVideo from '../../assets/DrivingScreenVid.mp4';
import dashboardFrame from '../../assets/dashboard_frame.png';
import steeringWheel from '../../assets/steering_wheel.png';

import SpeechBubble from '../SpeechBubble/SpeechBubble';

export default function DrivingScreen({
  onComplete,
  weakPoints = { title: '', items: [] },
  emphasisPoints = { title: '', items: [] },
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const rotationRef = useRef(0);
  const completedRef = useRef(false);
  const videoRef = useRef(null);

  // האטת סרטון הכביש
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  // ==========================================
  // בניית רצף השלטים
  // ==========================================

  const drivingSequence = [
    {
      id: 'weakPoints-title',
      type: 'title',
      titleType: 'weak',
      text: weakPoints.title,
      dashboardText: 'נקודות\nתורפה',
    },

    ...weakPoints.items.map((item) => ({
      id: `weak-${item.id}`,
      type: 'signs',
      signs: [item.text],
      isEmphasis: false,
      dashboardText: 'נקודות\nתורפה',
    })),

    {
      id: 'emphasis-title',
      type: 'title',
      titleType: 'emphasis',
      text: emphasisPoints.title,
      dashboardText: 'דגשים\nבעת ליווי',
    },

    ...emphasisPoints.items.map((item) => ({
      id: `emphasis-${item.id}`,
      type: 'signs',
      signs: item.parts?.length ? item.parts : [item.text || ''],
      isEmphasis: true,
      dashboardText: 'דגשים\nבעת ליווי',
    })),

    {
      id: 'destination-title',
      type: 'title',
      titleType: 'destination',
      text: 'הגעה ליעד',
      dashboardText: 'הגעה\nליעד',
      isDestination: true,
    },
  ];

  const currentSign = drivingSequence[currentIndex];
  const destinationIndex = drivingSequence.length - 1;

  // ==========================================
  // מצבי נהיגה
  // ==========================================

  const isFirstSign = currentIndex === 0;
  const isLastSign = currentIndex === destinationIndex;

  const bubbleText = isFirstSign
    ? 'משוך את ההגה ימינה בשביל להמשיך'
    : isLastSign
      ? 'אם פספסת משהו, אתה יכול\n למשוך את ההגה שמאלה בשביל לחזור'
      : 'משוך את ההגה ימינה בשביל\nלהמשיך ושמאלה בשביל לחזור';

  // ==========================================
  // מעבר בין שלטים
  // ==========================================

  const handleNext = () => {
    if (isLastSign) return;

    const nextIndex = currentIndex + 1;

    setCurrentIndex(nextIndex);

    if (nextIndex === destinationIndex && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  };

  const handlePrev = () => {
    if (isFirstSign) return;

    setCurrentIndex((prev) => prev - 1);
  };

  // ==========================================
  // גרירת ההגה
  // ==========================================

  const handlePointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    rotationRef.current = 0;

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - startX.current;

    let rotation = deltaX * 0.55;

    if (isFirstSign) rotation = Math.max(0, rotation);
    if (isLastSign) rotation = Math.min(0, rotation);

    rotation = Math.max(-45, Math.min(45, rotation));

    rotationRef.current = rotation;
    setWheelRotation(rotation);
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;

    isDragging.current = false;

    const finalRotation = rotationRef.current;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (finalRotation > 20 && !isLastSign) {
      handleNext();
    } else if (finalRotation < -20 && !isFirstSign) {
      handlePrev();
    }

    rotationRef.current = 0;
    setWheelRotation(0);
  };

  // ==========================================
  // תצוגה
  // ==========================================

  return (
    <div className="driving-container">

      {/* סרטון הכביש */}
      <video
        ref={videoRef}
        className="driving-road-video"
        src={drivingVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* תמונת הרקע */}
      <img
        src={roadBg}
        alt=""
        className="road-background"
        draggable="false"
      />

      {/* אפקט זכוכית כהה */}
      <div className="road-glass-overlay" />

      {/* השלט הנוכחי בלבד */}
      {currentSign && (
        <div
          key={currentSign.id}
          className={`sign-container ${
            currentSign.type === 'title'
              ? `title-sign ${currentSign.titleType}-title-sign`
              : currentSign.isEmphasis
                ? 'content-sign emphasis-sign-container'
                : 'content-sign weak-sign-container'
          }`}
        >
          {currentSign.type === 'title' ? (
            <div className="blue-sign-content">
              <div className="sign-arrow">➜</div>

              <div className="sign-text">
                {currentSign.text}
              </div>
            </div>
          ) : (
            <div
              className={`green-sign-group ${
                currentSign.isEmphasis
                  ? 'emphasis-sign-group'
                  : 'weak-sign-group'
              }`}
            >
              {currentSign.signs.map((text, index) => (
                <div
                  className={`green-sign-content ${
                    currentSign.isEmphasis
                      ? `emphasis-green-sign emphasis-part-${index + 1}`
                      : 'weak-green-sign'
                  }`}
                  key={`${currentSign.id}-${index}`}
                >
                  <div className="sign-text">
                    {text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* מסגרת הדשבורד */}
      <img
        src={dashboardFrame}
        alt="פנים הרכב"
        className="dashboard-frame"
        draggable="false"
      />

      {/* צג הדשבורד */}
      <div className="dashboard-display">
        <span className="display-text">
          {currentSign?.dashboardText}
        </span>
      </div>

      {/* הגה */}
      <div
        className={`steering-wheel-wrapper ${
          isLastSign ? 'destination-reached' : ''
        }`}
      >
        <img
          src={steeringWheel}
          alt="הגה"
          className="steering-wheel"
          style={{
            transform: `rotate(${wheelRotation}deg)`,
            cursor: isDragging.current ? 'grabbing' : 'grab',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          draggable="false"
        />
      </div>

      {/* בועת דיבור */}
      <SpeechBubble
        text={bubbleText}
        typeAnimation={false}
        position={{
          top: '10%',
          right: '45%',
        }}
        tailTarget={{
          x: '-5%',
          y: '2%',
        }}
        zIndex={7}
      />

    </div>
  );
}
