
import React, { useEffect, useRef, useState } from 'react';
import './ParkingScreen.css';

import VehicleInfo from '../VehicleInfo/VehicleInfo';

import vehicle1 from '../../assets/vehicle_1.png';
import vehicle2 from '../../assets/vehicle_2.png';
import vehicle3 from '../../assets/vehicle_3.png';
import vehicle4 from '../../assets/vehicle_4.png';

import checkmark from '../../assets/checkmark.png';
import padlockSmall from '../../assets/padlock_small_btn.png';

const vehiclesList = [
  {
    id: 'v1',
    name: 'סיטרואן מ"צ',
    image: vehicle1
  },
  {
    id: 'v2',
    name: 'מיצובישי מ"צ',
    image: vehicle2
  },
  {
    id: 'v3',
    name: 'קיה מ"צ',
    image: vehicle3
  },
  {
    id: 'v4',
    name: 'מיניבוס אזרחי',
    image: vehicle4
  }
];

export default function ParkingScreen({
  onComplete,
  onBackToLock,
  completedVehicles = {},
  onCompletedVehiclesChange
}) {
  const [activeVehicleId, setActiveVehicleId] = useState(null);

  const completionCalled = useRef(false);

  // הרכב הראשון שעדיין לא הושלם
  const nextTargetId = vehiclesList.find(
    vehicle => !completedVehicles[vehicle.id]
  )?.id;

  // בדיקה אם כל הרכבים הושלמו
  const allCompleted = vehiclesList.every(
    vehicle => Boolean(completedVehicles[vehicle.id])
  );

  const currentVehicle = vehiclesList.find(
    vehicle => vehicle.id === activeVehicleId
  );

  // פתיחת רכב
  const handleVehicleClick = (vehicleId) => {
    if (completedVehicles[vehicleId]) return;

    setActiveVehicleId(vehicleId);
  };

  // השלמת רכב
  const handleVehicleFinish = () => {
    if (!activeVehicleId) return;

    onCompletedVehiclesChange?.({
      ...completedVehicles,
      [activeVehicleId]: true
    });

    setActiveVehicleId(null);
  };

  // הודעה ל-System רק לאחר שכל ארבעת הרכבים הושלמו
  useEffect(() => {
    if (!allCompleted || completionCalled.current) return;

    completionCalled.current = true;
    onComplete?.();

  }, [allCompleted, onComplete]);

  return (
    <div className="parking-screen-container" dir="rtl">

      {/* כפתור חזרה לקרוסלת המנעול */}
      <button
        className="parking-back-lock-btn"
        onClick={onBackToLock}
      >
        <img src={padlockSmall} alt="" />
        <span>חזרה למנעול</span>
      </button>

      {/* ארבעת הרכבים */}
      <div className="vehicles-parking-row">

        {vehiclesList.map(vehicle => {
          const isDone = Boolean(
            completedVehicles[vehicle.id]
          );

          const isTarget = vehicle.id === nextTargetId;

          return (
            <button
              key={vehicle.id}
              type="button"
              className={[
                'vehicle-item',
                isDone ? 'done' : '',
                isTarget ? 'pulsing-target' : ''
              ].filter(Boolean).join(' ')}

              disabled={isDone}
              onClick={() => handleVehicleClick(vehicle.id)}

              aria-label={vehicle.name}
            >
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="vehicle-png-img"
              />

              {isDone && (
                <img
                  src={checkmark}
                  alt="הושלם"
                  className="vehicle-checkmark-badge"
                />
              )}

            </button>
          );
        })}

      </div>

      {/* קרוסלת המידע */}
      {activeVehicleId && currentVehicle && (
        <VehicleInfo
          key={activeVehicleId}
          vehicleName={currentVehicle.name}
          onFinishVehicle={handleVehicleFinish}
        />
      )}

    </div>
  );
}
