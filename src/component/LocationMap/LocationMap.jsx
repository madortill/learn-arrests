import React, { useState, useEffect, useMemo, useRef } from 'react';

import ImportantPoints from '../ImportantPoints/ImportantPoints';

import mapBgImg from '../../assets/LocationMap/map.jpg';
import pinUnvisitedIcon from '../../assets/LocationMap/pin-unvisited.svg';
import pinVisitedIcon from '../../assets/LocationMap/pin-visited.svg';
import sidebarPinIcon from '../../assets/LocationMap/sidebar-pin.svg';
import warningEmojiIcon from '../../assets/LocationMap/warning-emoji.svg';
import arrowHintImg from '../../assets/LocationMap/click-arrow.png';

import './LocationMap.css';

// יצירת מפתח ייחודי לכל כרטיסייה ברשימה (תומך גם ב-id משותף לכמה מקומות)
const getLocationKey = (loc, index) => `${loc.id}_${loc.mainName}_${index}`;

// קיבוץ מיקומים שחולקים את אותה נקודה על המפה (לפי x,y)
const getPinGroupKey = (loc) => `${loc.x}_${loc.y}`;

export default function LocationMap({
  locations = [],
  generalImportantPoint,
  onComplete,
  onNext,
  isCompleted = false,
  continueSignal = 0,
  savedStepState,
  onSaveStepState,
}) {
  // העשרת הרשימה במפתח ייחודי לכל פריט ובמפתח קבוצת מיקום
  const normalizedLocations = useMemo(() => {
    return locations.map((loc, index) => ({
      ...loc,
      uniqueKey: getLocationKey(loc, index),
      pinGroupKey: getPinGroupKey(loc),
    }));
  }, [locations]);

  // רשימת כל הנקודות שיש להן הודעת דגש חשוב אישית
  const locationsWithImportantPoint = useMemo(() => {
    return normalizedLocations.filter((loc) => Boolean(loc.importantPoint));
  }, [normalizedLocations]);

  // יצירת רשימת סיכות ייחודיות למפה (סיכה אחת לכל נקודת x,y)
  const mapPins = useMemo(() => {
    const groupsMap = new Map();

    normalizedLocations.forEach((loc) => {
      if (!groupsMap.has(loc.pinGroupKey)) {
        groupsMap.set(loc.pinGroupKey, {
          pinGroupKey: loc.pinGroupKey,
          x: loc.x,
          y: loc.y,
          items: [],
        });
      }
      groupsMap.get(loc.pinGroupKey).items.push(loc);
    });

    return Array.from(groupsMap.values());
  }, [normalizedLocations]);

  const initialVisitedKeys = useMemo(() => {
    if (
      Array.isArray(savedStepState?.visitedKeys) &&
      savedStepState.visitedKeys.length > 0
    ) {
      return savedStepState.visitedKeys;
    }
    if (isCompleted && normalizedLocations.length > 0) {
      return normalizedLocations.map((loc) => loc.uniqueKey);
    }
    return [];
  }, [isCompleted, normalizedLocations, savedStepState]);

  const initialConfirmedPopupKeys = useMemo(() => {
    if (
      Array.isArray(savedStepState?.confirmedPopupKeys) &&
      savedStepState.confirmedPopupKeys.length > 0
    ) {
      return savedStepState.confirmedPopupKeys;
    }
    if (isCompleted && locationsWithImportantPoint.length > 0) {
      return locationsWithImportantPoint.map((loc) => loc.uniqueKey);
    }
    return [];
  }, [isCompleted, locationsWithImportantPoint, savedStepState]);

  const [visitedKeys, setVisitedKeys] = useState(initialVisitedKeys);
  const [confirmedPopupKeys, setConfirmedPopupKeys] = useState(
    initialConfirmedPopupKeys
  );
  const [hasClickedAny, setHasClickedAny] = useState(() =>
    Boolean(
      isCompleted ||
        savedStepState?.hasClickedAny ||
        initialVisitedKeys.length > 0
    )
  );

  // תור של הודעות דגש חשוב לאישור (תומך גם במספר מקומות על אותה נקודה)
  const [popupQueue, setPopupQueue] = useState([]);
  const [isGeneralPopupOpen, setIsGeneralPopupOpen] = useState(false);

  const sidebarListRef = useRef(null);
  const prevVisitedCountRef = useRef(initialVisitedKeys.length);
  const completionNotifiedRef = useRef(Boolean(isCompleted));
  const lastContinueSignalRef = useRef(continueSignal);

  // התמונה של "לחץ על המיקום" תמיד על הסיכה הראשונה ברשימה
  const firstPinGroupKey = mapPins[0]?.pinGroupKey ?? null;

  const [pulsingPinKey, setPulsingPinKey] = useState(() => {
    if (isCompleted) return null;
    const nextPin = mapPins.find((pin) =>
      pin.items.some((item) => !initialVisitedKeys.includes(item.uniqueKey))
    );
    return nextPin ? nextPin.pinGroupKey : null;
  });

  // סנכרון התחלתי כאשר רשימת המיקומים נטענת
  useEffect(() => {
    if (!isCompleted && visitedKeys.length === 0) {
      setPulsingPinKey(firstPinGroupKey);
    }
  }, [firstPinGroupKey, isCompleted, visitedKeys.length]);

  const isAllVisited =
    normalizedLocations.length > 0 &&
    normalizedLocations.every((loc) => visitedKeys.includes(loc.uniqueKey));

  const isAllPopupsConfirmed = locationsWithImportantPoint.every((loc) =>
    confirmedPopupKeys.includes(loc.uniqueKey)
  );

  const isReadyToComplete =
    isAllVisited &&
    isAllPopupsConfirmed &&
    popupQueue.length === 0 &&
    !isGeneralPopupOpen;

  // תמיכה בחזרה לשלב שכבר הושלם (מבלי לדרוס את סדר הלחיצות הקיים)
  useEffect(() => {
    if (
      isCompleted &&
      normalizedLocations.length > 0 &&
      visitedKeys.length < normalizedLocations.length
    ) {
      setVisitedKeys(normalizedLocations.map((loc) => loc.uniqueKey));
      setConfirmedPopupKeys(
        locationsWithImportantPoint.map((loc) => loc.uniqueKey)
      );
      setHasClickedAny(true);
      setPulsingPinKey(null);
    }
  }, [
    isCompleted,
    normalizedLocations,
    locationsWithImportantPoint,
    visitedKeys.length,
  ]);

  // הקפצת דגש כללי בלחיצה על כפתור ההמשך הגלובלי בסיום (כמו בשלב 3)
  useEffect(() => {
    if (
      continueSignal > lastContinueSignalRef.current &&
      isReadyToComplete &&
      generalImportantPoint
    ) {
      lastContinueSignalRef.current = continueSignal;
      setIsGeneralPopupOpen(true);
    }
  }, [continueSignal, isReadyToComplete, generalImportantPoint]);

  // דיווח ל-System להציג את כפתור ההמשך הגלובלי רק אחרי מעבר על כל הנקודות ואישור כל הודעותיהן
  useEffect(() => {
    if (isReadyToComplete && !completionNotifiedRef.current) {
      completionNotifiedRef.current = true;
      onComplete?.();
    }
  }, [isReadyToComplete, onComplete]);

  // גלילה אוטומטית מטה בכל פעם שנוספים מקומות חדשים לרשימה
  useEffect(() => {
    const currentCount = visitedKeys.length;
    if (currentCount > prevVisitedCountRef.current && sidebarListRef.current) {
      const listEl = sidebarListRef.current;
      requestAnimationFrame(() => {
        listEl.scrollTo({
          top: listEl.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
    prevVisitedCountRef.current = currentCount;
  }, [visitedKeys]);

  // לחיצה על סיכה במפה (יכולה להכיל מקום אחד או כמה מקומות באותה נקודה)
  const handlePinClick = (pinGroup) => {
    const groupKeys = pinGroup.items.map((item) => item.uniqueKey);
    const newlyAddedKeys = groupKeys.filter((k) => !visitedKeys.includes(k));
    const nextVisitedKeys =
      newlyAddedKeys.length > 0
        ? [...visitedKeys, ...newlyAddedKeys]
        : visitedKeys;

    if (newlyAddedKeys.length > 0) {
      setVisitedKeys(nextVisitedKeys);
    }

    setHasClickedAny(true);
    onSaveStepState?.({
      visitedKeys: nextVisitedKeys,
      confirmedPopupKeys,
      hasClickedAny: true,
    });

    // העברת הפעימה לסיכה הבאה שעדיין לא נלחצה במלואה
    const nextUnvisitedPin = mapPins.find((pin) =>
      pin.items.some((item) => !nextVisitedKeys.includes(item.uniqueKey))
    );

    setPulsingPinKey(nextUnvisitedPin ? nextUnvisitedPin.pinGroupKey : null);

    // פתיחת חלוניות דגש חשוב עבור כל המקומות בנקודה שיש להם הודעה
    const itemsWithImportantPoint = pinGroup.items.filter((item) =>
      Boolean(item.importantPoint)
    );
    if (itemsWithImportantPoint.length > 0) {
      setIsGeneralPopupOpen(false);
      setPopupQueue(
        itemsWithImportantPoint.map((item) => ({
          uniqueKey: item.uniqueKey,
          text: item.importantPoint,
        }))
      );
    }
  };

  // לחיצה על כרטיסייה קיימת ברשימה שבצד
  const handleSidebarItemClick = (loc) => {
    if (loc.importantPoint) {
      setIsGeneralPopupOpen(false);
      setPopupQueue([
        {
          uniqueKey: loc.uniqueKey,
          text: loc.importantPoint,
        },
      ]);
    }
  };

  // אישור וסגירת חלונית הודעה
  const handleClosePopup = () => {
    if (isGeneralPopupOpen) {
      setIsGeneralPopupOpen(false);
      onNext?.();
      return;
    }

    const currentPopup = popupQueue[0];
    if (currentPopup) {
      const nextConfirmedKeys = confirmedPopupKeys.includes(
        currentPopup.uniqueKey
      )
        ? confirmedPopupKeys
        : [...confirmedPopupKeys, currentPopup.uniqueKey];

      setConfirmedPopupKeys(nextConfirmedKeys);
      setPopupQueue((prev) => prev.slice(1));

      onSaveStepState?.({
        visitedKeys,
        confirmedPopupKeys: nextConfirmedKeys,
        hasClickedAny: true,
      });
    }
  };

  const activePopupText = isGeneralPopupOpen
    ? generalImportantPoint
    : popupQueue[0]?.text ?? null;

  return (
    <div className="location-map-container">
      {/* סרגל המיקומים בצד ימין */}
      <aside className="map-sidebar-side">
        <div className="sidebar-header">
          <h3>מיקום מעצרים</h3>
          <div className="sidebar-header-divider" />
        </div>

        <div className="sidebar-list" ref={sidebarListRef}>
          {visitedKeys.map((visitedKey) => {
            const loc = normalizedLocations.find(
              (item) => item.uniqueKey === visitedKey
            );

            if (!loc) return null;

            const hasImportantPoint = Boolean(loc.importantPoint);

            return (
              <div
                key={loc.uniqueKey}
                className={`sidebar-item visited ${
                  hasImportantPoint ? 'has-warning' : ''
                }`}
                onClick={() => handleSidebarItemClick(loc)}
                role={hasImportantPoint ? 'button' : undefined}
                tabIndex={hasImportantPoint ? 0 : undefined}
                onKeyDown={(e) => {
                  if (
                    hasImportantPoint &&
                    (e.key === 'Enter' || e.key === ' ')
                  ) {
                    handleSidebarItemClick(loc);
                  }
                }}
              >
                <div className="item-text">
                  <div className="item-title-row">
                    <strong>{loc.mainName}</strong>
                  </div>
                  <small>{loc.subName}</small>
                </div>

                <div className="item-icon-left">
                  <img
                    src={hasImportantPoint ? warningEmojiIcon : sidebarPinIcon}
                    alt={hasImportantPoint ? 'דגש חשוב' : ''}
                    className="sidebar-pin-img"
                    draggable="false"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* אזור המפה משמאל לסרגל */}
      <div className="map-viewport-side">
        <div className="map-image-container">
          <img
            src={mapBgImg}
            alt="מפת מיקומי מעצרים"
            className="map-background-image"
            draggable="false"
          />

          {mapPins.map((pinGroup) => {
            const isVisited = pinGroup.items.every((item) =>
              visitedKeys.includes(item.uniqueKey)
            );
            const isPulsing = pinGroup.pinGroupKey === pulsingPinKey;
            const isFirstPin = pinGroup.pinGroupKey === firstPinGroupKey;
            const combinedLabel = pinGroup.items
              .map((item) => item.mainName)
              .join(' / ');

            return (
              <div
                key={pinGroup.pinGroupKey}
                className={`map-pin-marker ${
                  isVisited ? 'visited' : 'unvisited'
                }`}
                style={{
                  top: `${pinGroup.y}%`,
                  left: `${pinGroup.x}%`,
                }}
                onClick={() => handlePinClick(pinGroup)}
                role="button"
                tabIndex={0}
                aria-label={combinedLabel}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handlePinClick(pinGroup);
                  }
                }}
              >
                <img
                  src={isVisited ? pinVisitedIcon : pinUnvisitedIcon}
                  alt={combinedLabel}
                  className={`pin-icon ${isPulsing ? 'pulsing' : ''}`}
                  draggable="false"
                />

                {!hasClickedAny && isFirstPin && (
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

      {/* חלון דגשים חשובים */}
      {activePopupText && (
        <ImportantPoints
          title="דגשים חשובים"
          text={activePopupText}
          icon={warningEmojiIcon}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}