import React, { useEffect, useRef, useState, useCallback } from 'react';
import './ParkingScreen.css';

import VehicleInfo from '../VehicleInfo/VehicleInfo';
import SpeechBubble from '../SpeechBubble/SpeechBubble';

import parkingLotBg from '../../assets/parking/parking_lot_bg.jpg';
import lockCornerBtn from '../../assets/parking/padlock.png';

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
  const vehicleBtnRefs = useRef({});

  const [naturalWidths, setNaturalWidths] = useState({});
  const [vehicleMetrics, setVehicleMetrics] = useState({});

  const activeVehicleId = parkingState.activeVehicleId || null;
  const completedVehicles = parkingState.completedVehicles || {};
  const vehicleProgressMap = parkingState.vehicleProgress || {};
  const highlightedVehicleId = parkingState.highlightedVehicleId || null;

  const activeVehicle =
    vehicles.find((vehicle) => vehicle.id === activeVehicleId) || null;

  // חישוב מידות ומיקום מדויקים של כל רכב בשורה לצורך סנכרון מלא עם VehicleInfo
  const measureVehicles = useCallback(() => {
    const screenEl = screenRef.current;
    if (!screenEl) return;

    const screenRect = screenEl.getBoundingClientRect();
    const nextMetrics = {};

    vehicles.forEach((vehicle) => {
      const btnEl = vehicleBtnRefs.current[vehicle.id];
      if (!btnEl) return;

      const rect = btnEl.getBoundingClientRect();
      if (rect.width <= 0) return;

      nextMetrics[vehicle.id] = {
        width: rect.width,
        left: rect.left - screenRect.left,
        right: screenRect.right - rect.right,
        bottom: screenRect.bottom - rect.bottom,
      };
    });

    setVehicleMetrics(nextMetrics);
  }, [vehicles]);

  // מניעת מתיחה אנכית של הרכבים במסכים גבוהים/ארוכים
  useEffect(() => {
    const updateScreenScale = () => {
      if (!screenRef.current) return;

      const widthScale = window.innerWidth / 1440;
      const heightScale = window.innerHeight / 1024;
      const rawStretch = widthScale > 0 ? heightScale / widthScale : 1;

      const verticalStretch =
        rawStretch >= 1 ? 1 : Math.max(rawStretch, 0.92);

      screenRef.current.style.setProperty(
        '--parking-vertical-stretch',
        verticalStretch
      );

      measureVehicles();
    };

    updateScreenScale();
    window.addEventListener('resize', updateScreenScale);

    return () => {
      window.removeEventListener('resize', updateScreenScale);
    };
  }, [measureVehicles, naturalWidths]);

  // בחירת רכב אקראי אחד בלבד להבהוב מתוך הרכבים שטרם הושלמו
  useEffect(() => {
    if (!vehicles.length || !onParkingStateChange) return;

    const pendingVehicles = vehicles.filter(
      (vehicle) => !completedVehicles[vehicle.id]
    );

    const currentHighlightedVehicle = pendingVehicles.find(
      (vehicle) => vehicle.id === highlightedVehicleId
    );

    if (currentHighlightedVehicle) return;

    if (!pendingVehicles.length) {
      if (highlightedVehicleId !== null) {
        onParkingStateChange((prev) => ({
          ...prev,
          highlightedVehicleId: null,
        }));
      }

      return;
    }

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

  const handleImageLoad = (vehicleId, event) => {
    const imgNaturalWidth = event.currentTarget.naturalWidth;
    if (!imgNaturalWidth) return;

    setNaturalWidths((prev) => {
      if (prev[vehicleId] === imgNaturalWidth) return prev;
      return {
        ...prev,
        [vehicleId]: imgNaturalWidth,
      };
    });
  };

  const handleSelectVehicle = (vehicleId) => {
    measureVehicles();
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

      {/* כפתור פתיחת המנעול מחדש - בצד ימין אחרי כפתור Levels */}
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

      {/* שורת הרכבים ממורכזת למרכז ביחס למסך 1440x1024 */}
      <div className="parking-vehicles-row">
        {vehicles.map((vehicle, index) => {
          const vehicleImg = getParkingImage(vehicle.image);
          const isDone = Boolean(completedVehicles[vehicle.id]);
          const isHighlighted =
            !activeVehicle && highlightedVehicleId === vehicle.id && !isDone;
          const imgNaturalWidth = naturalWidths[vehicle.id];

          return (
            <button
              key={vehicle.id}
              ref={(el) => {
                vehicleBtnRefs.current[vehicle.id] = el;
              }}
              type="button"
              style={
                imgNaturalWidth
                  ? {
                      width: `calc(${imgNaturalWidth} / 1440 * 100vw)`,
                    }
                  : undefined
              }
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
                  onLoad={(e) => handleImageLoad(vehicle.id, e)}
                />
              )}

              {/* שכבת זוהר ירוק פנימי החתוכה לצורת הרכב */}
              {isDone && vehicleImg && (
                <span
                  className="parking-vehicle-glow-layer"
                  style={{
                    WebkitMaskImage: `url(${vehicleImg})`,
                    maskImage: `url(${vehicleImg})`,
                  }}
                  aria-hidden="true"
                />
              )}

              {/* סימון ווי ירוק זהה ל-QuizScreen במרכז הרכב */}
              <span className="parking-vehicle-check" aria-hidden="true">
                ✓
              </span>
            </button>
          );
        })}
      </div>

      {/* כרטיסיית מידע על הרכב הנבחר */}
      {activeVehicle && (
        <VehicleInfo
          vehicle={activeVehicle}
          vehicleMetrics={vehicleMetrics[activeVehicle.id] || null}
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