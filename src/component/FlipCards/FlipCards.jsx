import React, { useState, useEffect } from 'react';
import './FlipCards.css';

import questionMarkIcon from '../../assets/question-mark.png';
import exclamationMarkIcon from '../../assets/exclamation-mark.png';
import level5CardImage from '../../assets/level5_card_image.png';

// אייקון עכבר צהוב (#F8B533) עם קווי לחיצה מונפשים
const YellowCursorHint = () => (
  <div className="flip-card-cursor-hint" aria-hidden="true">
    <svg
      viewBox="0 0 64 64"
      className="cursor-hint-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* קווי הלחיצה מסביב לחוד החץ */}
      <g
        className="cursor-click-rays"
        stroke="#F8B533"
        strokeWidth="3.6"
        strokeLinecap="round"
      >
        <line x1="18" y1="4" x2="18" y2="11" />
        <line x1="8" y1="8" x2="13" y2="13" />
        <line x1="4" y1="18" x2="11" y2="18" />
        <line x1="28" y1="8" x2="23" y2="13" />
        <line x1="8" y1="28" x2="13" y2="23" />
      </g>

      {/* גוף החץ */}
      <path
        d="M18.5 18.5 L49.5 31.2 C51.6 32.1 51.5 35.1 49.3 35.8 L37.8 39.4 L34.2 50.9 C33.5 53.1 30.5 53.2 29.6 51.1 L16.9 20.1 C16.3 18.8 17.2 17.9 18.5 18.5 Z"
        fill="#F8B533"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const FlipCards = ({
  content,
  cards,
  onComplete,
  isCompleted = false,
  savedStepState,
  onSaveStepState,
}) => {
  const [flippedCards, setFlippedCards] = useState(
    () => savedStepState?.flipped || {}
  );

  const [viewedCards, setViewedCards] = useState(() => {
    if (savedStepState?.viewed) return savedStepState.viewed;

    if (isCompleted && cards) {
      return Object.fromEntries(
        cards.map((card) => [card.id, true])
      );
    }

    return {};
  });

  const [completed, setCompleted] = useState(
    () => isCompleted || savedStepState?.completed || false
  );

  // האם המשתמש כבר לחץ על קלף כלשהו (להסתרת אנימציית הרמז)
  const [hasInteracted, setHasInteracted] = useState(() =>
    Boolean(
      isCompleted ||
      savedStepState?.completed ||
      Object.keys(savedStepState?.viewed || {}).length > 0
    )
  );

  // שמירת המצב ב-System
  useEffect(() => {
    onSaveStepState?.({
      flipped: flippedCards,
      viewed: viewedCards,
      completed,
    });
  }, [flippedCards, viewedCards, completed, onSaveStepState]);

  // סנכרון עם מצב השלמת השלב
  useEffect(() => {
    if (!isCompleted || !cards) return;

    setViewedCards((prev) => {
      const updated = { ...prev };
      cards.forEach((card) => {
        updated[card.id] = true;
      });
      return updated;
    });

    setCompleted(true);
    setHasInteracted(true);
  }, [isCompleted, cards]);

  // הפיכת קלף
  const handleFlip = (id) => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    const updatedFlipped = {
      ...flippedCards,
      [id]: !flippedCards[id],
    };

    const updatedViewed = {
      ...viewedCards,
      [id]: true,
    };

    setFlippedCards(updatedFlipped);
    setViewedCards(updatedViewed);

    const allViewed = cards.every(
      (card) => updatedViewed[card.id]
    );

    if (allViewed && !completed) {
      setCompleted(true);
      onComplete?.();
    }
  };

  // זיהוי מקור התמונה
  const resolveImage = (imageString) => {
    if (imageString === 'question') return questionMarkIcon;
    if (imageString === 'exclamation') return exclamationMarkIcon;
    if (imageString === 'level5_card_image.png') {
      return level5CardImage;
    }

    return imageString;
  };

  // זיהוי אייקון
  const isIcon = (imageString) => {
    return (
      imageString === 'question' ||
      imageString === 'exclamation'
    );
  };

  if (!cards || cards.length === 0) return null;

  // התאמת פריסה לכמות הקלפים
  const layoutClass =
    cards.length === 1 ? 'layout-single' :
    cards.length === 2 ? 'layout-double' :
    cards.length === 3 ? 'layout-triple' :
    cards.length === 5 ? 'layout-quintuple' :
    cards.length === 6 ? 'layout-six' :
    'layout-grid';

  return (
    <div className={`flip-cards-wrapper wrapper-${layoutClass}`}>
      {content && (
        <p className="flip-cards-instruction">
          {content}
        </p>
      )}

      <div className={`flip-cards-container ${layoutClass}`}>
        {cards.map((card, index) => {
          const showHint = index === 0 && !hasInteracted;

          return (
            <div
              key={card.id}
              className={`flip-card ${
                flippedCards[card.id] ? 'flipped' : ''
              }`}
              onClick={() => handleFlip(card.id)}
            >
              {/* שכבה נפרדת להטיית הרמז כדי לא להפריע לאנימציית ההיפוך */}
              <div
                className={`flip-card-hint-wrapper ${
                  showHint ? 'hint-active' : ''
                }`}
              >
                <div className="flip-card-inner">
                  {/* חזית הקלף */}
                  <div className="flip-card-front">
                    {card.frontImage && (
                      <img
                        src={resolveImage(card.frontImage)}
                        alt="front"
                        className={
                          isIcon(card.frontImage)
                            ? 'flip-card-icon'
                            : 'flip-card-image'
                        }
                      />
                    )}

                    {card.frontText && (
                      <p>{card.frontText}</p>
                    )}
                  </div>

                  {/* גב הקלף */}
                  <div className="flip-card-back">
                    {card.backImage && (
                      <img
                        src={resolveImage(card.backImage)}
                        alt="back"
                        className={
                          isIcon(card.backImage)
                            ? 'flip-card-icon'
                            : 'flip-card-image'
                        }
                      />
                    )}

                    {card.backText && (
                      <p>{card.backText}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* עכבר צהוב שמדגים לחיצה על הקלף הראשון */}
              {showHint && <YellowCursorHint />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlipCards;