
import React, { useEffect, useRef } from 'react';
import './ParkingScreen.css';

import VehicleInfo from '../VehicleInfo/VehicleInfo';
import SpeechBubble from '../SpeechBubble/SpeechBubble';

import parkingLotBg from '../../assets/parking/parking_lot_bg.png';
import lockCornerBtn from '../../assets/parking/padlock.png';
import checkmarkIcon from '../../assets/checkmark.png';

const parkingAssets = import.meta.glob('../../assets/parking/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

const parkingImageMap = Object.fromEntries(
  Object.entries(parkingAssets).map(([path, url]) => [
    path.split('/').pop().toLowerCase(),
    url,
  ])
);

const getParkingImage = (name) => {
  if (!name) return null;

  return parkingImageMap[name.split('/').pop().toLowerCase()] || null;
};

export default function ParkingScreen({
  onComplete,
  onBackToLock,
  vehicles = [],
  parkingSpeechBubble,
  parkingState = {},
  onParkingStateChange,
}) {
  const screenRef = useRef(null);

  const activeVehicleId = parkingState.activeVehicleId || null;
  const completedVehicles = parkingState.completedVehicles || {};
  const vehicleProgressMap = parkingState.vehicleProgress || {};
  const highlightedVehicleId = parkingState.highlightedVehicleId || null;

  const activeVehicle =
    vehicles.find((vehicle) => vehicle.id === activeVehicleId) || null;

  // התאמת המתיחה האנכית של הרכבים למתיחה של הרקע.
  // מסך הייחוס: 1440x900.
  useEffect(() => {
    const updateScreenScale = () => {
      if (!screenRef.current) return;

      const widthScale = window.innerWidth / 1440;
      const heightScale = window.innerHeight / 900;

      const verticalStretch =
        widthScale > 0 ? heightScale / widthScale : 1;

      screenRef.current.style.setProperty(
        '--parking-vertical-stretch',
        verticalStretch
      );
    };

    updateScreenScale();

    window.addEventListener('resize', updateScreenScale);

    return () => {
      window.removeEventListener('resize', updateScreenScale);
    };
  }, []);

  // בחירת רכב אקראי אחד בלבד להבהוב.
  // הבחירה נשמרת ב-parkingState.
  useEffect(() => {
    if (!vehicles.length || !onParkingStateChange) return;

    const pendingVehicles = vehicles.filter(
      (vehicle) => !completedVehicles[vehicle.id]
    );

    const currentHighlightedVehicle = pendingVehicles.find(
      (vehicle) => vehicle.id === highlightedVehicleId
    );

    // אם הרכב הנוכחי עדיין לא הושלם, משאירים אותו נבחר.
    if (currentHighlightedVehicle) return;

    // אם כל הרכבים הושלמו, אין רכב מהבהב.
    if (!pendingVehicles.length) {
      if (highlightedVehicleId !== null) {
        onParkingStateChange((prev) => ({
          ...prev,
          highlightedVehicleId: null,
        }));
      }

      return;
    }

    // בחירה אקראית מתוך הרכבים שעדיין לא הושלמו.
    const randomIndex = Math.floor(
      Math.random() * pendingVehicles.length
    );

    const nextVehicle = pendingVehicles[randomIndex];

    onParkingStateChange((prev) => ({
      ...prev,
      highlightedVehicleId: nextVehicle.id,
    }));
  }, [
    vehicles,
    completedVehicles,
    highlightedVehicleId,
    onParkingStateChange,
  ]);

  const handleSelectVehicle = (vehicleId) => {
    onParkingStateChange?.((prev) => ({
      ...prev,
      activeVehicleId: vehicleId,
    }));
  };

  const handleCloseVehicle = () => {
    onParkingStateChange?.((prev) => ({
      ...prev,
      activeVehicleId: null,
    }));
  };

  const handleVehicleProgressChange = (vehicleId, updater) => {
    onParkingStateChange?.((prev) => {
      const currentProgress = prev.vehicleProgress?.[vehicleId] || {};

      const nextProgress =
        typeof updater === 'function'
          ? updater(currentProgress)
          : updater;

      return {
        ...prev,
        vehicleProgress: {
          ...(prev.vehicleProgress || {}),
          [vehicleId]: nextProgress,
        },
      };
    });
  };

  const handleFinishVehicle = (vehicleId) => {
    const updatedCompleted = {
      ...completedVehicles,
      [vehicleId]: true,
    };

    onParkingStateChange?.((prev) => ({
      ...prev,
      activeVehicleId: null,
      completedVehicles: {
        ...(prev.completedVehicles || {}),
        [vehicleId]: true,
      },
    }));

    const allDone =
      vehicles.length > 0 &&
      vehicles.every((vehicle) => Boolean(updatedCompleted[vehicle.id]));

    if (allDone) {
      onComplete?.();
    }
  };

  return (
    <div
      ref={screenRef}
      className="parking-lot-screen"
      dir="rtl"
    >
      {/* רקע מגרש החניה */}
      <img
        src={parkingLotBg}
        alt="מגרש חניה"
        className="parking-lot-bg"
      />

      {/* כפתור פתיחת המנעול מחדש */}
      <button
        type="button"
        className="parking-lock-corner-btn"
        onClick={onBackToLock}
        aria-label="חזרה להוראות המנעול"
      >
        <img src={lockCornerBtn} alt="מנעול" />
      </button>

      {/* בועת דיבור במגרש החניה */}
      {parkingSpeechBubble && !activeVehicle && (
        <SpeechBubble
          {...parkingSpeechBubble}
          zIndex={40}
        />
      )}

      {/* ארבעת הרכבים במגרש */}
      {vehicles.map((vehicle, index) => {
        const vehicleImg = getParkingImage(vehicle.image);
        const isDone = Boolean(completedVehicles[vehicle.id]);
        const isHighlighted =
          highlightedVehicleId === vehicle.id && !isDone;

        return (
          <button
            key={vehicle.id}
            type="button"
            className={[
              'parking-vehicle-btn',
              `vehicle-slot-${index + 1}`,
              isDone ? 'is-completed' : '',
              isHighlighted ? 'is-highlighted' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleSelectVehicle(vehicle.id)}
            aria-label={vehicle.name}
            aria-pressed={activeVehicleId === vehicle.id}
          >
            {vehicleImg && (
              <img
                src={vehicleImg}
                alt={vehicle.name}
                className="parking-vehicle-img"
              />
            )}

            {isDone && (
              <img
                src={checkmarkIcon}
                alt="הושלם"
                className="parking-vehicle-check"
              />
            )}
          </button>
        );
      })}

      {/* כרטיסיית מידע על הרכב הנבחר */}
      {activeVehicle && (
        <VehicleInfo
          vehicle={activeVehicle}
          vehicleProgress={
            vehicleProgressMap[activeVehicle.id] || {}
          }
          onVehicleProgressChange={(updater) =>
            handleVehicleProgressChange(activeVehicle.id, updater)
          }
          onCloseVehicle={handleCloseVehicle}
          onFinishVehicle={() =>
            handleFinishVehicle(activeVehicle.id)
          }
        />
      )}
    </div>
  );
}
