import React, { useState, useEffect } from 'react';
import ImportantPoints from '../ImportantPoints/ImportantPoints';
import arrowHintImg from '../../assets/click-arrow.png';
import './LocationMap.css';

export default function LocationMap({ locations = [], generalImportantPoint, onComplete }) {
  const [visitedIds, setVisitedIds] = useState([]);
  const [hasClickedAny, setHasClickedAny] = useState(false);
  const [activePopupText, setActivePopupText] = useState(null);
  const [popupTitle, setPopupTitle] = useState("דגשים חשובים");
  const [isGeneralPopupOpen, setIsGeneralPopupOpen] = useState(false);
  const [hasShownGeneralPopup, setHasShownGeneralPopup] = useState(false);

  // מציאת נקודת החץ הראשונית - הנקודה הראשונה ללא importantPoint
  const initialArrowLoc = locations.find(l => !l.importantPoint) || locations[0];
  const initialArrowId = initialArrowLoc?.id;

  // הסטייט לנקודה הפועמת
  const [pulsingId, setPulsingId] = useState(initialArrowId);

  // האם סיימנו לבקר בכל הנקודות?
  const isAllVisited = locations.length > 0 && visitedIds.length === locations.length;

  // פונקציית לחיצה על נקודת מיקום
  const handleLocationClick = (loc) => {
    const isNew = !visitedIds.includes(loc.id);
    const newVisited = isNew ? [...visitedIds, loc.id] : visitedIds;

    if (isNew) {
      setVisitedIds(newVisited);
    }

    if (!hasClickedAny) {
      setHasClickedAny(true);
    }

    // העברת הפעימה לנקודה הבאה
    const remaining = locations.filter(l => !newVisited.includes(l.id));
    if (remaining.length > 0) {
      setPulsingId(remaining[0].id);
    } else {
      setPulsingId(null);
    }

    // הצגת דגש ספציפי של הנקודה (אם קיים)
    if (loc.importantPoint) {
      setPopupTitle("דגשים חשובים");
      setActivePopupText(loc.importantPoint);
      setIsGeneralPopupOpen(false);
    } 
    // אם זו הנקודה האחרונה וקיים דגש כללי שטרם הוצג - נציג אותו
    else if (newVisited.length === locations.length && generalImportantPoint && !hasShownGeneralPopup) {
      triggerGeneralPopup();
    }
  };

  // הצגת הדגש הכללי של השלב
  const triggerGeneralPopup = () => {
    setPopupTitle("דגשים חשובים");
    setActivePopupText(generalImportantPoint);
    setIsGeneralPopupOpen(true);
    setHasShownGeneralPopup(true);
  };

  // סגירת פופאפ הדגשים
  const handleClosePopup = () => {
    setActivePopupText(null);
    
    if (isGeneralPopupOpen) {
      setIsGeneralPopupOpen(false);
    }
    // במקרה שהיה פופאפ ספציפי בנקודה האחרונה, נציג מיד אחריו את הכללי
    else if (isAllVisited && generalImportantPoint && !hasShownGeneralPopup) {
      setTimeout(() => triggerGeneralPopup(), 300);
    }
  };

  // איתות ל-System: אם ביקרנו בכולם ואין פופאפים פעילים (או שהכללי כבר הוצג ונסגר)
  useEffect(() => {
    const isFullyComplete = isAllVisited && !activePopupText && (!generalImportantPoint || hasShownGeneralPopup);
    
    if (isFullyComplete && onComplete) {
      onComplete();
    }
  }, [isAllVisited, activePopupText, generalImportantPoint, hasShownGeneralPopup, onComplete]);

  return (
    <div className="location-map-container">
      
      {/* אזור המפה משמאל */}
      <div className="map-viewport-side">
        <div className="map-image-container">
          {locations.map((loc) => {
            const isVisited = visitedIds.includes(loc.id);
            const isPulsing = loc.id === pulsingId;
            const isInitialArrowLoc = loc.id === initialArrowId;

            return (
              <div 
                key={loc.id}
                className={`map-pin-marker ${isVisited ? 'visited' : 'unvisited'}`}
                style={{ top: `${loc.y}%`, left: `${loc.x}%` }}
                onClick={() => handleLocationClick(loc)}
              >
                <span className={`pin-icon ${isPulsing ? 'pulsing' : ''}`}>
                  {isVisited ? '🟢' : '🔴'}
                </span>
                
                {!hasClickedAny && isInitialArrowLoc && (
                  <div className="arrow-hint-wrapper">
                    <img src={arrowHintImg} alt="לחצו על נקודת המיקום" className="arrow-hint-img" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* רשימת המיקומים מימין */}
      <div className="map-sidebar-side">
        <div className="sidebar-header">
          <h3>מיקום מעצרים</h3>
        </div>

        <div className="sidebar-list">
          {visitedIds.map((visitedId) => {
            const loc = locations.find(l => l.id === visitedId);
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

      {/* מודאל דגשים חשובים */}
      {activePopupText && (
        <ImportantPoints 
          title={popupTitle}
          text={activePopupText} 
          onClose={handleClosePopup} 
        />
      )}

      {/* שים לב: הסרנו את כפתור ה-ContinueBtn לחלוטין! המערכת תדאג לו בחוץ */}
      
    </div>
  );
}