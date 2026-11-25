import React, { useState, useEffect } from 'react';
import './ParkingButton.css';

import Lock from '../Lock/Lock';
import ParkingScreen from '../ParkingScreen/ParkingScreen';

import padlock from '../../assets/parking/padlock.png';

export default function ParkingButton({
  onComplete,
  onInteractionStart,
  currentStep,
  hasInteracted = false,
  isCompleted = false,
  lockSlides = [],
  vehicles = [],
  parkingSpeechBubble,
  parkingState = {},
  onParkingStateChange,
}) {
  const [hasStarted, setHasStarted] = useState(
    hasInteracted || isCompleted
  );

  const isGateOpened = Boolean(
    parkingState.isGateOpened || isCompleted
  );

  const isLockModalOpen = Boolean(
    parkingState.isLockModalOpen
  );

  useEffect(() => {
    setHasStarted(hasInteracted || isCompleted);
  }, [currentStep]);

  useEffect(() => {
    if (hasInteracted || isCompleted) {
      setHasStarted(true);
    }
  }, [hasInteracted, isCompleted]);

  const triggerInteractionStart = () => {
    if (!hasStarted) {
      setHasStarted(true);
      onInteractionStart?.();
    }
  };

  const handleOpenInitialLock = () => {
    triggerInteractionStart();

    onParkingStateChange?.((prev) => ({
      ...prev,
      isLockModalOpen: true,
    }));
  };

  const handleOpenGate = () => {
    triggerInteractionStart();

    onParkingStateChange?.((prev) => ({
      ...prev,
      isGateOpened: true,
      hasUnlockedOnce: true,
      isLockModalOpen: false,
    }));
  };

  const handleCloseLockModal = () => {
    onParkingStateChange?.((prev) => ({
      ...prev,
      isLockModalOpen: false,
    }));
  };

  const handleReopenLockModal = () => {
    onParkingStateChange?.((prev) => ({
      ...prev,
      isLockModalOpen: true,
    }));
  };

  return (
    <div className="parking-container" dir="rtl">
      {!isGateOpened && !isLockModalOpen && (
        <button
          type="button"
          className="parking-padlock-btn"
          onClick={handleOpenInitialLock}
          aria-label="כניסה למגרש החניה"
        >
          <img src={padlock} alt="מנעול" />
        </button>
      )}

      {isGateOpened && (
        <ParkingScreen
          onComplete={onComplete}
          onBackToLock={handleReopenLockModal}
          vehicles={vehicles}
          parkingSpeechBubble={parkingSpeechBubble}
          parkingState={parkingState}
          onParkingStateChange={onParkingStateChange}
        />
      )}

      {isLockModalOpen && (
        <Lock
          slides={lockSlides}
          isCompleted={isCompleted}
          canClose={Boolean(
            parkingState.hasUnlockedOnce || isCompleted
          )}
          parkingState={parkingState}
          onParkingStateChange={onParkingStateChange}
          onOpenGate={handleOpenGate}
          onClose={handleCloseLockModal}
        />
      )}
    </div>
  );
}