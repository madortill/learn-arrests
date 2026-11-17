import React, { useState, useRef } from 'react';
import './DrivingScreen.css';

import roadBg from '../../assets/road_bg.png';
import drivingVideo from '../../assets/DrivingScreenVid.mp4';
import dashboardFrame from '../../assets/dashboard_frame.png';
import steeringWheel from '../../assets/steering_wheel.png';

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

  const drivingSequence = [
    {
      id: 'weakPoints-title',
      type: 'title',
      text: weakPoints.title,
      dashboardText: 'נקודות\nתורפה',
    },

    ...weakPoints.items.map((item) => ({
      id: `weak-${item.id}`,
      type: 'signs',
      signs: [item.text],
      dashboardText: 'נקודות\nתורפה',
    })),

    {
      id: 'emphasis-title',
      type: 'title',
      text: emphasisPoints.title,
      dashboardText: 'דגשים\nבעת ליווי',
    },

    ...emphasisPoints.items.map((item) => ({
      id: `emphasis-${item.id}`,
      type: 'signs',
      signs: item.parts?.length
        ? item.parts
        : [item.text || ''],
      dashboardText: 'דגשים\nבעת ליווי',
    })),

    // שלט סיום
    {
      id: 'destination-title',
      type: 'title',
      text: 'שלט הגעה ליעד',
      dashboardText: 'הגעה\nליעד',
      isDestination: true,
    },
  ];

  const currentSign = drivingSequence[currentIndex];
  const destinationIndex = drivingSequence.length - 1;

  const handleNext = () => {
    if (currentIndex < destinationIndex) {
      const nextIndex = currentIndex + 1;

      setCurrentIndex(nextIndex);

      // השלמת השלב ברגע ששלט ההגעה ליעד מופיע
      if (
        nextIndex === destinationIndex &&
        !completedRef.current
      ) {
        completedRef.current = true;
        onComplete?.();
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handlePointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    rotationRef.current = 0;

    e.currentTarget.setPointerCapture(e.pointerId);
  };

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
      <video
        className="driving-road-video"
        src={drivingVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      <img
        src={roadBg}
        alt=""
        className="road-background"
        draggable="false"
      />

      <div
        key={currentSign.id}
        className={`sign-container ${
          currentSign.type === 'title'
            ? 'title-sign'
            : 'content-sign'
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
          <div className="green-sign-group">
            {currentSign.signs.map((text, index) => (
              <div
                className="green-sign-content"
                key={`${currentSign.id}-${index}`}
              >
                <div className="sign-text">{text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <img
        src={dashboardFrame}
        alt="פנים הרכב"
        className="dashboard-frame"
        draggable="false"
      />

      <div className="dashboard-display">
        <span className="display-text">
          {currentSign.dashboardText}
        </span>
      </div>

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