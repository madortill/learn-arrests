
import React, { useState, useEffect } from 'react';
import './FlipCards.css';

import questionMarkIcon from '../../assets/question-mark.png';
import exclamationMarkIcon from '../../assets/exclamation-mark.png';
import level5CardImage from '../../assets/level5_card_image.png';

// זיכרון של מצב הקלפים לפי שלב
const flipCardsCache = {};

const FlipCards = ({
  content,
  cards,
  onComplete,
  currentStep,
  isCompleted = false,
}) => {

  // זיהוי ייחודי של השלב
  const stepKey = currentStep ?? JSON.stringify(cards);

  const savedState = flipCardsCache[stepKey];

  // שחזור מצב הקלפים
  const [flippedCards, setFlippedCards] = useState(
    () => savedState?.flipped || {}
  );

  const [viewedCards, setViewedCards] = useState(() => {
    if (savedState?.viewed) return savedState.viewed;

    // אם השלב כבר הושלם, כל הקלפים נחשבים כנצפו
    if (isCompleted && cards) {
      return Object.fromEntries(
        cards.map(card => [card.id, true])
      );
    }

    return {};
  });

  const [completed, setCompleted] = useState(
    () => isCompleted || savedState?.completed || false
  );

  // שמירת המצב בזיכרון בכל שינוי
  useEffect(() => {
    flipCardsCache[stepKey] = {
      flipped: flippedCards,
      viewed: viewedCards,
      completed,
    };
  }, [
    flippedCards,
    viewedCards,
    completed,
    stepKey,
  ]);

  // אם System מודיע שהשלב כבר הושלם
  useEffect(() => {
    if (isCompleted && cards) {
      setViewedCards(prev => {
        const updated = { ...prev };

        cards.forEach(card => {
          updated[card.id] = true;
        });

        return updated;
      });

      setCompleted(true);
    }
  }, [isCompleted, cards]);

  // הפיכת קלף
  const handleFlip = (id) => {
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

    // בדיקה האם כל הקלפים נצפו
    const allViewed = cards.every(
      card => updatedViewed[card.id]
    );

    if (allViewed && !completed) {
      setCompleted(true);

      // הודעה ל-System שהשלב הושלם
      onComplete?.();
    }
  };

  // זיהוי תמונות
  const resolveImage = (imageString) => {
    if (imageString === 'question') return questionMarkIcon;
    if (imageString === 'exclamation') return exclamationMarkIcon;
    if (imageString === 'level5_card_image.png') return level5CardImage;
  
    return imageString;
  };

  if (!cards || cards.length === 0) return null;

  // התאמת פריסת הקלפים לפי הכמות
  const layoutClass =
    cards.length === 1 ? 'layout-single' :
    cards.length === 2 ? 'layout-double' :
    cards.length === 3 ? 'layout-triple' :
    cards.length === 5 ? 'layout-quintuple' :
    'layout-grid';

  return (
    <div className="flip-cards-wrapper">

      {content && (
        <p className="flip-cards-instruction">
          {content}
        </p>
      )}

      <div className={`flip-cards-container ${layoutClass}`}>

        {cards.map((card) => (
          <div
            key={card.id}
            className={`flip-card ${
              flippedCards[card.id] ? 'flipped' : ''
            }`}
            onClick={() => handleFlip(card.id)}
          >

            <div className="flip-card-inner">

              {/* חזית הקלף */}
              <div className="flip-card-front">

                {card.frontImage && (
                  <img
                    src={resolveImage(card.frontImage)}
                    alt="front icon"
                    className="flip-card-icon"
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
                    alt="back icon"
                    className="flip-card-icon"
                  />
                )}

                {card.backText && (
                  <p>{card.backText}</p>
                )}

              </div>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
};

export default FlipCards;
