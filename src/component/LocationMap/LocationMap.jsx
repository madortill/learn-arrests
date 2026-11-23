import React, { useState, useEffect } from 'react';

import ImportantPoints from '../ImportantPoints/ImportantPoints';

import mapBgImg from '../../assets/LocationMap/map.jpg';
import pinUnvisitedIcon from '../../assets/LocationMap/pin-unvisited.svg';
import pinVisitedIcon from '../../assets/LocationMap/pin-visited.svg';
import sidebarPinIcon from '../../assets/LocationMap/sidebar-pin.svg';
import warningEmojiIcon from '../../assets/LocationMap/warning-emoji.svg';
import arrowHintImg from '../../assets/LocationMap/click-arrow.png';

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

  // פתיחת ההערה הכללית רק בעקבות לחיצה על כפתור ההמשך הגלובלי
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

  // עדכון מערכת הניווט לאחר השלמת כל הנקודות
  useEffect(() => {
    if (isAllVisited && onComplete) {
      onComplete();
    }
  }, [isAllVisited, onComplete]);

  // לחיצה על נקודה במפה או על כרטיס ברשימה
  const handleLocationClick = (loc) => {
    const isNew = !visitedIds.includes(loc.id);

    const newVisited = isNew ? [...visitedIds, loc.id] : visitedIds;

    if (isNew) {
      setVisitedIds(newVisited);
    }

    setHasClickedAny(true);

    const remaining = locations.filter(
      (location) => !newVisited.includes(location.id)
    );

    if (remaining.length > 0) {
      setPulsingId(remaining[0].id);
    } else {
      setPulsingId(null);
    }

    if (loc.importantPoint) {
      setPopupTitle('דגשים חשובים');
      setActivePopupText(loc.importantPoint);
      setIsGeneralPopupOpen(false);
    }
  };

  // סגירת פופאפ הדגשים
  const handleClosePopup = () => {
    const wasGeneralPopup = isGeneralPopupOpen;

    setActivePopupText(null);
    setIsGeneralPopupOpen(false);

    if (wasGeneralPopup) {
      onNext?.();
    }
  };

  return (
    <div className="location-map-container">
      {/* שכבת המפה על כל שטח הקומפוננטה */}
      <div className="map-viewport-side">
        <div className="map-image-container">
          <img
            src={mapBgImg}
            alt="מפת מיקומי מעצרים"
            className="map-background-image"
            draggable="false"
          />

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
                role="button"
                tabIndex={0}
                aria-label={loc.mainName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleLocationClick(loc);
                  }
                }}
              >
                <img
                  src={isVisited ? pinVisitedIcon : pinUnvisitedIcon}
                  alt={loc.mainName}
                  className={`pin-icon ${isPulsing ? 'pulsing' : ''}`}
                  draggable="false"
                />

                {!hasClickedAny && isInitialArrowLoc && (
                  <div className="arrow-hint-wrapper">
                    <img
                      src={arrowHintImg}
                      alt="לחצו על נקודת המיקום"
                      className="arrow-hint-img"
                      draggable="false"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* סרגל המיקומים הצף בצד ימין מעל המפה */}
      <aside className="map-sidebar-side">
        <div className="sidebar-header">
          <h3>מיקום מעצרים</h3>
          <div className="sidebar-header-divider" />
        </div>

        <div className="sidebar-list">
          {visitedIds.map((visitedId) => {
            const loc = locations.find(
              (location) => location.id === visitedId
            );

            if (!loc) return null;

            const hasImportantPoint = Boolean(loc.importantPoint);

            return (
              <div
                key={loc.id}
                className={`sidebar-item visited ${
                  hasImportantPoint ? 'has-warning' : ''
                }`}
                onClick={() => handleLocationClick(loc)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleLocationClick(loc);
                  }
                }}
              >
                {/* טקסט מיושר לימין + אייקון אזהרה ליד הכותרת אם יש importantPoint */}
                <div className="item-text">
                  <div className="item-title-row">
                    <strong>{loc.mainName}</strong>
                    {hasImportantPoint && (
                      <img
                        src={warningEmojiIcon}
                        alt="דגש חשוב"
                        className="item-warning-icon"
                        draggable="false"
                      />
                    )}
                  </div>
                  <small>{loc.subName}</small>
                </div>

                {/* אייקון sidebar-pin בצד שמאל */}
                <div className="item-icon-left">
                  <img
                    src={sidebarPinIcon}
                    alt=""
                    className="sidebar-pin-img"
                    draggable="false"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </aside>

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