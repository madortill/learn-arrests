
import React, { useState } from 'react';
import './ParkingButton.css';

import Lock from '../Lock/Lock';

import parkingBg from '../../assets/parking_bg.png';
import padlock from '../../assets/padlock.png';

export default function ParkingButton({
  onComplete,
  isCompleted = false,
  completedVehicles = {},
  onCompletedVehiclesChange
}) {
  const [isLockOpen, setIsLockOpen] = useState(false);

  return (
    <div className="parking-container" dir="rtl">

      <img
        src={parkingBg}
        alt="מגרש החניה"
        className="parking-bg"
      />

      {!isLockOpen && (
        <button
          className="parking-padlock-btn"
          onClick={() => setIsLockOpen(true)}
          aria-label="כניסה למגרש החניה"
        >
          <img src={padlock} alt="" />
          <span>לחצו לפתיחת השער</span>
        </button>
      )}

      {isLockOpen && (
        <Lock
          onComplete={onComplete}
          onClose={() => setIsLockOpen(false)}
          isCompleted={isCompleted}
          completedVehicles={completedVehicles}
          onCompletedVehiclesChange={onCompletedVehiclesChange}
        />
      )}

    </div>
  );
}
