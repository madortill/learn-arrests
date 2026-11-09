
import React, { useState, useEffect } from 'react';

import ImportantPoints from '../ImportantPoints/ImportantPoints';
import arrowHintImg from '../../assets/click-arrow.png';

import './LocationMap.css';

export default function LocationMap({
  locations = [],
  generalImportantPoint,
  onComplete,
  onNext,
  isCompleted = false,
  continueSignal = 0,
}) {
  const [visitedIds, setVisitedIds] = useState([]);
  const [hasClickedAny, setHasClickedAny] = useState(false);

  const [activePopupText, setActivePopupText] = useState(null);
  const [popupTitle, setPopupTitle] = useState('דגשים חשובים');

  const [isGeneralPopupOpen, setIsGeneralPopupOpen] = useState(false);

  const initialArrowLoc =
    locations.find((loc) => !loc.importantPoint) || locations[0];

  const initialArrowId = initialArrowLoc?.id;

  const [pulsingId, setPulsingId] = useState(initialArrowId);

  // בדיקה האם כל הנקודות הושלמו
  const isAllVisited =
    locations.length > 0 &&
    locations.every((loc) => visitedIds.includes(loc.id));

  // שחזור הנקודות כאשר חוזרים לשלב שהושלם
  useEffect(() => {
    if (isCompleted && locations.length > 0) {
      setVisitedIds(locations.map((loc) => loc.id));
      setHasClickedAny(true);
      setPulsingId(null);
    }
  }, [isCompleted, locations]);

  // פתיחת ההערה הכללית רק בעקבות לחיצה על ההמשך הגלובלי
  useEffect(() => {
    if (
      continueSignal > 0 &&
      isAllVisited &&
      generalImportantPoint &&
      !isGeneralPopupOpen
    ) {
      setPopupTitle('דגשים חשובים');
      setActivePopupText(generalImportantPoint);
      setIsGeneralPopupOpen(true);
    }
  }, [
    continueSignal,
    isAllVisited,
    generalImportantPoint,
    isGeneralPopupOpen,
  ]);

  // עדכון System לאחר השלמת כל הנקודות
  useEffect(() => {
    if (isAllVisited && onComplete) {
      onComplete();
    }
  }, [isAllVisited, onComplete]);

  // פתיחת הערה אישית או סימון נקודה
  const handleLocationClick = (loc) => {
    const isNew = !visitedIds.includes(loc.id);

    const newVisited = isNew
      ? [...visitedIds, loc.id]
      : visitedIds;

    if (isNew) {
      setVisitedIds(newVisited);
    }

    setHasClickedAny(true);

    // מציאת הנקודה הבאה שעדיין לא ביקרו בה
    const remaining = locations.filter(
      (location) => !newVisited.includes(location.id)
    );

    if (remaining.length > 0) {
      setPulsingId(remaining[0].id);
    } else {
      setPulsingId(null);
    }

    // אם יש דגש אישי, פותחים אותו
    if (loc.importantPoint) {
      setPopupTitle('דגשים חשובים');
      setActivePopupText(loc.importantPoint);
      setIsGeneralPopupOpen(false);
    }
  };

  // סגירת פופאפ
  const handleClosePopup = () => {
    const wasGeneralPopup = isGeneralPopupOpen;

    setActivePopupText(null);
    setIsGeneralPopupOpen(false);

    // רק אישור ההערה הכללית מעביר לשלב הבא
    if (wasGeneralPopup) {
      onNext?.();
    }
  };

  return (
    <div className="location-map-container">

      {/* אזור המפה */}
      <div className="map-viewport-side">
        <div className="map-image-container">

          {locations.map((loc) => {
            const isVisited = visitedIds.includes(loc.id);
            const isPulsing = loc.id === pulsingId;
            const isInitialArrowLoc = loc.id === initialArrowId;

            return (
              <div
                key={loc.id}
                className={`map-pin-marker ${
                  isVisited ? 'visited' : 'unvisited'
                }`}
                style={{
                  top: `${loc.y}%`,
                  left: `${loc.x}%`,
                }}
                onClick={() => handleLocationClick(loc)}
              >
                <span
                  className={`pin-icon ${
                    isPulsing ? 'pulsing' : ''
                  }`}
                >
                  {isVisited ? '🟢' : '🔴'}
                </span>

                {!hasClickedAny && isInitialArrowLoc && (
                  <div className="arrow-hint-wrapper">
                    <img
                      src={arrowHintImg}
                      alt="לחצו על נקודת המיקום"
                      className="arrow-hint-img"
                    />
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>

      {/* רשימת המיקומים */}
      <div className="map-sidebar-side">

        <div className="sidebar-header">
          <h3>מיקום מעצרים</h3>
        </div>

        <div className="sidebar-list">

          {visitedIds.map((visitedId) => {
            const loc = locations.find(
              (location) => location.id === visitedId
            );

            if (!loc) return null;

            return (
              <div
                key={loc.id}
                className="sidebar-item visited"
                onClick={() => handleLocationClick(loc)}
              >
                <div className="item-icon">
                  <span className="yellow-icon">🟡</span>
                </div>

                <div className="item-text">
                  <strong>{loc.mainName}</strong>
                  <small>{loc.subName}</small>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* פופאפ דגשים */}
      {activePopupText && (
        <ImportantPoints
          title={popupTitle}
          text={activePopupText}
          onClose={handleClosePopup}
        />
      )}

    </div>
  );
}
