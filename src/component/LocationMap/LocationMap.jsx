
import React, { useState, useEffect } from 'react';

import ImportantPoints from '../ImportantPoints/ImportantPoints';
import arrowHintImg from '../../assets/click-arrow.png';

import './LocationMap.css';

export default function LocationMap({
  locations = [],
  generalImportantPoint,
  onComplete,
}) {
  const [visitedIds, setVisitedIds] = useState([]);
  const [hasClickedAny, setHasClickedAny] = useState(false);
  const [activePopupText, setActivePopupText] = useState(null);
  const [popupTitle, setPopupTitle] = useState('דגשים חשובים');
  const [isGeneralPopupOpen, setIsGeneralPopupOpen] = useState(false);
  const [hasShownGeneralPopup, setHasShownGeneralPopup] = useState(false);

  const initialArrowLoc =
    locations.find((loc) => !loc.importantPoint) || locations[0];

  const initialArrowId = initialArrowLoc?.id;

  const [pulsingId, setPulsingId] = useState(initialArrowId);

  const isAllVisited =
    locations.length > 0 &&
    visitedIds.length === locations.length;

  const triggerGeneralPopup = () => {
    setPopupTitle('דגשים חשובים');
    setActivePopupText(generalImportantPoint);
    setIsGeneralPopupOpen(true);
    setHasShownGeneralPopup(true);
  };

  const handleLocationClick = (loc) => {
    const isNew = !visitedIds.includes(loc.id);

    const newVisited = isNew
      ? [...visitedIds, loc.id]
      : visitedIds;

    if (isNew) {
      setVisitedIds(newVisited);
    }

    if (!hasClickedAny) {
      setHasClickedAny(true);
    }

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
    } else if (
      newVisited.length === locations.length &&
      generalImportantPoint &&
      !hasShownGeneralPopup
    ) {
      triggerGeneralPopup();
    }
  };

  const handleClosePopup = () => {
    setActivePopupText(null);

    if (isGeneralPopupOpen) {
      setIsGeneralPopupOpen(false);
    } else if (
      isAllVisited &&
      generalImportantPoint &&
      !hasShownGeneralPopup
    ) {
      setTimeout(() => {
        triggerGeneralPopup();
      }, 300);
    }
  };

  useEffect(() => {
    const isFullyComplete =
      isAllVisited &&
      !activePopupText &&
      (!generalImportantPoint || hasShownGeneralPopup);

    if (isFullyComplete && onComplete) {
      onComplete();
    }
  }, [
    isAllVisited,
    activePopupText,
    generalImportantPoint,
    hasShownGeneralPopup,
    onComplete,
  ]);

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
